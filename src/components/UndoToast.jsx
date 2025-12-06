import React, { useState, useEffect } from 'react';
import { FiRotateCcw, FiX } from 'react-icons/fi';
import api from '../api/axiosConfig';
import './UndoToast.css';

/**
 * UndoToast - Silinen öğeleri geri getirme toast bileşeni
 * Son 30 saniye içinde silinen öğeler için geri alma butonu gösterir
 */
const UndoToast = ({ onUndoSuccess }) => {
  const [availableUndos, setAvailableUndos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissedUndos, setDismissedUndos] = useState(new Set()); // Dismiss edilen undo'ları tut

  // Geri getirilebilir öğeleri getir
  const fetchAvailableUndos = async () => {
    try {
      const response = await api.get('/Common/available-undos');
      const undos = response.data?.data || response.data || [];
      
      // Sadece süresi dolmamış ve dismiss edilmemiş olanları göster
      const now = new Date();
      const validUndos = undos.filter(undo => {
        const deletedAt = new Date(undo.deletedAt);
        const secondsSinceDeletion = (now - deletedAt) / 1000;
        const isValid = secondsSinceDeletion < 30 && undo.remainingSeconds > 0;
        const notDismissed = !dismissedUndos.has(undo.undoHistoryId);
        return isValid && notDismissed;
      });
      
      setAvailableUndos(validUndos);
    } catch (error) {
      // Sessizce hata yok say (kullanıcı giriş yapmamış olabilir)
      if (error.response?.status !== 401) {
        console.error('Undo listesi alınamadı:', error);
      }
    }
  };

  // Her 2 saniyede bir kontrol et
  useEffect(() => {
    fetchAvailableUndos();
    const interval = setInterval(fetchAvailableUndos, 2000);

    return () => clearInterval(interval);
  }, [dismissedUndos]); // dismissedUndos değiştiğinde yeniden başlat

  // Her undo için kalan süreyi hesapla ve güncelle
  useEffect(() => {
    if (availableUndos.length === 0) return;

    const updateRemainingSeconds = () => {
      const now = new Date();
      setAvailableUndos(prev => 
        prev.map(undo => {
          const deletedAt = new Date(undo.deletedAt);
          const secondsSinceDeletion = (now - deletedAt) / 1000;
          const remaining = Math.max(0, Math.floor(30 - secondsSinceDeletion));
          
          return {
            ...undo,
            remainingSeconds: remaining
          };
        }).filter(undo => undo.remainingSeconds > 0) // Süresi dolanları kaldır
      );
    };

    const interval = setInterval(updateRemainingSeconds, 1000);
    return () => clearInterval(interval);
  }, [availableUndos.length]);

  // Geri getirme işlemi
  const handleUndo = async (undoHistoryId) => {
    setLoading(true);
    try {
      await api.post('/Common/undo', { undoHistoryId });
      
      // Başarılı mesajı göster
      if (onUndoSuccess) {
        onUndoSuccess();
      }
      
      // Listeyi güncelle
      await fetchAvailableUndos();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Geri getirme başarısız';
      alert(errorMessage);
      console.error('Geri getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toast'ı kapat
  const handleDismiss = (undoHistoryId) => {
    // Dismiss edilen undo'yu Set'e ekle (tekrar gelmesin)
    setDismissedUndos(prev => new Set([...prev, undoHistoryId]));
    // State'den de kaldır
    setAvailableUndos(prev => prev.filter(undo => undo.undoHistoryId !== undoHistoryId));
  };

  // Entity tipine göre Türkçe isim
  const getEntityTypeName = (entityType) => {
    const names = {
      'Note': 'Not',
      'MockExam': 'Deneme Sınavı',
      'StudyPlan': 'Çalışma Programı'
    };
    return names[entityType] || entityType;
  };

  if (availableUndos.length === 0) return null;

  return (
    <div className="undo-toast-container">
      {availableUndos.map((undo) => (
        <div key={undo.undoHistoryId} className="undo-toast">
          <div className="undo-toast-content">
            <div className="undo-toast-icon">
              <FiRotateCcw size={18} />
            </div>
            <div className="undo-toast-message">
              <span className="undo-entity-name">{undo.entityName || 'Öğe'}</span>
              <span className="undo-entity-type"> ({getEntityTypeName(undo.entityType)})</span>
              <span className="undo-time"> - {undo.remainingSeconds}s kaldı</span>
            </div>
          </div>
          <div className="undo-toast-actions">
            <button
              className="undo-button"
              onClick={() => handleUndo(undo.undoHistoryId)}
              disabled={loading || undo.remainingSeconds <= 0}
              title="Geri Al"
            >
              Geri Al
            </button>
            <button
              className="undo-dismiss"
              onClick={() => handleDismiss(undo.undoHistoryId)}
              title="Kapat"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UndoToast;

