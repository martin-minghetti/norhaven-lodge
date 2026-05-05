import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBookingWithCabin } from "@/lib/bookings";
import { formatPriceARS } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBookingWithCabin(id);
  if (!data) notFound();

  const { booking, cabin } = data;
  const nights = differenceInCalendarDays(
    parseISO(booking.checkOut),
    parseISO(booking.checkIn),
  );
  const isPaid = booking.status === "paid";
  const isPending = booking.status === "pending";

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pt-20 pb-32 lg:px-10">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isPaid
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground"
            }`}
          >
            {isPaid ? (
              <Check className="h-6 w-6" />
            ) : (
              <Clock className="h-6 w-6" />
            )}
          </span>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {isPaid
              ? "Reserva confirmada"
              : isPending
                ? "Pago en proceso"
                : "Estado de la reserva"}
          </p>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-[1.1] md:text-5xl">
          {isPaid
            ? `Listo, ${booking.guestName.split(" ")[0]}.`
            : isPending
              ? "Estamos confirmando tu pago"
              : "Tu reserva"}
        </h1>

        <p className="mt-4 text-lg text-foreground/80">
          {isPaid
            ? `Te enviamos los detalles a ${booking.guestEmail}. Te contactamos 48hs antes del check-in con la dirección.`
            : isPending
              ? "MercadoPago está procesando el pago. En cuanto se acredite te enviamos el email de confirmación."
              : "Estamos al tanto de tu reserva."}
        </p>

        <div className="mt-12 rounded-xl border border-border/60 bg-card p-8 shadow-sm">
          <h2 className="font-serif text-2xl">{cabin.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{cabin.location}</p>

          <dl className="mt-8 space-y-4 text-sm">
            <Row
              label="Llegada"
              value={format(parseISO(booking.checkIn), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            />
            <Row
              label="Salida"
              value={format(parseISO(booking.checkOut), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            />
            <Row label="Noches" value={String(nights)} />
            <Row label="Huéspedes" value={String(booking.guests)} />
            <Row label="A nombre de" value={booking.guestName} />
            <Row
              label="Total"
              value={formatPriceARS(booking.totalAmount)}
              bold
            />
          </dl>

          <p className="mt-8 text-xs text-muted-foreground">
            Código de reserva: <span className="font-mono">{booking.id}</span>
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
          <Link
            href="/#cabanas"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Ver más cabañas
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-3 last:border-none">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "font-serif text-lg" : "font-medium"}>{value}</dd>
    </div>
  );
}
