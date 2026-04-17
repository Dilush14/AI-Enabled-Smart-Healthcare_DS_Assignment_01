import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MessageSquare, Users, Settings } from 'lucide-react';
import { useState } from 'react';

export default function VideoConsultationPlaceholder({ doctorName = "Dr. Sarah Jenkins", patientName = "John Doe", isDoctor = false }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[600px] relative w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 w-2.5 h-2.5 rounded-full animate-pulse"></div>
          <span className="text-white font-medium text-sm bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
            12:45
          </span>
        </div>
        <div className="flex gap-2">
          <button className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(isDoctor ? patientName : doctorName)}&background=374151&color=fff&size=200`}
            alt="Main User"
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-700 shadow-xl"
          />
          <h3 className="text-white text-xl font-medium">{isDoctor ? patientName : doctorName}</h3>
          <p className="text-gray-400 mt-1">{isDoctor ? 'Patient' : 'Doctor'}</p>
        </div>

        {/* Self View (Picture in Picture) */}
        <div className="absolute bottom-6 right-6 w-32 sm:w-48 h-24 sm:h-32 bg-gray-800 rounded-2xl border-2 border-gray-700 overflow-hidden shadow-lg flex items-center justify-center">
          {isVideoOff ? (
            <div className="text-white bg-gray-700 w-full h-full flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          ) : (
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(isDoctor ? doctorName : patientName)}&background=0EA5E9&color=fff&size=200`}
              alt="Self"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs backdrop-blur-sm">
            You
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 sm:p-6 flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 sm:p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
        >
          {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
        
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-3 sm:p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 text-white p-3 sm:p-4 rounded-full transition-colors hidden sm:block">
          <MonitorUp className="w-6 h-6" />
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 text-white p-3 sm:p-4 rounded-full transition-colors hidden sm:block">
          <MessageSquare className="w-6 h-6" />
        </button>

        <button className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold flex items-center gap-2 transition-colors ml-2 sm:ml-4 shadow-lg shadow-red-500/20">
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline">End Call</span>
        </button>
      </div>
    </div>
  );
}
