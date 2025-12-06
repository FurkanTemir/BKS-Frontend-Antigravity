import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// --- THEME TOGGLE (TEMA DEĞİŞTİRME BUTONU) ---
// Açık/karanlık tema arasında geçiş yapan buton.

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ThemeToggle tıklandı, mevcut tema:', theme);
    toggleTheme();
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-light me-2"
      onClick={handleClick}
      title={theme === 'light' ? 'Karanlık Temaya Geç' : 'Açık Temaya Geç'}
      style={{ 
        cursor: 'pointer',
        zIndex: 1000,
        position: 'relative'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;

