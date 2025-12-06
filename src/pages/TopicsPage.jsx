import React, { useState, useEffect } from 'react';
import { FiBook, FiCheckCircle, FiCircle, FiFilter } from 'react-icons/fi';
import api from '../api/axiosConfig';
import Tooltip from '../components/Tooltip';

// --- TOPICS PAGE (KONU TAKİP SAYFASI) ---
// Modern, profesyonel konu takip sayfası.

const TopicsPage = ({ examType }) => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLesson, setFilterLesson] = useState('all'); // Ders filtresi
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'
  
  // JSON.parse hata yakalama
  let user = {};
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (err) {
    console.error('Kullanıcı bilgisi parse edilemedi:', err);
    // Bozuk JSON varsa localStorage'ı temizle
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  const userFieldType = user.fieldType;
  
  // AYT için alan seçimi artık yok - backend otomatik filtreliyor
  // Frontend'de sadece examType gönderiyoruz, backend kullanıcının alanına göre filtreliyor

  useEffect(() => {
    fetchTopics();
  }, [examType]);

  // Filtreleme
  useEffect(() => {
    let filtered = topics;

    // Ders filtresi
    if (filterLesson !== 'all') {
      filtered = filtered.filter(topic => topic.lesson === filterLesson);
    }

    // Durum filtresi
    if (filterStatus === 'completed') {
      filtered = filtered.filter(topic => topic.isCompleted);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(topic => !topic.isCompleted);
    }

    setFilteredTopics(filtered);
  }, [topics, filterLesson, filterStatus]);

  const fetchTopics = async (bypassCache = false) => {
    try {
      setLoading(true);
      // Backend otomatik olarak kullanıcının alanına göre filtreleme yapıyor
      // AYT için fieldType parametresi göndermiyoruz, backend kullanıcının alanını kullanıyor
      const url = `/Topics?examType=${examType}`;
      // Cache'i bypass etmek için timestamp ekle
      const cacheBuster = bypassCache ? `&_t=${Date.now()}` : '';
      const response = await api.get(url + cacheBuster);
      
      // Response.data artık direkt array (interceptor extract etti)
      if (Array.isArray(response.data)) {
        setTopics(response.data);
      } else {
        // Eğer ApiResponse formatındaysa, data'yı al
        const topicsData = response.data?.data || response.originalResponse?.data || response.data;
        if (Array.isArray(topicsData)) {
          setTopics(topicsData);
        } else {
          console.error("Beklenmeyen response formatı:", response.data);
        }
      }
    } catch (err) {
      console.error("Konular çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      const wasCompleted = topic?.isCompleted;
      
      console.log('Toggle başladı - TopicId:', topicId, 'Mevcut durum:', wasCompleted);
      
      // Optimistic update: Hemen state'i güncelle (kullanıcı deneyimi için)
      setTopics(prevTopics => 
        prevTopics.map(t => 
          t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
        )
      );
      
      // Backend'e istek gönder
      const response = await api.post('/Topics/toggle', { topicId });
      console.log('Backend response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.originalResponse:', response.originalResponse);
      
      // Backend'den gelen gerçek durumu al
      // Backend ApiResponse formatında döndürüyor: { success, message, data: { IsCompleted: true/false } }
      // Interceptor data'yı extract ediyor, yani response.data = { IsCompleted: true/false }
      let actualIsCompleted = !wasCompleted; // Varsayılan olarak toggle edilmiş durum
      
      if (response.data) {
        // response.data direkt { IsCompleted: true/false } olabilir (interceptor extract etti)
        // JavaScript property'leri case-sensitive, IsCompleted veya isCompleted olabilir
        if (typeof response.data === 'object') {
          actualIsCompleted = response.data.IsCompleted ?? response.data.isCompleted ?? !wasCompleted;
        }
        // Veya ApiResponse formatında olabilir (interceptor çalışmamışsa)
        else if (response.data.data && typeof response.data.data === 'object') {
          actualIsCompleted = response.data.data.IsCompleted ?? response.data.data.isCompleted ?? !wasCompleted;
        }
        // Veya originalResponse'dan al
        else if (response.originalResponse?.data && typeof response.originalResponse.data === 'object') {
          actualIsCompleted = response.originalResponse.data.IsCompleted ?? response.originalResponse.data.isCompleted ?? !wasCompleted;
        }
      }
      
      console.log('Backend\'den gelen durum:', actualIsCompleted);
      
      // State'i backend'den gelen değerle güncelle (optimistic update zaten yapıldı, sadece doğrulama için)
      // Eğer backend'den gelen değer farklıysa düzelt
      if (actualIsCompleted !== !wasCompleted) {
        setTopics(prevTopics => 
          prevTopics.map(t => 
            t.id === topicId ? { ...t, isCompleted: actualIsCompleted } : t
          )
        );
      }
      
      // Cache'i bypass etmek için fetchTopics'ı çağır (backend cache'i temizledi)
      // Biraz gecikme ile çağır ki backend cache temizlensin
      setTimeout(() => {
        fetchTopics(true); // Cache bypass - timestamp ekleyerek cache'i bypass et
      }, 800);
      
      // Motivasyon mesajı: Konu tamamlandıysa tebrik et
      if (!wasCompleted && actualIsCompleted) {
        setTimeout(() => {
          alert('🎉 Tebrikler! Bir konu daha tamamlandı. Devam edin!');
        }, 300);
      }
    } catch (err) {
      console.error("Toggle hatası:", err);
      console.error("Error response:", err.response);
      // Hata durumunda state'i geri al (rollback)
      setTopics(prevTopics => 
        prevTopics.map(t => 
          t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
        )
      );
      alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const completedCount = topics.filter(t => t.isCompleted).length;
  const totalCount = topics.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="modern-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FiBook className="me-2" size={20} />
              <h5 className="mb-0">{examType === 1 ? 'TYT' : 'AYT'} İlerleme Durumu</h5>
              <Tooltip text="Konuya tıklayarak tamamlandı olarak işaretleyebilirsiniz" />
            </div>
            <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {completedCount} / {totalCount}
            </span>
          </div>
        </div>
        <div className="card-body">
          {/* AYT için Alan Bilgisi (Sadece bilgilendirme, seçim yok) */}
          {examType === 2 && userFieldType && (
            <div className="mb-4 p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <FiFilter className="me-2" />
                <span className="fw-bold me-2">Alanınız:</span>
                <span className="badge bg-primary">
                  {userFieldType === 1 ? 'Sayısal' : userFieldType === 2 ? 'Eşit Ağırlık' : 'Sözel'}
                </span>
                <small className="text-muted ms-2">
                  (Sadece {userFieldType === 1 ? 'Sayısal' : userFieldType === 2 ? 'Eşit Ağırlık' : 'Sözel'} alanına ait konular gösterilmektedir)
                </small>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">İlerleme</span>
              <span className="fw-bold">{completionPercentage}%</span>
            </div>
            <div className="progress" style={{ height: '16px', borderRadius: '10px' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${completionPercentage}%` }}
              >
                {completionPercentage}%
              </div>
            </div>
          </div>

          {/* Filtreleme */}
          {topics.length > 0 && (
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Ders Filtresi</label>
                  <select
                    className="form-select"
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                  >
                    <option value="all">Tüm Dersler</option>
                    {[...new Set(topics.map(t => t.lesson))].sort().map(lesson => (
                      <option key={lesson} value={lesson}>{lesson}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Durum Filtresi</label>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tümü</option>
                    <option value="completed">Tamamlanan</option>
                    <option value="pending">Tamamlanmayan</option>
                  </select>
                </div>
              </div>
              {filteredTopics.length !== topics.length && (
                <div className="mt-2">
                  <small className="text-muted">
                    {filteredTopics.length} konu gösteriliyor (toplam {topics.length})
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Topics Grid */}
          <div className="row g-3">
            {filteredTopics.length > 0 ? filteredTopics.map((topic, index) => (
              <div key={topic.id} className="col-md-4 col-sm-6">
                <div 
                  className={`modern-card p-3 h-100 fade-in ${topic.isCompleted ? 'border-success border-2' : ''}`}
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleToggleTopic(topic.id)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        {topic.isCompleted ? (
                          <FiCheckCircle className="text-success me-2" size={20} />
                        ) : (
                          <FiCircle className="text-muted me-2" size={20} />
                        )}
                        <h6 className="mb-0 fw-bold">{topic.name}</h6>
                      </div>
                      <div className="ms-4">
                        <small className="text-muted d-block">{topic.lesson}</small>
                        {topic.fieldType !== 'None' && (
                          <span className="badge bg-info mt-1">{topic.fieldType}</span>
                        )}
                      </div>
                    </div>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={topic.isCompleted} 
                        onChange={() => handleToggleTopic(topic.id)}
                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <FiBook size={48} className="text-muted mb-3" />
                  <p className="text-muted">Filtre kriterlerinize uygun konu bulunamadı.</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setFilterLesson('all');
                      setFilterStatus('all');
                    }}
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            )}
          </div>

          {topics.length === 0 ? (
            <div className="text-center py-5">
              <FiBook size={64} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">Henüz konu bulunmamaktadır.</h5>
            </div>
          ) : completedCount === 0 ? (
            <div className="text-center py-5">
              <FiBook size={64} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">Henüz hiç konu tamamlamadınız.</h5>
              <p className="text-muted">İlk konunuzu tamamlayarak başlayın! Konuya tıklayarak tamamlandı olarak işaretleyebilirsiniz.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TopicsPage;

