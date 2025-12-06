import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFile, FiImage, FiDownload } from 'react-icons/fi';
import api from '../api/axiosConfig';

// --- NOTE VIEW PAGE (NOT GÖRÜNTÜLEME SAYFASI) ---
// Not detaylarını ve ekli dosyaları görüntüler.

const NoteViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/Note/${id}`);
      setNote(response.data);
    } catch (err) {
      console.error("Not çekilemedi", err);
      alert("Not yüklenirken bir hata oluştu.");
      navigate('/notes');
    } finally {
      setLoading(false);
    }
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

  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  const isPdf = (fileType) => {
    return fileType === 'application/pdf';
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

  if (!note) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Not bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4 fade-in">
      <div className="modern-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate('/notes')}
              >
                <FiArrowLeft className="me-1" />
                Geri
              </button>
              <h4 className="mb-0">{note.title}</h4>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/note/${note.id}`)}
            >
              ✏️ Düzenle
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Not İçeriği */}
          <div className="mb-4">
            <div className="whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {note.content}
            </div>
          </div>

          {/* İlişkili Bilgiler */}
          {(note.topicName || note.mockExamName || note.studyPlanName) && (
            <div className="mb-4">
              <h6>İlişkili Bilgiler:</h6>
              <div className="d-flex flex-wrap gap-2">
                {note.topicName && (
                  <span className="badge bg-info">📚 Konu: {note.topicName}</span>
                )}
                {note.mockExamName && (
                  <span className="badge bg-warning">📝 Deneme: {note.mockExamName}</span>
                )}
                {note.studyPlanName && (
                  <span className="badge bg-success">📅 Program: {note.studyPlanName}</span>
                )}
              </div>
            </div>
          )}

          {/* Dosya Görüntüleme */}
          {note.filePath && (
            <div className="mb-4">
              <h6>Ekli Dosya:</h6>
              <div className="border rounded p-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    {isPdf(note.fileType) ? (
                      <FiFile className="me-2" size={24} />
                    ) : isImage(note.fileType) ? (
                      <FiImage className="me-2" size={24} />
                    ) : (
                      <FiFile className="me-2" size={24} />
                    )}
                    <div>
                      <strong>{note.fileName || 'Dosya'}</strong>
                      <br />
                      <small className="text-muted">{note.fileType || 'Bilinmeyen tip'}</small>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:5166${note.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                    download
                  >
                    <FiDownload className="me-1" />
                    İndir
                  </a>
                </div>

                {/* Görsel Önizleme */}
                {isImage(note.fileType) && (
                  <div className="mt-3">
                    <img
                      src={`http://localhost:5166${note.filePath}`}
                      alt={note.fileName || 'Görsel'}
                      className="img-fluid rounded"
                      style={{ maxHeight: '500px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* PDF Önizleme */}
                {isPdf(note.fileType) && (
                  <div className="mt-3">
                    <iframe
                      src={`http://localhost:5166${note.filePath}`}
                      className="w-100 rounded"
                      style={{ height: '600px', border: '1px solid #dee2e6' }}
                      title={note.fileName || 'PDF'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tarih Bilgisi */}
          <div className="text-muted small">
            <div>Oluşturulma: {formatDate(note.createdDate)}</div>
            {note.updatedDate && (
              <div>Son Güncelleme: {formatDate(note.updatedDate)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteViewPage;

