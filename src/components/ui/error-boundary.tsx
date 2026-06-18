import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-status-danger/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-status-danger" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">加载出错</h3>
          <p className="text-sm text-text-secondary mb-4">
            {this.state.error?.message || '组件渲染发生异常，请重试'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-btn hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
