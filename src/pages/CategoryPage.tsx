import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { CLASSES, RESOURCE_TYPES, SUBJECTS, getRecordsByClassAndType } from '../data/catalogue'
import { useEffect } from 'react'
import { trackPageView } from '../lib/events'

export default function CategoryPage() {
  const { classId, category } = useParams()
  const classData = CLASSES.find(c => c.id === classId)
  const categoryData = RESOURCE_TYPES.find(c => c.id === category)

  useEffect(() => {
    if (classData && categoryData) {
      trackPageView(`/class/${classId}/${category}`, `${classData.name} ${categoryData.name}`)
    }
  }, [classId, category, classData, categoryData])

  if (!classData || !categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Page not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  const subjects = SUBJECTS[classId!] || []
  const classResources = getRecordsByClassAndType(classId!, category!)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 flex-wrap">
            <Link to="/" className="hover:text-white flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/class/${classId}`} className="hover:text-white">{classData.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{categoryData.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">{categoryData.icon}</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{classData.name} - {categoryData.name}</h1>
              <p className="text-white/80 text-sm mt-1">Select a subject to view materials</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>📚 Select Subject</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {subjects.map((subject) => {
            const count = classResources.filter(r => r.subject === subject.name).length
            return (
              <Link
                key={subject.name}
                to={`/class/${classId}/${category}/${subject.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl sm:text-3xl">{subject.icon}</span>
                  {count > 0 && (
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
                      {count}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>{subject.name}</h3>
                <p className="text-[10px] sm:text-xs mt-1" style={{ color: '#595959' }}>{count > 0 ? `${count} files` : 'Coming soon'}</p>
              </Link>
            )
          })}
        </div>

        {classResources.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>📄 All {categoryData.name} ({classResources.length})</h2>
            <div className="space-y-3">
              {classResources.map((resource) => (
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
                    <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>{resource.title_en}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.subject}</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                      <span className="text-[10px] sm:text-xs font-medium" style={{ color: resource.price_inr === 0 ? '#15803D' : '#B45309' }}>
                        {resource.price_inr === 0 ? 'FREE' : `₹${resource.price_inr}`}
                      </span>
                    </div>
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
