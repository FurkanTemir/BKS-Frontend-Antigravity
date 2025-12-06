import React, { useEffect, useRef } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

// --- TOOLTIP COMPONENT (YARDIM İPUCU BİLEŞENİ) ---
// Bootstrap tooltip kullanarak yardım metinleri gösterir.

const Tooltip = ({ text, placement = 'top' }) => {
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (tooltipRef.current && window.bootstrap) {
      const tooltip = new window.bootstrap.Tooltip(tooltipRef.current);
      return () => {
        tooltip.dispose();
      };
    }
  }, []);

  return (
    <span
      ref={tooltipRef}
      className="d-inline-block ms-1"
      data-bs-toggle="tooltip"
      data-bs-placement={placement}
      title={text}
      style={{ cursor: 'help' }}
    >
      <FiHelpCircle size={14} className="text-muted" />
    </span>
  );
};

export default Tooltip;

