import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

// --- BREADCRUMB COMPONENT ---
// Sayfa hiyerarşisini gösterir

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/dashboard" className="d-flex align-items-center">
            <FiHome size={16} className="me-1" />
            Ana Sayfa
          </Link>
        </li>
        {items.map((item, index) => (
          <li 
            key={index} 
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {index === items.length - 1 ? (
              <span>{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

