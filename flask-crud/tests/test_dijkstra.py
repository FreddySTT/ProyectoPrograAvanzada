"""
Pruebas Unitarias para el Algoritmo Dijkstra de Optimización de Rutas Turísticas.
"""
from core.dijkstra import GrafoRutasDijkstra

def test_dijkstra_ruta_existente():
    grafo = GrafoRutasDijkstra()
    res = grafo.calcular_ruta_optima("plaza_principal", "cristo", optimizar_por="distancia")

    assert res is not None
    assert res["ok"] is True
    assert res["distancia_total_km"] > 0
    assert "Cristo de la Concordia" in res["ruta_nodos"]
    assert "Plaza 14 de Septiembre" in res["ruta_nodos"]
    assert len(res["pasos"]) >= 1

def test_dijkstra_optimizacion_tiempo():
    grafo = GrafoRutasDijkstra()
    res = grafo.calcular_ruta_optima("plaza_principal", "parque_tunari", optimizar_por="tiempo")

    assert res is not None
    assert res["ok"] is True
    assert res["tiempo_estimado_min"] > 0
    assert res["algoritmo"] == "Dijkstra (Tiempo Real)"

def test_dijkstra_poi_invalido():
    grafo = GrafoRutasDijkstra()
    res = grafo.calcular_ruta_optima("inexistente_1", "cristo")
    assert res is None

def test_endpoint_dijkstra_api(client):
    resp = client.post("/api/routes/dijkstra", json={
        "origen": "plaza_principal",
        "destino": "el_prado",
        "optimizar_por": "distancia",
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert data["distancia_total_km"] == 1.2
