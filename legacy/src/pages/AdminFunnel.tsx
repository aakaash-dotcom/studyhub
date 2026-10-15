import { useState, useEffect } from 'react'
import { getFunnelData, getEvents } from '../lib/events'
import { Link } from 'react-router-dom'
import { ChevronLeft, BarChart3, Download, Eye, Lock, UserCheck } from 'lucide-react'

export default function AdminFunnel() {
  const [funnelData, setFunnelData] = useState(getFunnelData())
  const [events, setEvents] = useState(getEvents())

  useEffect(() => {
    const interval = setInterval(() => {
      setFunnelData(getFunnelData())
      setEvents(getEvents())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const chartData = [
    { name: 'Page Views', value: funnelData.pageViews, fill: '#17528C' },
    { name: 'Preview Views', value: funnelData.previewViews, fill: '#0E3A66' },
    { name: 'Wall Hits', value: funnelData.wallHits, fill: '#B45309' },
    { name: 'Logins', value: funnelData.logins, fill: '#15803D' },
    { name: 'Downloads', value: funnelData.downloads, fill: '#17528C' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link to="/" className="flex items-center gap-1 text-sm mb-6" style={{ color: '#17528C' }}>
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6" style={{ color: '#17528C' }} />
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A1A' }}>Analytics Funnel</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Page Views', value: funnelData.pageViews, icon: Eye, color: '#17528C' },
          { label: 'Previews', value: funnelData.previewViews, icon: Eye, color: '#0E3A66' },
          { label: 'Wall Hits', value: funnelData.wallHits, icon: Lock, color: '#B45309' },
          { label: 'Logins', value: funnelData.logins, icon: UserCheck, color: '#15803D' },
          { label: 'Downloads', value: funnelData.downloads, icon: Download, color: '#17528C' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-4" style={{ borderColor: '#C0C8D9' }}>
            <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: '#595959' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Conversion Rates */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#C0C8D9' }}>
        <h3 className="font-bold text-sm mb-3" style={{ color: '#1A1A1A' }}>Conversion Rates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs" style={{ color: '#595959' }}>View → Preview</p>
            <p className="text-lg font-bold" style={{ color: '#17528C' }}>{funnelData.conversionRates.viewToPreview}%</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#595959' }}>Preview → Wall</p>
            <p className="text-lg font-bold" style={{ color: '#B45309' }}>{funnelData.conversionRates.previewToWall}%</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#595959' }}>Wall → Login</p>
            <p className="text-lg font-bold" style={{ color: '#15803D' }}>{funnelData.conversionRates.wallToLogin}%</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#595959' }}>Login → Download</p>
            <p className="text-lg font-bold" style={{ color: '#17528C' }}>{funnelData.conversionRates.loginToDownload}%</p>
          </div>
        </div>
      </div>

      {/* Chart - CSS Bar Chart */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#C0C8D9' }}>
        <h3 className="font-bold text-sm mb-3" style={{ color: '#1A1A1A' }}>Funnel Visualization</h3>
        <div className="space-y-3">
          {chartData.map((item) => {
            const maxValue = Math.max(...chartData.map(d => d.value), 1)
            const percentage = (item.value / maxValue) * 100
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{item.name}</span>
                  <span className="text-xs" style={{ color: '#595959' }}>{item.value}</span>
                </div>
                <div className="h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F8FC' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: item.fill }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#C0C8D9' }}>
        <h3 className="font-bold text-sm mb-3" style={{ color: '#1A1A1A' }}>Recent Events ({events.length})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.slice(-10).reverse().map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg text-xs" style={{ backgroundColor: '#F5F8FC' }}>
              <span className="font-mono" style={{ color: '#595959' }}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              <span className="font-medium" style={{ color: '#17528C' }}>{event.type}</span>
              <span className="flex-1 truncate" style={{ color: '#595959' }}>
                {JSON.stringify(event.data).slice(0, 50)}
              </span>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center py-4 text-sm" style={{ color: '#595959' }}>No events yet. Start browsing to generate data.</p>
          )}
        </div>
      </div>
    </div>
  )
}
