// scripts/importNotifications.js
// Liest notifications.csv ein und importiert/updatet die Notifications in Firestore

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

// __dirname Ersatz für ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Firestore-Initialisierung (Service Account JSON muss als ENV vorliegen)
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('[FEHLER] Firebase-Initialisierung fehlgeschlagen:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const csvFile = path.join(__dirname, 'notifications.csv');

async function importNotifications() {
  const notifications = [];
  fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (row) => notifications.push(row))
    .on('end', async () => {
      for (const notif of notifications) {
        if (!notif.id) continue;
        // Mapping: title -> subject, message -> body, timestamp -> dateTime
        await db.collection('notifications').doc(notif.id).set({
          subject: notif.title,
          body: notif.message,
          dateTime: notif.timestamp ? new Date(notif.timestamp) : admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log('Importiert/aktualisiert:', notif.id);
      }
      console.log('Import abgeschlossen.');
      process.exit(0);
    });
}

importNotifications().catch((err) => {
  console.error('Fehler beim Import:', err);
  process.exit(1);
});
