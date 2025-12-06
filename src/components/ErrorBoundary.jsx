import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

// --- ERROR BOUNDARY COMPONENT ---
// React hatalarını yakalar ve kullanıcıya anlamlı mesaj gösterir

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary">
            <div className="error-icon">
              <FiAlertCircle size={64} />
            </div>
            <h2>Bir şeyler ters gitti</h2>
            <p className="text-muted">
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>
            {this.state.error && (
              <details className="error-details">
                <summary>Hata Detayları</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="error-actions">
              <button className="btn btn-primary" onClick={this.handleReset}>
                <FiRefreshCw className="me-2" />
                Sayfayı Yenile
              </button>
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

