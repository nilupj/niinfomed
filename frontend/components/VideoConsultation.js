
import { useState, useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

export default function VideoConsultation({ roomUrl, username, onSubmit }) {
  const frameRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    if (!roomUrl || frameRef.current) return;

    const initDaily = async () => {
      try {
        frameRef.current = DailyIframe.createFrame({
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '12px',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        frameRef.current.on('joined-meeting', () => setIsCallActive(true));
        frameRef.current.on('left-meeting', () => setIsCallActive(false));

        setCallFrame(frameRef.current);
        await frameRef.current.join({ url: roomUrl, userName: username });
      } catch (error) {
        console.error('Error initializing DailyIframe:', error);
      }
    };

    initDaily();

    return () => {
      if (frameRef.current) {
        frameRef.current.destroy();
        frameRef.current = null;
        setCallFrame(null);
        setIsCallActive(false);
      }
    };
  }, [roomUrl, username]);

  const toggleAudio = () => {
    if (callFrame) {
      callFrame.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (callFrame) {
      callFrame.setLocalVideo(!isCameraOff);
      setIsCameraOff(!isCameraOff);
    }
  };

  const leaveCall = () => {
    if (callFrame) {
      callFrame.leave();
    }
  };

  return (
    <div className="container-custom py-8">
      {!isCallActive ? (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">Video Consultation</h1>
          <p className="text-neutral-600 mb-8">
            Connect with our healthcare professionals through secure video consultations. Book
            your appointment by filling out the form below.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Book Video Consultation</h2>
            <p className="text-neutral-600 mb-6">Consultation Fee: ₹499</p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full border-neutral-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full border-neutral-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="w-full border-neutral-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-neutral-700 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                    className="w-full border-neutral-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-neutral-700 mb-1">Reason for Consultation</label>
                  <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    required
                    rows={4}
                    className="w-full border-neutral-300 rounded-md shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
          <div className="h-full">
            <div id="video-container" className="w-full h-[calc(100%-80px)]"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur flex items-center justify-center space-x-4 px-4">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isCameraOff ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
              </button>

              <button
                onClick={leaveCall}
                className="p-3 rounded-full bg-red-500 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
