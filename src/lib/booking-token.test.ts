import { describe, it, expect, beforeAll } from "vitest";
import { signBookingToken, validateBookingToken } from "./booking-token";

beforeAll(() => {
  process.env.BOOKING_TOKEN_SECRET = "test-secret-please-rotate-in-prod";
});

const bookingId = "00000000-0000-0000-0000-000000000123";

describe("booking-token", () => {
  it("token recién firmado es válido", () => {
    const token = signBookingToken(bookingId);
    expect(validateBookingToken(bookingId, token)).toEqual({ ok: true });
  });

  it("rechaza token vacío", () => {
    expect(validateBookingToken(bookingId, "")).toEqual({ ok: false, reason: "missing" });
    expect(validateBookingToken(bookingId, undefined)).toEqual({ ok: false, reason: "missing" });
  });

  it("rechaza token malformed", () => {
    expect(validateBookingToken(bookingId, "garbage")).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("rechaza signature inválida (tampering)", () => {
    const token = signBookingToken(bookingId);
    const [ts] = token.split(".");
    const tampered = `${ts}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    const result = validateBookingToken(bookingId, tampered);
    expect(result.ok).toBe(false);
  });

  it("rechaza token de otra booking (cross-id)", () => {
    const token = signBookingToken(bookingId);
    const otherId = "11111111-1111-1111-1111-111111111111";
    expect(validateBookingToken(otherId, token)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("rechaza token expirado (>30min)", () => {
    const oldNow = Date.now() - 31 * 60 * 1000;
    const token = signBookingToken(bookingId, oldNow);
    expect(validateBookingToken(bookingId, token)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("acepta token a 29 min", () => {
    const justBefore = Date.now() - 29 * 60 * 1000;
    const token = signBookingToken(bookingId, justBefore);
    expect(validateBookingToken(bookingId, token)).toEqual({ ok: true });
  });
});
