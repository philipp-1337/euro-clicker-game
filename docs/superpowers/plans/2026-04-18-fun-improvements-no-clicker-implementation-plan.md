# Fun Improvements Without Clicker Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three highest-value fun-factor improvements without changing the floating clicker button: stronger unlock anticipation, more distinct investments with non-trivial boosts, and a more game-like post-prestige crafting loop.

**Architecture:** Implement this as three independently shippable phases on top of the existing `ClickerGame -> useGameCore -> tab components` flow. Keep phase 1 mostly UI/state-light, phase 2 focused on investment metadata + boost rules, and phase 3 focused on crafting state, reward logic, and prestige-linked production choices.

**Tech Stack:** React 19, Vite, SCSS, localStorage-backed client state, existing custom hooks in `src/hooks`, configuration in `src/constants/gameConfig.jsx`

---

## Scope Check

This plan covers three related but separable subsystems:

1. Unlock anticipation and milestone presentation
2. Investment identity and boost redesign
3. Crafting loop expansion

They are intentionally ordered so each phase can ship independently:

- Phase 1 improves motivation with minimal systems risk
- Phase 2 improves the midgame without depending on phase 3
- Phase 3 deepens post-prestige gameplay and can build on phase-2 messaging patterns

## File Structure Map

### Existing files expected to change

- `src/components/ClickerGame/index.jsx`
  Owns top-level tab orchestration, unlock gating, and prop wiring into tabs.
- `src/components/ClickerGame/UpgradeTabs/Investments.jsx`
  Current investment UI and boost interaction entry point.
- `src/components/ClickerGame/UpgradeTabs/Crafting.jsx`
  Current crafting UI, cooldown state, and reward claim UX.
- `src/hooks/useGameCore.jsx`
  Main orchestration hook; likely wiring point for new investment and crafting state.
- `src/hooks/useInvestments.jsx`
  Likely source of investment purchase/boost income behavior.
- `src/hooks/useCrafting.jsx`
  Likely source of crafting purchase/output rules.
- `src/hooks/useGameState.jsx`
  Persistence source for any new investment/crafting progress state.
- `src/constants/gameConfig.jsx`
  Source of unlock thresholds, investment metadata, crafting recipes, and future role definitions.
- `src/scss/components/_tabs.scss`
  Existing tab/card styles; likely place for unlock preview card variants.
- `src/scss/components/_buttons.scss`
  Existing button states; likely needed for milestone and challenge buttons.
- `src/scss/components/_displays.scss`
  Existing info display styles; likely useful for role badges, boost meters, and progress labels.

### New files recommended

- `src/components/ClickerGame/UnlockRoadmapCard.jsx`
  Reusable progress-preview card for upcoming unlocks.
- `src/components/ClickerGame/UpgradeTabs/InvestmentBoostMeter.jsx`
  Visual meter + rule summary for non-trivial investment boosts.
- `src/components/ClickerGame/UpgradeTabs/CraftingProductionCard.jsx`
  Focused UI unit for production mode, quality, and reward state.
- `src/hooks/useUnlockRoadmap.jsx`
  Pure derived hook for milestone progress labels and preview content.
- `src/hooks/useInvestmentBoosts.jsx`
  State transitions and persistence for new boost rules.
- `src/hooks/useCraftingProductionMode.jsx`
  Encapsulates production mode selection and quality/timing windows.
- `src/scss/components/_unlock-roadmap.scss`
  Styles for preview cards and milestone strips if current styles become too overloaded.

## Verification Baseline

The repo currently exposes `lint` and `build`, but no dedicated test runner script. For this feature set, the minimum verification per phase is:

- `npm run lint`
- `npm run build`
- manual browser verification via `npm run dev`

Manual verification must cover:

- fresh save behavior
- existing save migration behavior
- first unlock flow
- first prestige flow
- first crafting flow after prestige

## Phase Plan

### Phase 1: Unlock Anticipation And Milestone Presentation

**Intent:** Improve motivation before major purchases by making the next milestone visible, legible, and emotionally meaningful.

### Task 1: Add unlock roadmap configuration

