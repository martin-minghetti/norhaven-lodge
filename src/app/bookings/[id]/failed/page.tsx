import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBookingWithCabin } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export default async function FailedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBookingWithCabin(id);
  if (!data) notFound();

  const { booking, cabin } = data;

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pt-20 pb-32 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <X className="h-6 w-6" />
          </span>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Pago rechazado
          </p>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-[1.1] md:text-5xl">
          No pudimos procesar el pago
        </h1>

        <p className="mt-4 text-lg text-foreground/80">
          MercadoPago rechazó la transacción. Tu reserva en{" "}
          <strong>{cabin.name}</strong> no quedó confirmada. Las fechas siguen
          disponibles si querés intentar de nuevo.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Código de intento: <span className="font-mono">{booking.id}</span>
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href={`/cabanas/${cabin.slug}/reservar`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Intentar de nuevo
          </Link>
          <Link
            href={`/cabanas/${cabin.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Volver a la cabaña
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
