import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mpPayment, validateMpSignature } from "@/lib/mp";
import { sendBookingConfirmation } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MP_STATUS_TO_BOOKING: Record<string, "paid" | "failed" | "pending" | "cancelled"> = {
  approved: "paid",
  authorized: "paid",
  rejected: "failed",
  cancelled: "cancelled",
  refunded: "cancelled",
  charged_back: "cancelled",
  in_process: "pending",
  in_mediation: "pending",
  pending: "pending",
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.MP_WEBHOOK_SECRET;

  let body: { type?: string; data?: { id?: string | number } } = {};
  try {
    body = await req.json();
  } catch {
    // MP a veces manda body vacío en pings
  }

  const dataIdRaw =
    url.searchParams.get("data.id") ??
    (body?.data?.id != null ? String(body.data.id) : null);

  const type = url.searchParams.get("type") ?? body?.type ?? null;

  if (type !== "payment") {
    return NextResponse.json({ ignored: true, reason: `type=${type}` });
  }

  if (!secret) {
    console.error("MP_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const validation = validateMpSignature({
    headers: {
      signature: req.headers.get("x-signature"),
      requestId: req.headers.get("x-request-id"),
    },
    dataId: dataIdRaw,
    secret,
  });

  if (!validation.ok) {
    console.warn("MP webhook signature invalid:", validation.reason);
    return NextResponse.json({ error: validation.reason }, { status: 401 });
  }

  const paymentId = validation.dataId;

  let payment;
  try {
    payment = await mpPayment.get({ id: paymentId });
  } catch (err) {
    console.error("MP payment fetch failed:", err);
    return NextResponse.json({ error: "payment fetch failed" }, { status: 502 });
  }

  const externalRef = payment.external_reference;
  const mpStatus = payment.status ?? "pending";

  if (!externalRef) {
    return NextResponse.json({ ignored: true, reason: "no external_reference" });
  }

  const newStatus = MP_STATUS_TO_BOOKING[mpStatus] ?? "pending";

  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, externalRef),
  });

  if (!booking) {
    return NextResponse.json({ error: "booking not found" }, { status: 404 });
  }

  if (booking.status === newStatus && booking.mpPaymentId === String(paymentId)) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  await db
    .update(schema.bookings)
    .set({
      status: newStatus,
      mpPaymentId: String(paymentId),
    })
    .where(eq(schema.bookings.id, booking.id));

  if (newStatus === "paid" && booking.status !== "paid") {
    const cabin = await db.query.cabins.findFirst({
      where: eq(schema.cabins.id, booking.cabinId),
    });
    if (cabin) {
      const updatedBooking = { ...booking, status: "paid" as const, mpPaymentId: String(paymentId) };
      await sendBookingConfirmation(updatedBooking, cabin).catch((err) => {
        console.error("Email send failed (booking still paid):", err);
      });
    }
  }

  return NextResponse.json({ ok: true, status: newStatus });
}

export async function GET() {
  return NextResponse.json({ ok: true, ping: "mp-webhook" });
}
