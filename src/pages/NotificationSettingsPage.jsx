import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// --- NOTIFICATION SETTINGS PAGE (HATIRLATMA AYARLARI SAYFASI) ---
// Kullanıcının hatırlatmalarını yönetmesi için sayfa.

const NotificationSettingsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    notificationType: 1,
    title: '',
    message: '',
    notificationTime: '09:00',
    activeDays: 31, // Hafta içi (1+2+4+8+16)
    isActive: true
  });

  useEffect(() => {
    fetchNotifications();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Notification');
      setNotifications(response.data);
    } catch (err) {
      console.error("Hatırlatmalar çekilemedi", err);
      alert("Hatırlatmalar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Notification', formData);
      alert("Hatırlatma başarıyla oluşturuldu.");
      setShowCreateForm(false);
      resetForm();
      fetchNotifications();
    } catch (err) {
      console.error("Hatırlatma oluşturulamadı", err);
      alert("Hatırlatma oluşturulurken bir hata oluştu.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/Notification', { ...formData, id: editingId });
      alert("Hatırlatma başarıyla güncellendi.");
      setEditingId(null);
      resetForm();
      fetchNotifications();
    } catch (err) {
      console.error("Hatırlatma güncellenemedi", err);
      alert("Hatırlatma güncellenirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu hatırlatmayı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/Notification/${id}`);
      alert("Hatırlatma başarıyla silindi.");
      fetchNotifications();
    } catch (err) {
      console.error("Hatırlatma silinemedi", err);
      alert("Hatırlatma silinirken bir hata oluştu.");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/Notification/${id}/toggle`);
      fetchNotifications();
    } catch (err) {
      console.error("Hatırlatma durumu değiştirilemedi", err);
    }
  };

  const handleEdit = (notification) => {
    setEditingId(notification.id);
    setFormData({
      notificationType: notification.notificationType === 'DailyStudy' ? 1 :
                       notification.notificationType === 'MockExam' ? 2 :
                       notification.notificationType === 'StudyPlan' ? 3 : 4,
      title: notification.title,
      message: notification.message,
      notificationTime: notification.notificationTime,
      activeDays: notification.activeDays,
      isActive: notification.isActive
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      notificationType: 1,
      title: '',
      message: '',
      notificationTime: '09:00',
      activeDays: 31,
      isActive: true
    });
    setEditingId(null);
  };

  const getNotificationTypeName = (type) => {
    switch (type) {
      case 'DailyStudy': return 'Günlük Çalışma';
      case 'MockExam': return 'Deneme Hatırlatması';
      case 'StudyPlan': return 'Program Hatırlatması';
      case 'TopicProgress': return 'Konu İlerleme';
      default: return type;
    }
  };

  const getDayNames = (activeDays) => {
    const days = [];
    if (activeDays & 1) days.push('Pzt');
    if (activeDays & 2) days.push('Sal');
    if (activeDays & 4) days.push('Çar');
    if (activeDays & 8) days.push('Per');
    if (activeDays & 16) days.push('Cum');
    if (activeDays & 32) days.push('Cmt');
    if (activeDays & 64) days.push('Paz');
    return days.join(', ');
  };

  const toggleDay = (dayFlag) => {
    setFormData({
      ...formData,
      activeDays: formData.activeDays ^ dayFlag
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hatırlatma Ayarları</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          ➕ Yeni Hatırlatma Ekle
        </button>
      </div>

      {/* Bilgi */}
      <div className="alert alert-info">
        <strong>Not:</strong> Hatırlatmaların çalışması için tarayıcı bildirim izni vermeniz gerekmektedir.
        {Notification.permission === 'denied' && (
          <span className="text-danger ms-2">Bildirim izni reddedilmiş. Lütfen tarayıcı ayarlarından izin verin.</span>
        )}
      </div>

      {/* Oluşturma/Düzenleme Formu */}
      {showCreateForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingId ? 'Hatırlatma Düzenle' : 'Yeni Hatırlatma Ekle'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="mb-3">
                <label className="form-label">Hatırlatma Tipi *</label>
                <select
                  className="form-select"
                  value={formData.notificationType}
                  onChange={(e) => setFormData({ ...formData, notificationType: parseInt(e.target.value) })}
                  required
                  disabled={!!editingId}
                >
                  <option value={1}>Günlük Çalışma Hatırlatması</option>
                  <option value={2}>Deneme Hatırlatması</option>
                  <option value={3}>Program Hatırlatması</option>
                  <option value={4}>Konu İlerleme Hatırlatması</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Başlık *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Örn: Çalışma Zamanı!"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mesaj *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Örn: Bugün çalışma zamanı geldi!"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Hatırlatma Zamanı *</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.notificationTime}
                  onChange={(e) => setFormData({ ...formData, notificationTime: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Aktif Günler *</label>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { flag: 1, name: 'Pazartesi' },
                    { flag: 2, name: 'Salı' },
                    { flag: 4, name: 'Çarşamba' },
                    { flag: 8, name: 'Perşembe' },
                    { flag: 16, name: 'Cuma' },
                    { flag: 32, name: 'Cumartesi' },
                    { flag: 64, name: 'Pazar' }
                  ].map(day => (
                    <button
                      key={day.flag}
                      type="button"
                      className={`btn btn-sm ${formData.activeDays & day.flag ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => toggleDay(day.flag)}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label className="form-check-label">Aktif</label>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hatırlatma Listesi */}
      {notifications.length === 0 ? (
        <div className="alert alert-info">
          Henüz hatırlatma eklenmemiş. Yeni bir hatırlatma eklemek için "Yeni Hatırlatma Ekle" butonuna tıklayın.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Başlık</th>
                    <th>Mesaj</th>
                    <th>Zaman</th>
                    <th>Günler</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>{getNotificationTypeName(notification.notificationType)}</td>
                      <td>{notification.title}</td>
                      <td>{notification.message}</td>
                      <td>{notification.notificationTime}</td>
                      <td>{getDayNames(notification.activeDays)}</td>
                      <td>
                        <span className={`badge ${notification.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {notification.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(notification)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleToggle(notification.id)}
                          >
                            {notification.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(notification.id)}
                          >
                            🗑️
                          </button>
                        </div>
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

export default NotificationSettingsPage;

