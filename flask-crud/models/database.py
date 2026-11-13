"""
Puente hacia Supabase Cloud DB y almacenamiento persistente en memoria.
"""
import requests
from datetime import datetime

class SupabaseBridge:
    """Gateway hacia las APIs REST de Supabase con fallback tolerante a fallos."""

    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.is_configured = bool(url and key and "supabase.co" in url)

    def _headers(self):
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def fetch_places(self):
        if not self.is_configured:
            return None
        try:
            resp = requests.get(
                f"{self.url}/rest/v1/places?select=*&order=created_at.desc",
                headers=self._headers(),
                timeout=6,
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            print(f"[SupabaseBridge] Error fetching places: {e}")
        return None

    def create_place(self, data: dict):
        if not self.is_configured:
            return None
        try:
            resp = requests.post(
                f"{self.url}/rest/v1/places",
                headers=self._headers(),
                json=data,
                timeout=6,
            )
            if resp.status_code in (200, 201):
                res = resp.json()
                return res[0] if isinstance(res, list) and res else res
        except Exception as e:
            print(f"[SupabaseBridge] Error creating place: {e}")
        return None

    def update_place(self, place_id: str, data: dict):
        if not self.is_configured:
            return None
        try:
            payload = {k: v for k, v in data.items() if k != "id"}
            payload["updated_at"] = datetime.utcnow().isoformat() + "Z"
            resp = requests.patch(
                f"{self.url}/rest/v1/places?id=eq.{place_id}",
                headers=self._headers(),
                json=payload,
                timeout=6,
            )
            if resp.status_code in (200, 204):
                try:
                    res = resp.json()
                    return res[0] if isinstance(res, list) and res else res
                except Exception:
                    return {"id": place_id, **data}
        except Exception as e:
            print(f"[SupabaseBridge] Error updating place: {e}")
        return None

    def delete_place(self, place_id: str):
        if not self.is_configured:
            return None
        try:
            resp = requests.delete(
                f"{self.url}/rest/v1/places?id=eq.{place_id}",
                headers=self._headers(),
                timeout=6,
            )
            return resp.status_code in (200, 204)
        except Exception as e:
            print(f"[SupabaseBridge] Error deleting place: {e}")
        return False

    def save_booking(self, booking_data: dict):
        if not self.is_configured:
            return None
        try:
            resp = requests.post(
                f"{self.url}/rest/v1/bookings",
                headers=self._headers(),
                json=booking_data,
                timeout=6,
            )
            if resp.status_code in (200, 201):
                return resp.json()
        except Exception as e:
            print(f"[SupabaseBridge] Error saving booking: {e}")
        return None


# ─── Colección de Destinos en Memoria (Fallback de Alta Disponibilidad) ───────
PLACES_FALLBACK = {
    "place-1": {
        "id": "place-1",
        "title": "Cristo de la Concordia",
        "area": "Cerro San Pedro",
        "tag": "Imperdible",
        "category": "cultura",
        "image": "/assets/cochabamba-hero.jpg",
        "rating": "4.8",
        "time": "2–3 h",
        "featured": True,
        "visible": True,
        "coordinates": [-66.13495, -17.38431],
        "precio": 85.0,
        "precio_usd": 12.20,
        "precio_detalle": "Teleférico: Bs. 10 ida y vuelta · Entrada al Cristo: Gratuita (Bs. 2 para subir al mirador interno)",
        "horario_visita": "Martes a Domingo de 08:30 a 19:00 (Teleférico operativo)",
        "descripcion_items": [
            "El Cristo más alto de América del Sur (34.20 m de escultura + 6.24 m de pedestal).",
            "Teleférico panorámico desde el Parque de la Autonomía con vista al cerro San Pedro.",
            "Mirador de 360° para contemplar toda la ciudad de Cochabamba, la laguna Alalay y la cordillera.",
            "Escalera interna para subir hasta el pecho y los brazos de la estatua.",
        ],
        "consejo": "Sube cerca de las 17:30 para presenciar el atardecer sobre el valle y ver cómo se encienden las luces de la ciudad.",
        "dato_historico": "Supera por centenas de centímetros al famoso Cristo Redentor de Río de Janeiro (30 m).",
        "badges": ["IMPERDIBLE", "Destacado"],
        "created_at": "2026-10-23T10:25:20.837126+00:00",
        "updated_at": "2026-10-23T10:25:20.837126+00:00",
    },
    "place-2": {
        "id": "place-2",
        "title": "Palacio Portales",
        "area": "Queru Queru",
        "tag": "Cultura",
        "category": "cultura",
        "image": "/assets/patrimonio.jpg",
        "rating": "4.7",
        "time": "1–2 h",
        "featured": False,
        "visible": True,
        "coordinates": [-66.15339, -17.37492],
        "precio": 20.0,
        "precio_usd": 2.87,
        "precio_detalle": "Nacionales: Bs. 20 · Estudiantes: Bs. 10 · Extranjeros: Bs. 30",
        "horario_visita": "Martes a Domingo: 15:00 a 18:30 (Visitas guiadas cada 30 min)",
        "descripcion_items": [
            "Palacete de estilo ecléctico francés diseñado por Eugène Bliault para Simón I. Patiño.",
            "Jardines versallescos con fuentes de mármol de Carrara italiano, estanques y cipreses centenarios.",
            "Salas interiores con tapices flamencos y lámparas de cristal de Baccarat.",
            "Centro pedagógico y cultural con la biblioteca más rica de la región.",
        ],
        "consejo": "Pide visitar el mirador del piso superior y el laberinto botánico del jardín japonés.",
        "dato_historico": "Patiño gastó una fortuna en su construcción pero jamás llegó a habitarlo.",
        "badges": ["Cultura"],
        "created_at": "2026-10-23T10:25:20.837126+00:00",
        "updated_at": "2026-10-23T10:25:20.837126+00:00",
    },
    "place-3": {
        "id": "place-3",
        "title": "Parque Nacional Tunari",
        "area": "Cordillera",
        "tag": "Naturaleza",
        "category": "naturaleza",
        "image": "/assets/tunari.jpg",
        "rating": "4.9",
        "time": "Día completo",
        "featured": True,
        "visible": True,
        "coordinates": [-66.3208, -17.2301],
        "precio": 0.0,
        "precio_usd": 0.0,
        "precio_detalle": "Entrada al parque: Gratuita · Tours de montaña con transporte: Bs. 120 - 180",
        "horario_visita": "Abierto todos los días de 06:00 a 18:00 (Recomendado con guía certificado)",
        "descripcion_items": [
            "El pico más alto de la cordillera central de Bolivia (Cumbre Tunari a 5,035 msnm).",
            "Bosques ancestrales de queñuas (Polylepis besseri).",
            "Lagunas glaciares de altura color turquesa (Laguna Toro, San Jerónimo y San Juan).",
            "Santuario de cóndores andinos y vizcachas de altura.",
        ],
        "consejo": "Lleva ropa térmica en capas, bloqueador solar y hojas de coca o caramelos para la aclimatación.",
        "dato_historico": "Considerado un Apu sagrado que protege las lluvias de todo el valle.",
        "badges": ["Naturaleza", "Destacado"],
        "created_at": "2026-10-23T10:25:20.837126+00:00",
        "updated_at": "2026-10-23T10:25:20.837126+00:00",
    },
}
