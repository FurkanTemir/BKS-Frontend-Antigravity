import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- KEYBOARD SHORTCUTS HOOK ---
// Klavye kısayollarını yönetir

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K: Hızlı arama (notlar sayfasına git)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        navigate('/notes');
        // Notlar sayfasına gittikten sonra arama input'una focus
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="ara"]');
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }

      // Ctrl+N: Yeni not
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        navigate('/note/create');
      }

      // Ctrl+T: Zamanlayıcı
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        navigate('/timer');
      }

      // Ctrl+H: Ana sayfa (Dashboard)
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};

export default useKeyboardShortcuts;

