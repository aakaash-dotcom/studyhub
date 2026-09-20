import { CatalogueRecord } from '../data/catalogue'

interface PageTileProps {
  pageNumber: number
  totalPages: number
  resource: CatalogueRecord
}

export default function PageTile({ pageNumber, totalPages, resource }: PageTileProps) {
  // Generate realistic question paper content based on page number
  const generateContent = () => {
    if (pageNumber === 1) {
      return (
        <>
          <div className="text-center mb-4">
            <h2 className="text-sm font-bold mb-1">RAVI'S TUITION</h2>
            <p className="text-xs">MADURAI · SINCE 1999</p>
            <div className="border-t border-b py-2 my-2">
              <p className="text-xs font-bold">{resource.title_en}</p>
              <p className="text-xs">{resource.title_ta}</p>
            </div>
            <div className="text-left text-xs space-y-1 mt-3">
              <p><span className="font-semibold">Class:</span> {resource.class}th Standard</p>
              <p><span className="font-semibold">Subject:</span> {resource.subject} ({resource.subject_ta})</p>
              <p><span className="font-semibold">Medium:</span> {resource.medium}</p>
              <p><span className="font-semibold">Exam:</span> {resource.exam} Examination {resource.year}</p>
              <p><span className="font-semibold">Time:</span> {resource.duration}</p>
              <p><span className="font-semibold">Max Marks:</span> {resource.total_marks}</p>
            </div>
          </div>
          <div className="text-xs mt-4">
            <p className="font-semibold mb-2">General Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>All questions are compulsory.</li>
              <li>Answer must be written in the space provided.</li>
              <li>Draw neat diagrams wherever necessary.</li>
              <li>Use of calculator is not permitted.</li>
            </ol>
          </div>
        </>
      )
    }

    // Subsequent pages - show sample questions
    const questions = [
      { q: 'Solve the equation: 2x² + 5x - 3 = 0', marks: 2 },
      { q: 'Prove that the sum of angles in a triangle is 180°', marks: 5 },
      { q: 'Find the area of a circle with radius 7 cm', marks: 2 },
      { q: 'Explain the process of photosynthesis with a diagram', marks: 5 },
      { q: 'What is the quadratic formula? Derive it.', marks: 8 },
      { q: 'Calculate the mean, median, and mode of: 12, 15, 18, 12, 20, 15, 12', marks: 5 },
      { q: 'Define velocity and acceleration. Give their SI units.', marks: 2 },
      { q: 'Explain Ohm\'s law with a circuit diagram', marks: 5 },
    ]

    const startIndex = (pageNumber - 2) * 4
    const pageQuestions = questions.slice(startIndex, startIndex + 4)

    return (
      <>
        <div className="text-xs space-y-4">
          <div className="border-b pb-2 mb-3">
            <p className="font-bold text-center">PART - II</p>
            <p className="text-center">(Answer any 10 questions · 2 marks each)</p>
          </div>
          
          {pageQuestions.map((item, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-medium mb-2">
                {startIndex + idx + 1}. {item.q}
                <span className="float-right text-xs">[{item.marks}]</span>
              </p>
              <div className="ml-4 space-y-2">
                <div className="border-b border-dashed h-6"></div>
                <div className="border-b border-dashed h-6"></div>
                {item.marks >= 5 && (
                  <>
                    <div className="border-b border-dashed h-6"></div>
                    <div className="border-b border-dashed h-6"></div>
                  </>
                )}
                {item.marks >= 8 && (
                  <>
                    <div className="border-b border-dashed h-6"></div>
                    <div className="border-b border-dashed h-6"></div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div 
      className="bg-white shadow-lg rounded overflow-hidden relative"
      style={{ 
        aspectRatio: '210 / 297', // A4 ratio
        maxHeight: '85vh',
        minHeight: '500px'
      }}
    >
      {/* Page content */}
      <div className="absolute inset-0 p-6 sm:p-8 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-4 pb-2 border-b-2" style={{ borderColor: '#17528C' }}>
          <h1 className="text-base sm:text-lg font-bold" style={{ color: '#17528C' }}>
            RAVI'S TUITION
          </h1>
          <p className="text-xs" style={{ color: '#595959' }}>
            MADURAI · SINCE 1999 · ravistuition.in
          </p>
        </div>

        {/* Main content */}
        <div className="text-xs sm:text-sm" style={{ color: '#1A1A1A' }}>
          {generateContent()}
        </div>

        {/* Watermark - diagonal */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ 
            transform: 'rotate(-45deg)',
            opacity: 0.08
          }}
        >
          <div className="text-center">
            <p className="text-4xl sm:text-6xl font-bold" style={{ color: '#17528C' }}>
              RAVI'S TUITION
            </p>
            <p className="text-lg sm:text-2xl" style={{ color: '#17528C' }}>
              ravistuition.in
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t text-xs flex justify-between" style={{ borderColor: '#C0C8D9', color: '#595959' }}>
          <span>© Ravi's Tuition · 86106 53352</span>
          <span>Page {pageNumber} of {totalPages}</span>
        </div>
      </div>
    </div>
  )
}
