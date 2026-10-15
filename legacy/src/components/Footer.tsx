import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">Ravi's Tuition</h3>
            <p className="text-sm opacity-80 mb-2">MADURAI · SINCE 1999</p>
            <p className="text-sm opacity-80">ravistuition.in</p>
            <p className="text-sm opacity-80">86106 53352</p>
          </div>

          <div>
            <h4 className="font-bold mb-3">Classes</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/class/12" className="hover:opacity-100">12th Standard</Link></li>
              <li><Link to="/class/11" className="hover:opacity-100">11th Standard</Link></li>
              <li><Link to="/class/10" className="hover:opacity-100">10th Standard</Link></li>
              <li><Link to="/class/9" className="hover:opacity-100">9th Standard</Link></li>
              <li><Link to="/class/8" className="hover:opacity-100">8th Standard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/class/10" className="hover:opacity-100">Question Papers</Link></li>
              <li><Link to="/class/10" className="hover:opacity-100">Model Papers</Link></li>
              <li><Link to="/class/10" className="hover:opacity-100">Important Questions</Link></li>
              <li><Link to="/class/10" className="hover:opacity-100">Study Materials</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/privacy" className="hover:opacity-100">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:opacity-100">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:opacity-100">Refund Policy</Link></li>
              <li><Link to="/content-policy" className="hover:opacity-100">Content Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm opacity-80">
          <p>© 2026 Ravi's Tuition, Madurai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
