import { Link } from 'react-router-dom'
import { Search, BookOpen, FileText, Award, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CLASSES, RESOURCE_TYPES, getRecordsByClass, getPublishedRecords } from '../data/catalogue'
import { trackPageView } from '../lib/events'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const catalogue = getPublishedRecords()

  useEffect(() => {
    trackPageView('/', 'Home')
  }, [])

  const quickSearches = ['Important Questions', 'Model Papers', 'Question Papers', 'Answer Keys', 'Study Notes']

  return (
    <div>
      {/* Hero - Original gradient design */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #17528C 0%, #0E3A66 50%, #1e1b4b 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Ravi's Tuition · Madurai · Since 1999</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              TN State Board
              <span className="block mt-2" style={{ color: '#FCD34D' }}>
                Free Study Materials
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8 px-2">
              Quarterly important questions, model papers & answer keys for Classes 8–12.
              All materials from our Google Drive — browse, preview & download free.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl p-2">
                <Search className="w-5 h-5 ml-4" style={{ color: '#595959' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, papers, syllabus..."
                  className="flex-1 px-4 py-3 text-gray-700 bg-transparent outline-none text-base"
                  style={{ fontSize: '16px' }}
                />
                <button className="text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
                  Search
                </button>
              </div>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 px-2">
              {quickSearches.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${tag}`}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-full text-sm hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: 'rgba(59,130,246,0.3)' }}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Study Materials</h3>
                <p className="text-blue-200 text-sm">Important questions, model papers & notes for all classes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: 'rgba(168,85,247,0.3)' }}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Question Papers</h3>
                <p className="text-blue-200 text-sm">Previous year papers, model papers with answer keys</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: 'rgba(249,115,22,0.3)' }}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Google Drive</h3>
                <p className="text-blue-200 text-sm">Browse all files directly from our Drive folder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#F5F8FC"/>
          </svg>
        </div>
      </section>

      {/* Classes Section - Original card design */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: '#F5F8FC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4" style={{ backgroundColor: '#EFF6FF', color: '#17528C' }}>
              <BookOpen className="w-4 h-4" />
              Samacheer Kalvi
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              Study Material for Class 8 to 12
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: '#595959' }}>
              Tap any class to browse study materials, question papers & more from our Google Drive
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {CLASSES.map((cls) => {
              const count = getRecordsByClass(cls.id).length
              return (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  className="group relative bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
                  style={{ borderColor: '#C0C8D9' }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cls.id === '12' ? 'from-emerald-500 to-teal-600' : cls.id === '11' ? 'from-violet-500 to-purple-600' : cls.id === '10' ? 'from-blue-600 to-indigo-700' : cls.id === '9' ? 'from-orange-500 to-red-500' : 'from-teal-500 to-cyan-600'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10 text-center">
                    <div className="text-3xl sm:text-4xl mb-2">{cls.icon}</div>
                    <h3 className="font-bold text-sm sm:text-base group-hover:text-white transition-colors" style={{ color: '#1A1A1A' }}>
                      {cls.name}
                    </h3>
                    <p className="text-xs mt-1 group-hover:text-white/80 transition-colors" style={{ color: '#595959' }}>
                      {count} materials
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white/90 text-xs">Browse</span>
                      <ArrowRight className="w-3 h-3 text-white/90" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              Browse by Category
            </h2>
            <p className="text-sm sm:text-base" style={{ color: '#595959' }}>
              All materials organized by type — tap to explore
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {RESOURCE_TYPES.map((cat) => (
              <Link
                key={cat.id}
                to="/class/10"
                className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#F5F8FC' }}>
                  <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm mb-1" style={{ color: '#1A1A1A' }}>{cat.name}</h3>
                <p className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{cat.name_ta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Google Drive Section */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: '#F5F8FC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border p-6 sm:p-8 shadow-sm" style={{ borderColor: '#C0C8D9' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F8FC' }}>
                <svg className="w-8 h-8" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l16.75-28.95-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6z" fill="#0066DA"/>
                  <path d="m43.65 25-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6l3.85 6.65z" fill="#00AC47" opacity=".7"/>
                  <path d="m73.55 77.15c1.35-.8 2.5-1.9 3.3-3.3l1.9-3.3-16.6-28.85-17.25 29.95c1.35.8 2.9 1.2 4.5 1.2s3.15-.45 4.5-1.2z" fill="#EA4335" opacity=".7"/>
                  <path d="m43.65 25 17.1 29.6c1.35-.8 2.5-1.9 3.3-3.3l1.9-3.3-16.6-28.85z" fill="#0066DA" opacity=".5"/>
                  <path d="m59.2 10.15-15.55-9.15c-1.35-.8-2.9-1.2-4.5-1.2s-3.15.45-4.5 1.2l-15.55 9.15 17.15 29.7z" fill="#00AC47"/>
                  <path d="m73.4 66.85 3.85-6.65c.8-1.4 1.2-3 1.2-4.6 0-1.6-.4-3.2-1.2-4.6l-13.4-23.2c-.8-1.4-1.95-2.5-3.3-3.3l-17.15 29.7 16.6 28.85c1.35-.8 2.5-1.9 3.3-3.3z" fill="#EA4335" opacity=".7"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Browse All Files on Google Drive
                </h2>
                <p className="text-sm mt-1" style={{ color: '#595959' }}>
                  All our study materials are organized in Google Drive. Browse, preview and download directly.
                </p>
              </div>
            </div>

            {/* Drive Folder Embed */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#C0C8D9' }}>
              <div className="bg-gray-100 aspect-video flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 87.3 78" fill="none">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l16.75-28.95-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6z" fill="#0066DA"/>
                    <path d="m43.65 25-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6l3.85 6.65z" fill="#00AC47" opacity=".7"/>
                    <path d="m73.55 77.15c1.35-.8 2.5-1.9 3.3-3.3l1.9-3.3-16.6-28.85-17.25 29.95c1.35.8 2.9 1.2 4.5 1.2s3.15-.45 4.5-1.2z" fill="#EA4335" opacity=".7"/>
                    <path d="m59.2 10.15-15.55-9.15c-1.35-.8-2.9-1.2-4.5-1.2s-3.15.45-4.5 1.2l-15.55 9.15 17.15 29.7z" fill="#00AC47"/>
                    <path d="m73.4 66.85 3.85-6.65c.8-1.4 1.2-3 1.2-4.6 0-1.6-.4-3.2-1.2-4.6l-13.4-23.2c-.8-1.4-1.95-2.5-3.3-3.3l-17.15 29.7 16.6 28.85c1.35-.8 2.5-1.9 3.3-3.3z" fill="#EA4335" opacity=".7"/>
                  </svg>
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>Google Drive Folder</h3>
                  <p className="text-sm mb-4" style={{ color: '#595959' }}>
                    Replace the folder ID below with your Google Drive folder ID to embed your materials here.
                  </p>
                  <p className="text-xs font-mono p-2 rounded-lg mb-4" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
                    Set drive_folder_id in catalogue.ts → CLASSES
                  </p>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                  >
                    Open Google Drive →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Materials */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                Latest Materials
              </h2>
              <p className="text-sm mt-1" style={{ color: '#595959' }}>Freshly added from our Google Drive</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalogue.slice(0, 6).map((resource) => {
              const classData = CLASSES.find(c => c.id === resource.class)
              return (
                <Link
                  key={resource.id}
                  to={`/resource/${resource.id}`}
                  className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border transition-all shadow-sm hover:shadow-md"
                  style={{ borderColor: '#C0C8D9' }}
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#17528C' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
                      {resource.title_en}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#EFF6FF', color: '#17528C' }}>
                        {resource.resource_type}
                      </span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{classData?.name}</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.subject}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                    FREE
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-16" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66, #1e1b4b)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '5', label: 'Classes', icon: '📚' },
              { value: `${catalogue.length}+`, label: 'Materials', icon: '📄' },
              { value: '10+', label: 'Subjects', icon: '📖' },
              { value: 'Free', label: 'Download', icon: '📥' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
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
