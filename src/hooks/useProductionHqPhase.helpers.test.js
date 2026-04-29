import test from 'node:test';
import assert from 'node:assert/strict';

import { getProductionHqEntryState } from './useProductionHqPhase.helpers.js';

test('allows entry only after both crafting thresholds are met in capital phase', () => {
  const state = getProductionHqEntryState({
    craftingItems: [10, 5],
    gamePhase: 'capital_phase',
  });

  assert.equal(state.canEnterProductionHq, true);
  assert.equal(state.requiredCoins, 10);
  assert.equal(state.requiredGold, 5);
});

test('blocks entry when the player has already left the capital phase', () => {
  const state = getProductionHqEntryState({
    craftingItems: [25, 12],
    gamePhase: 'hq_phase',
  });

  assert.equal(state.canEnterProductionHq, false);
  assert.equal(state.isCapitalPhase, false);
});

test('blocks entry when one of the crafting thresholds is still missing', () => {
  const state = getProductionHqEntryState({
    craftingItems: [10, 4],
    gamePhase: 'capital_phase',
  });

  assert.equal(state.canEnterProductionHq, false);
  assert.equal(state.goldCount, 4);
});
