import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { entranceCategories, resources } from '../data/resources'

export default function ExamsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Entrance Exams</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Entrance Exam Preparation</h1>
        <p className="text-gray-600 text-sm sm:text-base">Study materials for engineering, medical, management, law & more</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {entranceCategories.map((cat) => {
          const count = resources.filter(r => r.examCategory === cat.id).length
          return (
            <Link
              key={cat.id}
              to={`/exams/${cat.id}`}
              className={`group border rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cat.color}`}
            >
              <div className="text-3xl sm:text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{cat.name}</h3>
              <ul className="space-y-1 mb-3">
                {cat.exams.slice(0, 3).map((exam) => (
                  <li key={exam} className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    {exam}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {count} materials <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function ExamCategoryPage() {
  const { categoryId } = useParams()
  const category = entranceCategories.find(c => c.id === categoryId)
  const examResources = resources.filter(r => r.examCategory === categoryId)

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
        <Link to="/exams" className="text-blue-600 hover:underline">← Back to Exams</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto pb-2">
        <Link to="/" className="hover:text-blue-600 whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to="/exams" className="hover:text-blue-600 whitespace-nowrap">Entrance Exams</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="text-gray-800 font-medium whitespace-nowrap">{category.name}</span>
      </nav>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 mb-8 text-white">
        <div className="text-4xl sm:text-5xl mb-3">{category.icon}</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{category.name} Entrance Exams</h1>
        <p className="text-blue-100 text-sm sm:text-base">Study materials for {category.exams.join(', ')}</p>
      </div>

      <div className="space-y-3">
        {examResources.map((resource) => (
          <Link
            key={resource.id}
            to={`/resource/${resource.id}`}
            className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
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
        ))}
      </div>
    </div>
  )
}
