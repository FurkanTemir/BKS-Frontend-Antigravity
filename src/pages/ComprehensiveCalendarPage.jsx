import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- COMPREHENSIVE CALENDAR PAGE (ARŞİV TAKVİM SAYFASI) ---
// Aylık görünüm: 30 gün, eşit parseller, sadece tamamlanmış öğeler

const ComprehensiveCalendarPage = () => {
  const navigate = useNavigate();
  
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  
  // Görüntülenecek ay ve yıl
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  // Takvim verilerini getir
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Ayın ilk ve son gününü hesapla
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await api.get(
        `/Calendar/comprehensive?startDate=${startDateStr}&endDate=${endDateStr}`
      );
      
      setCalendarData(response.data);
    } catch (err) {
      console.error("Takvim verileri çekilemedi", err);
      alert("Takvim verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Ay değiştirme fonksiyonları
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Ayın tüm günlerini oluştur (Pazar başlangıçlı - normal takvim)
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi

    const days = [];

    // Ayın başındaki boş günler (önceki aydan kalan)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Ayın günleri (1'den başlayarak)
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Belirli bir gün için etkinlikleri bul
  const getEventsForDate = (date) => {
    if (!date || !calendarData || calendarData.length === 0) return [];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const dayData = calendarData.find(d => {
      if (!d || !d.date) return false;
      
      let calendarDateStr;
      if (typeof d.date === 'string') {
        calendarDateStr = d.date.split('T')[0];
      } else {
        const calDate = new Date(d.date);
        const calYear = calDate.getUTCFullYear();
        const calMonth = String(calDate.getUTCMonth() + 1).padStart(2, '0');
        const calDay = String(calDate.getUTCDate()).padStart(2, '0');
        calendarDateStr = `${calYear}-${calMonth}-${calDay}`;
      }
      
      return calendarDateStr === dateString;
    });
    
    return dayData && dayData.events ? dayData.events : [];
  };

  // Gün tıklama - modal aç
  const handleDayClick = (date) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      setSelectedDate(date);
      setSelectedDayEvents(events);
    }
  };

  // Modal kapat
  const handleCloseModal = () => {
    setSelectedDate(null);
    setSelectedDayEvents([]);
  };

  // Etkinlik tipine göre ikon
  const getEventIcon = (type) => {
    switch (type) {
      case 'MockExam': return '📝';
      case 'StudySession': return '📚';
      case 'TopicCompleted': return '✅';
      case 'StudyPlan': return '📅';
      case 'ArchivedPlan': return '✅';
      default: return '•';
    }
  };

  // Etkinlik tipine göre renk
  const getEventColor = (type) => {
    switch (type) {
      case 'MockExam': return '#dc3545';
      case 'StudySession': return '#0d6efd';
      case 'TopicCompleted': return '#198754';
      case 'StudyPlan': return '#ffc107';
      case 'ArchivedPlan': return '#6f42c1'; // Mor (arşivlenmiş program)
      default: return '#6c757d';
    }
  };

  // Tarih formatlama
  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  // Haftanın günleri Pazar'dan başlayarak (normal takvim)
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  return (
    <div className="container mt-4">
      {/* Sayfa Başlığı */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📚 Arşiv Takvimi</h2>
          <p className="text-muted mb-0">
            Bitirilen dersler, geçmiş deneme sınavları ve çalışma oturumlarınızı görüntüleyin.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          ← Ana Sayfa
        </button>
      </div>

      {/* Ay Navigasyonu */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-outline-primary" onClick={goToPreviousMonth}>
              ← Önceki Ay
            </button>
            <div className="text-center">
              <h4 className="mb-0">{monthName}</h4>
              <button className="btn btn-sm btn-link" onClick={goToToday}>
                Bugüne Git
              </button>
            </div>
            <button className="btn btn-outline-primary" onClick={goToNextMonth}>
              Sonraki Ay →
            </button>
          </div>
        </div>
      </div>

      {/* Aylık Takvim Grid - Çalışma Programı Takvimi Stili */}
      <div className="card">
        <div className="card-body p-0">
          {/* Gün Başlıkları - Eşit Şeritler (Çalışma Programı Takvimi Stili) */}
          <div className="row g-0 fw-bold text-center border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
            {dayNames.map(dayName => (
              <div 
                key={dayName} 
                className="col border-end p-3"
                style={{ 
                  minHeight: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <div className="small text-muted">{dayName}</div>
              </div>
            ))}
          </div>

          {/* Takvim Günleri - Çalışma Programı Takvimi Stili */}
          <div className="row g-0">
            {days.map((date, index) => {
              const events = getEventsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const displayEvents = events.slice(0, 5); // İlk 5 öğe
              const hasMore = events.length > 5;
              
              return (
                <div
                  key={index}
                  className="col border-end border-bottom p-2"
                  style={{
                    minHeight: '150px',
                    backgroundColor: isToday ? '#f0f8ff' : date ? '#ffffff' : '#f8f9fa',
                    cursor: events.length > 0 ? 'pointer' : 'default'
                  }}
                  onClick={() => date && events.length > 0 && handleDayClick(date)}
                >
                  {date ? (
                    <>
                      {/* Gün Numarası */}
                      <div className={`fw-bold mb-2 ${isToday ? 'text-primary' : ''}`}>
                        {date.getDate()}
                      </div>

                      {/* Etkinlikler - Çalışma Programı Takvimi Stili */}
                      {events.length > 0 ? (
                        <div className="d-flex flex-column h-100">
                          {displayEvents.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="mb-2 p-2 rounded border"
                              style={{
                                backgroundColor: getEventColor(event.type) + '20',
                                borderColor: getEventColor(event.type),
                                fontSize: '0.85rem'
                              }}
                            >
                              <div className="fw-bold d-flex align-items-center">
                                <span className="me-1">{getEventIcon(event.type)}</span>
                                <span>{event.title}</span>
                              </div>
                              {event.description && (
                                <div className="text-muted small mt-1">{event.description}</div>
                              )}
                            </div>
                          ))}
                          {hasMore && (
                            <div className="mt-auto text-center">
                              <button className="btn btn-sm btn-outline-primary">
                                +{events.length - 5} daha...
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted small text-center mt-3">Etkinlik yok</div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted small">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal - Gün Detayları */}
      {selectedDate && selectedDayEvents.length > 0 && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {formatDate(selectedDate)} - Tamamlanmış Etkinlikler
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  {selectedDayEvents.map((event, index) => (
                    <div 
                      key={index} 
                      className="list-group-item"
                      style={{
                        borderLeft: `4px solid ${getEventColor(event.type)}`
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <span className="me-2">{getEventIcon(event.type)}</span>
                            {event.title}
                          </h6>
                          {event.description && (
                            <p className="mb-1 text-muted small">{event.description}</p>
                          )}
                          {event.time && (
                            <p className="mb-0 small text-muted">
                              {new Date(event.time).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Açıklama ve Renk Göstergesi */}
      <div className="card mt-4">
        <div className="card-body">
          <h5>Etkinlik Türleri</h5>
          <div className="row">
            <div className="col-md-3">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">📝</span>
                <span>Deneme Sınavları</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">📚</span>
                <span>Çalışma Oturumları</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">✅</span>
                <span>Tamamlanan Konular</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">📅</span>
                <span>Çalışma Programı</span>
              </div>
            </div>
          </div>
          <div className="alert alert-info mt-3 mb-0">
            <strong>ℹ️ Bilgi:</strong> Sadece tamamlanmış etkinlikler gösterilmektedir. Bir günde 3'ten fazla etkinlik varsa, 
            o güne tıklayarak tüm etkinlikleri görebilirsiniz.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveCalendarPage;
