import { CatalogueRecord } from '../data/catalogue'

interface PageTileProps {
  pageNumber: number
  totalPages: number
  resource: CatalogueRecord
}

export default function PageTile({ pageNumber, totalPages, resource }: PageTileProps) {
  return (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden relative"
      style={{ 
        aspectRatio: '210 / 297', // A4 ratio
        maxHeight: '80vh',
        border: '1px solid #C0C8D9'
      }}
    >
      <div className="absolute inset-0 p-8 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: '#17528C' }}>
          <h1 className="text-xl font-bold" style={{ color: '#17528C' }}>
            RAVI'S TUITION
          </h1>
          <p className="text-xs mt-1" style={{ color: '#595959' }}>
            MADURAI · SINCE 1999 · ravistuition.in
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
            {resource.title_en}
          </h2>
          {resource.title_ta && (
            <p className="text-sm" style={{ color: '#595959' }}>{resource.title_ta}</p>
          )}
          <div className="mt-3 text-xs" style={{ color: '#595959' }}>
            <p>Class {resource.class} · {resource.subject} · {resource.medium} Medium</p>
            <p>{resource.exam} Examination {resource.year}</p>
            <p className="mt-1">Time: {resource.duration} · Max Marks: {resource.total_marks}</p>
          </div>
        </div>

        {/* Sample Content */}
        <div className="text-sm" style={{ color: '#1A1A1A' }}>
          <p className="font-semibold mb-3">General Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-xs">
            <li>All questions are compulsory.</li>
            <li>Answer must be written in the space provided.</li>
            <li>Draw neat diagrams wherever necessary.</li>
            <li>Use of calculator is not permitted.</li>
          </ol>

          <div className="mt-6">
            <p className="font-semibold mb-2">PART - I</p>
            <p className="text-xs mb-4">(Answer all questions · 1 mark each)</p>
            
            <div className="space-y-3">
              <p className="text-xs">1. Choose the correct answer:</p>
              <div className="ml-4 text-xs">
                <p>(a) Option A</p>
                <p>(b) Option B</p>
                <p>(c) Option C</p>
                <p>(d) Option D</p>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ 
            transform: 'rotate(-45deg)',
            opacity: 0.08
          }}
        >
          <div className="text-center">
            <p className="text-5xl font-bold" style={{ color: '#17528C' }}>
              RAVI'S TUITION
            </p>
            <p className="text-xl" style={{ color: '#17528C' }}>
              ravistuition.in
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t text-xs flex justify-between" style={{ borderColor: '#C0C8D9', color: '#595959' }}>
          <span>© Ravi's Tuition · 86106 53352</span>
          <span>Page {pageNumber} of {totalPages}</span>
        </div>
      </div>
    </div>
  )
}
