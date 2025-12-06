import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- MOCK EXAM CREATE/EDIT PAGE (DENEME SINAVI OLUŞTURMA/DÜZENLEME SAYFASI) ---
// Kullanıcının yeni bir deneme sınavı sonucu eklediği veya mevcut sonucu düzenlediği sayfa.

const MockExamCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Net hesaplama fonksiyonu: Net = Doğru - (Yanlış / 4)
  const calculateNet = (correct, wrong) => {
    if (!correct && !wrong) return '';
    const correctNum = parseFloat(correct) || 0;
    const wrongNum = parseFloat(wrong) || 0;
    const net = correctNum - (wrongNum / 4);
    return net.toFixed(2);
  };

  const [formData, setFormData] = useState({
    examDate: '',
    examType: 1, // 1: TYT, 2: AYT
    fieldType: 0, // 0: None, 1: Sayısal, 2: Eşit Ağırlık, 3: Sözel
    examName: '',
    totalNet: 0,
    // TYT Ders Doğru/Yanlış/Net
    turkishCorrect: '', turkishWrong: '', turkishNet: '',
    mathematicsCorrect: '', mathematicsWrong: '', mathematicsNet: '',
    scienceCorrect: '', scienceWrong: '', scienceNet: '',
    socialCorrect: '', socialWrong: '', socialNet: '',
    // AYT Ders Doğru/Yanlış/Net
    literatureCorrect: '', literatureWrong: '', literatureNet: '',
    geographyCorrect: '', geographyWrong: '', geographyNet: '',
    historyCorrect: '', historyWrong: '', historyNet: '',
    philosophyCorrect: '', philosophyWrong: '', philosophyNet: '',
    physicsCorrect: '', physicsWrong: '', physicsNet: '',
    chemistryCorrect: '', chemistryWrong: '', chemistryNet: '',
    biologyCorrect: '', biologyWrong: '', biologyNet: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchExamForEdit();
    }
  }, [id]);

  const fetchExamForEdit = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/MockExam/${id}`);
      const exam = response.data;

      // Backend'den gelen net değerlerini doğru/yanlış'a çeviremeyiz (ters hesaplama yok)
      // Bu yüzden sadece net değerlerini gösteririz, doğru/yanlış boş kalır
      setFormData({
        examDate: exam.examDate ? (typeof exam.examDate === 'string' ? exam.examDate.split('T')[0] : new Date(exam.examDate).toISOString().split('T')[0]) : '',
        examType: exam.examType === 'TYT' ? 1 : 2,
        fieldType: exam.fieldType === 'None' ? 0 : exam.fieldType === 'Sayisal' ? 1 : exam.fieldType === 'EsitAgirlik' ? 2 : 3,
        examName: exam.examName || '',
        totalNet: exam.totalNet || 0,
        // TYT
        turkishCorrect: '', turkishWrong: '', turkishNet: exam.turkishNet?.toString() || '',
        mathematicsCorrect: '', mathematicsWrong: '', mathematicsNet: exam.mathematicsNet?.toString() || '',
        scienceCorrect: '', scienceWrong: '', scienceNet: exam.scienceNet?.toString() || '',
        socialCorrect: '', socialWrong: '', socialNet: exam.socialNet?.toString() || '',
        // AYT
        literatureCorrect: '', literatureWrong: '', literatureNet: exam.literatureNet?.toString() || '',
        geographyCorrect: '', geographyWrong: '', geographyNet: exam.geographyNet?.toString() || '',
        historyCorrect: '', historyWrong: '', historyNet: exam.historyNet?.toString() || '',
        philosophyCorrect: '', philosophyWrong: '', philosophyNet: exam.philosophyNet?.toString() || '',
        physicsCorrect: '', physicsWrong: '', physicsNet: exam.physicsNet?.toString() || '',
        chemistryCorrect: '', chemistryWrong: '', chemistryNet: exam.chemistryNet?.toString() || '',
        biologyCorrect: '', biologyWrong: '', biologyNet: exam.biologyNet?.toString() || '',
        notes: exam.notes || ''
      });
    } catch (err) {
      console.error("Deneme sınavı yüklenemedi", err);
      alert("Deneme sınavı yüklenirken bir hata oluştu: " + (err.response?.data?.message || err.message));
      navigate('/mock-exam');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sınav tipi değiştiğinde formu sıfırla
    if (name === 'examType') {
      const newExamType = parseInt(value);
      setFormData(prev => ({
        ...prev,
        examType: newExamType,
        fieldType: newExamType === 1 ? 0 : prev.fieldType || 1, // TYT için 0, AYT için varsayılan 1
        // TYT derslerini sıfırla
        turkishCorrect: '', turkishWrong: '', turkishNet: '',
        mathematicsCorrect: '', mathematicsWrong: '', mathematicsNet: '',
        scienceCorrect: '', scienceWrong: '', scienceNet: '',
        socialCorrect: '', socialWrong: '', socialNet: '',
        // AYT derslerini sıfırla
        literatureCorrect: '', literatureWrong: '', literatureNet: '',
        geographyCorrect: '', geographyWrong: '', geographyNet: '',
        historyCorrect: '', historyWrong: '', historyNet: '',
        philosophyCorrect: '', philosophyWrong: '', philosophyNet: '',
        physicsCorrect: '', physicsWrong: '', physicsNet: '',
        chemistryCorrect: '', chemistryWrong: '', chemistryNet: '',
        biologyCorrect: '', biologyWrong: '', biologyNet: '',
        totalNet: 0
      }));
      return;
    }
    
    // Doğru veya yanlış değiştiğinde net'i hesapla
    if (name.endsWith('Correct') || name.endsWith('Wrong')) {
      const subject = name.replace('Correct', '').replace('Wrong', '');
      const correctField = `${subject}Correct`;
      const wrongField = `${subject}Wrong`;
      const netField = `${subject}Net`;
      
      setFormData(prev => {
        const correct = name === correctField ? value : prev[correctField] || '';
        const wrong = name === wrongField ? value : prev[wrongField] || '';
        const net = calculateNet(correct, wrong);
        
        return {
          ...prev,
          [name]: value,
          [netField]: net
        };
      });
      
      // Toplam net'i güncelle
      setTimeout(() => {
        setFormData(prev => {
          let total = 0;
          if (prev.examType === 1) {
            total += parseFloat(prev.turkishNet) || 0;
            total += parseFloat(prev.mathematicsNet) || 0;
            total += parseFloat(prev.scienceNet) || 0;
            total += parseFloat(prev.socialNet) || 0;
          } else {
            // AYT için alan tipine göre dersleri ekle
            const fieldType = prev.fieldType || 1;
            total += parseFloat(prev.mathematicsNet) || 0; // Matematik her zaman var
            
            if (fieldType === 1) { // Sayısal
              total += parseFloat(prev.physicsNet) || 0;
              total += parseFloat(prev.chemistryNet) || 0;
              total += parseFloat(prev.biologyNet) || 0;
            } else if (fieldType === 2) { // Eşit Ağırlık
              total += parseFloat(prev.literatureNet) || 0;
              total += parseFloat(prev.geographyNet) || 0;
            } else if (fieldType === 3) { // Sözel
              total += parseFloat(prev.literatureNet) || 0;
              total += parseFloat(prev.geographyNet) || 0;
              total += parseFloat(prev.historyNet) || 0;
              total += parseFloat(prev.philosophyNet) || 0;
            }
          }
          return {
            ...prev,
            totalNet: parseFloat(total.toFixed(2))
          };
        });
      }, 0);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        examDate: new Date(formData.examDate + 'T00:00:00Z').toISOString(),
        examType: formData.examType,
        fieldType: formData.examType === 1 ? 0 : formData.fieldType,
        examName: formData.examName,
        totalNet: parseFloat(formData.totalNet) || 0,
        turkishNet: formData.turkishNet ? parseFloat(formData.turkishNet) : null,
        mathematicsNet: formData.mathematicsNet ? parseFloat(formData.mathematicsNet) : null,
        scienceNet: formData.scienceNet ? parseFloat(formData.scienceNet) : null,
        socialNet: formData.socialNet ? parseFloat(formData.socialNet) : null,
        literatureNet: formData.literatureNet ? parseFloat(formData.literatureNet) : null,
        geographyNet: formData.geographyNet ? parseFloat(formData.geographyNet) : null,
        historyNet: formData.historyNet ? parseFloat(formData.historyNet) : null,
        philosophyNet: formData.philosophyNet ? parseFloat(formData.philosophyNet) : null,
        physicsNet: formData.physicsNet ? parseFloat(formData.physicsNet) : null,
        chemistryNet: formData.chemistryNet ? parseFloat(formData.chemistryNet) : null,
        biologyNet: formData.biologyNet ? parseFloat(formData.biologyNet) : null,
        notes: formData.notes || null
      };

      if (isEditMode) {
        payload.id = parseInt(id);
        await api.put('/MockExam', payload);
        alert("Deneme sınavı başarıyla güncellendi!");
      } else {
        await api.post('/MockExam', payload);
        alert("Deneme sınavı başarıyla eklendi!");
      }

      navigate('/mock-exam');
    } catch (err) {
      console.error("Deneme sınavı kaydedilemedi", err);
      alert(err.response?.data?.message || "Deneme sınavı kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Ders input bileşeni (Doğru, Yanlış, Net)
  const SubjectInput = ({ subjectName, subjectKey, show = true }) => {
    if (!show) return null;
    
    const correctValue = formData[`${subjectKey}Correct`] || '';
    const wrongValue = formData[`${subjectKey}Wrong`] || '';
    const netValue = formData[`${subjectKey}Net`] || '';
    
    return (
      <div className="col-md-3 mb-3">
        <label className="form-label">{subjectName}</label>
        <div className="row g-2">
          <div className="col-4">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="D"
              name={`${subjectKey}Correct`}
              value={correctValue}
              onChange={handleInputChange}
              min="0"
            />
            <small className="text-muted">Doğru</small>
          </div>
          <div className="col-4">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Y"
              name={`${subjectKey}Wrong`}
              value={wrongValue}
              onChange={handleInputChange}
              min="0"
            />
            <small className="text-muted">Yanlış</small>
          </div>
          <div className="col-4">
            <input
              type="number"
              step="0.25"
              className="form-control form-control-sm"
              placeholder="Net"
              name={`${subjectKey}Net`}
              value={netValue}
              onChange={handleInputChange}
              readOnly
              style={{ backgroundColor: '#f8f9fa' }}
            />
            <small className="text-muted">Net</small>
          </div>
        </div>
      </div>
    );
  };

  if (loading && isEditMode) {
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
    <div className="container mt-4">
      <h2>{isEditMode ? 'Deneme Sınavı Düzenle' : 'Yeni Deneme Sınavı Ekle'}</h2>
      <p className="text-muted">Net = Doğru - (Yanlış / 4)</p>

      <form onSubmit={handleSubmit}>
        {/* Temel Bilgiler */}
        <div className="card mb-3">
          <div className="card-header">
            <h5>Temel Bilgiler</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Sınav Tarihi *</label>
                <input
                  type="date"
                  className="form-control"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Sınav Adı *</label>
                <input
                  type="text"
                  className="form-control"
                  name="examName"
                  value={formData.examName}
                  onChange={handleInputChange}
                  placeholder="Örn: TYT Deneme 1"
                  required
                />
                <small className="text-muted">
                  Deneme sınavınızı kolayca tanımlayabileceğiniz bir isim verin
                </small>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Sınav Tipi *</label>
                <select
                  className="form-select"
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  required
                >
                  <option value={1}>TYT</option>
                  <option value={2}>AYT</option>
                </select>
              </div>
              {formData.examType === 2 && (
                <div className="col-md-6 mb-3">
                  <label className="form-label">Alan Tipi *</label>
                  <select
                    className="form-select"
                    name="fieldType"
                    value={formData.fieldType}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Alan tipi değiştiğinde AYT derslerini sıfırla
                      setFormData(prev => ({
                        ...prev,
                        fieldType: parseInt(e.target.value),
                        literatureCorrect: '', literatureWrong: '', literatureNet: '',
                        geographyCorrect: '', geographyWrong: '', geographyNet: '',
                        historyCorrect: '', historyWrong: '', historyNet: '',
                        philosophyCorrect: '', philosophyWrong: '', philosophyNet: '',
                        physicsCorrect: '', physicsWrong: '', physicsNet: '',
                        chemistryCorrect: '', chemistryWrong: '', chemistryNet: '',
                        biologyCorrect: '', biologyWrong: '', biologyNet: '',
                        mathematicsCorrect: '', mathematicsWrong: '', mathematicsNet: '',
                        totalNet: 0
                      }));
                    }}
                    required
                  >
                    <option value={1}>Sayısal</option>
                    <option value={2}>Eşit Ağırlık</option>
                    <option value={3}>Sözel</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TYT Ders Netleri */}
        {formData.examType === 1 && (
          <div className="card mb-3">
            <div className="card-header">
              <h5>TYT Ders Netleri</h5>
              <small className="text-muted">D: Doğru, Y: Yanlış</small>
            </div>
            <div className="card-body">
              <div className="row">
                <SubjectInput subjectName="Türkçe" subjectKey="turkish" />
                <SubjectInput subjectName="Matematik" subjectKey="mathematics" />
                <SubjectInput subjectName="Fen Bilimleri" subjectKey="science" />
                <SubjectInput subjectName="Sosyal Bilimler" subjectKey="social" />
              </div>
            </div>
          </div>
        )}

        {/* AYT Ders Netleri - Alan tipine göre gösterilecek */}
        {formData.examType === 2 && (
          <div className="card mb-3">
            <div className="card-header">
              <h5>AYT Ders Netleri</h5>
              <small className="text-muted">D: Doğru, Y: Yanlış</small>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Matematik her zaman gösterilir */}
                <SubjectInput subjectName="Matematik" subjectKey="mathematics" />
                
                {/* Sayısal (1) */}
                {formData.fieldType === 1 && (
                  <>
                    <SubjectInput subjectName="Fizik" subjectKey="physics" />
                    <SubjectInput subjectName="Kimya" subjectKey="chemistry" />
                    <SubjectInput subjectName="Biyoloji" subjectKey="biology" />
                  </>
                )}
                
                {/* Eşit Ağırlık (2) */}
                {formData.fieldType === 2 && (
                  <>
                    <SubjectInput subjectName="Edebiyat" subjectKey="literature" />
                    <SubjectInput subjectName="Coğrafya" subjectKey="geography" />
                  </>
                )}
                
                {/* Sözel (3) */}
                {formData.fieldType === 3 && (
                  <>
                    <SubjectInput subjectName="Edebiyat" subjectKey="literature" />
                    <SubjectInput subjectName="Coğrafya" subjectKey="geography" />
                    <SubjectInput subjectName="Tarih" subjectKey="history" />
                    <SubjectInput subjectName="Felsefe" subjectKey="philosophy" />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toplam Net ve Notlar */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Toplam Net</label>
                <input
                  type="number"
                  step="0.25"
                  className="form-control"
                  name="totalNet"
                  value={formData.totalNet}
                  onChange={handleInputChange}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa' }}
                />
                <small className="form-text text-muted">Otomatik hesaplanır</small>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Notlar</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Sınav hakkında notlar..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/mock-exam')}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MockExamCreatePage;
