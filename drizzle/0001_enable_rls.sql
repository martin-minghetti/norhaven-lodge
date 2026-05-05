-- Defense in depth: enable RLS on all tables.
-- The app talks to Postgres directly via Drizzle (privileged role), so RLS
-- only kicks in for clients hitting Supabase PostgREST with anon/authenticated.
-- Public-read tables (cabins, reviews) get permissive SELECT policy.
-- Private tables (bookings, blocked_dates) get NO anon policy = deny-all from REST.

ALTER TABLE "cabins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blocked_dates" ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para owners de la tabla (defensa contra bypass via migrations runner)
ALTER TABLE "cabins" FORCE ROW LEVEL SECURITY;
ALTER TABLE "reviews" FORCE ROW LEVEL SECURITY;
ALTER TABLE "bookings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "blocked_dates" FORCE ROW LEVEL SECURITY;

-- Public-read: catalog y reviews son content publico
CREATE POLICY "cabins_public_read" ON "cabins"
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "reviews_public_read" ON "reviews"
  FOR SELECT TO anon, authenticated USING (true);

-- bookings y blocked_dates: sin policy = deny-all para anon/authenticated.
-- El app server (Drizzle con DATABASE_URL connection) corre como rol con BYPASSRLS
-- via Supabase pooler, asi que sigue funcionando normal.

-- Nota: si en algun momento queres que un user vea SU booking via REST,
-- agregar policy con auth.uid() o un token de booking firmado.
