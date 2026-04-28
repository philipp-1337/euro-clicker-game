# Konzept: Production HQ (Wealth Production Erweiterung)

## Status-Update 2026-04-28

Der bisherige Stand war nicht mehr konsistent mit dem Code:

* Die zentrale `gameConfig`-Definition war syntaktisch beschädigt, wodurch der gesamte Production-HQ-Branch nicht mehr buildbar war.
* Die Materialkosten-Reduktion wurde im UI und in der Affordability-Prüfung berücksichtigt, aber nicht in der tatsächlichen Geldabbuchung beim Rohstoffkauf.
* Das permanente Unlock-Flag für das HQ war nicht sauber im Initialzustand verankert.
* Die Roadmap-Auflösung für verschachtelte Werte wie `craftingItems.0` war fehleranfällig.

Diese Punkte sind jetzt technisch bereinigt:

* Build wiederhergestellt.
* Materialkosten-Upgrade wirkt nun konsistent auf Anzeige, Kaufprüfung und tatsächliche Abbuchung.
* `isProductionHqUnlocked` ist sauber Teil des Initialzustands.
* Der Roadmap-Fortschritt für das HQ liest die Crafting-Zähler korrekt aus.
* Das HQ zeigt die aktuell aktiven Effizienzboni jetzt direkt im Tab an.
* Die bisherigen Testkosten (`1` / `1`) wurden durch erste echte Balancing-Werte ersetzt, damit das System nicht sofort leergekauft wird.

Dieses Dokument fasst alle im Rahmen der letzten Konversation vorgenommenen Änderungen und Implementierungen zum Ausbau des "Wealth Production"-Systems, auch bekannt als "Production HQ", zusammen. Es dient als Grundlage für zukünftige Reviews, Refactorings und Weiterentwicklungen.

## 1. Ausgangssituation und Ziele

**Initialer Wunsch des Nutzers:**
*   Erweiterung des Crafting-Systems um Upgrades (günstigere Rohstoffe, höhere Wahrscheinlichkeit für seltene Ergebnisse, schnelleres Crafting, mehr Ertrag).
*   Automatisierung des Rohstoffkaufs und des Craftings.

**Hauptziele dieser Implementierung:**
*   Schaffung eines neuen Hauptbereichs "Production HQ".
*   Implementierung verschiedener Crafting-bezogener Upgrades.
*   Implementierung von Automatisierungs-Modulen.
*   Nahtlose Integration in das bestehende Spiel (UI, UX, Code-Architektur).
*   Integration in das "Next Milestone"-System.

## 2. Implementierte Features und Änderungen

### 2.1 Production HQ Tab & Freischaltbedingung

**Beschreibung:** Ein neuer Tab in der Hauptnavigation, der nach dem ersten Prestige sichtbar wird. Der Zugang zu den Upgrades in diesem Tab ist jedoch erst möglich, wenn bestimmte Crafting-Ziele erreicht wurden.

**Details:**
*   **Sichtbarkeit des Tabs:** Der Tab "Prod. HQ" wird sichtbar, sobald der Spieler mindestens einmal `prestigeCount > 0` erreicht hat.
    *   `src/components/ClickerGame/BottomTabMenu.jsx`: Logik angepasst, um `prestigeCount` zu prüfen.
    *   `src/components/ClickerGame/index.jsx`: `prestigeCount` wird an `BottomTabMenu` weitergegeben.
*   **Zugang zu Upgrades innerhalb des Tabs:** Die Upgrades selbst sind erst zugänglich, wenn 10 "Collectible Coins" (`craftingItems[0]`) und 5 "Gold Reserves" (`craftingItems[1]`) produziert wurden. Vorher wird ein "Locked"-Bildschirm angezeigt.
    *   `src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx`: Implementierung des bedingten Renderings (Sperrbildschirm vs. Upgrades). Zeigt den Fortschritt zu den Freischaltbedingungen an.
    *   `src/components/ClickerGame/index.jsx`: `isProductionHqUnlocked` (dauerhaftes Flag) wird an `ProductionHQ` weitergegeben.

### 2.2 Integration in das "Next Milestone" System

**Beschreibung:** Das Freischalten des Production HQ wird als Meilenstein in der Roadmap des Spiels angezeigt.

**Details:**
*   **Neuer Zustand:**
    *   `src/hooks/useGameState.jsx`: `isProductionHqUnlocked` (Boolean) hinzugefügt, wird gespeichert und geladen.
    *   `src/hooks/useGameCore.jsx`: Ein `useEffect` überwacht `craftingItems` und setzt `isProductionHqUnlocked` auf `true`, sobald die Bedingung (10 Coins, 5 Gold) erfüllt ist. Dieses Flag ist permanent.
