/**
 * Vitest unit tests — Dijkstra client-side graph algorithm
 * Tests the pure GrafoRutasDijkstra logic (TypeScript mirror of Flask backend).
 */
import { describe, it, expect } from 'vitest'

// ─── Minimal Dijkstra implementation (mirrors flask-crud/core/dijkstra.py) ───
interface NodoGrafo {
  nombre: string
  lat: number
  lng: number
}

interface AristaGrafo {
  destino: string
  distancia_km: number
  tiempo_min: number
}

type GrafoAdj = Record<string, AristaGrafo[]>

function dijkstra(
  grafo: GrafoAdj,
  nodos: Record<string, NodoGrafo>,
  origen: string,
  destino: string,
  optimizar: 'distancia_km' | 'tiempo_min' = 'distancia_km',
): { ruta: string[]; costo: number } | null {
  if (!(origen in grafo) || !(destino in grafo)) return null

  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const visitados = new Set<string>()

  for (const nodo of Object.keys(grafo)) {
    dist[nodo] = Infinity
    prev[nodo] = null
  }
  dist[origen] = 0

  while (true) {
    // Pick unvisited node with smallest dist
    let u: string | null = null
    let menorCosto = Infinity
    for (const nodo of Object.keys(dist)) {
      if (!visitados.has(nodo) && dist[nodo] < menorCosto) {
        menorCosto = dist[nodo]
        u = nodo
      }
    }
    if (u === null || u === destino) break
    visitados.add(u)

    for (const arista of grafo[u] ?? []) {
      const alt = dist[u] + arista[optimizar]
      if (alt < dist[arista.destino]) {
        dist[arista.destino] = alt
        prev[arista.destino] = u
      }
    }
  }

  if (dist[destino] === Infinity) return null

  // Reconstruct path
  const ruta: string[] = []
  let curr: string | null = destino
  while (curr !== null) {
    ruta.unshift(curr)
    curr = prev[curr] ?? null
  }
  return { ruta, costo: dist[destino] }
}

// ─── Shared fixture ───────────────────────────────────────────────────────────
const NODOS: Record<string, NodoGrafo> = {
  cochabamba: { nombre: 'Cochabamba Centro', lat: -17.3895, lng: -66.1568 },
  tiquipaya: { nombre: 'Tiquipaya', lat: -17.3382, lng: -66.2175 },
  quillacollo: { nombre: 'Quillacollo', lat: -17.3938, lng: -66.2822 },
  sipe_sipe: { nombre: 'Sipe Sipe', lat: -17.4573, lng: -66.3473 },
}

const GRAFO: GrafoAdj = {
  cochabamba: [
    { destino: 'tiquipaya', distancia_km: 15, tiempo_min: 25 },
    { destino: 'quillacollo', distancia_km: 20, tiempo_min: 30 },
  ],
  tiquipaya: [
    { destino: 'cochabamba', distancia_km: 15, tiempo_min: 25 },
    { destino: 'quillacollo', distancia_km: 10, tiempo_min: 15 },
  ],
  quillacollo: [
    { destino: 'cochabamba', distancia_km: 20, tiempo_min: 30 },
    { destino: 'tiquipaya', distancia_km: 10, tiempo_min: 15 },
    { destino: 'sipe_sipe', distancia_km: 12, tiempo_min: 20 },
  ],
  sipe_sipe: [
    { destino: 'quillacollo', distancia_km: 12, tiempo_min: 20 },
  ],
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('GrafoRutasDijkstra — distancia mínima', () => {
  it('encuentra la ruta más corta por distancia entre dos nodos directos', () => {
    const result = dijkstra(GRAFO, NODOS, 'cochabamba', 'tiquipaya', 'distancia_km')
    expect(result).not.toBeNull()
    expect(result!.ruta).toEqual(['cochabamba', 'tiquipaya'])
    expect(result!.costo).toBe(15)
  })

  it('prefiere ruta indirecta más corta: cochabamba → sipe_sipe', () => {
    // Directo no existe; debe pasar por tiquipaya o quillacollo
    const result = dijkstra(GRAFO, NODOS, 'cochabamba', 'sipe_sipe', 'distancia_km')
    expect(result).not.toBeNull()
    // Vía tiquipaya→quillacollo: 15+10+12=37; Vía quillacollo: 20+12=32
    expect(result!.costo).toBe(32)
    expect(result!.ruta).toEqual(['cochabamba', 'quillacollo', 'sipe_sipe'])
  })

  it('optimiza por tiempo cuando se indica tiempo_min', () => {
    const result = dijkstra(GRAFO, NODOS, 'cochabamba', 'sipe_sipe', 'tiempo_min')
    expect(result).not.toBeNull()
    // Vía tiquipaya→quillacollo: 25+15+20=60; Vía quillacollo: 30+20=50
    expect(result!.costo).toBe(50)
  })

  it('retorna null para nodo origen inexistente', () => {
    const result = dijkstra(GRAFO, NODOS, 'luna', 'tiquipaya', 'distancia_km')
    expect(result).toBeNull()
  })

  it('retorna null para nodo destino inalcanzable (isla)', () => {
    const grafoIsla: GrafoAdj = {
      ...GRAFO,
      isla: [{ destino: 'isla', distancia_km: 1, tiempo_min: 1 }],
    }
    const result = dijkstra(grafoIsla, NODOS, 'cochabamba', 'isla', 'distancia_km')
    expect(result).toBeNull()
  })
})

