import React from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { ZoomImage } from "../../atoms/ZoomImage/ZoomImage";
import type { PlaceItem } from "../../../types/auth";

export interface PlaceGuideDetails {
  highlights: string[];
  schedule: string;
  priceEstimate: string;
  insiderTip: string;
  curiousFact: string;
}

// Guía creativa y turística detallada para cada atractivo
const DESTINATION_GUIDES: Record<string, PlaceGuideDetails> = {
  "place-1": {
    highlights: [
      "El Cristo más alto de América del Sur (34.20 m de escultura + 6.24 m de pedestal).",
      "Teleférico panorámico desde el Parque de la Autonomía con vista al cerro San Pedro.",
      "Mirador de 360° para contemplar toda la ciudad de Cochabamba, la laguna Alalay y la cordillera.",
      "Escalera interna para subir hasta el pecho y los brazos de la estatua.",
    ],
    schedule: "Martes a Domingo de 08:30 a 19:00 (Teleférico operativo)",
    priceEstimate: "Teleférico: Bs. 10 ida y vuelta · Entrada al Cristo: Gratuita (Bs. 2 para subir al mirador interno)",
    insiderTip: "Sube cerca de las 17:30 para presenciar el atardecer sobre el valle y ver cómo se encienden las luces de la ciudad.",
    curiousFact: "Supera por centenas de centímetros al famoso Cristo Redentor de Río de Janeiro (30 m).",
  },
  "place-2": {
    highlights: [
      "Palacete de estilo ecléctico francés diseñado por el renombrado arquitecto Eugène Bliault para Simón I. Patiño.",
      "Jardines versallescos con fuentes de mármol de Carrara italiano, estanques y cipreses centenarios.",
      "Salas interiores con tapices flamencos, artesonados tallados en madera de cedro y lámparas de cristal de Baccarat.",
      "Centro pedagógico y cultural con la biblioteca más rica de la región.",
    ],
    schedule: "Martes a Domingo: 15:00 a 18:30 (Visitas guiadas cada 30 min)",
    priceEstimate: "Nacionales: Bs. 20 · Estudiantes: Bs. 10 · Extranjeros: Bs. 30",
    insiderTip: "Pide visitar el mirador del piso superior y el laberinto botánico del jardín japonés en la parte posterior.",
    curiousFact: "Patiño, el 'Rey del Estaño', gastó una fortuna en su construcción pero jamás llegó a habitarlo por problemas de salud en la altura.",
  },
  "place-3": {
    highlights: [
      "El pico más alto de la cordillera central de Bolivia (Cumbre Tunari a 5,035 msnm).",
      "Bosques ancestrales de queñuas (Polylepis besseri), el árbol nativo más resistente de los Andes.",
      "Lagunas glaciares de altura color turquesa (Laguna Toro, San Jerónimo y San Juan).",
      "Santuario de cóndores andinos, vizcachas de altura y flamencos migratorios.",
    ],
    schedule: "Abierto todos los días de 06:00 a 18:00 (Recomendado con guía certificado)",
    priceEstimate: "Entrada al parque: Gratuita · Tours de montaña con transporte: Bs. 120 - 180",
    insiderTip: "Lleva ropa térmica en capas, bloqueador solar y hojas de coca o caramelos para la aclimatación en altura.",
    curiousFact: "Los pobladores originarios consideran al cerro Tunari un Apu sagrado que protege las lluvias de todo el valle.",
  },
  "place-4": {
    highlights: [
      "El mercado al aire libre más grande de toda Sudamérica (más de 16 cuadras de laberintos temáticos).",
      "Sector de gastronomía tradicional: auténtico chicharrón en pailas gigantes de cobre y silpancho al plato.",
      "Feria de flores exóticas, textilería de aguayo tejida a mano y artesanías en cuero y madera.",
      "El pasaje de los Kallawayas: hierbas medicinales andinas y sahumerios tradicionales.",
    ],
    schedule: "Lunes a Domingo de 06:30 a 20:00 (Días de feria masiva: Miércoles y Sábado)",
    priceEstimate: "Platos típicos desde Bs. 15 a Bs. 35 · Artesanías desde Bs. 10",
    insiderTip: "Visita la sección de frutas tropicales del Chapare para probar chirimoyas gigantes y jugos recién exprimidos por Bs. 5.",
    curiousFact: "En La Cancha puedes encontrar desde una aguja artesanal hasta antigüedades coloniales de hace dos siglos.",
  },
  "place-5": {
    highlights: [
      "Laberinto geológico natural con chimeneas de hadas y farallones de arcilla moldeados por el viento.",
      "Senderismo suave apto para familias con vistas panorámicas al valle de Tiquipaya.",
      "Microclima cálido rodeado de huertos de flores y árboles de molle aromático.",
    ],
    schedule: "Abierto 24/7 (Recomendado de 08:00 a 17:30)",
    priceEstimate: "Acceso libre",
    insiderTip: "Lleva calzado con buena tracción para las pendientes arenosas.",
    curiousFact: "Las formaciones reciben su nombre porque al atardecer el viento entre las columnas produce un sonido similar a susurros.",
  },
  "place-6": {
    highlights: [
      "Cuna del Silpancho cochabambino: carne fileteada ultrafina apanada, papas doradas, arroz blanco y dos huevos fritos.",
      "Pique Macho auténtico con lomo jugoso, salchicha, cebolla, tomate y abundante locoto fresco.",
      "Recorrido por los restaurantes tradicionales de Cala Cala, el Prado y la avenida América.",
    ],
    schedule: "Almuerzos de 12:00 a 15:00 · Cenas y noches de 18:30 a 23:00",
    priceEstimate: "Platos completos: Bs. 25 a Bs. 45 por persona",
    insiderTip: "Pide 'Llajwa' recién molida en batán de piedra para acompañar cualquier plato.",
    curiousFact: "El Silpancho fue inventado en Cochabamba en la década de 1960 por doña Celia la Fuente.",
  },
  "place-7": {
    highlights: [
      "Los talleres de los grandes maestros bordadores de trajes folclóricos en la calle Los Andes.",
      "Ensayos y presentaciones en vivo de Caporales, Morenada, Salay y Tinkus.",
      "Museos de instrumentos nativos: charangos de armadillo, zampoñas y quenas.",
    ],
    schedule: "Viernes y fines de semana por la tarde (16:00 a 21:00)",
    priceEstimate: "Entrada a peñas folclóricas: Bs. 30 a Bs. 50 con música en vivo",
    insiderTip: "No te vayas sin probar un helado de canela tradicional frente a la Plaza 14 de Septiembre.",
    curiousFact: "El ritmo del Salay nació en los valles cochabambinos combinando el zapateo campesino con trajes coloridos.",
  },
  "place-8": {
    highlights: [
      "Descenso en bicicleta de montaña con 2,500 metros de desnivel desde la cordillera al valle.",
      "Vistas alucinantes de los valles interandinos y pasos técnicos entre senderos de roca y tierra.",
      "Servicio con guías profesionales, cascos integrales y bicicletas de suspensión completa.",
    ],
    schedule: "Salidas diarias a las 07:30 previa reserva",
    priceEstimate: "Tour completo con transporte y equipo: Bs. 180 - 250",
    insiderTip: "Si eres principiante, solicita la ruta escénica por camino ancho de ripio.",
    curiousFact: "Es considerado uno de los 5 mejores descensos en dos ruedas de los Andes bolivianos.",
  },
};

