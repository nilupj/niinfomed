
import { useState } from 'react';

export default function NotificationSubscribe() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        
        setSubscribed(true);
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  const subscribeToNewsletter = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      alert('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
        <button
          onClick={subscribeToNotifications}
          disabled={subscribed}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {subscribed ? 'Notifications Enabled' : 'Enable Notifications'}
        </button>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Newsletter Subscription</h3>
        <form onSubmit={subscribeToNewsletter} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
