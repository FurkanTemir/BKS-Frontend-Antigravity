import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Sayfalar
import AuthPage from './pages/AuthPage';
import TopicsPage from './pages/TopicsPage';
import ProfilePage from './pages/ProfilePage';
import AdminTopicsPage from './pages/AdminTopicsPage'; // Admin konu yönetimi sayfası
import StudyPlanListPage from './pages/StudyPlanListPage'; // Çalışma programı listesi
import StudyPlanCreatePage from './pages/StudyPlanCreatePage'; // Yeni program oluşturma
import StudyPlanCalendarPage from './pages/StudyPlanCalendarPage'; // Takvim görünümü
import StudyPlanArchivedPage from './pages/StudyPlanArchivedPage'; // Arşivlenmiş programlar
import MockExamListPage from './pages/MockExamListPage'; // Deneme sınavı listesi
import MockExamCreatePage from './pages/MockExamCreatePage'; // Yeni deneme sınavı ekleme
import MockExamAnalyticsPage from './pages/MockExamAnalyticsPage'; // Grafik analizleri
import TimerPage from './pages/TimerPage'; // Zamanlayıcılar sayfası
import AnalyticsPage from './pages/AnalyticsPage'; // Çalışma analizleri sayfası
import StudySessionListPage from './pages/StudySessionListPage'; // Çalışma oturumları listesi
import StudyResourceListPage from './pages/StudyResourceListPage'; // Çalışma kaynakları listesi
import StudyResourceCreatePage from './pages/StudyResourceCreatePage'; // Kaynak oluşturma/düzenleme
import NotificationSettingsPage from './pages/NotificationSettingsPage'; // Hatırlatma ayarları
import NoteListPage from './pages/NoteListPage'; // Not listesi
import NoteCreatePage from './pages/NoteCreatePage'; // Not oluşturma/düzenleme
import NoteViewPage from './pages/NoteViewPage'; // Not görüntüleme
import DashboardPage from './pages/DashboardPage'; // Ana dashboard sayfası
import ComprehensiveCalendarPage from './pages/ComprehensiveCalendarPage'; // Kapsamlı takvim sayfası
import LeaderboardPage from './pages/LeaderboardPage'; // Liderlik tablosu
import FriendsPage from './pages/FriendsPage'; // Arkadaş listesi
import ChatPage from './pages/ChatPage'; // Mesajlaşma sayfası

// Bileşenler
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Giriş Sayfası */}
        <Route path="/login" element={<AuthPage />} />

        {/* 2. Korumalı Sayfalar */}
        <Route element={<ProtectedRoute />}>

          {/* Ana Sayfa Yönlendirmesi */}
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tyt" element={<TopicsPage examType={1} />} />
          <Route path="/ayt" element={<TopicsPage examType={2} />} />

          {/* Çalışma Programı Sayfaları */}
          <Route path="/study-plan" element={<StudyPlanListPage />} />
          <Route path="/study-plan/create" element={<StudyPlanCreatePage />} />
          <Route path="/study-plan/:id" element={<StudyPlanCreatePage />} />
          <Route path="/study-plan/calendar" element={<StudyPlanCalendarPage />} />
          <Route path="/study-plan/calendar/:id" element={<StudyPlanCalendarPage />} />
          <Route path="/study-plan/archived" element={<StudyPlanArchivedPage />} />

          {/* Kapsamlı Takvim */}
          <Route path="/calendar" element={<ComprehensiveCalendarPage />} />

          {/* Deneme Sınavı Sayfaları */}
          <Route path="/mock-exam" element={<MockExamListPage />} />
          <Route path="/mock-exam/create" element={<MockExamCreatePage />} />
          <Route path="/mock-exam/:id" element={<MockExamCreatePage />} />
          <Route path="/mock-exam/analytics" element={<MockExamAnalyticsPage />} />

          {/* Zamanlayıcılar ve Analizler */}
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/study-sessions" element={<StudySessionListPage />} />

          {/* Kaynak Yönetimi */}
          <Route path="/study-resource" element={<StudyResourceListPage />} />
          <Route path="/study-resource/create" element={<StudyResourceCreatePage />} />
          <Route path="/study-resource/:id" element={<StudyResourceCreatePage />} />

          {/* Hatırlatma Ayarları */}
          <Route path="/notifications" element={<NotificationSettingsPage />} />

          {/* Not Sistemi */}
          <Route path="/notes" element={<NoteListPage />} />
          <Route path="/note/create" element={<NoteCreatePage />} />
          <Route path="/note/:id" element={<NoteCreatePage />} />
          <Route path="/note/view/:id" element={<NoteViewPage />} />

          {/* Liderlik Tablosu */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Mesajlaşma */}
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Admin Sayfaları */}
          <Route path="/admin/topics" element={
            <AdminRoute>
              <AdminTopicsPage />
            </AdminRoute>
          } />

        </Route>

        {/* Herhangi bir eşleşmeyen yolda Login'e at */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Yardımcı Bileşen: Yönlendirme
const DashboardRedirect = () => {
  // LocalStorage okuma hatasına karşı try-catch
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return <Navigate to="/login" replace />;

    const user = JSON.parse(userString);
    const isAdmin = user.roles && user.roles.includes('Admin');

    // Admin ve Öğrenci için Dashboard'a yönlendir
    return <Navigate to="/dashboard" replace />;
  } catch (e) {
    // JSON parse hatası veya başka bir şey olursa Login'e at
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

// Yardımcı Bileşen: Admin Kontrolü
const AdminRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isAdmin = user.roles && user.roles.includes('Admin');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default App;
