"use server";

import { headers } from "next/headers";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getCabins } from "@/lib/queries";
import { rateLimit } from "@/lib/rate-limit";

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

const searchResultSchema = z.object({
  matches: z
    .array(
      z.object({
        slug: z.string().describe("Slug exacto de la cabaña recomendada"),
        reason: z
          .string()
          .max(180)
          .describe(
            "Una oración corta en español rioplatense explicando por qué esta cabaña matchea lo que pidió el usuario. Sin saludo. Sin emojis.",
          ),
        matchScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score de match 0-100 según qué tan bien encaja"),
      }),
    )
    .max(3)
    .describe("Cabañas que matchean, ordenadas por matchScore descendente"),
  noMatchMessage: z
    .string()
    .max(140)
    .nullable()
    .describe(
      "Si NINGUNA cabaña encaja con el pedido, mensaje breve explicando por qué. Sino, null.",
    ),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export type SearchResponse =
  | { ok: true; result: SearchResult }
  | { ok: false; error: string };

export async function searchCabins(query: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (trimmed.length < 4) {
    return { ok: false, error: "Contame un poco más sobre lo que buscás" };
  }
  if (trimmed.length > 240) {
    return { ok: false, error: "Demasiado largo, resumí en una frase" };
  }

  const ip = await getClientIp();
  const rl = rateLimit(`ai-search:${ip}`, 10, 60);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Demasiadas búsquedas seguidas. Probá de nuevo en ${rl.resetInSeconds}s.`,
    };
  }

  try {
    const cabins = await getCabins();
    const catalog = cabins.map((c) => ({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      capacity: c.capacity,
      pricePerNight: c.pricePerNight,
      location: c.location,
      amenities: c.amenities,
      description: c.description.slice(0, 400),
    }));

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: searchResultSchema,
      system: `Sos el concierge de Norhaven Lodge, un grupo de 3 cabañas boutique en Patagonia argentina. Tu tarea es matchear el pedido del huésped contra el catálogo y recomendar 1-3 cabañas (no más). Hablás en español rioplatense, directo y cálido, sin floreo. NUNCA inventes amenities o features que no estén en los datos. Si el pedido NO encaja con ninguna cabaña (ej: pide 8 huéspedes pero la max es 6), llená noMatchMessage explicando brevemente y dejá matches vacío.`,
      prompt: `Catálogo:\n${JSON.stringify(catalog, null, 2)}\n\nPedido del huésped: "${trimmed}"\n\nDevolvé las cabañas que mejor matchean ordenadas por score.`,
    });

    return { ok: true, result: object };
  } catch (err) {
    console.error("AI search error:", err);
    return {
      ok: false,
      error: "Hubo un problema con la búsqueda. Probá de nuevo en un momento.",
    };
  }
}
