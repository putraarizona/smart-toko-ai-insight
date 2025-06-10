
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection periodically
    const checkConnection = async () => {
      try {
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          if (!isOnline) {
            setIsOnline(true);
            setIsReconnecting(false);
          }
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
      }
    };

    const intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  return { isOnline, isReconnecting };
};
