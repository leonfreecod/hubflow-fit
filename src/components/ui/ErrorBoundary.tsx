import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na interface', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="fatal-error">
          <h1>Não foi possível exibir esta tela.</h1>
          <p>Recarregue a aplicação. Se o problema continuar, consulte os logs do navegador.</p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </main>
      );
    }
    return this.props.children;
  }
}
