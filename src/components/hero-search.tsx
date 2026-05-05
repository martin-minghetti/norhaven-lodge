"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { searchCabins, type SearchResult } from "@/lib/ai-search";
import { formatPriceARS } from "@/lib/format";

type CabinLite = {
  slug: string;
  name: string;
  tagline: string;
  capacity: number;
  pricePerNight: number;
  imageUrl: string;
};

const SUGGESTIONS = [
  "cabaña con vista al lago para 4 personas",
  "algo íntimo para una pareja, con estufa a leña",
  "una para 6 con vista panorámica",
];

export function HeroSearch({ cabins }: { cabins: CabinLite[] }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cabinBySlug = new Map(cabins.map((c) => [c.slug, c]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(async () => {
      setError(null);
      setResult(null);
      const res = await searchCabins(query);
      if (res.ok) {
        setResult(res.result);
        const target = document.getElementById("ai-results");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setError(res.error);
      }
    });
  }

  function pickSuggestion(s: string) {
    setQuery(s);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-10 max-w-2xl"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/95 backdrop-blur">
          <Sparkles className="h-3 w-3" />
          Buscador con AI
        </div>

        <label htmlFor="ai-query" className="sr-only">
          Buscar cabaña
        </label>
        <div className="mt-3 flex flex-col gap-3 rounded-xl bg-white/95 p-2 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
          <input
            id="ai-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué tipo de escapada estás buscando?"
            className="w-full rounded-full bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isPending}
            maxLength={240}
          />
          <button
            type="submit"
            disabled={isPending || query.trim().length < 4}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando…
              </>
            ) : (
              <>
                Buscar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => pickSuggestion(s)}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur transition-colors hover:bg-white/20"
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-destructive/20 px-3 py-2 text-sm text-white">
            {error}
          </p>
        )}
      </form>

      {result && (
        <ResultsPanel result={result} cabinBySlug={cabinBySlug} />
      )}
    </>
  );
}

function ResultsPanel({
  result,
  cabinBySlug,
}: {
  result: SearchResult;
  cabinBySlug: Map<string, CabinLite>;
}) {
  return (
    <section
      id="ai-results"
      className="border-b border-border/50 bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Recomendación AI
          </p>
        </div>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">
          {result.matches.length > 0
            ? "Esto pensamos para vos"
            : "No encontramos un match exacto"}
        </h2>

        {result.noMatchMessage && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">
            {result.noMatchMessage}
          </p>
        )}

        {result.matches.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {result.matches.map((match) => {
              const cabin = cabinBySlug.get(match.slug);
              if (!cabin) return null;
              return (
                <article
                  key={match.slug}
                  className="group flex flex-col rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link
                    href={`/cabanas/${cabin.slug}`}
                    className="block overflow-hidden rounded-lg"
                  >
                    <div
                      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                      style={{
                        backgroundImage: `url(${cabin.imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </Link>
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-xl">{cabin.name}</h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        {match.matchScore}/100
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cabin.tagline}
                    </p>
                  </div>
                  <p className="mt-5 flex-1 rounded-lg bg-secondary/40 px-4 py-3 text-sm leading-relaxed text-foreground/85">
                    {match.reason}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      desde{" "}
                      <span className="font-medium text-foreground">
                        {formatPriceARS(cabin.pricePerNight)}
                      </span>
                      {" / noche"}
                    </span>
                    <Link
                      href={`/cabanas/${cabin.slug}`}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Ver
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
