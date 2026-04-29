import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canAffordHqCosts,
  getHqExtractionRate,
  getOverdriveCooldownMs,
  getPrecisionDurationMs,
  getPrecisionOutputBonus,
  subtractHqCosts,
} from './useProductionHqLoop.helpers.js';

test('scales extraction rate with flux line upgrades', () => {
  const rate = getHqExtractionRate(
    { baseRatePerSecond: 2 },
    { flux_lines: 2 }
  );

  assert.equal(rate, 3);
});

test('adds extra precision output through calibration upgrades', () => {
  const bonus = getPrecisionOutputBonus({ calibration_matrix: 2 });

  assert.equal(bonus, 3);
});

test('reduces overdrive cooldown and increases precision duration through thermal sinks', () => {
  assert.equal(getOverdriveCooldownMs({ thermal_sinks: 2 }), 10000);
  assert.equal(getPrecisionDurationMs({ thermal_sinks: 2 }), 20000);
});

test('checks and subtracts component costs safely', () => {
  const stock = { frame: 5, relay: 3 };

  assert.equal(canAffordHqCosts(stock, { frame: 4, relay: 2 }), true);
  assert.equal(canAffordHqCosts(stock, { frame: 6 }), false);
  assert.deepEqual(subtractHqCosts(stock, { frame: 4, relay: 2 }), { frame: 1, relay: 1 });
});
