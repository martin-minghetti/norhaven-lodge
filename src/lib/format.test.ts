import { describe, it, expect } from "vitest";
import { formatPriceARS } from "./format";

describe("formatPriceARS", () => {
  it("formatea ARS sin decimales", () => {
    const result = formatPriceARS(120000);
    expect(result).toMatch(/120\.000/);
    expect(result).toMatch(/\$/);
  });

  it("redondea (no muestra decimales)", () => {
    const result = formatPriceARS(99999.99);
    expect(result).not.toMatch(/,99/);
    expect(result).toMatch(/100\.000|99\.999/);
  });

  it("maneja cero", () => {
    expect(formatPriceARS(0)).toMatch(/0/);
  });

  it("maneja millones con separador de miles", () => {
    const result = formatPriceARS(1500000);
    expect(result).toMatch(/1\.500\.000/);
  });
});
