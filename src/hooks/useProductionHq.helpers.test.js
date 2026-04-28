import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getProductionHqMaterialCostMultiplier,
  subtractProductionHqUpgradeCosts,
} from './useProductionHq.helpers.js';

test('clamps material-cost multiplier to a positive minimum value', () => {
  const multiplier = getProductionHqMaterialCostMultiplier({
    effectPerLevel: 0.15,
    level: 8,
  });

  assert.equal(multiplier, 0.1);
});

test('subtracts HQ upgrade costs from the latest crafting item state', () => {
  const nextItems = subtractProductionHqUpgradeCosts([4, 3], [
    { item: 0, quantity: 2 },
    { item: 1, quantity: 1.2 },
  ]);

  assert.deepEqual(nextItems, [2, 1]);
});
