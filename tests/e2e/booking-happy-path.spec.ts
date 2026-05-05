import { test, expect, type Page } from "@playwright/test";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import postgres from "postgres";

loadEnv({ path: path.resolve(__dirname, "../../.env.local") });

const TEST_EMAIL_DOMAIN = "norhaven.test";
const TEST_EMAIL_PREFIX = "e2e-test+";

function makeTestEmail(): string {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@${TEST_EMAIL_DOMAIN}`;
}

async function pickCalendarDay(page: Page, date: Date) {
  const label = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  const cell = page.getByRole("button", { name: new RegExp(label, "i") }).first();
  await cell.scrollIntoViewIfNeeded();
  await cell.click();
}

test.describe("Norhaven booking happy path", () => {
  const guestEmail = makeTestEmail();
  let createdBookingId: string | null = null;

  test.afterAll(async () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.warn("DATABASE_URL not set; skipping cleanup");
      return;
    }
    const sql = postgres(url, { max: 1 });
    try {
      await sql`DELETE FROM bookings WHERE guest_email LIKE ${TEST_EMAIL_PREFIX + "%@" + TEST_EMAIL_DOMAIN}`;
    } finally {
      await sql.end();
    }
  });

  test("home → cabin → form → simulated checkout → confirmed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.locator('a[href="/cabanas/casa-lago"]').first().click();
    await expect(page).toHaveURL(/\/cabanas\/casa-lago$/);

    await page.locator('a[href="/cabanas/casa-lago/reservar"]').first().click();
    await expect(page).toHaveURL(/\/cabanas\/casa-lago\/reservar$/);

    const today = new Date();
    const checkIn = addDays(today, 21);
    const checkOut = addDays(checkIn, 5);

    await pickCalendarDay(page, checkIn);
    await pickCalendarDay(page, checkOut);

    const nightsRow = page.locator("aside").locator("div", { hasText: /^Noches/ }).first();
    await expect(nightsRow).toContainText("5");

    const guestsInput = page.locator("#guests");
    await guestsInput.fill("3");
    await page.locator("#guestName").fill("E2E Test User");
    await page.locator("#guestEmail").fill(guestEmail);
    await page.locator("#guestPhone").fill("+5492944123456");

    const submitBtn = page.getByRole("button", { name: /pagar reserva/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await page.waitForURL(/\/bookings\/[a-f0-9-]+\/simulated-checkout/, { timeout: 30_000 });
    const matchSim = page.url().match(/\/bookings\/([a-f0-9-]+)\//);
    if (matchSim) createdBookingId = matchSim[1];

    await expect(page.getByText(/Confirmá tu reserva/i)).toBeVisible();
    await expect(page.getByText(guestEmail).first()).toBeVisible();

    await page.getByRole("button", { name: /confirmar reserva/i }).click();

    await page.waitForURL(/\/bookings\/[a-f0-9-]+\/confirm/, { timeout: 30_000 });
    await expect(page.getByText(/reserva confirmada/i).first()).toBeVisible();

    expect(createdBookingId).not.toBeNull();
  });
});