*   **Meilenstein-Definition:**
    *   `src/constants/gameConfig.jsx`: Ein neuer Eintrag in `unlockRoadmap` für "productionHq".
        *   `reachedWhen: { type: "flag", key: "isProductionHqUnlocked" }`
        *   `progressSegments`: Definiert den Fortschritt basierend auf `craftingItems[0]` und `craftingItems[1]`.
        *   `remainingRequirements`: Textformatierung für den verbleibenden Bedarf mit neuem `crafted_item`-Format.
*   **Roadmap-Logik-Anpassung:**
    *   `src/hooks/useUnlockRoadmap.jsx`:
        *   `getContextValue` wurde erweitert, um verschachtelte Schlüssel wie `craftingItems.0` zu verarbeiten.
        *   `formatRemainingRequirement` wurde erweitert, um das neue `crafted_item`-Format mit `itemName` zu unterstützen.
        *   Hook-Signatur um `craftingItems` und `isProductionHqUnlocked` erweitert.

### 2.3 Crafting Upgrades (Effizienz-Upgrades)

**Beschreibung:** Drei Upgrades, die die Effizienz der Wealth Production steigern: Wert, Geschwindigkeit und Materialkosten.

**Details:**
*   **Konfiguration:**
    *   `src/constants/gameConfig.jsx`:
        *   Neue Konstanten `PRODUCTION_HQ_BASE_COST_COINS`, `PRODUCTION_HQ_BASE_COST_GOLD`, `PRODUCTION_HQ_COST_MULTIPLIER` für refaktorierte Kostenberechnung.
        *   Konstanten für Effektschritte (z.B. `PRODUCTION_HQ_CRAFTING_VALUE_STEP`).
        *   `productionHqUpgrades` Array enthält Definitionen für:
            *   `crafting_value` ("Polished Molds"): Erhöht den Wert gecrafteter Items. Kostet nur Gold.
            *   `crafting_speed` ("Efficient Pipelines"): Reduziert Crafting-Zeit. Kostet nur Coins.
            *   `material_cost` ("Material Sourcing"): Reduziert Rohstoffkosten. Kostet Coins und Gold.
        *   Initialisierung der Upgrade-Level im `initialState`.
*   **Logik:**
    *   `src/hooks/useProductionHq.jsx` (neu erstellt):
        *   Berechnet `productionHqValueMultiplier`, `productionHqSpeedMultiplier`, `productionHqMaterialCostMultiplier` basierend auf den Upgrade-Leveln.
        *   Implementiert `buyProductionHqUpgrade` Funktion, die Kosten abzieht und Upgrade-Level erhöht.
    *   `src/hooks/useGameCore.jsx`:
        *   Bindet `useProductionHq` ein, exportiert die Multiplikatoren und die Kauf-Funktion.
        *   Wendet `productionHqMaterialCostMultiplier` auf die interne `getMaterialPurchaseCost`-Berechnung an.
    *   `src/hooks/useCrafting.jsx`:
        *   Akzeptiert `productionHqMaterialCostMultiplier`, `productionHqValueMultiplier`, `productionHqSpeedMultiplier`.
        *   Übergibt `productionHqValueMultiplier` an `useCraftingProductionMode`.
        *   Wendet `productionHqSpeedMultiplier` auf die Cooldown-Berechnung in `getRecipeCooldownSeconds` an.
        *   Wendet `productionHqMaterialCostMultiplier` auf die `calculateTotalCost`-Berechnung im UI an.
    *   `src/hooks/useCraftingProductionMode.jsx`:
        *   Akzeptiert `productionHqValueMultiplier`.
        *   Wendet diesen Multiplikator auf die finale Geldberechnung in `resolveCraftOutcome` an.
*   **UI-Anzeige:**
    *   `src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx`: Zeigt die Upgrade-Karten an.
    *   `src/components/ClickerGame/UpgradeTabs/CraftingProductionCard.jsx`:
        *   Akzeptiert `productionHqValueMultiplier` und `productionHqSpeedMultiplier`.
        *   Aktualisiert die Anzeige von "Voraussichtliche Dauer" (`getDurationSeconds`) und "Standardergebnis" (`getBaseReward`) basierend auf diesen Multiplikatoren.
    *   Kostenanzeige wurde auf Textformat ("4 Coins", "1 Gold") umgestellt und Nachkommastellen entfernt.

### 2.4 Automatisierungs-Module

**Beschreibung:** Zwei Module, die das Rohstoffmanagement und den Crafting-Prozess automatisieren.

