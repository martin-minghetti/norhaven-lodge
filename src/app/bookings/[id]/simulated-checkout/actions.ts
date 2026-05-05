"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendBookingConfirmation } from "@/lib/email";

export async function simulatePaymentAction(
  bookingId: string,
  outcome: "approved" | "rejected",
) {
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, bookingId),
  });
  if (!booking) {
    redirect("/");
  }

  if (booking.status === "paid" || booking.status === "failed") {
    redirect(
      booking.status === "paid"
        ? `/bookings/${booking.id}/confirm`
        : `/bookings/${booking.id}/failed`,
    );
  }

  const newStatus = outcome === "approved" ? "paid" : "failed";
  const fakePaymentId = `SIM-${Date.now()}`;

  await db
    .update(schema.bookings)
    .set({ status: newStatus, mpPaymentId: fakePaymentId })
    .where(eq(schema.bookings.id, booking.id));

  if (newStatus === "paid") {
    const cabin = await db.query.cabins.findFirst({
      where: eq(schema.cabins.id, booking.cabinId),
    });
    if (cabin) {
      const updated = {
        ...booking,
        status: "paid" as const,
        mpPaymentId: fakePaymentId,
      };
      await sendBookingConfirmation(updated, cabin).catch((err) => {
        console.error("Simulated payment: email failed:", err);
      });
    }
  }

  redirect(
    newStatus === "paid"
      ? `/bookings/${booking.id}/confirm`
      : `/bookings/${booking.id}/failed`,
  );
}
