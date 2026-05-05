"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUpRight, Loader2 } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceARS } from "@/lib/format";
import {
  submitBookingAction,
  type BookingFormState,
} from "./actions";

type Cabin = {
  id: string;
  slug: string;
  name: string;
  pricePerNight: number;
  capacity: number;
};

const initialState: BookingFormState = { ok: true };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={disabled || pending}
      className="mt-2 w-full rounded-full text-base"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando pago seguro...
        </>
      ) : (
        <>
          Pagar reserva
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function BookingForm({ cabin }: { cabin: Cabin }) {
  const [state, formAction] = useActionState(submitBookingAction, initialState);
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);

  const checkInIso = range?.from ? format(range.from, "yyyy-MM-dd") : "";
  const checkOutIso = range?.to ? format(range.to, "yyyy-MM-dd") : "";

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return differenceInCalendarDays(range.to, range.from);
  }, [range]);

  const total = nights * cabin.pricePerNight;
  const canSubmit = nights >= 2 && guests >= 1 && guests <= cabin.capacity;

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <input type="hidden" name="cabinSlug" value={cabin.slug} />
      <input type="hidden" name="checkIn" value={checkInIso} />
      <input type="hidden" name="checkOut" value={checkOutIso} />

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-2xl">Elegí las fechas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mínimo 2 noches. Llegada desde las 15h, salida hasta 11h.
          </p>
          <div className="mt-6 rounded-xl border border-border/60 bg-card p-4 sm:p-6">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              locale={es}
              className="mx-auto"
            />
          </div>
          {state.fieldErrors?.checkIn && (
            <p className="mt-3 text-sm text-destructive">
              {state.fieldErrors.checkIn}
            </p>
          )}
          {state.fieldErrors?.checkOut && (
            <p className="mt-3 text-sm text-destructive">
              {state.fieldErrors.checkOut}
            </p>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="font-serif text-2xl">Tus datos</h2>

          <div className="grid gap-2">
            <Label htmlFor="guests">Huéspedes</Label>
            <Input
              id="guests"
              name="guests"
              type="number"
              min={1}
              max={cabin.capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Capacidad máxima: {cabin.capacity}
            </p>
            {state.fieldErrors?.guests && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.guests}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="guestName">Nombre completo</Label>
            <Input
              id="guestName"
              name="guestName"
              type="text"
              autoComplete="name"
              required
            />
            {state.fieldErrors?.guestName && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.guestName}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input
              id="guestEmail"
              name="guestEmail"
              type="email"
              autoComplete="email"
              required
            />
            {state.fieldErrors?.guestEmail && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.guestEmail}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="guestPhone">Teléfono (opcional)</Label>
            <Input
              id="guestPhone"
              name="guestPhone"
              type="tel"
              autoComplete="tel"
            />
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border/60 bg-card p-8 shadow-sm">
          <h3 className="font-serif text-xl">{cabin.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatPriceARS(cabin.pricePerNight)} / noche
          </p>

          <div className="mt-6 space-y-3 rounded-lg border border-border/50 bg-secondary/30 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Llegada</span>
              <span className="font-medium">
                {range?.from
                  ? format(range.from, "d MMM yyyy", { locale: es })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-muted-foreground">Salida</span>
              <span className="font-medium">
                {range?.to
                  ? format(range.to, "d MMM yyyy", { locale: es })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-muted-foreground">Noches</span>
              <span className="font-medium">{nights || "—"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-muted-foreground">Huéspedes</span>
              <span className="font-medium">{guests}</span>
            </div>
          </div>

          <div className="mt-6 flex items-baseline justify-between border-t border-border/60 pt-6">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-serif text-3xl">
              {total > 0 ? formatPriceARS(total) : "—"}
            </span>
          </div>

          {state.error && !state.fieldErrors && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <SubmitButton disabled={!canSubmit} />

          <p className="mt-4 text-xs text-muted-foreground">
            Vas a ser redirigido a MercadoPago para completar el pago.
          </p>
        </div>
      </aside>
    </form>
  );
}
