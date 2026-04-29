# Production HQ Hard Phase Shift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current late-game money-driven `Production HQ` extension with an irreversible `hq_phase` that begins after `10 Collectible Coins` and `5 Gold Reserves`, removes the cash-era UI, and starts a new material/component/HQ-progress loop.

**Architecture:** Introduce a global `gamePhase` gate at the `useGameCore -> ClickerGame` boundary, then ship the transition in vertical slices: first the trigger and irreversible phase switch, then the cash-era UI removal and HQ-only navigation, then the first HQ production loop with isolated state and config. Preserve old save fields for migration safety but stop reading them in `hq_phase`.

**Tech Stack:** React 19, Vite, SCSS, localStorage-backed client state, existing custom hooks in `src/hooks`, configuration in `src/constants/gameConfig.jsx`

---

## Scope Check

This feature is one coherent subsystem with three tightly connected implementation slices:

1. irreversible phase-state and transition UX
2. UI/routing split between `capital_phase` and `hq_phase`
3. first HQ resource loop

They should be implemented in that order because later tasks depend on the earlier boundary being real.

## File Structure Map

### Existing files expected to change

- `src/constants/gameConfig.jsx`
  Source of initial state, crafting thresholds, unlock roadmap config, and new HQ-loop config.
- `src/hooks/useGameState.jsx`
  Persistence boundary for new phase and HQ-specific save fields.
- `src/hooks/useGameCore.jsx`
  Main orchestration point for phase switching, derived flags, and wiring into UI.
- `src/hooks/useCrafting.jsx`
  Current crafting logic; must stop acting as a money loop after HQ entry and expose the transition trigger.
- `src/hooks/useUnlockRoadmap.jsx`
  Existing milestone logic; must stop surfacing capital-phase goals once HQ is entered.
- `src/components/ClickerGame/index.jsx`
  Top-level view composition; best place to hard-switch between capital and HQ interfaces.
- `src/components/ClickerGame/BottomTabMenu.jsx`
  Current navigation; must be replaced or reduced in `hq_phase`.
- `src/components/ClickerGame/UpgradeTabs/Crafting.jsx`
  Current player-facing threshold and trigger surface before HQ entry.
- `src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx`
  Current money-era extension; must be redesigned into the HQ-only screen.
- `src/components/MoneyBanner/MoneyBanner.jsx`
  Must be hidden in `hq_phase`.
- `src/scss/components/_tabs.scss`
  Existing tab/card styling; likely needs transition CTA and HQ-only layout support.
- `src/scss/components/_money-banner.scss`
  May need phase-aware visibility styling cleanup.
- `src/scss/layout/_sections.scss`
  Likely location for HQ-only section spacing/layout rules.

### New files recommended

- `src/hooks/useProductionHqPhase.jsx`
  Derived helpers and actions for entering `hq_phase`, checking thresholds, and reading HQ-only progress.
- `src/hooks/useProductionHqLoop.jsx`
  Encapsulates the new post-money resource/component/HQ-progress loop.
- `src/components/ClickerGame/ProductionHqShell.jsx`
  Top-level HQ-phase screen to avoid overloading the current tabbed view.
- `src/components/ClickerGame/ProductionHqTransitionModal.jsx`
  Focused irreversible confirmation UI.
- `src/components/ClickerGame/ProductionHqPanel.jsx`
  Focused panel for the first HQ resource loop if `ProductionHQ.jsx` becomes too mixed.

## Verification Baseline

Before starting, confirm current baseline still passes:

- `npm run lint`
- `npm run build`

Manual verification baseline:

- existing save loads without crash
- crafting unlock still works before any HQ changes are triggered
- current `Production HQ` tab behavior is understood before replacing it

## Task 1: Add persistent phase-state and entry thresholds

