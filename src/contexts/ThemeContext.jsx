import React, { createContext, useContext, useState, useEffect } from 'react';

// --- THEME CONTEXT (TEMA BAĞLAM) ---
// Açık/karanlık tema yönetimi için context.

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // LocalStorage'dan tema tercihini oku, yoksa varsayılan olarak 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // İlk yüklemede tema class'ını uygula
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeClass = savedTheme === 'dark' ? 'dark-theme' : 'light-theme';
    // Önceki class'ları temizle
    document.body.classList.remove('light-theme', 'dark-theme');
    // Yeni class'ı ekle
    document.body.classList.add(themeClass);
    console.log('İlk yükleme - tema uygulandı:', savedTheme, 'class:', themeClass);
    console.log('Body class list:', document.body.className);
  }, []);

  useEffect(() => {
    // Tema değiştiğinde body'ye class ekle/çıkar
    const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';
    // Önceki class'ları temizle
    document.body.classList.remove('light-theme', 'dark-theme');
    // Yeni class'ı ekle
    document.body.classList.add(themeClass);
    localStorage.setItem('theme', theme);
    console.log('Tema değişti:', theme, 'class:', themeClass);
    console.log('Body class list:', document.body.className);
  }, [theme]);

  const toggleTheme = () => {
    console.log('toggleTheme çağrıldı, mevcut tema:', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Yeni tema:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

