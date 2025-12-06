import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const StudyTrendChart = ({ data }) => {
    // Varsayılan boş data kontrolü
    const chartData = {
        labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        datasets: [
            {
                fill: true,
                label: 'Çalışma Süresi (dk)',
                data: data || [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#6366f1', // Primary color
                backgroundColor: 'rgba(99, 102, 241, 0.1)', // Primary ligtened
                tension: 0.4, // Smooth curve
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { family: 'Inter', size: 13 },
                bodyFont: { family: 'Inter', size: 13 },
                cornerRadius: 8,
                displayColors: false,
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
                    color: '#f1f5f9',
                    borderDash: [5, 5],
                },
                ticks: {
                    font: { family: 'Inter', size: 11 },
                    color: '#94a3b8',
                    maxTicksLimit: 5,
                },
                border: {
                    display: false,
                },
                beginAtZero: true,
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return <Line options={options} data={chartData} />;
};

export default StudyTrendChart;
