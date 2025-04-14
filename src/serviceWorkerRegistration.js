// Dieser Code registriert den Service Worker
export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
        
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('Service Worker erfolgreich registriert:', registration);
          })
          .catch((error) => {
            console.error('Service Worker Registrierung fehlgeschlagen:', error);
          });
      });
    }
  }
  
  // Zum Abmelden des Service Workers
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }