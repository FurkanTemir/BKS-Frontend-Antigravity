import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

// --- NOTIFICATION BELL COMPONENT (BİLDİRİM KUTUSU) ---
// Sağ üstte bildirim ikonu ve dropdown menü.

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    fetchMessages();

    // Her 10 saniyede bir kontrol et (daha sık kontrol)
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchMessages();
    }, 10000);

    // Bildirim oluşturulduğunda yenile
    const handleNotificationCreated = () => {
      console.log('Bildirim oluşturuldu eventi alındı, yenileniyor...');
      fetchUnreadCount();
      fetchMessages();
    };
    window.addEventListener('notificationCreated', handleNotificationCreated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationCreated', handleNotificationCreated);
    };
  }, []);

  // Dışarı tıklanınca dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/Notification/messages/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Okunmamış bildirim sayısı çekilemedi", err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Notification/messages');
      console.log('Bildirim mesajları:', response.data);
      setMessages(response.data);
    } catch (err) {
      console.error("Bildirimler çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/Notification/messages/${messageId}/read`);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Bildirim okundu olarak işaretlenemedi", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/Notification/messages/read-all');
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Tüm bildirimler okundu olarak işaretlenemedi", err);
    }
  };

  const handleDeleteMessage = async (messageId, e) => {
    e.stopPropagation(); // Dropdown item'ın onClick'ini tetikleme
    try {
      await api.delete(`/Notification/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Bildirim mesajı silinemedi", err);
    }
  };

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchMessages(); // Dropdown açılınca mesajları yenile
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'DailyStudy': return '📚';
      case 'MockExam': return '📝';
      case 'StudyPlan': return '📅';
      case 'TopicProgress': return '✅';
      default: return '🔔';
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Bildirim İkonu */}
      <button
        className="btn btn-link text-white position-relative"
        onClick={handleToggleDropdown}
        style={{ textDecoration: 'none' }}
      >
        <span style={{ fontSize: '1.5rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.7rem', minWidth: '20px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menü */}
      {showDropdown && (
        <div
          className="dropdown-menu show position-absolute end-0"
          style={{
            minWidth: '350px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1050,
            marginTop: '10px'
          }}
        >
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <strong>Bildirimler</strong>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link p-0"
                onClick={handleMarkAllAsRead}
                style={{ fontSize: '0.8rem' }}
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="dropdown-divider"></div>

          {loading ? (
            <div className="text-center p-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-3 text-muted">
              Bildirim yok
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`dropdown-item ${!message.isRead ? 'bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => !message.isRead && handleMarkAsRead(message.id)}
                >
                  <div className="d-flex align-items-start">
                    <span className="me-2" style={{ fontSize: '1.2rem' }}>
                      {getNotificationIcon(message.notificationType)}
                    </span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong className={!message.isRead ? 'fw-bold' : ''}>
                            {message.title}
                          </strong>
                          {!message.isRead && (
                            <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>
                              Yeni
                            </span>
                          )}
                        </div>
                        <button
                          className="btn btn-sm btn-link text-danger p-0 ms-2"
                          onClick={(e) => handleDeleteMessage(message.id, e)}
                          title="Sil"
                          style={{ fontSize: '0.8rem' }}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="mb-1 small">{message.message}</p>
                      <small className="text-muted">{formatDate(message.createdDate)}</small>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

