import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Ekran boyutu değişince sidebar durumunu güncelle
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // İlk yüklemede çalıştır

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="main-content-wrapper">
                <TopBar />
                <div className="main-content fade-in">
                    {children}
                </div>
            </main>

            {/* Mobilde sidebar açıkken arkaplanı karart */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
};

export default MainLayout;
