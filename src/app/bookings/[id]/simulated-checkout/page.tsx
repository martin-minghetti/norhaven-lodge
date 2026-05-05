import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Info, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getBookingWithCabin } from "@/lib/bookings";
import { formatPriceARS } from "@/lib/format";
import { simulatePaymentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SimulatedCheckoutPage({
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

  const approve = simulatePaymentAction.bind(null, booking.id, "approved");
  const reject = simulatePaymentAction.bind(null, booking.id, "rejected");

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pt-12 pb-32 lg:px-10">
        <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 p-5 text-sm">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="space-y-1">
              <p className="font-medium text-amber-900">
                Modo demo · no se procesa pago real
              </p>
              <p className="text-amber-800/90 leading-relaxed">
                Esta es una simulación del checkout. El backend integra
                MercadoPago Checkout Pro completo (ver código en GitHub),
                pero los pagos están simulados para que cualquiera pueda
                probar el flow sin tarjeta real ni cuenta de prueba MP.
                En producción se activa cambiando una variable de entorno.
              </p>
            </div>
          </div>
        </div>

        <h1 className="mt-10 font-serif text-4xl leading-[1.1] md:text-5xl">
          Confirmá tu reserva
        </h1>
        <p className="mt-3 text-lg text-foreground/80">
          Revisá los datos antes de continuar.
        </p>

        <div className="mt-10 rounded-xl border border-border/60 bg-card p-8 shadow-sm">
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
            <Row label="Email" value={booking.guestEmail} />
            <Row label="Total" value={formatPriceARS(booking.totalAmount)} bold />
          </dl>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
          <form action={approve}>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full text-base"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar reserva (demo)
            </Button>
          </form>
          <form action={reject}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full rounded-full text-base sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Simular rechazo
            </Button>
          </form>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Si confirmás, vas a recibir un email real de confirmación a{" "}
          <span className="font-medium text-foreground">{booking.guestEmail}</span>{" "}
          (vía Resend).
        </p>

        <Link
          href={`/cabanas/${cabin.slug}`}
          className="mt-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Volver a la cabaña
        </Link>
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
