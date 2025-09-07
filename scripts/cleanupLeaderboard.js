import admin from "firebase-admin";

// Konfiguration
const BATCH_SIZE = 500; // Firestore Batch-Limit
const COLLECTION_NAME = "leaderboard";
const FLAG_FIELD = "flagged";

// Initialisiere Firebase
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('[FEHLER] Firebase-Initialisierung fehlgeschlagen:', error.message);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Löscht geflaggte Dokumente aus der Leaderboard-Sammlung.
 */
async function deleteFlaggedLeaderboardEntries() {
  try {
    console.log(`[INFO] Suche in '${COLLECTION_NAME}' nach geflaggten Einträgen...`);
    
    const snapshot = await db.collection(COLLECTION_NAME)
      .where(FLAG_FIELD, "==", true)
      .get();
      
    if (snapshot.empty) {
      console.log(`[INFO] Keine geflaggten Einträge in '${COLLECTION_NAME}' gefunden.`);
      return;
    }
    
    console.log(`[INFO] ${snapshot.size} geflaggte Einträge in '${COLLECTION_NAME}' zum Löschen gefunden.`);
    
    const totalBatches = Math.ceil(snapshot.size / BATCH_SIZE);
    let deletedCount = 0;
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const batch = db.batch();
      const batchStart = batchNum * BATCH_SIZE;
      const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, snapshot.size);
      
      console.log(`[INFO] Verarbeite Batch ${batchNum + 1}/${totalBatches} (${batchStart} bis ${batchEnd - 1})`);
      
      for (let i = batchStart; i < batchEnd; i++) {
        batch.delete(snapshot.docs[i].ref);
      }
      
      await batch.commit();
      const numDeleted = batchEnd - batchStart;
      deletedCount += numDeleted;
      console.log(`[INFO] Batch ${batchNum + 1} abgeschlossen: ${numDeleted} Einträge gelöscht`);
    }
    
    console.log(`[ERFOLG] Bereinigung für geflaggte Einträge in '${COLLECTION_NAME}' abgeschlossen. Insgesamt ${deletedCount} Einträge gelöscht.`);
  } catch (error) {
    console.error(`[FEHLER] Fehler beim Löschen geflaggter Einträge aus '${COLLECTION_NAME}':`, error);
    process.exit(1);
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    await deleteFlaggedLeaderboardEntries();
    console.log('[ERFOLG] Leaderboard-Bereinigung erfolgreich abgeschlossen.');
  } catch (error) {
    console.error('[FEHLER] Ein Fehler ist während der Leaderboard-Bereinigung aufgetreten.', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
    console.log('[INFO] Firebase-Verbindung geschlossen.');
    process.exit(0);
  }
}

main();