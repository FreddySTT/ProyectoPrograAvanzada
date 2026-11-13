"""
Grafo Ponderado y Algoritmo de Dijkstra para Optimización de Rutas en Cochabamba.
"""
import heapq

class GrafoRutasDijkstra:
    """Implementa el algoritmo de Dijkstra para calcular la ruta óptima entre POIs turísticos."""

    def __init__(self):
        # Nodos turísticos de Cochabamba con coordenadas aproximadas y metadatos
        self.nodos = {
            "cristo": {"nombre": "Cristo de la Concordia", "area": "Cerro San Pedro", "tipo": "Cultura"},
            "plaza_principal": {"nombre": "Plaza 14 de Septiembre", "area": "Casco Viejo", "tipo": "Centro Histórico"},
            "palacio_portales": {"nombre": "Palacio Portales (Patiño)", "area": "Queru Queru", "tipo": "Patrimonio"},
            "la_coronilla": {"nombre": "Colina de San Sebastián (La Coronilla)", "area": "Zona Sur", "tipo": "Histórico"},
            "laguna_alalay": {"nombre": "Circuito Laguna Alalay", "area": "Sureste", "tipo": "Naturaleza"},
            "parque_tunari": {"nombre": "Parque Nacional Tunari", "area": "Norte Cordillera", "tipo": "Aventura"},
            "parque_familia": {"nombre": "Parque de la Familia (Aguas Danzantes)", "area": "Zona Central", "tipo": "Recreación"},
            "el_prado": {"nombre": "Paseo El Prado & Gastronomía", "area": "Centro", "tipo": "Gastronomía"},
        }

        # Aristas ponderadas: origen -> destino (distancia_km, tiempo_minutos)
        self.aristas = {
            "cristo": [("plaza_principal", 4.5, 15), ("el_prado", 4.0, 12), ("laguna_alalay", 6.2, 20)],
            "plaza_principal": [("cristo", 4.5, 15), ("el_prado", 1.2, 5), ("la_coronilla", 1.8, 8), ("parque_familia", 1.5, 6)],
            "palacio_portales": [("el_prado", 2.2, 8), ("parque_tunari", 9.5, 25), ("plaza_principal", 3.0, 12)],
            "la_coronilla": [("plaza_principal", 1.8, 8), ("laguna_alalay", 4.0, 14)],
            "laguna_alalay": [("la_coronilla", 4.0, 14), ("cristo", 6.2, 20), ("plaza_principal", 4.8, 16)],
            "parque_tunari": [("palacio_portales", 9.5, 25), ("el_prado", 11.0, 30)],
            "parque_familia": [("plaza_principal", 1.5, 6), ("el_prado", 1.0, 4)],
            "el_prado": [("plaza_principal", 1.2, 5), ("cristo", 4.0, 12), ("palacio_portales", 2.2, 8), ("parque_familia", 1.0, 4)],
        }

    def calcular_ruta_optima(self, origen_id: str, destino_id: str, optimizar_por: str = "distancia"):
        """Calcula el trayecto más corto/rápido usando cola de prioridad min-heap."""
        if origen_id not in self.nodos or destino_id not in self.nodos:
            return None

        # Min-heap: (costo_acumulado, nodo_actual, ruta_recorrida)
        cola = [(0, origen_id, [origen_id])]
        visitados = set()

        while cola:
            costo, actual, ruta = heapq.heappop(cola)

            if actual == destino_id:
                # Calcular desglose paso a paso
                pasos = []
                total_km = 0
                total_min = 0

                for i in range(len(ruta) - 1):
                    u, v = ruta[i], ruta[i + 1]
                    for vecino, dist, tiempo in self.aristas.get(u, []):
                        if vecino == v:
                            pasos.append({
                                "desde": self.nodos[u]["nombre"],
                                "hacia": self.nodos[v]["nombre"],
                                "distancia_km": dist,
                                "tiempo_min": tiempo,
                            })
                            total_km += dist
                            total_min += tiempo
                            break

                return {
                    "ok": True,
                    "origen": self.nodos[origen_id],
                    "destino": self.nodos[destino_id],
                    "ruta_nodos": [self.nodos[nid]["nombre"] for nid in ruta],
                    "ruta_ids": ruta,
                    "distancia_total_km": round(total_km, 2),
                    "tiempo_estimado_min": total_min,
                    "pasos": pasos,
                    "algoritmo": "Dijkstra (Tiempo Real)",
                }

            if actual in visitados:
                continue
            visitados.add(actual)

            for vecino, dist, tiempo in self.aristas.get(actual, []):
                if vecino not in visitados:
                    peso = dist if optimizar_por == "distancia" else tiempo
                    heapq.heappush(cola, (costo + peso, vecino, ruta + [vecino]))

        return None
