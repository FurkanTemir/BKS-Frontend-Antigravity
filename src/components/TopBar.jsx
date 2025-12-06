import React from 'react';
import { FiSearch, FiBell, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { NavLink } from 'react-router-dom';

const TopBar = () => {
    // Kullanıcı bilgisini güvenli şekilde al
    let user = {};
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) user = JSON.parse(userStr);
    } catch (e) { }

    const isAdmin = user.roles && Array.isArray(user.roles) && user.roles.includes('Admin');
    const greeting = getGreeting();

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Günaydın';
        if (hour < 18) return 'Tünaydın';
        return 'İyi Akşamlar';
    }

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="greeting-container">
                    <h2 className="greeting-text">
                        {greeting}, <span className="user-name">{user.name || 'Öğrenci'}</span> 👋
                    </h2>
                    <p className="greeting-sub">Bugün hedeflerini tamamlamaya hazır mısın?</p>
                </div>
            </div>

            <div className="topbar-right">
                {/* Search Bar - Gelecekte aktif edilebilir
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Ara..." className="search-input" />
        </div>
        */}

                <div className="topbar-actions">
                    <ThemeToggle />
                    <NotificationBell />

                    <div className="user-profile-dropdown">
                        <NavLink to="/profile" className="user-profile-btn">
                            <div className="user-avatar">
                                {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                            </div>
                            <div className="user-info d-none d-md-block">
                                <span className="user-role">{isAdmin ? 'Yönetici' : 'Öğrenci'}</span>
                            </div>
                        </NavLink>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
