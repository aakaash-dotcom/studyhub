import { FileText, ClipboardList, BookOpen, Calendar, Newspaper, School } from 'lucide-react'

export default function QuickLinks() {
  const links = [
    {
      icon: FileText,
      label: 'Question Papers',
      description: 'Previous year papers for all exams',
      color: 'bg-red-100 text-red-600',
      hoverColor: 'hover:bg-red-50',
    },
    {
      icon: ClipboardList,
      label: 'Sample Papers',
      description: 'Practice papers with solutions',
      color: 'bg-blue-100 text-blue-600',
      hoverColor: 'hover:bg-blue-50',
    },
    {
      icon: BookOpen,
      label: 'Syllabus',
      description: 'Complete syllabus for all boards',
      color: 'bg-green-100 text-green-600',
      hoverColor: 'hover:bg-green-50',
    },
    {
      icon: Calendar,
      label: 'Date Sheet',
      description: 'Exam schedules & timetables',
      color: 'bg-purple-100 text-purple-600',
      hoverColor: 'hover:bg-purple-50',
    },
    {
      icon: Newspaper,
      label: 'Latest News',
      description: 'Education updates & notifications',
      color: 'bg-orange-100 text-orange-600',
      hoverColor: 'hover:bg-orange-50',
    },
    {
      icon: School,
      label: 'All Boards',
      description: 'CBSE, ICSE & State Boards',
      color: 'bg-teal-100 text-teal-600',
      hoverColor: 'hover:bg-teal-50',
    },
  ]

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Most Searched Resources
          </h2>
          <p className="text-gray-600">
            Quick access to the study material students look for the most
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href="#"
              className={`group flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${link.hoverColor}`}
            >
              <div className={`w-14 h-14 ${link.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <link.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{link.label}</h3>
              <p className="text-xs text-gray-500">{link.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
