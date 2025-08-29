import { useState, useEffect } from 'react';

export const usePwaPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    const userAgent = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isStandalone = 'standalone' in window.navigator && window.navigator.standalone;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
    }
  };

  const handleDismissClick = () => {
    setShowInstallPrompt(false);
  };

  return { showInstallPrompt, isIos, handleInstallClick, handleDismissClick };
};
