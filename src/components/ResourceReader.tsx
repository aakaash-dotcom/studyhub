import { useState, useEffect, useRef } from 'react'
import { CatalogueRecord, parseMarksPattern } from '../data/catalogue'
import { generateSampleTileSVG, svgToDataUrl } from '../lib/tileGenerator'
import { useAuth } from '../context/AuthContext'
import { trackPreviewPage, trackLoginWallHit, trackDownload } from '../lib/events'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Download, Eye, ChevronLeft } from 'lucide-react'

interface ResourceReaderProps {
  resource: CatalogueRecord
}

export default function ResourceReader({ resource }: ResourceReaderProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [showGate, setShowGate] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const previewPages = resource.preview_pages
  const totalPages = resource.pages

  // Track preview page views
  useEffect(() => {
    trackPreviewPage(resource.id, currentPage)
  }, [currentPage, resource.id])

  // Check if user has hit the gate
  useEffect(() => {
    if (currentPage > previewPages && !isAuthenticated) {
      setShowGate(true)
      trackLoginWallHit(resource.id)
    }
  }, [currentPage, previewPages, isAuthenticated, resource.id])

  // Disable right-click, text-select, drag on tiles
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventContext = (e: Event) => e.preventDefault()
    const preventDrag = (e: Event) => e.preventDefault()
    const preventSelect = (e: Event) => e.preventDefault()

    container.addEventListener('contextmenu', preventContext)
    container.addEventListener('dragstart', preventDrag)
    container.addEventListener('selectstart', preventSelect)

    return () => {
      container.removeEventListener('contextmenu', preventContext)
      container.removeEventListener('dragstart', preventDrag)
      container.removeEventListener('selectstart', preventSelect)
    }
  }, [])

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resource/${resource.id}` } })
      return
    }

    setDownloading(true)
    trackDownload(resource.id)

    // Simulate download preparation
    await new Promise(resolve => setTimeout(resolve, 1500))
    setDownloading(false)

    // In production: fetch signed URL from server
    // For demo: open the file_pdf path
    const baseUrl = import.meta.env.BASE_URL || '/'
    window.open(`${baseUrl}pdfs/${resource.file_pdf}`, '_blank')
  }

  // Generate tile for current page
  const getTileUrl = (pageNum: number) => {
    // Try real tile first
    if (resource.file_preview_base) {
      const baseUrl = import.meta.env.BASE_URL || '/'
      // In production, check if file exists via API
      // For now, use sample tile
    }

    // Fall back to sample tile
    const svg = generateSampleTileSVG({
      pageNumber: pageNum,
      totalPages,
      title: resource.title_en,
      subject: resource.subject,
      className: resource.class,
      exam: resource.exam,
      year: resource.year,
    })
    return svgToDataUrl(svg)
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
        <p className="text-xs mt-1" style={{ color: '#595959' }}>
          Class {resource.class} · {resource.subject} · {resource.exam} {resource.year} · {resource.medium} Medium
        </p>

        {/* Marks Pattern Table */}
        {marksPattern.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse" style={{ borderColor: '#C0C8D9' }}>
              <thead>
                <tr style={{ backgroundColor: '#F5F8FC' }}>
                  <th className="border p-2 text-left font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Part</th>
                  <th className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Questions</th>
                  <th className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Marks Each</th>
                  <th className="border p-2 text-left font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {marksPattern.map((part, i) => (
                  <tr key={i}>
                    <td className="border p-2" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.part}</td>
                    <td className="border p-2 text-center" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.questions}</td>
                    <td className="border p-2 text-center" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.marks_each}</td>
                    <td className="border p-2" style={{ borderColor: '#C0C8D9', color: '#595959' }}>{part.note || '-'}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F5F8FC' }}>
                  <td colSpan={2} className="border p-2 font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Total</td>
                  <td className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#17528C' }}>{resource.total_marks} marks</td>
                  <td className="border p-2" style={{ borderColor: '#C0C8D9', color: '#595959' }}>{resource.duration}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reader Area */}
      <div ref={containerRef} className="bg-gray-100 min-h-[60vh] select-none" style={{ userSelect: 'none' }}>
        {/* Page Tiles */}
        <div className="max-w-2xl mx-auto py-6 px-4">
          {Array.from({ length: Math.min(previewPages, totalPages) }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="mb-4 bg-white shadow-lg rounded overflow-hidden">
              <img
                src={getTileUrl(pageNum)}
                alt={`Page ${pageNum}`}
                className="w-full h-auto"
                draggable={false}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          ))}

          {/* Gate */}
          {totalPages > previewPages && (
            <>
              {!isAuthenticated ? (
                <div className="bg-white border-2 rounded-xl p-6 text-center my-6" style={{ borderColor: '#C0C8D9' }}>
                  <Lock className="w-10 h-10 mx-auto mb-3" style={{ color: '#17528C' }} />
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                    Login to download the full paper
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#595959' }}>
                    You've seen {previewPages} of {totalPages} pages. Login to access the complete paper.
                  </p>
                  <Link
                    to={`/login`}
                    state={{ from: `/resource/${resource.id}` }}
                    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                  >
                    <Lock className="w-4 h-4" /> Login to Download
                  </Link>
                  <p className="text-xs mt-3" style={{ color: '#595959' }}>
                    Free · Takes 30 seconds · No spam
                  </p>
                </div>
              ) : (
                <div className="bg-white border-2 rounded-xl p-6 text-center my-6" style={{ borderColor: '#15803D' }}>
                  <Download className="w-10 h-10 mx-auto mb-3" style={{ color: '#15803D' }} />
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                    You've unlocked the full paper!
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#595959' }}>
                    Download the complete {totalPages}-page paper now.
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
                        <Download className="w-4 h-4" /> Download Full Paper
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Page Counter (sticky bottom on mobile) */}
      <div className="sticky bottom-16 lg:bottom-0 bg-white border-t py-2 px-4 flex items-center justify-between" style={{ borderColor: '#C0C8D9' }}>
        <span className="text-xs" style={{ color: '#595959' }}>
          Preview: Page {currentPage} of {previewPages} (of {totalPages} total)
        </span>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}
        >
          <Eye className="w-3 h-3" /> {isAuthenticated ? 'Download' : 'Login to Download'}
        </button>
      </div>
    </div>
  )
}
