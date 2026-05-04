import { config } from "dotenv";
config({ path: ".env.local" });

import { db, schema } from "./index";

async function seed() {
  console.log("🌱 Seeding Norhaven Lodge database...");

  await db.delete(schema.reviews);
  await db.delete(schema.blockedDates);
  await db.delete(schema.bookings);
  await db.delete(schema.cabins);

  const [casaLago, loftBosque, cabanaCerro] = await db
    .insert(schema.cabins)
    .values([
      {
        slug: "casa-lago",
        name: "Casa Lago",
        tagline: "Frente al agua, entre coihues",
        description:
          "Una cabaña de madera y piedra al borde del lago, con ventanal panorámico que enmarca el agua y el bosque. Pensada para cuatro personas que quieren despertarse con la luz reflejada en el techo y dormirse escuchando el silencio.",
        capacity: 4,
        pricePerNight: 92000,
        amenities: [
          "Hot tub al aire libre",
          "Estufa a leña",
          "Cocina equipada",
          "Wi-Fi",
          "Muelle privado",
          "Kayak incluido",
          "Desayuno regional",
          "Estacionamiento techado",
        ],
        images: [
          "/images/cabins/casa-lago/hero.jpg",
          "/images/cabins/casa-lago/exterior-01.jpg",
          "/images/cabins/casa-lago/living.jpg",
          "/images/cabins/casa-lago/kitchen.jpg",
          "/images/cabins/casa-lago/bedroom.jpg",
          "/images/cabins/casa-lago/deck.jpg",
        ],
        location: "Norhaven · sector lago",
      },
      {
        slug: "loft-bosque",
        name: "Loft del Bosque",
        tagline: "Refugio íntimo entre pinos centenarios",
        description:
          "Un loft de doble altura escondido entre pinos. Ventanas hasta el techo, lectura junto al hogar a leña, ducha exterior. Para dos. Pensado para parejas que prefieren un fin de semana en silencio antes que un hotel con piscina.",
        capacity: 2,
        pricePerNight: 78000,
        amenities: [
          "Hogar a leña",
          "Ducha exterior",
          "Cocina compacta",
          "Wi-Fi",
          "Café de especialidad",
          "Vinilo + sistema audio",
          "Senderos privados",
          "Bañera con vista",
        ],
        images: [
          "/images/cabins/loft-bosque/hero.jpg",
          "/images/cabins/loft-bosque/exterior-01.jpg",
          "/images/cabins/loft-bosque/loft.jpg",
          "/images/cabins/loft-bosque/fireplace.jpg",
          "/images/cabins/loft-bosque/bath.jpg",
        ],
        location: "Norhaven · sector bosque",
      },
      {
        slug: "cabana-cerro",
        name: "Cabaña del Cerro",
        tagline: "Vista panorámica, espacio para la familia",
        description:
          "La más espaciosa de Norhaven. Tres dormitorios, comedor para ocho, deck con vista panorámica al valle. Pensada para familias o grupos de amigos que quieren sentir la cordillera sin perderse en hoteles grandes.",
        capacity: 6,
        pricePerNight: 145000,
        amenities: [
          "3 dormitorios",
          "Comedor para 8",
          "Cocina full",
          "Quincho con parrilla",
          "Hot tub privado",
          "Wi-Fi de alta velocidad",
          "Smart TV",
          "Estacionamiento doble",
          "Estufa a leña",
          "Bicicletas incluidas",
        ],
        images: [
          "/images/cabins/cabana-cerro/hero.jpg",
          "/images/cabins/cabana-cerro/exterior-01.jpg",
          "/images/cabins/cabana-cerro/living.jpg",
          "/images/cabins/cabana-cerro/dining.jpg",
          "/images/cabins/cabana-cerro/bedroom-master.jpg",
          "/images/cabins/cabana-cerro/deck-view.jpg",
        ],
        location: "Norhaven · sector cerro",
      },
    ])
    .returning();

  console.log(`✓ ${3} cabañas insertadas`);

  const reviewsData: Array<typeof schema.reviews.$inferInsert> = [
    {
      cabinId: casaLago.id,
      authorName: "Lucía M.",
      rating: 5,
      text: "El silencio del muelle a las 7 de la mañana vale el viaje. Volveríamos en invierno con nieve.",
    },
    {
      cabinId: casaLago.id,
      authorName: "Tomás R.",
      rating: 5,
      text: "El kayak incluido fue un detalle inesperado. Casa impecable, atención humana.",
    },
    {
      cabinId: casaLago.id,
      authorName: "Florencia A.",
      rating: 4,
      text: "El hot tub afuera, mirando el lago, fue lo mejor del fin de semana. Único reparo: el camino de entrada en lluvia.",
    },
    {
      cabinId: casaLago.id,
      authorName: "Diego P.",
      rating: 5,
      text: "Cuatro días sin internet aunque había Wi-Fi. La casa invita a apagar el celular.",
    },
    {
      cabinId: casaLago.id,
      authorName: "Sofía L.",
      rating: 5,
      text: "El desayuno regional con dulces de la zona, panadería local. Atención de hospedaje boutique.",
    },

    {
      cabinId: loftBosque.id,
      authorName: "Mariana B.",
      rating: 5,
      text: "Vinilos + hogar a leña + lluvia afuera. Un fin de semana para repetir cada otoño.",
    },
    {
      cabinId: loftBosque.id,
      authorName: "Federico G.",
      rating: 5,
      text: "La ducha exterior es una experiencia. La altura del loft con las ventanas hasta el techo, otra.",
    },
    {
      cabinId: loftBosque.id,
      authorName: "Camila V.",
      rating: 5,
      text: "Café excepcional. La biblioteca chica pero bien curada. No hace falta más.",
    },
    {
      cabinId: loftBosque.id,
      authorName: "Nicolás S.",
      rating: 4,
      text: "Para dos, perfecto. Los senderos privados son cortos pero hermosos. Solo eso, no más.",
    },
    {
      cabinId: loftBosque.id,
      authorName: "Agustina M.",
      rating: 5,
      text: "Bañera con vista al bosque. Suena cliché hasta que lo vivís.",
    },

    {
      cabinId: cabanaCerro.id,
      authorName: "Familia Pereyra",
      rating: 5,
      text: "Fuimos seis. Espacio de sobra, todos cómodos. El quincho con parrilla salvó dos noches de lluvia.",
    },
    {
      cabinId: cabanaCerro.id,
      authorName: "Julieta C.",
      rating: 5,
      text: "Para grupos grandes es la mejor opción de la zona. Vista al valle desde el deck, espectacular.",
    },
    {
      cabinId: cabanaCerro.id,
      authorName: "Martín H.",
      rating: 4,
      text: "Las bicicletas incluidas son un buen toque. Cocina muy bien equipada para cocinar de verdad.",
    },
    {
      cabinId: cabanaCerro.id,
      authorName: "Vanesa T.",
      rating: 5,
      text: "Tres dormitorios reales, no improvisados. El hot tub privado del deck fue el plus.",
    },
    {
      cabinId: cabanaCerro.id,
      authorName: "Equipo de off-site",
      rating: 5,
      text: "Vinimos seis del trabajo para un retiro. La conectividad anduvo perfecta para hacer un par de calls. El resto, naturaleza.",
    },
  ];

  await db.insert(schema.reviews).values(reviewsData);
  console.log(`✓ ${reviewsData.length} reviews insertadas`);

  console.log("\n🌲 Seed completo. Norhaven Lodge listo.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
