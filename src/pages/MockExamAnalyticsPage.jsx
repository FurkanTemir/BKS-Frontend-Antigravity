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
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Chart.js'i kaydet
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

// --- MOCK EXAM ANALYTICS PAGE (DENEME SINAVI GRAFİK ANALİZLERİ SAYFASI) ---
// Kullanıcının deneme sınavı sonuçlarını grafiklerle gösterir.

const MockExamAnalyticsPage = () => {
  const navigate = useNavigate();
  const [selectedExamType, setSelectedExamType] = useState(1); // 1: TYT, 2: AYT
  const [loading, setLoading] = useState(true);

  // Grafik verileri
  const [netChangeData, setNetChangeData] = useState([]);
  const [subjectProgressData, setSubjectProgressData] = useState([]);
  const [averageTrendData, setAverageTrendData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchAllChartData();
  }, [selectedExamType]);

  const fetchAllChartData = async () => {
    try {
      setLoading(true);
      
      // Tüm grafik verilerini paralel olarak çek
      const [netChange, subjectProgress, averageTrend, performance] = await Promise.all([
        api.get(`/MockExam/charts/net-change?examType=${selectedExamType}`),
        api.get(`/MockExam/charts/subject-progress?examType=${selectedExamType}`),
        api.get(`/MockExam/charts/average-trend?examType=${selectedExamType}`),
        api.get(`/MockExam/charts/performance?examType=${selectedExamType}`)
      ]);

      setNetChangeData(netChange.data);
      setSubjectProgressData(subjectProgress.data);
      setAverageTrendData(averageTrend.data);
      setPerformanceData(performance.data);
    } catch (err) {
      console.error("Grafik verileri çekilemedi", err);
      alert("Grafik verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Net değişim grafiği için veri hazırlama
  const prepareNetChangeChart = () => {
    const labels = netChangeData.map(item => {
      const date = new Date(item.examDate);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    });
    const data = netChangeData.map(item => item.totalNet);

    return {
      labels,
      datasets: [
        {
          label: 'Toplam Net',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  // Ders bazlı gelişim grafiği için veri hazırlama
  const prepareSubjectProgressChart = () => {
    const colors = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
      'rgb(199, 199, 199)',
      'rgb(83, 102, 255)'
    ];

    const datasets = subjectProgressData.map((subject, index) => {
      const labels = subject.points.map(point => {
        const date = new Date(point.examDate);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      });
      const data = subject.points.map(point => point.net);

      return {
        label: subject.subjectName,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      };
    });

    // Tüm derslerin tarihlerini birleştir (unique)
    const allDates = new Set();
    subjectProgressData.forEach(subject => {
      subject.points.forEach(point => {
        const date = new Date(point.examDate);
        allDates.add(date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }));
      });
    });

    return {
      labels: Array.from(allDates).sort(),
      datasets
    };
  };

  // Genel ortalama net trendi grafiği için veri hazırlama
  const prepareAverageTrendChart = () => {
    const labels = averageTrendData.map(item => {
      const date = new Date(item.examDate);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    });
    const data = averageTrendData.map(item => item.averageNet);

    return {
      labels,
      datasets: [
        {
          label: 'Ortalama Net',
          data: data,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  // Zaman içi performans grafiği için veri hazırlama (Bar Chart)
  const preparePerformanceChart = () => {
    const labels = performanceData.map(item => {
      const date = new Date(item.examDate);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    });

    // Tüm dersleri topla
    const allSubjects = new Set();
    performanceData.forEach(item => {
      Object.keys(item.subjectNets).forEach(subject => allSubjects.add(subject));
    });

    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 205, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)'
    ];

    const datasets = Array.from(allSubjects).map((subject, index) => {
      const data = performanceData.map(item => item.subjectNets[subject] || 0);
      return {
        label: subject,
        data: data,
        backgroundColor: colors[index % colors.length]
      };
    });

    return {
      labels,
      datasets
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: ''
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

  return (
    <div className="container mt-4">
      {/* Sayfa Başlığı */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Grafik Analizleri</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/mock-exam')}
        >
          ← Deneme Sınavları
        </button>
      </div>

      {/* Sınav Tipi Seçimi */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${selectedExamType === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedExamType(1)}
          >
            TYT
          </button>
          <button
            type="button"
            className={`btn ${selectedExamType === 2 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedExamType(2)}
          >
            AYT
          </button>
        </div>
      </div>

      {/* Grafikler */}
      <div className="row">
        {/* 1. Net Değişim Grafiği */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>Net Değişim Grafiği</h5>
            </div>
            <div className="card-body">
              {netChangeData.length > 0 ? (
                <Line data={prepareNetChangeChart()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Zaman İçi Toplam Net Değişimi' } } }} />
              ) : (
                <p className="text-muted">Henüz veri yok.</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Ders Bazlı Gelişim Grafiği */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>Ders Bazlı Gelişim Grafiği</h5>
            </div>
            <div className="card-body">
              {subjectProgressData.length > 0 ? (
                <Line data={prepareSubjectProgressChart()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Her Ders İçin Zaman İçi Net Değişimi' } } }} />
              ) : (
                <p className="text-muted">Henüz veri yok.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Genel Ortalama Net Trendi */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>Genel Ortalama Net Trendi</h5>
            </div>
            <div className="card-body">
              {averageTrendData.length > 0 ? (
                <Line data={prepareAverageTrendChart()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Tüm Derslerin Ortalama Net Değeri' } } }} />
              ) : (
                <p className="text-muted">Henüz veri yok.</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. Zaman İçi Performans Grafiği */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>Zaman İçi Performans Grafiği</h5>
            </div>
            <div className="card-body">
              {performanceData.length > 0 ? (
                <Bar data={preparePerformanceChart()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Her Sınav İçin Ders Bazlı Net Dağılımı' } } }} />
              ) : (
                <p className="text-muted">Henüz veri yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockExamAnalyticsPage;

