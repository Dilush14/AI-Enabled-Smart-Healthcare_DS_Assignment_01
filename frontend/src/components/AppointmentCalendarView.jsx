import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatMonthLabel = (value) =>
  value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const formatReadableDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown Date';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return 'bg-green-50 text-green-700 border-green-200';
  if (normalized === 'confirmed') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (normalized === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
};

export default function AppointmentCalendarView({ title, subtitle, appointments = [], loading, error }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState(() => toKey(new Date()));

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const key = toKey(appointment.date);
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(appointment);
      return acc;
    }, {});
  }, [appointments]);

  const calendarDays = useMemo(() => {
    const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startOffset = first.getDay();
    const startDate = new Date(first);
    startDate.setDate(first.getDate() - startOffset);

    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = toKey(date);
      const inCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isSelected = key === selectedDayKey;
      const count = appointmentsByDay[key]?.length || 0;
      return { key, date, inCurrentMonth, isSelected, count };
    });
  }, [currentMonth, selectedDayKey, appointmentsByDay]);

  const selectedAppointments = useMemo(() => {
    const list = appointmentsByDay[selectedDayKey] || [];
    return [...list].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
  }, [appointmentsByDay, selectedDayKey]);

  const selectedDateLabel = formatReadableDate(selectedDayKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading appointments...</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-bold text-lg text-text">{formatMonthLabel(currentMonth)}</h2>
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDayKey(day.key)}
                  className={`h-20 rounded-xl border p-2 text-left transition-all ${
                    day.isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : day.inCurrentMonth
                        ? 'border-gray-100 hover:border-primary/40 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50/70 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{day.date.getDate()}</span>
                    {day.count > 0 && (
                      <span className="text-xs font-bold bg-primary text-white px-1.5 py-0.5 rounded-md">
                        {day.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-text">{selectedDateLabel}</h3>
          </div>

          <div className="p-5 space-y-3 max-h-130 overflow-y-auto">
            {selectedAppointments.length === 0 && (
              <p className="text-sm text-gray-500">No appointments on this day.</p>
            )}

            {selectedAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-text">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {appointment.time || 'Time not set'}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border ${statusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="font-bold text-text">{appointment.counterpartyName}</p>
                <p className="text-sm text-gray-500">{appointment.counterpartyMeta}</p>
                <p className="text-xs text-gray-500 mt-1">{appointment.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
