import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// --- ADMIN TOPICS PAGE (ADMİN KONU YÖNETİMİ SAYFASI) ---
// Admin kullanıcıların konuları ekleyebileceği, güncelleyebileceği ve silebileceği sayfa.

const AdminTopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lesson: '',
    examType: 1, // 1: TYT, 2: AYT
    fieldType: 0, // 0: None, 1: Sayısal, 2: Eşit Ağırlık, 3: Sözel
    categoryId: null
  });
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  // Tüm konuları getir (TYT ve AYT birlikte)
  const fetchTopics = async () => {
    try {
      // Admin için özel endpoint kullanıyoruz
      const response = await api.get('/Topics/admin');
      setTopics(response.data);
      setErrorMsg(''); // Başarılı olursa hata mesajını temizle
    } catch (err) {
      console.error("Konular çekilemedi", err);
      const errorDetails = err.response?.status 
        ? `HTTP ${err.response.status}: ${err.response.statusText}` 
        : err.message;
      setErrorMsg(`Konular yüklenemedi. ${errorDetails}`);
      console.error("Tam hata detayı:", err.response?.data || err);
    }
  };

  // Modal'ı aç ve formu temizle
  const handleAddNew = () => {
    setEditingTopic(null);
    setFormData({
      name: '',
      lesson: '',
      examType: 1,
      fieldType: 0,
      categoryId: null
    });
    setShowModal(true);
    setInfoMsg('');
    setErrorMsg('');
  };

  // Düzenleme için modal'ı aç
  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      lesson: topic.lesson,
      examType: topic.examType === 'TYT' ? 1 : 2,
      fieldType: topic.fieldType === 'None' ? 0 : 
                 topic.fieldType === 'Sayisal' ? 1 :
                 topic.fieldType === 'EsitAgirlik' ? 2 : 3,
      categoryId: topic.categoryId || null
    });
    setShowModal(true);
    setInfoMsg('');
    setErrorMsg('');
  };

  // Konu kaydet (Yeni veya Güncelleme)
  const handleSave = async (e) => {
    e.preventDefault();
    setInfoMsg('');
    setErrorMsg('');

    try {
      // FormData'yı temizle: categoryId null ise gönderme
      const dataToSend = { ...formData };
      if (dataToSend.categoryId === null || dataToSend.categoryId === undefined) {
        delete dataToSend.categoryId;
      }

      if (editingTopic) {
        // Güncelleme
        await api.put('/Topics/admin', {
          id: editingTopic.id,
          ...dataToSend
        });
        setInfoMsg('Konu başarıyla güncellendi.');
      } else {
        // Yeni ekleme
        await api.post('/Topics/admin', dataToSend);
        setInfoMsg('Konu başarıyla eklendi.');
      }
      
      setShowModal(false);
      fetchTopics(); // Listeyi yenile
    } catch (err) {
      console.error("Hata", err.response?.data || err);
      
      // FluentValidation hatalarını göster (ModelState formatı)
      if (err.response?.data?.errors) {
        const validationErrors = Object.entries(err.response.data.errors)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          })
          .join(' | ');
        setErrorMsg(`Doğrulama hatası: ${validationErrors}`);
      } else if (err.response?.data?.Message) {
        setErrorMsg(err.response.data.Message);
      } else if (err.response?.data?.Detailed) {
        setErrorMsg(err.response.data.Detailed);
      } else if (err.message) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('İşlem başarısız. Lütfen tekrar deneyin.');
      }
    }
  };

  // Konu sil
  const handleDelete = async (id) => {
    if (!window.confirm('Bu konuyu silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/Topics/admin/${id}`);
      setInfoMsg('Konu başarıyla silindi.');
      fetchTopics(); // Listeyi yenile
    } catch (err) {
      console.error("Hata", err.response?.data || err);
      setErrorMsg(err.response?.data?.Message || 'Silme işlemi başarısız.');
    }
  };

  // ExamType değiştiğinde FieldType'ı ayarla
  const handleExamTypeChange = (e) => {
    const examType = parseInt(e.target.value);
    setFormData({
      ...formData,
      examType: examType,
      fieldType: examType === 1 ? 0 : 1 // TYT ise None (0), AYT ise Sayısal (1) yap
    });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Konu Yönetimi (Admin)</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>
          + Yeni Konu Ekle
        </button>
      </div>

      {/* Bilgi ve Hata Mesajları */}
      {infoMsg && <div className="alert alert-success">{infoMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {/* Konu Listesi */}
      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Konu Adı</th>
                  <th>Ders</th>
                  <th>Sınav Tipi</th>
                  <th>Alan</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(topic => (
                  <tr key={topic.id}>
                    <td>{topic.id}</td>
                    <td>{topic.name}</td>
                    <td>{topic.lesson}</td>
                    <td>
                      <span className={`badge ${topic.examType === 'TYT' ? 'bg-info' : 'bg-warning'}`}>
                        {topic.examType}
                      </span>
                    </td>
                    <td>
                      {topic.fieldType !== 'None' && (
                        <span className="badge bg-secondary">{topic.fieldType}</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2" 
                        onClick={() => handleEdit(topic)}
                      >
                        Düzenle
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(topic.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Konu Ekleme/Düzenleme */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTopic ? 'Konu Düzenle' : 'Yeni Konu Ekle'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {/* Modal içinde hata mesajı göster */}
                  {errorMsg && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      {errorMsg}
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setErrorMsg('')}
                      ></button>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Konu Adı *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ders Adı *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.lesson}
                      onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sınav Tipi *</label>
                    <select
                      className="form-select"
                      value={formData.examType}
                      onChange={handleExamTypeChange}
                      required
                    >
                      <option value={1}>TYT (Temel Yeterlilik)</option>
                      <option value={2}>AYT (Alan Yeterlilik)</option>
                    </select>
                  </div>
                  {formData.examType === 2 && (
                    <div className="mb-3">
                      <label className="form-label">Alan Tipi *</label>
                      <select
                        className="form-select"
                        value={formData.fieldType}
                        onChange={(e) => setFormData({ ...formData, fieldType: parseInt(e.target.value) })}
                        required
                      >
                        <option value={1}>Sayısal</option>
                        <option value={2}>Eşit Ağırlık</option>
                        <option value={3}>Sözel</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTopic ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopicsPage;

