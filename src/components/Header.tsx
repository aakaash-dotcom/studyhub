import { useState } from 'react'
import { Search, Menu, X, BookOpen, GraduationCap } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const navItems = [
    { label: 'School', href: '#school' },
    { label: 'Entrance Exams', href: '#entrance' },
    { label: 'Govt Exams', href: '#recruitment' },
    { label: 'Resources', href: '#resources' },
    { label: 'My Drive', href: '#drive' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                StudyHub
              </h1>
              <p className="text-[10px] text-gray-500 -mt-1">Your Complete Study Resource</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="bg-transparent border-none outline-none ml-2 text-sm w-40"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            <button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
              <BookOpen className="w-4 h-4" />
              My Materials
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
