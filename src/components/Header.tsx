import { Link } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  return (
    <header style={{ backgroundColor: '#17528C', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span style={{ color: '#17528C' }} className="font-bold text-xl">RT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Ravi's Tuition</h1>
              <p className="text-xs opacity-80">MADURAI · SINCE 1999</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:opacity-80">Home</Link>
            <Link to="/class/10" className="hover:opacity-80">10th</Link>
            <Link to="/class/11" className="hover:opacity-80">11th</Link>
            <Link to="/class/12" className="hover:opacity-80">12th</Link>
            {isAuthenticated && user?.name ? (
              <Link to="/profile" className="bg-white px-4 py-2 rounded-lg font-medium" style={{ color: '#17528C' }}>
                {user.name.split(' ')[0]}
              </Link>
            ) : (
              <Link to="/login" className="bg-white px-4 py-2 rounded-lg font-medium" style={{ color: '#17528C' }}>
                Login
              </Link>
            )}
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/class/10" onClick={() => setMenuOpen(false)}>10th Standard</Link>
            <Link to="/class/11" onClick={() => setMenuOpen(false)}>11th Standard</Link>
            <Link to="/class/12" onClick={() => setMenuOpen(false)}>12th Standard</Link>
            {isAuthenticated && user?.name ? (
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="bg-white px-4 py-2 rounded-lg font-medium text-center" style={{ color: '#17528C' }}>
                {user.name.split(' ')[0]}
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="bg-white px-4 py-2 rounded-lg font-medium text-center" style={{ color: '#17528C' }}>
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