**Details:**
*   **Konfiguration:**
    *   `src/constants/gameConfig.jsx`: Definitionen für `auto_buy_materials` ("Logistics Manager") und `auto_craft` ("Production Manager") in `productionHqUpgrades`.
    *   `initialState`: `autoBuyMaterialsEnabled` und `autoCraftEnabled` (Boolean-Flags für Aktivierungsstatus) hinzugefügt.
*   **Zustandsverwaltung:**
    *   `src/hooks/useGameState.jsx`: `autoBuyMaterialsEnabled`, `autoCraftEnabled` werden hinzugefügt (Speichern/Laden).
    *   `src/hooks/useGameCore.jsx`: Bindet die neuen Zustände ein und exportiert sie.
*   **Logik-Hook:**
    *   `src/hooks/useProductionAutomation.jsx` (neu erstellt):
        *   Nutzt `useEffect` mit `setInterval`, um Logik alle 2 Sekunden auszuführen.
        *   Verwendet `useRef` für `rawMaterials` und `craftingProductionState`, um Stale-Closure-Probleme zu vermeiden.
        *   **Material Logistics Manager:** Wenn `autoBuyMaterialsEnabled` aktiv ist und Rohstoffe unter einem Schwellenwert liegen (derzeit 10 Einheiten), ruft es `buyMaterial` auf.
        *   **Production Line Manager:** Wenn `autoCraftEnabled` aktiv ist, prüft es, ob ein Crafting-Prozess fertig zum Claimen ist oder ob ein neuer gestartet werden kann (wenn genug Rohstoffe vorhanden sind).
*   **UI-Anzeige:**
    *   `src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx`:
        *   Implementiert `AutomationCard` Komponente.
        *   Zeigt diese Karten für Automatisierungs-Upgrades an.
        *   Wenn ein Modul gekauft wurde, wird ein Button zum Aktivieren/Deaktivieren (`setAutoBuyMaterialsEnabled`, `setAutoCraftEnabled`) angezeigt.

## 3. Bekannte und behobene Bugs/Anmerkungen

*   **ReferenceError `buyMaterial`/`wrappedBuyMaterial`:** Behoben durch Korrektur der Aufrufreihenfolge von Hooks in `useGameCore.jsx`. `useProductionAutomation` wird nun nach `useCrafting` aufgerufen, damit `buyMaterial` etc. verfügbar sind.
*   **Stale Closures in Automation:** Behoben durch die Verwendung von `useRef` für `rawMaterials` und `craftingProductionState` innerhalb von `useProductionAutomation`, um sicherzustellen, dass die `setInterval`-Callbacks immer auf die aktuellsten Werte zugreifen.
*   **Unused Imports:** `Coins` und `Layers` Icons aus `ProductionHQ.jsx` entfernt, nachdem die Kostenanzeige auf Text umgestellt wurde.

## 4. Liste der geänderten/erstellten Dateien

**Neu erstellt:**
*   `src/hooks/useProductionHq.jsx`
*   `src/hooks/useProductionAutomation.jsx`
*   `src/components/ClickerGame/UpgradeTabs/ProductionHQ.jsx`

**Geändert:**
*   `src/constants/gameConfig.jsx`
*   `src/hooks/useGameState.jsx`
*   `src/hooks/useGameCore.jsx`
*   `src/hooks/useCrafting.jsx`
*   `src/hooks/useCraftingProductionMode.jsx`
*   `src/hooks/useUnlockRoadmap.jsx`
*   `src/components/ClickerGame/index.jsx`
*   `src/components/ClickerGame/BottomTabMenu.jsx`
*   `src/components/ClickerGame/UpgradeTabs/Crafting.jsx`
*   `src/components/ClickerGame/UpgradeTabs/CraftingProductionCard.jsx`

## 5. Offene Punkte, Ideen & Herausforderungen

Dieser Abschnitt beleuchtet Bereiche, die während der Implementierung als Stolpersteine identifiziert wurden, noch offene Fragen aufwerfen oder Potenzial für zukünftige Verbesserungen und Erweiterungen bieten.

### 5.1 Manuelle Verifikation im Spiel (bleibt sinnvoll)
Die kritischsten technischen Inkonsistenzen sind behoben. Was bleibt, ist die spielnahe QA im laufenden Spiel:
*   **Effizienz-Upgrades:**
    *   **"Polished Molds" (Wert):** Steigt der finale Euro-Betrag eines gecrafteten Items, angezeigt in der `CraftingProductionCard` und nach dem Claimen?
    *   **"Efficient Pipelines" (Geschwindigkeit):** Reduziert sich die Produktionszeit, angezeigt in der `CraftingProductionCard`?
    *   **"Material Sourcing" (Materialkosten):** Reduzieren sich angezeigte Kosten und tatsächliche Abbuchung beim Materialkauf identisch?
