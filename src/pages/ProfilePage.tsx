import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Phone } from 'lucide-react'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Login Required</h1>
        <p className="text-sm mb-6" style={{ color: '#595959' }}>Please login to view your profile</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium"
          style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
        >
          <User className="w-4 h-4" /> Login Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#C0C8D9' }}>
        <div className="p-6 text-white text-center" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
            <span className="text-2xl font-bold">{user.phone.slice(-2)}</span>
          </div>
          <h1 className="text-xl font-bold">{user.phone}</h1>
          <p className="text-sm opacity-80 mt-1">Student Account</p>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F8FC' }}>
            <Phone className="w-4 h-4" style={{ color: '#595959' }} />
            <div>
              <p className="text-xs" style={{ color: '#595959' }}>Phone</p>
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>+91 {user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F8FC' }}>
            <User className="w-4 h-4" style={{ color: '#595959' }} />
            <div>
              <p className="text-xs" style={{ color: '#595959' }}>Status</p>
              <p className="text-sm font-medium" style={{ color: '#15803D' }}>✓ Verified</p>
            </div>
          </div>
        </div>

        <div className="border-t p-6" style={{ borderColor: '#C0C8D9' }}>
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="w-full flex items-center justify-center gap-2 py-2.5 border rounded-xl text-sm font-medium"
            style={{ borderColor: '#FECACA', color: '#B91C1C' }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
