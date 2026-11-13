/**
 * Vitest unit tests — Image Optimizer (WebP conversion, CDN query parameters, responsive srcSet)
 */
import { describe, it, expect } from 'vitest'
import { getOptimizedImageUrl, generateSrcSet } from '@/utils/imageOptimizer'

describe('Image Optimizer — CDN & WebP', () => {
  it('retorna fallback cuando la url es null o vacía', () => {
    expect(getOptimizedImageUrl(null)).toBe('/gato-explorador.png')
    expect(getOptimizedImageUrl('')).toBe('/gato-explorador.png')
  })

  it('no altera imágenes vectoriales SVG ni data URIs', () => {
    const svg = 'https://example.com/icon.svg'
    expect(getOptimizedImageUrl(svg)).toBe(svg)

    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE'
    expect(getOptimizedImageUrl(dataUri)).toBe(dataUri)
  })

  it('optimiza URLs de Unsplash con WebP, ancho y calidad', () => {
    const unsplash = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
    const optimized = getOptimizedImageUrl(unsplash, { width: 600, quality: 75, format: 'webp' })

    expect(optimized).toContain('fm=webp')
    expect(optimized).toContain('w=600')
    expect(optimized).toContain('q=75')
    expect(optimized).toContain('auto=format')
  })

  it('optimiza URLs de Supabase Storage usando render endpoint', () => {
    const supabaseUrl = 'https://xyz.supabase.co/storage/v1/object/public/places/cristo.jpg'
    const optimized = getOptimizedImageUrl(supabaseUrl, { width: 1000, quality: 85 })

    expect(optimized).toContain('/storage/v1/render/image/public/places/cristo.jpg')
    expect(optimized).toContain('width=1000')
    expect(optimized).toContain('quality=85')
    expect(optimized).toContain('format=webp')
  })

  it('genera srcSet responsivo con diferentes anchos', () => {
    const unsplash = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
    const srcSet = generateSrcSet(unsplash, [400, 800])

    expect(srcSet).toContain('w=400')
    expect(srcSet).toContain('400w')
    expect(srcSet).toContain('w=800')
    expect(srcSet).toContain('800w')
  })
})
