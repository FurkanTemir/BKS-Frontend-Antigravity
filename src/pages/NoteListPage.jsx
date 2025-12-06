import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../components/Toast';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonCard } from '../components/SkeletonLoader';

// --- NOTE LIST PAGE (NOT LİSTESİ SAYFASI) ---
// Kullanıcının tüm notlarını gösterir ve yönetir.

const NoteListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'topic', 'mockExam', 'studyPlan'
  
  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchNotes();
  }, []);

  // Arama ve filtreleme
  useEffect(() => {
    let filtered = notes;

    // Arama sorgusu (debounced)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }

    // Filtreleme (konu, deneme, program)
    if (filterBy !== 'all') {
      filtered = filtered.filter(note => {
        if (filterBy === 'topic' && note.topicName) return true;
        if (filterBy === 'mockExam' && note.mockExamName) return true;
        if (filterBy === 'studyPlan' && note.studyPlanName) return true;
        return false;
      });
    }

    setFilteredNotes(filtered);
  }, [notes, debouncedSearchQuery, filterBy]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Note');
      setNotes(response.data);
    } catch (err) {
      console.error("Notlar çekilemedi", err);
      showToast("Notlar yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/Note/${noteId}`);
      fetchNotes();
      showToast("Not başarıyla silindi.", "success");
    } catch (err) {
      console.error("Not silinemedi", err);
      showToast("Not silinirken bir hata oluştu.", "error");
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

  if (loading) {
    return (
      <div className="card shadow">
        <div className="card-body">
          <div className="row">
            {[1, 2, 3].map(i => (
              <div key={i} className="col-md-6 col-lg-4 mb-3">
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Notlarım</h5>
        <button
          className="btn btn-light btn-sm"
          onClick={() => navigate('/note/create')}
        >
          + Yeni Not
        </button>
      </div>
      <div className="card-body">
        {/* Arama ve Filtreleme */}
        {notes.length > 0 && (
          <div className="mb-4">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Başlık veya içerikte ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">Tümü</option>
                  <option value="topic">Konu Notları</option>
                  <option value="mockExam">Deneme Sınavı Notları</option>
                  <option value="studyPlan">Program Notları</option>
                </select>
              </div>
            </div>
            {searchQuery && (
              <div className="mt-2">
                <small className="text-muted">
                  {filteredNotes.length} not bulundu
                </small>
              </div>
            )}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Henüz not eklenmemiş.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/note/create')}
            >
              İlk Notunu Oluştur
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Arama kriterlerinize uygun not bulunamadı.</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="row">
            {filteredNotes.map((note) => (
              <div key={note.id} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">{note.title}</h6>
                    <p className="card-text text-muted small">
                      {note.content.length > 100
                        ? note.content.substring(0, 100) + '...'
                        : note.content}
                    </p>
                    {(note.topicName || note.mockExamName || note.studyPlanName) && (
                      <div className="mb-2">
                        {note.topicName && (
                          <span className="badge bg-info me-1">Konu: {note.topicName}</span>
                        )}
                        {note.mockExamName && (
                          <span className="badge bg-warning me-1">Deneme: {note.mockExamName}</span>
                        )}
                        {note.studyPlanName && (
                          <span className="badge bg-success me-1">Program: {note.studyPlanName}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Dosya Bilgisi */}
                    {note.filePath && (
                      <div className="mb-2">
                        <span className="badge bg-secondary">
                          📎 {note.fileName || 'Dosya'}
                        </span>
                      </div>
                    )}
                    
                    <small className="text-muted d-block mb-2">
                      {formatDate(note.createdDate)}
                    </small>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/note/${note.id}`)}
                      >
                        ✏️ Düzenle
                      </button>
                      {note.filePath && (
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => navigate(`/note/view/${note.id}`)}
                        >
                          👁️ Görüntüle
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(note.id)}
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
    </div>
  );
};

export default NoteListPage;

