'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
}

export interface UseCountdownReturn extends CountdownState {
  start: (expiryDate: string | Date) => void;
  stop: () => void;
  reset: () => void;
  formatTime: (showSeconds?: boolean) => string;
  getTimeLeft: () => string;
}

export function useCountdown(
  initialExpiryDate?: string | Date
): UseCountdownReturn {
  const [expiryDate, setExpiryDate] = useState<string | Date | null>(
    initialExpiryDate || null
  );
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false,
  });

  const calculateTimeLeft = useCallback((targetDate: string | Date) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true,
      };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      total: difference,
      isExpired: false,
    };
  }, []);

  const start = useCallback((targetDate: string | Date) => {
    setExpiryDate(targetDate);
    setCountdown(calculateTimeLeft(targetDate));
  }, [calculateTimeLeft]);

  const stop = useCallback(() => {
    setExpiryDate(null);
  }, []);

  const reset = useCallback(() => {
    if (expiryDate) {
      setCountdown(calculateTimeLeft(expiryDate));
    }
  }, [expiryDate, calculateTimeLeft]);

  const formatTime = useCallback((showSeconds: boolean = true) => {
    const { hours, minutes, seconds } = countdown;
    
    if (countdown.isExpired) {
      return 'Expiré';
    }

    if (hours > 0) {
      return showSeconds ? `${hours}h ${minutes}m ${seconds}s` : `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return showSeconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }, [countdown]);

  const getTimeLeft = useCallback(() => {
    return formatTime(false);
  }, [formatTime]);

  useEffect(() => {
    if (!expiryDate) return;

    const updateCountdown = () => {
      setCountdown(calculateTimeLeft(expiryDate));
    };

    // Initial calculation
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, calculateTimeLeft]);

  return {
    ...countdown,
    start,
    stop,
    reset,
    formatTime,
    getTimeLeft,
  };
}
