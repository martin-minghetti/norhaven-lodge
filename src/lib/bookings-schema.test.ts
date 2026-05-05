import { describe, it, expect } from "vitest";
import { bookingInputSchema } from "./bookings-schema";

const valid = {
  cabinSlug: "casa-lago",
  checkIn: "2026-06-10",
  checkOut: "2026-06-15",
  guests: 2,
  guestName: "Martín Minghetti",
  guestEmail: "test@example.com",
  guestPhone: "",
};

describe("bookingInputSchema", () => {
  it("acepta input válido", () => {
    const result = bookingInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guestEmail: "no-es-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("guestEmail"))).toBe(true);
    }
  });

  it("rechaza checkOut anterior a checkIn", () => {
    const result = bookingInputSchema.safeParse({
      ...valid,
      checkIn: "2026-06-15",
      checkOut: "2026-06-10",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza checkOut igual a checkIn", () => {
    const result = bookingInputSchema.safeParse({
      ...valid,
      checkIn: "2026-06-10",
      checkOut: "2026-06-10",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza estadía menor a 2 noches", () => {
    const result = bookingInputSchema.safeParse({
      ...valid,
      checkIn: "2026-06-10",
      checkOut: "2026-06-11",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("Mínimo 2 noches"))).toBe(true);
    }
  });

  it("acepta exactamente 2 noches", () => {
    const result = bookingInputSchema.safeParse({
      ...valid,
      checkIn: "2026-06-10",
      checkOut: "2026-06-12",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza formato de fecha inválido", () => {
    const result = bookingInputSchema.safeParse({ ...valid, checkIn: "10/06/2026" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre demasiado corto", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guestName: "M" });
    expect(result.success).toBe(false);
  });

  it("coerce string a number en guests", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guests: "3" as unknown as number });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guests).toBe(3);
    }
  });

  it("rechaza guests = 0", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guests: 0 });
    expect(result.success).toBe(false);
  });

  it("rechaza guests > 20", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guests: 21 });
    expect(result.success).toBe(false);
  });

  it("acepta guestPhone vacío", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guestPhone: "" });
    expect(result.success).toBe(true);
  });

  it("acepta guestPhone con valor válido", () => {
    const result = bookingInputSchema.safeParse({ ...valid, guestPhone: "+5492944123456" });
    expect(result.success).toBe(true);
  });
});
