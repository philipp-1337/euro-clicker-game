import { useEffect } from 'react';

export default function useOfflineEarnings({ 
  offlineEarningsLevel, 
  managers, 
  buttons, 
  setMoney 
}) {
  useEffect(() => {
    if (offlineEarningsLevel > 0) {
      const lastOnlineTimeKey = 'clicker_lastOnlineTime';
      const now = Date.now();
      
      // Zeit aus LocalStorage laden
      const storedTime = localStorage.getItem(lastOnlineTimeKey);
      const lastOnlineTime = storedTime ? parseInt(storedTime) : now;
      
      const timeDiff = (now - lastOnlineTime) / 1000; // Sekunden seit letztem Besuch
      const maxOfflineTime = 3600 * 8; // Maximal 8 Stunden Offline-Einnahmen
      const effectiveTime = Math.min(timeDiff, maxOfflineTime);
      
      if (effectiveTime > 10) { // Nur anwenden wenn mehr als 10 Sekunden vergangen sind
        // Berechne potenzielle Einnahmen durch Manager während der Abwesenheit
        let offlineEarnings = 0;
        
        buttons.forEach((button, index) => {
          if (managers[index]) {
            // Einnahmen = Button-Wert * (Zeit / Cooldown-Zeit) * Offline-Earnings-Faktor
            const offlineFactor = 0.2 + (offlineEarningsLevel * 0.1); // 20% + 10% pro Level
            const earningsPerSecond = button.value / button.cooldownTime;
            offlineEarnings += earningsPerSecond * effectiveTime * offlineFactor;
          }
        });
        
        if (offlineEarnings > 0) {
          setMoney(prev => prev + offlineEarnings);
          // Hier könnte man eine Benachrichtigung anzeigen
          console.log(`Du hast ${offlineEarnings.toLocaleString("en-GB", { minimumFractionDigits: 2 })} € während deiner Abwesenheit verdient!`);
        }
      }
      
      // Event-Listener für beim Verlassen der Seite
      const handleBeforeUnload = () => {
        localStorage.setItem(lastOnlineTimeKey, Date.now().toString());
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Aktuelle Zeit speichern (falls der Benutzer die Seite nicht normal verlässt)
      const saveTimeInterval = setInterval(handleBeforeUnload, 60000); // Jede Minute speichern
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        clearInterval(saveTimeInterval);
        handleBeforeUnload(); // Zeit beim Aushängen speichern
      };
    }
  }, [offlineEarningsLevel, managers, buttons, setMoney]);
}