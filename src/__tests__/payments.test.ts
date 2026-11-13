/**
 * Vitest unit tests — payment calculation logic (mirrors PaymentService in Flask)
 * Tests tariffs, coupons, and idempotency store (pure TS, no network).
 */
import { describe, it, expect, beforeEach } from 'vitest'

// ─── Payment logic (mirrors flask-crud/services/payment_service.py) ───────────
const TARIFAS: Record<string, number> = {
  basico: 50,
  estandar: 120,
  premium: 250,
  vip: 500,
}

const CUPONES: Record<string, number> = {
  COCHABAMBA2026: 0.20,
  RIQSI10: 0.10,
  BIENVENIDO: 0.15,
}

interface CheckoutInput {
  tipo_reserva: string
  personas: number
  cupon?: string
  idempotency_key?: string
}

interface CheckoutResult {
  precio_unitario: number
  subtotal: number
  descuento: number
  total: number
  moneda: string
  cupon_aplicado: string | null
}

const idempotencyStore: Map<string, CheckoutResult> = new Map()

function calcularCheckout(input: CheckoutInput): CheckoutResult {
  if (input.idempotency_key && idempotencyStore.has(input.idempotency_key)) {
    return idempotencyStore.get(input.idempotency_key)!
  }

  const precioUnitario = TARIFAS[input.tipo_reserva]
  if (!precioUnitario) throw new Error(`Tipo de reserva inválido: ${input.tipo_reserva}`)

  const personas = Math.max(1, Math.min(input.personas, 20))
  const subtotal = precioUnitario * personas
  const descuentoRate = input.cupon ? (CUPONES[input.cupon] ?? 0) : 0
  const descuento = subtotal * descuentoRate
  const total = subtotal - descuento

  const result: CheckoutResult = {
    precio_unitario: precioUnitario,
    subtotal,
    descuento,
    total,
    moneda: 'BOB',
    cupon_aplicado: descuentoRate > 0 ? input.cupon! : null,
  }

  if (input.idempotency_key) {
    idempotencyStore.set(input.idempotency_key, result)
  }
  return result
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('PaymentService — cálculo de precios', () => {
  beforeEach(() => {
    idempotencyStore.clear()
  })

  it('calcula tarifa basica para 1 persona sin cupón', () => {
    const r = calcularCheckout({ tipo_reserva: 'basico', personas: 1 })
    expect(r.precio_unitario).toBe(50)
    expect(r.subtotal).toBe(50)
    expect(r.descuento).toBe(0)
    expect(r.total).toBe(50)
    expect(r.moneda).toBe('BOB')
  })

  it('aplica cupón COCHABAMBA2026 (20% descuento)', () => {
    const r = calcularCheckout({ tipo_reserva: 'estandar', personas: 2, cupon: 'COCHABAMBA2026' })
    expect(r.subtotal).toBe(240)
    expect(r.descuento).toBe(48)
    expect(r.total).toBe(192)
    expect(r.cupon_aplicado).toBe('COCHABAMBA2026')
  })

  it('aplica cupón RIQSI10 (10% descuento)', () => {
    const r = calcularCheckout({ tipo_reserva: 'premium', personas: 1, cupon: 'RIQSI10' })
    expect(r.descuento).toBe(25)
    expect(r.total).toBe(225)
  })

  it('ignora cupón inválido y no aplica descuento', () => {
    const r = calcularCheckout({ tipo_reserva: 'basico', personas: 3, cupon: 'FAKE99' })
    expect(r.descuento).toBe(0)
    expect(r.cupon_aplicado).toBeNull()
  })

  it('lanza error para tipo_reserva inexistente', () => {
    expect(() => calcularCheckout({ tipo_reserva: 'ultralujo', personas: 1 })).toThrow(
      'Tipo de reserva inválido: ultralujo',
    )
  })

  it('idempotencia: misma clave devuelve mismo resultado sin recalcular', () => {
    const key = 'idem-key-abc123'
    const r1 = calcularCheckout({ tipo_reserva: 'vip', personas: 2, idempotency_key: key })
    // Segunda llamada con datos distintos pero misma clave → devuelve r1
    const r2 = calcularCheckout({ tipo_reserva: 'basico', personas: 99, idempotency_key: key })
    expect(r2).toEqual(r1)
    expect(r2.total).toBe(1000) // 500*2
  })

  it('limita personas a máximo 20', () => {
    const r = calcularCheckout({ tipo_reserva: 'basico', personas: 50 })
    expect(r.subtotal).toBe(50 * 20)
  })
})

