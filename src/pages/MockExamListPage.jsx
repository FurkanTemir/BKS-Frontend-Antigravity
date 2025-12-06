import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- MOCK EXAM LIST PAGE (DENEME SINAVI LİSTESİ SAYFASI) ---
// Kullanıcının tüm deneme sınavı sonuçlarını gösterir ve yönetir.

const MockExamListPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamType, setSelectedExamType] = useState(1); // 1: TYT, 2: AYT
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [netRange, setNetRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('date'); // 'date', 'net'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  useEffect(() => {
    fetchExams();
  }, []);

  // Filtreleme ve sıralama
  useEffect(() => {
    let filtered = exams.filter(exam => {
      if (selectedExamType === 1) return exam.examType === 'TYT';
      if (selectedExamType === 2) return exam.examType === 'AYT';
      return true;
    });

    // Tarih aralığı filtresi
    if (dateRange.start) {
      filtered = filtered.filter(exam => new Date(exam.examDate) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(exam => new Date(exam.examDate) <= new Date(dateRange.end));
    }

    // Net aralığı filtresi
    if (netRange.min) {
      filtered = filtered.filter(exam => exam.totalNet >= parseFloat(netRange.min));
    }
    if (netRange.max) {
      filtered = filtered.filter(exam => exam.totalNet <= parseFloat(netRange.max));
    }

    // Sıralama
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.examDate);
        const dateB = new Date(b.examDate);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'net') {
        return sortOrder === 'asc' ? a.totalNet - b.totalNet : b.totalNet - a.totalNet;
      }
      return 0;
    });

    setFilteredExams(filtered);
  }, [exams, selectedExamType, dateRange, netRange, sortBy, sortOrder]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/MockExam');
      setExams(response.data);
    } catch (err) {
      console.error("Deneme sınavları çekilemedi", err);
      alert("Deneme sınavları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" deneme sınavını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.delete(`/MockExam/${id}`);
      fetchExams();
      alert("Deneme sınavı başarıyla silindi.");
    } catch (err) {
      console.error("Deneme sınavı silinemedi", err);
      alert("Deneme sınavı silinirken bir hata oluştu.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFieldTypeName = (fieldType) => {
    const names = {
      'None': 'TYT',
      'Sayisal': 'Sayısal',
      'EsitAgirlik': 'Eşit Ağırlık',
      'Sozel': 'Sözel',
      'Dil': 'Dil'
    };
    return names[fieldType] || fieldType;
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
      {/* Sayfa Başlığı ve Yeni Sınav Butonu */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Deneme Sınavı Sonuçlarım</h2>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={() => navigate('/mock-exam/create')}
          >
            + Yeni Deneme Sınavı Ekle
          </button>
          <button 
            className="btn btn-outline-info"
            onClick={() => navigate('/mock-exam/analytics')}
          >
            📊 Grafik Analizleri
          </button>
        </div>
      </div>

      {/* Filtreleme ve Sıralama */}
      {exams.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-3">
              {/* Sınav Tipi Filtresi */}
              <div className="col-md-3">
                <label className="form-label">Sınav Tipi</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${selectedExamType === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedExamType(1)}
                  >
                    TYT
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedExamType === 2 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedExamType(2)}
                  >
                    AYT
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedExamType === 0 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedExamType(0)}
                  >
                    Tümü
                  </button>
                </div>
              </div>

              {/* Tarih Aralığı */}
              <div className="col-md-3">
                <label className="form-label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>

              {/* Net Aralığı */}
              <div className="col-md-3">
                <label className="form-label">Min Net</label>
                <input
                  type="number"
                  step="0.25"
                  className="form-control"
                  placeholder="Min"
                  value={netRange.min}
                  onChange={(e) => setNetRange({ ...netRange, min: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Max Net</label>
                <input
                  type="number"
                  step="0.25"
                  className="form-control"
                  placeholder="Max"
                  value={netRange.max}
                  onChange={(e) => setNetRange({ ...netRange, max: e.target.value })}
                />
              </div>

              {/* Sıralama */}
              <div className="col-md-3">
                <label className="form-label">Sırala</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Tarihe Göre</option>
                  <option value="net">Nete Göre</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Sıra</label>
                <select
                  className="form-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Azalan</option>
                  <option value="asc">Artan</option>
                </select>
              </div>

              {/* Filtreleri Temizle */}
              <div className="col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setNetRange({ min: '', max: '' });
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
            {filteredExams.length !== exams.length && (
              <div className="mt-2">
                <small className="text-muted">
                  {filteredExams.length} sınav gösteriliyor (toplam {exams.length})
                </small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sınav Listesi */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <span style={{ fontSize: '64px' }}>📝</span>
          </div>
          <h5 className="text-muted mb-2">Henüz deneme sınavı eklemediniz.</h5>
          <p className="text-muted mb-4">İlk denemenizi ekleyerek ilerlemenizi takip edin!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/mock-exam/create')}
          >
            + İlk Deneme Sınavını Ekle
          </button>
        </div>
      ) : (
        <>
          {/* Net Artışı Motivasyon Mesajı */}
          {(() => {
            // Sınavları tarihe göre sırala (en yeni en üstte)
            const sortedExams = [...filteredExams].sort((a, b) => 
              new Date(b.examDate) - new Date(a.examDate)
            );
            
            // Son iki sınavı al ve net artışını kontrol et
            if (sortedExams.length >= 2) {
              const lastExam = sortedExams[0];
              const previousExam = sortedExams[1];
              
              // Aynı sınav tipinde ve net artışı varsa
              if (lastExam.examType === previousExam.examType && 
                  lastExam.totalNet > previousExam.totalNet) {
                return (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <span className="me-2" style={{ fontSize: '24px' }}>🎉</span>
                    <div>
                      <strong>Harika!</strong> Netiniz artıyor. Çalışmalarınızın meyvesini görüyorsunuz!
                      <br />
                      <small>
                        Son {lastExam.examType}: {previousExam.totalNet.toFixed(2)} → {lastExam.totalNet.toFixed(2)} net
                      </small>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}
          
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Sınav Adı</th>
                  <th>Tip</th>
                  <th>Alan</th>
                  <th>Toplam Net</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map(exam => (
                <tr key={exam.id}>
                  <td>{formatDate(exam.examDate)}</td>
                  <td>{exam.examName}</td>
                  <td>{exam.examType}</td>
                  <td>{getFieldTypeName(exam.fieldType)}</td>
                  <td><strong>{exam.totalNet.toFixed(2)}</strong></td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => navigate(`/mock-exam/${exam.id}`)}
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(exam.id, exam.examName)}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MockExamListPage;

