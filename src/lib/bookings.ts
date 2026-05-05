import "server-only";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { and, eq, gte, lte, ne, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { mpPreference } from "@/lib/mp";

export const bookingInputSchema = z
  .object({
    cabinSlug: z.string().min(1),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de llegada inválida"),
    checkOut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de salida inválida"),
    guests: z.coerce.number().int().min(1).max(20),
    guestName: z.string().min(2, "Ingresá tu nombre completo"),
    guestEmail: z.string().email("Email inválido"),
    guestPhone: z.string().min(6).optional().or(z.literal("")),
  })
  .refine((d) => parseISO(d.checkOut) > parseISO(d.checkIn), {
    message: "La salida tiene que ser posterior a la llegada",
    path: ["checkOut"],
  })
  .refine(
    (d) => differenceInCalendarDays(parseISO(d.checkOut), parseISO(d.checkIn)) >= 2,
    { message: "Mínimo 2 noches", path: ["checkOut"] },
  );

export type BookingInput = z.infer<typeof bookingInputSchema>;

export type CreateBookingResult =
  | { ok: true; bookingId: string; initPoint: string }
  | { ok: false; error: string; field?: string };

export async function checkAvailability(
  cabinId: string,
  checkIn: string,
  checkOut: string,
): Promise<{ available: true } | { available: false; reason: string }> {
  const overlapping = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.cabinId, cabinId),
        ne(schema.bookings.status, "failed"),
        ne(schema.bookings.status, "cancelled"),
        or(
          and(
            lte(schema.bookings.checkIn, checkIn),
            gte(schema.bookings.checkOut, checkIn),
          ),
          and(
            lte(schema.bookings.checkIn, checkOut),
            gte(schema.bookings.checkOut, checkOut),
          ),
          and(
            gte(schema.bookings.checkIn, checkIn),
            lte(schema.bookings.checkOut, checkOut),
          ),
        ),
      ),
    )
    .limit(1);

  if (overlapping.length > 0) {
    return { available: false, reason: "Esas fechas ya están reservadas" };
  }

  const blocked = await db
    .select({ date: schema.blockedDates.date })
    .from(schema.blockedDates)
    .where(
      and(
        eq(schema.blockedDates.cabinId, cabinId),
        gte(schema.blockedDates.date, checkIn),
        lte(schema.blockedDates.date, checkOut),
      ),
    )
    .limit(1);

  if (blocked.length > 0) {
    return { available: false, reason: "Hay fechas bloqueadas en ese rango" };
  }

  return { available: true };
}

export async function createBookingAndPreference(
  input: BookingInput,
): Promise<CreateBookingResult> {
  const cabin = await db.query.cabins.findFirst({
    where: eq(schema.cabins.slug, input.cabinSlug),
  });
  if (!cabin) return { ok: false, error: "Cabaña no encontrada" };

  if (input.guests > cabin.capacity) {
    return {
      ok: false,
      error: `Capacidad máxima: ${cabin.capacity} huéspedes`,
      field: "guests",
    };
  }

  const availability = await checkAvailability(
    cabin.id,
    input.checkIn,
    input.checkOut,
  );
  if (!availability.available) {
    return { ok: false, error: availability.reason, field: "checkIn" };
  }

  const nights = differenceInCalendarDays(
    parseISO(input.checkOut),
    parseISO(input.checkIn),
  );
  const totalAmount = nights * cabin.pricePerNight;

  const [booking] = await db
    .insert(schema.bookings)
    .values({
      cabinId: cabin.id,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone || null,
      totalAmount,
      status: "pending",
    })
    .returning({ id: schema.bookings.id });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isLocal = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

  try {
    const pref = await mpPreference.create({
      body: {
        items: [
          {
            id: cabin.slug,
            title: `${cabin.name} · ${nights} noche${nights > 1 ? "s" : ""}`,
            description: `${input.checkIn} → ${input.checkOut} · ${input.guests} huésped${input.guests > 1 ? "es" : ""}`,
            quantity: 1,
            unit_price: totalAmount,
            currency_id: "ARS",
            category_id: "tourism",
          },
        ],
        payer: {
          name: input.guestName,
          email: input.guestEmail,
        },
        external_reference: booking.id,
        back_urls: {
          success: `${siteUrl}/bookings/${booking.id}/confirm`,
          failure: `${siteUrl}/bookings/${booking.id}/failed`,
          pending: `${siteUrl}/bookings/${booking.id}/confirm`,
        },
        ...(isLocal ? {} : { auto_return: "approved" as const }),
        ...(isLocal ? {} : { notification_url: `${siteUrl}/api/webhooks/mp` }),
        statement_descriptor: "Norhaven Lodge",
      },
    });

    if (!pref.id || !pref.init_point) {
      throw new Error("MP no devolvió init_point");
    }

    await db
      .update(schema.bookings)
      .set({ mpPreferenceId: pref.id })
      .where(eq(schema.bookings.id, booking.id));

    return { ok: true, bookingId: booking.id, initPoint: pref.init_point };
  } catch (err) {
    await db
      .update(schema.bookings)
      .set({ status: "failed" })
      .where(eq(schema.bookings.id, booking.id));
    console.error("MP preference error:", err);
    return {
      ok: false,
      error: "No pudimos generar el pago. Intentá de nuevo.",
    };
  }
}

export async function getBookingWithCabin(bookingId: string) {
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, bookingId),
  });
  if (!booking) return null;
  const cabin = await db.query.cabins.findFirst({
    where: eq(schema.cabins.id, booking.cabinId),
  });
  if (!cabin) return null;
  return { booking, cabin };
}
