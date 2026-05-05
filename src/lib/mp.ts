import "server-only";
import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN is not set");
}

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 8000 },
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);

export type MpWebhookHeaders = {
  signature: string | null;
  requestId: string | null;
};

export type MpWebhookValidation =
  | { ok: true; dataId: string }
  | { ok: false; reason: string };

export function validateMpSignature({
  headers,
  dataId,
  secret,
}: {
  headers: MpWebhookHeaders;
  dataId: string | null;
  secret: string;
}): MpWebhookValidation {
  if (!headers.signature) return { ok: false, reason: "missing x-signature" };
  if (!headers.requestId) return { ok: false, reason: "missing x-request-id" };
  if (!dataId) return { ok: false, reason: "missing data.id" };

  const parts = headers.signature.split(",").map((p) => p.trim());
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tsPart || !v1Part) {
    return { ok: false, reason: "malformed x-signature" };
  }
  const ts = tsPart.slice(3);
  const v1 = v1Part.slice(3);

  const manifest = `id:${dataId};request-id:${headers.requestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const v1Buf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== v1Buf.length) {
    return { ok: false, reason: "signature length mismatch" };
  }
  if (!crypto.timingSafeEqual(expectedBuf, v1Buf)) {
    return { ok: false, reason: "invalid signature" };
  }
  return { ok: true, dataId };
}
