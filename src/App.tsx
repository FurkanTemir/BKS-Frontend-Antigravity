import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Topics from './pages/Topics'
import MockExams from './pages/MockExams'
import StudySessions from './pages/StudySessions'
import Notes from './pages/Notes'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Analytics from './pages/Analytics'
import Friends from './pages/Friends'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import StudyResources from './pages/StudyResources'
import Videos from './pages/Videos'
import AdminAnnouncements from './pages/Admin/Announcements'
import AdminCategories from './pages/Admin/Categories'
import { useAuthStore } from './stores/authStore'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/app" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/app" replace />} />

        {/* Protected Routes */}
        <Route
          path="/app/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/topics" element={<Topics />} />
                    <Route path="/exams" element={<MockExams />} />
                    <Route path="/sessions" element={<StudySessions />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* New Features */}
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/study-resources" element={<StudyResources />} />
                    <Route path="/videos" element={<Videos />} />

                    {/* Admin Routes */}
                    <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/app' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
