// Fix: Switched to a namespace import for React to resolve component typing issues.
import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in a component:", error, errorInfo);
  }

  public render() {
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