**Files:**
- Modify: `src/constants/gameConfig.jsx`
- Modify: `src/hooks/useGameState.jsx`
- Modify: `src/hooks/useGameCore.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Write the failing expectation down in the code comments and config shape**

Add new initial-state fields in `src/constants/gameConfig.jsx`:

```js
gamePhase: 'capital_phase',
hasEnteredProductionHq: false,
hqMaterials: {},
hqComponents: {},
hqTier: 0,
hqProgress: 0,
hqUpgrades: {},
hqProductionState: {},
```

Also add explicit threshold constants:

```js
productionHqEntryRequirements: {
  collectibleCoin: 10,
  goldReserve: 5,
},
```

- [ ] **Step 2: Run lint to confirm the new config shape is syntactically valid**

Run: `npm run lint`
Expected: PASS, or only unrelated pre-existing warnings

- [ ] **Step 3: Persist the new phase-state fields**

Update `src/hooks/useGameState.jsx` so the new fields are loaded from and saved to local storage with safe fallbacks to the initial state.

Use this persistence shape:

```js
gamePhase: parsed.gamePhase ?? initialState.gamePhase,
hasEnteredProductionHq: parsed.hasEnteredProductionHq ?? initialState.hasEnteredProductionHq,
hqMaterials: parsed.hqMaterials ?? initialState.hqMaterials,
hqComponents: parsed.hqComponents ?? initialState.hqComponents,
hqTier: parsed.hqTier ?? initialState.hqTier,
hqProgress: parsed.hqProgress ?? initialState.hqProgress,
hqUpgrades: parsed.hqUpgrades ?? initialState.hqUpgrades,
hqProductionState: parsed.hqProductionState ?? initialState.hqProductionState,
```

- [ ] **Step 4: Wire state setters through `useGameCore.jsx`**

Expose the new state and setters from `useGameCore.jsx` so UI and dedicated hooks can branch on:

```js
gamePhase,
setGamePhase,
hasEnteredProductionHq,
setHasEnteredProductionHq,
hqMaterials,
setHqMaterials,
hqComponents,
setHqComponents,
hqTier,
setHqTier,
hqProgress,
setHqProgress,
hqUpgrades,
setHqUpgrades,
hqProductionState,
setHqProductionState,
```

- [ ] **Step 5: Run static verification**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/constants/gameConfig.jsx src/hooks/useGameState.jsx src/hooks/useGameCore.jsx
git commit -m "feat: add production hq phase state"
```

## Task 2: Implement the irreversible `Enter Production HQ` trigger

**Files:**
- Create: `src/hooks/useProductionHqPhase.jsx`
- Create: `src/components/ClickerGame/ProductionHqTransitionModal.jsx`
- Modify: `src/components/ClickerGame/UpgradeTabs/Crafting.jsx`
- Modify: `src/hooks/useGameCore.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Write the failing transition behavior as a dedicated derived hook**

Create `src/hooks/useProductionHqPhase.jsx` with helpers:

```js
export default function useProductionHqPhase({
  craftingItems,
  gamePhase,
  setGamePhase,
  hasEnteredProductionHq,
  setHasEnteredProductionHq,
  setSelectedTab,
}) {
  const canEnterProductionHq = (craftingItems?.[0] ?? 0) >= 10
    && (craftingItems?.[1] ?? 0) >= 5
    && gamePhase === 'capital_phase';

  const enterProductionHq = () => {
    if (!canEnterProductionHq) return false;
    setHasEnteredProductionHq(true);
    setGamePhase('hq_phase');
    setSelectedTab?.('production-hq');
    return true;
  };

  return { canEnterProductionHq, enterProductionHq };
}
```

- [ ] **Step 2: Add a dominant irreversible confirmation surface**

Create `src/components/ClickerGame/ProductionHqTransitionModal.jsx` rendering:

```jsx
<div className="production-hq-transition">
  <h2>Production HQ Ready</h2>
  <p>You have built enough industrial foundation to leave capital behind.</p>
  <p>This permanently ends the cash phase.</p>
  <button>Enter Production HQ</button>
