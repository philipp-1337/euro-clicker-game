import test from 'node:test';
import assert from 'node:assert/strict';

import { getGamePhaseRuntimeFlags } from './useGamePhase.helpers.js';

test('keeps capital timers and actions enabled during capital phase', () => {
  const flags = getGamePhaseRuntimeFlags('capital_phase');

  assert.equal(flags.isCapitalPhase, true);
  assert.equal(flags.runCapitalTimers, true);
  assert.equal(flags.allowCapitalActions, true);
});

test('disables capital timers and actions during hq phase', () => {
  const flags = getGamePhaseRuntimeFlags('hq_phase');

  assert.equal(flags.isCapitalPhase, false);
  assert.equal(flags.runCapitalTimers, false);
  assert.equal(flags.allowCapitalActions, false);
});
