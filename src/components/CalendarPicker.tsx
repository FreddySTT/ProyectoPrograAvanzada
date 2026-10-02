import { useState, useEffect, useRef } from "react";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  label: string;
}

interface CalendarPickerProps {
  isOpen: boolean;
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export function CalendarPicker({ isOpen, value, onChange, onClose }: CalendarPickerProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);

  const initialDate = value.startDate || new Date(2026, 9, 15);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const [tempStart, setTempStart] = useState<Date | null>(value.startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(value.endDate);

  useEffect(() => {
    setTempStart(value.startDate);
    setTempEnd(value.endDate);
    if (value.startDate) {
      setCurrentMonth(value.startDate.getMonth());
      setCurrentYear(value.startDate.getFullYear());
    }
  }, [value, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = (firstDayIndex + 6) % 7;

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clickedDate);
      setTempEnd(null);
    } else {
      if (clickedDate.getTime() < tempStart.getTime()) {
        setTempStart(clickedDate);
        setTempEnd(null);
      } else if (clickedDate.getTime() === tempStart.getTime()) {
        setTempEnd(clickedDate);
      } else {
        setTempEnd(clickedDate);
      }
    }
  };

  const formatShort = (d: Date) => {
    const day = d.getDate();
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${day} ${months[d.getMonth()]}`;
  };

  const calculateNights = () => {
    if (!tempStart || !tempEnd) return 0;
    const diffTime = Math.abs(tempEnd.getTime() - tempStart.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const applySelection = () => {
    if (tempStart && tempEnd) {
      const nights = calculateNights();
      const label = `${formatShort(tempStart)} — ${formatShort(tempEnd)} (${nights} ${nights === 1 ? "noche" : "noches"})`;
      onChange({ startDate: tempStart, endDate: tempEnd, label });
    } else if (tempStart) {
      const label = `${formatShort(tempStart)} (1 día)`;
      onChange({ startDate: tempStart, endDate: tempStart, label });
    }
    onClose();
  };

  const applyPreset = (preset: "weekend" | "nextWeek" | "week") => {
    let start: Date;
    let end: Date;

    if (preset === "weekend") {
      start = new Date(currentYear, currentMonth, 17);
      end = new Date(currentYear, currentMonth, 19);
    } else if (preset === "nextWeek") {
      start = new Date(currentYear, currentMonth, 20);
      end = new Date(currentYear, currentMonth, 24);
    } else {
      start = new Date(currentYear, currentMonth, 12);
      end = new Date(currentYear, currentMonth, 19);
    }
    setTempStart(start);
    setTempEnd(end);
    const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    onChange({ startDate: start, endDate: end, label: `${formatShort(start)} — ${formatShort(end)} (${nights} noches)` });
    onClose();
  };

  const clearSelection = () => {
    setTempStart(null);
    setTempEnd(null);
    onChange({ startDate: null, endDate: null, label: "Elegir fechas" });
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isInRange = (day: number) => {
    if (!tempStart || !tempEnd) return false;
    const current = new Date(currentYear, currentMonth, day).getTime();
    return current > tempStart.getTime() && current < tempEnd.getTime();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        role="dialog"
        aria-modal="true"
        aria-label="Selector de fechas de viaje"
        className="relative w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] border-2 border-[#D81B60]/30 animate-in zoom-in-95 duration-200"
      >
        {/* Aguayo decorative top line */}
        <div className="aguayo-strip -mx-6 -mt-6 mb-5 h-2.5 rounded-t-3xl" />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="font-subtitle text-xs font-bold uppercase tracking-wider text-[#F7931E]">
              Planifica tu estadía
            </span>
            <h3 className="font-subtitle text-lg font-bold text-[#37474F]">
              ¿Cuándo quieres viajar?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar calendario"
            className="grid h-8 w-8 place-items-center rounded-full bg-[#FAF7F2] text-[#37474F] hover:bg-[#F5E6D3] hover:text-[#D81B60] transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("weekend")}
            className="rounded-full border border-[#E2D9CC] bg-[#FEF4E8] px-3.5 py-1.5 text-xs font-bold text-[#F7931E] hover:border-[#F7931E] hover:bg-[#F7931E] hover:text-white transition shadow-sm"
          >
            Fin de semana
          </button>
          <button
            type="button"
            onClick={() => applyPreset("nextWeek")}
            className="rounded-full border border-[#E2D9CC] bg-[#EBF6EE] px-3.5 py-1.5 text-xs font-bold text-[#4CAF50] hover:border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition shadow-sm"
          >
            Próxima semana
          </button>
          <button
            type="button"
            onClick={() => applyPreset("week")}
            className="rounded-full border border-[#E2D9CC] bg-[#F7EBF9] px-3.5 py-1.5 text-xs font-bold text-[#7B1FA2] hover:border-[#7B1FA2] hover:bg-[#7B1FA2] hover:text-white transition shadow-sm"
          >
            7 días completos
          </button>
        </div>

        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mes anterior"
            className="grid h-9 w-9 place-items-center rounded-full text-[#37474F] hover:bg-[#F5E6D3] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="font-subtitle text-base font-bold text-[#37474F]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mes siguiente"
            className="grid h-9 w-9 place-items-center rounded-full text-[#37474F] hover:bg-[#F5E6D3] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-[#6D4C41]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm font-semibold">
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const currentDate = new Date(currentYear, currentMonth, day);
            const isStart = isSameDay(tempStart, currentDate);
            const isEnd = isSameDay(tempEnd, currentDate);
            const inRange = isInRange(day);

            let cellClass = "relative h-9 w-full flex items-center justify-center text-xs sm:text-sm ";
            let btnClass = "h-8.5 w-8.5 rounded-full flex items-center justify-center font-bold transition ";

            if (isStart && isEnd) {
              btnClass += "bg-[#D81B60] text-white shadow-lg shadow-[#D81B60]/40 scale-105";
            } else if (isStart) {
              cellClass += "bg-gradient-to-r from-transparent to-[#FCE4EC] rounded-l-full ";
              btnClass += "bg-[#D81B60] text-white shadow-lg shadow-[#D81B60]/40 scale-105";
            } else if (isEnd) {
              cellClass += "bg-gradient-to-l from-transparent to-[#FCE4EC] rounded-r-full ";
              btnClass += "bg-[#D81B60] text-white shadow-lg shadow-[#D81B60]/40 scale-105";
            } else if (inRange) {
              cellClass += "bg-[#FCE4EC] ";
              btnClass += "text-[#D81B60] hover:bg-[#F8BBD0]";
            } else {
              btnClass += "text-[#37474F] hover:bg-[#F5E6D3]";
            }

            return (
              <div key={day} className={cellClass}>
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={btnClass}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>

        {/* Range Status Info */}
        <div className="mt-5 flex items-center justify-between border-t border-[#E2D9CC] pt-4 text-xs">
          <div>
            {tempStart && tempEnd ? (
              <div className="font-semibold text-[#37474F]">
                <div>{formatShort(tempStart)} — {formatShort(tempEnd)}</div>
                <div className="text-[#D81B60] font-bold">{calculateNights()} noches de viaje</div>
              </div>
            ) : tempStart ? (
              <span className="text-[#6D4C41] font-medium">Selecciona la fecha de regreso</span>
            ) : (
              <span className="text-[#6D4C41] font-medium">Elige las fechas deseadas</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-bold text-[#6D4C41] hover:text-[#D81B60] transition"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={applySelection}
              className="rounded-full bg-[#F7931E] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#F7931E]/30 hover:bg-[#D81B60] hover:shadow-[#D81B60]/30 transition"
            >
              Aplicar fechas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
