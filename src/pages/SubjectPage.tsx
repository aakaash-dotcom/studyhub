import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft, FileText, Clock, Download, Eye } from 'lucide-react'
import { tnClasses, categories, resources } from '../data/resources'

export default function SubjectPage() {
  const { classId, category, subject } = useParams()
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

  // Format subject name from URL slug
  const subjectName = subject
    ? subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''

  // Get resources for this class, category, and subject
  const subjectResources = resources.filter(r =>
    r.class === classId &&
    r.category === category &&
    r.subject.toLowerCase() === subjectName.toLowerCase()
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
            <Link to={`/class/${classId}/${category}`} className="hover:text-white">
              {categoryData.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{subjectName}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">
              {subjectName === 'Maths' || subjectName === 'Mathematics' ? '🔢' :
               subjectName === 'Science' ? '🔬' :
               subjectName === 'Physics' ? '⚡' :
               subjectName === 'Chemistry' ? '🧪' :
               subjectName === 'Biology' ? '🧬' :
               subjectName === 'English' ? '📖' :
               subjectName === 'Tamil' ? '📝' :
               subjectName === 'Social Science' ? '🌍' :
               subjectName === 'Computer Science' ? '💻' : '📚'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {subjectName}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {classData.name} • {categoryData.name} • {subjectResources.length} materials
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {subjectResources.length > 0 ? (
          <div className="space-y-3">
            {subjectResources.map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors text-sm sm:text-base truncate">
                    {resource.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500">{resource.medium}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                    <span className="text-[10px] sm:text-xs text-gray-500">{resource.pages} pages</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex-shrink-0 hidden sm:block text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <Clock className="w-3 h-3" /> {resource.size}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Download className="w-3 h-3" /> {resource.downloads.toLocaleString()}
                  </div>
                </div>

                {/* Preview indicator */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium hidden sm:inline">Preview</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Materials Coming Soon</h3>
            <p className="text-sm text-gray-500 mb-6">
              {subjectName} {categoryData.name} for {classData.name} will be added shortly.
            </p>
            <Link
              to={`/class/${classId}/${category}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to {categoryData.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
