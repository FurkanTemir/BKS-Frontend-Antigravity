import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';

// --- STUDY SESSION TIMER COMPONENT (NORMAL ÇALIŞMA SAYACI) ---
// Normal çalışma sayacı. Başlat, duraklat, bitir işlemleri yapılabilir.

const StudySessionTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [topicId, setTopicId] = useState('');
  const [notes, setNotes] = useState('');
  const [topics, setTopics] = useState([]);
  
  // Constants
  const STORAGE_KEY = 'studySessionTimer';

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

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
        const elapsed = Math.floor((now - startTime) / 1000) - state.pausedTime;

        if (state.isRunning && !state.isPaused) {
          // Timer hala çalışıyor, state'i geri yükle
          setSessionId(state.sessionId);
          setStartTime(new Date(state.startTime));
          startTimeRef.current = new Date(state.startTime);
          setElapsedSeconds(elapsed);
          pausedTimeRef.current = state.pausedTime;
          setTopicId(state.topicId || '');
          setNotes(state.notes || '');
          setIsRunning(true);
          setIsPaused(false);
        } else if (state.isRunning && state.isPaused) {
          // Timer duraklatılmış, state'i geri yükle
          setSessionId(state.sessionId);
          setStartTime(new Date(state.startTime));
          startTimeRef.current = new Date(state.startTime);
          setElapsedSeconds(state.elapsedSeconds);
          pausedTimeRef.current = state.pausedTime;
          setTopicId(state.topicId || '');
          setNotes(state.notes || '');
          setIsRunning(true);
          setIsPaused(true);
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
        elapsedSeconds,
        sessionId,
        startTime: startTimeRef.current.toISOString(),
        pausedTime: pausedTimeRef.current,
        topicId,
        notes
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isRunning, isPaused, elapsedSeconds, sessionId, topicId, notes]);

  // Timer state değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    saveTimerState();
  }, [saveTimerState]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
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
    try {
      const response = await api.post('/StudySession/start', {
        sessionType: 2, // Normal sayaç
        topicId: topicId ? parseInt(topicId) : null,
        notes: notes || null
      });
      
      setSessionId(response.data.sessionId);
      setStartTime(new Date());
      startTimeRef.current = new Date();
      setElapsedSeconds(pausedTimeRef.current);
      setIsRunning(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Oturum başlatılamadı", err);
      alert("Oturum başlatılırken bir hata oluştu.");
    }
  };

  const handlePause = () => {
    pausedTimeRef.current = elapsedSeconds;
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = async () => {
    // Kullanıcı "Durdur ve Kaydet" dedi, kaydet
    if (sessionId) {
      try {
        await api.put('/StudySession/end', {
          id: sessionId,
          durationSeconds: elapsedSeconds
        });
        alert("Çalışma oturumu kaydedildi!");
      } catch (err) {
        console.error("Oturum bitirilemedi", err);
        alert("Oturum kaydedilirken bir hata oluştu.");
      }
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    pausedTimeRef.current = 0;
    setSessionId(null);
    setStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStopWithoutSave = () => {
    // Kullanıcı "Durdur (Kaydetmeden)" dedi, kaydetmeden durdur
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    pausedTimeRef.current = 0;
    setSessionId(null);
    setStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>⏱️ Normal Çalışma Sayacı</h5>
      </div>
      <div className="card-body text-center">
        {/* Zamanlayıcı */}
        <div className="mb-4">
          <h1 className="display-4">{formatTime(elapsedSeconds)}</h1>
        </div>

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
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          {!isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              ▶️ Başlat
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button className="btn btn-warning" onClick={handlePause}>
                  ⏸️ Duraklat
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleResume}>
                  ▶️ Devam Et
                </button>
              )}
              <button className="btn btn-success" onClick={handleStop}>
                💾 Kaydet ve Durdur
              </button>
              <button className="btn btn-danger" onClick={handleStopWithoutSave}>
                ⏹️ Durdur (Kaydetmeden)
              </button>
            </>
          )}
        </div>

        {/* Background çalışma bilgisi */}
        {isRunning && (
          <div className="mt-3 alert alert-info small">
            <strong>ℹ️ Bilgi:</strong> Timer başka sayfaya geçseniz bile çalışmaya devam eder. 
            "Kaydet ve Durdur" butonuna tıklayarak kaydedebilirsiniz.
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

export default StudySessionTimer;

