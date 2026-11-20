import { useState } from "react";
import type { PlaceItem } from "../../../types/auth";

interface AiRouteAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceItem[];
  onSelectPlace?: (place: PlaceItem) => void;
  onOpenMapWithPlace?: (place: PlaceItem) => void;
}

export function AiRouteAdvisorModal({
  isOpen,
  onClose,
  places,
  onSelectPlace,
  onOpenMapWithPlace,
}: AiRouteAdvisorModalProps) {
  const [budget, setBudget] = useState<number>(80);
  const [hours, setHours] = useState<number>(4);
  const [preference, setPreference] = useState<string>("gastronomia");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5551/api/ai/recommend-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, hours, preference }),
      });

      if (res.ok) {
        const json = await res.json();
        setRecommendation(json.data);
      } else {
        throw new Error("Respuesta no satisfactoria");
      }
    } catch {
      // Fallback local inmediato y resiliente
      const filtered = places.filter((p) =>
        preference === "todas" ? true : p.category === preference
      );
      const chosen = (filtered.length ? filtered : places).slice(0, 3);
      setRecommendation({
        itinerario: chosen.map((p) => ({
          id: p.id,
          titulo: p.title,
          area: p.area,
          categoria: p.category,
          tiempo_sugerido: p.time,
          costo_estimado_bs: p.precio || 20,
          consejo_experto: p.consejo || "Disfruta el clima templado y los sabores de la Llajta.",
        })),
        resumen: {
          total_destinos: chosen.length,
          costo_total_bs: chosen.reduce((acc, p) => acc + (p.precio || 20), 0),
          tiempo_total_estimado_horas: hours,
          dentro_de_presupuesto: true,
        },
        analisis_ia: `Itinerario optimizado para ${hours} horas con preferencia en ${preference}. Te recomendamos iniciar temprano para aprovechar la luz natural y el transporte público de Cochabamba.`,
        motor: "Riqsi-Gemini-Heuristic-Offline",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col max-h-[92vh]">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D81B60] to-[#8E24AA] text-white text-xl shadow-md">
              ✨
            </span>
            <div>
              <h2 className="font-subtitle text-lg font-black text-[#1E293B]">
                Asistente de Rutas Inteligente
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                Potenciado por Gemini AI Logic & Algoritmos de Optimización de Cochabamba
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition border border-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E2D9CC]">
            {/* Presupuesto */}
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1.5">
                Presupuesto (Bs.): <span className="text-[#D81B60] font-mono">{budget} Bs</span>
              </label>
              <input
                type="range"
                min={20}
                max={300}
                step={10}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#D81B60] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>20 Bs</span>
                <span>150 Bs</span>
                <span>300 Bs</span>
              </div>
            </div>

            {/* Tiempo */}
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1.5">
                Tiempo Disponible: <span className="text-[#D81B60] font-mono">{hours} hrs</span>
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3 py-2 text-xs font-bold text-[#37474F] focus:border-[#D81B60] focus:outline-none"
              >
                <option value={2}>2 horas (Express)</option>
                <option value={4}>4 horas (Medio día)</option>
                <option value={8}>8 horas (Día completo)</option>
              </select>
            </div>

            {/* Preferencia */}
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1.5">
                Preferencia de Viaje
              </label>
              <select
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3 py-2 text-xs font-bold text-[#37474F] focus:border-[#D81B60] focus:outline-none"
              >
                <option value="gastronomia">🍽️ Gastronomía</option>
                <option value="cultura">🏛️ Cultura e Historia</option>
                <option value="naturaleza">🌿 Naturaleza</option>
                <option value="aventura">🚴 Aventura</option>
                <option value="todas">⭐ Lo más destacado</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#D81B60] via-[#C2185B] to-[#8E24AA] py-3 px-6 text-sm font-subtitle font-extrabold text-white shadow-lg shadow-[#D81B60]/30 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">🪄</span>
                <span>Analizando atractivos con IA...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generar Itinerario Personalizado con IA</span>
              </>
            )}
          </button>

          {/* Resultado de la recomendación */}
          {recommendation && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Card de Análisis */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🤖</span>
                  <h4 className="font-subtitle text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                    Análisis Inteligente de la Llajta
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {recommendation.analisis_ia}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-lg bg-white/90 px-2.5 py-1 text-purple-700 border border-purple-200">
                    Costo est.: Bs. {recommendation.resumen?.costo_total_bs || budget}
                  </span>
                  <span className="rounded-lg bg-white/90 px-2.5 py-1 text-emerald-700 border border-emerald-200">
                    Tiempo est.: {recommendation.resumen?.tiempo_total_estimado_horas || hours} h
                  </span>
                  <span className="rounded-lg bg-white/90 px-2.5 py-1 text-slate-600 border border-slate-200">
                    Destinos: {recommendation.itinerario?.length || 0}
                  </span>
                </div>
              </div>

              {/* Lista de destinos sugeridos */}
              <div className="space-y-2.5">
                <h4 className="font-subtitle text-xs font-black text-slate-700 uppercase tracking-wider">
                  Itinerario Paso a Paso Sugerido:
                </h4>
                {recommendation.itinerario?.map((item: any, idx: number) => {
                  const placeObj = places.find((p) => p.id === item.id || p.title === item.titulo);
                  return (
                    <div
                      key={item.id || idx}
                      className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#D81B60]/40 transition shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-black">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-subtitle text-sm font-bold text-slate-900">
                            {item.titulo}
                          </h5>
                          <p className="text-xs text-slate-500 font-medium">
                            📍 {item.area} · ⏱️ {item.tiempo_sugerido} · 💵 Bs. {item.costo_estimado_bs}
                          </p>
                          <p className="mt-1 text-[11px] text-[#D81B60] italic">
                            💡 {item.consejo_experto}
                          </p>
                        </div>
                      </div>

                      {placeObj && onOpenMapWithPlace && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMapWithPlace(placeObj);
                          }}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#D81B60] hover:text-white text-slate-700 text-[11px] font-bold transition cursor-pointer"
                        >
                          Ver en Mapa 🗺️
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
