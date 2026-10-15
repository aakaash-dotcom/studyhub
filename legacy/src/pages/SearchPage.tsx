import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getPublishedRecords, CLASSES, isProItem, isFreeItem } from '../data/catalogue'
import { useState, useMemo } from 'react'
import { usePrefs } from '../context/PrefsContext'

const TYPE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Question Papers', value: 'QuestionPaper' },
  { label: 'Model Questions', value: 'ModelQuestionPaper' },
  { label: 'Answer Keys', value: 'AnswerKey' },
  { label: '👑 Topper Material', value: '__topper__' },
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

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { prefs } = usePrefs()
  const query = searchParams.get('q') || ''
  const allRecords = getPublishedRecords()

  const [typeFilter, setTypeFilter] = useState('')
  const [examFilter, setExamFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [searchInput, setSearchInput] = useState(query)

  // Handle chip click - navigate for Topper, filter for others
  const handleChipClick = (chipType: string) => {
    if (chipType === '__topper__') {
      // Navigate to topper page for the first class in results or default to 10
      const firstClass = prefs?.classId || '10'
      navigate(`/class/${firstClass}/topper`)
    } else {
      setTypeFilter(chipType)
    }
  }

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

  const results = useMemo(() => {
    if (!query) return []
    
    return allRecords.filter(r => {
      // Text search
      const matchesQuery = 
        r.title_en.toLowerCase().includes(query.toLowerCase()) ||
        r.subject.toLowerCase().includes(query.toLowerCase()) ||
        r.class.toLowerCase().includes(query.toLowerCase()) ||
        r.resource_type.toLowerCase().includes(query.toLowerCase()) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      
      if (!matchesQuery) return false
      
      // Filter by medium (language) from prefs
      if (prefs?.medium && r.medium !== prefs.medium) {
        return false
      }
      
      // For All/QP/Model/Keys views, never show ImpQ
      if (typeFilter === '' || typeFilter === 'QuestionPaper' || typeFilter === 'ModelQuestionPaper' || typeFilter === 'AnswerKey') {
        if (r.resource_type === 'ImportantQuestions') return false
      }
      
      // For non-pro users, hide premium items (but never hide free items)
      if (!hasProPlan && typeFilter !== '__topper__') {
        if (isProItem(r) && !isFreeItem(r)) {
          return false
        }
      }
      
      // Chip filters
      if (typeFilter) {
        if (typeFilter === '__topper__') {
          if (r.price_tier !== 'premium') return false
        } else {
          if (r.resource_type !== typeFilter) return false
        }
      }
      if (examFilter && r.exam !== examFilter) return false
      if (yearFilter && r.year !== parseInt(yearFilter)) return false
      
      return true
    })
  }, [query, allRecords, typeFilter, examFilter, yearFilter, hasProPlan, prefs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const clearFilters = () => {
    setTypeFilter('')
    setExamFilter('')
    setYearFilter('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          {query ? `Results for "${query}"` : 'Search Materials'}
        </h1>
        <p className="text-sm" style={{ color: '#595959' }}>
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-xl border shadow-sm p-2" style={{ borderColor: '#C0C8D9' }}>
          <Search className="w-5 h-5 ml-3" style={{ color: '#595959' }} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for notes, papers, syllabus..."
            className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none"
            style={{ color: '#1A1A1A', fontSize: '16px' }}
          />
          <button type="submit" className="text-white px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#17528C' }}>
            Search
          </button>
        </form>
      </div>

      {/* Chip Filters */}
      {query && (
        <div className="bg-white rounded-2xl border p-4 sm:p-6 mb-6" style={{ borderColor: '#C0C8D9' }}>
          {/* Type Chips */}
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#595959' }}>Type</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChipClick(option.value)}
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
              {results.length} {results.length === 1 ? 'material' : 'materials'}
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
      )}

      <div className="space-y-3">
        {results.map((resource) => {
          const classData = CLASSES.find(c => c.id === resource.class)
          const isPro = hasProPlan && isProItem(resource)
          
          return (
            <Link
              key={resource.id}
              to={`/resource/${resource.id}`}
              className="flex items-center gap-4 bg-white hover:bg-blue-50 rounded-xl p-4 border transition-all shadow-sm hover:shadow-md"
              style={{ borderColor: '#C0C8D9' }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                <span className="text-2xl">📄</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate" style={{ color: '#1A1A1A' }}>
                    {resource.title_en}
                  </h4>
                  {isPro && (
                    <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                      👑 PRO
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: '#595959' }}>{resource.resource_type}</span>
                  <span className="text-xs" style={{ color: '#C0C8D9' }}>•</span>
                  <span className="text-xs" style={{ color: '#595959' }}>{resource.subject}</span>
                  <span className="text-xs" style={{ color: '#C0C8D9' }}>•</span>
                  <span className="text-xs" style={{ color: '#595959' }}>{classData?.name}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {results.length === 0 && query && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>No results found</h3>
          <p className="text-sm mb-4" style={{ color: '#595959' }}>Try different keywords or browse our classes</p>
          <Link to="/" className="px-4 py-2 rounded-full text-sm font-medium inline-block" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
            Browse All Classes
          </Link>
        </div>
      )}
    </div>
  )
}
