import { Download, Calendar as CalendarIcon, Filter, TrendingUp } from 'lucide-react';

export default function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Detailed performance metrics for MedikaLine.</p>
        </div>
        <div className="flex space-x-2">
           <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
             <CalendarIcon className="w-4 h-4" /> Last 30 Days
           </button>
          <button className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-primary/30">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text">Revenue Growth</h2>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 min-h-[250px] bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
             <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-xl mb-2">
                   <TrendingUp className="w-6 h-6" /> +24.5%
                </div>
                <p className="text-gray-500 font-medium">Chart Visualization Placeholder</p>
                <p className="text-sm text-gray-400 mt-1">(Imagine a beautiful Line Chart here)</p>
             </div>
          </div>
        </div>

        {/* Appointments Chart Placeholder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text">Appointments by Type</h2>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 min-h-[250px] flex items-center justify-center relative py-6">
             <div className="w-48 h-48 rounded-full border-[16px] border-primary flex items-center justify-center relative shadow-sm">
               <div className="absolute inset-[-16px] rounded-full border-[16px] border-accent transition-all hover:scale-105" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%)' }}></div>
               <div className="absolute inset-[-16px] rounded-full border-[16px] border-purple-500 transition-all hover:scale-105" style={{ clipPath: 'polygon(50% 50%, 0 100%, 0 0)' }}></div>
                <div className="text-center z-10 bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-md">
                   <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total</span>
                   <span className="text-2xl font-extrabold text-text">3,205</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary shadow-sm"></span><span className="text-sm font-bold text-gray-600 w-12">Video</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent shadow-sm"></span><span className="text-sm font-bold text-gray-600 w-12">Clinic</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span><span className="text-sm font-bold text-gray-600 w-12">Home</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
