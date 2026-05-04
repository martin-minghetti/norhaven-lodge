import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="font-serif text-2xl tracking-tight text-foreground"
        >
          Norhaven
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/#cabanas"
            className="text-foreground/75 transition-colors hover:text-foreground"
          >
            Cabañas
          </Link>
          <Link
            href="/#ubicacion"
            className="text-foreground/75 transition-colors hover:text-foreground"
          >
            Ubicación
          </Link>
          <Link
            href="/#experiencia"
            className="text-foreground/75 transition-colors hover:text-foreground"
          >
            Experiencia
          </Link>
        </nav>
        <Link
          href="/#cabanas"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reservar
        </Link>
      </div>
    </header>
  );
}
