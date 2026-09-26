/**
 * Global hata sınırı: beklenmeyen bir JS hatası uygulamanın tamamını
 * beyaz ekrana düşürmez; kullanıcıya düzgün bir kurtarma ekranı gösterilir.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // ileride hata raporlama servisine bağlanabilir
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
          <span className="text-4xl">😵‍💫</span>
          <p className="text-lg font-bold text-ink">Bir şeyler ters gitti</p>
          <p className="max-w-xs text-sm text-muted">
            Beklenmeyen bir hata oluştu. Uygulamayı yeniden başlatmayı dene.
          </p>
          {this.state.message && (
            <p className="max-w-xs break-all rounded-xl bg-surface p-3 text-[11px] text-muted">
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white active:scale-95"
          >
            Uygulamayı yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
