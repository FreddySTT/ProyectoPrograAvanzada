"""
Blueprint para Inteligencia Artificial y Recomendación de Rutas (Firebase AI Logic / Gemini API).
Proporciona recomendaciones personalizadas para turistas basadas en presupuesto, tiempo y preferencias.
"""
import os
import json
import urllib.request
import urllib.error
from flask import Blueprint, request, jsonify, current_app
from models.database import PLACES_FALLBACK
from core.errors import make_problem_response

ai_bp = Blueprint("ai_bp", __name__, url_prefix="/api/ai")

def generar_recomendacion_heuristica(presupuesto: float, horas: float, preferencia: str) -> dict:
    """Motor de IA heurístico de alta fidelidad para Cochabamba (fallback si no hay API Key de Gemini externa)."""
    lugares = list(PLACES_FALLBACK.values())
    
    # Filtrar o priorizar según preferencia
    pref_clean = preferencia.lower().strip()
    if pref_clean in ("gastronomia", "comida", "sabores"):
        prioridad = [p for p in lugares if p.get("category") == "gastronomia"]
        secundarios = [p for p in lugares if p.get("category") != "gastronomia"]
    elif pref_clean in ("cultura", "historia", "patrimonio"):
        prioridad = [p for p in lugares if p.get("category") in ("cultura", "tradicion")]
        secundarios = [p for p in lugares if p.get("category") not in ("cultura", "tradicion")]
    elif pref_clean in ("aventura", "naturaleza", "paisajes"):
        prioridad = [p for p in lugares if p.get("category") in ("aventura", "naturaleza")]
        secundarios = [p for p in lugares if p.get("category") not in ("aventura", "naturaleza")]
    else:
        prioridad = [p for p in lugares if p.get("featured")]
        secundarios = [p for p in lugares if not p.get("featured")]

    candidatos = prioridad + secundarios
    seleccionados = []
    costo_acumulado = 0.0
    tiempo_acumulado = 0.0

    for p in candidatos:
        # Extraer costo aproximado
        costo_p = float(p.get("precio") or (25.0 if p.get("category") == "gastronomia" else 15.0))
        # Estimar horas
        time_str = str(p.get("time", "2 h"))
        horas_p = 4.0 if "día" in time_str or "dia" in time_str else (1.5 if "1" in time_str else 2.5)

        if len(seleccionados) < 3:
            if (costo_acumulado + costo_p <= max(presupuesto, 50.0)) or len(seleccionados) == 0:
                seleccionados.append(p)
                costo_acumulado += costo_p
                tiempo_acumulado += horas_p

    consejo_ia = (
        f"Para tu tiempo de {horas} horas y presupuesto de Bs. {presupuesto}, te recomendamos iniciar en "
        f"{seleccionados[0]['title']} aprovechando la mañana. No olvides probar un helado de canela o un silpancho cochabambino "
        "y llevar efectivo para el teleférico o transporte público."
    )

    return {
        "itinerario": [
            {
                "id": p["id"],
                "titulo": p["title"],
                "area": p["area"],
                "categoria": p["category"],
                "tiempo_sugerido": p["time"],
                "costo_estimado_bs": float(p.get("precio") or 20.0),
                "consejo_experto": p.get("consejo") or "Lleva cámara y calzado cómodo para caminar."
            }
            for p in seleccionados
        ],
        "resumen": {
            "total_destinos": len(seleccionados),
            "costo_total_bs": round(costo_acumulado, 2),
            "tiempo_total_estimado_horas": round(tiempo_acumulado, 1),
            "dentro_de_presupuesto": costo_acumulado <= presupuesto if presupuesto > 0 else True,
        },
        "analisis_ia": consejo_ia,
        "motor": "Riqsi-Gemini-Heuristic-v2"
    }

@ai_bp.route("/recommend-route", methods=["POST"])
def recomendar_ruta():
    """Genera recomendaciones inteligentes de itinerarios turísticos en la Llajta."""
    data = request.get_json(silent=True) or {}
    presupuesto = float(data.get("budget") or data.get("presupuesto") or 100.0)
    horas = float(data.get("hours") or data.get("horas") or 4.0)
    preferencia = str(data.get("preference") or data.get("preferencia") or "todas")

    gemini_key = os.environ.get("GEMINI_API_KEY", "")

    # Si hay clave de Gemini API configurada, intentar generar respuesta multimodal/LLM
    if gemini_key:
        try:
            prompt = (
                f"Actúa como guía turístico experto de Cochabamba, Bolivia. "
                f"Genera una recomendación de ruta para un turista con presupuesto de {presupuesto} Bolivianos, "
                f"{horas} horas de tiempo disponible y preferencia por '{preferencia}'. "
                f"Destinos disponibles en la app: {[p['title'] for p in PLACES_FALLBACK.values()]}. "
                f"Responde estrictamente en formato JSON con llaves: analisis_ia (texto breve y cálido cochabambino), "
                f"destinos_sugeridos (lista de nombres) y consejos_clave (lista de strings)."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as response:
                result = json.loads(response.read().decode("utf-8"))
                text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                # Limpiar backticks de markdown
                clean_json = text.replace("```json", "").replace("```", "").strip()
                parsed_gemini = json.loads(clean_json)
                return jsonify({
                    "ok": True,
                    "origen": "google-gemini-cloud",
                    "data": parsed_gemini
                })
        except Exception as e:
            # Fallback seguro al motor local
            pass

    resultado = generar_recomendacion_heuristica(presupuesto, horas, preferencia)
    return jsonify({
        "ok": True,
        "origen": "riqsi-ai-logic-local",
        "data": resultado
    })
