import React, { useState } from 'react';
import { FiX, FiCalendar, FiTarget, FiBook } from 'react-icons/fi';
import api from '../api/axiosConfig';

const SmartSchedulerModal = ({ isOpen, onClose, onPlanCreated }) => {
    const [formData, setFormData] = useState({
        examType: 1, // TYT
        startDate: new Date().toISOString().split('T')[0],
        targetExamDate: '',
    });
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // 1: Form, 2: Preview

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateSuggestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/StudyPlan/suggest', {
                planType: 2,
                startDate: formData.startDate,
                targetExamDate: formData.targetExamDate || null,
                examType: parseInt(formData.examType),
            });

            setSuggestion(response.data);
            setStep(2);
        } catch (err) {
            console.error('Öneri oluşturma hatası:', err);
            setError(err.response?.data?.message || 'Program önerisi oluşturulamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!suggestion) return;

        setLoading(true);
        setError(null);

        try {
            // Create the study plan with suggested items
            const planData = {
                name: suggestion.suggestedPlanName,
                planType: 2, // Daily
                startDate: suggestion.startDate,
                endDate: suggestion.endDate,
                description: suggestion.description,
                items: suggestion.suggestedItems.map(item => ({
                    date: item.date,
                    topicId: item.topicId,
                    notes: null,
                })),
            };

            await api.post('/StudyPlan', planData);

            if (onPlanCreated) {
                onPlanCreated();
            }

            handleClose();
        } catch (err) {
            console.error('Plan kaydetme hatası:', err);
            setError(err.response?.data?.message || 'Plan kaydedilemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            examType: 1,
            startDate: new Date().toISOString().split('T')[0],
            targetExamDate: '',
        });
        setSuggestion(null);
        setStep(1);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content smart-scheduler-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        <FiTarget className="me-2" />
                        🤖 Akıllı Program Oluştur
                    </h3>
                    <button className="btn-icon" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="alert alert-danger mb-3">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleGenerateSuggestion}>
                            <div className="form-group mb-3">
                                <label htmlFor="examType">Sınav Türü</label>
                                <select
                                    id="examType"
                                    name="examType"
                                    className="form-control"
                                    value={formData.examType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value={1}>TYT</option>
                                    <option value={2}>AYT</option>
                                </select>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="startDate">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    className="form-control"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="targetExamDate">Hedef Sınav Tarihi (Opsiyonel)</label>
                                <input
                                    type="date"
                                    id="targetExamDate"
                                    name="targetExamDate"
                                    className="form-control"
                                    value={formData.targetExamDate}
                                    onChange={handleInputChange}
                                />
                                <small className="form-text text-muted">
                                    Belirtmezseniz, otomatik olarak hesaplanacak.
                                </small>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Oluşturuluyor...' : 'Öneri Oluştur'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="suggestion-preview">
                            <div className="suggestion-summary mb-4">
                                <h4>{suggestion.suggestedPlanName}</h4>
                                <p className="text-muted">{suggestion.description}</p>

                                <div className="row g-3 mt-3">
                                    <div className="col-md-4">
                                        <div className="stat-box">
                                            <FiCalendar className="stat-icon" />
                                            <div className="stat-value">{suggestion.totalDays}</div>
                                            <div className="stat-label">Toplam Gün</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="stat-box">
                                            <FiBook className="stat-icon" />
                                            <div className="stat-value">{suggestion.totalTopics}</div>
                                            <div className="stat-label">Toplam Konu</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="stat-box">
                                            <FiTarget className="stat-icon" />
                                            <div className="stat-value">{suggestion.averageTopicsPerDay.toFixed(1)}</div>
                                            <div className="stat-label">Günlük Ortalama</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="suggestion-items">
                                <h5 className="mb-3">Günlük Konu Dağılımı</h5>
                                <div className="items-list">
                                    {suggestion.suggestedItems.slice(0, 10).map((item, index) => (
                                        <div key={index} className="item-row">
                                            <span className="item-date">
                                                {new Date(item.date).toLocaleDateString('tr-TR')}
                                            </span>
                                            <span className="item-topic">{item.topicName}</span>
                                            <span className="item-lesson badge">{item.lesson}</span>
                                        </div>
                                    ))}
                                    {suggestion.suggestedItems.length > 10 && (
                                        <div className="text-muted text-center mt-2">
                                            ... ve {suggestion.suggestedItems.length - 10} konu daha
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer mt-4">
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                    Geri
                                </button>
                                <button className="btn btn-success" onClick={handleSavePlan} disabled={loading}>
                                    {loading ? 'Kaydediliyor...' : '✓ Programı Kaydet'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartSchedulerModal;
