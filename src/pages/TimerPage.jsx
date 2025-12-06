import React from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import StudySessionTimer from '../components/StudySessionTimer';
import Tooltip from '../components/Tooltip';

// --- TIMER PAGE (ZAMANLAYICI SAYFASI) ---
// Pomodoro ve normal çalışma sayacı bileşenlerini gösterir.

const TimerPage = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        Çalışma Zamanlayıcıları
      </h2>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Pomodoro Zamanlayıcı
                <Tooltip text="Pomodoro tekniği: 25 dakika odaklanma + 5 dakika mola. Bu teknik, verimli çalışma için zamanı bölümlere ayırır." />
              </h5>
            </div>
            <div className="card-body">
              <PomodoroTimer />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Normal Çalışma Zamanlayıcı</h5>
            </div>
            <div className="card-body">
              <StudySessionTimer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerPage;

