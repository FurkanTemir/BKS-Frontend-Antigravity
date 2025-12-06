import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';

// --- POMODORO TIMER COMPONENT (POMODORO ZAMANLAYICI) ---
// 25 dakikalık Pomodoro zamanlayıcı. Başlat, duraklat, bitir işlemleri yapılabilir.

const PomodoroTimer = () => {
  // Constants
  const STORAGE_KEY = 'pomodoroTimer';
  const DEFAULT_DURATION_MINUTES = 25;
  const DEFAULT_DURATION_SECONDS = DEFAULT_DURATION_MINUTES * 60;

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES); // Kullanıcının seçtiği süre (dakika)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION_SECONDS); // Başlangıç: 25 dakika = 1500 saniye
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [topicId, setTopicId] = useState('');
  const [notes, setNotes] = useState('');
  const [topics, setTopics] = useState([]);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Sayfa yüklendiğinde localStorage'dan timer state'ini geri yükle
  useEffect(() => {
    fetchTopics();
    restoreTimerState();
  }, []);

  // Timer state'ini localStorage'dan geri yükle
  const restoreTimerState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        const now = new Date().getTime();
        const startTime = new Date(state.startTime).getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = state.timeLeft - elapsed;

        if (remaining > 0 && state.isRunning && !state.isPaused) {
          // Timer hala çalışıyor, state'i geri yükle
          setSessionId(state.sessionId);
          setStartTime(new Date(state.startTime));
          startTimeRef.current = new Date(state.startTime);
          setTimeLeft(remaining);
          setDurationMinutes(state.durationMinutes);
          setTopicId(state.topicId || '');
          setNotes(state.notes || '');
          setIsRunning(true);
          setIsPaused(false);
        } else if (remaining <= 0 && state.isRunning) {
          // Süre bitmiş, otomatik kaydet
          handleCompleteFromStorage(state.sessionId, state.startTime);
          localStorage.removeItem(STORAGE_KEY);
        } else {
          // Timer durmuş, localStorage'ı temizle
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error("Timer state geri yüklenemedi", err);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Timer state'ini localStorage'a kaydet
  const saveTimerState = useCallback(() => {
    if (isRunning && sessionId && startTimeRef.current) {
      const state = {
        isRunning,
        isPaused,
        timeLeft,
        sessionId,
        startTime: startTimeRef.current.toISOString(),
        durationMinutes,
        topicId,
        notes
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isRunning, isPaused, timeLeft, sessionId, durationMinutes, topicId, notes]);

  // Timer state değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    saveTimerState();
  }, [saveTimerState]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const fetchTopics = async () => {
    try {
      const response = await api.get('/Topics?examType=1');
      setTopics(response.data);
    } catch (err) {
      console.error("Konular çekilemedi", err);
    }
  };

  const handleStart = async () => {
    // Süre ayarını kontrol et
    if (durationMinutes <= 0 || durationMinutes > 120) {
      alert("Süre 1-120 dakika arasında olmalıdır.");
      return;
    }

    try {
      const response = await api.post('/StudySession/start', {
        sessionType: 1, // Pomodoro
        topicId: topicId ? parseInt(topicId) : null,
        notes: notes || null
      });
      
      // Seçilen süreye göre zamanlayıcıyı ayarla
      const totalSeconds = durationMinutes * 60;
      setTimeLeft(totalSeconds);
      
      setSessionId(response.data.sessionId);
      setStartTime(new Date());
      startTimeRef.current = new Date();
      setIsRunning(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Oturum başlatılamadı", err);
      alert("Oturum başlatılırken bir hata oluştu.");
    }
  };

  const handlePause = () => {
    // Durdur butonuna basıldığında timer'ı durdur (kaydetmeden)
    setIsPaused(true);
  };

  const handleResume = () => {
    // Devam Et butonuna basıldığında timer'ı devam ettir
    setIsPaused(false);
  };

  const handleSave = async () => {
    // Kaydet butonuna basıldığında kaydet ve timer'ı sıfırla
    if (sessionId && startTimeRef.current) {
      const duration = Math.floor((new Date() - startTimeRef.current) / 1000);
      try {
        await api.put('/StudySession/end', {
          id: sessionId,
          durationSeconds: duration
        });
        alert("Pomodoro oturumu kaydedildi! 🎉");
      } catch (err) {
        console.error("Oturum bitirilemedi", err);
        alert("Oturum kaydedilirken bir hata oluştu.");
      }
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(durationMinutes * 60); // Seçilen süreye göre sıfırla
    setSessionId(null);
    setStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStop = () => {
    // Kullanıcı "Durdur (Kaydetmeden)" dedi, kaydetmeden durdur
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(durationMinutes * 60); // Seçilen süreye göre sıfırla
    setSessionId(null);
    setStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleComplete = async () => {
    // Süre bitince otomatik kaydet
    if (sessionId && startTimeRef.current) {
      const duration = Math.floor((new Date() - startTimeRef.current) / 1000);
      try {
        await api.put('/StudySession/end', {
          id: sessionId,
          durationSeconds: duration
        });
        alert("Pomodoro tamamlandı! 🎉");
      } catch (err) {
        console.error("Oturum bitirilemedi", err);
      }
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(durationMinutes * 60); // Seçilen süreye göre sıfırla
    setSessionId(null);
    setStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // localStorage'dan geri yüklendiğinde süre bitmişse otomatik kaydet
  const handleCompleteFromStorage = async (savedSessionId, savedStartTime) => {
    const startTime = new Date(savedStartTime);
    const duration = Math.floor((new Date() - startTime) / 1000);
    try {
      await api.put('/StudySession/end', {
        id: savedSessionId,
        durationSeconds: duration
      });
      alert("Pomodoro tamamlandı! 🎉 (Otomatik kaydedildi)");
    } catch (err) {
      console.error("Oturum bitirilemedi", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = durationMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="card">
      <div className="card-header">
        <h5>🍅 Pomodoro Zamanlayıcı</h5>
      </div>
      <div className="card-body text-center">
        {/* Zamanlayıcı */}
        <div className="mb-4">
          <div className="position-relative d-inline-block">
            <div 
              className="rounded-circle border border-5 border-primary d-flex align-items-center justify-content-center"
              style={{ 
                width: '200px', 
                height: '200px',
                background: `conic-gradient(#0d6efd ${progress}%, #e9ecef ${progress}%)`
              }}
            >
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '180px', height: '180px' }}>
                <h2 className="mb-0">{formatTime(timeLeft)}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Süre Ayarı (Başlamadan önce) */}
        {!isRunning && (
          <div className="mb-3">
            <label className="form-label">Pomodoro Süresi (dakika)</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="120"
              value={durationMinutes}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 25;
                if (value >= 1 && value <= 120) {
                  setDurationMinutes(value);
                  setTimeLeft(value * 60); // Zamanlayıcıyı da güncelle
                }
              }}
              disabled={isRunning}
            />
            <small className="text-muted">1-120 dakika arası seçebilirsiniz</small>
          </div>
        )}

        {/* Konu Seçimi (Başlamadan önce) */}
        {!isRunning && (
          <div className="mb-3">
            <label className="form-label">Konu (Opsiyonel)</label>
            <select
              className="form-select"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
            >
              <option value="">Konu seçin...</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.lesson} - {topic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notlar (Başlamadan önce) */}
        {!isRunning && (
          <div className="mb-3">
            <label className="form-label">Notlar (Opsiyonel)</label>
            <textarea
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="Bu oturum hakkında notlar..."
            />
          </div>
        )}

        {/* Butonlar */}
        <div className="d-flex justify-content-center gap-2">
          {!isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              ▶️ Başlat
            </button>
          ) : (
            <>
              {!isPaused ? (
                // Timer çalışıyor: Sadece "Durdur" butonu
                <button className="btn btn-warning btn-lg" onClick={handlePause}>
                  ⏸️ Durdur
                </button>
              ) : (
                // Timer durdurulmuş: "Devam Et" ve "Kaydet" butonları
                <>
                  <button className="btn btn-success btn-lg" onClick={handleResume}>
                    ▶️ Devam Et
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={handleSave}>
                    💾 Kaydet
                  </button>
                </>
              )}
              {/* İptal butonu (her zaman görünür) */}
              <button className="btn btn-danger" onClick={handleStop}>
                ❌ İptal
              </button>
            </>
          )}
        </div>

        {/* Background çalışma bilgisi */}
        {isRunning && (
          <div className="mt-3 alert alert-info small">
            <strong>ℹ️ Bilgi:</strong> Timer başka sayfaya geçseniz bile çalışmaya devam eder. 
            Süre bitince otomatik kaydedilir.
          </div>
        )}

        {/* Bilgi */}
        {isRunning && startTime && (
          <div className="mt-3 text-muted small">
            Başlangıç: {new Date(startTime).toLocaleTimeString('tr-TR')}
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;

