import { GraduationCap, ArrowRight } from 'lucide-react'

interface ExamCategory {
  name: string
  icon: string
  exams: string[]
  color: string
}

export default function EntranceExams() {
  const categories: ExamCategory[] = [
    {
      name: 'Engineering',
      icon: '⚙️',
      exams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'VITEEE', 'State CETs'],
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    },
    {
      name: 'Medical',
      icon: '🏥',
      exams: ['NEET UG', 'AIIMS', 'JIPMER', 'NEET PG'],
      color: 'bg-red-50 border-red-200 hover:border-red-400',
    },
    {
      name: 'Management',
      icon: '💼',
      exams: ['CAT', 'MAT', 'XAT', 'CMAT', 'NMAT'],
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    },
    {
      name: 'Law',
      icon: '⚖️',
      exams: ['CLAT', 'AILET', 'LSAT', 'SLAT'],
      color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    },
    {
      name: 'Design',
      icon: '🎨',
      exams: ['NIFT', 'NID DAT', 'UCEED', 'CEED'],
      color: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    },
    {
      name: 'Science',
      icon: '🔬',
      exams: ['KVPY', 'INSPIRE', 'NSE', 'Ramanujan'],
      color: 'bg-green-50 border-green-200 hover:border-green-400',
    },
    {
      name: 'Architecture',
      icon: '🏛️',
      exams: ['NATA', 'JEE Paper 2', 'State CETs'],
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    },
    {
      name: 'Commerce',
      icon: '📊',
      exams: ['CUET', 'IPU CET', 'DU JAT'],
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    },
    {
      name: 'Defence',
      icon: '🎖️',
      exams: ['NDA', 'CDS', 'AFCAT', 'INET'],
      color: 'bg-gray-50 border-gray-200 hover:border-gray-400',
    },
    {
      name: 'Pharmacy',
      icon: '💊',
      exams: ['GPAT', 'BITSAT Pharma', 'State CETs'],
      color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
    },
  ]

  return (
    <section id="entrance" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Entrance Exams
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Entrance Exam Preparation
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Syllabus, previous year papers, study materials, and free mock tests for top 
            engineering, medical, law, management and design entrance exams.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className={`group border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${category.color}`}
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-3">{category.name}</h3>
              <ul className="space-y-1.5">
                {category.exams.slice(0, 3).map((exam) => (
                  <li key={exam} className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    {exam}
                  </li>
                ))}
                {category.exams.length > 3 && (
                  <li className="text-xs text-blue-600 font-medium">
                    +{category.exams.length - 3} more
                  </li>
                )}
              </ul>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                View Materials <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
