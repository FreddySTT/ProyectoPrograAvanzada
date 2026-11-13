/**
 * Optimizador de Imágenes WebP & CDN — Riqsi Rutas
 * Transforma URLs de imágenes para servirlas en formato WebP comprimido y optimizado desde CDN.
 */

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
}

/**
 * Optimiza una URL de imagen para CDN (Unsplash, Supabase Storage, Cloudinary, etc.)
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: ImageOptimizationOptions = {},
): string {
  if (!url) return '/gato-explorador.png'

  const { width = 800, quality = 80, format = 'webp' } = options

  // Si es un SVG o data URI, no modificar
  if (url.endsWith('.svg') || url.startsWith('data:')) {
    return url
  }

  try {
    // 1. Optimización para imágenes de Unsplash
    if (url.includes('images.unsplash.com')) {
      const parsed = new URL(url)
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('w', String(width))
      parsed.searchParams.set('q', String(quality))
      parsed.searchParams.set('fm', format)
      return parsed.toString()
    }

    // 2. Optimización para Supabase Storage (soporta render/image transform)
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      const transformUrl = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/',
      )
      const parsed = new URL(transformUrl)
      parsed.searchParams.set('width', String(width))
      parsed.searchParams.set('quality', String(quality))
      parsed.searchParams.set('format', format)
      return parsed.toString()
    }

    // 3. URLs con soporte genérico de CDN (Cloudinary / Cloudflare / Imgix)
    if (url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_${quality},f_${format}/`)
    }

    return url
  } catch {
    return url
  }
}

/**
 * Genera el atributo srcSet para imágenes responsivas en formato WebP
 */
export function generateSrcSet(
  url: string,
  widths: number[] = [400, 800, 1200],
): string {
  if (!url || url.endsWith('.svg') || url.startsWith('data:')) return ''
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ')
}

