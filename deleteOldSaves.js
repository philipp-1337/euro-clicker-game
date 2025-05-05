const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteOldSaves() {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const snapshot = await db.collection("saves")
    .where("updatedAt", "<", oneWeekAgo)
    .get();

  if (snapshot.empty) {
    console.log("Keine alten Einträge.");
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  console.log(`✅ ${snapshot.size} Einträge gelöscht.`);
}

deleteOldSaves().catch(console.error);