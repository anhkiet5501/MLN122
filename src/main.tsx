import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error Boundary để tránh màn hình đen khi có lỗi runtime
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0f', color: '#fff', fontFamily: 'monospace', padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#E63946', marginBottom: '0.5rem' }}>Lỗi khởi động ứng dụng</h1>
          <p style={{ color: '#888', marginBottom: '1rem' }}>{this.state.error.message}</p>
          <p style={{ color: '#555', fontSize: '0.8rem' }}>
            Kiểm tra Console (F12) để xem chi tiết lỗi
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: '12px',
              background: '#E63946', color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
