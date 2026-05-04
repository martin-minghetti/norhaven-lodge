import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  formatPriceARS,
  getCabinBySlug,
  getReviewsForCabin,
} from "@/lib/queries";

export const revalidate = 60;

export default async function CabinDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cabin = await getCabinBySlug(slug);
  if (!cabin) notFound();

  const reviews = await getReviewsForCabin(cabin.id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const [hero, ...gallery] = cabin.images;

  return (
    <>
      <SiteHeader />

      {/* Back link */}
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10">
        <Link
          href="/#cabanas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Todas las cabañas
        </Link>
      </div>

      {/* Hero + meta */}
      <section className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {cabin.location}
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">
            {cabin.name}
          </h1>
          <p className="mt-2 text-xl text-foreground/80">{cabin.tagline}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/75">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Hasta {cabin.capacity} huéspedes
          </span>
          {reviews.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-current" />
              {avgRating.toFixed(1)} · {reviews.length} reseñas
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            Patagonia, Argentina
          </span>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="relative h-[280px] overflow-hidden rounded-lg md:h-[560px]">
            <Image
              src={hero}
              alt={`${cabin.name} - vista principal`}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {gallery.slice(0, 4).map((src, i) => (
              <div
                key={src}
                className="relative h-[140px] overflow-hidden rounded-lg md:h-[272px]"
              >
                <Image
                  src={src}
                  alt={`${cabin.name} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body grid: descripcion + booking summary */}
      <section className="mx-auto mt-20 max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          {/* Left column */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              La cabaña
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              {cabin.tagline}
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-foreground/85">
              {cabin.description}
            </p>

            <div className="mt-16">
              <h3 className="font-serif text-2xl">Lo que incluye</h3>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cabin.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-3 text-foreground/85"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column - sticky booking card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border/60 bg-card p-8 shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl">
                  {formatPriceARS(cabin.pricePerNight)}
                </span>
                <span className="text-sm text-muted-foreground">/ noche</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Mínimo 2 noches · cancelación flexible
              </p>

              <div className="mt-6 space-y-3 rounded-lg border border-border/50 bg-secondary/30 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Llegada</span>
                  <span className="font-medium">Elegir</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-muted-foreground">Salida</span>
                  <span className="font-medium">Elegir</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-muted-foreground">Huéspedes</span>
                  <span className="font-medium">2</span>
                </div>
              </div>

              <Link
                href={`/cabanas/${cabin.slug}/reservar`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Continuar reserva
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-xs text-muted-foreground">
                No se cobra todavía. Pago seguro vía MercadoPago.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Reviews section */}
      {reviews.length > 0 && (
        <section className="mx-auto mt-32 max-w-7xl px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 fill-current text-foreground" />
            <h2 className="font-serif text-3xl md:text-4xl">
              {avgRating.toFixed(1)} · {reviews.length} reseñas
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {reviews.map((review) => (
              <figure
                key={review.id}
                className="rounded-lg border border-border/60 bg-card p-8"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? "fill-current text-foreground"
                          : "text-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 font-serif text-lg leading-relaxed text-foreground/90">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  — {review.authorName}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="h-32" />
      <SiteFooter />
    </>
  );
}
