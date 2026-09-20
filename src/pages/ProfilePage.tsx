import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Phone, BookOpen, Calendar, LogOut, Download, Shield, Trash2, FileDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile, exportUserData, deleteUserData } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    class: user?.class || '',
    school: user?.school || '',
    medium: user?.medium || '',
    district: user?.district || '',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleSave = () => {
    updateProfile(formData)
    setEditing(false)
  }

  const handleExport = () => {
    const data = exportUserData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my_data_${user.phone}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = () => {
    deleteUserData()
    navigate('/')
  }

  const stageLabels = {
    phone: 'Phone Verified',
    name_class: 'Basic Info Needed',
    school_medium: 'School Info Needed',
    district_intent: 'Almost Complete',
    complete: 'Complete ✓',
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#C0C8D9' }}>
        {/* Header */}
        <div className="p-6 sm:p-8 text-white text-center" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
            <span className="text-2xl font-bold">{user.name?.charAt(0)?.toUpperCase() || user.phone.slice(-2)}</span>
          </div>
          <h1 className="text-xl font-bold">{user.name || 'Student'}</h1>
          <p className="text-blue-200 text-sm mt-1">{user.phone}</p>
          {user.class && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs">
              {user.class} {user.medium && `· ${user.medium}`}
            </span>
          )}
        </div>

        {/* Profile Stage */}
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#C0C8D9', backgroundColor: '#F5F8FC' }}>
          <span className="text-xs font-medium" style={{ color: '#595959' }}>Profile Status</span>
          <span className="text-xs font-medium" style={{ color: user.profileStage === 'complete' ? '#15803D' : '#B45309' }}>
            {stageLabels[user.profileStage]}
          </span>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          {editing ? (
            <>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#595959' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#C0C8D9', color: '#1A1A1A', fontSize: '16px' }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#595959' }}>Class</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white"
                  style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}
                >
                  <option value="">Select class</option>
                  {['8', '9', '10', '11', '12'].map(c => (
                    <option key={c} value={c}>{c}th Standard</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#595959' }}>School</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#C0C8D9', color: '#1A1A1A', fontSize: '16px' }}
                  placeholder="School name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#595959' }}>Medium</label>
                <select
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white"
                  style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}
                >
                  <option value="">Select medium</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: '#C0C8D9', color: '#595959' }}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F8FC' }}>
                <Phone className="w-4 h-4" style={{ color: '#595959' }} />
                <div>
                  <p className="text-xs" style={{ color: '#595959' }}>Phone</p>
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>+91 {user.phone}</p>
                </div>
              </div>
              {user.name && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F8FC' }}>
                  <User className="w-4 h-4" style={{ color: '#595959' }} />
                  <div>
                    <p className="text-xs" style={{ color: '#595959' }}>Name</p>
                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{user.name}</p>
                  </div>
                </div>
              )}
              {user.class && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F8FC' }}>
                  <BookOpen className="w-4 h-4" style={{ color: '#595959' }} />
                  <div>
                    <p className="text-xs" style={{ color: '#595959' }}>Class</p>
                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{user.class}th Standard {user.medium && `· ${user.medium}`}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F8FC' }}>
                <Calendar className="w-4 h-4" style={{ color: '#595959' }} />
                <div>
                  <p className="text-xs" style={{ color: '#595959' }}>Member Since</p>
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="w-full py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: '#17528C', color: '#17528C' }}>
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* DPDP Section */}
        <div className="border-t p-5" style={{ borderColor: '#C0C8D9' }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" style={{ color: '#17528C' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Your Data (DPDP Act 2023)</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-lg text-xs font-medium" style={{ borderColor: '#C0C8D9', color: '#595959' }}>
              <FileDown className="w-3 h-3" /> Export Data
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-lg text-xs font-medium" style={{ borderColor: '#FECACA', color: '#B91C1C' }}>
              <Trash2 className="w-3 h-3" /> Delete Data
            </button>
          </div>
          {showDeleteConfirm && (
            <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p className="font-medium mb-2" style={{ color: '#B91C1C' }}>This will permanently delete all your data. Are you sure?</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} className="flex-1 py-1.5 rounded text-xs font-medium text-white" style={{ backgroundColor: '#B91C1C' }}>
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-1.5 rounded text-xs font-medium border" style={{ borderColor: '#C0C8D9', color: '#595959' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="border-t p-5" style={{ borderColor: '#C0C8D9' }}>
          <button
            onClick={() => { logout(); navigate('/'); }}
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