**Files:**
- Modify: `src/constants/gameConfig.jsx`
- Create: `src/hooks/useUnlockRoadmap.jsx`

- [ ] **Step 1: Define roadmap metadata in config**

Add a compact config structure for the major milestones:

- investments unlock
- premium upgrades visibility target if applicable
- prestige threshold
- wealth production unlock

Each entry should define:

- `id`
- `title`
- `description`
- `targetValue` or `targetPrestige`
- `unlockType`
- `ctaLabel`

- [ ] **Step 2: Add a pure derived roadmap hook**

Implement `useUnlockRoadmap.jsx` so it derives:

- current progress percentage
- remaining requirement text
- locked/unlocked state
- preview text for the next milestone only

Keep this hook read-only and based on existing runtime state such as:

- `money`
- `isInvestmentUnlocked`
- `prestigeCount`
- `prestigeShares`
- `isCraftingUnlocked`

- [ ] **Step 3: Verify hook integration assumptions**

Manual check:

- confirm the roadmap hook can be called from `ClickerGame`
- confirm no circular dependency is introduced with `gameConfig`

Run: `npm run lint`
Expected: no new import-cycle or lint errors

- [ ] **Step 4: Commit**

```bash
git add src/constants/gameConfig.jsx src/hooks/useUnlockRoadmap.jsx
git commit -m "feat: add unlock roadmap metadata"
```

### Task 2: Render roadmap UI in the main game flow

**Files:**
- Create: `src/components/ClickerGame/UnlockRoadmapCard.jsx`
- Modify: `src/components/ClickerGame/index.jsx`
- Modify: `src/scss/components/_tabs.scss`
- Modify: `src/scss/main.scss`

- [ ] **Step 1: Build a reusable roadmap card component**

The component should render:

- milestone title
- short description
- progress text
- progress bar
- unlocked badge or next-step CTA copy

It should stay generic enough to support `Investments`, `Prestige`, and `Wealth Production`.

- [ ] **Step 2: Place roadmap UI near the currently relevant progression area**

Wire the component in `ClickerGame/index.jsx` so the player sees only the next most relevant milestone.

Preferred order:

1. Investments
2. Prestige
3. Wealth Production

Do not spam all future milestones at once.

- [ ] **Step 3: Style the component to read as anticipation, not a warning box**

Add styling for:

- progress strip
- reward preview emphasis
- compact mobile layout

- [ ] **Step 4: Verify in browser**

Run:

- `npm run dev`

Manual checks:

- fresh save shows investments roadmap
- after unlocking investments, roadmap switches to prestige
- after first prestige, roadmap switches to wealth production if still locked

- [ ] **Step 5: Run static verification**

Run:

- `npm run lint`
- `npm run build`

Expected:

- both commands pass

- [ ] **Step 6: Commit**

```bash
git add src/components/ClickerGame/UnlockRoadmapCard.jsx src/components/ClickerGame/index.jsx src/scss/components/_tabs.scss src/scss/main.scss
git commit -m "feat: add unlock roadmap UI"
```

### Phase 1 Exit Criteria

- Player can always see the next major unlock
- UI explains what the next unlock changes
- No regression in existing unlock gating

---

### Phase 2: Investment Identity And Boost Redesign

**Intent:** Turn investments from a uniform purchase list into a system with roles, recognizable playstyle differences, and more engaging boost goals.

### Task 3: Extend investment metadata with roles and boost rule types

**Files:**
- Modify: `src/constants/gameConfig.jsx`
- Create: `src/hooks/useInvestmentBoosts.jsx`
- Modify: `src/hooks/useGameState.jsx`

- [ ] **Step 1: Expand investment config schema**

For each investment add metadata such as:

- `roleLabel`
- `roleDescription`
- `boostType`
- `boostTarget`
- `boostHint`
- `synergyTag`

Keep numbers conservative for the first pass. The goal is readability and differentiated behavior, not deep rebalance yet.

- [ ] **Step 2: Add dedicated boost-state persistence**

Move away from raw local component state in `Investments.jsx` and persist structured boost progress in game state or a dedicated hook.

