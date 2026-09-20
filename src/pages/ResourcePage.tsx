import { useParams, Link } from 'react-router-dom'
import { getRecordById, getPublishedRecords, CLASSES, RESOURCE_TYPES } from '../data/catalogue'
import ResourceReader from '../components/ResourceReader'
import { FileText, BookOpen } from 'lucide-react'
import { useEffect } from 'react'
import { trackPageView } from '../lib/events'

export default function ResourcePage() {
  const { resourceId } = useParams()
  const resource = resourceId ? getRecordById(resourceId) : undefined

  useEffect(() => {
    if (resource) {
      trackPageView(`/resource/${resource.id}`, resource.title_en)
    }
  }, [resource])

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Resource not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go Home</Link>
      </div>
    )
  }

  const classData = CLASSES.find(c => c.id === resource.class)
  const relatedResources = getPublishedRecords()
    .filter(r => r.id !== resource.id && r.class === resource.class && r.subject === resource.subject)
    .slice(0, 4)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <ResourceReader resource={resource} />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-1 p-4">
        <div className="bg-white rounded-2xl border p-4 sticky top-20" style={{ borderColor: '#C0C8D9' }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1A1A1A' }}>
            <BookOpen className="w-4 h-4" style={{ color: '#17528C' }} />
            Related Materials
          </h3>
          <div className="space-y-2">
            {relatedResources.map((rel) => (
              <Link
                key={rel.id}
                to={`/resource/${rel.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                  <FileText className="w-4 h-4" style={{ color: '#595959' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>
                    {rel.title_en}
                  </p>
                  <p className="text-[10px]" style={{ color: '#595959' }}>{rel.resource_type} · {rel.pages}p</p>
                </div>
              </Link>
            ))}
            {relatedResources.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: '#595959' }}>No related materials yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
