import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import UndoToast from './UndoToast';
import { useNotification } from '../hooks/useNotification';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

// --- PROTECTED ROUTE (KORUMALI ROTA) ---
// Sadece giriş yapmış kullanıcıların görebileceği sayfaları sarmalar.
// Eğer giriş yapılmamışsa Login sayfasına atar.
// Ayrıca Navbar'ı da burada ekleriz, böylece her sayfada Navbar olur.

const ProtectedRoute = ({ roles }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // JSON.parse hata yakalama
  let user = {};
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (err) {
    console.error('Kullanıcı bilgisi parse edilemedi:', err);
    // Bozuk JSON varsa localStorage'ı temizle
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Bildirim hook'unu aktif et (tüm korumalı sayfalarda çalışır)
  useNotification();

  // Klavye kısayollarını aktif et
  useKeyboardShortcuts();

  // Undo başarılı olduğunda sayfayı yenile
  const handleUndoSuccess = () => {
    // Mevcut sayfayı yenile
    window.location.reload();
  };

  // 1. Giriş yapılmış mı?
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Rol kontrolü (Opsiyonel: Eğer belirli rol isteniyorsa)
  if (roles && user.roles && Array.isArray(user.roles) && !roles.some(role => user.roles.includes(role))) {
    // Yetkisi yoksa Dashboard'a at
    return <Navigate to="/" replace />;
  }

  // Her şey yolundaysa sayfayı göster (Outlet: Alt sayfaların yerleştiği yer)
  return (
    <MainLayout>
      <Outlet />
      <UndoToast onUndoSuccess={handleUndoSuccess} />
    </MainLayout>
  );
};

export default ProtectedRoute;