interface PlaceDetailModalProps {
  isOpen: boolean;
  place: PlaceItem | null;
  isFavorite: boolean;
  isEffectiveAdmin?: boolean;
  onClose: () => void;
  onToggleFavorite: (title: string) => void;
  onOpenZoomModal: (place: PlaceItem) => void;
  onOpenBookingPayment: (place: PlaceItem) => void;
  onEditPlace?: (place: PlaceItem) => void;
  onSavePlace?: (place: PlaceItem) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  isOpen,
  place,
  isFavorite,
  isEffectiveAdmin,
  onClose,
  onToggleFavorite,
  onOpenZoomModal,
  onOpenBookingPayment,
  onEditPlace,
  onSavePlace,
}) => {
  if (!isOpen || !place) return null;

  const guide = DESTINATION_GUIDES[place.id] || {
    highlights: [
      `Experiencia turística destacada en ${place.area}.`,
      `Categoría oficial: ${place.category.toUpperCase()}.`,
      `Tiempo recomendado de recorrido: ${place.time}.`,
      "Guías locales e intérpretes certificados disponibles.",
    ],
    schedule: "Abierto habitualmente de 08:30 a 18:00",
    priceEstimate: "Costo promedio estimado: Bs. 25 a Bs. 85 por persona",
    insiderTip: "Te recomendamos llevar cámara fotográfica y consultar el clima antes de salir.",
    curiousFact: "Este atractivo forma parte del circuito patrimonial y turístico del Bicentenario de Cochabamba.",
  };

  const initialHighlights = (place.descripcionItems && place.descripcionItems.length > 0)
    ? place.descripcionItems
    : guide.highlights;
  const initialSchedule = place.horarioVisita || guide.schedule;
  const initialPriceEstimate = place.precioDetalle || guide.priceEstimate;
  const initialInsiderTip = place.consejo || guide.insiderTip;
  const initialCuriousFact = place.datoHistorico || guide.curiousFact;

  // ── Modo Edición en Línea ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(place.title);
  const [draftArea, setDraftArea] = React.useState(place.area);
  const [draftRating, setDraftRating] = React.useState(place.rating);
  const [draftTime, setDraftTime] = React.useState(place.time);
  const [draftPrecio, setDraftPrecio] = React.useState(place.precio !== undefined ? String(place.precio) : "85");
  const [draftPrecioUsd, setDraftPrecioUsd] = React.useState(
    place.precioUsd !== undefined
      ? String(place.precioUsd)
      : place.precio !== undefined
      ? (Number(place.precio) / 6.96).toFixed(2)
      : "12.20"
  );
  const [draftPrecioDetalle, setDraftPrecioDetalle] = React.useState(initialPriceEstimate);
  const [draftSchedule, setDraftSchedule] = React.useState(initialSchedule);
  const [draftHighlights, setDraftHighlights] = React.useState<string[]>(initialHighlights);
  const [draftInsiderTip, setDraftInsiderTip] = React.useState(initialInsiderTip);
  const [draftCuriousFact, setDraftCuriousFact] = React.useState(initialCuriousFact);
  const [draftBadges, setDraftBadges] = React.useState(
    (place.badges && place.badges.length > 0) ? place.badges.join(", ") : (place.tag || "IMPERDIBLE")
  );

  React.useEffect(() => {
    if (place) {
      setDraftTitle(place.title);
      setDraftArea(place.area);
      setDraftRating(place.rating);
      setDraftTime(place.time);
      setDraftPrecio(place.precio !== undefined ? String(place.precio) : "85");
      setDraftPrecioUsd(
        place.precioUsd !== undefined
          ? String(place.precioUsd)
          : place.precio !== undefined
          ? (Number(place.precio) / 6.96).toFixed(2)
          : "12.20"
      );
      setDraftPrecioDetalle(place.precioDetalle || guide.priceEstimate);
      setDraftSchedule(place.horarioVisita || guide.schedule);
      setDraftHighlights(
        (place.descripcionItems && place.descripcionItems.length > 0) ? place.descripcionItems : guide.highlights
      );
      setDraftInsiderTip(place.consejo || guide.insiderTip);
      setDraftCuriousFact(place.datoHistorico || guide.curiousFact);
      setDraftBadges(
        (place.badges && place.badges.length > 0) ? place.badges.join(", ") : (place.tag || "IMPERDIBLE")
      );
      setIsEditing(false);
    }
  }, [place?.id]);

  const handleSaveInline = () => {
    const parsedPrecio = draftPrecio.trim() ? parseFloat(draftPrecio) : undefined;
    const parsedPrecioUsd = draftPrecioUsd.trim()
      ? parseFloat(draftPrecioUsd)
      : parsedPrecio !== undefined
      ? parseFloat((parsedPrecio / 6.96).toFixed(2))
      : undefined;

    const badgesArray = draftBadges
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const updated: PlaceItem = {
      ...place,
      title: draftTitle.trim() || place.title,
      area: draftArea.trim() || place.area,
      rating: draftRating.trim() || place.rating,
      time: draftTime.trim() || place.time,
      precio: parsedPrecio,
      precioUsd: parsedPrecioUsd,
      precioDetalle: draftPrecioDetalle.trim() || undefined,
      horarioVisita: draftSchedule.trim() || undefined,
      descripcionItems: draftHighlights.map((h) => h.trim()).filter((h) => h.length > 0),
      consejo: draftInsiderTip.trim() || undefined,
      datoHistorico: draftCuriousFact.trim() || undefined,
      badges: badgesArray.length > 0 ? badgesArray : undefined,
      tag: badgesArray[0] || place.tag,
    };

    if (onSavePlace) {
      onSavePlace(updated);
    }
    setIsEditing(false);
  };

  const displayPriceBob = place.precio !== undefined ? `Bs. ${place.precio}` : "Bs. 85";
  const displayPriceUsd = place.precioUsd !== undefined 
    ? `($${Number(place.precioUsd).toFixed(2)} USD)` 
    : (place.precio !== undefined ? `($${(Number(place.precio) / 6.96).toFixed(2)} USD)` : "($12.20 USD)");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl border-2 border-[#E2D9CC] flex flex-col max-h-[92vh]">
        {/* Top aguayo stripe */}
        <div className="aguayo-strip h-2 w-full shrink-0" />

        {/* Modal Header Image with Lupa Zoom */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#1E293B] shrink-0">
          <ZoomImage
            src={place.image}
            alt={place.title}
            containerClassName="relative h-full w-full overflow-hidden cursor-crosshair group"
            onZoomClick={() => onOpenZoomModal(place)}
          />

          {/* Floating Badges */}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2 pointer-events-none z-10">
            {isEditing ? (
              <span className="rounded-full bg-amber-500 text-slate-900 px-3.5 py-1 text-xs font-subtitle font-black uppercase tracking-wider shadow-lg">
                ✏️ Editando Atractivo
              </span>
            ) : (
              <>
                <span className="rounded-full bg-[#D81B60] text-white px-3.5 py-1 text-xs font-subtitle font-black uppercase tracking-wider shadow-lg">
                  {place.tag || place.category}
                </span>
                {place.featured && (
                  <span className="rounded-full bg-[#F7931E] text-white px-3 py-1 text-xs font-subtitle font-black shadow-lg flex items-center gap-1">
                    ⭐ Destacado
                  </span>
                )}
                {place.badges && place.badges.map((b, idx) => (
                  <span key={idx} className="rounded-full bg-[#7C3AED] text-white px-3 py-1 text-xs font-subtitle font-black shadow-lg">
                    {b}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Quick Zoom Lens Button (Muy Visible) */}
          <button
            type="button"
            onClick={() => onOpenZoomModal(place)}
            className="absolute left-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-[#1E293B]/90 backdrop-blur-md px-4 py-2 font-subtitle text-xs font-black text-white shadow-xl border border-white/30 hover:bg-[#D81B60] hover:scale-105 transition"
            title="Abrir imagen con visor de aumento interactivo"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#D81B60] text-white text-xs">
              🔍
            </span>
            <span>Ver Lupa / Zoom Pantalla Completa</span>
          </button>

          {/* Header Action Buttons (Siempre accesibles) */}
          <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveInline}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-subtitle text-xs font-black px-4 py-2 shadow-xl transition hover:scale-105 cursor-pointer border border-emerald-400"
                  title="Guardar todos los cambios"
                >
                  <span>💾 Guardar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full bg-slate-800/90 hover:bg-slate-700 text-white font-subtitle text-xs font-bold px-3 py-2 shadow-xl transition cursor-pointer"
                  title="Cancelar cambios"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-subtitle text-xs font-black px-3.5 py-2 shadow-xl transition hover:scale-105 border border-amber-500 cursor-pointer"
                  title="Editar todos los textos, precios y datos de esta ventana"
                >
                  <span>✏️ Editar Todo</span>
                </button>
                {isEffectiveAdmin && onEditPlace && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditPlace(place);
                    }}
                    className="hidden sm:flex items-center gap-1 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white font-subtitle text-[11px] font-bold px-3 py-2 shadow-xl transition border border-slate-700 cursor-pointer"
                    title="Abrir panel avanzado"
                  >
                    <span>⚙️ Avanzado</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => onToggleFavorite(place.title)}
              className={`grid h-10 w-10 place-items-center rounded-full shadow-xl transition backdrop-blur-md ${
                isFavorite ? "bg-[#D81B60] text-white scale-110" : "bg-white/90 text-[#37474F] hover:bg-white"
              }`}
              title="Guardar en favoritos"
            >
              <Icon name="heart" size={20} filled={isFavorite} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/80 text-white transition backdrop-blur-md shadow-xl text-base cursor-pointer"
              title="Cerrar ventana"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            /* ── MODO EDICIÓN DIRECTO EN PANTALLA ── */
            <div className="space-y-5">
              <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-3.5 text-xs text-amber-900 font-bold flex items-center justify-between">
                <span>✏️ Estás editando este destino. Modifica lo que gustes y haz clic en "Guardar Cambios".</span>
                <button
                  type="button"
                  onClick={handleSaveInline}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 font-black cursor-pointer shadow-sm"
                >
                  💾 Guardar Ya
                </button>
              </div>

              {/* Título & Metadatos editables */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-subtitle font-bold text-slate-700 mb-1">
                    Título del Atractivo:
                  </label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full font-display text-xl font-black text-[#37474F] border-2 border-[#D81B60] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D81B60]/30"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-subtitle font-bold text-slate-700 mb-1">
                      Zona / Ubicación:
                    </label>
                    <input
                      type="text"
                      value={draftArea}
                      onChange={(e) => setDraftArea(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-subtitle font-bold text-slate-700 mb-1">
                      Puntuación (★):
                    </label>
                    <input
                      type="text"
                      value={draftRating}
                      onChange={(e) => setDraftRating(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-subtitle font-bold text-slate-700 mb-1">
                      Duración estimada:
                    </label>
                    <input
                      type="text"
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-subtitle font-bold text-slate-700 mb-1">
                    Badges / Etiquetas (separadas por comas):
                  </label>
                  <input
                    type="text"
                    value={draftBadges}
                    onChange={(e) => setDraftBadges(e.target.value)}
                    placeholder="IMPERDIBLE, Destacado, Aventura..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>

              {/* ¿Qué ver y experimentar aquí? Editable */}
              <div className="rounded-2xl bg-[#FAF7F2] border-2 border-[#E2D9CC] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-subtitle text-xs font-black text-[#37474F] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-[#D81B60]">✦</span> ¿Qué ver y experimentar aquí? (Viñetas)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDraftHighlights([...draftHighlights, "Nueva experiencia..."])}
                    className="rounded-lg bg-[#D81B60] text-white px-2.5 py-1 text-[11px] font-bold hover:bg-[#b0144c] cursor-pointer"
                  >
                    + Añadir Viñeta
                  </button>
                </div>
                <div className="space-y-2">
                  {draftHighlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[#D81B60] font-black">✔</span>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const updated = [...draftHighlights];
                          updated[i] = e.target.value;
                          setDraftHighlights(updated);
                        }}
                        className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:border-[#D81B60] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setDraftHighlights(draftHighlights.filter((_, idx) => idx !== i))}
                        className="grid h-6 w-6 place-items-center rounded bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold cursor-pointer"
                        title="Eliminar esta viñeta"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horarios & Precios Editables */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] p-4 space-y-1.5">
                  <label className="font-subtitle font-black text-[#B45309] uppercase tracking-wider block">
                    📅 Horarios de Visita
                  </label>
                  <textarea
                    rows={2}
                    value={draftSchedule}
                    onChange={(e) => setDraftSchedule(e.target.value)}
                    className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white text-[#78350F] focus:outline-none"
                  />
                </div>
                <div className="rounded-2xl bg-[#F0FDF4] border-2 border-[#BBF7D0] p-4 space-y-1.5">
                  <label className="font-subtitle font-black text-[#15803D] uppercase tracking-wider block">
                    🎟️ Precios / Ingreso
                  </label>
                  <textarea
                    rows={2}
                    value={draftPrecioDetalle}
                    onChange={(e) => setDraftPrecioDetalle(e.target.value)}
                    className="w-full text-xs border border-emerald-300 rounded-lg p-2 bg-white text-[#14532D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tip & Curious Fact Editables */}
              <div className="space-y-3 text-xs">
                <div className="rounded-2xl bg-[#FFF1F2] border-2 border-[#FECDD3] p-4 space-y-1.5">
                  <label className="font-subtitle font-bold text-[#BE123C] block">
                    💡 Consejo para Viajeros:
                  </label>
                  <textarea
                    rows={2}
                    value={draftInsiderTip}
                    onChange={(e) => setDraftInsiderTip(e.target.value)}
                    className="w-full text-xs border border-rose-300 rounded-lg p-2 bg-white text-[#9F1239] focus:outline-none"
                  />
                </div>

                <div className="rounded-2xl bg-[#EFF6FF] border-2 border-[#BFDBFE] p-4 space-y-1.5">
                  <label className="font-subtitle font-bold text-[#1D4ED8] block">
                    📜 Dato Histórico / Curioso:
                  </label>
                  <textarea
                    rows={2}
                    value={draftCuriousFact}
                    onChange={(e) => setDraftCuriousFact(e.target.value)}
                    className="w-full text-xs border border-blue-300 rounded-lg p-2 bg-white text-[#1E40AF] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── MODO VISTA NORMAL ── */
            <>
              {/* Title & Metadata */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#6D4C41] mb-1">
                  <span className="flex items-center gap-1">
                    <Icon name="pin" size={15} /> {place.area}
                  </span>
                  <span className="flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                    ★ {place.rating} Excelente
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#37474F]">
                  {place.title}
                </h2>
                <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-[#6D4C41]">
                  <span className="flex items-center gap-1">
                    <Icon name="clock" size={15} /> Duración estimada: {place.time}
                  </span>
                  <span className="flex items-center gap-1 text-[#4CAF50] font-bold">
                    ✓ Experiencia verificada
                  </span>
                </div>
              </div>

              {/* Qué ver y experimentar aquí */}
              <div className="rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] p-4 sm:p-5">
                <h3 className="font-subtitle text-sm font-black text-[#37474F] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-[#D81B60]">✦</span> ¿Qué ver y experimentar aquí?
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#37474F]">
                  {initialHighlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#D81B60] font-black mt-0.5">✔</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Horarios & Precios */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4">
                  <div className="font-subtitle font-black text-[#B45309] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Icon name="calendar" size={14} /> Horarios de Visita
                  </div>
                  <p className="text-[#78350F] font-medium leading-relaxed">
                    {initialSchedule}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] p-4">
                  <div className="font-subtitle font-black text-[#15803D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Icon name="ticket" size={14} /> Precios / Ingreso
                  </div>
                  <p className="text-[#14532D] font-medium leading-relaxed">
                    {initialPriceEstimate}
                  </p>
                </div>
              </div>

              {/* Insider Tip & Curious Fact */}
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] p-4 text-xs">
                  <p className="font-subtitle font-bold text-[#BE123C] mb-1 flex items-center gap-1.5">
                    <span>💡</span> Consejo para Viajeros:
                  </p>
                  <p className="text-[#9F1239] leading-relaxed">
                    {initialInsiderTip}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 text-xs">
                  <p className="font-subtitle font-bold text-[#1D4ED8] mb-1 flex items-center gap-1.5">
                    <span>📜</span> Dato Histórico / Curioso:
                  </p>
                  <p className="text-[#1E40AF] leading-relaxed">
                    {initialCuriousFact}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer CTAs (Booking-Style) */}
        <div className="p-4 sm:p-5 border-t border-[#E8E3D8] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-[#6D4C41] block">Tarifa por persona</span>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#D81B60]">Bs.</span>
                  <input
                    type="number"
                    step="any"
                    value={draftPrecio}
                    onChange={(e) => {
                      setDraftPrecio(e.target.value);
                      if (e.target.value) {
                        setDraftPrecioUsd((parseFloat(e.target.value) / 6.96).toFixed(2));
                      }
                    }}
                    className="w-20 rounded-lg border border-slate-300 p-1 text-sm font-bold bg-white text-[#D81B60]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-500">$</span>
                  <input
                    type="number"
                    step="any"
                    value={draftPrecioUsd}
                    onChange={(e) => setDraftPrecioUsd(e.target.value)}
                    className="w-20 rounded-lg border border-slate-300 p-1 text-sm font-bold bg-white text-gray-600"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-black text-[#D81B60]">{displayPriceBob}</span>
                <span className="text-xs text-gray-500 font-medium">{displayPriceUsd}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-3 font-subtitle text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveInline}
                  className="flex-1 sm:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 font-subtitle text-xs font-black shadow-lg shadow-emerald-600/30 transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💾 Guardar Cambios</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none rounded-xl border-2 border-amber-500 bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-3 font-subtitle text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
                  title="Editar todos los campos de este destino directamente"
                >
                  <span>✏️ Editar Todo</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenZoomModal(place)}
                  className="flex-1 sm:flex-none rounded-xl border border-[#D81B60] bg-white text-[#D81B60] hover:bg-[#FFF1F2] px-4 py-3 font-subtitle text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🔍 Foto con Lupa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBookingPayment(place);
                  }}
                  className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-[#D81B60] to-[#b0144c] hover:from-[#c21453] hover:to-[#96103f] text-white px-6 py-3 font-subtitle text-xs font-black shadow-lg shadow-[#D81B60]/30 transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💳 Reservar y Pagar</span>
                  <span>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
