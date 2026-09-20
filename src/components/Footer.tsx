import { Link } from 'react-router-dom'
import { GraduationCap, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">TN StudyHub</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Free study materials for Tamil Nadu State Board - Samacheer Kalvi. Class 1 to 12.
            </p>
          </div>

          {/* Classes */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Classes</h4>
            <ul className="space-y-2">
              {['10', '11', '12', '9', '8'].map((c) => (
                <li key={c}>
                  <Link to={`/class/${c}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {c}th Standard
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Categories</h4>
            <ul className="space-y-2">
              {['Study Material', 'Question Papers', 'Model Papers', 'Notes', 'Solutions'].map((c) => (
                <li key={c}>
                  <Link to="/class/10" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Subjects</h4>
            <ul className="space-y-2">
              {['Maths', 'Science', 'English', 'Tamil', 'Social Science'].map((s) => (
                <li key={s}>
                  <Link to="/class/10" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {s}
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
            © 2026 TN StudyHub. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for TN Students
          </p>
        </div>
      </div>
    </footer>
  )
}
