import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Btn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Logs errors and displays a fallback UI instead of crashing
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send error to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <Card className="max-w-2xl w-full shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base mt-2">
                We're sorry for the inconvenience. An unexpected error occurred.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error details (only show in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <p className="font-semibold text-sm text-gray-900 mb-2">Error Details:</p>
                  <pre className="text-xs text-red-600 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-medium text-gray-700 hover:text-gray-900">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                  startIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                  startIcon={<Home className="h-4 w-4" />}
                >
                  Go to Home
                </Button>
              </div>

              {/* Help text */}
              <p className="text-xs text-center text-gray-500 pt-4">
                If the problem persists, please contact support or try refreshing the page.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
