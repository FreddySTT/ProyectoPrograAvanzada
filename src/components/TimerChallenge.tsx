import { useState, useEffect, useRef } from 'react';

export function TimerChallenge() {
  const [seconds, setSeconds] = useState(15);
  const [isActive, setIsActive] = useState(false);

  // Usamos useRef para almacenar la referencia mutable del intervalo
  // sin causar re-renderizados innecesarios al mutar timerRef.current
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      // Iniciamos el intervalo y guardamos su ID en la referencia
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current !== null) {
      // Limpiamos el intervalo existente cuando se pausa/detiene
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cleanup: se ejecuta si isActive cambia o si el componente se desmonta
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSeconds(15);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="timer-wrapper">
      <style>{`
        .timer-wrapper {
          position: relative;
          width: 100%;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          box-sizing: border-box;
          background: #0d1b54;
          background-image: 
            radial-gradient(ellipse at 20% 40%, rgba(30, 64, 175, 0.7) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 60%, rgba(67, 56, 202, 0.8) 0%, transparent 60%),
            linear-gradient(135deg, #070b28 0%, #172554 50%, #0c1538 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .timer-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 10% 20%, rgba(255,255,255,0.8) 1px, transparent 1px),
            radial-gradient(circle at 85% 15%, rgba(255,255,255,0.9) 1.5px, transparent 1.5px),
            radial-gradient(circle at 90% 80%, rgba(255,255,255,0.7) 1px, transparent 1px),
            radial-gradient(circle at 30% 85%, rgba(255,255,255,0.8) 1.5px, transparent 1.5px),
            radial-gradient(circle at 75% 40%, rgba(199,210,254,0.9) 2px, transparent 2px),
            radial-gradient(circle at 15% 75%, rgba(199,210,254,0.9) 2px, transparent 2px);
          background-size: 200px 200px;
          pointer-events: none;
          opacity: 0.7;
        }

        .timer-stars {
          position: absolute;
          pointer-events: none;
          user-select: none;
        }
        .ts-1 { top: 18%; left: 6%; color: #93c5fd; font-size: 20px; }
        .ts-2 { top: 70%; left: 10%; color: #c4b5fd; font-size: 16px; }
        .ts-3 { top: 25%; right: 8%; color: #818cf8; font-size: 22px; }
        .ts-4 { top: 78%; right: 12%; color: #93c5fd; font-size: 18px; }

        .timer-card {
          position: relative;
          z-index: 2;
          background: #ffffff;
          width: 100%;
          max-width: 520px;
          padding: 50px 30px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .timer-title {
          font-family: 'Times New Roman', Times, Georgia, serif;
          font-size: 52px;
          font-weight: 700;
          color: #000000;
          margin: 0 0 24px 0;
          letter-spacing: -0.5px;
        }

        .timer-display {
          font-family: 'Times New Roman', Times, Georgia, serif;
          font-size: 26px;
          color: #000000;
          margin: 0 0 32px 0;
          font-weight: 400;
        }

        .timer-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
        }

        .timer-btn {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #000000;
          padding: 12px 28px;
          border: none;
          cursor: pointer;
          transition: transform 0.1s ease, filter 0.15s ease;
          min-width: 90px;
        }

        .timer-btn:hover {
          filter: brightness(0.92);
        }

        .timer-btn:active {
          transform: scale(0.97);
        }

        .btn-start {
          background-color: #009900;
        }

        .btn-stop {
          background-color: #ff0000;
        }

        .btn-reset {
          background-color: #eab308;
        }
      `}</style>

      <span className="timer-stars ts-1">✦</span>
      <span className="timer-stars ts-2">★</span>
      <span className="timer-stars ts-3">✦</span>
      <span className="timer-stars ts-4">★</span>

      <div className="timer-card">
        <h1 className="timer-title">Timer</h1>
        <div className="timer-display">
          {mins} mins {secs} secs
        </div>
        <div className="timer-buttons">
          <button className="timer-btn btn-start" onClick={handleStart}>
            Start
          </button>
          <button className="timer-btn btn-stop" onClick={handleStop}>
            Stop
          </button>
          <button className="timer-btn btn-reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
