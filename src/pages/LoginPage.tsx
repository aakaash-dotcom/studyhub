import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Phone, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { sendOtp, verifyOtp } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as any)?.from || '/'

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const result = await sendOtp(phone)
    setLoading(false)

    if (result.success) {
      setMessage(result.message)
      setStep('otp')
    } else {
      setError(result.message)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await verifyOtp(phone, otp)
    setLoading(false)

    if (success) {
      navigate(from)
    } else {
      setError('Invalid OTP. Please try again.')
    }
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
              <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                ⚠️ {error}
              </div>
            )}
            {message && step === 'otp' && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#F5F8FC', color: '#17528C', border: '1px solid #C0C8D9' }}>
                {message}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                    <Phone className="w-6 h-6" style={{ color: '#17528C' }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Login with Phone</h3>
                  <p className="text-xs mt-1" style={{ color: '#595959' }}>Enter your 10-digit mobile number</p>
                </div>

                <div>
                  <div className="relative flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#C0C8D9' }}>
                    <span className="px-3 py-3 text-sm font-medium" style={{ backgroundColor: '#F5F8FC', color: '#595959' }}>+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="flex-1 px-3 py-3 outline-none"
                      style={{ color: '#1A1A1A', fontSize: '16px' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send OTP →</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                    <KeyRound className="w-6 h-6" style={{ color: '#17528C' }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Enter OTP</h3>
                  <p className="text-xs mt-1" style={{ color: '#595959' }}>Sent to +91 {phone}</p>
                </div>

                <div>
                  <input
                    type="tel"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="w-full px-4 py-3 border rounded-xl text-center text-lg tracking-widest outline-none"
                    style={{ color: '#1A1A1A', borderColor: '#C0C8D9', fontSize: '16px' }}
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify & Login →</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm"
                  style={{ color: '#17528C' }}
                >
                  ← Change number
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
