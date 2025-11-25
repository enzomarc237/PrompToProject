import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  readonly props: Props;
  state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in a component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-red-500 dark:text-red-400 p-4">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-center">An error occurred while rendering this file. Please try selecting another file or reloading the application.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
