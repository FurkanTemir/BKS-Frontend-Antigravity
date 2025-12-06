import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClock, FiTrendingUp, FiBook, FiTarget, FiActivity,
  FiArrowRight, FiCheckCircle, FiCalendar, FiBarChart2, FiFileText, FiX
} from 'react-icons/fi';
import api from '../api/axiosConfig';
import Tooltip from '../components/Tooltip';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { useToast } from '../components/Toast';
import { formatMinutes } from '../utils/formatters';
import WidgetCustomizer from '../components/WidgetCustomizer';
import { useWidgetConfig, WIDGET_IDS } from '../hooks/useWidgetConfig';
import StudyTrendChart from '../components/charts/StudyTrendChart';
import TopicProgressChart from '../components/charts/TopicProgressChart';
import MockExamTrendChart from '../components/charts/MockExamTrendChart';
import AiCoachCard from '../components/AiCoachCard';

// --- DASHBOARD PAGE (ANA SAYFA) ---
// Modern, profesyonel dashboard sayfası.

const DashboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isWidgetEnabled, getOrderedWidgets, reorderWidget } = useWidgetConfig();

  // State definitions
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [studyTrendData, setStudyTrendData] = useState([]);
  const [mockExamTrendData, setMockExamTrendData] = useState([]);

  // --- DATA FETCHING (VERİ ÇEKME) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Özet bilgileri çek (Kritik)
        try {
          const summaryResponse = await api.get('/Dashboard/summary');
          setSummary(summaryResponse.data);
        } catch (err) {
          console.error('Özet veri hatası:', err);
          throw new Error('Ana dashboard verileri alınamadı.');
        }

        // 2. Haftalık çalışma verilerini çek (Opsiyonel - Grafik için)
        try {
          const today = new Date();
          const startOfWeek = new Date(today);
          const currentDay = startOfWeek.getDay(); // Pazar 0, Pzt 1, ...
          const diff = startOfWeek.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Pazartesiye ayarla
          startOfWeek.setDate(diff);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          const sessionsResponse = await api.get('/StudySession', {
            params: {
              startDate: startOfWeek.toISOString(),
              endDate: endOfWeek.toISOString()
            }
          });

          if (sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
            // Günlük toplamları hesapla (Pzt-Paz)
            const dailyTotals = Array(7).fill(0);
            sessionsResponse.data.forEach(session => {
              if (!session.startTime) return;
              const sessionDate = new Date(session.startTime);
              let dayIndex = sessionDate.getDay(); // 0=Pazar
              dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0=Pzt, 6=Pazar yap

              if (dayIndex >= 0 && dayIndex < 7) {
                dailyTotals[dayIndex] += Math.round((session.durationSeconds || 0) / 60);
              }
            });
            setStudyTrendData(dailyTotals);
          }
        } catch (warn) {
          console.warn("Çalışma trendi yüklenemedi:", warn);
          // Kritik değil
        }

        // 3. Deneme sınavı trend verilerini çek (Opsiyonel - Grafik için)
        try {
          const mockTrendResponse = await api.get('/MockExam/charts/net-change', { params: { examType: 1 } });
          if (mockTrendResponse.data && Array.isArray(mockTrendResponse.data)) {
            const formattedMockData = mockTrendResponse.data.map(item => ({
              date: new Date(item.examDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
              net: item.totalNet
            }));
            setMockExamTrendData(formattedMockData);
          }
        } catch (warn) {
          console.warn("Deneme grafiği verisi yüklenemedi:", warn);
          // Kritik değil
        }

      } catch (err) {
        console.error('Dashboard genel hatası:', err);
        setError('Temel dashboard verileri yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Check for welcome
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && !loading && summary) {
      setShowWelcomeModal(true);
    }
  }, [loading, summary]);

  // Widget sürükleme fonksiyonları
  const handleWidgetDragStart = (e, widgetId) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    setDraggedWidgetId(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', widgetId);
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleWidgetDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.cursor = isEditMode ? 'grab' : 'default';
    setDraggedWidgetId(null);
  };

  const handleWidgetDragOver = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleWidgetDrop = (e, targetWidgetId) => {
    if (!isEditMode) return;
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
      reorderWidget(draggedWidgetId, targetWidgetId);
      showToast('Widget sırası güncellendi', 'success');
    }
    setDraggedWidgetId(null);
  };

  // Widget üzerine basılı tutunca düzenleme modu
  const handleWidgetLongPress = (e, widgetId) => {
    if (isEditMode) return;

    const timer = setTimeout(() => {
      setIsEditMode(true);
      showToast('Düzenleme modu açıldı. Widget\'ları sürükleyerek sıralayın.', 'info');
      setDraggedWidgetId(widgetId);
    }, 600);

    setLongPressTimer(timer);

    const handleMouseUp = () => {
      clearTimeout(timer);
      setLongPressTimer(null);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
  };

  // Widget render fonksiyonları
  const renderWidget = (widgetId) => {
    if (!summary) return null;

    switch (widgetId) {
      case WIDGET_IDS.STUDY_TIME_STATS:
        return (
          <div
            key={widgetId}
            className={`row g-4 mb-4 widget-container ${isEditMode ? 'edit-mode' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            onDragEnd={handleWidgetDragEnd}
            onDragOver={handleWidgetDragOver}
            onDrop={(e) => handleWidgetDrop(e, widgetId)}
            onMouseDown={(e) => handleWidgetLongPress(e, widgetId)}
            onTouchStart={(e) => handleWidgetLongPress(e, widgetId)}
            style={{ cursor: isEditMode ? 'grab' : 'default' }}
          >
            {/* Sol Taraf: Özet Kartları (Dikey) */}
            <div className="col-lg-4 d-flex flex-column gap-3">
              <div className="modern-card p-3 flex-grow-1 d-flex align-items-center">
                <div className="me-3 p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                  <FiClock size={24} />
                </div>
                <div>
                  <p className="text-muted mb-0 small">Bugün</p>
                  <h3 className="mb-0 fw-bold">{formatMinutes(summary.studyTime.todayMinutes)}</h3>
                </div>
              </div>
              <div className="modern-card p-3 flex-grow-1 d-flex align-items-center">
                <div className="me-3 p-3 rounded-circle bg-success bg-opacity-10 text-success">
                  <FiCalendar size={24} />
                </div>
                <div>
                  <p className="text-muted mb-0 small">Bu Hafta</p>
                  <h3 className="mb-0 fw-bold">{formatMinutes(summary.studyTime.thisWeekMinutes)}</h3>
                </div>
              </div>
              <div className="modern-card p-3 flex-grow-1 d-flex align-items-center">
                <div className="me-3 p-3 rounded-circle bg-info bg-opacity-10 text-info">
                  <FiTrendingUp size={24} />
                </div>
                <div>
                  <p className="text-muted mb-0 small">Toplam</p>
                  <h3 className="mb-0 fw-bold">{formatMinutes(summary.studyTime.totalMinutes)}</h3>
                </div>
              </div>
            </div>

            {/* Sağ Taraf: Büyük Grafik */}
            <div className="col-lg-8">
              <div className="modern-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">Haftalık Çalışma Eğilimi</h5>
                  <select className="form-select form-select-sm w-auto border-0 bg-light">
                    <option>Bu Hafta</option>
                    <option>Geçen Hafta</option>
                  </select>
                </div>
                <div style={{ height: '240px' }}>
                  <StudyTrendChart data={studyTrendData} />
                </div>
              </div>
            </div>
          </div>
        );

      case WIDGET_IDS.SESSION_SUMMARY:
        return (
          <div
            key={widgetId}
            className={`row g-4 mb-4 widget-container ${isEditMode ? 'edit-mode' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            onDragEnd={handleWidgetDragEnd}
            onDragOver={handleWidgetDragOver}
            onDrop={(e) => handleWidgetDrop(e, widgetId)}
            onMouseDown={(e) => handleWidgetLongPress(e, widgetId)}
            onTouchStart={(e) => handleWidgetLongPress(e, widgetId)}
            style={{ cursor: isEditMode ? 'grab' : 'default' }}
          >
            <div className="col-md-6">
              <div className="modern-card p-4 fade-in">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <FiClock size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-0">Pomodoro Oturumları</h5>
                    <p className="text-muted mb-0 small">Toplam oturum sayısı</p>
                  </div>
                </div>
                <h2 className="text-primary mb-0">{summary.studyTime.pomodoroCount}</h2>
              </div>
            </div>
            <div className="col-md-6">
              <div className="modern-card p-4 fade-in">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <FiActivity size={24} className="text-info" />
                  </div>
                  <div>
                    <h5 className="mb-0">Normal Oturumlar</h5>
                    <p className="text-muted mb-0 small">Toplam oturum sayısı</p>
                  </div>
                </div>
                <h2 className="text-info mb-0">{summary.studyTime.normalSessionCount}</h2>
              </div>
            </div>
          </div>
        );

      case WIDGET_IDS.MOCK_EXAM:
        return (
          <div
            key={widgetId}
            className={`col-md-6 mb-4 widget-container ${isEditMode ? 'edit-mode' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            onDragEnd={handleWidgetDragEnd}
            onDragOver={handleWidgetDragOver}
            onDrop={(e) => handleWidgetDrop(e, widgetId)}
            onMouseDown={(e) => handleWidgetLongPress(e, widgetId)}
            onTouchStart={(e) => handleWidgetLongPress(e, widgetId)}
            style={{ cursor: isEditMode ? 'grab' : 'default' }}
          >
            <div className="modern-card h-100 fade-in p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <div className="p-2 bg-primary bg-opacity-10 rounded me-3 text-primary">
                    <FiTrendingUp size={20} />
                  </div>
                  <h5 className="mb-0 fw-bold">Deneme Sınavı Netleri</h5>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate('/mock-exam')}
                >
                  Detaylar
                </button>
              </div>
              <div style={{ height: '200px' }}>
                {mockExamTrendData.length > 0 ? (
                  <MockExamTrendChart data={mockExamTrendData} />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <FiBarChart2 size={32} className="mb-2 opacity-50" />
                    <p className="mb-0 small">Henüz deneme verisi yok</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case WIDGET_IDS.TOPIC_PROGRESS:
        return (
          <div
            key={widgetId}
            className={`col-md-6 mb-4 widget-container ${isEditMode ? 'edit-mode' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            onDragEnd={handleWidgetDragEnd}
            onDragOver={handleWidgetDragOver}
            onDrop={(e) => handleWidgetDrop(e, widgetId)}
            onMouseDown={(e) => handleWidgetLongPress(e, widgetId)}
            onTouchStart={(e) => handleWidgetLongPress(e, widgetId)}
            style={{ cursor: isEditMode ? 'grab' : 'default' }}
          >
            <div className="modern-card h-100 fade-in p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <div className="p-2 bg-success bg-opacity-10 rounded me-3 text-success">
                    <FiBook size={20} />
                  </div>
                  <h5 className="mb-0 fw-bold">Konu İlerlemesi</h5>
                </div>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => navigate('/tyt')}
                >
                  Detaylar
                </button>
              </div>

              <div className="row align-items-center">
                <div className="col-6" style={{ height: '180px' }}>
                  <TopicProgressChart
                    completed={summary.topicProgress.completedTopics}
                    remaining={summary.topicProgress.totalTopics - summary.topicProgress.completedTopics}
                  />
                </div>
                <div className="col-6">
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-1">
                      <div className="badge rounded-circle bg-success me-2" style={{ width: 8, height: 8, padding: 0 }}> </div>
                      <span className="text-muted small">Tamamlanan</span>
                    </div>
                    <h5 className="fw-bold mb-0">{summary.topicProgress.completedTopics} Konu</h5>
                  </div>
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <div className="badge rounded-circle bg-secondary bg-opacity-25 me-2" style={{ width: 8, height: 8, padding: 0 }}> </div>
                      <span className="text-muted small">Kalan</span>
                    </div>
                    <h5 className="fw-bold mb-0">{summary.topicProgress.totalTopics - summary.topicProgress.completedTopics} Konu</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case WIDGET_IDS.DAILY_GOALS:
        if (!summary.dailyGoals.hasActivePlan) return null;
        return (
          <div
            key={widgetId}
            className={`row mb-4 widget-container ${isEditMode ? 'edit-mode' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            onDragEnd={handleWidgetDragEnd}
            onDragOver={handleWidgetDragOver}
            onDrop={(e) => handleWidgetDrop(e, widgetId)}
            onMouseDown={(e) => handleWidgetLongPress(e, widgetId)}
            onTouchStart={(e) => handleWidgetLongPress(e, widgetId)}
            style={{ cursor: isEditMode ? 'grab' : 'default' }}
          >
            <div className="col-md-12">
              <div className="modern-card fade-in">
                <div className="card-header">
                  <div className="d-flex align-items-center">
                    <FiTarget className="me-2" size={20} />
                    <h5 className="mb-0">Günün Hedefleri</h5>
                  </div>
                </div>
                <div className="card-body">
                  {summary.dailyGoals.plannedStudyMinutes > 0 &&
                    summary.dailyGoals.actualStudyMinutes >= summary.dailyGoals.plannedStudyMinutes && (
                      <div className="alert alert-success d-flex align-items-center mb-3">
                        <span className="me-2" style={{ fontSize: '24px' }}>🎉</span>
                        <div>
                          <strong>Harika!</strong> Bugünkü hedefinizi tamamladınız!
                        </div>
                      </div>
                    )}

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Planlanan Çalışma</span>
                          <span className="fw-bold">{formatMinutes(summary.dailyGoals.plannedStudyMinutes)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Gerçekleşen Çalışma</span>
                          <span className="fw-bold text-success">{formatMinutes(summary.dailyGoals.actualStudyMinutes)}</span>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{
                              width: summary.dailyGoals.plannedStudyMinutes > 0
                                ? `${Math.min((summary.dailyGoals.actualStudyMinutes / summary.dailyGoals.plannedStudyMinutes) * 100, 100)}%`
                                : '0%'
                            }}
                          >
                            {summary.dailyGoals.plannedStudyMinutes > 0
                              ? `${Math.min(((summary.dailyGoals.actualStudyMinutes / summary.dailyGoals.plannedStudyMinutes) * 100).toFixed(0), 100)}%`
                              : '0%'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Planlanan Konular</span>
                          <span className="fw-bold">{summary.dailyGoals.plannedTopicsCount}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Tamamlanan Konular</span>
                          <span className="fw-bold text-success">{summary.dailyGoals.completedTopicsCount}</span>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: summary.dailyGoals.plannedTopicsCount > 0
                                ? `${Math.min((summary.dailyGoals.completedTopicsCount / summary.dailyGoals.plannedTopicsCount) * 100, 100)}%`
                                : '0%'
                            }}
                          >
                            {summary.dailyGoals.plannedTopicsCount > 0
                              ? `${Math.min(((summary.dailyGoals.completedTopicsCount / summary.dailyGoals.plannedTopicsCount) * 100).toFixed(0), 100)}%`
                              : '0%'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/study-plan')}
                  >
                    Çalışma Programına Git
                    <FiArrowRight className="ms-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case WIDGET_IDS.RECENT_ACTIVITIES:
        if (summary.recentActivities.length === 0) return null;
        return (
          <div
            key={widgetId}
            className={`row mb-4 widget-container ${isEditMode ? 'edit-mode' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
            onDragEnd={handleWidgetDragEnd}
            onDragOver={handleWidgetDragOver}
            onDrop={(e) => handleWidgetDrop(e, widgetId)}
            onMouseDown={(e) => handleWidgetLongPress(e, widgetId)}
            onTouchStart={(e) => handleWidgetLongPress(e, widgetId)}
            style={{ cursor: isEditMode ? 'grab' : 'default' }}
          >
            <div className="col-md-12">
              <div className="modern-card fade-in p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <div className="p-2 bg-warning bg-opacity-10 rounded me-3 text-warning">
                      <FiActivity size={20} />
                    </div>
                    <h5 className="mb-0 fw-bold">Son Aktiviteler</h5>
                  </div>
                </div>

                <div className="timeline">
                  {summary.recentActivities.map((activity, index) => (
                    <div key={index} className="timeline-item">
                      <div className={`timeline-marker ${activity.type === 'StudySession' ? 'primary' :
                        activity.type === 'MockExam' ? 'success' : 'info'
                        }`}></div>
                      <div className="timeline-content">
                        <span className="timeline-date">
                          {new Date(activity.date).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <div className="fw-bold text-dark dark:text-light mb-1">{activity.description}</div>
                        <span className="badge bg-secondary bg-opacity-25 text-secondary rounded-pill px-3">
                          {activity.type === 'StudySession' ? 'Çalışma' :
                            activity.type === 'MockExam' ? 'Deneme' : 'Sistem'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Klavye kısayolları
  useKeyboardShortcuts();

  // Düzenleme modu için klavye kısayolu (E tuşu)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // E tuşu ile düzenleme modunu aç/kapat (input alanında değilse)
      if (e.key === 'e' || e.key === 'E') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
          e.preventDefault();
          setIsEditMode(prev => {
            if (!prev) {
              showToast('Düzenleme modu açıldı. Widget\'ları sürükleyerek sıralayın.', 'info');
            }
            return !prev;
          });
        }
      }
      // ESC tuşu ile düzenleme modunu kapat
      if (e.key === 'Escape' && isEditMode) {
        setIsEditMode(false);
        showToast('Düzenleme modu kapatıldı', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEditMode, showToast]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger fade-in">
        <FiActivity className="me-2" />
        {error}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-gradient mb-2">Ana Sayfa</h1>
          <p className="text-muted">Çalışma performansınızın genel görünümü</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {isEditMode && (
            <div className="badge bg-warning text-dark me-2">
              Düzenleme Modu Aktif (ESC ile kapat)
            </div>
          )}
          <WidgetCustomizer isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
        </div>
      </div>

      {/* Widget'ları sıralı olarak render et */}
      {(() => {
        const orderedWidgets = getOrderedWidgets().filter(w => isWidgetEnabled(w.id));
        const widgetsToRender = [];
        let currentRow = [];
        let mockExamOrTopicInRow = false;

        orderedWidgets.forEach((widget, index) => {
          // Mock Exam ve Topic Progress aynı satırda olmalı
          if (widget.id === WIDGET_IDS.MOCK_EXAM || widget.id === WIDGET_IDS.TOPIC_PROGRESS) {
            if (!mockExamOrTopicInRow) {
              // Yeni bir row başlat
              if (currentRow.length > 0) {
                widgetsToRender.push(
                  <div key={`row-${widgetsToRender.length}`} className="row g-4 mb-4">
                    {currentRow}
                  </div>
                );
                currentRow = [];
              }
              mockExamOrTopicInRow = true;
            }
            currentRow.push(renderWidget(widget.id));

            // Eğer ikisi de render edildiyse veya sıra bittiyse row'u kapat
            const hasMockExam = orderedWidgets.some(w => w.id === WIDGET_IDS.MOCK_EXAM && isWidgetEnabled(WIDGET_IDS.MOCK_EXAM));
            const hasTopicProgress = orderedWidgets.some(w => w.id === WIDGET_IDS.TOPIC_PROGRESS && isWidgetEnabled(WIDGET_IDS.TOPIC_PROGRESS));
            const nextWidget = orderedWidgets[index + 1];

            if ((hasMockExam && hasTopicProgress && currentRow.length === 2) ||
              !nextWidget ||
              (nextWidget.id !== WIDGET_IDS.MOCK_EXAM && nextWidget.id !== WIDGET_IDS.TOPIC_PROGRESS)) {
              widgetsToRender.push(
                <div key={`row-${widgetsToRender.length}`} className="row g-4 mb-4">
                  {currentRow}
                </div>
              );
              currentRow = [];
              mockExamOrTopicInRow = false;
            }
          } else {
            // Diğer widget'lar için normal render
            if (mockExamOrTopicInRow && currentRow.length > 0) {
              widgetsToRender.push(
                <div key={`row-${widgetsToRender.length}`} className="row g-4 mb-4">
                  {currentRow}
                </div>
              );
              currentRow = [];
              mockExamOrTopicInRow = false;
            }

            // Full-width widget'lar için ayrı row
            if (widget.id === WIDGET_IDS.STUDY_TIME_STATS ||
              widget.id === WIDGET_IDS.SESSION_SUMMARY ||
              widget.id === WIDGET_IDS.DAILY_GOALS ||
              widget.id === WIDGET_IDS.RECENT_ACTIVITIES) {
              if (currentRow.length > 0) {
                widgetsToRender.push(
                  <div key={`row-${widgetsToRender.length}`} className="row g-4 mb-4">
                    {currentRow}
                  </div>
                );
                currentRow = [];
              }
              widgetsToRender.push(renderWidget(widget.id));
            } else {
              currentRow.push(renderWidget(widget.id));
            }
          }
        });

        // Kalan widget'ları ekle
        if (currentRow.length > 0) {
          widgetsToRender.push(
            <div key={`row-${widgetsToRender.length}`} className="row g-4 mb-4">
              {currentRow}
            </div>
          );
        }

        return widgetsToRender;
      })()}

      {/* Hoş Geldin Modal'ı */}
      {showWelcomeModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => {
              setShowWelcomeModal(false);
              localStorage.setItem('hasSeenWelcome', 'true');
            }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050, pointerEvents: 'auto' }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" style={{ pointerEvents: 'auto' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Hoş Geldiniz! 🎉</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      localStorage.setItem('hasSeenWelcome', 'true');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="lead">BKS'ye hoş geldiniz! İşte başlamak için 3 adım:</p>
                  <ol>
                    <li className="mb-2">
                      <strong>İlk deneme sınavınızı ekleyin</strong>
                      <br />
                      <small className="text-muted">Deneme sınavı sonuçlarınızı takip edin ve ilerlemenizi görün</small>
                    </li>
                    <li className="mb-2">
                      <strong>İlk çalışma programınızı oluşturun</strong>
                      <br />
                      <small className="text-muted">Hedeflerinize ulaşmak için plan yapın</small>
                    </li>
                    <li className="mb-2">
                      <strong>Konularınızı takip edin</strong>
                      <br />
                      <small className="text-muted">TYT ve AYT konularınızı tamamlandı olarak işaretleyin</small>
                    </li>
                  </ol>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowWelcomeModal(false);
                        localStorage.setItem('hasSeenWelcome', 'true');
                        navigate('/mock-exam/create');
                      }}
                    >
                      Deneme Sınavı Ekle
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setShowWelcomeModal(false);
                        localStorage.setItem('hasSeenWelcome', 'true');
                        navigate('/study-plan/create');
                      }}
                    >
                      Program Oluştur
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowWelcomeModal(false);
                        localStorage.setItem('hasSeenWelcome', 'true');
                      }}
                    >
                      Daha Sonra
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* İlk Kullanım Yönlendirmeleri */}
      {summary && summary.mockExam.totalExams === 0 && (
        <div className="alert alert-info fade-in mb-4">
          <FiTrendingUp className="me-2" />
          <strong>İlk adım:</strong> İlk deneme sınavınızı ekleyerek başlayın!
          <button
            className="btn btn-sm btn-primary ms-2"
            onClick={() => navigate('/mock-exam/create')}
          >
            Deneme Sınavı Ekle
          </button>
        </div>
      )}

      {summary && !summary.dailyGoals.hasActivePlan && (
        <div className="alert alert-info fade-in mb-4">
          <FiTarget className="me-2" />
          <strong>İlk adım:</strong> İlk çalışma programınızı oluşturun!
          <button
            className="btn btn-sm btn-primary ms-2"
            onClick={() => navigate('/study-plan/create')}
          >
            Program Oluştur
          </button>
        </div>
      )}

      {/* AI Coach Card */}
      <div className="row mb-4">
        <div className="col-12">
          <AiCoachCard />
        </div>
      </div>

      {/* Hızlı Eylemler */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="modern-card fade-in">
            <div className="card-body">
              <h5 className="mb-4 d-flex align-items-center">
                <FiTarget className="me-2" />
                Hızlı Eylemler
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/note/create')}
                  >
                    <FiFileText className="me-2" />
                    Hızlı Not Ekle
                  </button>
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-warning w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/timer')}
                  >
                    <FiClock className="me-2" />
                    Zamanlayıcı Başlat
                  </button>
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-info w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      if (summary.dailyGoals.hasActivePlan) {
                        navigate('/study-plan');
                      } else {
                        navigate('/study-plan/create');
                      }
                    }}
                  >
                    <FiCalendar className="me-2" />
                    {summary.dailyGoals.hasActivePlan ? 'Bugünkü Programı Görüntüle' : 'Program Oluştur'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim Butonları */}
      <div className="row">
        <div className="col-md-12">
          <div className="modern-card fade-in">
            <div className="card-body">
              <h5 className="mb-4 d-flex align-items-center">
                <FiTarget className="me-2" />
                Hızlı Erişim
              </h5>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-primary" onClick={() => navigate('/tyt')}>
                  <FiBook className="me-1" />
                  TYT Konuları
                </button>
                <button className="btn btn-outline-primary" onClick={() => navigate('/ayt')}>
                  <FiBook className="me-1" />
                  AYT Konuları
                </button>
                <button className="btn btn-outline-success" onClick={() => navigate('/mock-exam')}>
                  <FiTrendingUp className="me-1" />
                  Deneme Sınavları
                </button>
                <button className="btn btn-outline-info" onClick={() => navigate('/study-plan')}>
                  <FiTarget className="me-1" />
                  Çalışma Programı
                </button>
                <button className="btn btn-outline-warning" onClick={() => navigate('/timer')}>
                  <FiClock className="me-1" />
                  Zamanlayıcılar
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/analytics')}>
                  <FiBarChart2 className="me-1" />
                  Analizler
                </button>
                <button className="btn btn-outline-dark" onClick={() => navigate('/notes')}>
                  <FiFileText className="me-1" />
                  Notlarım
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
