import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getPublishedRecords, CLASSES } from '../data/catalogue'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const allRecords = getPublishedRecords()

  const results = query
    ? allRecords.filter(r =>
        r.title_en.toLowerCase().includes(query.toLowerCase()) ||
        r.subject.toLowerCase().includes(query.toLowerCase()) ||
        r.class.toLowerCase().includes(query.toLowerCase()) ||
        r.resource_type.toLowerCase().includes(query.toLowerCase())
      )
    : []

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

      <div className="mb-8">
        <form onSubmit={(e) => { e.preventDefault() }} className="flex items-center bg-white rounded-xl border shadow-sm p-2" style={{ borderColor: '#C0C8D9' }}>
          <Search className="w-5 h-5 ml-3" style={{ color: '#595959' }} />
          <input
            type="text"
            defaultValue={query}
            placeholder="Search for notes, papers, syllabus..."
            className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none"
            style={{ color: '#1A1A1A', fontSize: '16px' }}
          />
          <button className="text-white px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#17528C' }}>
            Search
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {results.map((resource) => {
          const classData = CLASSES.find(c => c.id === resource.class)
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
                <h4 className="font-medium truncate" style={{ color: '#1A1A1A' }}>
                  {resource.title_en}
                </h4>
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
