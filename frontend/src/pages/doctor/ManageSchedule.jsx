import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DoctorService } from '../../services/api';

export default function ManageSchedule() {
  const [activeDay, setActiveDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const defaultSchedule = useMemo(() => ({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  }), []);

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?._id || null;
    } catch {
      return null;
    }
  };

  const toDayName = (dayKey) => dayKey.charAt(0).toUpperCase() + dayKey.slice(1).toLowerCase();

  const parseAvailability = (availability) => {
    const next = { ...defaultSchedule };

    if (!Array.isArray(availability)) {
      return next;
    }

    availability.forEach((slot) => {
      const dayName = toDayName(slot?.day || '');
      if (!next[dayName]) return;
      if (!slot?.startTime || !slot?.endTime) return;
      next[dayName].push({ start: slot.startTime, end: slot.endTime });
    });

    return next;
  };

  useEffect(() => {
    const loadAvailability = async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        setError('Unable to identify current doctor account. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const availability = await DoctorService.getAvailability(userId);
        setSchedule(parseAvailability(availability));
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load your saved schedule.');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [defaultSchedule]);

  const handleAddTimeSlot = () => {
    setSchedule({
      ...schedule,
      [activeDay]: [...schedule[activeDay], { start: '00:00', end: '00:00' }]
    });
    setSuccess('');
  };

  const handleRemoveTimeSlot = (index) => {
    const newDaySchedule = [...schedule[activeDay]];
    newDaySchedule.splice(index, 1);
    setSchedule({
      ...schedule,
      [activeDay]: newDaySchedule
    });
    setSuccess('');
  };

  const handleTimeChange = (index, field, value) => {
    const newDaySchedule = [...schedule[activeDay]];
    newDaySchedule[index] = {
      ...newDaySchedule[index],
      [field]: value
    };

    setSchedule({
      ...schedule,
      [activeDay]: newDaySchedule
    });
    setSuccess('');
  };

  const toggleDayAvailability = () => {
    const currentlyEnabled = schedule[activeDay].length > 0;
    setSchedule({
      ...schedule,
      [activeDay]: currentlyEnabled ? [] : [{ start: '09:00', end: '17:00' }]
    });
    setSuccess('');
  };

  const validateSchedule = () => {
    for (const day of days) {
      for (const slot of schedule[day]) {
        if (!slot.start || !slot.end) {
          return `Please complete all time fields for ${day}.`;
        }
        if (slot.start >= slot.end) {
          return `Start time must be earlier than end time on ${day}.`;
        }
      }
    }
    return '';
  };

  const handleSaveSchedule = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('Unable to identify current doctor account. Please sign in again.');
      return;
    }

    const validationMessage = validateSchedule();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const availability = days.flatMap((day) =>
      schedule[day].map((slot) => ({
        day: day.toLowerCase(),
        startTime: slot.start,
        endTime: slot.end,
      }))
    );

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await DoctorService.updateDoctor(userId, { availability });
      setSuccess('Schedule saved successfully. Patients can now book only these slots.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Manage Schedule</h1>
          <p className="text-gray-500 mt-1">Set your weekly availability for patient appointments.</p>
        </div>
        <button
          onClick={handleSaveSchedule}
          disabled={saving || loading}
          className="bg-primary hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-primary/30"
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
      {loading && <p className="text-sm text-gray-500">Loading saved schedule...</p>}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Days sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`w-full text-left px-4 py-3 border-2 rounded-xl font-bold transition-all flex justify-between items-center ${
                activeDay === day 
                  ? 'bg-white border-primary text-primary shadow-sm' 
                  : 'text-gray-600 hover:bg-white border-transparent'
              }`}
            >
              {day}
              {schedule[day].length === 0 && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">Off</span>}
            </button>
          ))}
        </div>

        {/* Time slots editor */}
        <div className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> {activeDay}'s Availability
            </h2>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl shadow-inner border border-gray-100">
              <span className="text-sm font-bold text-gray-600">Accepting Appointments</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={schedule[activeDay].length > 0}
                  onChange={toggleDayAvailability}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {schedule[activeDay].length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">You are marked as unavailable</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto font-medium">Patients will not be able to book appointments on this day.</p>
              <button 
                onClick={handleAddTimeSlot}
                className="bg-primary/10 hover:bg-primary/20 text-primary font-bold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Time Slot
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedule[activeDay].map((slot, index) => (
                 <div key={index} className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-2xl shadow-sm">
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Start Time</label>
                     <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-text shadow-inner transition-all"
                     />
                   </div>
                   <div className="pt-6 hidden sm:block text-gray-400 font-bold">-</div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">End Time</label>
                     <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-text shadow-inner transition-all"
                     />
                   </div>
                   <div className="pt-6">
                     <button 
                      onClick={() => handleRemoveTimeSlot(index)}
                      className="p-3 text-red-500 hover:bg-red-50 bg-white border border-gray-200 rounded-xl transition-all hover:border-red-200 shadow-sm"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
              ))}
              
              <button 
                onClick={handleAddTimeSlot}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-bold flex items-center justify-center gap-2 mt-6"
              >
                <Plus className="w-5 h-5" /> Add Another Block
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
