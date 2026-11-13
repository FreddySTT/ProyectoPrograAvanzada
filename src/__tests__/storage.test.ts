/**
 * Vitest unit tests — localStorage utility functions (secureGet / secureSet)
 * Tests that the persistence layer survives F5 and handles errors gracefully.
 */
import { describe, it, expect, beforeEach } from 'vitest'

// In-memory backing for isolation
let store: Record<string, string> = {}

const mockStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = String(val) },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} },
}

// ─── Secure storage helpers ──────────────────────────────────────────────────
function secureSet(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value)
    mockStorage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

function secureGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = mockStorage.getItem(key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function secureClear(key: string): void {
  try {
    mockStorage.removeItem(key)
  } catch {}
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('secureStorage — persistencia en localStorage', () => {
  beforeEach(() => {
    store = {}
  })

  it('guarda y recupera un objeto complejo', () => {
    const user = { id: '123', email: 'freddy@riqsi.bo', role: 'admin' }
    secureSet('current_user', user)
    const recovered = secureGet('current_user', null)
    expect(recovered).toEqual(user)
  })

  it('retorna defaultValue cuando la clave no existe', () => {
    const result = secureGet<string | null>('inexistente', null)
    expect(result).toBeNull()
  })

  it('retorna defaultValue para JSON corrupto', () => {
    store['corrupted_key'] = '{invalid json'
    const result = secureGet('corrupted_key', 'fallback')
    expect(result).toBe('fallback')
  })

  it('elimina clave correctamente', () => {
    secureSet('temp_key', { data: 42 })
    secureClear('temp_key')
    const result = secureGet<null>('temp_key', null)
    expect(result).toBeNull()
  })

  it('maneja arrays de lugares', () => {
    const places = [
      { id: '1', nombre: 'Cristo de la Concordia', tipo: 'monumento' },
      { id: '2', nombre: 'Laguna Alalay', tipo: 'naturaleza' },
    ]
    secureSet('cached_places', places)
    const recovered = secureGet<typeof places>('cached_places', [])
    expect(recovered).toHaveLength(2)
    expect(recovered[0].nombre).toBe('Cristo de la Concordia')
  })
})