</div>
```

The component must support:

- `open`
- `onConfirm`
- `onCancel`

- [ ] **Step 3: Surface the trigger from `Crafting.jsx`**

Render the CTA only when:

```js
isCraftingUnlocked
&& canEnterProductionHq
&& gamePhase === 'capital_phase'
```

Place it above or between the current crafting journey card and recipe list so it reads as a unique milestone, not a normal recipe action.

- [ ] **Step 4: Wire the confirm action in `useGameCore.jsx` and top-level UI**

Expose:

```js
canEnterProductionHq,
enterProductionHq,
isProductionHqTransitionOpen,
setIsProductionHqTransitionOpen,
```

Use the modal flow:

1. player clicks CTA
2. modal opens
3. confirm calls `enterProductionHq`
4. UI rerenders into `hq_phase`

- [ ] **Step 5: Verify the transition manually**

Run: `npm run dev`
Expected:

- before `10/5`, no entry CTA
- at `10/5`, CTA appears
- confirm switches into `hq_phase`
- refresh preserves `hq_phase`

- [ ] **Step 6: Run static verification**

Run:

- `npm run lint`
- `npm run build`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useProductionHqPhase.jsx src/components/ClickerGame/ProductionHqTransitionModal.jsx src/components/ClickerGame/UpgradeTabs/Crafting.jsx src/hooks/useGameCore.jsx
git commit -m "feat: add irreversible production hq transition"
```

## Task 3: Hard-switch the main UI from capital-phase to HQ-phase

**Files:**
- Create: `src/components/ClickerGame/ProductionHqShell.jsx`
- Modify: `src/components/ClickerGame/index.jsx`
- Modify: `src/components/ClickerGame/BottomTabMenu.jsx`
- Modify: `src/components/MoneyBanner/MoneyBanner.jsx`
- Modify: `src/hooks/useUnlockRoadmap.jsx`
- Test: `npm run build`

- [ ] **Step 1: Create an HQ-only top-level shell**

Create `src/components/ClickerGame/ProductionHqShell.jsx`:

```jsx
export default function ProductionHqShell(props) {
  return (
    <section className="production-hq-shell">
      <header className="production-hq-shell__header">
        <span className="production-hq-shell__eyebrow">Production Phase</span>
        <h1>Production HQ</h1>
      </header>
      <ProductionHQ {...props} />
    </section>
  );
}
```

- [ ] **Step 2: Branch early in `ClickerGame/index.jsx`**

Render capital-phase and HQ-phase as separate trees:

```jsx
if (gamePhase === 'hq_phase') {
  return <ProductionHqShell ... />;
}

return <CapitalPhaseGame ... />;
```

Do not merely hide old tabs inside the same tree if that leaves stale UI or effects around unnecessarily.

- [ ] **Step 3: Remove money-era affordances in HQ-phase**

Ensure HQ-phase does not render:

- `MoneyBanner`
- old bottom tab menu
- prestige modal entry points
- unlock roadmap for capital systems

`useUnlockRoadmap.jsx` should return `null` or a dedicated HQ-state message in `hq_phase`.

- [ ] **Step 4: Keep capital-phase behavior unchanged before entry**

Verify that before transition:

- all current tabs still work
- current crafting still works
- the current Production HQ tab is not shown as a parallel path if design no longer allows it

- [ ] **Step 5: Run verification**

Run:

