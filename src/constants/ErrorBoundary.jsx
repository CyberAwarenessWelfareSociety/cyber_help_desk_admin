import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
        console.log(this.state.error?.message || 'An unexpected error occurred.')
      return ;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;