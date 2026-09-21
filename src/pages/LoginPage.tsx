import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanniyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
]

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    class: '',
    district: '',
    whatsappConsent: true
  })
  const [error, setError] = useState('')

  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as any)?.from || '/'

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.name.length < 2 || formData.name.length > 40) {
      setError('Name must be 2-40 characters')
      return
    }

    if (formData.phone.length !== 10) {
      setError('Phone must be 10 digits')
      return
    }

    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.class) {
      setError('Please select your class')
      return
    }

    if (!formData.district) {
      setError('Please select your district')
      return
    }

    login({
      name: formData.name,
      phone: formData.phone,
      class: formData.class,
      district: formData.district,
      whatsappConsent: formData.whatsappConsent
    })

    navigate(from)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4" style={{ backgroundColor: '#F5F8FC' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm" style={{ border: '1px solid #C0C8D9' }}>
            <span style={{ color: '#17528C' }} className="font-bold text-2xl">RT</span>
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>Ravi's Tuition</h2>
          <p className="text-xs" style={{ color: '#595959' }}>MADURAI · SINCE 1999</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: '#C0C8D9' }}>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Who you are</h3>
                  <p className="text-xs mt-1" style={{ color: '#595959' }}>Step 1 of 2</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border rounded-xl outline-none"
                    style={{ color: '#1A1A1A', borderColor: '#C0C8D9', fontSize: '16px' }}
                    required
                    minLength={2}
                    maxLength={40}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                    Phone
                  </label>
                  <div className="relative flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#C0C8D9' }}>
                    <span className="px-3 py-3 text-sm font-medium" style={{ backgroundColor: '#F5F8FC', color: '#595959' }}>+91</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="9876543210"
                      className="flex-1 px-3 py-3 outline-none"
                      style={{ color: '#1A1A1A', fontSize: '16px' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                >
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Class and place</h3>
                  <p className="text-xs mt-1" style={{ color: '#595959' }}>Step 2 of 2</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                    Class
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl outline-none bg-white"
                    style={{ color: '#1A1A1A', borderColor: '#C0C8D9' }}
                    required
                  >
                    <option value="">Select class</option>
                    <option value="8">8th Standard</option>
                    <option value="9">9th Standard</option>
                    <option value="10">10th Standard</option>
                    <option value="11">11th Standard</option>
                    <option value="12">12th Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                    District
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl outline-none bg-white"
                    style={{ color: '#1A1A1A', borderColor: '#C0C8D9' }}
                    required
                  >
                    <option value="">Select district</option>
                    {TN_DISTRICTS.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.whatsappConsent}
                    onChange={(e) => setFormData({ ...formData, whatsappConsent: e.target.checked })}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="text-xs" style={{ color: '#595959' }}>
                    I agree to be contacted on WhatsApp about exam materials.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                >
                  Save and download
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm"
                  style={{ color: '#17528C' }}
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#C0C8D9' }}>
          <h4 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>Why login?</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '📥', text: 'Download full PDFs' },
              { icon: '📱', text: 'Access on all devices' },
              { icon: '🔔', text: 'Exam updates' },
              { icon: '🆓', text: '100% Free' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs" style={{ color: '#595959' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
