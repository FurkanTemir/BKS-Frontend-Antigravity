// --- CLIPBOARD UTILITIES ---
// Kopyalama işlemleri için yardımcı fonksiyonlar

export const copyToClipboard = async (text, onSuccess, onError) => {
  try {
    await navigator.clipboard.writeText(text);
    if (onSuccess) onSuccess();
    return true;
  } catch (err) {
    console.error('Kopyalama hatası:', err);
    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (onSuccess) onSuccess();
      return true;
    } catch (fallbackErr) {
      console.error('Fallback kopyalama hatası:', fallbackErr);
      if (onError) onError();
      return false;
    }
  }
};

export const copyToClipboardWithToast = async (text, showToast) => {
  const success = await copyToClipboard(
    text,
    () => showToast('Kopyalandı!', 'success'),
    () => showToast('Kopyalama başarısız oldu', 'error')
  );
  return success;
};

