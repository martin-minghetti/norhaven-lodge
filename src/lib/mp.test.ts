import { describe, it, expect, beforeAll } from "vitest";
import crypto from "node:crypto";

beforeAll(() => {
  process.env.MP_ACCESS_TOKEN = "TEST-fake-token-for-tests";
});

async function loadValidate() {
  const mod = await import("./mp");
  return mod.validateMpSignature;
}

const SECRET = "webhook-secret-for-tests";
const DATA_ID = "12345";
const REQ_ID = "req-abc";

function buildSig(ts: number, dataId = DATA_ID, reqId = REQ_ID, secret = SECRET) {
  const manifest = `id:${dataId};request-id:${reqId};ts:${ts};`;
  const v1 = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

describe("validateMpSignature", () => {
  it("acepta firma fresca y válida", async () => {
    const validate = await loadValidate();
    const ts = Math.floor(Date.now() / 1000);
    const result = validate({
      headers: { signature: buildSig(ts), requestId: REQ_ID },
      dataId: DATA_ID,
      secret: SECRET,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.dataId).toBe(DATA_ID);
  });

  it("rechaza firma con ts viejo (>5min)", async () => {
    const validate = await loadValidate();
    const oldTs = Math.floor(Date.now() / 1000) - 6 * 60;
    const result = validate({
      headers: { signature: buildSig(oldTs), requestId: REQ_ID },
      dataId: DATA_ID,
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("stale ts");
  });

  it("rechaza firma con ts futuro (>5min adelante)", async () => {
    const validate = await loadValidate();
    const futureTs = Math.floor(Date.now() / 1000) + 6 * 60;
    const result = validate({
      headers: { signature: buildSig(futureTs), requestId: REQ_ID },
      dataId: DATA_ID,
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("stale ts");
  });

  it("rechaza firma manipulada", async () => {
    const validate = await loadValidate();
    const ts = Math.floor(Date.now() / 1000);
    const manipulated = buildSig(ts, "OTHER_ID");
    const result = validate({
      headers: { signature: manipulated, requestId: REQ_ID },
      dataId: DATA_ID,
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
  });

  it("rechaza headers faltantes", async () => {
    const validate = await loadValidate();
    expect(
      validate({
        headers: { signature: null, requestId: REQ_ID },
        dataId: DATA_ID,
        secret: SECRET,
      }).ok,
    ).toBe(false);
    expect(
      validate({
        headers: { signature: "ts=1,v1=abc", requestId: null },
        dataId: DATA_ID,
        secret: SECRET,
      }).ok,
    ).toBe(false);
  });

  it("rechaza signature malformed", async () => {
    const validate = await loadValidate();
    const result = validate({
      headers: { signature: "garbage", requestId: REQ_ID },
      dataId: DATA_ID,
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
  });
});
