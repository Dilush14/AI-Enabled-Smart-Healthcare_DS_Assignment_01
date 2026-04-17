import { useEffect, useRef, useState } from 'react';
import { Phone, Download, Copy, CheckCircle } from 'lucide-react';

export default function TelemedicineRoom({ sessionId, meetingLink, patientName, doctorName }) {
  const [status, setStatus] = useState('scheduled');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load Jitsi Meet script if not already loaded
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize Jitsi Meet after script loads
    const initializeJitsi = () => {
      if (!window.JitsiMeetExternalAPI || !containerRef.current) return;

      const roomName = meetingLink.split('/').pop();
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          displayName: patientName || 'Patient'
        },
        configOverwrite: {
          startAudioOnly: false,
          disableAudioLevels: true,
        },
        interfaceConfigOverwrite: {
          DEFAULT_BACKGROUND: '#474747',
          SHOW_JITSI_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'download',
            'help',
            'mute-everyone',
            'mute-video-everyone'
          ],
        }
      };

      try {
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
        setStatus('active');

        api.on('videoConferenceLeft', () => {
          setStatus('ended');
        });

        return () => {
          api.dispose();
        };
      } catch (error) {
        console.error('Error initializing Jitsi:', error);
      }
    };

    // Wait for script to load
    const timer = setTimeout(() => {
      initializeJitsi();
    }, 1000);

    return () => clearTimeout(timer);
  }, [meetingLink, patientName]);

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Jitsi Meet Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '650px' }}
      />

      {/* Meeting Info Overlay */}
      <div className="fixed bottom-6 left-6 right-6 flex items-center justify-between bg-white rounded-lg shadow-lg p-4 z-50">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{patientName}</span>
            {' '}connecting with{' '}
            <span className="font-semibold">{doctorName || 'Doctor'}</span>
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
              <input
                type="text"
                value={meetingLink}
                readOnly
                className="bg-transparent outline-none w-full"
              />
              <button
                onClick={copyMeetingLink}
                className="hover:text-blue-600 transition"
              >
                {showCopySuccess ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            {status === 'active' ? 'Live' : status === 'scheduled' ? 'Starting...' : 'Ended'}
          </div>
        </div>
      </div>
    </div>
  );
}
