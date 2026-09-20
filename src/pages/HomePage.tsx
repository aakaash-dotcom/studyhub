import { Link } from 'react-router-dom'
import { Search, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { tnClasses } from '../data/resources'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">Tamil Nadu State Board - Samacheer Kalvi</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              TN State Board
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mt-1">
                Free Study Materials
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Download free study materials, question papers, model papers & notes for Class 1 to 12
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-6 sm:mb-8">
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center bg-white rounded-2xl shadow-2xl p-1.5 sm:p-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search study materials..."
                  className="flex-1 px-3 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-transparent outline-none"
                />
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Classes Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Select Your Class
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Choose your class to access study materials
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {tnClasses.map((cls) => (
              <Link
                key={cls.id}
                to={`/class/${cls.id}`}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10 text-center">
                  <div className="text-3xl sm:text-4xl mb-2">{cls.icon}</div>
                  <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors text-xs sm:text-sm">
                    {cls.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  About TN State Board Materials
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  All study materials are based on the Tamil Nadu State Board Samacheer Kalvi syllabus. 
                  Materials include study guides, question papers, model papers, important questions, 
                  notes, solutions, and complete syllabus for all subjects.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">12</p>
                    <p className="text-xs text-gray-500">Classes</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">50+</p>
                    <p className="text-xs text-gray-500">Subjects</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">1000+</p>
                    <p className="text-xs text-gray-500">PDFs</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">Free</p>
                    <p className="text-xs text-gray-500">Download</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
