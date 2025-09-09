import admin from "firebase-admin";

// Konfiguration
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '30', 10); // Default: 30 Tage
const BATCH_SIZE = 500; // Firestore Batch-Limit
const COLLECTION_NAME = "notificationReads";
const TIMESTAMP_FIELD = "lastSeenAt";

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
 * Löscht notificationReads-Dokumente, deren lastSeenAt älter als RETENTION_DAYS ist
 */
async function deleteOldNotificationReads() {
  try {
    console.log(`[INFO] Suche nach notificationReads, die älter als ${RETENTION_DAYS} Tage sind...`);
    const cutoffDate = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    console.log(`[INFO] Grenzwertdatum: ${new Date(cutoffDate).toISOString()}`);

    // Hole alle Dokumente, die älter als der Schwellenwert sind
    const snapshot = await db.collection(COLLECTION_NAME)
      .where(TIMESTAMP_FIELD, "<", cutoffDate)
      .get();

    if (snapshot.empty) {
      console.log("[INFO] Keine alten notificationReads gefunden, die gelöscht werden müssten.");
      return;
    }

    console.log(`[INFO] ${snapshot.size} notificationReads zum Löschen gefunden.`);
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
      console.log(`[INFO] Batch ${batchNum + 1} abgeschlossen: ${batchEnd - batchStart} notificationReads gelöscht`);
    }
    console.log(`[ERFOLG] Bereinigung abgeschlossen. Insgesamt ${deletedCount} notificationReads gelöscht.`);
  } catch (error) {
    console.error('[FEHLER] Fehler beim Löschen alter notificationReads:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

deleteOldNotificationReads()
  .then(() => {
    console.log('[ERFOLG] Script erfolgreich beendet.');
    process.exit(0);
  })
  .catch(error => {
    console.error('[FEHLER] Unbehandelter Fehler:', error);
    process.exit(1);
  });
