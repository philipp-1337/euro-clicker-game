import { doc, getDoc, setDoc } from 'firebase/firestore';

export function generateCloudSaveUuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export async function duplicateCloudSaveDocument({
  db,
  sourceUuid,
  createUuid = generateCloudSaveUuid,
  now = () => Date.now(),
  removeUndefinedFields = (value) => value,
  firestore = {
    doc,
    getDoc,
    setDoc,
  },
}) {
  if (!sourceUuid) {
    throw new Error('Cloud save is not active');
  }

  const sourceRef = firestore.doc(db, 'saves', sourceUuid);
  const sourceSnap = await firestore.getDoc(sourceRef);

  if (!sourceSnap.exists()) {
    throw new Error('Cloud save not found');
  }

  const duplicateUuid = createUuid();
  const duplicateRef = firestore.doc(db, 'saves', duplicateUuid);
  const duplicatePayload = removeUndefinedFields({
    ...sourceSnap.data(),
    updatedAt: now(),
  });

  await firestore.setDoc(duplicateRef, duplicatePayload);

  return duplicateUuid;
}
