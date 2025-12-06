import React from 'react';

// --- SKELETON LOADER COMPONENTS ---

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-header"></div>
    <div className="skeleton-body">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-line" style={{ width: '80%' }}></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      <div className="skeleton-line" style={{ height: '2rem' }}></div>
    </div>
    <div className="skeleton-table-body">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="skeleton-stat-card">
    <div className="skeleton-line" style={{ width: '60%', height: '1rem' }}></div>
    <div className="skeleton-line" style={{ width: '40%', height: '2rem', marginTop: '1rem' }}></div>
  </div>
);

export default SkeletonCard;