*   **Automatisierungs-Module:**
    *   **"Logistics Manager":** Werden Rohstoffe automatisch nachgekauft, wenn der Bestand unter 10 Einheiten fällt und genug Geld vorhanden ist?
    *   **"Production Manager":** Werden Crafting-Prozesse automatisch gestartet, wenn Materialien vorhanden sind, und abgeschlossen/geclaimed, wenn sie fertig sind?

### 5.2 Balancing und Spielökonomie
*   **Upgrade-Kosten:** Die Testkosten wurden entfernt. Der neue Stand ist ein erster spielbarer Baseline-Pass, aber noch kein finaler Economy-Tune.
*   **Effektstärken und Maximallevel:** Die `effectPerLevel` und `maxLevel` der Upgrades müssen ebenfalls im Kontext der gesamten Spielökonomie evaluiert und ggf. angepasst werden.
*   **Automatisierungs-Schwellenwerte:** Der Schwellenwert für den automatischen Nachkauf von Materialien (`if (owned < 10)`) ist derzeit fest auf 10 Einheiten gesetzt. Eine Verbesserung wäre, diesen Wert konfigurierbar zu machen (z.B. über ein weiteres Upgrade oder eine Einstellung im Production HQ).

### 5.3 Benutzererfahrung (UX) und Visualisierung
*   **Sichtbarkeit von Multiplikatoren:** Eine zentrale Anzeige der aktuell aktiven HQ-Boni ist jetzt im "Production HQ"-Tab vorhanden. Optional wäre später noch eine zusätzliche Spiegelung direkt im "Crafting"-Tab sinnvoll.
*   **Feedback für Automatisierung:** Visuelles oder akustisches Feedback, wenn Automatisierungs-Module Aktionen ausführen (Material gekauft, Crafting gestartet/geclaimed), könnte die UX verbessern.

### 5.4 Code-Architektur und Skalierbarkeit
*   **Code-Komplexität von `useGameCore.jsx`:** Der `useGameCore`-Hook ist weiterhin sehr umfangreich. Obwohl viele Aspekte in spezialisierte Sub-Hooks ausgelagert wurden, bleibt die zentrale Koordination komplex. Zukünftige Erweiterungen sollten diese Struktur weiterhin respektieren oder alternative, noch modularere Ansätze prüfen, um die Wartbarkeit langfristig zu gewährleisten.
*   **Skalierbarkeit von `productionHqUpgrades` in `initialState`:** Der `initialState` wird derzeit manuell um neue Upgrade-IDs erweitert. Für eine größere Anzahl von Upgrades könnte eine dynamischere Initialisierung basierend auf `gameConfig.productionHqUpgrades` (ähnlich `craftingItems`) sinnvoll sein, um den Wartungsaufwand zu reduzieren.
*   **`useEffect` mit `setInterval` und Stale Closures:** Die Verwendung von `useRef` zur Vermeidung von Stale Closures ist eine gängige Praxis, aber bei komplexen Abhängigkeiten immer eine Quelle potenzieller Fehler. Gründliches Testen und eventuell Refactoring (z.B. Nutzung von `useReducer` oder anderen State-Management-Pattern für komplexere Intervalle) ist hier unerlässlich.

### 5.5 Ideen für zukünftige Erweiterungen
*   **Zusätzliche Automatisierungs-Module:**
    *   **Auto-Prestige:** Ein Modul, das automatisch prestigt, wenn bestimmte Bedingungen erfüllt sind.
    *   **Auto-Upgrade-Käufer:** Ein Modul, das automatisch "Production HQ"-Upgrades kauft.
    *   **Priorisierung für Auto-Crafting:** Konfigurierbare Prioritäten für welche Rezepte der "Production Manager" zuerst craften soll.
    *   **Ziel-Menge für Material-Kauf:** Statt eines festen Schwellenwerts könnte der Spieler ein Ziel-Inventar (z.B. "halte immer 100 Metal") einstellen.
*   **Seltene Material-Drops:** Zufällige, seltene Material-Drops aus anderen Spielaktivitäten, die das Crafting beeinflussen.
*   **Crafting-Queue:** Eine Warteschlange für Crafting-Rezepte, die der "Production Manager" abarbeiten kann.

---

Ich hoffe, dieses detaillierte Konzeptdokument mit den zusätzlichen Anmerkungen hilft dir, einen klaren Überblick über die vorgenommenen Änderungen zu bekommen und die weitere Entwicklung effizient zu gestalten.
