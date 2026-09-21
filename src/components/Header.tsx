import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Check if user has pro plan
  const hasProPlan = (() => {
    try {
      const plan = localStorage.getItem('ravi_plan')
      if (plan) {
        const planData = JSON.parse(plan)
        return planData.plan === 'pro' && planData.valid_until > Date.now()
      }
    } catch (e) {
      // Ignore parse errors
    }
    return false
  })()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header style={{ backgroundColor: '#17528C', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span style={{ color: '#17528C' }} className="font-bold text-lg">RT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold leading-tight">Ravi's Tuition</h1>
              <p className="text-[10px] opacity-80">MADURAI · SINCE 1999</p>
            </div>
          </Link>

          {/* Compact Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search papers..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-4">
            <Link to="/plans" className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
              Plans
            </Link>
            {isAuthenticated && user?.name ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium" style={{ color: '#17528C' }}>
                  {user.name.split(' ')[0]}
                </Link>
                {hasProPlan && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                    PRO
                  </span>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium" style={{ color: '#17528C' }}>
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link 
              to="/plans"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
              style={{ backgroundColor: '#D4AF37', color: 'white' }}
            >
              Plans
            </Link>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden mt-3 pb-3 flex flex-col gap-2">
            {isAuthenticated && user?.name ? (
              <div className="flex items-center gap-2 mb-2">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium flex-1 text-center" style={{ color: '#17528C' }}>
                  {user.name.split(' ')[0]}
                </Link>
                {hasProPlan && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                    PRO
                  </span>
                )}
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-center" style={{ color: '#17528C' }}>
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
