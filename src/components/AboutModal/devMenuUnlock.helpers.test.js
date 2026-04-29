import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEV_MENU_TAP_THRESHOLD,
  registerDevMenuTap,
} from './devMenuUnlock.helpers.js';

test('increments hidden dev-menu taps until the threshold is reached', () => {
  const firstTap = registerDevMenuTap(0, DEV_MENU_TAP_THRESHOLD);
  const secondTap = registerDevMenuTap(firstTap.nextCount, DEV_MENU_TAP_THRESHOLD);

  assert.deepEqual(firstTap, { unlocked: false, nextCount: 1 });
  assert.deepEqual(secondTap, { unlocked: false, nextCount: 2 });
});

test('unlocks and resets the tap counter on the third consecutive tap', () => {
  const unlockedTap = registerDevMenuTap(2, DEV_MENU_TAP_THRESHOLD);

  assert.deepEqual(unlockedTap, { unlocked: true, nextCount: 0 });
});
