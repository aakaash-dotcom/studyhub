import { useState, useEffect } from 'react'
import { CatalogueRecord, parseMarksPattern } from '../data/catalogue'
import { useAuth } from '../context/AuthContext'
import { trackPreviewPage, trackLoginWallHit, trackDownload } from '../lib/events'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Download, ChevronLeft } from 'lucide-react'

interface ResourceReaderProps {
  resource: CatalogueRecord
}

export default function ResourceReader({ resource }: ResourceReaderProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const totalPages = resource.pages

  // Check if user has pro plan
  const hasProPlan = (() => {
    try {
      const plan = localStorage.getItem('ravi_plan')
      if (plan) {
        const planData = JSON.parse(plan)
        return planData.plan === 'pro' && planData.valid_until > Date.now()
      }
    } catch (e) {
      // Ignore parse errors
    }
    return false
  })()

  // Check if resource is premium
  const isPremium = resource.price_tier === 'premium'

  // Check if content is locked (premium but no pro plan)
  const isLocked = isPremium && !hasProPlan

  useEffect(() => {
    trackPreviewPage(resource.id, 1)
  }, [resource.id])

  const handleDownload = () => {
    if (!isAuthenticated) {
      trackLoginWallHit(resource.id)
      navigate('/login', { state: { from: `/resource/${resource.id}` } })
      return
    }

    if (!resource.drive_file_id) {
      return
    }

    trackDownload(resource.id)
    
    // Save download event to localStorage
    const downloadEvent = {
      type: 'download',
      id: resource.id,
      phone: localStorage.getItem('rt_user_phone') || '',
      at: new Date().toISOString()
    }
    const events = JSON.parse(localStorage.getItem('rt_download_events') || '[]')
    events.push(downloadEvent)
    localStorage.setItem('rt_download_events', JSON.stringify(events))

    // Download the preview PDF from Google Drive
    window.open(
      `https://drive.google.com/uc?export=download&id=${resource.drive_file_id}`,
      '_blank'
    )
  }

  const marksPattern = parseMarksPattern(resource.marks_pattern)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Resource Header */}
      <div className="bg-white border-b p-4 sm:p-6" style={{ borderColor: '#C0C8D9' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-3" style={{ color: '#17528C' }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#1A1A1A' }}>{resource.title_en}</h1>
        {resource.title_ta && (
          <p className="text-sm mt-0.5" style={{ color: '#595959' }}>{resource.title_ta}</p>
        )}
        <p className="text-xs mt-2" style={{ color: '#595959' }}>
          Class {resource.class} · {resource.subject} ({resource.subject_ta}) · {resource.exam} {resource.year} · {resource.medium} Medium
        </p>

        {/* Marks Pattern Table */}
        {marksPattern.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <p className="text-xs font-medium mb-2" style={{ color: '#17528C' }}>📋 Marks Distribution Blueprint:</p>
            <table className="w-full text-xs border-collapse" style={{ borderColor: '#C0C8D9' }}>
              <thead>
                <tr style={{ backgroundColor: '#F5F8FC' }}>
                  <th className="border p-2 text-left font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Part</th>
                  <th className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Questions</th>
                  <th className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Marks Each</th>
                </tr>
              </thead>
              <tbody>
                {marksPattern.map((part, i) => (
                  <tr key={i}>
                    <td className="border p-2" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.part}</td>
                    <td className="border p-2 text-center" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.questions}</td>
                    <td className="border p-2 text-center" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>{part.marks_each}{part.note ? ` ${part.note}` : ''}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F5F8FC' }}>
                  <td className="border p-2 font-medium" style={{ borderColor: '#C0C8D9', color: '#1A1A1A' }}>Total</td>
                  <td className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#17528C' }}>{resource.question_count} Qs</td>
                  <td className="border p-2 text-center font-medium" style={{ borderColor: '#C0C8D9', color: '#17528C' }}>{resource.total_marks} marks · {resource.duration}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {resource.description_en && (
          <p className="text-sm mt-3" style={{ color: '#595959' }}>{resource.description_en}</p>
        )}
      </div>

      {/* Google Drive PDF Preview */}
      <div style={{ backgroundColor: '#F5F8FC' }}>
        <div className="max-w-4xl mx-auto py-4 px-3">
          {isLocked ? (
            <div className="bg-white rounded-xl border-2 p-8 text-center mb-4" style={{ borderColor: '#D4AF37' }}>
              <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: '#D4AF37' }} />
              <h3 className="font-bold text-xl mb-2" style={{ color: '#1A1A1A' }}>
                Premium Content
              </h3>
              <p className="text-sm mb-6" style={{ color: '#595959' }}>
                This is a premium material. Upgrade to PRO to access all important questions, model papers, and topper materials.
              </p>
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium"
                style={{ backgroundColor: '#D4AF37' }}
              >
                Upgrade to PRO — ₹499/year
              </Link>
              <p className="text-xs mt-4" style={{ color: '#595959' }}>
                Or WhatsApp us at <a href="https://wa.me/918610653352" className="font-medium" style={{ color: '#17528C' }}>86106 53352</a>
              </p>
            </div>
          ) : resource.drive_file_id ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4">
              <iframe
                src={`https://drive.google.com/file/d/${resource.drive_file_id}/preview`}
                className="w-full border-0"
                style={{ height: '70vh', minHeight: '500px' }}
                title={`Preview of ${resource.title_en}`}
                allow="autoplay"
              />
              <div className="px-4 py-2 text-center text-xs border-t flex items-center justify-center gap-2" style={{ color: '#595959', borderColor: '#C0C8D9', backgroundColor: '#F5F8FC' }}>
                <span>📄 Preview from Google Drive</span>
                <span>•</span>
                <span>{totalPages} pages</span>
                <span>•</span>
                <span>{resource.size}</span>
                {isPremium && hasProPlan && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                      PRO
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#C0C8D9' }}>
              <div className="text-5xl mb-4">📄</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>Preview PDF is being prepared</h3>
              <p className="text-sm mb-4" style={{ color: '#595959' }}>
                This paper is listed. Check back soon.
              </p>
              <p className="text-xs font-mono p-2 rounded-lg" style={{ backgroundColor: '#F5F8FC', color: '#595959' }}>
                File: {resource.file_pdf}
              </p>
            </div>
          )}

          {/* Download Button */}
          {!isLocked && (
            <div className="bg-white rounded-xl border p-5 text-center mb-4" style={{ borderColor: '#C0C8D9' }}>
              {isAuthenticated ? (
                <>
                  <Download className="w-10 h-10 mx-auto mb-3" style={{ color: '#15803D' }} />
                  <button
                    onClick={handleDownload}
                    disabled={!resource.drive_file_id}
                    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #15803D, #166534)' }}
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <p className="text-xs mt-3" style={{ color: '#595959' }}>
                    {isPremium
                      ? 'PRO member download. Full access to premium materials.'
                      : 'TN previous-year question paper. Free after login.'}
                  </p>
                </>
              ) : (
                <>
                  <Lock className="w-10 h-10 mx-auto mb-3" style={{ color: '#17528C' }} />
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                    Login to download
                  </h3>
                  <Link
                    to="/login"
                    state={{ from: `/resource/${resource.id}` }}
                    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
                  >
                    <Lock className="w-4 h-4" /> Download PDF
                  </Link>
                  <p className="text-xs mt-3" style={{ color: '#595959' }}>
                    {isPremium
                      ? 'Preview free. Upgrade to PRO for full access.'
                      : 'TN previous-year question paper. Free after login.'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
