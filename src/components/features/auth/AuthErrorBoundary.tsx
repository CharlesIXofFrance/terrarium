import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from '@/components/ui/atoms/Alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth error:', error);
    console.error('Error info:', errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Alert
          title={this.state.error?.name || 'Error'}
          message={this.state.error?.message || 'An unexpected error occurred'}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
