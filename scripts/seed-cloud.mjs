import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "riqsi-rutas.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "riqsi-rutas",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "riqsi-rutas.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://mgkxnplbcdxfuxdlcyzl.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PLACES = [
  {
    id: "place-1",
    title: "Cristo de la Concordia",
    area: "Cerro San Pedro",
    tag: "Imperdible",
    category: "cultura",
    image: "/assets/cochabamba-hero.jpg",
    rating: "4.8",
    time: "2–3 h",
    featured: true,
    visible: true,
    coordinates: [-66.13495, -17.38431],
    precio: 85,
    precio_usd: 12.20,
    precio_detalle: "Teleférico: Bs. 10 ida y vuelta · Entrada al Cristo: Gratuita (Bs. 2 para subir al mirador interno)",
    horario_visita: "Martes a Domingo de 08:30 a 19:00 (Teleférico operativo)",
    descripcion_items: [
      "El Cristo más alto de América del Sur (34.20 m de escultura + 6.24 m de pedestal).",
      "Teleférico panorámico desde el Parque de la Autonomía con vista al cerro San Pedro.",
      "Mirador de 360° para contemplar toda la ciudad de Cochabamba, la laguna Alalay y la cordillera.",
      "Escalera interna para subir hasta el pecho y los brazos de la estatua.",
    ],
    consejo: "Sube cerca de las 17:30 para presenciar el atardecer sobre el valle y ver cómo se encienden las luces de la ciudad.",
    dato_historico: "Supera por centenas de centímetros al famoso Cristo Redentor de Río de Janeiro (30 m).",
    badges: ["IMPERDIBLE"],
  },
  {
    id: "place-2",
    title: "Palacio Portales",
    area: "Queru Queru",
    tag: "Cultura",
    category: "cultura",
    image: "/assets/patrimonio.jpg",
    rating: "4.7",
    time: "1–2 h",
    featured: false,
    visible: true,
    coordinates: [-66.15339, -17.37492],
    precio: 20,
    precio_usd: 2.87,
    precio_detalle: "Nacionales: Bs. 20 · Estudiantes: Bs. 10 · Extranjeros: Bs. 30",
    horario_visita: "Martes a Domingo: 15:00 a 18:30 (Visitas guiadas cada 30 min)",
    descripcion_items: [
      "Palacete de estilo ecléctico francés diseñado por Eugène Bliault para Simón I. Patiño.",
      "Jardines versallescos con fuentes de mármol de Carrara italiano, estanques y cipreses centenarios.",
      "Salas interiores con tapices flamencos y lámparas de cristal de Baccarat.",
      "Centro pedagógico y cultural con la biblioteca más rica de la región.",
    ],
    consejo: "Pide visitar el mirador del piso superior y el laberinto botánico del jardín japonés.",
    dato_historico: "Patiño gastó una fortuna en su construcción pero jamás llegó a habitarlo.",
    badges: ["Cultura"],
  },
  {
    id: "place-3",
    title: "Parque Nacional Tunari",
    area: "Cordillera",
    tag: "Naturaleza",
    category: "naturaleza",
    image: "/assets/tunari.jpg",
    rating: "4.9",
    time: "Día completo",
    featured: true,
    visible: true,
    coordinates: [-66.3208, -17.2301],
    precio: 0,
    precio_usd: 0,
    precio_detalle: "Entrada al parque: Gratuita · Tours de montaña con transporte: Bs. 120 - 180",
    horario_visita: "Abierto todos los días de 06:00 a 18:00 (Recomendado con guía certificado)",
    descripcion_items: [
      "El pico más alto de la cordillera central de Bolivia (Cumbre Tunari a 5,035 msnm).",
      "Bosques ancestrales de queñuas (Polylepis besseri).",
      "Lagunas glaciares de altura color turquesa (Laguna Toro, San Jerónimo y San Juan).",
      "Santuario de cóndores andinos y vizcachas de altura.",
    ],
    consejo: "Lleva ropa térmica en capas, bloqueador solar y hojas de coca o caramelos para la aclimatación.",
    dato_historico: "Considerado un Apu sagrado que protege las lluvias de todo el valle.",
    badges: ["Naturaleza", "Destacado"],
  },
  {
    id: "place-4",
    title: "Mercado La Cancha & Sabores",
    area: "La Cancha",
    tag: "Gastronomía",
    category: "gastronomia",
    image: "/assets/gastronomia.jpg",
    rating: "4.9",
    time: "2 h",
    featured: true,
    visible: true,
    coordinates: [-66.1585, -17.4045],
    precio: 15,
    precio_usd: 2.16,
    precio_detalle: "Platos típicos desde Bs. 15 a Bs. 35 · Artesanías desde Bs. 10",
    horario_visita: "Lunes a Domingo de 06:30 a 20:00 (Días de feria masiva: Miércoles y Sábado)",
    descripcion_items: [
      "El mercado al aire libre más grande de toda Sudamérica (más de 16 cuadras de laberintos).",
      "Sector de gastronomía tradicional: auténtico chicharrón en pailas gigantes y silpancho.",
      "Feria de flores exóticas, textilería de aguayo tejida a mano y artesanías.",
      "El pasaje de los Kallawayas: hierbas medicinales andinas y sahumerios tradicionales.",
    ],
    consejo: "Visita la sección de frutas tropicales del Chapare para probar chirimoyas gigantes.",
    dato_historico: "En La Cancha puedes encontrar desde una aguja artesanal hasta antigüedades coloniales.",
    badges: ["Gastronomía"],
  },
  {
    id: "place-5",
    title: "Valle de las Ánimas",
    area: "Tiquipaya",
    tag: "Naturaleza",
    category: "naturaleza",
    image: "/assets/naturaleza-valle.jpg",
    rating: "4.8",
    time: "4–5 h",
    featured: false,
    visible: true,
    coordinates: [-66.216, -17.31],
    precio: 0,
    precio_usd: 0,
    precio_detalle: "Acceso libre",
    horario_visita: "Abierto 24/7 (Recomendado de 08:00 a 17:30)",
    descripcion_items: [
      "Laberinto geológico natural con chimeneas de hadas y farallones de arcilla.",
      "Senderismo suave apto para familias con vistas panorámicas al valle de Tiquipaya.",
      "Microclima cálido rodeado de huertos de flores y árboles de molle aromático.",
    ],
    consejo: "Lleva calzado con buena tracción para las pendientes arenosas.",
    dato_historico: "Las formaciones producen al atardecer un sonido similar a susurros.",
    badges: ["Naturaleza"],
  },
  {
    id: "place-6",
    title: "Ruta del Silpancho y Pique",
    area: "El Prado y Cala Cala",
    tag: "Gastronomía",
    category: "gastronomia",
    image: "/assets/comida-tradicional.jpg",
    rating: "5.0",
    time: "3 h",
    featured: true,
    visible: true,
    coordinates: [-66.155, -17.387],
    precio: 25,
    precio_usd: 3.59,
    precio_detalle: "Platos completos: Bs. 25 a Bs. 45 por persona",
    horario_visita: "Almuerzos de 12:00 a 15:00 · Cenas y noches de 18:30 a 23:00",
    descripcion_items: [
      "Cuna del Silpancho cochabambino: carne fileteada ultrafina apanada, papas doradas y huevos fritos.",
      "Pique Macho auténtico con lomo jugoso, salchicha, cebolla, tomate y abundante locoto fresco.",
      "Recorrido por los restaurantes tradicionales de Cala Cala y el Prado.",
    ],
    consejo: "Pide 'Llajwa' recién molida en batán de piedra para acompañar cualquier plato.",
    dato_historico: "El Silpancho fue inventado en Cochabamba en la década de 1960.",
    badges: ["Gastronomía"],
  },
  {
    id: "place-7",
    title: "Danzas y Tradición Viva",
    area: "Centro Histórico",
    tag: "Tradición",
    category: "cultura",
    image: "/assets/cultura-danza.jpg",
    rating: "4.9",
    time: "Medio día",
    featured: false,
    visible: true,
    coordinates: [-66.1568, -17.3935],
    precio: 30,
    precio_usd: 4.31,
    precio_detalle: "Entrada a peñas folclóricas: Bs. 30 a Bs. 50 con música en vivo",
    horario_visita: "Viernes y fines de semana por la tarde (16:00 a 21:00)",
    descripcion_items: [
      "Los talleres de los grandes maestros bordadores de trajes folclóricos en la calle Los Andes.",
      "Ensayos y presentaciones en vivo de Caporales, Morenada, Salay y Tinkus.",
      "Museos de instrumentos nativos: charangos de armadillo, zampoñas y quenas.",
    ],
    consejo: "No te vayas sin probar un helado de canela tradicional frente a la Plaza 14 de Septiembre.",
    dato_historico: "El ritmo del Salay nació en los valles cochabambinos.",
    badges: ["Cultura", "Tradición"],
  },
  {
    id: "place-8",
    title: "Travesía en Bici por los Valles",
    area: "Valle Alto",
    tag: "Aventura",
    category: "aventura",
    image: "/assets/aventura-bici.jpg",
    rating: "4.8",
    time: "4 h",
    featured: false,
    visible: true,
    coordinates: [-66.1533, -17.4022],
    precio: 180,
    precio_usd: 25.86,
    precio_detalle: "Tour completo con transporte y equipo: Bs. 180 - 250",
    horario_visita: "Salidas diarias a las 07:30 previa reserva",
    descripcion_items: [
      "Descenso en bicicleta de montaña con 2,500 metros de desnivel desde la cordillera al valle.",
      "Vistas alucinantes de los valles interandinos y pasos técnicos entre senderos.",
      "Servicio con guías profesionales, cascos integrales y bicicletas de doble suspensión.",
    ],
    consejo: "Si eres principiante, solicita la ruta escénica por camino ancho de ripio.",
    dato_historico: "Considerado uno de los 5 mejores descensos en dos ruedas de los Andes bolivianos.",
    badges: ["Aventura"],
  },
  {
    id: "place-9",
    title: "Bosques y Senderos de Altura",
    area: "Tiquipaya",
    tag: "Naturaleza",
    category: "naturaleza",
    image: "/assets/naturaleza-verde.jpg",
    rating: "4.8",
    time: "3 h",
    featured: true,
    visible: true,
    coordinates: [-66.2158, -17.3328],
    precio: 0,
    precio_usd: 0,
    precio_detalle: "Acceso libre · Tours guiados desde Bs. 60",
    horario_visita: "Abierto de 07:00 a 17:00 todos los días",
    descripcion_items: [
      "Senderos naturales rodeados de queñuales y bosques andinos a más de 3,000 msnm.",
      "Avistamiento de aves endémicas de los valles: colibríes andinos, loros y aguiluchos.",
      "Rutas cortas (1 h) y largas (3 h) con señalización para senderismo autónomo.",
    ],
    consejo: "El mejor momento para ir es temprano en la mañana cuando la niebla baja de la cordillera.",
    dato_historico: "Estos bosques son parte del corredor biológico del Parque Nacional Tunari.",
    badges: ["Naturaleza"],
  },
  {
    id: "place-gastro-1",
    title: "Casa de Campo",
    area: "Av. Uyuni (Boulevar de la Recoleta)",
    tag: "Gastronomía Valluna",
    category: "gastronomia",
    image: "/assets/comida-tradicional.jpg",
    rating: "4.9",
    time: "1–2 h",
    featured: true,
    visible: true,
    coordinates: [-66.1511, -17.3776],
    precio: 45,
    precio_usd: 6.47,
    precio_detalle: "Menú valluno completo desde Bs. 45 · Plato principal solo desde Bs. 30",
    horario_visita: "Lunes a Domingo de 12:00 a 15:30 y 18:30 a 22:30",
    descripcion_items: [
      "Cocina valluna cochabambina con recetas familiares de más de tres generaciones.",
      "Especialidad en Pique Macho, Mondongo y Fricasé de los Valles.",
      "Ambiente campestre en plena avenida de la Recoleta con jardín interior.",
    ],
    consejo: "Reserva mesa los fines de semana, se llena rápido para el almuerzo familiar.",
    dato_historico: "Uno de los primeros restaurantes de cocina valluna en la Recoleta.",
    badges: ["Gastronomía"],
  },
  {
    id: "place-gastro-2",
    title: "Punto de Encuentro (Central)",
    area: "Calle Cobija 345 (Km 3 Av. Blanco Galindo)",
    tag: "Pique Macho & Encuentro",
    category: "gastronomia",
    image: "/assets/gastronomia.jpg",
    rating: "4.8",
    time: "1–2 h",
    featured: true,
    visible: true,
    coordinates: [-66.1825, -17.3917],
    precio: 35,
    precio_usd: 5.03,
    precio_detalle: "Pique Macho para dos: Bs. 55 · Individual desde Bs. 35",
    horario_visita: "Martes a Domingo de 11:30 a 15:30 y 18:00 a 23:00",
    descripcion_items: [
      "El Pique Macho más famoso de la zona oeste, con más de 20 años de tradición.",
      "Porciones generosas de lomo, salchicha frankfurter, papa frita, cebolla y locoto.",
      "Atención familiar en un ambiente popular y animado.",
    ],
    consejo: "Pide el Pique 'extra locoto' si te gusta el picante, o 'sin locoto' si no.",
    dato_historico: "El Pique Macho es un plato netamente cochabambino.",
    badges: ["Gastronomía"],
  },
  {
    id: "place-gastro-3",
    title: "La Chanchada",
    area: "Av. Portales (Zona Norte)",
    tag: "Chicharrón Cochabambino",
    category: "gastronomia",
    image: "/assets/comida-platos.jpg",
    rating: "5.0",
    time: "2 h",
    featured: true,
    visible: true,
    coordinates: [-66.1530, -17.3738],
    precio: 40,
    precio_usd: 5.75,
    precio_detalle: "Chicharrón completo desde Bs. 40 · Con chicha de maíz incluida: Bs. 50",
    horario_visita: "Sábados y Domingos de 10:00 a 15:00 (solo fines de semana)",
    descripcion_items: [
      "Chicharrón de cerdo cochabambino auténtico, frito en paila de barro a leña.",
      "Acompañado de mote de maíz blanco, papa y llajwa fresca.",
      "Ambiente tradicional con mesas al aire libre y chicha de maíz artesanal.",
    ],
    consejo: "Llega antes de las 11:00, el chicharrón se acaba rápido los fines de semana.",
    dato_historico: "La chicha de maíz es Patrimonio Cultural Inmaterial de Bolivia.",
    badges: ["Gastronomía", "Destacado"],
  },
  {
    id: "place-gastro-4",
    title: "Casona del Molino",
    area: "Calle Potosí esq. N° 1392 (al lado del Palacio Portales)",
    tag: "Cocina Colonial & Tradición",
    category: "gastronomia",
    image: "/assets/patrimonio.jpg",
    rating: "4.9",
    time: "2–3 h",
    featured: true,
    visible: true,
    coordinates: [-66.1515, -17.3735],
    precio: 60,
    precio_usd: 8.62,
    precio_detalle: "Menú colonial completo desde Bs. 60 · Almuerzo ejecutivo Bs. 45",
    horario_visita: "Martes a Sábado de 12:00 a 15:00 y 19:00 a 23:00",
    descripcion_items: [
      "Restaurante instalado en una casona colonial del siglo XIX restaurada.",
      "Cocina de fusión boliviana con técnicas coloniales: hornos de barro y cazuelas de cerámica.",
      "Ubicación privilegiada junto al Palacio Portales en la zona patrimonial.",
    ],
    consejo: "Reserva con antelación para la cena romántica en el patio iluminado.",
    dato_historico: "La casona original fue construida como molino de trigo a finales del siglo XIX.",
    badges: ["Gastronomía", "Cultura"],
  },
];

