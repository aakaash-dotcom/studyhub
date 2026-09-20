import { Briefcase, ArrowRight } from 'lucide-react'

interface GovtExam {
  name: string
  icon: string
  description: string
  color: string
  upcoming: boolean
}

export default function RecruitmentExams() {
  const exams: GovtExam[] = [
    {
      name: 'UPSC',
      icon: '🏛️',
      description: 'Civil Services, IFS, CMS & more',
      color: 'from-blue-600 to-blue-800',
      upcoming: true,
    },
    {
      name: 'SSC',
      icon: '📋',
      description: 'CGL, CHSL, MTS, CPO',
      color: 'from-green-600 to-green-800',
      upcoming: true,
    },
    {
      name: 'Banking',
      icon: '🏦',
      description: 'IBPS PO, SBI PO, RRB',
      color: 'from-purple-600 to-purple-800',
      upcoming: false,
    },
    {
      name: 'Railway',
      icon: '🚂',
      description: 'RRB NTPC, Group D, ALP',
      color: 'from-orange-600 to-orange-800',
      upcoming: true,
    },
    {
      name: 'Defence',
      icon: '🎖️',
      description: 'NDA, CDS, AFCAT',
      color: 'from-gray-600 to-gray-800',
      upcoming: false,
    },
    {
      name: 'Teaching',
      icon: '👨‍🏫',
      description: 'CTET, KVS, NVS, TET',
      color: 'from-teal-600 to-teal-800',
      upcoming: true,
    },
    {
      name: 'Police',
      icon: '👮',
      description: 'State Police, CAPF, CISF',
      color: 'from-indigo-600 to-indigo-800',
      upcoming: false,
    },
    {
      name: 'State PSC',
      icon: '🗺️',
      description: 'State level civil services',
      color: 'from-rose-600 to-rose-800',
      upcoming: true,
    },
  ]

  return (
    <section id="recruitment" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" />
            Government Exams
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recruitment Exam Preparation
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Notifications, eligibility criteria, syllabus, and study materials for UPSC, SSC, 
            Banking, Railway, Teaching and other government job exams.
          </p>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.name}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              {/* Top gradient bar */}
              <div className={`h-2 bg-gradient-to-r ${exam.color}`} />
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{exam.icon}</span>
                  {exam.upcoming && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{exam.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{exam.description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Resources <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
