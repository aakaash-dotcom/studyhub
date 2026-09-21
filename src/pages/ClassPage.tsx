import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { CLASSES, SUBJECTS, getRecordsByClass, isProItem } from '../data/catalogue'
import { useEffect, useState } from 'react'
import { trackPageView } from '../lib/events'
import LockModal from '../components/LockModal'

export default function ClassPage() {
  const { classId } = useParams()
  const classData = CLASSES.find(c => c.id === classId)
  const [showLockModal, setShowLockModal] = useState(false)

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

  useEffect(() => {
    if (classData) {
      trackPageView(`/class/${classId}`, `${classData.name}`)
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
      <div className="text-white" style={{ background: `linear-gradient(135deg, ${classId === '12' ? '#059669, #0d9488' : classId === '11' ? '#7c3aed, #9333ea' : classId === '10' ? '#17528C, #0E3A66' : classId === '9' ? '#ea580c, #dc2626' : '#0d9488, #0891b2'})` }}>
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

      {/* Content Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>What are you looking for?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Question Papers */}
          <Link
            to={`/class/${classId}?type=QuestionPaper`}
            className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
            style={{ borderColor: '#C0C8D9' }}
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
              Question Papers
            </h3>
            <p className="text-sm" style={{ color: '#595959' }}>
              Past papers from 2022-2025. Free after login.
            </p>
          </Link>

          {/* Model Questions */}
          <Link
            to={`/class/${classId}?type=ModelQuestionPaper`}
            className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
            style={{ borderColor: '#C0C8D9' }}
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
              Model Questions
            </h3>
            <p className="text-sm" style={{ color: '#595959' }}>
              Practice papers with marking scheme. Pro access.
            </p>
          </Link>

          {/* Answer Keys */}
          <Link
            to={`/class/${classId}?type=AnswerKey`}
            className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
            style={{ borderColor: '#C0C8D9' }}
          >
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
              Answer Keys
            </h3>
            <p className="text-sm" style={{ color: '#595959' }}>
              Detailed solutions and marking scheme. Pro access.
            </p>
          </Link>

          {/* Topper Material */}
          <Link
            to="/plans"
            className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: '#1e3a5f', borderColor: '#D4AF37' }}
          >
            <div className="text-4xl mb-3">👑</div>
            <h3 className="font-bold text-lg mb-2 text-white">
              Topper Material
            </h3>
            <p className="text-sm text-white/80">
              Important questions, model papers, and topper notes. The stuff that actually gets you marks.
            </p>
            <div className="mt-3 px-4 py-2 rounded-full text-xs font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
              PRO ACCESS
            </div>
          </Link>
        </div>

        {/* Subject Grid */}
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>Browse by Subject</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {(SUBJECTS[classId!] || []).map((subject) => {
            const slug = subject.name.toLowerCase().replace(/\s+/g, '-')
            const count = getRecordsByClass(classId!).filter(r => r.subject.toLowerCase() === subject.name.toLowerCase()).length
            return (
              <Link
                key={subject.name}
                to={`/class/${classId}/subject/${slug}`}
                className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="text-3xl sm:text-4xl mb-2">{subject.icon}</div>
                <h3 className="font-bold text-sm sm:text-base group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
                  {subject.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: '#595959' }}>
                  {count > 0 ? `${count} materials` : 'Coming soon'}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Recent Materials */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>🔥 Popular Materials</h2>
          <div className="space-y-3">
            {getRecordsByClass(classId!)
              .sort((a, b) => b.year - a.year)
              .slice(0, 5)
              .map((resource) => {
                const isPro = isProItem(resource)
                
                const handleClick = (e: React.MouseEvent) => {
                  if (isPro && !hasProPlan) {
                    e.preventDefault()
                    setShowLockModal(true)
                  }
                }

                return (
                  <Link
                    key={resource.id}
                    to={`/resource/${resource.id}`}
                    onClick={handleClick}
                    className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border transition-all shadow-sm hover:shadow-md"
                    style={{ borderColor: isPro && !hasProPlan ? '#D4AF37' : '#C0C8D9' }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                      <span className="text-xl sm:text-2xl">📄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>
                          {resource.title_en}
                        </h4>
                        {isPro && (
                          <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                            👑 PRO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.resource_type}</span>
                        <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                        <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>

      {/* Lock Modal */}
      <LockModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />
    </div>
  )
}
