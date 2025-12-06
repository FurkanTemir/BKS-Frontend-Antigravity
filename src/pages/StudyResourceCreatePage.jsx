import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- STUDY RESOURCE CREATE/EDIT PAGE (ÇALIŞMA KAYNAĞI OLUŞTURMA/DÜZENLEME) ---
// Yeni kaynak oluşturma veya mevcut kaynağı düzenleme sayfası.

const StudyResourceCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    resourceType: 1, // 1: Book
    linkOrInfo: '',
    topicId: '',
    solvedQuestionCount: 0,
    totalQuestionCount: '',
    notes: ''
  });

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
    if (isEditMode) {
      fetchResourceForEdit();
    }
  }, [id]);

  const fetchTopics = async () => {
    try {
      const response = await api.get('/Topics');
      setTopics(response.data);
    } catch (err) {
      console.error("Konular çekilemedi", err);
    }
  };

  const fetchResourceForEdit = async () => {
    try {
      const response = await api.get(`/StudyResource/${id}`);
      const resource = response.data;
      setFormData({
        name: resource.name,
        resourceType: resource.resourceType === 'Book' ? 1 : 
                     resource.resourceType === 'Video' ? 2 :
                     resource.resourceType === 'QuestionBank' ? 3 :
                     resource.resourceType === 'Website' ? 4 : 5,
        linkOrInfo: resource.linkOrInfo || '',
        topicId: resource.topicId ? resource.topicId.toString() : '',
        solvedQuestionCount: resource.solvedQuestionCount,
        totalQuestionCount: resource.totalQuestionCount ? resource.totalQuestionCount.toString() : '',
        notes: resource.notes || ''
      });
    } catch (err) {
      console.error("Kaynak çekilemedi", err);
      alert("Kaynak yüklenirken bir hata oluştu.");
      navigate('/study-resource');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        topicId: formData.topicId ? parseInt(formData.topicId) : null,
        totalQuestionCount: formData.totalQuestionCount ? parseInt(formData.totalQuestionCount) : null
      };

      if (isEditMode) {
        payload.id = parseInt(id);
        await api.put('/StudyResource', payload);
        alert("Kaynak başarıyla güncellendi.");
      } else {
        await api.post('/StudyResource', payload);
        alert("Kaynak başarıyla oluşturuldu.");
      }
      
      navigate('/study-resource');
    } catch (err) {
      console.error("Kaynak kaydedilemedi", err);
      alert("Kaynak kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{isEditMode ? 'Kaynak Düzenle' : 'Yeni Kaynak Ekle'}</h2>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Kaynak Adı *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Örn: Matematik Soru Bankası, Türev Konu Anlatımı"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Kaynak Tipi *</label>
              <select
                className="form-select"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: parseInt(e.target.value) })}
                required
              >
                <option value={1}>📚 Kitap</option>
                <option value={2}>🎥 Video</option>
                <option value={3}>📝 Soru Bankası</option>
                <option value={4}>🌐 Web Sitesi</option>
                <option value={5}>📄 Diğer</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">
                {formData.resourceType === 2 || formData.resourceType === 4 ? 'Link' : 'Bilgi'}
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.linkOrInfo}
                onChange={(e) => setFormData({ ...formData, linkOrInfo: e.target.value })}
                placeholder={
                  formData.resourceType === 2 || formData.resourceType === 4
                    ? "https://..."
                    : "Kitap yazarı, yayınevi vb."
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Konu (Opsiyonel)</label>
              <select
                className="form-select"
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              >
                <option value="">Konu seçin...</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.lesson} - {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Çözülen Soru Sayısı</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={formData.solvedQuestionCount}
                  onChange={(e) => setFormData({ ...formData, solvedQuestionCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Toplam Soru Sayısı (Opsiyonel)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={formData.totalQuestionCount}
                  onChange={(e) => setFormData({ ...formData, totalQuestionCount: e.target.value })}
                  placeholder="Biliniyorsa girin"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Notlar (Opsiyonel)</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Bu kaynak hakkında notlar..."
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Oluştur')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/study-resource')}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudyResourceCreatePage;

