import { Link, useParams } from 'react-router-dom'
import { ChevronRight, FileText, Clock, Download, Eye } from 'lucide-react'
import { schoolClasses, resources } from '../data/resources'

export default function SchoolClassPage() {
  const { classId } = useParams()
  const classData = schoolClasses.find(c => c.id === classId)
  const classResources = resources.filter(r => r.category === 'school' && r.class === classData?.name)

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Class not found</h1>
        <Link to="/school" className="text-blue-600 hover:underline">← Back to School</Link>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Notes': 'bg-blue-100 text-blue-700',
      'Question Paper': 'bg-red-100 text-red-700',
      'Sample Paper': 'bg-orange-100 text-orange-700',
      'NCERT Solutions': 'bg-purple-100 text-purple-700',
      'Study Material': 'bg-green-100 text-green-700',
      'Previous Year Paper': 'bg-amber-100 text-amber-700',
      'Syllabus': 'bg-teal-100 text-teal-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto pb-2">
        <Link to="/" className="hover:text-blue-600 whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to="/school" className="hover:text-blue-600 whitespace-nowrap">School</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="text-gray-800 font-medium whitespace-nowrap">{classData.name}</span>
      </nav>

      {/* Header */}
      <div className={`rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-r ${classData.color} text-white`}>
        <div className="text-4xl sm:text-5xl mb-3">{classData.icon}</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{classData.name} Study Materials</h1>
        <p className="text-white/80 text-sm sm:text-base">
          Access notes, NCERT solutions, question papers and more for {classData.name}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {classData.subjects.map((subject) => (
            <span key={subject} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm">
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {['All', 'Notes', 'Question Paper', 'NCERT Solutions', 'Sample Paper', 'Study Material'].map((tab) => (
          <button
            key={tab}
            className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors whitespace-nowrap shadow-sm"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {classResources.length > 0 ? (
          classResources.map((resource) => (
            <Link
              key={resource.id}
              to={`/resource/${resource.id}`}
              className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
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
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500">{resource.subject}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">{resource.pages} pages</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {resource.size}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Download className="w-3 h-3" /> {resource.downloads.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium hidden sm:inline">Preview</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-800 mb-1">Materials Coming Soon</h3>
            <p className="text-sm text-gray-500">New study materials for {classData.name} will be added shortly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
