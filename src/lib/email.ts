import "server-only";
import { Resend } from "resend";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { formatPriceARS } from "@/lib/format";
import type { Booking, Cabin } from "@/lib/db/schema";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Norhaven <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendBookingConfirmation(
  booking: Booking,
  cabin: Cabin,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping email");
    return { ok: false, error: "Resend not configured" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const nights = differenceInCalendarDays(
    parseISO(booking.checkOut),
    parseISO(booking.checkIn),
  );

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: booking.guestEmail,
      subject: `Reserva confirmada · ${cabin.name}`,
      react: BookingConfirmationEmail({
        guestName: booking.guestName,
        cabinName: cabin.name,
        checkIn: format(parseISO(booking.checkIn), "EEEE d 'de' MMMM, yyyy", {
          locale: es,
        }),
        checkOut: format(parseISO(booking.checkOut), "EEEE d 'de' MMMM, yyyy", {
          locale: es,
        }),
        nights,
        guests: booking.guests,
        totalFormatted: formatPriceARS(booking.totalAmount),
        bookingId: booking.id,
        siteUrl,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, error: String(err) };
  }
}
