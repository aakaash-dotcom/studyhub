import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, CreditCard, CheckCircle } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PayProPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.name || !user?.phone || !user?.class || !user?.district) {
      navigate('/login', { state: { from: '/pay/pro' } })
    }
  }, [isAuthenticated, user, navigate])

  const markPro = () => {
    const plan = {
      plan: 'pro',
      class: user?.class,
      phone: user?.phone,
      paid_at: Date.now(),
      valid_until: Date.now() + 365 * 24 * 60 * 60 * 1000 // 365 days
    }
    localStorage.setItem('ravi_plan', JSON.stringify(plan))
    setPaymentSuccess(true)
    setTimeout(() => {
      navigate('/class/10')
    }, 2000)
  }

  const handlePayment = async () => {
    setLoading(true)

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

    if (razorpayKeyId) {
      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: razorpayKeyId,
          amount: 49900, // 499 INR in paise
          currency: 'INR',
          name: "Ravi's Tuition",
          description: 'Pro — exam year',
          handler: function () {
            markPro()
          },
          prefill: {
            name: user?.name || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#1e3a5f'
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
      }
      script.onerror = () => {
        alert('Failed to load payment gateway. Please try again.')
        setLoading(false)
      }
      document.body.appendChild(script)
    } else {
      // Demo mode
      setLoading(false)
      setShowDemoModal(true)
    }
  }

  const handleDemoPayment = () => {
    setShowDemoModal(false)
    markPro()
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
        <div className="bg-white rounded-2xl border-2 p-8 max-w-md text-center" style={{ borderColor: '#15803D' }}>
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#15803D' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Payment Successful!
          </h2>
          <p className="mb-4" style={{ color: '#595959' }}>
            You now have PRO access for this exam year.
          </p>
          <p className="text-sm" style={{ color: '#595959' }}>
            Redirecting to your materials...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e3a5f' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Demo Banner */}
        {!import.meta.env.VITE_RAZORPAY_KEY_ID && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm font-medium" style={{ color: '#92400E' }}>
              Demo checkout — no money taken
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: '#D4AF37' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              PRO Plan
            </h1>
            <p className="text-lg mb-4" style={{ color: '#595959' }}>
              All Ravi PDFs + updates + weekly test
            </p>
            <div className="text-5xl font-bold mb-2" style={{ color: '#D4AF37' }}>
              ₹499
            </div>
            <p className="text-sm" style={{ color: '#595959' }}>
              One-time payment • Valid for 365 days
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>
              What you get:
            </h3>
            {[
              'Important Questions (ImpQ)',
              'Model Question Papers',
              'Topper Materials',
              'Weekly practice tests',
              'Exam updates & alerts',
              'All TN State Board subjects'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#15803D' }} />
                <span style={{ color: '#1A1A1A' }}>{feature}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 mb-6" style={{ borderColor: '#C0C8D9' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
              Payment Details
            </h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#595959' }}>Name</span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>{user.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#595959' }}>Phone</span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>+91 {user.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#595959' }}>Class</span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>{user.class}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#595959' }}>District</span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>{user.district}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#D4AF37', color: 'white' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹499 securely
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: '#595959' }}>
            <Shield className="w-4 h-4" />
            <span>Secure payment via Razorpay</span>
          </div>

          <div className="mt-6 text-center">
            <Link to="/plans" className="text-sm" style={{ color: '#17528C' }}>
              ← Back to plans
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Demo Checkout
            </h2>
            <p className="mb-6" style={{ color: '#595959' }}>
              This is a demo checkout. No actual payment will be processed. Click "Pay Demo" to simulate a successful payment and get PRO access.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDemoPayment}
                className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4AF37', color: 'white' }}
              >
                Pay Demo
              </button>
              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full py-3 rounded-xl font-medium border-2"
                style={{ borderColor: '#C0C8D9', color: '#595959' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
