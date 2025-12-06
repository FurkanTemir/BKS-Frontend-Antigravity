import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- STUDY PLAN CALENDAR PAGE (ÇALIŞMA PROGRAMI TAKVİM GÖRÜNÜMÜ) ---
// Haftalık görünüm: 7 gün, eşit şeritler, sadece tamamlanmış öğeler

const StudyPlanCalendarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [calendarData, setCalendarData] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayItems, setSelectedDayItems] = useState([]);
  
  // Görüntülenecek hafta
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Pazar
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Haftanın başlangıcı (Pazar)
    return startOfWeek;
  });

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    if (id) {
      fetchPlanAndCalendar();
    } else {
      fetchActivePlan();
    }
  }, [id, currentWeek]);

  // Aktif programı getir
  const fetchActivePlan = async () => {
    try {
      const response = await api.get('/StudyPlan/active');
      if (response.data) {
        setPlan(response.data);
        fetchCalendarData(response.data.id);
      } else {
        alert("Aktif program bulunamadı. Lütfen önce bir program oluşturun.");
        navigate('/study-plan');
      }
    } catch (err) {
      console.error("Aktif program çekilemedi", err);
      alert("Program yüklenirken bir hata oluştu.");
      navigate('/study-plan');
    }
  };

  // Program ve takvim verilerini getir
  const fetchPlanAndCalendar = async () => {
    try {
      setLoading(true);
      
      const planResponse = await api.get(`/StudyPlan/${id}`);
      setPlan(planResponse.data);
      
      fetchCalendarData(id);
    } catch (err) {
      console.error("Program çekilemedi", err);
      alert("Program yüklenirken bir hata oluştu.");
      navigate('/study-plan');
    } finally {
      setLoading(false);
    }
  };

  // Takvim verilerini getir (haftalık)
  const fetchCalendarData = async (planId) => {
    try {
      // Haftanın ilk ve son gününü hesapla
      const weekStart = new Date(currentWeek);
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekStart.getDate() + 6); // 7 gün

      const startDateStr = weekStart.toISOString().split('T')[0];
      const endDateStr = weekEnd.toISOString().split('T')[0];
      
      const response = await api.get(
        `/StudyPlan/calendar?startDate=${startDateStr}&endDate=${endDateStr}`
      );
      
      setCalendarData(response.data);
    } catch (err) {
      console.error("Takvim verileri çekilemedi", err);
    }
  };

  // Hafta değiştirme fonksiyonları
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    setCurrentWeek(startOfWeek);
  };

  // Haftanın 7 gününü oluştur
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Belirli bir gün için plan detaylarını bul
  const getItemsForDate = (date) => {
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
    
    return dayData && dayData.items ? dayData.items : [];
  };

  // Gün tıklama - modal aç
  const handleDayClick = (date) => {
    const items = getItemsForDate(date);
    if (items.length > 0) {
      setSelectedDate(date);
      setSelectedDayItems(items);
    }
  };

  // Modal kapat
  const handleCloseModal = () => {
    setSelectedDate(null);
    setSelectedDayItems([]);
  };

  // Ders tamamlandı/tamamlanmadı toggle
  const handleToggleComplete = async (item, e) => {
    e.stopPropagation(); // Modal açılmasını engelle
    
    try {
      await api.put('/StudyPlan/item', {
        id: item.id,
        date: item.date,
        topicId: item.topicId,
        startTime: item.startTime || null,
        endTime: item.endTime || null,
        isCompleted: !item.isCompleted, // Toggle
        notes: item.notes || null
      });
      
      // Verileri yeniden yükle
      if (id) {
        await fetchCalendarData(id);
      } else if (plan) {
        await fetchCalendarData(plan.id);
      }
    } catch (err) {
      console.error("Plan detayı güncellenemedi", err);
      alert("Plan detayı güncellenirken bir hata oluştu.");
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

  // Hafta aralığını formatla
  const formatWeekRange = () => {
    const weekStart = new Date(currentWeek);
    const weekEnd = new Date(currentWeek);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - ${weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
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

  const weekDays = getWeekDays();
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  return (
    <div className="container mt-4">
      {/* Sayfa Başlığı */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📅 Haftalık Takvim Görünümü</h2>
          {plan && <p className="text-muted mb-0">{plan.name}</p>}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/study-plan')}>
          ← Program Listesi
        </button>
      </div>

      {/* Hafta Navigasyonu */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-outline-primary" onClick={goToPreviousWeek}>
              ← Önceki Hafta
            </button>
            <div className="text-center">
              <h5 className="mb-0">{formatWeekRange()}</h5>
              <button className="btn btn-sm btn-link" onClick={goToToday}>
                Bu Haftaya Git
              </button>
            </div>
            <button className="btn btn-outline-primary" onClick={goToNextWeek}>
              Sonraki Hafta →
            </button>
          </div>
        </div>
      </div>

      {/* Haftalık Takvim Grid - Eşit Şeritler */}
      <div className="card">
        <div className="card-body p-0">
          {/* Gün Başlıkları - Eşit Şeritler */}
          <div className="row g-0 fw-bold text-center border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
            {dayNames.map((dayName, index) => {
              const date = weekDays[index];
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={index} 
                  className="col border-end p-3"
                  style={{ 
                    minHeight: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: isToday ? '#e3f2fd' : 'transparent'
                  }}
                >
                  <div className="small text-muted">{dayName}</div>
                  <div className={`h5 mb-0 ${isToday ? 'text-primary' : ''}`}>
                    {date ? date.getDate() : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gün İçerikleri - Eşit Yükseklik */}
          <div className="row g-0" style={{ minHeight: '400px' }}>
            {weekDays.map((date, index) => {
              const items = getItemsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const displayItems = items.slice(0, 5); // İlk 5 öğe
              const hasMore = items.length > 5;
              
              return (
                <div
                  key={index}
                  className="col border-end p-2"
                  style={{
                    minHeight: '400px',
                    backgroundColor: isToday ? '#f0f8ff' : '#ffffff',
                    cursor: items.length > 0 ? 'pointer' : 'default'
                  }}
                  onClick={() => items.length > 0 && handleDayClick(date)}
                >
                  {items.length > 0 ? (
                    <div className="d-flex flex-column h-100">
                      {displayItems.map((item, itemIndex) => (
                        <div
                          key={item.id || itemIndex}
                          className="mb-2 p-2 rounded border"
                          style={{
                            backgroundColor: item.isCompleted ? '#d4edda' : '#fff3cd',
                            borderColor: item.isCompleted ? '#28a745' : '#ffc107',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => handleToggleComplete(item, e)}
                          title={item.isCompleted ? 'Tamamlandı - Tıklayarak geri al' : 'Tamamlanmadı - Tıklayarak tamamla'}
                        >
                          <div className={`fw-bold ${item.isCompleted ? 'text-success' : 'text-warning'}`}>
                            {item.isCompleted ? '✓' : '○'} {item.topicName}
                          </div>
                          <div className="text-muted small">{item.lesson}</div>
                        </div>
                      ))}
                      {hasMore && (
                        <div className="mt-auto text-center">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDayClick(date);
                            }}
                          >
                            +{items.length - 5} daha...
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted small text-center mt-3">Ders yok</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal - Gün Detayları */}
      {selectedDate && selectedDayItems.length > 0 && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {formatDate(selectedDate)} - Tamamlanmış Dersler
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  {selectedDayItems.map((item, index) => (
                    <div 
                      key={item.id || index} 
                      className="list-group-item"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => handleToggleComplete(item, e)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className={`mb-1 ${item.isCompleted ? 'text-success' : 'text-warning'}`}>
                            {item.isCompleted ? '✓' : '○'} {item.topicName}
                          </h6>
                          <p className="mb-1 text-muted small">{item.lesson}</p>
                          {item.notes && (
                            <p className="mb-0 small">{item.notes}</p>
                          )}
                        </div>
                        <button 
                          className={`btn btn-sm ${item.isCompleted ? 'btn-success' : 'btn-warning'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(item, e);
                          }}
                        >
                          {item.isCompleted ? 'Tamamlandı' : 'Tamamlanmadı'}
                        </button>
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

      {/* Açıklama */}
      <div className="alert alert-info mt-4">
        <strong>ℹ️ Bilgi:</strong> Derslere tıklayarak tamamlandı/tamamlanmadı olarak işaretleyebilirsiniz. 
        Bir günde 5'ten fazla ders varsa, o güne tıklayarak tüm dersleri görebilirsiniz.
      </div>
    </div>
  );
};

export default StudyPlanCalendarPage;
