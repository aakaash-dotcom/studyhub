import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import SchoolSection from './components/SchoolSection'
import EntranceExams from './components/EntranceExams'
import RecruitmentExams from './components/RecruitmentExams'
import RecentUploads from './components/RecentUploads'
import QuickLinks from './components/QuickLinks'
import StatsSection from './components/StatsSection'
import Footer from './components/Footer'
import GoogleDriveGuide from './components/GoogleDriveGuide'

function App() {
  const [showDriveGuide, setShowDriveGuide] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <SchoolSection />
      <EntranceExams />
      <RecruitmentExams />
      <RecentUploads />
      <QuickLinks />
      <StatsSection />
      <Footer />
      
      {showDriveGuide && <GoogleDriveGuide onClose={() => setShowDriveGuide(false)} />}
      
      {/* Floating button to show Drive guide */}
      <button
        onClick={() => setShowDriveGuide(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 z-50 hover:scale-105"
      >
        <svg className="w-5 h-5" viewBox="0 0 87.3 78" fill="currentColor">
          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l16.75-28.95-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6z"/>
          <path d="m43.65 25-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6l3.85 6.65z" opacity=".5"/>
          <path d="m73.55 77.15c1.35-.8 2.5-1.9 3.3-3.3l1.9-3.3-16.6-28.85-17.25 29.95c1.35.8 2.9 1.2 4.5 1.2s3.15-.45 4.5-1.2z"/>
          <path d="m43.65 25 17.1 29.6c1.35-.8 2.5-1.9 3.3-3.3l1.9-3.3-16.6-28.85z" opacity=".5"/>
          <path d="m59.2 10.15-15.55-9.15c-1.35-.8-2.9-1.2-4.5-1.2s-3.15.45-4.5 1.2l-15.55 9.15 17.15 29.7z" opacity=".7"/>
          <path d="m73.4 66.85 3.85-6.65c.8-1.4 1.2-3 1.2-4.6 0-1.6-.4-3.2-1.2-4.6l-13.4-23.2c-.8-1.4-1.95-2.5-3.3-3.3l-17.15 29.7 16.6 28.85c1.35-.8 2.5-1.9 3.3-3.3z" opacity=".7"/>
        </svg>
        <span className="text-sm font-medium">Setup Drive</span>
      </button>
    </div>
  )
}

export default App
