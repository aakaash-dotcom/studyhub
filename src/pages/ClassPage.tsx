import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { tnClasses, categories, resources } from '../data/resources'

export default function ClassPage() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const classData = tnClasses.find(c => c.id === classId)

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Class not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Go to Home</Link>
      </div>
    )
  }

  // Count resources in each category for this class
  const getCategoryCount = (categoryId: string) => {
    return resources.filter(r => r.class === classId && r.category === categoryId).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Class Header */}
      <div className={`bg-gradient-to-r ${classData.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Breadcrumb */}
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {classData.name}
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-1">
                Tamil Nadu State Board - Samacheer Kalvi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          📂 Browse by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id)
            return (
              <Link
                key={cat.id}
                to={`/class/${classId}/${cat.id}`}
                className={`group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cat.color} border-opacity-50 hover:border-opacity-100`}
              >
                <div className="text-3xl sm:text-4xl flex-shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:scale-105 transition-transform origin-left">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {count > 0 ? `${count} materials available` : 'Materials coming soon'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            )
          })}
        </div>

        {/* Quick Access - Subjects */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            📚 Quick Access by Subject
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {(classId === '11' || classId === '12')
              ? ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'Economics'].map((subject) => (
                  <Link
                    key={subject}
                    to={`/class/${classId}/study-material/${subject.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    {subject}
                  </Link>
                ))
              : ['Tamil', 'English', 'Maths', 'Science', 'Social Science'].map((subject) => (
                  <Link
                    key={subject}
                    to={`/class/${classId}/study-material/${subject.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    {subject}
                  </Link>
                ))
            }
          </div>
        </div>

        {/* Recent Materials */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            🔥 Popular Materials
          </h2>
          <div className="space-y-3">
            {resources
              .filter(r => r.class === classId)
              .sort((a, b) => b.downloads - a.downloads)
              .slice(0, 5)
              .map((resource) => (
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
                      <span className="text-[10px] sm:text-xs text-gray-500">{resource.type}</span>
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
      </div>
    </div>
  )
}
