import { useParams, Link, useNavigate } from 'react-router-dom'
import { CLASSES, RESOURCE_TYPES, getRecordById, getPublishedRecords } from '../data/catalogue'
import { useAuth } from '../context/AuthContext'
import PageTile from '../components/PageTile'
import { Lock, Download } from 'lucide-react'
import { useState } from 'react'

export default function ResourcePage() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [downloading, setDownloading] = useState(false)

  const resource = resourceId ? getRecordById(resourceId) : undefined
  const classData = resource ? CLASSES.find(c => c.id === resource.class) : null
  const categoryData = resource ? RESOURCE_TYPES.find(c => c.id === resource.resource_type) : null

  if (!resource || !classData || !categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Resource not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go Home</Link>
      </div>
    )
  }

  const handleDownload = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resource/${resource.id}` } })
      return
    }
    setDownloading(true)
    // Simulate download
    setTimeout(() => {
      setDownloading(false)
      alert('Download started! (In production, this would download the actual PDF)')
    }, 1500)
  }

  const relatedResources = getPublishedRecords()
    .filter(r => r.id !== resource.id && r.class === resource.class && r.subject === resource.subject)
    .slice(0, 4)

  return (
    <div style={{ backgroundColor: '#F5F8FC' }} className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap" style={{ color: '#595959' }}>
          <Link to="/" className="hover:text-blue-700">← Home</Link>
          <span>/</span>
          <Link to={`/class/${resource.class}`} className="hover:text-blue-700">{classData.name}</Link>
          <span>/</span>
          <Link to={`/class/${resource.class}/${resource.resource_type}`} className="hover:text-blue-700">{categoryData.name}</Link>
        </nav>

        {/* Resource Header */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#C0C8D9' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>{resource.title_en}</h1>
          {resource.title_ta && (
            <p className="text-sm mb-3" style={{ color: '#595959' }}>{resource.title_ta}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
              {resource.subject}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
              {resource.medium} Medium
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
              {resource.exam} {resource.year}
            </span>
          </div>
          <p className="text-sm" style={{ color: '#595959' }}>{resource.description_en}</p>
        </div>

        {/* Preview Pages */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>📖 Preview</h2>
          {Array.from({ length: Math.min(resource.preview_pages, resource.pages) }, (_, i) => (
            <PageTile
              key={i}
              pageNumber={i + 1}
              totalPages={resource.pages}
              resource={resource}
            />
          ))}
        </div>

        {/* Download Gate */}
        {!isAuthenticated ? (
          <div className="bg-white border-2 rounded-xl p-6 text-center mb-6" style={{ borderColor: '#C0C8D9' }}>
            <Lock className="w-12 h-12 mx-auto mb-3" style={{ color: '#17528C' }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
              Login to download the full paper
            </h3>
            <p className="text-sm mb-4" style={{ color: '#595959' }}>
              You've seen {resource.preview_pages} of {resource.pages} pages. Login free to access the complete paper.
            </p>
            <button
              onClick={() => navigate('/login', { state: { from: `/resource/${resource.id}` } })}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium"
              style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
            >
              <Lock className="w-4 h-4" /> Login to Download Free
            </button>
            <p className="text-xs mt-3" style={{ color: '#595959' }}>
              Takes 30 seconds · No spam · DPDP compliant
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 rounded-xl p-6 text-center mb-6" style={{ borderColor: '#15803D' }}>
            <Download className="w-12 h-12 mx-auto mb-3" style={{ color: '#15803D' }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
              You've unlocked the full paper!
            </h3>
            <p className="text-sm mb-4" style={{ color: '#595959' }}>
              Download the complete {resource.pages}-page paper now.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
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

        {/* Related Materials */}
        {relatedResources.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>📚 Related Materials</h2>
            <div className="space-y-3">
              {relatedResources.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/resource/${rel.id}`}
                  className="flex items-center gap-4 bg-white hover:bg-blue-50 rounded-xl p-4 border transition-all"
                  style={{ borderColor: '#C0C8D9' }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#1A1A1A' }}>{rel.title_en}</p>
                    <p className="text-xs mt-1" style={{ color: '#595959' }}>{rel.resource_type} · {rel.pages} pages</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
