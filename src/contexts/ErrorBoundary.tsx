import { Component, ReactNode, ErrorInfo } from 'react'
import { ErrorMessage } from '@/components/common'
import styles from './ErrorBoundary.module.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    
    // Optionally reload the page
    window.location.href = '/'
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.errorBoundary}>
          <ErrorMessage
            message={
              this.state.error?.message ||
              'Something went wrong. Please try refreshing the page.'
            }
            onRetry={this.handleReset}
            fullScreen
          />
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className={styles.errorBoundary__details}>
              <summary>Error Details (Development Only)</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

