// Sample preview tile generator
// Creates SVG-based page tiles with Ravi's Tuition watermark
// Used when real file_preview_base + -p<n>.webp tiles don't exist yet

export interface TileConfig {
  pageNumber: number
  totalPages: number
  title: string
  subject: string
  className: string
  exam: string
  year: number
  width?: number
  height?: number
}

export function generateSampleTileSVG(config: TileConfig): string {
  const {
    pageNumber,
    totalPages,
    title,
    subject,
    className,
    exam,
    year,
    width = 595,  // A4 width at 72dpi
    height = 842  // A4 height at 72dpi
  } = config

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="${width}" height="80" fill="#17528C"/>
  <text x="30" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">Ravi's Tuition</text>
  <text x="30" y="55" font-family="Arial, sans-serif" font-size="11" fill="#ffffff">MADURAI · SINCE 1999</text>
  
  <!-- Page number -->
  <text x="${width - 30}" y="35" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="end">Page ${pageNumber} of ${totalPages}</text>
  
  <!-- Title area -->
  <text x="30" y="120" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1A1A1A">${escapeXml(title)}</text>
  <text x="30" y="145" font-family="Arial, sans-serif" font-size="12" fill="#595959">Class ${className} · ${subject} · ${exam} ${year}</text>
  
  <!-- Divider -->
  <line x1="30" y1="160" x2="${width - 30}" y2="160" stroke="#C0C8D9" stroke-width="1"/>
  
  <!-- Sample content lines (simulated text) -->
  ${generateSampleContent(width, height)}
  
  <!-- Watermark - diagonal, low opacity -->
  <g transform="translate(${width / 2}, ${height / 2}) rotate(-45)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#17528C" fill-opacity="0.08" text-anchor="middle">RAVI'S TUITION</text>
    <text x="0" y="50" font-family="Arial, sans-serif" font-size="24" fill="#17528C" fill-opacity="0.08" text-anchor="middle">ravistuition.in</text>
  </g>
  
  <!-- Footer -->
  <line x1="30" y1="${height - 50}" x2="${width - 30}" y2="${height - 50}" stroke="#C0C8D9" stroke-width="1"/>
  <text x="30" y="${height - 30}" font-family="Arial, sans-serif" font-size="10" fill="#595959">© Ravi's Tuition · ravistuition.in | 86106 53352</text>
  <text x="${width - 30}" y="${height - 30}" font-family="Arial, sans-serif" font-size="10" fill="#595959" text-anchor="end">Sample Preview · Page ${pageNumber}</text>
</svg>`

  return svg
}

function generateSampleContent(width: number, height: number): string {
  const lines: string[] = []
  const startY = 190
  const lineHeight = 25
  const margin = 30
  const contentWidth = width - 2 * margin

  // Generate fake question-like content
  const questions = [
    '1. Solve the quadratic equation x² - 5x + 6 = 0',
    '2. Find the sum of first 20 terms of the AP: 3, 7, 11, 15, ...',
    '3. Prove that √2 is an irrational number',
    '4. Calculate the area of a triangle with vertices (2, 3), (5, 7), (8, 4)',
    '5. If sin θ = 3/5, find cos θ and tan θ',
  ]

  questions.forEach((q, i) => {
    const y = startY + i * (lineHeight * 3)
    lines.push(`<text x="${margin}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#1A1A1A">${escapeXml(q)}</text>`)
    
    // Add some fake answer space
    lines.push(`<text x="${margin + 20}" y="${y + lineHeight}" font-family="Arial, sans-serif" font-size="11" fill="#595959" font-style="italic">[Answer space]</text>`)
    lines.push(`<line x1="${margin + 20}" y1="${y + lineHeight + 10}" x2="${margin + contentWidth - 40}" y2="${y + lineHeight + 10}" stroke="#C0C8D9" stroke-width="0.5" stroke-dasharray="4,4"/>`)
  })

  return lines.join('\n  ')
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Convert SVG to data URL for use in img tags
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// Get preview tile URL - tries real tile first, falls back to sample
export function getPreviewTileUrl(
  filePreviewBase: string | undefined,
  pageNumber: number,
  config: TileConfig
): string {
  // Try real tile first
  if (filePreviewBase) {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const realTilePath = `${baseUrl}previews/${filePreviewBase}-p${pageNumber}.webp`
    // In production, this would check if file exists
    // For now, we'll use the sample tile
    // TODO: Implement actual file existence check via API
  }

  // Fall back to sample tile
  const svg = generateSampleTileSVG(config)
  return svgToDataUrl(svg)
}
