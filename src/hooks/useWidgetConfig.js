import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

// Widget ID'leri
export const WIDGET_IDS = {
  STUDY_TIME_STATS: 'studyTimeStats',
  SESSION_SUMMARY: 'sessionSummary',
  MOCK_EXAM: 'mockExam',
  TOPIC_PROGRESS: 'topicProgress',
  DAILY_GOALS: 'dailyGoals',
  RECENT_ACTIVITIES: 'recentActivities'
};

// Varsayılan widget konfigürasyonu
const DEFAULT_WIDGET_CONFIG = [
  { id: WIDGET_IDS.STUDY_TIME_STATS, enabled: true, order: 0, title: 'Çalışma Süresi Özeti' },
  { id: WIDGET_IDS.SESSION_SUMMARY, enabled: true, order: 1, title: 'Oturum Özeti' },
  { id: WIDGET_IDS.MOCK_EXAM, enabled: true, order: 2, title: 'Deneme Sınavları' },
  { id: WIDGET_IDS.TOPIC_PROGRESS, enabled: true, order: 3, title: 'Konu İlerlemesi' },
  { id: WIDGET_IDS.DAILY_GOALS, enabled: true, order: 4, title: 'Günün Hedefleri' },
  { id: WIDGET_IDS.RECENT_ACTIVITIES, enabled: true, order: 5, title: 'Son Aktiviteler' }
];

// Widget konfigürasyonunu localStorage'dan yükle
const loadWidgetConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WIDGET_CONFIG || 'dashboardWidgets');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Widget config yüklenemedi:', err);
  }
  return DEFAULT_WIDGET_CONFIG;
};

// Widget konfigürasyonunu localStorage'a kaydet
const saveWidgetConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WIDGET_CONFIG || 'dashboardWidgets', JSON.stringify(config));
  } catch (err) {
    console.error('Widget config kaydedilemedi:', err);
  }
};

// Widget özelleştirme hook'u
export const useWidgetConfig = () => {
  const [widgetConfig, setWidgetConfig] = useState(() => loadWidgetConfig());

  // Widget'ı aç/kapat
  const toggleWidget = (widgetId) => {
    setWidgetConfig(prev => {
      const updated = prev.map(w => 
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      );
      saveWidgetConfig(updated);
      return updated;
    });
  };

  // Widget sırasını değiştir
  const moveWidget = (widgetId, direction) => {
    setWidgetConfig(prev => {
      const updated = [...prev];
      const index = updated.findIndex(w => w.id === widgetId);
      
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= updated.length) return prev;
      
      // Swap
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      
      // Order'ları güncelle
      updated.forEach((w, i) => {
        w.order = i;
      });
      
      saveWidgetConfig(updated);
      return updated;
    });
  };

  // Widget'ı yeni pozisyona taşı (drag & drop için)
  const reorderWidget = (draggedId, targetId) => {
    setWidgetConfig(prev => {
      const updated = [...prev];
      const draggedIndex = updated.findIndex(w => w.id === draggedId);
      const targetIndex = updated.findIndex(w => w.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      // Widget'ı çıkar
      const [draggedWidget] = updated.splice(draggedIndex, 1);
      
      // Yeni pozisyona ekle
      updated.splice(targetIndex, 0, draggedWidget);
      
      // Order'ları güncelle
      updated.forEach((w, i) => {
        w.order = i;
      });
      
      saveWidgetConfig(updated);
      return updated;
    });
  };

  // Widget'ın aktif olup olmadığını kontrol et
  const isWidgetEnabled = (widgetId) => {
    const widget = widgetConfig.find(w => w.id === widgetId);
    return widget ? widget.enabled : true;
  };

  // Widget'ları sıralı olarak al
  const getOrderedWidgets = () => {
    return [...widgetConfig].sort((a, b) => a.order - b.order);
  };

  // Varsayılanlara sıfırla
  const resetToDefault = () => {
    saveWidgetConfig(DEFAULT_WIDGET_CONFIG);
    setWidgetConfig(DEFAULT_WIDGET_CONFIG);
  };

  return {
    widgetConfig,
    toggleWidget,
    moveWidget,
    reorderWidget,
    isWidgetEnabled,
    getOrderedWidgets,
    resetToDefault
  };
};

