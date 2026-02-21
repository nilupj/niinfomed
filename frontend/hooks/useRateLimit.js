
import { useState, useEffect, useCallback } from 'react';

export const useRateLimit = (key, limit = 5, windowMs = 60000) => {
  const [attempts, setAttempts] = useState([]);
  const [isLimited, setIsLimited] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  useEffect(() => {
    // Load attempts from localStorage
    const stored = localStorage.getItem(`ratelimit_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setAttempts(parsed.filter(timestamp => Date.now() - timestamp < windowMs));
    }
  }, [key, windowMs]);

  useEffect(() => {
    // Clean up old attempts
    const interval = setInterval(() => {
      const now = Date.now();
      const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
      
      if (validAttempts.length !== attempts.length) {
        setAttempts(validAttempts);
        localStorage.setItem(`ratelimit_${key}`, JSON.stringify(validAttempts));
      }

      setIsLimited(validAttempts.length >= limit);
      
      if (validAttempts.length >= limit) {
        const oldestAttempt = Math.min(...validAttempts);
        const resetTime = Math.max(0, windowMs - (now - oldestAttempt));
        setTimeUntilReset(Math.ceil(resetTime / 1000));
      } else {
        setTimeUntilReset(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempts, key, limit, windowMs]);

  const attempt = useCallback(() => {
    const now = Date.now();
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (validAttempts.length >= limit) {
      setIsLimited(true);
      return false;
    }

    const newAttempts = [...validAttempts, now];
    setAttempts(newAttempts);
    localStorage.setItem(`ratelimit_${key}`, JSON.stringify(newAttempts));
    return true;
  }, [attempts, key, limit, windowMs]);

  const reset = useCallback(() => {
    setAttempts([]);
    setIsLimited(false);
    localStorage.removeItem(`ratelimit_${key}`);
  }, [key]);

  return {
    attempt,
    reset,
    isLimited,
    timeUntilReset,
    remainingAttempts: Math.max(0, limit - attempts.length),
  };
};
