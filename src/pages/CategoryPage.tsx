import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { tnClasses, categories, resources, subjectsByClass } from '../data/resources'

export default function CategoryPage() {
  const { classId, category } = useParams()
  const classData = tnClasses.find(c => c.id === classId)
  const categoryData = categories.find(c => c.id === category)

  if (!classData || !categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Go to Home</Link>
      </div>
    )
  }

  const subjects = subjectsByClass[classId || ''] || []

  // Get resources for this class and category
  const classResources = resources.filter(r => r.class === classId && r.category === category)

  // Count resources per subject
  const getSubjectCount = (subject: string) => {
    return classResources.filter(r => r.subject === subject).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${classData.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 flex-wrap">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/class/${classId}`} className="hover:text-white">
              {classData.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{categoryData.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">{categoryData.icon}</div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {classData.name} - {categoryData.name}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Select a subject to view materials
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Subjects Grid */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          📚 Select Subject
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {subjects.map((subject) => {
            const count = getSubjectCount(subject)
            return (
              <Link
                key={subject}
                to={`/class/${classId}/${category}/${subject.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl sm:text-3xl">
                    {subject === 'Maths' || subject === 'Mathematics' ? '🔢' :
                     subject === 'Science' ? '🔬' :
                     subject === 'Physics' ? '⚡' :
                     subject === 'Chemistry' ? '🧪' :
                     subject === 'Biology' ? '🧬' :
                     subject === 'English' ? '📖' :
                     subject === 'Tamil' ? '📝' :
                     subject === 'Social Science' ? '🌍' :
                     subject === 'Computer Science' ? '💻' :
                     subject === 'Commerce' ? '💼' :
                     subject === 'Accountancy' ? '📊' :
                     subject === 'Economics' ? '📈' :
                     subject === 'Business Maths' ? '🧮' :
                     subject === 'EVS' ? '🌱' : '📚'}
                  </span>
                  {count > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full">
                      {count}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                  {subject}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {count > 0 ? `${count} files` : 'Coming soon'}
                </p>
              </Link>
            )
          })}
        </div>

        {/* All Materials in this Category */}
        {classResources.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              📄 All {categoryData.name} ({classResources.length})
            </h2>
            <div className="space-y-3">
              {classResources.map((resource) => (
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
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                      <span className="text-[10px] sm:text-xs text-gray-500">{resource.subject}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                      <span className="text-[10px] sm:text-xs text-gray-500">{resource.size}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                      <span className="text-[10px] sm:text-xs text-gray-500">{resource.downloads.toLocaleString()} downloads</span>
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
