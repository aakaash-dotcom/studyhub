import { Link } from 'react-router-dom'
import { GraduationCap, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">StudyHub</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your complete study resource. Free NCERT solutions, notes, question papers and more.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">School</h4>
            <ul className="space-y-2">
              {['Class 12', 'Class 11', 'Class 10', 'Class 9', 'Class 8'].map((c) => (
                <li key={c}>
                  <Link to={`/school/${c.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Entrance</h4>
            <ul className="space-y-2">
              {['JEE Main', 'NEET UG', 'CAT', 'CLAT', 'NDA'].map((e) => (
                <li key={e}>
                  <Link to="/exams" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {e}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Govt Exams</h4>
            <ul className="space-y-2">
              {['UPSC', 'SSC CGL', 'IBPS PO', 'RRB NTPC', 'CTET'].map((e) => (
                <li key={e}>
                  <Link to="/govt-exams" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {e}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2">
              {['Question Papers', 'Sample Papers', 'NCERT Solutions', 'Syllabus', 'Notes'].map((r) => (
                <li key={r}>
                  <Link to="/school" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © 2026 StudyHub. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for students
          </p>
        </div>
      </div>
    </footer>
  )
}
