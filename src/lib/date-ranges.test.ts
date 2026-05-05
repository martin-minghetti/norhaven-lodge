import { describe, it, expect } from "vitest";
import { rangesOverlap } from "./date-ranges";

describe("rangesOverlap", () => {
  const base = { checkIn: "2026-06-10", checkOut: "2026-06-15" };

  it("rango idéntico = overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-10", checkOut: "2026-06-15" })).toBe(true);
  });

  it("nuevo rango contenido dentro = overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-11", checkOut: "2026-06-13" })).toBe(true);
  });

  it("nuevo rango contiene al existente = overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-08", checkOut: "2026-06-20" })).toBe(true);
  });

  it("solapa por izquierda = overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-08", checkOut: "2026-06-12" })).toBe(true);
  });

  it("solapa por derecha = overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-13", checkOut: "2026-06-18" })).toBe(true);
  });

  it("rango anterior sin tocar = no overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-01", checkOut: "2026-06-05" })).toBe(false);
  });

  it("rango posterior sin tocar = no overlap", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-20", checkOut: "2026-06-25" })).toBe(false);
  });

  it("checkOut existente == checkIn nuevo = overlap (semantica conservadora)", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-15", checkOut: "2026-06-18" })).toBe(true);
  });

  it("checkOut nuevo == checkIn existente = overlap (semantica conservadora)", () => {
    expect(rangesOverlap(base, { checkIn: "2026-06-05", checkOut: "2026-06-10" })).toBe(true);
  });

  it("simétrico: rangesOverlap(a,b) == rangesOverlap(b,a)", () => {
    const a = { checkIn: "2026-07-01", checkOut: "2026-07-10" };
    const b = { checkIn: "2026-07-05", checkOut: "2026-07-15" };
    expect(rangesOverlap(a, b)).toBe(rangesOverlap(b, a));
  });
});
