import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCabinBySlug } from "@/lib/queries";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cabin = await getCabinBySlug(slug);
  if (!cabin) notFound();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10">
        <Link
          href={`/cabanas/${cabin.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a {cabin.name}
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Reserva
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-[1.1] md:text-5xl">
          {cabin.name}
        </h1>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-6 pb-32 lg:px-10">
        <BookingForm
          cabin={{
            id: cabin.id,
            slug: cabin.slug,
            name: cabin.name,
            pricePerNight: cabin.pricePerNight,
            capacity: cabin.capacity,
          }}
        />
      </section>

      <SiteFooter />
    </>
  );
}
