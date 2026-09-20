import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, BookOpen, Calendar, LogOut, Download, Heart, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
        <p className="text-gray-500 mb-6">Please login to view your profile</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <User className="w-4 h-4" /> Login Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
            <span className="text-3xl font-bold">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
          <p className="text-blue-200 text-sm mt-1">{user.email}</p>
          {user.class && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs">
              {user.class} {user.board && `• ${user.board}`}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            Account Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800">{user.phone}</p>
                </div>
              </div>
            )}
            {user.class && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Class & Board</p>
                  <p className="text-sm font-medium text-gray-800">{user.class} {user.board && `• ${user.board}`}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(user.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Download className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">0</p>
              <p className="text-[10px] text-gray-500">Downloads</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-red-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">0</p>
              <p className="text-[10px] text-gray-500">Favorites</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">Free</p>
              <p className="text-[10px] text-gray-500">Plan</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-5 sm:p-6">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
