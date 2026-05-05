import "server-only";
import { db, schema } from "./db";
import { eq, asc } from "drizzle-orm";

export { formatPriceARS } from "./format";

export async function getCabins() {
  return db.select().from(schema.cabins).orderBy(asc(schema.cabins.pricePerNight));
}

export async function getCabinBySlug(slug: string) {
  const [cabin] = await db
    .select()
    .from(schema.cabins)
    .where(eq(schema.cabins.slug, slug))
    .limit(1);
  return cabin ?? null;
}

export async function getReviewsForCabin(cabinId: string) {
  return db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.cabinId, cabinId));
}

export async function getRecentReviews(limit = 6) {
  return db.select().from(schema.reviews).limit(limit);
}
