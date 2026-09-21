import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

interface LockModalProps {
  isOpen: boolean
  onClose: () => void
}

const titles = [
  "This one's not on the house.",
  "Nice try. That's Pro.",
  "Free plan stops at old question papers."
]

const bodies = [
  "Past papers are free. This is the one that actually shows up in the exam.",
  "₹499/year. Less than a guide book. More useful than your group chat PDFs.",
  "You can stare at the crown. Download is a Pro thing."
]

export default function LockModal({ isOpen, onClose }: LockModalProps) {
  if (!isOpen) return null

  const randomTitle = titles[Math.floor(Math.random() * titles.length)]
  const randomBody = bodies[Math.floor(Math.random() * bodies.length)]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative" style={{ border: '2px solid #D4AF37' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: '#595959' }}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-4">👑</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            {randomTitle}
          </h2>
          <p className="text-sm" style={{ color: '#595959' }}>
            {randomBody}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/plans"
            onClick={onClose}
            className="block w-full text-center py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#D4AF37' }}
          >
            Okay, show me Pro
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-center py-3 rounded-xl font-medium transition-all hover:bg-gray-100"
            style={{ color: '#595959', border: '1px solid #C0C8D9' }}
          >
            I'll live with free papers
          </button>
        </div>
      </div>
    </div>
  )
}
