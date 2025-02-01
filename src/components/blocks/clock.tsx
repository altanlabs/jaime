import { useEffect, useState } from 'react';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Madrid'
    }).format(time);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Madrid'
    }).format(time);
  };

  return (
    <div className="text-center mb-6">
      <div className="inline-block bg-blue-900/30 backdrop-blur-lg rounded-lg p-4 border border-blue-500/30">
        <div className="text-4xl font-bold text-blue-300 font-mono tracking-wider">
          {formatTime()}
        </div>
        <div className="text-blue-400 mt-1 capitalize">
          {formatDate()}
        </div>
      </div>
    </div>
  );
}