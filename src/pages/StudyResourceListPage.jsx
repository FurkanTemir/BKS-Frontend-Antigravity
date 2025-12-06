import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- STUDY RESOURCE LIST PAGE (ÇALIŞMA KAYNAKLARI LİSTESİ) ---
// Kullanıcının tüm çalışma kaynaklarını listeler.

const StudyResourceListPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');

  useEffect(() => {
    fetchResources();
    fetchTopics();
  }, [selectedTopicId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let url = '/StudyResource';
      if (selectedTopicId) {
        url += `?topicId=${selectedTopicId}`;
      }
      const response = await api.get(url);
      setResources(response.data);
    } catch (err) {
      console.error("Kaynaklar çekilemedi", err);
      alert("Kaynaklar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await api.get('/Topics');
      setTopics(response.data);
    } catch (err) {
      console.error("Konular çekilemedi", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kaynağı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/StudyResource/${id}`);
      alert("Kaynak başarıyla silindi.");
      fetchResources();
    } catch (err) {
      console.error("Kaynak silinemedi", err);
      alert("Kaynak silinirken bir hata oluştu.");
    }
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'Book': return '📚';
      case 'Video': return '🎥';
      case 'QuestionBank': return '📝';
      case 'Website': return '🌐';
      default: return '📄';
    }
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
        <h2>Çalışma Kaynakları</h2>
        <button className="btn btn-primary" onClick={() => navigate('/study-resource/create')}>
          ➕ Yeni Kaynak Ekle
        </button>
      </div>

      {/* Filtre */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Konuya Göre Filtrele</label>
              <select
                className="form-select"
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
              >
                <option value="">Tüm Konular</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.lesson} - {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kaynak Listesi */}
      {resources.length === 0 ? (
        <div className="alert alert-info">
          Henüz kaynak eklenmemiş. Yeni bir kaynak eklemek için "Yeni Kaynak Ekle" butonuna tıklayın.
        </div>
      ) : (
        <div className="row">
          {resources.map((resource) => (
            <div key={resource.id} className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">
                      {getResourceTypeIcon(resource.resourceType)} {resource.name}
                    </h5>
                    <span className="badge bg-secondary">{resource.resourceType}</span>
                  </div>
                  
                  {resource.topicName && (
                    <p className="text-muted small mb-2">
                      <strong>Konu:</strong> {resource.topicName}
                    </p>
                  )}
                  
                  {resource.linkOrInfo && (
                    <p className="small mb-2">
                      <strong>Link/Bilgi:</strong>{' '}
                      {resource.resourceType === 'Video' || resource.resourceType === 'Website' ? (
                        <a href={resource.linkOrInfo} target="_blank" rel="noopener noreferrer">
                          {resource.linkOrInfo}
                        </a>
                      ) : (
                        resource.linkOrInfo
                      )}
                    </p>
                  )}
                  
                  <div className="mb-2">
                    <strong>Çözülen Soru:</strong> {resource.solvedQuestionCount}
                    {resource.totalQuestionCount && (
                      <> / {resource.totalQuestionCount}</>
                    )}
                    {resource.progressPercentage !== null && (
                      <div className="progress mt-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${resource.progressPercentage}%` }}
                        >
                          {Math.round(resource.progressPercentage)}%
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {resource.notes && (
                    <p className="small text-muted mb-2">
                      <strong>Notlar:</strong> {resource.notes}
                    </p>
                  )}
                  
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/study-resource/${resource.id}`)}
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(resource.id)}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyResourceListPage;

