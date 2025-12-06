import axios from 'axios';

// --- AXIOS KONFİGÜRASYONU (HTTP İSTEMCİSİ) ---
// Frontend'in Backend ile konuşmasını sağlayan kütüphanenin ayarları.

const api = axios.create({
  baseURL: 'http://localhost:5166/api', // Backend adresi (Tüm istekler bu adrese gider)
  timeout: 30000, // 30 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR (İSTEK YAKALAYICI) ---
// Her istek (Request) gitmeden önce araya girer ve işlem yapar.
api.interceptors.request.use(
  (config) => {
    // Tarayıcı hafızasından (LocalStorage) Token'ı al
    const token = localStorage.getItem('token');
    
    if (token) {
      // Eğer token varsa, isteğin başlığına (Header) ekle
      // Backend bu sayede isteği kimin attığını anlar.
      // Format: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) // Hata varsa işlemi iptal et
);

// --- RESPONSE INTERCEPTOR (YANIT YAKALAYICI) ---
// Her yanıt (Response) geldiğinde araya girer ve işlem yapar.
api.interceptors.response.use(
  (response) => {
    try {
      // Backend standart ApiResponse<T> formatında döndürüyor
      // Eğer response.data ApiResponse formatındaysa (success, data, message, statusCode, timestamp varsa), data'yı extract et
      if (response.data && typeof response.data === 'object' && 
          'success' in response.data && 
          'data' in response.data && 
          'statusCode' in response.data) {
        // Standart ApiResponse formatı: { success, message, data, statusCode, timestamp }
        // Eski kodlarla uyumluluk için data'yı direkt döndür
        // Ama eğer data null veya undefined ise, tüm response'u döndür (AuthResponseDto gibi durumlar için)
        const extractedData = response.data.data !== undefined && response.data.data !== null 
          ? response.data.data 
          : response.data;
        
        return {
          ...response,
          data: extractedData,
          // Orijinal ApiResponse'i de sakla (gerekirse kullanılabilir)
          originalResponse: response.data
        };
      }
      // Eski format veya farklı format: olduğu gibi döndür
      return response;
    } catch (error) {
      console.error('Response interceptor error:', error);
      return response;
    }
  },
  (error) => {
    // Network hatası veya incomplete response
    if (!error.response) {
      console.error('Network error or incomplete response:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Tüm network hatalarını yakala
      if (error.code === 'ERR_NETWORK' || 
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.message?.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') || 
          error.message?.includes('Network Error') ||
          error.message?.includes('Failed to fetch')) {
        return Promise.reject({
          ...error,
          message: 'Sunucuya bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (http://localhost:5166)',
          response: {
            status: 0,
            data: { message: 'Sunucuya bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (http://localhost:5166)' }
          }
        });
      }
    }
    
    // 401 Unauthorized: Token geçersiz veya süresi dolmuş
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Login sayfasına yönlendir
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // 403 Forbidden: Yetki yok
    if (error.response?.status === 403) {
      console.error('Yetkiniz yok:', error.response.data);
    }
    // 500 Internal Server Error: Sunucu hatası
    if (error.response?.status === 500) {
      console.error('Sunucu hatası:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
