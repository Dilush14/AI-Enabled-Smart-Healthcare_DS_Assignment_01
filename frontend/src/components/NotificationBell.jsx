import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ChevronDown, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationService } from '../services/api';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef(null);

  const loadUnreadCount = async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      const count = Number(response?.unreadCount ?? response?.data?.unreadCount ?? 0);
      if (Number.isFinite(count)) {
        setUnreadCount(count);
      }
    } catch {
      // Keep current badge value when count fetch fails.
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await NotificationService.getNotifications();
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setNotifications(list);
      if (typeof response?.unreadCount === 'number') {
        setUnreadCount(response.unreadCount);
      } else {
        setUnreadCount(list.filter((item) => !(item.isRead ?? item.readAt)).length);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  useEffect(() => {
    loadUnreadCount();
    const intervalId = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markSingleAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update notifications');
    }
  };

  const goToNotificationsPage = () => {
    const section = (location.pathname.split('/')[1] || '').toLowerCase();
    const allowedSections = ['patient', 'doctor', 'admin'];
    const roleSection = allowedSections.includes(section) ? section : 'patient';
    setOpen(false);
    navigate(`/${roleSection}/notifications`);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative bg-white p-2 border border-gray-200 rounded-xl text-gray-600 hover:text-primary transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-text">Notifications</h3>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadNotifications}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-primary"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-5 flex items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading notifications...
              </div>
            )}

            {!loading && error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="p-5 text-sm text-gray-500">No notifications yet.</div>
            )}

            {!loading && notifications.map((item) => {
              const isRead = item.isRead ?? Boolean(item.readAt);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => markSingleAsRead(item._id)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isRead ? 'bg-white' : 'bg-primary/5'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isRead ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                          {item.type?.replaceAll('_', ' ') || 'notification'}
                        </span>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                      </div>
                      <h4 className="text-sm font-bold text-text truncate">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{formatTime(item.createdAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Click a notification to mark it read.</span>
            <button
              type="button"
              onClick={goToNotificationsPage}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ChevronDown className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}