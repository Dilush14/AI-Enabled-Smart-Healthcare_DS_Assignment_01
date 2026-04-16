import VideoConsultationPlaceholder from '../../components/VideoConsultationPlaceholder';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VideoConsultation() {
  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <Link to="/patient/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors font-medium">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back
      </Link>
      <div className="flex-1 w-full max-w-5xl mx-auto">
        <VideoConsultationPlaceholder doctorName="Dr. Sarah Jenkins" patientName="John Doe" isDoctor={false} />
      </div>
    </div>
  );
}
