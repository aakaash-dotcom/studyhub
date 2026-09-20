import { BookOpen, ExternalLink } from 'lucide-react'

interface ClassItem {
  class: string
  color: string
  icon: string
  driveLink?: string
}

export default function SchoolSection() {
  const classes: ClassItem[] = [
    { class: 'Class 12', color: 'from-red-500 to-pink-600', icon: '🎓' },
    { class: 'Class 11', color: 'from-orange-500 to-red-500', icon: '📚' },
    { class: 'Class 10', color: 'from-yellow-500 to-orange-500', icon: '📝' },
    { class: 'Class 9', color: 'from-green-500 to-emerald-600', icon: '📖' },
    { class: 'Class 8', color: 'from-teal-500 to-cyan-600', icon: '🔬' },
    { class: 'Class 7', color: 'from-blue-500 to-indigo-600', icon: '🌍' },
    { class: 'Class 6', color: 'from-indigo-500 to-purple-600', icon: '🧮' },
    { class: 'Class 5', color: 'from-purple-500 to-pink-500', icon: '🎨' },
    { class: 'Class 4', color: 'from-pink-500 to-rose-500', icon: '✏️' },
    { class: 'Class 3', color: 'from-cyan-500 to-blue-500', icon: '📐' },
    { class: 'Class 2', color: 'from-emerald-500 to-green-500', icon: '🌱' },
    { class: 'Class 1', color: 'from-amber-500 to-yellow-500', icon: '⭐' },
  ]

  const boards = ['CBSE', 'ICSE', 'UP Board', 'Bihar Board', 'Maharashtra Board', 'Rajasthan Board']

  return (
    <section id="school" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            School Materials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Study Material for Class 1 to 12
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access NCERT solutions, notes, sample papers, and study materials for all classes.
            Content is organized in Google Drive for easy access.
          </p>
        </div>

        {/* Boards */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {boards.map((board) => (
            <span
              key={board}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-colors shadow-sm"
            >
              {board}
            </span>
          ))}
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {classes.map((item) => (
            <a
              key={item.class}
              href="#"
              className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-800 group-hover:text-white transition-colors">
                  {item.class}
                </h3>
                <div className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white/90 text-xs">Open Drive</span>
                  <ExternalLink className="w-3 h-3 text-white/90" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="#drive"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <ExternalLink className="w-4 h-4" />
            Browse All Materials on Drive
          </a>
        </div>
      </div>
    </section>
  )
}
