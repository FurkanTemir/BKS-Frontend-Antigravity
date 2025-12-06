import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { FiCopy, FiCheck, FiUser, FiHash } from 'react-icons/fi';

const ProfilePage = () => {
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // --- Profil Bilgileri State'i ---
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    friendCode: ''
  });

  // --- Şifre Değiştirme State'i ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          friendCode: user.friendCode || ''
        });
      }
    } catch (e) {
      console.error("Kullanıcı bilgileri yüklenemedi", e);
    }
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setInfoMsg(''); setErrorMsg('');

    // Frontend validasyonu
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setErrorMsg('Ad ve Soyad boş olamaz.');
      return;
    }

    if (profileData.username && profileData.username.length < 3) {
      setErrorMsg('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    try {
      const response = await api.put('/Auth/profile', {
        FirstName: profileData.firstName.trim(),
        LastName: profileData.lastName.trim(),
        UserName: profileData.username ? profileData.username.trim() : null
      });

      setInfoMsg(response.data?.Message || 'Profil başarıyla güncellendi.');

      // LocalStorage'ı güncelle
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = {
          ...user,
          firstName: profileData.firstName.trim(),
          lastName: profileData.lastName.trim(),
          username: profileData.username ? profileData.username.trim() : user.username
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

    } catch (err) {
      // FluentValidation hatalarını göster
      const errorData = err.response?.data;
      if (errorData?.errors) {
        // Validation hataları (FluentValidation'dan gelen)
        const validationErrors = Object.values(errorData.errors).flat().join(', ');
        setErrorMsg(validationErrors);
      } else {
        setErrorMsg(errorData?.Message || errorData?.Detailed || 'Güncelleme başarısız.');
      }
      console.error('Profil güncelleme hatası:', err.response?.data);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setInfoMsg(''); setErrorMsg('');

    // Frontend validasyonu
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setErrorMsg('Tüm alanlar doldurulmalıdır.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMsg('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setErrorMsg('Yeni şifreler uyuşmuyor.');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setErrorMsg('Yeni şifre mevcut şifreyle aynı olamaz.');
      return;
    }

    try {
      const response = await api.post('/Auth/change-password', {
        CurrentPassword: passwordData.currentPassword,
        NewPassword: passwordData.newPassword,
        ConfirmNewPassword: passwordData.confirmNewPassword
      });
      setInfoMsg(response.data?.Message || 'Şifre başarıyla değiştirildi.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        // Validation hataları
        const validationErrors = Object.values(errorData.errors).flat().join(', ');
        setErrorMsg(validationErrors);
      } else {
        setErrorMsg(errorData?.Message || errorData?.Detailed || 'Şifre değiştirilemedi.');
      }
      console.error('Şifre değiştirme hatası:', err.response?.data);
    }
  };

  const copyToClipboard = () => {
    if (profileData.friendCode) {
      navigator.clipboard.writeText(profileData.friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Profil Ayarları</h2>

      {infoMsg && <div className="alert alert-success fade-in">{infoMsg}</div>}
      {errorMsg && <div className="alert alert-danger fade-in">{errorMsg}</div>}

      <div className="row">
        {/* Profil Bilgileri */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><FiUser className="me-2" />Kişisel Bilgiler</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label className="form-label text-muted">Friend Code (Arkadaşlık Kodu)</label>
                  <div className="input-group">
                    <span className="input-group-text"><FiHash /></span>
                    <input
                      type="text"
                      className="form-control bg-light fw-bold text-primary"
                      value={profileData.friendCode || 'Oluşturulmadı'}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={copyToClipboard}
                      title="Kodu Kopyala"
                    >
                      {copied ? <FiCheck className="text-success" /> : <FiCopy />}
                    </button>
                  </div>
                  <small className="text-muted">Arkadaşlarınıza bu kodu vererek sizi eklemelerini sağlayabilirsiniz.</small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Soyad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Kullanıcı Adı (@username)</label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <small className="text-muted">Benzersiz bir kullanıcı adı belirleyebilirsiniz.</small>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Bilgileri Güncelle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Şifre Değiştirme */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm border-warning">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Şifre Güvenliği</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Mevcut Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Yeni Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.confirmNewPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-warning">
                    Şifreyi Değiştir
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
