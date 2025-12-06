import React, { useState } from 'react';
import { FiLogIn, FiUserPlus, FiMail, FiLock, FiUser, FiBook } from 'react-icons/fi';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

// --- AUTH PAGE (GİRİŞ / KAYIT SAYFASI) ---
// Modern, profesyonel giriş/kayıt sayfası.

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    fieldType: null // 1: Sayısal, 2: Eşit Ağırlık, 3: Sözel
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Frontend validation
    if (!formData.email.trim()) {
      setError('E-posta adresi gereklidir.');
      return;
    }

    if (!formData.password.trim()) {
      setError('Şifre gereklidir.');
      return;
    }

    if (!isLoginMode) {
      // Kayıt modunda ek validasyonlar
      if (!formData.firstName.trim()) {
        setError('Ad gereklidir.');
        return;
      }

      if (!formData.lastName.trim()) {
        setError('Soyad gereklidir.');
        return;
      }

      if (formData.password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.');
        return;
      }

      // Email format kontrolü (basit)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Geçerli bir e-posta adresi giriniz.');
        return;
      }
    }

    setLoading(true);

    const endpoint = isLoginMode ? '/Auth/login' : '/Auth/register';
    const payload = isLoginMode
      ? { email: formData.email, password: formData.password }
      : {
        ...formData,
        fieldType: formData.fieldType ? parseInt(formData.fieldType) : null
      };

    try {
      const response = await api.post(endpoint, payload);

      // Backend standart ApiResponse formatında döndürüyor
      // Interceptor data'yı extract etti, AuthResponseDto artık response.data'da
      const authData = response.data;
      const apiResponse = response.originalResponse;

      // AuthResponseDto içinde success, token, email vs. var
      if (authData && (authData.success || apiResponse?.success)) {
        localStorage.setItem('token', authData.token || authData.refreshToken || '');
        localStorage.setItem('user', JSON.stringify({
          email: authData.email || '',
          firstName: authData.firstName || '',
          lastName: authData.lastName || '',
          username: authData.userName || '',
          friendCode: authData.friendCode || '',
          roles: authData.roles || [],
          fieldType: authData.fieldType
        }));
        navigate('/');
      } else {
        setError(apiResponse?.message || authData?.message || 'İşlem başarısız.');
      }
    } catch (err) {
      console.error('Login/Register error:', err);

      // Network hatası veya incomplete response
      if (!err.response) {
        const networkError = err.message || 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
        setError(networkError);
        return;
      }

      // Hata durumunda ApiResponse formatında olabilir
      const errorData = err.response?.data;
      let errorMessage = 'İşlem başarısız. Bilgileri kontrol edin.';

      if (errorData) {
        // ApiResponse formatında mı?
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.originalResponse?.message) {
          errorMessage = errorData.originalResponse.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="modern-card glass-card fade-in">
              <div className="card-body p-5">
                {/* Logo/Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3">
                      <FiBook size={32} className="text-primary" />
                    </div>
                  </div>
                  <h2 className="text-gradient mb-2">{isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
                  <p className="text-muted small">
                    {isLoginMode ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger fade-in" role="alert">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="alert alert-success fade-in" role="alert">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {!isLoginMode && (
                    <>
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="form-label fw-semibold">
                            <FiUser className="me-1" size={14} />
                            Ad
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Adınız"
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-semibold">
                            <FiUser className="me-1" size={14} />
                            Soyad
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <FiBook className="me-1" size={14} />
                          Alan Seçimi *
                        </label>
                        <select
                          name="fieldType"
                          className="form-control"
                          value={formData.fieldType || ''}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Alan seçiniz</option>
                          <option value="1">Sayısal</option>
                          <option value="2">Eşit Ağırlık</option>
                          <option value="3">Sözel</option>
                        </select>
                        <small className="text-muted">Bu alan, size gösterilecek konuları belirler</small>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FiMail className="me-1" size={14} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FiLock className="me-1" size={14} />
                      Şifre
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        {isLoginMode ? (
                          <>
                            <FiLogIn className="me-2" />
                            Giriş Yap
                          </>
                        ) : (
                          <>
                            <FiUserPlus className="me-2" />
                            Kayıt Ol
                          </>
                        )}
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    className="btn btn-link text-decoration-none p-0"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setError('');
                      setFormData({ email: '', password: '', firstName: '', lastName: '' });
                    }}
                  >
                    {isLoginMode ? (
                      <>
                        Hesabın yok mu? <strong>Kayıt Ol</strong>
                      </>
                    ) : (
                      <>
                        Zaten hesabın var mı? <strong>Giriş Yap</strong>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

