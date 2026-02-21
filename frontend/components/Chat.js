
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('https://0.0.0.0:8000', {
      transports: ['websocket', 'polling'],
      secure: true
    });
    
    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username) {
      socketRef.current.emit('message', {
        text: message,
        username,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl">
      <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Health Chat</h3>
        <button onClick={() => setIsOpen(false)} className="text-white">×</button>
      </div>
      
      {!username ? (
        <div className="p-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && setUsername(e.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.username === username ? 'text-right' : ''}`}>
                <div className={`inline-block p-2 rounded-lg ${
                  msg.username === username ? 'bg-green-100' : 'bg-white border'
                }`}>
                  <p className="text-sm font-semibold">{msg.username}</p>
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 p-2 border rounded"
              />
              <button 
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
