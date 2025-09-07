import admin from "firebase-admin";

// Konfiguration
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '7', 10);
const BATCH_SIZE = 500; // Firestore Batch-Limit
const COLLECTION_NAME = "saves";
const TIMESTAMP_FIELD = "updatedAt";

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
 * Löscht Dokumente, die älter als die angegebene Anzahl von Tagen sind
 */
async function deleteOldSaves() {
  try {
    console.log(`[INFO] Suche nach Einträgen, die älter als ${RETENTION_DAYS} Tage sind...`);
    
    const cutoffDate = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    console.log(`[INFO] Grenzwertdatum: ${new Date(cutoffDate).toISOString()}`);
    
    // Hole alle Dokumente, die älter als der Schwellenwert sind
    const snapshot = await db.collection(COLLECTION_NAME)
      .where(TIMESTAMP_FIELD, "<", cutoffDate)
      .get();
    
    if (snapshot.empty) {
      console.log("[INFO] Keine alten Einträge gefunden, die gelöscht werden müssten.");
      return;
    }
    
    console.log(`[INFO] ${snapshot.size} Einträge zum Löschen gefunden.`);
    
    // Teile die Dokumente in Batches auf, wenn es mehr als BATCH_SIZE sind
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
      deletedCount += (batchEnd - batchStart);
      console.log(`[INFO] Batch ${batchNum + 1} abgeschlossen: ${batchEnd - batchStart} Einträge gelöscht`);
    }
    
    console.log(`[ERFOLG] Bereinigung abgeschlossen. Insgesamt ${deletedCount} Einträge gelöscht.`);
  } catch (error) {
    console.error('[FEHLER] Fehler beim Löschen alter Einträge:', error);
    process.exit(1);
  } finally {
    // Beende die Firebase-App ordnungsgemäß
    await admin.app().delete();
  }
}

// Führe die Bereinigung aus
deleteOldSaves()
  .then(() => {
    console.log('[ERFOLG] Script erfolgreich beendet.');
    process.exit(0);
  })
  .catch(error => {
    console.error('[FEHLER] Unbehandelter Fehler:', error);
    process.exit(1);
  });