State shape should support:

- current progress
- boosted flag
- challenge window timestamps if needed
- per-investment rule type

- [ ] **Step 3: Implement a boost-state hook**

`useInvestmentBoosts.jsx` should expose:

- `getBoostState(index)`
- `advanceBoost(index, actionContext)`
- `isBoostCompleted(index)`
- `getBoostProgressLabel(index)`

Action contexts should be generic enough for:

- purchase events
- manager events
- timer-window events
- manual boost button events if one remains

- [ ] **Step 4: Verify persistence behavior**

Run:

- `npm run lint`

Manual checks:

- refresh keeps boost progress
- boosted investments remain boosted
- old saves with legacy localStorage do not crash the UI

- [ ] **Step 5: Commit**

```bash
git add src/constants/gameConfig.jsx src/hooks/useInvestmentBoosts.jsx src/hooks/useGameState.jsx
git commit -m "feat: add investment role and boost metadata"
```

### Task 4: Rework investment tab UI around roles and boost meters

**Files:**
- Modify: `src/components/ClickerGame/UpgradeTabs/Investments.jsx`
- Create: `src/components/ClickerGame/UpgradeTabs/InvestmentBoostMeter.jsx`
- Modify: `src/hooks/useGameCore.jsx`
- Modify: `src/scss/components/_tabs.scss`
- Modify: `src/scss/components/_displays.scss`

- [ ] **Step 1: Replace hard-coded 100-click messaging**

Update the investment card body to show:

- role label
- synergy summary
- dynamic boost hint
- dynamic boost progress

- [ ] **Step 2: Add a focused boost meter component**

Render a visual meter and challenge rule text per investment.

The meter should support:

- incomplete progress
- active challenge window
- completed boost state

- [ ] **Step 3: Wire boost advancement through real game events**

Connect `useGameCore.jsx` and `Investments.jsx` so boost progress can advance from relevant events instead of only a repeated button press.

First implementation target:

- one rule based on purchases
- one rule based on timed actions
- one rule based on resource state

Not every investment needs a unique mechanic on day one, but at least 3 role patterns should exist.

- [ ] **Step 4: Verify balance and clarity manually**

Run `npm run dev` and check:

- every investment card communicates what makes it special
- players can understand the boost requirement without reading external docs
- completed boosts still read clearly as permanent upgrades

- [ ] **Step 5: Run static verification**

Run:

- `npm run lint`
- `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/components/ClickerGame/UpgradeTabs/Investments.jsx src/components/ClickerGame/UpgradeTabs/InvestmentBoostMeter.jsx src/hooks/useGameCore.jsx src/scss/components/_tabs.scss src/scss/components/_displays.scss
git commit -m "feat: redesign investment roles and boosts"
```

### Phase 2 Exit Criteria

- Investments no longer read as numerically interchangeable cards
- At least three distinct investment-role patterns exist
- Boost progress is understandable, persisted, and not dependent on mindless repetition

---

### Phase 3: Crafting As A Real Post-Prestige Loop

**Intent:** Make wealth production feel like a new gameplay phase instead of a passive payout tab.

### Task 5: Add production mode and crafting quality model

**Files:**
- Modify: `src/constants/gameConfig.jsx`
- Create: `src/hooks/useCraftingProductionMode.jsx`
- Modify: `src/hooks/useGameState.jsx`
- Modify: `src/hooks/useCrafting.jsx`

- [ ] **Step 1: Extend crafting recipe config**

For each recipe, define:

- `productionModes`
- `qualityBonusWindowMs`
- `rareBonusChance`
- `qualityMultiplier` or equivalent output modifier

Keep the first release simple:

- two production modes max per recipe
- one optional quality/timing bonus

- [ ] **Step 2: Persist production preferences and active run metadata**

Add game state fields for:

- selected production mode per recipe
- last production completion timestamp
- quality bonus result if reward is pending

- [ ] **Step 3: Encapsulate mode/quality logic in a hook**

`useCraftingProductionMode.jsx` should expose:

