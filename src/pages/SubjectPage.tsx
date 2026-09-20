import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft, FileText } from 'lucide-react'
import { CLASSES, RESOURCE_TYPES, getRecordsByClassTypeSubject } from '../data/catalogue'
import { useEffect } from 'react'
import { trackPageView } from '../lib/events'

export default function SubjectPage() {
  const { classId, category, subject } = useParams()
  const classData = CLASSES.find(c => c.id === classId)
  const categoryData = RESOURCE_TYPES.find(c => c.id === category)

  const subjectName = subject
    ? subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''

  const subjectResources = subjectName
    ? getRecordsByClassTypeSubject(classId!, category!, subjectName)
    : []

  useEffect(() => {
    if (classData && categoryData && subjectName) {
      trackPageView(`/class/${classId}/${category}/${subject}`, `${subjectName} - ${classData.name}`)
    }
  }, [classId, category, subject, classData, categoryData, subjectName])

  if (!classData || !categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Page not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 flex-wrap">
            <Link to="/" className="hover:text-white flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/class/${classId}`} className="hover:text-white">{classData.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/class/${classId}/${category}`} className="hover:text-white">{categoryData.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{subjectName}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">📚</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{subjectName}</h1>
              <p className="text-white/80 text-sm mt-1">
                {classData.name} • {categoryData.name} • {subjectResources.length} materials
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {subjectResources.length > 0 ? (
          <div className="space-y-3">
            {subjectResources.map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#17528C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>
                    {resource.title_en}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.medium}</span>
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
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border" style={{ borderColor: '#C0C8D9' }}>
            <div className="text-5xl mb-4">📚</div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#1A1A1A' }}>Materials Coming Soon</h3>
            <p className="text-sm mb-6" style={{ color: '#595959' }}>
              {subjectName} {categoryData.name} for {classData.name} will be added shortly.
            </p>
            <Link
              to={`/class/${classId}/${category}`}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: '#17528C' }}
            >
              <ChevronLeft className="w-4 h-4" /> Back to {categoryData.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
