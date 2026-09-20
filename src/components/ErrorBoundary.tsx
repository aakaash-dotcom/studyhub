import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F8FC' }}>
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center" style={{ border: '1px solid #C0C8D9' }}>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Something went wrong</h1>
            <p className="text-sm mb-4" style={{ color: '#595959' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
