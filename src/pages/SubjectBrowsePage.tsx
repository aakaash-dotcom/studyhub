import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { CLASSES, SUBJECTS, getRecordsByClassAndSubject } from '../data/catalogue'
import { useState, useMemo } from 'react'
import { useEffect } from 'react'
import { trackPageView } from '../lib/events'

const TYPE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Question Papers', value: 'QuestionPaper' },
  { label: 'Important Questions', value: 'ImportantQuestions' },
  { label: 'Model Papers', value: 'ModelQuestionPaper' },
  { label: 'Answer Keys', value: 'AnswerKey' },
]

const EXAM_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Half-yearly', value: 'Half-yearly' },
  { label: 'Annual', value: 'Annual' },
]

const YEAR_OPTIONS = [
  { label: 'All', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
]

const EXAM_ORDER = ['Quarterly', 'Half-yearly', 'Annual']
const TYPE_ORDER = ['ImportantQuestions', 'ModelQuestionPaper', 'QuestionPaper', 'AnswerKey']

export default function SubjectBrowsePage() {
  const { classId, subject } = useParams()
  const classData = CLASSES.find(c => c.id === classId)
  const subjectData = SUBJECTS[classId!]?.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === subject)

  const [typeFilter, setTypeFilter] = useState('')
  const [examFilter, setExamFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    if (classData && subjectData) {
      trackPageView(`/class/${classId}/subject/${subject}`, `${classData.name} ${subjectData.name}`)
    }
  }, [classId, subject, classData, subjectData])

  const filteredRecords = useMemo(() => {
    if (!classId || !subject) return []
    
    const records = getRecordsByClassAndSubject(classId, subject)
    
    return records
      .filter(r => {
        if (typeFilter && r.resource_type !== typeFilter) return false
        if (examFilter && r.exam !== examFilter) return false
        if (yearFilter && r.year !== parseInt(yearFilter)) return false
        return true
      })
      .sort((a, b) => {
        // Sort by year desc
        if (b.year !== a.year) return b.year - a.year
        // Then by exam order
        const examOrderA = EXAM_ORDER.indexOf(a.exam)
        const examOrderB = EXAM_ORDER.indexOf(b.exam)
        if (examOrderA !== examOrderB) return examOrderA - examOrderB
        // Then by type order
        const typeOrderA = TYPE_ORDER.indexOf(a.resource_type)
        const typeOrderB = TYPE_ORDER.indexOf(b.resource_type)
        return typeOrderA - typeOrderB
      })
  }, [classId, subject, typeFilter, examFilter, yearFilter])

  if (!classData || !subjectData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Subject not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  const clearFilters = () => {
    setTypeFilter('')
    setExamFilter('')
    setYearFilter('')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      {/* Header */}
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 flex-wrap">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/class/${classId}`} className="hover:text-white">{classData.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{subjectData.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">{subjectData.icon}</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{subjectData.name}</h1>
              <p className="text-white/80 text-sm mt-1">{classData.name} · Tamil Nadu State Board</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border p-4 sm:p-6 mb-6" style={{ borderColor: '#C0C8D9' }}>
          {/* Type Chips */}
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#595959' }}>Type</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTypeFilter(option.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: typeFilter === option.value ? '#17528C' : 'white',
                    color: typeFilter === option.value ? 'white' : '#1A1A1A',
                    border: `1px solid ${typeFilter === option.value ? '#17528C' : '#C0C8D9'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Chips */}
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#595959' }}>Exam</p>
            <div className="flex flex-wrap gap-2">
              {EXAM_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExamFilter(option.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: examFilter === option.value ? '#17528C' : 'white',
                    color: examFilter === option.value ? 'white' : '#1A1A1A',
                    border: `1px solid ${examFilter === option.value ? '#17528C' : '#C0C8D9'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year Chips */}
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#595959' }}>Year</p>
            <div className="flex flex-wrap gap-2">
              {YEAR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setYearFilter(option.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: yearFilter === option.value ? '#17528C' : 'white',
                    color: yearFilter === option.value ? 'white' : '#1A1A1A',
                    border: `1px solid ${yearFilter === option.value ? '#17528C' : '#C0C8D9'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#C0C8D9' }}>
            <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
              {filteredRecords.length} {filteredRecords.length === 1 ? 'material' : 'materials'}
            </p>
            {(typeFilter || examFilter || yearFilter) && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium"
                style={{ color: '#17528C' }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map((resource) => (
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
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.medium}</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                    <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#15803D' }}>FREE</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border" style={{ borderColor: '#C0C8D9' }}>
            <div className="text-5xl mb-4">📚</div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#1A1A1A' }}>Materials Coming Soon</h3>
            <p className="text-sm mb-4" style={{ color: '#595959' }}>
              {subjectData.name} materials for {classData.name} will be added shortly.
            </p>
            {(typeFilter || examFilter || yearFilter) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: '#17528C' }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
