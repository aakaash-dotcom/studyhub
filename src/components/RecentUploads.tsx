import { Clock, FileText, Download, ExternalLink } from 'lucide-react'

interface Upload {
  title: string
  type: string
  class: string
  subject: string
  date: string
  size: string
  driveLink: string
}

export default function RecentUploads() {
  const uploads: Upload[] = [
    {
      title: 'Mathematics Notes - Chapter 1 to 5',
      type: 'Notes',
      class: 'Class 12',
      subject: 'Mathematics',
      date: '2 hours ago',
      size: '15 MB',
      driveLink: '#',
    },
    {
      title: 'Physics Previous Year Papers 2020-2025',
      type: 'Question Paper',
      class: 'Class 12',
      subject: 'Physics',
      date: '5 hours ago',
      size: '8 MB',
      driveLink: '#',
    },
    {
      title: 'English Grammar Complete Guide',
      type: 'Study Material',
      class: 'Class 10',
      subject: 'English',
      date: '1 day ago',
      size: '22 MB',
      driveLink: '#',
    },
    {
      title: 'Biology NCERT Solutions All Chapters',
      type: 'NCERT Solutions',
      class: 'Class 11',
      subject: 'Biology',
      date: '1 day ago',
      size: '12 MB',
      driveLink: '#',
    },
    {
      title: 'Social Science Sample Paper Set A',
      type: 'Sample Paper',
      class: 'Class 10',
      subject: 'Social Science',
      date: '2 days ago',
      size: '5 MB',
      driveLink: '#',
    },
    {
      title: 'Chemistry Important Formulas',
      type: 'Quick Notes',
      class: 'Class 12',
      subject: 'Chemistry',
      date: '2 days ago',
      size: '3 MB',
      driveLink: '#',
    },
    {
      title: 'Hindi Vyakaran Complete Notes',
      type: 'Notes',
      class: 'Class 9',
      subject: 'Hindi',
      date: '3 days ago',
      size: '18 MB',
      driveLink: '#',
    },
    {
      title: 'Computer Science Python Programs',
      type: 'Code Files',
      class: 'Class 12',
      subject: 'Computer Science',
      date: '3 days ago',
      size: '6 MB',
      driveLink: '#',
    },
  ]

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Notes': 'bg-blue-100 text-blue-700',
      'Question Paper': 'bg-red-100 text-red-700',
      'Study Material': 'bg-green-100 text-green-700',
      'NCERT Solutions': 'bg-purple-100 text-purple-700',
      'Sample Paper': 'bg-orange-100 text-orange-700',
      'Quick Notes': 'bg-yellow-100 text-yellow-700',
      'Code Files': 'bg-gray-100 text-gray-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <section id="resources" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Recent Uploads
            </h2>
            <p className="text-gray-600">
              Freshly added study material from Google Drive
            </p>
          </div>
          <a
            href="#"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            View All <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Uploads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploads.map((upload, index) => (
            <a
              key={index}
              href={upload.driveLink}
              className="group flex items-center gap-4 bg-gray-50 hover:bg-blue-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-all duration-200"
            >
              {/* File Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                  {upload.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(upload.type)}`}>
                    {upload.type}
                  </span>
                  <span className="text-xs text-gray-500">{upload.class}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{upload.subject}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex-shrink-0 text-right hidden sm:block">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Clock className="w-3 h-3" />
                  {upload.date}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Download className="w-3 h-3" />
                  {upload.size}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
