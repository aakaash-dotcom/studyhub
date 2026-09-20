import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="pb-20 lg:pb-0" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-white mb-1">Ravi's Tuition</h3>
            <p className="text-xs mb-3" style={{ color: '#C0C8D9' }}>MADURAI · SINCE 1999</p>
            <p className="text-sm" style={{ color: '#C0C8D9' }}>
              Free study materials for TN State Board Samacheer Kalvi. Classes 8–12.
            </p>
            <a href="tel:8610653352" className="text-sm font-medium mt-2 inline-block" style={{ color: '#ffffff' }}>
              📞 86106 53352
            </a>
          </div>

          {/* Classes */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Classes</h4>
            <ul className="space-y-2">
              {['8', '9', '10', '11', '12'].map((c) => (
                <li key={c}>
                  <Link to={`/class/${c}`} className="text-sm hover:text-white transition-colors" style={{ color: '#C0C8D9' }}>
                    {c}th Standard
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2">
              {['Important Questions', 'Model Papers', 'Question Papers', 'Answer Keys', 'Study Material'].map((c) => (
                <li key={c}>
                  <Link to="/class/10" className="text-sm hover:text-white transition-colors" style={{ color: '#C0C8D9' }}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: '#C0C8D9' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-white transition-colors" style={{ color: '#C0C8D9' }}>Terms of Service</Link></li>
              <li><Link to="/refund" className="text-sm hover:text-white transition-colors" style={{ color: '#C0C8D9' }}>Refund Policy</Link></li>
              <li><Link to="/content-policy" className="text-sm hover:text-white transition-colors" style={{ color: '#C0C8D9' }}>Content Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: '#333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#C0C8D9' }}>
            Ravi's Tuition · ravistuition.in | 86106 53352
          </p>
          <p className="text-xs" style={{ color: '#C0C8D9' }}>
            © 2026 Ravi's Tuition, Madurai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