- `getSelectedMode(recipeId)`
- `setSelectedMode(recipeId, modeId)`
- `resolveCraftOutcome(recipe, completionTime, claimTime)`

- [ ] **Step 4: Update crafting logic to use resolved outcomes**

Refactor `useCrafting.jsx` so reward generation is not hard-coded to a flat money payout.

It should support:

- base reward
- mode-adjusted duration/reward
- optional quality bonus
- optional rare bonus

- [ ] **Step 5: Verify migration safety**

Manual check:

- legacy saves without mode state still load
- existing recipes still work with default mode selection

- [ ] **Step 6: Commit**

```bash
git add src/constants/gameConfig.jsx src/hooks/useCraftingProductionMode.jsx src/hooks/useGameState.jsx src/hooks/useCrafting.jsx
git commit -m "feat: add crafting modes and quality outcomes"
```

### Task 6: Rebuild crafting UI around production choices and result clarity

**Files:**
- Modify: `src/components/ClickerGame/UpgradeTabs/Crafting.jsx`
- Create: `src/components/ClickerGame/UpgradeTabs/CraftingProductionCard.jsx`
- Modify: `src/components/ClickerGame/index.jsx`
- Modify: `src/scss/components/_tabs.scss`
- Modify: `src/scss/components/_buttons.scss`

- [ ] **Step 1: Split crafting recipe rendering into a dedicated production card**

The card should render:

- recipe identity
- mode selector
- projected reward
- projected duration
- pending reward state
- quality/timing hint

- [ ] **Step 2: Update claim UX to emphasize result quality**

When a craft is ready, the claim UI should clearly communicate:

- standard result
- bonus result if achieved
- rare result if applicable

Avoid hidden math. Surface the outcome.

- [ ] **Step 3: Connect crafting visibility to the prestige journey**

In `ClickerGame/index.jsx`, ensure that once prestige is reached, the move into wealth production feels intentional:

- milestone messaging from phase 1 points here
- unlock copy reflects production choices, not only payout

- [ ] **Step 4: Verify manual gameplay flow**

Run `npm run dev` and check:

- first prestige leads cleanly toward wealth production
- player can understand the difference between available production modes
- claim moment feels different from a generic button press

- [ ] **Step 5: Run static verification**

Run:

- `npm run lint`
- `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/components/ClickerGame/UpgradeTabs/Crafting.jsx src/components/ClickerGame/UpgradeTabs/CraftingProductionCard.jsx src/components/ClickerGame/index.jsx src/scss/components/_tabs.scss src/scss/components/_buttons.scss
git commit -m "feat: redesign crafting production flow"
```

### Phase 3 Exit Criteria

- Crafting presents at least one meaningful choice per recipe
- Claiming a finished production can produce visibly different outcomes
- Post-prestige gameplay feels like a new phase, not just a new income source

---

## Cross-Phase Review Checklist

- [ ] Fresh saves still progress from basic upgrades into investments without confusion
- [ ] Existing saves load without crashing despite new state fields
- [ ] The next major milestone is always readable
- [ ] Investments communicate distinct identities
- [ ] Crafting communicates choices, not just payout
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Recommended Shipping Order

1. Phase 1 on its own
2. Phase 2 after at least one live review pass on roadmap messaging
3. Phase 3 only after investment-role language is stable enough to reuse in crafting messaging

## Self-Review

### Spec coverage

- Fun-factor analysis asks for stronger anticipation: covered by phase 1
- Top-3 proposal asks for differentiated investments: covered by phase 2
- Top-3 proposal asks for a stronger post-prestige crafting loop: covered by phase 3

### Placeholder scan

No `TODO`, `TBD`, or deferred “write tests later” placeholders were left in the plan. Verification relies on existing repo commands plus explicit manual checks because the project does not currently expose a dedicated automated app test script.

### Type consistency

Proposed new hooks and components have consistent naming and clear single responsibilities:

- `useUnlockRoadmap`
- `useInvestmentBoosts`
- `useCraftingProductionMode`
- `UnlockRoadmapCard`
- `InvestmentBoostMeter`
- `CraftingProductionCard`

