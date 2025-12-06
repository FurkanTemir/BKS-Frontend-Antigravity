import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArchive, FiCalendar, FiEdit } from 'react-icons/fi';
import api from '../api/axiosConfig';

// --- STUDY PLAN ARCHIVED PAGE (ÇALIŞMA PROGRAMI ARŞİV SAYFASI) ---
// Arşivlenmiş çalışma programlarını gösterir.

const StudyPlanArchivedPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedPlans();
  }, []);

  const fetchArchivedPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/StudyPlan/archived');
      setPlans(response.data);
    } catch (err) {
      console.error("Arşivlenmiş programlar çekilemedi", err);
      alert("Arşivlenmiş programlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    <div className="container mt-4 fade-in">
      <div className="modern-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FiArchive className="me-2" size={24} />
              <h4 className="mb-0">Arşivlenmiş Çalışma Programları</h4>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/study-plan')}
            >
              ← Geri Dön
            </button>
          </div>
        </div>
        <div className="card-body">
          {plans.length === 0 ? (
            <div className="text-center py-5">
              <FiArchive size={64} className="text-muted mb-3" />
              <p className="text-muted">Henüz arşivlenmiş program bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="row g-3">
              {plans.map(plan => {
                const completedCount = plan.items.filter(item => item.isCompleted).length;
                const totalCount = plan.items.length;
                const completionPercentage = totalCount > 0 
                  ? Math.round((completedCount / totalCount) * 100) 
                  : 0;

                return (
                  <div key={plan.id} className="col-md-6 col-lg-4">
                    <div className="modern-card h-100 border-secondary">
                      <div className="card-header bg-secondary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{plan.name}</h6>
                          <span className="badge bg-light text-dark">Arşiv</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="text-muted mb-2">
                          <strong>Tip:</strong> {plan.planType === 'Weekly' ? 'Haftalık' : 'Günlük'}
                        </p>
                        {plan.startDate && (
                          <p className="text-muted mb-2">
                            <strong>Başlangıç:</strong> {formatDate(plan.startDate)}
                          </p>
                        )}
                        {plan.endDate && (
                          <p className="text-muted mb-2">
                            <strong>Bitiş:</strong> {formatDate(plan.endDate)}
                          </p>
                        )}
                        {plan.description && (
                          <p className="text-muted mb-3">{plan.description}</p>
                        )}
                        
                        <div className="mb-3">
                          <strong>Toplam Plan:</strong> {totalCount} gün
                          <br />
                          <strong>Tamamlanan:</strong> {completedCount} gün
                        </div>

                        <div className="progress mb-3" style={{ height: '20px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${completionPercentage}%` }}
                          >
                            {completionPercentage}%
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/study-plan/calendar/${plan.id}`)}
                            title="Takvim Görünümü"
                          >
                            <FiCalendar className="me-1" />
                            Takvim
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/study-plan/${plan.id}`)}
                            title="Detayları Görüntüle"
                          >
                            <FiEdit className="me-1" />
                            Detay
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanArchivedPage;

