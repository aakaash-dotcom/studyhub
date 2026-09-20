import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { CLASSES, RESOURCE_TYPES, getRecordsByClass, getRecordsByClassAndType } from '../data/catalogue'
import { useEffect } from 'react'
import { trackPageView } from '../lib/events'

export default function ClassPage() {
  const { classId } = useParams()
  const classData = CLASSES.find(c => c.id === classId)

  useEffect(() => {
    if (classData) {
      trackPageView(`/class/${classId}`, `${classData.name} - Ravi's Tuition`)
    }
  }, [classId, classData])

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Class not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      {/* Header */}
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{classData.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-4xl sm:text-5xl">{classData.icon}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{classData.name}</h1>
              <p className="text-white/80 text-sm mt-1">Tamil Nadu State Board - Samacheer Kalvi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>📂 Browse by Category</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {RESOURCE_TYPES.map((cat) => {
            const count = getRecordsByClassAndType(classId!, cat.id).length
            return (
              <Link
                key={cat.id}
                to={`/class/${classId}/${cat.id}`}
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="text-3xl sm:text-4xl flex-shrink-0">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#595959' }}>
                    {count > 0 ? `${count} materials available` : 'Materials coming soon'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" style={{ color: '#595959' }} />
              </Link>
            )
          })}
        </div>

        {/* Recent Materials */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>🔥 Popular Materials</h2>
          <div className="space-y-3">
            {getRecordsByClass(classId!).slice(0, 5).map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                  <span className="text-xl sm:text-2xl">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>
                    {resource.title_en}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.resource_type}</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
