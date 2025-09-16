// scripts/importNotifications.js
// Liest notifications.csv ein und importiert/updatet die Notifications in Firestore

import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import csv from 'csv-parser';
import { initializeApp, credential as _credential, firestore } from 'firebase-admin';

// Firestore-Initialisierung (Service Account JSON muss als env oder Datei vorliegen)
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || join(__dirname, 'serviceAccountKey.json');
if (!existsSync(serviceAccountPath)) {
  console.error('Service Account JSON nicht gefunden:', serviceAccountPath);
  process.exit(1);
}

initializeApp({
  credential: _credential.cert(require(serviceAccountPath)),
});

const db = firestore();
const csvFile = join(__dirname, 'notifications.csv');

async function importNotifications() {
  const notifications = [];
  createReadStream(csvFile)
    .pipe(csv())
    .on('data', (row) => notifications.push(row))
    .on('end', async () => {
      for (const notif of notifications) {
        if (!notif.id) continue;
        // Mapping: title -> subject, message -> body, timestamp -> dateTime
        await db.collection('notifications').doc(notif.id).set({
          subject: notif.title,
          body: notif.message,
          dateTime: notif.timestamp ? new Date(notif.timestamp) : firestore.FieldValue.serverTimestamp(),
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