- `npm run lint`
- `npm run build`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ClickerGame/ProductionHqShell.jsx src/components/ClickerGame/index.jsx src/components/ClickerGame/BottomTabMenu.jsx src/components/MoneyBanner/MoneyBanner.jsx src/hooks/useUnlockRoadmap.jsx
git commit -m "feat: split capital and hq phase UI"
```

## Task 4: Replace the current Production HQ extension with the first HQ resource loop

**Files:**
- Create: `src/hooks/useProductionHqLoop.jsx`
- Modify: `src/constants/gameConfig.jsx`
- Modify: `src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx`
- Create or Modify: `src/components/ClickerGame/ProductionHqPanel.jsx`
- Test: `npm run lint`

- [ ] **Step 1: Define V1 HQ resources in config**

Add a small closed loop such as:

```js
hqMaterials: [
  { id: 'scrap', name: 'Scrap', baseRate: 1 },
  { id: 'circuits', name: 'Circuits', baseRate: 0.5 },
  { id: 'alloys', name: 'Alloys', baseRate: 0.25 },
],
hqComponents: [
  { id: 'frame', name: 'Frames', costs: { scrap: 10 } },
  { id: 'control_unit', name: 'Control Units', costs: { circuits: 8, alloys: 2 } },
],
hqTiers: [
  { tier: 1, progressRequired: 10, unlocks: ['second-extractor'] },
  { tier: 2, progressRequired: 25, unlocks: ['faster-assembly'] },
],
```

- [ ] **Step 2: Implement the loop hook with no money dependencies**

Create `src/hooks/useProductionHqLoop.jsx` that supports:

- passive material generation tick
- converting materials into components
- investing components into HQ progress

Core API:

```js
{
  hqMaterials,
  hqComponents,
  hqProgress,
  hqTier,
  craftHqComponent,
  investInHqTier,
}
```

- [ ] **Step 3: Redesign `ProductionHQ.jsx` around the new loop**

Replace current money-era upgrades and automation framing with three sections:

- Extraction
- Assembly
- HQ Core

The first version should show:

- material counts
- component recipes
- HQ progress/tier bar
- unlock text for the next HQ tier

- [ ] **Step 4: Ensure old Production HQ money upgrades are no longer used in `hq_phase`**

Do not read or render:

- cash-based material sourcing upgrades
- old auto-buy toggles
- old craft-value multipliers

Those can remain in save data temporarily but must stop driving the main loop once `hq_phase` is active.

- [ ] **Step 5: Verify manually**

Run: `npm run dev`
Expected:

- entering HQ shows only the new production loop
- no euro-based purchases remain
- progress can be made with materials, components, and HQ upgrades alone

- [ ] **Step 6: Run static verification**

Run:

- `npm run lint`
- `npm run build`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useProductionHqLoop.jsx src/constants/gameConfig.jsx src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx src/components/ClickerGame/ProductionHqPanel.jsx
git commit -m "feat: add first production hq resource loop"
```

## Task 5: Clean up transition messaging, migration edge cases, and regression checks

**Files:**
- Modify: `src/components/ClickerGame/UpgradeTabs/Crafting.jsx`
- Modify: `src/components/ClickerGame/index.jsx`
- Modify: `src/hooks/useGameCore.jsx`
- Modify: `src/scss/components/_tabs.scss`
- Modify: `src/scss/layout/_sections.scss`
- Test: `npm run build`

- [ ] **Step 1: Add explicit copy for irreversible state**

Ensure all pre-entry and transition surfaces clearly state:

- threshold reached
- irreversible change
- what disappears
- what becomes the new focus

- [ ] **Step 2: Guard save-migration edge cases**

Handle cases such as:

- old saves without `gamePhase`
- saves that already unlocked old Production HQ
- saves where player has `10/5` immediately on load

Expected rule:

- qualifying saves may see the CTA immediately
- no save should be auto-forced into `hq_phase` without confirmation

- [ ] **Step 3: Verify no stale capital UI leaks into HQ**

Manual checks:

- no money readouts
- no prestige buttons
- no investment cards
- no old roadmap copy

- [ ] **Step 4: Run final verification**

Run:

- `npm run lint`
- `npm run build`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ClickerGame/UpgradeTabs/Crafting.jsx src/components/ClickerGame/index.jsx src/hooks/useGameCore.jsx src/scss/components/_tabs.scss src/scss/layout/_sections.scss
git commit -m "feat: polish production hq phase shift"
```

## Self-Review

### Spec coverage

- irreversible trigger after `10 Coin / 5 Gold Reserve`: covered by Tasks 1-2
- remove capital UI after entry: covered by Task 3
- start a new non-money HQ loop: covered by Task 4
- preserve save safety and migration behavior: covered by Task 5

### Placeholder scan

No `TODO`, `TBD`, or cross-task references without concrete files and commands are intentionally left in the plan.

### Type consistency

The plan consistently uses:

- `gamePhase`
- `hasEnteredProductionHq`
- `canEnterProductionHq`
- `enterProductionHq`
- `hqMaterials`
- `hqComponents`
- `hqTier`
- `hqProgress`
- `hqProductionState`
