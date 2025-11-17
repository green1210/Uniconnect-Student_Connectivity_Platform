import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Could log to monitoring service here
    // console.error('ErrorBoundary caught error', error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-surface border border-primary-100 rounded-xl p-6 shadow-soft text-center">
            <h1 className="text-lg font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-subtle mb-4">An unexpected error occurred. You can try again.</p>
            <button onClick={this.handleReset} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-sm">Retry</button>
            <button onClick={()=>window.location.reload()} className="ml-3 px-4 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-sm">Reload</button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 text-left text-xs overflow-auto max-h-48 bg-primary-50 p-3 rounded">{String(this.state.error)}</pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
