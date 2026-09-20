import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, GraduationCap, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b" style={{ borderColor: '#C0C8D9' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight" style={{ color: '#17528C' }}>
                Ravi's Tuition
              </h1>
              <p className="text-[9px] -mt-0.5 hidden sm:block" style={{ color: '#595959' }}>
                MADURAI · SINCE 1999
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <Link to="/" className="px-3 py-2 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors" style={{ color: '#1A1A1A' }}>
              Home
            </Link>
            <Link to="/class/10" className="px-3 py-2 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors" style={{ color: '#1A1A1A' }}>
              10th
            </Link>
            <Link to="/class/12" className="px-3 py-2 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors" style={{ color: '#1A1A1A' }}>
              12th
            </Link>
            <Link to="/class/9" className="px-3 py-2 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors" style={{ color: '#1A1A1A' }}>
              9th
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center rounded-full px-3 py-1.5 animate-in" style={{ backgroundColor: '#F5F8FC' }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#595959' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none ml-2 text-sm w-28 sm:w-48"
                  style={{ color: '#1A1A1A', fontSize: '16px' }}
                  autoFocus
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4" style={{ color: '#595959' }} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                style={{ color: '#595959' }}
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || user?.phone?.slice(-2)}
                  </div>
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0] || user?.phone?.slice(-4)}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50" style={{ borderColor: '#C0C8D9' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: '#C0C8D9' }}>
                      <p className="font-medium text-sm" style={{ color: '#1A1A1A' }}>{user?.name || 'Student'}</p>
                      <p className="text-xs" style={{ color: '#595959' }}>{user?.phone}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                      style={{ color: '#1A1A1A' }}
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 w-full text-left"
                      style={{ color: '#B91C1C' }}
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              style={{ color: '#595959' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t py-3 px-3 shadow-lg" style={{ borderColor: '#C0C8D9' }}>
          <nav className="space-y-1">
            {[
              { to: '/', label: '🏠 Home' },
              { to: '/class/10', label: '🏆 10th Standard' },
              { to: '/class/12', label: '🎖️ 12th Standard' },
              { to: '/class/9', label: '🎓 9th Standard' },
              { to: '/class/11', label: '📖 11th Standard' },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors font-medium" style={{ color: '#1A1A1A' }}>
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors font-medium" style={{ color: '#17528C' }}>
                🔑 Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
