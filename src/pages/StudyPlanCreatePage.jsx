import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../components/Toast';

// --- STUDY PLAN CREATE/EDIT PAGE (ÇALIŞMA PROGRAMI OLUŞTURMA/DÜZENLEME SAYFASI) ---
// Kullanıcının yeni bir çalışma programı oluşturduğu veya mevcut programı düzenlediği sayfa.

const StudyPlanCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL'den program ID'sini al (düzenleme modu için)
  const isEditMode = !!id; // ID varsa düzenleme modu
  
  // Form state'leri: Kullanıcının girdiği verileri tutar
  const [formData, setFormData] = useState({
    name: '',
    planType: 1, // 1 = Weekly (Haftalık - gün belirtmeden), 2 = Daily (Günlük - gün belirterek)
    startDate: '',
    endDate: '',
    description: ''
  });

  // Plan detayları: Her gün için hangi konu (saat yok artık)
  const [planItems, setPlanItems] = useState([]);
  
  // Haftalık program için konu listesi (gün belirtmeden)
  const [weeklyTopics, setWeeklyTopics] = useState([{ topicId: '' }]);
  
  // Tüm konular: Dropdown'dan seçim yapmak için
  const [topics, setTopics] = useState([]);
  
  // Loading durumları
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Sayfa yüklendiğinde konuları çek ve eğer düzenleme modundaysa programı yükle
  useEffect(() => {
    fetchTopics();
    if (isEditMode && id) {
      fetchPlanForEdit();
    }
  }, [id]);

  // Tarih değiştiğinde otomatik plan detayları oluştur (sadece yeni oluşturma modunda ve günlük program için)
  useEffect(() => {
    // Düzenleme modunda değilse, günlük program seçiliyse ve tarihler varsa otomatik oluştur
    if (!isEditMode && formData.planType === 2 && formData.startDate && formData.endDate) {
      generatePlanItems();
    }
  }, [formData.startDate, formData.endDate, formData.planType, isEditMode]);

  // API'den tüm konuları çek
  // examType ve fieldType parametreleri olmadan tüm konuları getirir
  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      // Backend'deki Topics endpoint'i tüm konuları döner
      const response = await api.get('/Topics?examType=1'); // TYT konuları (örnek)
      setTopics(response.data);
    } catch (err) {
      console.error("Konular çekilemedi", err);
      alert("Konular yüklenirken bir hata oluştu.");
    } finally {
      setLoadingTopics(false);
    }
  };

  // Form input değişikliklerini yakala
  // e.target.name: Input'un name attribute'u (name, planType, vb.)
  // e.target.value: Kullanıcının girdiği değer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Tarih değişikliklerinde validasyon yap
    if (name === 'startDate' || name === 'endDate') {
      // Bitiş tarihi başlangıç tarihinden önce olamaz
      if (name === 'endDate' && formData.startDate && value < formData.startDate) {
        alert("Bitiş tarihi başlangıç tarihinden önce olamaz!");
        return;
      }
      // Başlangıç tarihi bitiş tarihinden sonra olamaz
      if (name === 'startDate' && formData.endDate && value > formData.endDate) {
        alert("Başlangıç tarihi bitiş tarihinden sonra olamaz!");
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'planType' ? parseInt(value) : value
    }));
  };
  
  // Bugünün tarihini YYYY-MM-DD formatında al (min date için)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Başlangıç tarihine göre minimum bitiş tarihi
  const getMinEndDate = () => {
    return formData.startDate || getTodayDate();
  };

  // Başlangıç ve bitiş tarihlerine göre otomatik plan detayları oluştur
  // Bu fonksiyon, seçilen tarih aralığındaki her gün için bir plan detayı oluşturur
  const generatePlanItems = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    // Tarih geçerliliği kontrolü
    if (start > end) {
      alert("Bitiş tarihi başlangıç tarihinden önce olamaz!");
      return;
    }

    const items = [];
    const currentDate = new Date(start);

    // Başlangıçtan bitişe kadar her gün için bir plan detayı oluştur
    while (currentDate <= end) {
      // Haftalık program ise sadece hafta içi günleri ekle (Pazartesi-Cuma)
      // Aylık program ise tüm günleri ekle
      const dayOfWeek = currentDate.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
      
      if (formData.planType === 1) { // Weekly
        // Hafta içi günleri (1-5 = Pazartesi-Cuma)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          items.push({
            date: new Date(currentDate).toISOString().split('T')[0], // YYYY-MM-DD formatı
            topicId: '',
            notes: ''
          });
        }
      } else { // Monthly
        // Tüm günleri ekle
        items.push({
          date: new Date(currentDate).toISOString().split('T')[0],
          topicId: '',
          startTime: '09:00',
          endTime: '11:00',
          notes: ''
        });
      }

      // Bir sonraki güne geç
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setPlanItems(items);
  };

  // Plan detayındaki bir alanı güncelle
  // index: Hangi plan detayı güncellenecek
  // field: Hangi alan güncellenecek (topicId, startTime, vb.)
  // value: Yeni değer
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...planItems]; // Array'in kopyasını al (immutability)
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setPlanItems(updatedItems);
  };

  // Plan detayını sil
  const handleRemoveItem = (index) => {
    const updatedItems = planItems.filter((_, i) => i !== index);
    setPlanItems(updatedItems);
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault(); // Form'un varsayılan submit davranışını engelle

    // Validasyon: Program adı her zaman zorunlu
    if (!formData.name) {
      alert("Program adı zorunludur!");
      return;
    }

    // Validasyon: Günlük program için tarihler zorunlu
    if (formData.planType === 2) {
      if (!formData.startDate || !formData.endDate) {
        alert("Günlük program için başlangıç ve bitiş tarihleri zorunludur!");
        return;
      }
    }

    // Validasyon: Haftalık program için en az bir konu seçilmiş mi?
    if (formData.planType === 1) {
      const hasTopic = weeklyTopics.some(wt => wt.topicId);
      if (!hasTopic) {
        alert("En az bir konu seçmelisiniz!");
        return;
      }
    } else {
      // Günlük program için validasyon
      if (planItems.length === 0) {
        alert("En az bir gün için plan oluşturmalısınız!");
        return;
      }

      // Validasyon: Tüm plan detaylarında konu seçilmiş mi?
      const hasEmptyTopic = planItems.some(item => !item.topicId);
      if (hasEmptyTopic) {
        alert("Lütfen tüm günler için konu seçin!");
        return;
      }
    }

    try {
      setLoading(true);
      
      // Backend'e gönderilecek veri formatı
      // Haftalık program için startDate ve endDate göndermiyoruz
      const items = formData.planType === 1 
        ? (weeklyTopics.filter(wt => wt.topicId).map(wt => ({
            topicId: parseInt(wt.topicId),
            date: null, // Haftalık program için date yok
            startTime: null, // Saat yok
            endTime: null, // Saat yok
            notes: wt.notes || null
          })) || [])
        : (planItems.map(item => ({
            date: new Date(item.date + 'T00:00:00Z').toISOString(),
            topicId: parseInt(item.topicId),
            startTime: null, // Saat yok
            endTime: null, // Saat yok
            notes: item.notes || null
          })) || []);
      
      const payload = {
        name: formData.name,
        planType: formData.planType,
        startDate: formData.planType === 1 ? null : new Date(formData.startDate + 'T00:00:00Z').toISOString(), // Haftalık için null
        endDate: formData.planType === 1 ? null : new Date(formData.endDate + 'T23:59:59Z').toISOString(), // Haftalık için null
        description: formData.description || null,
        items: items // Her zaman bir array (boş olabilir)
      };
      
      console.log('Gönderilen payload:', JSON.stringify(payload, null, 2));

      // POST veya PUT isteği
      if (isEditMode) {
        // Düzenleme modu: PUT isteği
        const updatePayload = {
          id: parseInt(id),
          name: formData.name,
          planType: formData.planType, // PlanType'ı da gönder
          startDate: formData.planType === 1 ? null : new Date(formData.startDate + 'T00:00:00Z').toISOString(), // Haftalık için null
          endDate: formData.planType === 1 ? null : new Date(formData.endDate + 'T23:59:59Z').toISOString(), // Haftalık için null
          description: formData.description || null,
          isActive: true, // Varsayılan olarak aktif
          items: formData.planType === 1
            ? weeklyTopics.filter(wt => wt.topicId).map(wt => ({
                topicId: parseInt(wt.topicId),
                date: null, // Haftalık program için date yok
                startTime: null, // Saat yok
                endTime: null, // Saat yok
                notes: wt.notes || null
              }))
            : planItems.map(item => ({
                date: new Date(item.date + 'T00:00:00Z').toISOString(),
                topicId: parseInt(item.topicId),
                startTime: null, // Saat yok
                endTime: null, // Saat yok
                notes: item.notes || null
              }))
        };
        console.log('Güncelleme payload:', updatePayload);
        await api.put('/StudyPlan', updatePayload);
        alert("Program başarıyla güncellendi!");
      } else {
        // Oluşturma modu: POST isteği
        const response = await api.post('/StudyPlan', payload);
        console.log('Program oluşturma yanıtı:', response.data);
        alert("Program başarıyla oluşturuldu!");
      }
      
      navigate('/study-plan'); // Program listesi sayfasına yönlendir
    } catch (err) {
      console.error("Program oluşturulamadı", err);
      alert(err.response?.data?.message || "Program oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme modunda programı yükle
  const fetchPlanForEdit = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/StudyPlan/${id}`);
      const plan = response.data;
      
      console.log('Yüklenen plan:', plan);
      
      // Form verilerini doldur
      setFormData({
        name: plan.name || '',
        planType: plan.planType === 'Weekly' || plan.planType === 1 ? 1 : 2,
        startDate: plan.startDate ? (typeof plan.startDate === 'string' ? plan.startDate.split('T')[0] : new Date(plan.startDate).toISOString().split('T')[0]) : '',
        endDate: plan.endDate ? (typeof plan.endDate === 'string' ? plan.endDate.split('T')[0] : new Date(plan.endDate).toISOString().split('T')[0]) : '',
        description: plan.description || ''
      });
      
      // Plan detaylarını doldur (items varsa)
      if (plan.items && Array.isArray(plan.items) && plan.items.length > 0) {
        const items = plan.items.map(item => ({
          date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
          topicId: item.topicId ? item.topicId.toString() : '',
          notes: item.notes || ''
        }));
        console.log('Yüklenen items:', items);
        setPlanItems(items);
      } else {
        // Items yoksa boş array
        setPlanItems([]);
      }
    } catch (err) {
      console.error("Program yüklenemedi", err);
      alert("Program yüklenirken bir hata oluştu: " + (err.response?.data?.message || err.message));
      navigate('/study-plan');
    } finally {
      setLoading(false);
    }
  };

  // Tarih formatlama (gösterim için)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="container mt-4">
      <style>{`
        /* Tarih input'ları için özel stil */
        input[type="date"] {
          position: relative;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 1;
          font-size: 1.2em;
          padding: 5px;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 0.7;
        }
        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
        /* Tarih input'larına hover efekti */
        input[type="date"]:hover,
        input[type="time"]:hover {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        input[type="date"]:focus,
        input[type="time"]:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
      <h2>{isEditMode ? 'Çalışma Programını Düzenle' : 'Yeni Çalışma Programı Oluştur'}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Program Bilgileri */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Program Bilgileri</h5>
          </div>
          <div className="card-body">
            {/* Program Adı */}
            <div className="mb-3">
              <label className="form-label">Program Adı *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Örn: Aralık Ayı Yoğun Çalışma"
                required
              />
              <small className="text-muted">
                Programınızı kolayca tanımlayabileceğiniz bir isim verin
              </small>
            </div>

            {/* Program Tipi */}
            <div className="mb-3">
              <label className="form-label">Program Tipi *</label>
              <select
                className="form-select"
                name="planType"
                value={formData.planType}
                onChange={(e) => {
                  handleInputChange(e);
                  // Plan tipi değiştiğinde planItems'ı sıfırla
                  setPlanItems([]);
                  setWeeklyTopics([{ topicId: '' }]);
                }}
                required
              >
                <option value={1}>Haftalık (Gün belirtmeden konu seçimi)</option>
                <option value={2}>Günlük (Gün belirterek konu seçimi)</option>
              </select>
              <small className="text-muted">
                {formData.planType === 1 
                  ? 'Haftalık program: Hangi konuları çalışacağınızı seçin, gün belirtmenize gerek yok'
                  : 'Günlük program: Her gün için hangi konuyu çalışacağınızı seçin'}
              </small>
            </div>

            {/* Tarih Aralığı - Sadece Günlük program için */}
            {formData.planType === 2 && (
              <>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-calendar-event me-2"></i>
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                      max={formData.endDate || ''}
                      required
                      style={{ cursor: 'pointer' }}
                      title="Takvimden tarih seçin"
                    />
                    <small className="text-muted">
                      📅 Takvimden tarih seçmek için tıklayın
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-calendar-check me-2"></i>
                      Bitiş Tarihi *
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={getMinEndDate()}
                      required
                      style={{ cursor: 'pointer' }}
                      title="Takvimden tarih seçin"
                    />
                    <small className="text-muted">
                      📅 Takvimden tarih seçmek için tıklayın
                    </small>
                  </div>
                </div>
                
                {/* Tarih Önizleme */}
                {formData.startDate && formData.endDate && (
                  <div className="alert alert-info">
                    <strong>Seçilen Tarih Aralığı:</strong> {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                    <br />
                    <small>Tüm günler otomatik oluşturulacak</small>
                  </div>
                )}
              </>
            )}

            {/* Açıklama */}
            <div className="mb-3">
              <label className="form-label">Açıklama (Opsiyonel)</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Program hakkında notlar..."
              />
            </div>
          </div>
        </div>

        {/* Plan Detayları */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>
              {formData.planType === 1 
                ? `Haftalık Konular (${weeklyTopics.filter(wt => wt.topicId).length} konu)`
                : `Günlük Plan Detayları (${planItems.length} gün)`}
            </h5>
          </div>
          <div className="card-body">
            {loadingTopics ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Konular yükleniyor...</span>
                </div>
              </div>
            ) : formData.planType === 1 ? (
              /* Haftalık Program - Gün belirtmeden konu seçimi */
              <div>
                <p className="text-muted mb-3">
                  Bu hafta çalışacağınız konuları seçin. Gün belirtmenize gerek yok.
                </p>
                {weeklyTopics.map((wt, index) => (
                  <div key={index} className="row mb-3 align-items-end">
                    <div className="col-md-10">
                      <label className="form-label">Konu {index + 1}</label>
                      <select
                        className="form-select"
                        value={wt.topicId}
                        onChange={(e) => {
                          const updated = [...weeklyTopics];
                          updated[index] = { ...updated[index], topicId: e.target.value };
                          setWeeklyTopics(updated);
                        }}
                        required
                      >
                        <option value="">📚 Konu Seçin</option>
                        {topics.map(topic => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name} ({topic.lesson})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      {weeklyTopics.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger w-100"
                          onClick={() => {
                            setWeeklyTopics(weeklyTopics.filter((_, i) => i !== index));
                          }}
                        >
                          🗑️ Sil
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setWeeklyTopics([...weeklyTopics, { topicId: '' }])}
                >
                  + Konu Ekle
                </button>
              </div>
            ) : planItems.length === 0 ? (
              <div className="alert alert-info">
                Lütfen başlangıç ve bitiş tarihlerini seçin. Plan detayları otomatik oluşturulacaktır.
              </div>
            ) : (
              /* Günlük Program - Gün belirterek konu seçimi */
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Konu</th>
                      <th>Notlar</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={item.date}
                            onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                            min={formData.startDate || getTodayDate()}
                            max={formData.endDate || ''}
                            required
                            style={{ cursor: 'pointer', minWidth: '140px' }}
                            title="Tarihi değiştirmek için tıklayın"
                          />
                          <small className="text-muted d-block mt-1">
                            {formatDate(item.date)}
                          </small>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={item.topicId}
                            onChange={(e) => handleItemChange(index, 'topicId', e.target.value)}
                            required
                          >
                            <option value="">📚 Konu Seçin</option>
                            {topics.map(topic => (
                              <option key={topic.id} value={topic.id}>
                                {topic.name} ({topic.lesson})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            placeholder="📝 Notlar..."
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveItem(index)}
                            title="Bu plan detayını sil"
                          >
                            🗑️ Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Form Butonları */}
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/study-plan')}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (formData.planType === 2 && planItems.length === 0) || (formData.planType === 1 && !weeklyTopics.some(wt => wt.topicId))}
          >
            {loading 
              ? (isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
              : (isEditMode ? 'Programı Güncelle' : 'Programı Oluştur')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudyPlanCreatePage;


