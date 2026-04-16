import { Calendar as CalendarIcon, Clock, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function BookAppointment() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('Today, Oct 24');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Video Consult');
  const [reason, setReason] = useState('');

  const dates = ['Today, Oct 24', 'Tomorrow, Oct 25', 'Mon, Oct 26', 'Tue, Oct 27'];
  const times = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', '02:00 PM'];

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-text mb-4">Appointment Confirmed!</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          Your {appointmentType.toLowerCase()} with Dr. Sarah Jenkins is confirmed for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/patient/dashboard" className="bg-primary hover:bg-secondary text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm shadow-primary/30">
            Go to Dashboard
          </Link>
          <button className="bg-white border border-gray-200 text-gray-700 hover:border-gray-300 px-8 py-3.5 rounded-xl font-bold transition-all">
            Add to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => step === 1 ? window.history.back() : setStep(1)} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-text">
          {step === 1 ? 'Book Appointment' : 'Payment Details'}
        </h1>
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Select Date
            </h2>
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`min-w-[120px] p-4 rounded-2xl border text-center transition-all ${
                    selectedDate === date 
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm shadow-primary/10' 
                      : 'border-gray-100 bg-white text-gray-500 hover:border-primary/30'
                  }`}
                >
                  <span className="block text-sm mb-1">{date.split(',')[0]}</span>
                  <span className="block text-lg">{date.split(',')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Select Time
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {times.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    selectedTime === time 
                      ? 'border-primary bg-primary text-white font-bold shadow-md shadow-primary/20' 
                      : 'border-gray-100 bg-white text-gray-600 hover:border-primary/50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text mb-4">Consultation Type</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setAppointmentType('Video Consult')}
                  className={`flex-1 py-4 px-4 rounded-xl font-bold border-2 transition-all ${
                    appointmentType === 'Video Consult' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Virtual / Video Consult
                </button>
                <button 
                  onClick={() => setAppointmentType('Clinic Visit')}
                  className={`flex-1 py-4 px-4 rounded-xl font-bold border-2 transition-all ${
                    appointmentType === 'Clinic Visit' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  In-Person / Clinic Visit
                </button>
              </div>
            </div>

            <div>
              <label className="text-lg font-bold text-text mb-3 block">Reason for visit</label>
              <textarea 
                rows="4"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for visit..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 min-h-[120px]"
              ></textarea>
            </div>
          </div>

          <button 
            disabled={!selectedTime}
            onClick={() => setStep(2)}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${
              selectedTime ? 'bg-primary hover:bg-secondary text-white shadow-primary/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue to Payment
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-text mb-4">Summary</h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Doctor</span>
                <span className="font-bold">Dr. Sarah Jenkins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-bold">{selectedDate} - {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-bold">{appointmentType}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between">
                <span className="text-gray-500 font-bold">Total Fees</span>
                <span className="font-extrabold text-lg text-primary">$150.00</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-text mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer">
                <input type="radio" name="payment" className="w-4 h-4 text-primary focus:ring-primary" defaultChecked />
                <div className="font-bold text-text">Credit / Debit Card</div>
              </label>
              
              <div className="space-y-4 pl-8 pr-4">
                <input type="text" placeholder="Card Number" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50" />
                  <input type="text" placeholder="CVC" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50" />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep(3)}
            className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/30 mt-6"
          >
            Pay $150.00 & Confirm
          </button>
        </div>
      )}
    </div>
  );
}
