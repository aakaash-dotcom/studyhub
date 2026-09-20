import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Target, Building, User } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const isActive = (p: string) => {
    if (p === '/' && path === '/') return true
    if (p !== '/' && path.startsWith(p)) return true
    return false
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/school', icon: BookOpen, label: 'School' },
    { path: '/exams', icon: Target, label: 'Exams' },
    { path: '/govt-exams', icon: Building, label: 'Govt' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            {isActive(item.path) && (
              <div className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
