import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- ANALYTICS PAGE (ÇALIŞMA ANALİZ SAYFASI) ---
// Kullanıcının çalışma analizlerini gösterir (birleşik analiz, grafikler, ısı haritası).

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week' veya 'month'
  const [exporting, setExporting] = useState(false);

  // Birleşik analiz verileri
  const [comprehensiveData, setComprehensiveData] = useState(null);
  
  // Grafik verileri
  const [studyTimeChartData, setStudyTimeChartData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [timeWastedData, setTimeWastedData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      let startDate, endDate;
      
      if (selectedPeriod === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const [comprehensive, studyTime, heatmap, timeWasted] = await Promise.all([
        api.get('/Analytics/comprehensive'),
        api.get(`/Analytics/study-time-chart?startDate=${startDateStr}&endDate=${endDateStr}`),
        api.get(`/Analytics/heatmap?startDate=${startDateStr}&endDate=${endDateStr}`),
        api.get(`/Analytics/time-wasted?startDate=${startDateStr}&endDate=${endDateStr}`)
      ]);

      setComprehensiveData(comprehensive.data);
      setStudyTimeChartData(studyTime.data);
      setHeatmapData(heatmap.data);
      setTimeWastedData(timeWasted.data);
    } catch (err) {
      console.error("Analiz verileri çekilemedi", err);
      alert("Analiz verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Export fonksiyonu
  const handleExport = async (type) => {
    try {
      setExporting(true);
      const response = await api.get(`/Export/${type}`, {
        responseType: 'blob'
      });
      
      // Blob'u indir
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert("Dosya başarıyla indirildi.");
    } catch (err) {
      console.error("Export hatası", err);
      alert("Dosya indirilirken bir hata oluştu.");
    } finally {
      setExporting(false);
    }
  };

  // Süreyi formatla (saniye → saat:dakika)
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}s ${minutes}dk`;
    }
    return `${minutes}dk`;
  };

  // Çalışma süresi grafiği için veri hazırlama
  const prepareStudyTimeChart = () => {
    const labels = studyTimeChartData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Pomodoro (dakika)',
          data: studyTimeChartData.map(item => Math.floor(item.pomodoroSeconds / 60)),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        },
        {
          label: 'Normal Sayaç (dakika)',
          data: studyTimeChartData.map(item => Math.floor(item.normalSeconds / 60)),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        },
        {
          label: 'Toplam (dakika)',
          data: studyTimeChartData.map(item => Math.floor(item.totalSeconds / 60)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  // Isı haritası için veri hazırlama
  const prepareHeatmapData = () => {
    // Son 30 gün için ısı haritası
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = heatmapData.find(d => {
        const dStr = new Date(d.date).toISOString().split('T')[0];
        return dStr === dateStr;
      });
      
      days.push({
        date: dateStr,
        dateObj: date,
        totalSeconds: dayData?.totalSeconds || 0,
        sessionCount: dayData?.sessionCount || 0
      });
    }
    
    return days;
  };

  // Isı haritası rengi hesapla
  const getHeatmapColor = (seconds) => {
    if (seconds === 0) return '#ebedf0'; // Boş
    if (seconds < 1800) return '#c6e48b'; // 30 dakikadan az - açık yeşil
    if (seconds < 3600) return '#7bc96f'; // 1 saatten az - orta yeşil
    if (seconds < 7200) return '#239a3b'; // 2 saatten az - koyu yeşil
    return '#196127'; // 2 saatten fazla - en koyu yeşil
  };

  // Zaman kaybedilen ders analizi grafiği
  const prepareTimeWastedChart = () => {
    const labels = timeWastedData.map(item => item.subjectName);
    const data = timeWastedData.map(item => Math.floor(item.totalSeconds / 3600)); // Saat cinsinden

    return {
      labels,
      datasets: [
        {
          label: 'Toplam Süre (saat)',
          data: data,
          backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
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

  const heatmapDays = prepareHeatmapData();

  return (
    <div className="container mt-4">
      {/* Sayfa Başlığı */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Çalışma Analizleri</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleExport('topic-progress')}
            disabled={exporting}
          >
            {exporting ? 'İndiriliyor...' : '📊 Konu İlerlemesi Dışa Aktar'}
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => handleExport('mock-exams')}
            disabled={exporting}
          >
            {exporting ? 'İndiriliyor...' : '📈 Deneme Sonuçları Dışa Aktar'}
          </button>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleExport('study-sessions')}
            disabled={exporting}
          >
            {exporting ? 'İndiriliyor...' : '⏱️ Çalışma Süreleri Dışa Aktar'}
          </button>
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => handleExport('study-plans')}
            disabled={exporting}
          >
            {exporting ? 'İndiriliyor...' : '📅 Ders Programı Dışa Aktar'}
          </button>
        </div>
        <div>
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Son 7 Gün
            </button>
            <button
              type="button"
              className={`btn ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Bu Ay
            </button>
          </div>
        </div>
      </div>

      {/* Birleşik Analiz Özeti */}
      {comprehensiveData && (
        <div className="row mb-4">
          {/* Bu Hafta Özeti */}
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Bu Hafta</h6>
                <h4 className="card-title">{formatDuration(comprehensiveData.thisWeek.totalSeconds)}</h4>
                <p className="card-text small">
                  {comprehensiveData.thisWeek.sessionCount} oturum
                </p>
              </div>
            </div>
          </div>

          {/* Konu İlerlemesi */}
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Konu İlerlemesi</h6>
                <h4 className="card-title">
                  {comprehensiveData.topicProgress.completedTopics} / {comprehensiveData.topicProgress.totalTopics}
                </h4>
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${comprehensiveData.topicProgress.completionPercentage}%` }}
                  >
                    {Math.round(comprehensiveData.topicProgress.completionPercentage)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deneme Sınavı Özeti */}
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Deneme Sınavları</h6>
                <h4 className="card-title">
                  {comprehensiveData.mockExamSummary.latestTotalNet?.toFixed(2) || 'N/A'}
                </h4>
                <p className="card-text small">
                  Son Net: {comprehensiveData.mockExamSummary.totalExams} sınav
                </p>
              </div>
            </div>
          </div>

          {/* Program İlerlemesi */}
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Program İlerlemesi</h6>
                <h4 className="card-title">
                  {comprehensiveData.studyPlanProgress.completedPlanItems} / {comprehensiveData.studyPlanProgress.totalPlanItems}
                </h4>
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${comprehensiveData.studyPlanProgress.completionPercentage}%` }}
                  >
                    {Math.round(comprehensiveData.studyPlanProgress.completionPercentage)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Çalışma Süresi Grafiği */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Haftalık/Aylık Çalışma Grafikleri</h5>
        </div>
        <div className="card-body">
          {studyTimeChartData.length > 0 ? (
            <Line data={prepareStudyTimeChart()} options={chartOptions} />
          ) : (
            <p className="text-muted">Henüz veri yok.</p>
          )}
        </div>
      </div>

      {/* Çalışma Yoğunluğu Isı Haritası */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Çalışma Yoğunluğu Isı Haritası</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-1">
            {heatmapDays.map((day, index) => (
              <div
                key={index}
                className="text-center"
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: getHeatmapColor(day.totalSeconds),
                  borderRadius: '3px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title={`${day.dateObj.toLocaleDateString('tr-TR')}: ${formatDuration(day.totalSeconds)} (${day.sessionCount} oturum)`}
              >
                <small className="text-muted" style={{ fontSize: '10px' }}>
                  {day.dateObj.getDate()}
                </small>
              </div>
            ))}
          </div>
          <div className="mt-3 d-flex align-items-center gap-3">
            <small className="text-muted">Daha az</small>
            <div className="d-flex gap-1">
              <div style={{ width: '10px', height: '10px', backgroundColor: '#ebedf0' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#c6e48b' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#7bc96f' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#239a3b' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#196127' }}></div>
            </div>
            <small className="text-muted">Daha fazla</small>
          </div>
        </div>
      </div>

      {/* Zaman Kaybedilen Ders Analizi */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Zaman Kaybedilen Ders Analizi</h5>
        </div>
        <div className="card-body">
          {timeWastedData.length > 0 ? (
            <>
              <Bar data={prepareTimeWastedChart()} options={chartOptions} />
              <div className="mt-3">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Ders</th>
                      <th>Toplam Süre</th>
                      <th>Oturum Sayısı</th>
                      <th>Ortalama Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeWastedData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.subjectName}</td>
                        <td>{formatDuration(item.totalSeconds)}</td>
                        <td>{item.sessionCount}</td>
                        <td>{item.averageSessionDuration.toFixed(1)} dk</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-muted">Henüz veri yok.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

