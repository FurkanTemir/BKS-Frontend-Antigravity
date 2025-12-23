import { Home, Target, BookOpen, Clock, FileText, Users, User, LogOut, BarChart2, MessageCircle, Bell, Library, Shield } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const Sidebar = () => {
    const navigate = useNavigate()
    const logout = useAuthStore((state) => state.logout)
    const user = useAuthStore((state) => state.user)

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/app/dashboard' },
        { icon: BarChart2, label: 'Analiz', path: '/app/analytics' },
        { icon: Target, label: 'Konular', path: '/app/topics' },
        { icon: BookOpen, label: 'Denemeler', path: '/app/exams' },
        { icon: Clock, label: 'Focus', path: '/app/sessions' },
        { icon: FileText, label: 'Notlar', path: '/app/notes' },
        { icon: Library, label: 'Kaynaklar', path: '/app/study-resources' },
        { icon: Users, label: 'Paylaşımlar', path: '/app/posts' },
        { icon: User, label: 'Benim Paylaşımlarım', path: '/app/my-posts' },
        { icon: MessageCircle, label: 'Mesajlar', path: '/app/messages' },
        { icon: Users, label: 'Arkadaşlar', path: '/app/friends' },
        { icon: Bell, label: 'Bildirimler', path: '/app/notifications' },
        { icon: User, label: 'Profil', path: '/app/profile' },
        { icon: Shield, label: 'Admin Onay', path: '/app/admin/posts' },
    ]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside className="w-20 bg-dark-300/50 backdrop-blur-glass border-r border-white/5 flex flex-col items-center py-8 gap-6">
            {/* Logo */}
            <NavLink
                to="/app/dashboard"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-dark-400 font-bold text-xl shadow-neon-cyan hover:scale-110 transition-transform"
            >
                B
            </NavLink>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                                ? 'bg-neon-cyan/20 text-neon-cyan shadow-neon-cyan'
                                : 'text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10'
                            }`
                        }
                    >
                        {item.label === 'Profil' && user?.profilePictureUrl ? (
                            <img
                                src={user.profilePictureUrl}
                                alt="Profile"
                                className="w-7 h-7 rounded-full object-cover border border-neon-cyan/50"
                            />
                        ) : (
                            <item.icon size={20} />
                        )}
                        <span className="absolute left-16 px-3 py-2 bg-dark-200 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity glass z-50">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
            >
                <LogOut size={20} />
                <span className="absolute left-16 px-3 py-2 bg-dark-200 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity glass z-50">
                    Çıkış Yap
                </span>
            </button>
        </aside>
    )
}

export default Sidebar
