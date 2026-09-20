import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { schoolClasses, boards, resources } from '../data/resources'

export default function SchoolPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">School</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium mb-3">
          <BookOpen className="w-4 h-4" />
          School Materials
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Study Material for Class 1 to 12
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          NCERT solutions, notes, sample papers and study materials for all classes and boards.
        </p>
      </div>

      {/* Boards */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Board</h3>
        <div className="flex flex-wrap gap-2">
          {boards.map((board) => (
            <button
              key={board}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
            >
              {board}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {schoolClasses.map((cls) => {
          const count = resources.filter(r => r.class === cls.name).length
          return (
            <Link
              key={cls.id}
              to={`/school/${cls.id}`}
              className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10 text-center">
                <div className="text-3xl sm:text-4xl mb-2">{cls.icon}</div>
                <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors text-sm sm:text-base">
                  {cls.name}
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors mt-1">
                  {count} materials
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'NCERT Solutions', icon: '📘', color: 'bg-purple-50 border-purple-100' },
          { label: 'Sample Papers', icon: '📄', color: 'bg-blue-50 border-blue-100' },
          { label: 'Previous Papers', icon: '📝', color: 'bg-orange-50 border-orange-100' },
          { label: 'Syllabus', icon: '📋', color: 'bg-green-50 border-green-100' },
        ].map((link) => (
          <Link
            key={link.label}
            to="/school"
            className={`flex items-center gap-3 p-4 rounded-xl border ${link.color} hover:shadow-md transition-all`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium text-sm text-gray-800">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
