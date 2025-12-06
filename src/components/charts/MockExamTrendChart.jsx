import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MockExamTrendChart = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Örnek veri yapısı: [{ date: '01.01', net: 45 }, { date: '15.01', net: 52 }, ...]
    const chartData = {
        labels: data?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Net Sayısı',
                data: data?.map(d => d.net) || [],
                backgroundColor: '#8b5cf6', // Secondary color
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#334155',
                cornerRadius: 6,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { family: 'Inter', size: 11 },
                    color: '#94a3b8',
                },
                border: {
                    display: false,
                }
            },
            y: {
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 5,
                },
                border: {
                    display: false,
                }
            },
        },
    };

    return <Bar options={options} data={chartData} />;
};

export default MockExamTrendChart;
