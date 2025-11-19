/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in child component tree and displays a fallback UI.
 * Prevents the entire app from crashing due to uncaught errors.
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary class component.
 * Usage: Wrap around app or major sections to catch render errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#2a2d3a',
          color: '#e1e4e8',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#f85149', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: '#8b949e', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#2f81f7',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
