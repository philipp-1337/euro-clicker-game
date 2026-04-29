import test from 'node:test';
import assert from 'node:assert/strict';

import { duplicateCloudSaveDocument } from './useCloudSave.helpers.js';

test('duplicates an existing cloud save into a new firestore document', async () => {
  const calls = [];
  const originalPayload = {
    money: 42,
    clickerSave: '{"payload":true}',
    updatedAt: 111,
  };

  const duplicatedUuid = await duplicateCloudSaveDocument({
    db: { name: 'db' },
    sourceUuid: 'source-uuid',
    createUuid: () => 'duplicate-uuid',
    now: () => 999,
    removeUndefinedFields: (value) => value,
    firestore: {
      doc: (_db, collection, id) => ({ collection, id }),
      getDoc: async (ref) => {
        calls.push(['getDoc', ref]);
        return {
          exists: () => true,
          data: () => originalPayload,
        };
      },
      setDoc: async (ref, payload) => {
        calls.push(['setDoc', ref, payload]);
      },
    },
  });

  assert.equal(duplicatedUuid, 'duplicate-uuid');
  assert.deepEqual(calls, [
    ['getDoc', { collection: 'saves', id: 'source-uuid' }],
    ['setDoc', { collection: 'saves', id: 'duplicate-uuid' }, {
      ...originalPayload,
      updatedAt: 999,
    }],
  ]);
});

test('throws when no active cloud save uuid is available', async () => {
  await assert.rejects(
    duplicateCloudSaveDocument({
      db: {},
      sourceUuid: '',
    }),
    /Cloud save is not active/
  );
});
