
import { useState, useEffect } from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import { sanitizeEmail } from '../utils/sanitize';

export default function NewsletterModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { attempt, isLimited, timeUntilReset, remainingAttempts } = useRateLimit(
    'newsletter-subscribe',
    3,
    300000 // 5 minutes
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Rate limiting check
    if (isLimited) {
      setError(`Too many attempts. Please wait ${timeUntilReset} seconds.`);
      return;
    }
    
    if (!attempt()) {
      setError('Too many subscription attempts. Please try again later.');
      return;
    }
    
    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API call to subscribe to newsletter
      const response = await fetch('/cms-api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      setSubmitted(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
        setError('');
      }, 2500);
    } catch (err) {
      setError('Subscription failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left side - Illustration */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 md:w-1/2 flex items-center justify-center">
            <div className="relative w-full max-w-xs">
              {/* Decorative cards */}
              <div className="absolute -top-4 -left-4 w-20 h-24 bg-pink-200 rounded-lg shadow-md transform -rotate-6 flex items-center justify-center">
                <svg viewBox="0 0 50 50" className="w-12 h-12">
                  <path fill="#ef4444" d="M25 39.7l-1.6-1.4C14.7 30.5 10 26.2 10 21c0-4.4 3.4-8 7.5-8 2.4 0 4.7 1.1 6.5 3 1.8-1.9 4.1-3 6.5-3 4.1 0 7.5 3.6 7.5 8 0 5.2-4.7 9.5-13.4 17.3L25 39.7z"/>
                </svg>
              </div>

              {/* Main plant pot illustration */}
              <div className="relative z-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl p-8 shadow-lg">
                {/* Plant pot */}
                <div className="text-center">
                  <div className="inline-block">
                    {/* Plant leaves */}
                    <div className="relative mb-4">
                      <svg viewBox="0 0 120 100" className="w-32 h-28 mx-auto">
                        {/* Center leaf */}
                        <ellipse cx="60" cy="15" rx="14" ry="22" fill="#0d9488" opacity="0.9"/>
                        {/* Left leaf */}
                        <path d="M60 70 Q35 45, 40 20" fill="none" stroke="#0d9488" strokeWidth="4"/>
                        <ellipse cx="40" cy="20" rx="16" ry="24" fill="#14b8a6" opacity="0.9"/>
                        {/* Right leaf */}
                        <path d="M60 70 Q85 45, 80 20" fill="none" stroke="#0d9488" strokeWidth="4"/>
                        <ellipse cx="80" cy="20" rx="16" ry="24" fill="#14b8a6" opacity="0.9"/>
                      </svg>
                    </div>
                    
                    {/* Pot */}
                    <div className="w-28 h-24 mx-auto bg-white rounded-b-3xl shadow-inner relative">
                      {/* Pot rim */}
                      <div className="absolute -top-2 left-0 right-0 h-4 bg-white rounded-t-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Dumbbells decoration */}
                <div className="absolute -bottom-4 right-4">
                  <svg viewBox="0 0 70 35" className="w-16 h-8">
                    <rect x="6" y="12" width="10" height="10" rx="2" fill="#ef4444"/>
                    <rect x="54" y="12" width="10" height="10" rx="2" fill="#ef4444"/>
                    <rect x="16" y="15" width="38" height="5" rx="2" fill="#dc2626"/>
                    <circle cx="11" cy="11" r="2.5" fill="#ef4444"/>
                    <circle cx="11" cy="23" r="2.5" fill="#ef4444"/>
                    <circle cx="59" cy="11" r="2.5" fill="#ef4444"/>
                    <circle cx="59" cy="23" r="2.5" fill="#ef4444"/>
                  </svg>
                </div>
              </div>

              {/* Medical supplies decoration */}
              <div className="absolute -top-2 -right-2 w-14 h-14 bg-cyan-400 rounded-lg shadow-md p-2 transform rotate-12">
                <svg viewBox="0 0 50 50" className="w-full h-full text-white">
                  <rect x="10" y="22" width="30" height="6" rx="2" fill="currentColor"/>
                  <rect x="22" y="10" width="6" height="30" rx="2" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="p-8 md:w-1/2">
            {!submitted ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  The best of health and wellness
                </h2>
                <p className="text-gray-600 text-base mb-6">
                  We do the research so you don't have to. Stay in the know with the latest in health and wellness.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLimited}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  {isLimited && (
                    <p className="text-sm text-amber-600">
                      Rate limit exceeded. Try again in {timeUntilReset} seconds.
                    </p>
                  )}

                  {!isLimited && remainingAttempts <= 1 && (
                    <p className="text-xs text-gray-500">
                      {remainingAttempts} attempt remaining
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || isLimited}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>

                  <p className="text-sm text-gray-600 text-center mt-4">
                    Sign up for Nutrition Edition newsletter
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Your <a href="/privacy" className="underline hover:text-cyan-600">privacy</a> is important to us
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                <p className="text-gray-600">You've successfully subscribed to our newsletter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
