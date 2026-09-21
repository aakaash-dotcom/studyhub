import { useParams, Link } from 'react-router-dom'
import { CLASSES, RESOURCE_TYPES, getRecordById, getPublishedRecords, isProItem } from '../data/catalogue'
import ResourceReader from '../components/ResourceReader'
import LockModal from '../components/LockModal'

export default function ResourcePage() {
  const { resourceId } = useParams()

  const resource = resourceId ? getRecordById(resourceId) : undefined
  const classData = resource ? CLASSES.find(c => c.id === resource.class) : null
  const categoryData = resource ? RESOURCE_TYPES.find(c => c.id === resource.resource_type) : null

  // Check if user has pro plan
  const hasProPlan = (() => {
    try {
      const plan = localStorage.getItem('ravi_plan')
      if (plan) {
        const planData = JSON.parse(plan)
        return planData.plan === 'pro' && planData.valid_until > Date.now()
      }
    } catch (e) {
      // Ignore parse errors
    }
    return false
  })()

  // Check if resource is locked
  const isLocked = resource && isProItem(resource) && !hasProPlan

  if (!resource || !classData || !categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Resource not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go Home</Link>
      </div>
    )
  }

  const relatedResources = getPublishedRecords()
    .filter(r => {
      // Exclude current resource
      if (r.id === resource.id) return false
      // Must be same class and subject
      if (r.class !== resource.class || r.subject !== resource.subject) return false
      // Filter out premium items for non-pro users
      if (!hasProPlan && isProItem(r)) return false
      return true
    })
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

        {/* Resource Reader with Drive Preview */}
        {isLocked ? (
          <div className="bg-white rounded-xl border-2 p-8 text-center mb-6" style={{ borderColor: '#D4AF37' }}>
            <div className="text-5xl mb-4">👑</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Pro Content</h2>
            <p className="text-sm mb-6" style={{ color: '#595959' }}>
              This is premium content. Upgrade to Pro to access all important questions, model papers, and answer keys.
            </p>
            <Link
              to="/plans"
              className="inline-block px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <ResourceReader resource={resource} />
        )}

        {/* Related Materials */}
        {relatedResources.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>📚 Related Materials</h2>
            <div className="space-y-3">
              {relatedResources.map((rel) => {
                const isPro = hasProPlan && isProItem(rel)
                
                return (
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate" style={{ color: '#1A1A1A' }}>{rel.title_en}</p>
                        {isPro && (
                          <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                            👑 PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#595959' }}>{rel.resource_type} · {rel.pages} pages</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lock Modal - Only for direct URL access to locked resources */}
      <LockModal isOpen={!!isLocked} onClose={() => {}} />
    </div>
  )
}
