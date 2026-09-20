import { useState, useEffect, useRef } from 'react'
import { CatalogueRecord, parseMarksPattern } from '../data/catalogue'
import { generateSampleTileSVG, svgToDataUrl } from '../lib/tileGenerator'
import { useAuth } from '../context/AuthContext'
import { trackPreviewPage, trackLoginWallHit, trackDownload } from '../lib/events'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Download, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react'

interface ResourceReaderProps {
  resource: CatalogueRecord
}

export default function ResourceReader({ resource }: ResourceReaderProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const previewPages = resource.preview_pages
  const totalPages = resource.pages

  // Track preview page views (track once when component mounts)
  useEffect(() => {
    trackPreviewPage(resource.id, 1)
  }, [resource.id])

  // Disable right-click, text-select, drag on tiles
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prevent = (e: Event) => e.preventDefault()
    container.addEventListener('contextmenu', prevent)
    container.addEventListener('dragstart', prevent)
    container.addEventListener('selectstart', prevent)

    return () => {
      container.removeEventListener('contextmenu', prevent)
      container.removeEventListener('dragstart', prevent)
      container.removeEventListener('selectstart', prevent)
    }
  }, [])

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resource/${resource.id}` } })
      return
    }

    setDownloading(true)
    trackDownload(resource.id)

    // In production: call your Apps Script endpoint to get a signed download URL
    // For now: simulate delay then open the download link
    await new Promise(resolve => setTimeout(resolve, 1200))
    setDownloading(false)

    // Option 1: If using Apps Script proxy
    // window.open(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?file=${resource.file_pdf}&user=${user?.phone}`, '_blank')
    
    // Option 2: If PDFs are hosted directly
    // window.open(`/pdfs/${resource.file_pdf}`, '_blank')
    
    // Option 3: If using Google Drive public files
    // window.open(`https://drive.google.com/uc?export=download&id=YOUR_FILE_ID`, '_blank')
    
    alert(`Download started!\n\nIn production, this would download: ${resource.file_pdf}\n\nSee INTEGRATION.md for setup options.`)
  }

  // Generate tile for any page - uses SVG tiles that actually work
  const getTileUrl = (pageNum: number) => {
    // In production, try real tile first:
    // const realTile = `/previews/${resource.file_preview_base}-p${pageNum}.webp`
    // If real tile exists, use it. Otherwise fall back to SVG.
    
    const svg = generateSampleTileSVG({
      pageNumber: pageNum,
      totalPages,
      title: resource.title_en,
      subject: resource.subject,
      className: resource.class,
      exam: resource.exam,
      year: resource.year,
    })
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }

  const marksPattern = parseMarksPattern(resource.marks_pattern)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Resource Header */}
      <div className="bg-white border-b p-4 sm:p-6" style={{ borderColor: '#C0C8D9' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-3" style={{ color: '#17528C' }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#1A1A1A' }}>{resource.title_en}</h1>
        {resource.title_ta && (
          <p className="text-sm mt-0.5" style={{ color: '#595959' }}>{resource.title_ta}</p>
        )}
        <p className="text-xs mt-2" style={{ color: '#595959' }}>
          Class {resource.class} · {resource.subject} ({resource.subject_ta}) · {resource.exam} {resource.year} · {resource.medium} Medium
        </p>

        {/* Marks Pattern Table */}
        {marksPattern.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <p className="text-xs font-medium mb-2" style={{ color: '#17528C' }}>📋 Marks Distribution Blueprint:</p>
            <table className="w-full text-xs border-collapse" style={{ borderColor: '#C0C8D9' }}>
              <thead>
                <tr style={{ backgroundColor: '#F5F8FC' }}>
                  <th className="border p-2 text-left font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Part</th>
                  <th className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Questions</th>
                  <th className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Marks Each</th>
                </tr>
              </thead>
              <tbody>
                {marksPattern.map((part, i) => (
                  <tr key={i}>
                    <td className="border p-2" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.part}</td>
                    <td className="border p-2 text-center" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.questions}</td>
                    <td className="border p-2 text-center" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.marks_each}{part.note ? ` ${part.note}` : ''}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F5F8FC' }}>
                  <td className="border p-2 font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Total</td>
                  <td className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#17528C' }}>{resource.question_count} Qs</td>
                  <td className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#17528C' }}>{resource.total_marks} marks · {resource.duration}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Description */}
        {resource.description_en && (
          <p className="text-sm mt-3" style={{ color: '#595959' }}>{resource.description_en}</p>
        )}
      </div>

      {/* Reader Area - All preview pages stacked (natural mobile scroll) */}
      <div ref={containerRef} className="select-none" style={{ userSelect: 'none', backgroundColor: '#F5F8FC' }}>
        <div className="max-w-lg mx-auto py-4 px-3">
          {/* All Preview Pages - Scrollable */}
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
            {Array.from({ length: previewPages }, (_, i) => i + 1).map((pageNum) => (
              <div key={pageNum} className="bg-white shadow-lg rounded-lg overflow-hidden mb-3">
                <img
                  src={getTileUrl(pageNum)}
                  alt={`Page ${pageNum} of ${totalPages}`}
                  className="w-full h-auto block"
                  draggable={false}
                  style={{ pointerEvents: 'none' }}
                />
                <div className="px-3 py-1.5 text-center text-xs border-t" style={{ color: '#595959', borderColor: '#C0C8D9', backgroundColor: '#F5F8FC' }}>
                  Page {pageNum} of {totalPages}
                </div>
              </div>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-3 mt-3 mb-4">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'white', color: '#595959' }}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'white', color: '#595959' }}>
              {Math.round(zoom * 100)}% · Showing {previewPages} of {totalPages} pages
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'white', color: '#595959' }}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Gate - shown after preview pages */}
          {totalPages > previewPages && (
            <div className="mt-6 bg-white border-2 rounded-xl p-5 text-center" style={{ borderColor: isAuthenticated ? '#15803D' : '#C0C8D9' }}>
              {isAuthenticated ? (
                <>
                  <Download className="w-10 h-10 mx-auto mb-3" style={{ color: '#15803D' }} />
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                    You've unlocked the full paper!
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#595959' }}>
                    {totalPages - previewPages} more pages available. Download the complete paper.
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #15803D, #166534)' }}
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download Full Paper ({resource.pages} pages)
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Lock className="w-10 h-10 mx-auto mb-3" style={{ color: '#17528C' }} />
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                    Login to download the full paper
                  </h3>
                  <p className="text-sm mb-1" style={{ color: '#595959' }}>
                    You've seen {previewPages} of {totalPages} pages.
                  </p>
                  <p className="text-sm mb-4" style={{ color: '#595959' }}>
                    Login free to access the complete paper.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: `/resource/${resource.id}` }}
                    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                  >
                    <Lock className="w-4 h-4" /> Login to Download
                  </Link>
                  <p className="text-xs mt-3" style={{ color: '#595959' }}>
                    Free · Takes 30 seconds · No spam
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
