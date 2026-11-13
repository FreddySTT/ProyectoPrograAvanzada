// Setup file for Vitest — Node environment polyfills
import { vi } from 'vitest'

class LocalStorageMock {
  private store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index: number) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

const mockStorage = new LocalStorageMock()

if (typeof globalThis.window === 'undefined') {
  // @ts-expect-error polyfill for node test environment
  globalThis.window = globalThis
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
})

if (typeof globalThis.window !== 'undefined') {
  Object.defineProperty(globalThis.window, 'localStorage', {
    value: mockStorage,
    writable: true,
  })
}

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock Firebase
vi.mock('@/firebase/config', () => ({
  db: {},
  storage: {},
  auth: {},
  analytics: null,
  trackFirebaseEvent: vi.fn(),
}))

vi.mock('@/firebase/services', () => ({
  firebaseUploadImage: vi.fn().mockResolvedValue('https://cdn.example.com/img.webp'),
  firebaseSaveBooking: vi.fn().mockResolvedValue({ id: 'test-booking-id' }),
  firebaseGetBookings: vi.fn().mockResolvedValue([]),
  firebaseLoginAnonymous: vi.fn().mockResolvedValue({ uid: 'anon-uid' }),
}))

vi.mock('@/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
  },
}))
