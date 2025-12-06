import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    FiHome, FiBook, FiCalendar, FiClock, FiBarChart2,
    FiFileText, FiTarget, FiTrendingUp, FiSettings,
    FiLogOut, FiChevronLeft, FiChevronRight, FiGrid, FiLayers, FiBookOpen, FiAward, FiMessageSquare, FiUsers
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    // Kullanıcı ve admin kontrolü
    let user = {};
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (err) {
        // Session hatası varsa login'e atmaz, ProtectedRoute halleder
    }

    const isAdmin = user.roles && Array.isArray(user.roles) && user.roles.includes('Admin');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', label: 'Ana Sayfa', icon: FiHome },
        { type: 'header', label: 'Akademik' },
        { to: '/tyt', label: 'TYT Konuları', icon: FiBook },
        { to: '/ayt', label: 'AYT Konuları', icon: FiBookOpen },
        { to: '/mock-exam', label: 'Deneme Sınavları', icon: FiTrendingUp },
        { type: 'header', label: 'Planlama' },
        { to: '/study-plan', label: 'Çalışma Programı', icon: FiTarget },
        { to: '/calendar', label: 'Takvim & Arşiv', icon: FiCalendar },
        { type: 'header', label: 'Araçlar' },
        { to: '/notes', label: 'Notlarım', icon: FiFileText },
        { to: '/study-sessions', label: 'Oturumlar', icon: FiGrid },
        { to: '/study-resource', label: 'Kaynaklar', icon: FiLayers },
        { to: '/timer', label: 'Zamanlayıcı', icon: FiClock },
        { to: '/analytics', label: 'Analizler', icon: FiBarChart2 },
        { to: '/leaderboard', label: 'Liderlik Tablosu', icon: FiAward },
        { to: '/friends', label: 'Arkadaşlar', icon: FiUsers },
        { to: '/chat', label: 'Mesajlar', icon: FiMessageSquare },
    ];

    if (isAdmin) {
        navItems.push({ type: 'header', label: 'Yönetim' });
        navItems.push({ to: '/admin/topics', label: 'Konu Yönetimi', icon: FiSettings });
    }

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <Link to="/dashboard" className="sidebar-logo">
                    <div className="logo-icon">📚</div>
                    {isOpen && <span className="logo-text">BKS<span className="logo-sub">Panel</span></span>}
                </Link>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
                </button>
            </div>

            <div className="sidebar-content">
                <nav className="sidebar-nav">
                    {navItems.map((item, index) => {
                        if (item.type === 'header') {
                            return isOpen ? (
                                <div key={index} className="nav-header">
                                    {item.label}
                                </div>
                            ) : (
                                <div key={index} className="nav-divider" />
                            );
                        }

                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                                title={!isOpen ? item.label : ''}
                            >
                                <div className="nav-icon">
                                    <Icon size={20} />
                                </div>
                                {isOpen && <span className="nav-label">{item.label}</span>}
                                {isOpen && item.badge && (
                                    <span className="nav-badge">{item.badge}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={handleLogout}>
                    <div className="nav-icon">
                        <FiLogOut size={20} />
                    </div>
                    {isOpen && <span className="nav-label">Çıkış Yap</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
