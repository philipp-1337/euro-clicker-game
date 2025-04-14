import { useEffect } from 'react';
import { calculateOfflineEarnings } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig'; // Importiere die gameConfig


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
      const effectiveTime = Math.min(timeDiff, gameConfig.maxOfflineTimeInSeconds); // Maximal 8 Stunden Offline-Einnahmen    
      
      if (effectiveTime > gameConfig.minimumOfflineTimeInSeconds) { // Nur anwenden wenn mehr als 10 Sekunden vergangen sind
        // Berechne potenzielle Einnahmen durch Manager während der Abwesenheit
        let offlineEarnings = 0;
        
        offlineEarnings += calculateOfflineEarnings({
          buttons,
          managers,
          offlineEarningsLevel,
          effectiveTime
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