const ANNOUNCEMENT = {
  id: "global-banner-1",
  active: true,
  badge: "COCHABAMBA 2026",
  message: "Ruta del Bicentenario activa. Optimización de trayectos con Supabase y Cloud Firestore.",
  linkText: "Ver Detalles",
  linkUrl: "#rutas",
  updatedAt: new Date().toISOString(),
};

async function syncAll() {
  console.log("🚀 Sincronizando datos hacia Firebase Cloud Firestore y Supabase PostgreSQL...");

  // 1. Firebase Firestore
  let fbCount = 0;
  for (const place of PLACES) {
    try {
      await setDoc(doc(db, "places", place.id), place, { merge: true });
      fbCount++;
    } catch (e) {
      console.warn(`[Firestore Error] place ${place.id}:`, e.message);
    }
  }

  try {
    await setDoc(doc(db, "announcements", "global-banner-1"), ANNOUNCEMENT, { merge: true });
    console.log("✅ Firestore: Aviso oficial sincronizado.");
  } catch (e) {
    console.warn("[Firestore Error] announcement:", e.message);
  }

  console.log(`✅ Firebase Firestore: ${fbCount}/${PLACES.length} destinos guardados.`);

  // 2. Supabase PostgreSQL
  let sbCount = 0;
  for (const place of PLACES) {
    try {
      const baseColumns = {
        id: place.id,
        title: place.title,
        area: place.area,
        tag: place.tag,
        category: place.category,
        image: place.image,
        rating: place.rating,
        time: place.time,
        featured: place.featured,
        visible: place.visible,
        updated_at: new Date().toISOString(),
      };
      const payload = {
        ...baseColumns,
        precio: place.precio,
        precio_usd: place.precio_usd,
        precio_detalle: place.precio_detalle,
        horario_visita: place.horario_visita,
        descripcion_items: place.descripcion_items,
        consejo: place.consejo,
        dato_historico: place.dato_historico,
        badges: place.badges,
        coordinates: place.coordinates,
      };
      const { error } = await supabase.from("places").upsert(payload);
      if (!error) {
        sbCount++;
      } else {
        // Reintentar con columnas base si la tabla en Supabase no tiene aún las nuevas columnas
        const res2 = await supabase.from("places").upsert(baseColumns);
        if (!res2.error) {
          sbCount++;
        } else {
          console.warn(`[Supabase Error] ${place.id}:`, res2.error.message);
        }
      }
    } catch (e) {
      console.warn(`[Supabase Exception] ${place.id}:`, e.message);
    }
  }

  try {
    await supabase.from("announcements").upsert({
      id: "global-banner-1",
      active: ANNOUNCEMENT.active,
      badge: ANNOUNCEMENT.badge,
      message: ANNOUNCEMENT.message,
      link_text: ANNOUNCEMENT.linkText,
      link_url: ANNOUNCEMENT.linkUrl,
      updated_at: new Date().toISOString(),
    });
    console.log("✅ Supabase: Aviso oficial sincronizado.");
  } catch (e) {
    console.warn("[Supabase Error] announcement:", e.message);
  }

  console.log(`✅ Supabase Cloud: ${sbCount}/${PLACES.length} destinos guardados.`);
  console.log("🎉 ¡Sincronización Dual completada con éxito!");
  process.exit(0);
}

syncAll().catch((err) => {
  console.error("Error global de sincronización:", err);
  process.exit(1);
});
