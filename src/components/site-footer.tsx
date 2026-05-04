import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/50 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-serif text-3xl tracking-tight">Norhaven</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Tres cabañas boutique pensadas para descansar, no para fotografiar.
              Reservás directo, cobramos honesto, sin intermediarios.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-foreground/60">
              Cabañas
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/cabanas/casa-lago" className="text-foreground/80 hover:text-foreground">
                  Casa Lago
                </Link>
              </li>
              <li>
                <Link href="/cabanas/loft-bosque" className="text-foreground/80 hover:text-foreground">
                  Loft del Bosque
                </Link>
              </li>
              <li>
                <Link href="/cabanas/cabana-cerro" className="text-foreground/80 hover:text-foreground">
                  Cabaña del Cerro
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-foreground/60">
              Contacto
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              <li>hola@norhaven.demo</li>
              <li>+54 11 0000-0000</li>
              <li>Patagonia, Argentina</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/50 pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} Norhaven Lodge — demo project. Las
            cabañas son ficticias.
          </p>
          <p>
            Built with Next.js · Drizzle · Supabase · MercadoPago · Vercel AI
            SDK.
          </p>
        </div>
      </div>
    </footer>
  );
}
