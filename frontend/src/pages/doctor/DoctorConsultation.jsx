import VideoConsultationPlaceholder from '../../components/VideoConsultationPlaceholder';
import { ChevronLeft, Send, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function DoctorConsultation() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10 w-full">
        <Link to="/doctor/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors font-bold">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            In Progress
          </span>
          <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold">
            05:23
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full flex-1 min-h-0 w-full">
        <div className="flex-1 min-h-0 h-full w-full">
          <VideoConsultationPlaceholder isDoctor={true} doctorName="Dr. Sarah Jenkins" patientName="John Doe" />
        </div>

        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col bg-white border border-gray-100 shadow-sm overflow-hidden h-full rounded-2xl md:rounded-3xl">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'notes' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
            >
              Consultation Notes
            </button>
            <button 
              onClick={() => setActiveTab('prescription')}
              className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'prescription' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
            >
              Prescription
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
            {activeTab === 'notes' ? (
              <div className="space-y-4 h-full flex flex-col">
                <textarea 
                  className="w-full flex-1 p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-white shadow-inner font-medium text-text leading-relaxed"
                  placeholder="Type doctors notes, symptoms, and private observations here. These are not visible to the patient."
                ></textarea>
                <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-primary/20">
                  <Save className="w-5 h-5" /> Save Internal Notes
                </button>
              </div>
            ) : (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex-1 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Diagnosis</label>
                    <input type="text" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium shadow-sm" placeholder="E.g. Mild Hypertension" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Medication</label>
                    <textarea 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[140px] font-medium shadow-sm leading-relaxed"
                      placeholder="1. Lisinopril 10mg, take 1 tablet daily.&#10;2. Vitamin D3 1000IU daily."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Follow-up Advice</label>
                     <textarea 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] font-medium shadow-sm leading-relaxed"
                      placeholder="Reduce sodium intake. Return to clinic in 3 weeks."
                    ></textarea>
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-primary/30 transition-all hover:-translate-y-0.5 mt-auto">
                  <Send className="w-5 h-5" /> Issue Digital Prescription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
