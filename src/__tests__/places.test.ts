/**
 * Vitest unit tests — Client-side search, filtering, and Optimistic Concurrency Control (OCC)
 */
import { describe, it, expect } from 'vitest'

interface Place {
  id: string
  title: string
  category: string
  version: number
}

// ─── Filter & Search Pure Function ───────────────────────────────────────────
function filterPlaces(places: Place[], query: string, category: string): Place[] {
  let result = places
  if (category && category !== 'todos') {
    result = result.filter(p => p.category === category)
  }
  const q = query.trim().toLowerCase()
  if (q) {
    result = result.filter(p => p.title.toLowerCase().includes(q))
  }
  return result
}

// ─── Optimistic Locking Check ────────────────────────────────────────────────
function applyOptimisticUpdate(
  current: Place,
  update: Partial<Place> & { version: number },
): { ok: boolean; place?: Place; error?: string } {
  if (update.version < current.version) {
    return {
      ok: false,
      error: `Conflict: Version mismatch. Current is ${current.version}, received ${update.version}`,
    }
  }
  return {
    ok: true,
    place: {
      ...current,
      ...update,
      version: current.version + 1,
    },
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('Places — Búsqueda, Filtrado y Concurrencia Optimista', () => {
  const MOCK_PLACES: Place[] = [
    { id: '1', title: 'Cristo de la Concordia', category: 'cultura', version: 1 },
    { id: '2', title: 'Parque Nacional Tunari', category: 'naturaleza', version: 2 },
    { id: '3', title: 'Palacio Portales', category: 'cultura', version: 1 },
    { id: '4', title: 'Mercado La Cancha', category: 'gastronomia', version: 3 },
  ]

  it('filtra por categoría correctamente', () => {
    const cultura = filterPlaces(MOCK_PLACES, '', 'cultura')
    expect(cultura).toHaveLength(2)
    expect(cultura.every(p => p.category === 'cultura')).toBe(true)
  })

  it('busca por texto en el título (case-insensitive)', () => {
    const search = filterPlaces(MOCK_PLACES, 'cancha', 'todos')
    expect(search).toHaveLength(1)
    expect(search[0].title).toBe('Mercado La Cancha')
  })

  it('combina filtro de categoría y búsqueda de texto', () => {
    const combined = filterPlaces(MOCK_PLACES, 'cristo', 'cultura')
    expect(combined).toHaveLength(1)
    expect(combined[0].id).toBe('1')

    const noMatch = filterPlaces(MOCK_PLACES, 'cristo', 'naturaleza')
    expect(noMatch).toHaveLength(0)
  })

  it('concurrencia optimista: actualiza e incrementa versión cuando coincide', () => {
    const current = { id: '1', title: 'Cristo', category: 'cultura', version: 2 }
    const res = applyOptimisticUpdate(current, { title: 'Cristo Editado', version: 2 })
    expect(res.ok).toBe(true)
    expect(res.place?.title).toBe('Cristo Editado')
    expect(res.place?.version).toBe(3)
  })

  it('concurrencia optimista: rechaza con error si la versión del cliente es menor', () => {
    const current = { id: '1', title: 'Cristo', category: 'cultura', version: 5 }
    const res = applyOptimisticUpdate(current, { title: 'Intento pisar', version: 3 })
    expect(res.ok).toBe(false)
    expect(res.error).toContain('Conflict: Version mismatch')
  })
})
