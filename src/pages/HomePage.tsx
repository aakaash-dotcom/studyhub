import { Link } from 'react-router-dom'
import { Search, BookOpen, FileText, Award, Clock, Download, ArrowRight, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { resources, schoolClasses, entranceCategories, govtExamCategories } from '../data/resources'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const recentResources = resources.slice(0, 6)

  const quickSearches = ['NCERT Solutions', 'Sample Papers', 'Syllabus', 'Previous Year Papers', 'Study Notes']

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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">Free Study Materials from Google Drive</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Your Complete Study Resource
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mt-1">
                School, Entrance & Govt Exams
              </span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
              Access study materials, notes, question papers & exam resources — all organized in Google Drive. Login to download.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-6 sm:mb-8">
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center bg-white rounded-2xl shadow-2xl p-1.5 sm:p-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, papers, syllabus..."
                  className="flex-1 px-3 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-transparent outline-none"
                />
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Search
                </button>
              </form>
            </div>

            {/* Quick tags */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2">
              {quickSearches.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${tag}`}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-full text-xs sm:text-sm hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* School Section */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">School Materials</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Class 1 to 12 — All boards</p>
            </div>
            <Link to="/school" className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {schoolClasses.slice(0, 12).map((cls) => (
              <Link
                key={cls.id}
                to={`/school/${cls.id}`}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10 text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{cls.icon}</div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-white transition-colors text-xs sm:text-sm">
                    {cls.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Entrance Exams */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Entrance Exams</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">JEE, NEET, CAT, CLAT & more</p>
            </div>
            <Link to="/exams" className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {entranceCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/exams/${cat.id}`}
                className={`group border rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cat.color}`}
              >
                <div className="text-2xl sm:text-3xl mb-2">{cat.icon}</div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.exams.length} exams</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Govt Exams */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Government Exams</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">UPSC, SSC, Banking & more</p>
            </div>
            <Link to="/govt-exams" className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                <h3 className="font-semibold text-gray-800 text-sm">{exam.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{exam.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Recent Uploads</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Freshly added study materials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recentResources.map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors text-sm truncate">
                      {resource.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(resource.type)}`}>
                        {resource.type}
                      </span>
                      <span className="text-[10px] text-gray-500">{resource.class}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" /> {resource.size}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Download className="w-3 h-3" /> {resource.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: BookOpen, value: '50K+', label: 'Study Resources' },
              { icon: FileText, value: '10K+', label: 'Question Papers' },
              { icon: Award, value: '500+', label: 'Exams Covered' },
              { icon: ExternalLink, value: '1M+', label: 'Downloads' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <p className="text-blue-200 text-xs sm:text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
