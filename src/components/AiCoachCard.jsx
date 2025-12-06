import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axiosConfig';

const AiCoachCard = () => {
    const [recommendations, setRecommendations] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/Coach/recommendations');
            setRecommendations(response.data.content || 'Henüz tavsiye yok.');
        } catch (err) {
            console.error('AI Coach hatası:', err);
            setError('Tavsiyeler yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    return (
        <div className="card ai-coach-card">
            <div className="card-header">
                <div className="card-title-wrapper">
                    <FiMessageCircle className="card-icon" />
                    <h3 className="card-title">🤖 AI Çalışma Koçu</h3>
                </div>
                <button
                    className="btn-icon"
                    onClick={fetchRecommendations}
                    disabled={loading}
                    title="Yenile"
                >
                    <FiRefreshCw className={loading ? 'spinning' : ''} />
                </button>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Tavsiyeler hazırlanıyor...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="ai-recommendations">
                        {recommendations.split('\n').map((line, index) => (
                            <p key={index} className={line.trim() ? '' : 'empty-line'}>
                                {line}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiCoachCard;
