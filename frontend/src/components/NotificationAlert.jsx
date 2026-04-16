import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotificationAlert({ title, message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Animation duration
  };

  if (!isVisible && !onClose) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full ${styles[type]}`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold">{title}</h4>
          <p className="text-sm mt-1 opacity-90">{message}</p>
        </div>
        <button onClick={handleClose} className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
