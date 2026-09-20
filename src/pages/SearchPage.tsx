import { Link, useSearchParams } from 'react-router-dom'
import { Search, FileText, Clock, Download } from 'lucide-react'
import { resources, tnClasses } from '../data/resources'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const results = resources.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.subject.toLowerCase().includes(query.toLowerCase()) ||
    r.class.toLowerCase().includes(query.toLowerCase()) ||
    r.type.toLowerCase().includes(query.toLowerCase()) ||
    r.medium.toLowerCase().includes(query.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Study Material': 'bg-blue-100 text-blue-700',
      'Question Paper': 'bg-red-100 text-red-700',
      'Model Paper': 'bg-green-100 text-green-700',
      'Important Questions': 'bg-yellow-100 text-yellow-700',
      'Notes': 'bg-purple-100 text-purple-700',
      'Solutions': 'bg-emerald-100 text-emerald-700',
      'Syllabus': 'bg-orange-100 text-orange-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {query ? `Results for "${query}"` : 'Search Materials'}
        </h1>
        <p className="text-sm text-gray-500">
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-2">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <input
            type="text"
            defaultValue={query}
            placeholder="Search for notes, papers, syllabus..."
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-transparent outline-none"
          />
          <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((resource) => {
          const classData = tnClasses.find(c => c.id === resource.class)
          return (
            <Link
              key={resource.id}
              to={`/resource/${resource.id}`}
              className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors text-sm sm:text-base truncate">
                  {resource.title}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500">{resource.subject}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">{classData?.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" /> {resource.size}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Download className="w-3 h-3" /> {resource.downloads.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {results.length === 0 && query && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-sm text-gray-500 mb-4">Try different keywords or browse our classes</p>
          <Link to="/" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 inline-block">
            Browse All Classes
          </Link>
        </div>
      )}
    </div>
  )
}
