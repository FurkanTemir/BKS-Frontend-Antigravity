import { useEffect } from 'react';
import api from '../api/axiosConfig';

// --- USE NOTIFICATION HOOK (BİLDİRİM HOOK'U) ---
// Her dakika backend'e "kontrol et" isteği atar.
// Backend database'den hatırlatmaları çekip zaman kontrolü yapar.
// Zamanı gelen hatırlatmalar için NotificationMessage oluşturur.

export const useNotification = () => {
  useEffect(() => {
    console.log('🔔 useNotification hook başlatıldı - Her 1 dakikada bir kontrol edilecek');
    
    // İlk kontrolü hemen yap (1 dakika beklemek yerine)
    const checkNotifications = async () => {
      try {
        console.log('🔍 Bildirimler kontrol ediliyor...');
        // Backend'e POST isteği at
        // Backend şunları yapacak:
        // 1. Database'den aktif hatırlatmaları çek
        // 2. Bugün aktif mi kontrol et (gün kontrolü)
        // 3. Zaman uyuyor mu kontrol et (5 dakika tolerans)
        // 4. Son 1 saat içinde gönderilmiş mi kontrol et (spam önleme)
        // 5. Zamanı gelen hatırlatmalar için NotificationMessage oluştur
        const response = await api.post('/Notification/check-and-create');
        
        // DEBUG: Backend'den gelen debug bilgilerini console'a yazdır
        if (response.data.debug && response.data.debug.length > 0) {
          console.log('=== BİLDİRİM KONTROL SONUÇLARI ===');
          response.data.debug.forEach((info) => {
            console.log(info);
          });
          console.log('===================================');
        }
        
        // Eğer bildirim mesajı oluşturulduysa, NotificationBell'i güncelle
        if (response.data.messagesCreated > 0) {
          console.log(`✓ ${response.data.messagesCreated} adet bildirim mesajı oluşturuldu`);
          // NotificationBell component'i bu event'i dinleyip mesajları yeniden çekecek
          window.dispatchEvent(new Event('notificationCreated'));
        } else {
          console.log('ℹ️ Yeni bildirim mesajı oluşturulmadı');
        }
      } catch (err) {
        console.error("❌ Bildirimler kontrol edilemedi:", err.response?.data || err.message);
      }
    };

    // İlk kontrolü hemen yap (geçmiş bildirimleri de kontrol et)
    checkNotifications();

    // Sonra her 1 dakikada bir kontrol et
    const interval = setInterval(checkNotifications, 60000); // Her 60 saniyede bir (1 dakika)

    return () => clearInterval(interval);
  }, []); // Boş dependency array - sadece component mount olduğunda çalışır
};

