import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSearch } from "@/components/hero-search";
import {
  formatPriceARS,
  getCabins,
  getRecentReviews,
} from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [cabins, reviews] = await Promise.all([
    getCabins(),
    getRecentReviews(6),
  ]);

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden">
        <Image
          src="/images/home/hero.jpg"
          alt="Cabaña roja sobre el lago al atardecer"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-20 lg:px-10 lg:pb-28">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/85">
            Patagonia · cabañas boutique
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] text-white md:text-7xl">
            El silencio del lago,
            <br />a 18 minutos del pueblo.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            Tres cabañas pensadas para descansar de verdad. Sin recepción, sin
            intermediarios, sin sorpresas.
          </p>
          <HeroSearch
            cabins={cabins.map((c) => ({
              slug: c.slug,
              name: c.name,
              tagline: c.tagline,
              capacity: c.capacity,
              pricePerNight: c.pricePerNight,
              imageUrl: c.images[0] ?? "/images/home/hero.jpg",
            }))}
          />
        </div>
      </section>

      {/* About strip */}
      <section className="border-b border-border/50 bg-background">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Norhaven · 2018
          </p>
          <p className="mt-6 font-serif text-3xl leading-relaxed text-foreground md:text-4xl">
            Tres cabañas en una hectárea de bosque nativo, sobre la costa de un
            lago glaciar. Diseñadas para volver a leer un libro de principio a
            fin.
          </p>
        </div>
      </section>

      {/* Cabin listing */}
      <section
        id="cabanas"
        className="border-b border-border/50 bg-secondary/30"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Las cabañas
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Tres ambientes, tres ritmos.
              </h2>
            </div>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {cabins.map((cabin) => (
              <article key={cabin.id} className="group">
                <Link href={`/cabanas/${cabin.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={cabin.images[0] ?? "/images/home/hero.jpg"}
                      alt={cabin.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl">{cabin.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {cabin.tagline}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-foreground/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {cabin.capacity} huéspedes
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      desde{" "}
                      <span className="font-medium text-foreground">
                        {formatPriceARS(cabin.pricePerNight)}
                      </span>{" "}
                      / noche
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Location section */}
      <section
        id="ubicacion"
        className="border-b border-border/50 bg-background"
      >
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg lg:aspect-auto">
            <Image
              src="/images/bosque/walking-path.jpg"
              alt="Sendero entre el bosque nativo"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Ubicación
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">
              En el bosque, sobre el lago.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/85">
              Veinte minutos del centro de la ciudad, mil metros de costa
              privada de lago, dos kilómetros de senderos propios. Hay
              conectividad cuando la querés y silencio cuando no.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">
                  Hasta el aeropuerto
                </dt>
                <dd className="mt-1 font-serif text-2xl">42 min</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">
                  Hasta el centro
                </dt>
                <dd className="mt-1 font-serif text-2xl">18 min</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">
                  Costa privada
                </dt>
                <dd className="mt-1 font-serif text-2xl">1 km</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">
                  Senderos propios
                </dt>
                <dd className="mt-1 font-serif text-2xl">2 km</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Experience section */}
      <section
        id="experiencia"
        className="border-b border-border/50 bg-secondary/30"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Lo que pasa adentro
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">
              Café lento, libros, una vista que cambia cada hora.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg md:row-span-2 md:aspect-auto">
              <Image
                src="/images/life/cozy-living-stove.jpg"
                alt="Living con estufa a leña"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/life/breakfast-toast.jpg"
                alt="Desayuno con tostadas y café"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/life/coffee-table.jpg"
                alt="Mesa con café por la mañana"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg md:col-span-2">
              <Image
                src="/images/life/modern-kitchen-forest.jpg"
                alt="Cocina moderna con vista al bosque"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 66vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border/50 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Huéspedes
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Lo que cuentan los que volvieron.
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <figure
                key={review.id}
                className="rounded-lg border border-border/60 bg-card p-8"
              >
                <blockquote className="font-serif text-lg leading-relaxed text-foreground/90">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">
                  — {review.authorName}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src="/images/home/lake-section.jpg"
          alt="Lago al atardecer"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center text-white lg:px-10">
          <h2 className="font-serif text-4xl md:text-6xl">
            Reservá directo,
            <br /> sin intermediarios.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            Cobramos lo que vale, no lo que toleran las plataformas. La
            cancelación es flexible hasta 48 horas antes.
          </p>
          <Link
            href="#cabanas"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/90"
          >
            Ver disponibilidad
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
