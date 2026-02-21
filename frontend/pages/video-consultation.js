
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import VideoConsultation from '../components/VideoConsultation';

export default function VideoConsultationPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('general');
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // In a real app, this would come from your backend
  const mockRoomUrl = 'https://your-daily-domain.daily.co/your-room';

  const handleBooking = async () => {
    try {
      // Here you would make an API call to create the booking
      // For now, we'll just simulate it
      setIsBookingConfirmed(true);
    } catch (error) {
      console.error('Error booking consultation:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Video Consultation</h1>
        
        {!isBookingConfirmed ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Schedule Your Consultation</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Consultation Type</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="general">General Consultation</option>
                  <option value="specialist">Specialist Consultation</option>
                  <option value="followup">Follow-up Visit</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Select Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a time slot</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Consultation
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <VideoConsultation
              roomUrl={mockRoomUrl}
              username="Patient"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
