import React, { useState, useEffect } from 'react';
import { FiAward, FiClock } from 'react-icons/fi';
import api from '../api/axiosConfig';

const LeaderboardPage = () => {
    const [period, setPeriod] = useState('weekly'); // 'weekly' or 'monthly'
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const endpoint = period === 'weekly' ? '/Leaderboard/weekly' : '/Leaderboard/monthly';
            const response = await api.get(endpoint);
            setLeaderboard(response.data);
        } catch (err) {
            console.error('Liderlik tablosu yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}s ${mins}dk`;
    };

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><FiAward className="me-2" />Liderlik Tablosu</h2>
            </div>

            {/* Period Selector */}
            <div className="btn-group mb-4" role="group">
                <button
                    className={`btn ${period === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setPeriod('weekly')}
                >
                    Haftalık
                </button>
                <button
                    className={`btn ${period === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setPeriod('monthly')}
                >
                    Aylık
                </button>
            </div>

            {/* Leaderboard */}
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <FiClock className="me-2" />
                                {period === 'weekly' ? 'Bu Hafta' : 'Bu Ay'} - Çalışma Süresi Sıralaması
                            </h5>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Yükleniyor...</span>
                                    </div>
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-muted">Henüz veri yok. Arkadaş ekleyerek yarışmaya başla!</p>
                                </div>
                            ) : (
                                <div className="leaderboard-list">
                                    {leaderboard.map((entry) => (
                                        <div
                                            key={entry.userId}
                                            className={`leaderboard-entry ${entry.isCurrentUser ? 'current-user' : ''}`}
                                        >
                                            <div className="rank-badge">{getMedalEmoji(entry.rank)}</div>
                                            <div className="user-info">
                                                <div className="user-name">
                                                    {entry.firstName} {entry.lastName}
                                                    {entry.isCurrentUser && <span className="badge bg-primary ms-2">Sen</span>}
                                                </div>
                                            </div>
                                            <div className="study-time">
                                                <FiClock className="me-1" />
                                                {formatTime(entry.studyTimeMinutes)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaderboardPage;
