// Dieser Code registriert den Service Worker

// Funktion, die aufgerufen wird, wenn ein Update bereitsteht
function onUpdateReady(registration) {
  console.log('Neuer Service Worker ist bereit zur Aktivierung.');
  // Sende ein Event, auf das die App hören kann
  window.dispatchEvent(new CustomEvent('swUpdateReady', { detail: registration }));
}

export function register() {
  if (
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production' // Nur in Produktion registrieren!
  ) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker erfolgreich registriert:', registration);

          // Prüfe auf Updates beim Laden der Seite
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // An diesem Punkt ist der alte Inhalt noch aktiv,
                  // aber der neue Service Worker ist installiert.
                  // Wir benachrichtigen den Benutzer, dass ein Update bereitsteht.
                  onUpdateReady(registration);
                } else {
                  // Beim ersten Mal ist alles vorab gecached.
                  console.log('Inhalt ist für Offline-Nutzung gecached.');
                }
              }
            };
          };
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