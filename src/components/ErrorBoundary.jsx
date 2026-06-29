import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-content-muted flex items-center justify-center mb-4">
            <span className="text-surface font-bold text-lg">!</span>
          </div>
          <h2 className="text-lg font-semibold text-content mb-2">Something went wrong</h2>
          <p className="text-sm text-content-muted max-w-md mb-4">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-content text-surface text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
