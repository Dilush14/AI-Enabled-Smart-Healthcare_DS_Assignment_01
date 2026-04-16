import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

export default function ManageSchedule() {
  const [activeDay, setActiveDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [schedule, setSchedule] = useState({
    Monday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
    Tuesday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
    Wednesday: [{ start: '09:00', end: '13:00' }],
    Thursday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
    Friday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '16:00' }],
    Saturday: [{ start: '10:00', end: '14:00' }],
    Sunday: []
  });

  const handleAddTimeSlot = () => {
    setSchedule({
      ...schedule,
      [activeDay]: [...schedule[activeDay], { start: '00:00', end: '00:00' }]
    });
  };

  const handleRemoveTimeSlot = (index) => {
    const newDaySchedule = [...schedule[activeDay]];
    newDaySchedule.splice(index, 1);
    setSchedule({
      ...schedule,
      [activeDay]: newDaySchedule
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Manage Schedule</h1>
          <p className="text-gray-500 mt-1">Set your weekly availability for patient appointments.</p>
        </div>
        <button className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-primary/30">
          <Save className="w-5 h-5" /> Save Schedule
        </button>
      </div>

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
                <input type="checkbox" className="sr-only peer" defaultChecked={schedule[activeDay].length > 0} />
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
                     <input type="time" defaultValue={slot.start} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-text shadow-inner transition-all" />
                   </div>
                   <div className="pt-6 hidden sm:block text-gray-400 font-bold">-</div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">End Time</label>
                     <input type="time" defaultValue={slot.end} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-text shadow-inner transition-all" />
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
