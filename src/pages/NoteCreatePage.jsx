import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- NOTE CREATE PAGE (NOT OLUŞTURMA/DÜZENLEME SAYFASI) ---
// Yeni not oluşturma veya mevcut notu düzenleme sayfası.

const NoteCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topicId: null,
    mockExamId: null,
    studyPlanId: null
  });

  const [topics, setTopics] = useState([]);
  const [mockExams, setMockExams] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null); // Mevcut dosya bilgisi (düzenleme modunda)
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchNote();
    }
    fetchOptions();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/Note/${id}`);
      const note = response.data;
      setFormData({
        title: note.title,
        content: note.content,
        topicId: note.topicId || null,
        mockExamId: note.mockExamId || null,
        studyPlanId: note.studyPlanId || null
      });
      
      // Mevcut dosya bilgisini kaydet
      if (note.filePath) {
        setCurrentFile({
          path: note.filePath,
          name: note.fileName || 'Dosya',
          type: note.fileType
        });
      }
    } catch (err) {
      console.error("Not çekilemedi", err);
      alert("Not yüklenirken bir hata oluştu.");
      navigate('/notes');
    }
  };

  const fetchOptions = async () => {
    try {
      // Konuları çek
      const topicsResponse = await api.get('/Topics?examType=1');
      const aytTopicsResponse = await api.get('/Topics?examType=2');
      setTopics([...topicsResponse.data, ...aytTopicsResponse.data]);

      // Deneme sınavlarını çek
      const examsResponse = await api.get('/MockExam');
      setMockExams(examsResponse.data);

      // Çalışma programlarını çek
      const plansResponse = await api.get('/StudyPlan');
      setStudyPlans(plansResponse.data);
    } catch (err) {
      console.error("Seçenekler yüklenemedi", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        topicId: formData.topicId || null,
        mockExamId: formData.mockExamId || null,
        studyPlanId: formData.studyPlanId || null
      };

      let noteId;
      if (isEditMode) {
        await api.put(`/Note/${id}`, payload);
        noteId = id;
        
        // Dosya yükleme (varsa - düzenleme modunda)
        if (selectedFile) {
          await handleFileUpload(noteId);
        }
        
        alert("Not başarıyla güncellendi.");
      } else {
        const response = await api.post('/Note', payload);
        noteId = response.data.id;
        
        // Dosya yükleme (varsa - yeni not oluşturulduktan sonra)
        if (selectedFile) {
          await handleFileUpload(noteId);
        }
        
        alert("Not başarıyla oluşturuldu.");
      }

      navigate('/notes');
    } catch (err) {
      console.error("Not kaydedilemedi", err);
      alert("Not kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (noteId) => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.post(`/Note/${noteId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Dosya başarıyla yüklendi.");
      setSelectedFile(null);
    } catch (err) {
      console.error("Dosya yüklenemedi", err);
      alert("Dosya yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async () => {
    if (!window.confirm("Dosyayı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/Note/${id}/file`);
      setCurrentFile(null);
      alert("Dosya başarıyla silindi.");
    } catch (err) {
      console.error("Dosya silinemedi", err);
      alert("Dosya silinirken bir hata oluştu.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya tipi kontrolü
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Sadece PDF ve görsel dosyaları yüklenebilir.");
        return;
      }

      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Dosya boyutu en fazla 10MB olabilir.");
        return;
      }

      setSelectedFile(file);
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">{isEditMode ? 'Notu Düzenle' : 'Yeni Not Oluştur'}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Başlık *</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">İçerik *</label>
            <textarea
              className="form-control"
              rows="10"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Konu (Opsiyonel)</label>
              <select
                className="form-select"
                value={formData.topicId || ''}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">Seçiniz</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.lesson} - {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Deneme Sınavı (Opsiyonel)</label>
              <select
                className="form-select"
                value={formData.mockExamId || ''}
                onChange={(e) => setFormData({ ...formData, mockExamId: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">Seçiniz</option>
                {mockExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Çalışma Programı (Opsiyonel)</label>
              <select
                className="form-select"
                value={formData.studyPlanId || ''}
                onChange={(e) => setFormData({ ...formData, studyPlanId: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">Seçiniz</option>
                {studyPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dosya Yükleme */}
          <div className="mb-3">
            <label className="form-label">Dosya Ekle (PDF veya Görsel)</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileChange}
              disabled={loading || uploading}
            />
            <small className="text-muted">Maksimum 10MB. PDF, JPG, PNG, GIF, WEBP formatları desteklenir.</small>
            
            {selectedFile && (
              <div className="mt-2 alert alert-info">
                Seçilen dosya: <strong>{selectedFile.name}</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-danger ms-2"
                  onClick={() => setSelectedFile(null)}
                >
                  ✕ İptal
                </button>
              </div>
            )}

            {currentFile && !selectedFile && (
              <div className="mt-2 alert alert-success">
                Mevcut dosya: <strong>{currentFile.name}</strong>
                <a
                  href={`http://localhost:5166${currentFile.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary ms-2"
                >
                  📄 Görüntüle
                </a>
                {isEditMode && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger ms-2"
                    onClick={handleFileDelete}
                  >
                    🗑️ Sil
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : isEditMode ? 'Güncelle' : 'Oluştur'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/notes')}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteCreatePage;

