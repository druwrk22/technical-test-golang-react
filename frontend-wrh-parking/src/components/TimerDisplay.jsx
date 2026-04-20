import { useState, useEffect } from 'react';

const TimerDisplay = ({ startTime, duration }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const endTime = startTime + (duration * 60 * 1000);
  const diff = endTime - now;

  const formatTime = (ms) => {
    const totalSec = Math.floor(Math.abs(ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (diff > 0) {
    return <div className="text-end timer-display fw-bold fs-5">⏳ {formatTime(diff)} tersisa</div>;
  }
  return <div className="text-end timer-display overtime fw-bold fs-5">⚠️ {formatTime(diff)} OVERTIME</div>;
};

export default TimerDisplay;