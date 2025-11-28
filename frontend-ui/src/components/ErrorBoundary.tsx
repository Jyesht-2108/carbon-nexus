import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  FallbackComponent?: () => JSX.Element | null;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('3D Background Error (non-critical):', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { FallbackComponent } = this.props;
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return this.props.children;
  }
}
