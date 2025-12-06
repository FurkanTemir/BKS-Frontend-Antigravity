import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import SmartSchedulerModal from '../components/SmartSchedulerModal';

// --- STUDY PLAN LIST PAGE (ÇALIŞMA PROGRAMI LİSTESİ SAYFASI) ---
// Kullanıcının tüm çalışma programlarını gösterir ve yönetir.

const StudyPlanListPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  // useEffect: Sayfa yüklendiğinde çalışır
  // Dependency array boş [] olduğu için sadece bir kez çalışır
  useEffect(() => {
    fetchPlans();
  }, []);

  // API'den programları çekme fonksiyonu
  // async/await: Asenkron işlemler için kullanılır
  // try/catch: Hata yakalama için
  const fetchPlans = async () => {
    try {
      setLoading(true);
      // GET isteği: Backend'den tüm programları çeker
      const response = await api.get('/StudyPlan');
      setPlans(response.data); // State'i güncelle (React re-render yapar)
    } catch (err) {
      console.error("Programlar çekilemedi", err);
      alert("Programlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false); // Her durumda loading'i kapat
    }
  };

  // Program silme fonksiyonu
  // DELETE isteği: Backend'e silme komutu gönderir
  const handleDelete = async (id, name) => {
    // Kullanıcıdan onay al (yanlışlıkla silmeyi önle)
    if (!window.confirm(`"${name}" programını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.delete(`/StudyPlan/${id}`);
      // Başarılı olursa listeyi yeniden yükle
      fetchPlans();
      alert("Program başarıyla silindi.");
    } catch (err) {
      console.error("Program silinemedi", err);
      alert("Program silinirken bir hata oluştu.");
    }
  };

  // Programı aktif/pasif yapma fonksiyonu
  // PUT isteği: Backend'e güncelleme komutu gönderir
  const handleToggleActive = async (id) => {
    try {
      await api.put(`/StudyPlan/${id}/activate`);
      // Başarılı olursa listeyi yeniden yükle
      fetchPlans();
    } catch (err) {
      console.error("Program durumu güncellenemedi", err);
      alert("Program durumu güncellenirken bir hata oluştu.");
    }
  };

  // Geçmiş tarihli programları arşive taşıma fonksiyonu
  const handleArchivePastPlans = async () => {
    try {
      const response = await api.post('/StudyPlan/archive');
      const count = response.data.count;
      if (count > 0) {
        alert(`${count} program arşive taşındı.`);
        fetchPlans(); // Listeyi yeniden yükle
      } else {
        alert("Arşive taşınacak program bulunamadı.");
      }
    } catch (err) {
      console.error("Programlar arşivlenemedi", err);
      alert("Programlar arşivlenirken bir hata oluştu.");
    }
  };

  // Tamamlanmış programı arşive taşıma fonksiyonu
  const handleArchiveCompletedPlan = async (planId, planName) => {
    // Kullanıcıdan onay al
    if (!window.confirm(`"${planName}" programını tamamladınız mı?\n\nProgram arşive taşınacak.`)) {
      return;
    }

    try {
      await api.post(`/StudyPlan/${planId}/archive`);
      alert("Program başarıyla arşive taşındı.");
      fetchPlans(); // Listeyi yeniden yükle
    } catch (err) {
      console.error("Program arşivlenemedi", err);
      alert("Program arşivlenirken bir hata oluştu.");
    }
  };

  // Tarih formatlama fonksiyonu
  // JavaScript Date objesi kullanarak tarihi okunabilir formata çevirir
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // toLocaleDateString: Yerel tarih formatını kullanır (örn: 01.12.2024)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading durumu: Veriler yüklenirken gösterilir
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
      {/* Sayfa Başlığı ve Yeni Program Butonu */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Çalışma Programlarım</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={handleArchivePastPlans}
            title="Geçmiş tarihli programları arşive taşı"
          >
            📦 Geçmiş Programları Arşivle
          </button>
          <button
            className="btn btn-outline-info"
            onClick={() => navigate('/study-plan/archived')}
          >
            📚 Arşiv
          </button>
          <button
            className="btn btn-success"
            onClick={() => setShowSchedulerModal(true)}
          >
            🤖 Akıllı Program Oluştur
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/study-plan/create')}
          >
            + Yeni Program Oluştur
          </button>
        </div>
      </div>

      {/* Program Listesi */}
      {plans.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <span style={{ fontSize: '64px' }}>📅</span>
          </div>
          <h5 className="text-muted mb-2">Henüz çalışma programı oluşturmadınız.</h5>
          <p className="text-muted mb-4">Haftalık veya günlük program oluşturarak düzenli çalışmaya başlayın!</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/study-plan/create')}
          >
            + İlk Programı Oluştur
          </button>
        </div>
      ) : (
        <div className="row">
          {plans.map(plan => (
            <div key={plan.id} className="col-md-6 mb-4">
              <div className={`card h-100 ${plan.isActive ? 'border-primary' : ''}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{plan.name}</h5>
                    {plan.isActive && (
                      <span className="badge bg-primary">Aktif Program</span>
                    )}
                  </div>
                  <div>
                    {/* Aktif/Pasif Yap Butonu */}
                    <button
                      className={`btn btn-sm ${plan.isActive ? 'btn-warning' : 'btn-success'} me-2`}
                      onClick={() => handleToggleActive(plan.id)}
                      title={plan.isActive ? "Pasif Yap" : "Aktif Yap"}
                    >
                      {plan.isActive ? '⏸️' : '▶️'}
                    </button>
                    {/* Sil Butonu */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(plan.id, plan.name)}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {/* Program Bilgileri */}
                  <p className="text-muted mb-2">
                    <strong>Tip:</strong> {plan.planType === 'Weekly' ? 'Haftalık' : 'Aylık'}
                  </p>
                  <p className="text-muted mb-2">
                    <strong>Başlangıç:</strong> {formatDate(plan.startDate)}
                  </p>
                  <p className="text-muted mb-2">
                    <strong>Bitiş:</strong> {formatDate(plan.endDate)}
                  </p>
                  {plan.description && (
                    <p className="text-muted mb-3">{plan.description}</p>
                  )}

                  {/* Plan İstatistikleri */}
                  <div className="mb-3">
                    <strong>Toplam Plan:</strong> {plan.items.length} gün
                    <br />
                    <strong>Tamamlanan:</strong> {plan.items.filter(item => item.isCompleted).length} gün
                  </div>

                  {/* İlerleme Çubuğu */}
                  <div className="progress mb-3" style={{ height: '20px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${plan.completionPercentage || 0}%`
                      }}
                    >
                      {plan.completionPercentage || 0}%
                    </div>
                  </div>

                  {/* Tamamlanmış Program Bildirimi */}
                  {plan.isCompleted && !plan.isArchived && (
                    <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <strong>🎉 Tebrikler!</strong> Programınız %100 tamamlandı.
                      </div>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleArchiveCompletedPlan(plan.id, plan.name)}
                      >
                        ✅ Programı Tamamladım
                      </button>
                    </div>
                  )}

                  {/* Aksiyon Butonları */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/study-plan/calendar/${plan.id}`)}
                    >
                      📅 Takvim Görünümü
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => navigate(`/study-plan/${plan.id}`)}
                    >
                      ✏️ Düzenle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Scheduler Modal */}
      <SmartSchedulerModal
        isOpen={showSchedulerModal}
        onClose={() => setShowSchedulerModal(false)}
        onPlanCreated={fetchPlans}
      />
    </div>
  );
};

export default StudyPlanListPage;


