import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- STUDY SESSION LIST PAGE (ÇALIŞMA OTURUMLARI LİSTESİ) ---
// Kullanıcının tüm çalışma oturumlarını (Pomodoro ve normal sayaç) listeler.

const StudySessionListPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = '/StudySession';
      const params = [];
      
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const response = await api.get(url);
      setSessions(response.data);
    } catch (err) {
      console.error("Oturumlar çekilemedi", err);
      alert("Oturumlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu oturumu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/StudySession/${id}`);
      alert("Oturum başarıyla silindi.");
      fetchSessions(); // Listeyi yenile
    } catch (err) {
      console.error("Oturum silinemedi", err);
      alert("Oturum silinirken bir hata oluştu.");
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}dk ${secs}sn`;
    } else if (minutes > 0) {
      return `${minutes}dk ${secs}sn`;
    }
    return `${secs}sn`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalDuration = () => {
    return sessions.reduce((total, session) => total + session.durationSeconds, 0);
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Çalışma Oturumları</h2>
        <button className="btn btn-primary" onClick={() => navigate('/timer')}>
          ➕ Yeni Oturum Başlat
        </button>
      </div>

      {/* Filtreler */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Başlangıç Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Bitiş Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary me-2" onClick={fetchSessions}>
                🔍 Filtrele
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  fetchSessions();
                }}
              >
                🔄 Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Özet */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4">
              <h5 className="text-muted">Toplam Oturum</h5>
              <h3>{sessions.length}</h3>
            </div>
            <div className="col-md-4">
              <h5 className="text-muted">Toplam Süre</h5>
              <h3>{formatDuration(getTotalDuration())}</h3>
            </div>
            <div className="col-md-4">
              <h5 className="text-muted">Pomodoro / Normal</h5>
              <h3>
                {sessions.filter(s => s.sessionType === 'Pomodoro').length} / {' '}
                {sessions.filter(s => s.sessionType === 'Normal').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Oturum Listesi */}
      {sessions.length === 0 ? (
        <div className="alert alert-info">
          Henüz çalışma oturumu kaydı yok. Yeni bir oturum başlatmak için "Yeni Oturum Başlat" butonuna tıklayın.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Tip</th>
                    <th>Süre</th>
                    <th>Konu</th>
                    <th>Notlar</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{formatDate(session.startTime)}</td>
                      <td>
                        <span className={`badge ${session.sessionType === 'Pomodoro' ? 'bg-danger' : 'bg-primary'}`}>
                          {session.sessionType === 'Pomodoro' ? '🍅 Pomodoro' : '⏱️ Normal'}
                        </span>
                      </td>
                      <td>{formatDuration(session.durationSeconds)}</td>
                      <td>{session.topicName || '-'}</td>
                      <td>
                        {session.notes ? (
                          <span title={session.notes} style={{ cursor: 'help' }}>
                            📝 {session.notes.length > 30 ? session.notes.substring(0, 30) + '...' : session.notes}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(session.id)}
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySessionListPage;

