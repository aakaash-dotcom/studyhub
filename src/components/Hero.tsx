import { Search, BookOpen, FileText, Award } from 'lucide-react'
import { useState } from 'react'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  const quickSearches = [
    'NCERT Solutions',
    'Sample Papers',
    'Syllabus',
    'Previous Year Papers',
    'Study Notes',
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Free Study Materials from Google Drive</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your Complete Study Resource for
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              School, Entrance & Govt Exams
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Access study materials, notes, question papers, and exam resources — all organized 
            and accessible from your Google Drive. Study smarter, not harder.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-white rounded-2xl shadow-2xl p-2">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for notes, papers, syllabus..."
                className="flex-1 px-4 py-3 text-gray-700 bg-transparent outline-none text-base"
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                Search
              </button>
            </div>
          </div>

          {/* Quick search tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {quickSearches.map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-full text-sm hover:bg-white/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <div className="bg-blue-500/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Study Materials</h3>
              <p className="text-blue-200 text-sm">NCERT solutions, notes & reference materials for all classes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <div className="bg-purple-500/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Question Papers</h3>
              <p className="text-blue-200 text-sm">Previous year papers, sample papers & mock tests</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <div className="bg-orange-500/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Exam Updates</h3>
              <p className="text-blue-200 text-sm">Latest notifications, datesheets & exam schedules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
        </svg>
      </div>
    </section>
  )
}
