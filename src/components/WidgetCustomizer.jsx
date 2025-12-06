import React, { useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { useToast } from './Toast';

// --- WIDGET CUSTOMIZER COMPONENT ---
// Dashboard widget'larını düzenleme modunu açıp kapatan buton

const WidgetCustomizer = ({ isEditMode, setIsEditMode }) => {
  const { showToast } = useToast();

  // isEditMode prop'u yoksa kendi state'ini kullan (geriye dönük uyumluluk)
  const [internalEditMode, setInternalEditMode] = useState(false);
  const isCustomizeMode = isEditMode !== undefined ? isEditMode : internalEditMode;
  const setIsCustomizeMode = setIsEditMode || setInternalEditMode;

  const handleToggle = () => {
    setIsCustomizeMode(!isCustomizeMode);
    if (!isCustomizeMode) {
      showToast('Düzenleme modu açıldı. Widget\'ları sürükleyerek sıralayın.', 'info');
    } else {
      showToast('Düzenleme modu kapatıldı', 'info');
    }
  };

  return (
    <button
      className="btn btn-outline-primary btn-sm"
      onClick={handleToggle}
      title="Düzenleme Modu (Tıkla veya 'E' tuşuna bas)"
    >
      <FiSettings className="me-1" size={16} />
      {isCustomizeMode ? 'Düzenleme Modu' : 'Widget\'ları Özelleştir'}
    </button>
  );
};

export default WidgetCustomizer;
