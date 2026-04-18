# Wealth Production (Crafting) - Roadmap & Verbesserungen

Dieses Dokument beschreibt strategische Ansätze zur Weiterentwicklung des Crafting-Systems ("Wealth Production"), um Spielspaß, Motivation und die Bedeutung des Endgames massiv zu steigern.

## 1. Von "Geld-Drucker" zum "Bonus-Generator" (Endgame-Tiefe)
Aktuell generiert Crafting primär Geld. Im Endgame verliert Geld jedoch oft an Bedeutung.

*   **Permanente Artefakte:** Einführung von Items, die keinen Cash-Bonus geben, sondern **permanente, über Prestiges hinweg beständige Boni**.
    *   *Beispiel:* "Meisterbrief der Prägekunst" (+1 % Profit auf alle Buttons, permanent).
    *   *Beispiel:* "Industrieller Schmelzofen" (-5 % Materialkosten-Steigerung).
*   **Prestige-Beschleuniger:** Items, die direkt `Prestige Shares` generieren oder die Schwelle für den nächsten Share senken. Das macht Crafting zur Kernstrategie für den Fortschritt.

## 2. Tiered Progression (Langzeitmotivation)
Die aktuelle Auswahl von Rezepten sollte durch eine spürbare Leiter ersetzt werden.

*   **Rezept-Freischaltungen:** Neue Rezepte an Meilensteine binden (z.B. "Crafte 50 Goldbarren, um 'Zentralbank-Reserven' freizuschalten").
*   **Material-Veredelung:** Einführung von Zwischenprodukten.
    *   *Stufe 1:* Eisen + Kohle -> Stahl.
    *   *Stufe 2:* Stahl + Elektronik -> Roboter-Arm.
    *   *Stufe 3:* Roboter-Arm -> "Automatisierte Fabrik" (Massiver Cashflow).
    *   Dies erzeugt eine "Crafting-Leiter", die den Spieler über Tage motiviert.

## 3. Spezialisierung & Skill-Tree (Spielspaß durch Wahlfreiheit)
Gib dem Spieler echte Entscheidungsfreiheit durch Forschung innerhalb des Crafting-Tabs.

*   **Pfad A (Massenproduktion):** Kürzere Cooldowns, aber geringere Erträge.
*   **Pfad B (Qualität):** Chance auf "Perfekte Items" (z.B. 5-facher Wert oder seltener Bonus).
*   **Pfad C (Ressourcen-Effizienz):** Chance, beim Craften keine Materialien zu verbrauchen.

## 4. System-Synergien (Integration mit Investments)
Verknüpfung der "Investments" mit "Wealth Production".

*   **Material-Sourcing:** Das Investment "Pharma" könnte passiv "Chemikalien" produzieren, die für High-End-Rezepte nötig sind.
*   **Investment-Boosts:** Ein neues Crafting-Item "Werbekampagne" könnte für 10 Minuten den Profit eines bestimmten Investments (z.B. "Taxi Company") verdoppeln.

## 5. Zufall & "Glücksmomente" (Dopamin)
*   **Kritische Erfolge:** 5 % Chance auf ein "Legendäres" Item, das zusätzlich eine seltene Ressource oder einen temporären globalen Multiplikator gibt.
*   **Dynamische Events:** "Rohstoffknappheit": Für 1 Stunde kostet Metall das 3-fache, aber der Verkaufspreis von Münzen ist 5-mal so hoch.

## 6. Automatisierung (Endgame-Optimierung)
Vermeidung von monotonem Klicken im Late-Game.

*   **Auto-Crafter:** Ein freischaltbares Upgrade (z.B. über Prestige-Punkte), das Materialien automatisch nachkauft und Rezepte startet, solange die Cash-Reserven ausreichen. Dies verwandelt Crafting von einer aktiven Tätigkeit in eine optimierbare "Engine".

---

## Technischer Umsetzungsvorschlag
Die `gameConfig.jsx` sollte um folgende Felder in `craftingRecipes` erweitert werden:
- `type: 'money' | 'buff' | 'prestige'`
- `buffEffect: { key: 'globalMultiplier', value: 0.05 }`
- `unlockRequirement: { type: 'count', recipeId: 'gold_bar', value: 50 }`

Die `useCrafting.jsx` Hook wird dann zum zentralen "Distributor", der je nach Item-Typ unterschiedliche State-Setter (z.B. `setGlobalMultiplier`, `setPrestigeShares`) anspricht.
