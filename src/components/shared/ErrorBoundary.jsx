import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ── Chart-level boundary — hides just the failed chart ──────────────────────
export class ChartErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(err) {
    console.warn('Chart render error (suppressed):', err?.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card flex flex-col items-center justify-center gap-2 h-[300px] text-gray-400 border border-dashed border-gray-200">
          <AlertTriangle className="w-6 h-6 text-gray-300" />
          <p className="text-sm">Chart unavailable</p>
        </div>
      )
    }
    return this.props.children
  }
}

// ── App-level boundary — catches any uncaught React error ────────────────────
export class AppErrorBoundary extends Component {
  state = { hasError: false, errorId: null }

  static getDerivedStateFromError(err) {
    return { hasError: true, errorId: err?.message?.slice(0, 80) }
  }

  componentDidCatch(err, info) {
    console.error('AppErrorBoundary caught:', err, info?.componentStack?.slice(0, 200))
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
            <div className="bg-red-50 rounded-full p-4 inline-flex">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
              <p className="text-gray-500 mt-2 text-sm">
                An unexpected error occurred. Your data is safe — please reload the page to continue.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 mx-auto bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
