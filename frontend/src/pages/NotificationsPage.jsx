import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Loader2, RefreshCw, X } from 'lucide-react';
import { NotificationService } from '../services/api';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !(item.isRead ?? item.readAt)).length,
    [notifications]
  );

  const loadNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const response = await NotificationService.getNotifications({ unreadOnly });
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setNotifications(list);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly]);

  const markSingleAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      await loadNotifications(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update notification');
    }
  };

  const handleNotificationClick = (item) => {
    setSelectedNotification(item);
    if (!(item.isRead ?? item.readAt)) {
      markSingleAsRead(item._id);
    }
  };

  const detailPairs = useMemo(() => {
    const metadata = selectedNotification?.metadata || {};
    const pairs = [];

    const pushPair = (label, value) => {
      if (value) pairs.push({ label, value });
    };

    pushPair('Patient name', metadata.patientName);
    pushPair('Doctor name', metadata.doctorName);
    pushPair('Actor', metadata.uploadedBy || metadata.cancelledBy);
    pushPair('Appointment label', metadata.appointmentLabel);
    pushPair('Appointment ID', metadata.appointmentId);
    pushPair('Session ID', metadata.sessionId);
    pushPair('Report ID', metadata.reportId);
    pushPair('Payment ID', metadata.paymentId);
    pushPair('Meeting link', metadata.meetingLink);
    pushPair('Report type', metadata.reportType);
    pushPair('Status', metadata.status || selectedNotification?.type);
    pushPair('Analysis source', metadata.analysisSource);
    pushPair('Confidence score', metadata.confidenceScore != null ? `${metadata.confidenceScore}%` : '');

    return pairs;
  }, [selectedNotification]);

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      await loadNotifications(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update notifications');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Track all updates between patient and doctor activities.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${unreadOnly ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            {unreadOnly ? 'Showing unread only' : 'Show unread only'}
          </button>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">{notifications.length} notifications</p>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center text-gray-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-gray-500 text-center">No notifications found.</div>
          ) : (
            notifications.map((item) => {
              const isRead = item.isRead ?? Boolean(item.readAt);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
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
                      <p className="text-sm text-gray-600 mt-0.5">{item.message}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{formatTime(item.createdAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {selectedNotification.type?.replaceAll('_', ' ') || 'notification'}
                </p>
                <h2 className="text-xl font-bold text-text mt-1">{selectedNotification.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{formatTime(selectedNotification.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedNotification.message}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {detailPairs.length === 0 ? (
                  <div className="md:col-span-2 text-sm text-gray-500 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    No extra details were provided for this notification.
                  </div>
                ) : detailPairs.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-text mt-1 break-words">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!(selectedNotification.isRead ?? selectedNotification.readAt) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await markSingleAsRead(selectedNotification._id);
                      setSelectedNotification((current) => current ? { ...current, isRead: true, readAt: current.readAt || new Date().toISOString() } : null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
