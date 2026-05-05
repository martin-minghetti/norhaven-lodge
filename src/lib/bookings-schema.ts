import { differenceInCalendarDays, parseISO } from "date-fns";
import { z } from "zod";

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
