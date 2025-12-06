import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const TopicProgressChart = ({ completed, remaining }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const data = {
        labels: ['Tamamlanan', 'Kalan'],
        datasets: [
            {
                data: [completed, remaining],
                backgroundColor: [
                    '#10b981', // Success color
                    isDark ? '#334155' : '#e2e8f0', // Darker gray for dark mode
                ],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        cutout: '75%', // Halkanın kalınlığı
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: isDark ? '#1e293b' : '#334155',
                padding: 10,
                cornerRadius: 8,
            },
        },
    };

    // Ortadaki yüzdeyi hesapla
    const total = completed + remaining;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <Doughnut data={data} options={options} />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}
            >
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    color: isDark ? '#f1f5f9' : '#0f172a'
                }}>
                    %{percentage}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Tamamlanan
                </div>
            </div>
        </div>
    );
};

export default TopicProgressChart;
