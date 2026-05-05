"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  bookingInputSchema,
  createBookingAndPreference,
} from "@/lib/bookings";

export type BookingFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitBookingAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const raw = {
    cabinSlug: formData.get("cabinSlug"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guests: formData.get("guests"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    guestPhone: formData.get("guestPhone") || undefined,
  };

  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    const flatten = z.flattenError(parsed.error).fieldErrors;
    for (const [key, msgs] of Object.entries(flatten)) {
      if (msgs && msgs.length > 0) fieldErrors[key] = msgs[0];
    }
    return { ok: false, fieldErrors, error: "Revisá los datos del formulario" };
  }

  const result = await createBookingAndPreference(parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      fieldErrors: result.field ? { [result.field]: result.error } : undefined,
    };
  }

  redirect(result.initPoint);
}
