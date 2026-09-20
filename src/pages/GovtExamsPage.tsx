import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { govtExamCategories, resources } from '../data/resources'

export default function GovtExamsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Government Exams</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Government Exam Preparation</h1>
        <p className="text-gray-600 text-sm sm:text-base">UPSC, SSC, Banking, Railway, Teaching & more</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {govtExamCategories.map((exam) => (
          <Link
            key={exam.id}
            to={`/govt-exams/${exam.id}`}
            className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl">{exam.icon}</span>
              {exam.active && (
                <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium rounded-full">Active</span>
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">{exam.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{exam.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function GovtExamCategoryPage() {
  const { categoryId } = useParams()
  const category = govtExamCategories.find(c => c.id === categoryId)
  const examResources = resources.filter(r => r.examCategory === categoryId)

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
        <Link to="/govt-exams" className="text-blue-600 hover:underline">← Back to Govt Exams</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto pb-2">
        <Link to="/" className="hover:text-blue-600 whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to="/govt-exams" className="hover:text-blue-600 whitespace-nowrap">Govt Exams</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="text-gray-800 font-medium whitespace-nowrap">{category.name}</span>
      </nav>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 mb-8 text-white">
        <div className="text-4xl sm:text-5xl mb-3">{category.icon}</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{category.name} Exam Preparation</h1>
        <p className="text-emerald-100 text-sm sm:text-base">{category.description}</p>
      </div>

      <div className="space-y-3">
        {examResources.length > 0 ? (
          examResources.map((resource) => (
            <Link
              key={resource.id}
              to={`/resource/${resource.id}`}
              className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📄</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors text-sm sm:text-base truncate">
                  {resource.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{resource.type}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{resource.size}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{resource.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-800 mb-1">Materials Coming Soon</h3>
            <p className="text-sm text-gray-500">Study materials for {category.name} will be added shortly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
