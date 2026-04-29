# Konzept: Production HQ Nach Dem Hard Phase Shift

Stand: 2026-04-29

## Zweck

Dieses Dokument beschreibt den aktuellen Stand von `Production HQ` nach dem Umbau vom alten geldbasierten Late-Game-Tab zu einer eigenen Post-Cash-Phase.

Es beantwortet vier Fragen:

1. Was ist die neue Idee hinter `Production HQ`?
2. Was ist bereits im Code und im Spiel umgesetzt?
3. Wie spielt sich die Phase aktuell?
4. Welche sinnvollen Ausbauschritte bieten sich als Nächstes an?

Das Dokument ist bewusst kein reines Changelog. Es soll die Produktidee, den aktuellen Feature-Stand und die nächsten Möglichkeiten in einer gemeinsamen Sicht zusammenführen.

## Kurzfazit

`Production HQ` ist nicht mehr als weiterer Upgrade-Tab im Geldspiel gedacht.

Der aktuelle Stand ist:

- ein irreversibler `Hard Phase Shift`
- klares Ende der Cash-Phase
- alte geldbasierte Hauptsysteme verschwinden aus der Haupt-UI
- eine erste spielbare HQ-V1 mit:
  - passiver Extraktion
  - aktiven Burst-Fenstern
  - Komponentenfertigung
  - HQ-Core-Fortschritt
  - ersten HQ-Upgrades

Damit ist der wichtigste strukturelle Schritt bereits gemacht:

`Das Late-Game hängt nicht mehr nur weiteren Content an das Geldspiel an, sondern beginnt eine neue Phase mit eigener Logik.`

## Produktidee

Der Leitgedanke für das neue Late-Game lautet:

`Ab einem bestimmten Punkt ist Geld narrativ und spielerisch vorbei.`

Vorher war `Crafting` noch stark an das alte System gebunden:

- Materialien kaufen mit Geld
- Rezept starten
- Geld-Reward einsammeln
- HQ als Effizienzaufsatz auf denselben Loop

Die neue Entscheidung war deshalb:

- kein weiterer Soft-Upgrade-Pfad
- kein weiterer numerischer Cash-Layer
- kein Parallelbetrieb von altem und neuem Spiel

Stattdessen:

- klarer Trigger
- klare Bestätigung
- sichtbarer Bruch
- neuer Produktions-Loop

## Trigger Und Übergang

Der Einstieg in `Production HQ` funktioniert aktuell so:

- `Wealth Production` muss freigeschaltet sein
- der Spieler braucht mindestens:
  - `10 Collectible Coins`
  - `5 Gold Reserves`

Danach erscheint in `Crafting` ein singulärer CTA:

- `Enter Production HQ`

Der Wechsel wird über ein eigenes Bestätigungs-Modal abgesichert.

Wichtig:

- der Übergang ist bewusst
- der Übergang ist irreversibel
- der Übergang beendet die Cash-Phase dauerhaft

## Was Nach Dem Shift Passiert

Sobald der Spieler `Enter Production HQ` bestätigt, wechselt das Spiel in `hq_phase`.

Das bedeutet aktuell:

- die Capital-Phase bleibt im Save erhalten, aber ist nicht mehr die aktive Hauptspielfläche
- die Bottom-Tab-Navigation des alten Spiels verschwindet
- `Production HQ` wird zur zentralen Oberfläche

Wichtiger technischer Punkt:

Nicht nur die UI wurde umgeschaltet.

Auch die alten laufenden Systeme der Capital-Phase werden in `hq_phase` abgeschaltet:

- Manager-Autoclicks
- alte Cooldown-Intervalle
- passive Geld-Income-Ticks
- Autobuyer
- alte Production-Automation
- Floating-Click-Statistikloops der Cash-Phase

Das ist wichtig für:

- saubere Spielsemantik
- weniger CPU-/RAM-Last
- keine alten Sound- oder State-Leaks in die neue Phase

## Aktueller Spielbarer HQ-V1 Loop

Die neue Phase ist aktuell als erster aktiver Produktionsloop umgesetzt.

### 1. Extraction

Es gibt drei Basismaterialien:

- `Scrap`
- `Circuits`
- `Alloy`

Diese steigen passiv über Zeit.

Zusätzlich besitzt jedes Material einen aktiven `Overdrive`:

- sofortiger Material-Burst
- eigener Cooldown
- klare Entscheidung, wann der Burst benutzt wird

Dadurch ist die Phase nicht rein passiv, sondern hat kurze aktive Verdichtungsmomente.

### 2. Precision Window

Zusätzlich gibt es ein globales aktives Fenster:

- `Trigger Precision Window`

Während dieses Fensters liefern Crafts in `Assembly` mehr Output.

Spielerisch ist das aktuell der wichtigste aktive HQ-Moment, weil er sofort eine Frage erzeugt:

`Nutze ich Materialien sofort oder warte ich auf ein stärkeres Precision-Fenster?`

### 3. Assembly

Basismaterialien werden in Komponenten umgewandelt.

Aktuell gibt es:

- `Frames`
- `Relays`
- `Control Units`

Jede Komponente hat:

- feste Materialkosten
- sichtbaren Bestand
- klar lesbare Rolle im HQ-Ausbau

Während das `Precision Window` aktiv ist, steigt der Output pro Craft.

### 4. HQ Core

Komponenten können nicht nur in Upgrades fließen, sondern auch in den `HQ Core`.

Der Core dient als Fortschrittsanker der Phase:

- Komponenten investieren
- Fortschritt innerhalb des Tiers erhöhen
- nächstes Tier freischalten

Damit entsteht bereits eine erste echte Entscheidung:

`Nutze ich meine Komponenten für bessere Produktion oder für den direkten Core-Fortschritt?`

### 5. HQ Upgrades

Es gibt aktuell drei HQ-spezifische Upgrades:

- `Flux Lines`
  - steigert passive Extraktion
- `Calibration Matrix`
  - verstärkt den Bonus des Precision Window
- `Thermal Sinks`
  - verkürzt Overdrive-Cooldowns und verlängert Precision Window

Diese Upgrades sind bewusst keine alten Geldupgrades mit neuen Namen, sondern greifen direkt in den neuen Produktionsstil ein.

## Aktuell Noch Vorhandene Alt-Systeme

Es gibt im Save und im Code weiterhin Reste des früheren `Production HQ`-Ansatzes.

Dazu gehören unter anderem:

- frühere HQ-Upgrades für Crafting-Value / Speed / Materialkosten
- alte Crafting-nahe Automatisierungszustände
- alte Meilenstein- und Persistenzfelder

Wichtig ist:

Diese Alt-Systeme sind derzeit nicht das primäre Herzstück der `hq_phase`.

Sie existieren teilweise noch, weil:

- Save-Migrationen weniger riskant bleiben
- bestehender Code nicht unnötig destruktiv entfernt wurde
- die neue HQ-Phase iterativ aufgebaut wird

Perspektivisch sollte der Code hier weiter bereinigt werden, sobald klar ist, welche Teile dauerhaft noch gebraucht werden.

## Was Bereits Gut Funktioniert

Der aktuelle Stand löst mehrere frühere Late-Game-Probleme bereits spürbar:

### 1. Der Bruch ist klarer

Vorher war `Production HQ` eher:

`mehr Systeme im gleichen Spiel`

Jetzt ist es deutlich stärker:

`neue Phase mit anderen Prioritäten`

### 2. Crafting Ist Nicht Mehr Nur Geldproduktion

Die neue HQ-Phase verschiebt den Fokus weg von:

- Euro-Ertrag
- Prestige-Denken
- altem Kaufmenü-Verhalten

hin zu:

- Ressourcenfluss
- Timing
- Komponentenallokation

### 3. Der Spieler Hat Wieder Kürzere Entscheidungen

Die Kombination aus:

- Overdrive
- Precision Window
- Upgrade vs. Core

erzeugt wieder kleine aktive Entscheidungen statt nur passives Abarbeiten.

## Bekannte Grenzen Der Aktuellen V1

Trotz des großen Fortschritts ist die HQ-Phase noch klar V1.

### 1. Die Produktion ist noch relativ flach

Der Loop ist schon spielbar, aber noch nicht tief.

Aktuell fehlt noch mehr von:

- Spezialisierung
- Richtungsentscheidung
- längerfristiger Produktionsplanung

### 2. Es gibt noch wenig Überraschung

Die neue Phase hat bereits aktive Fenster, aber noch kaum:

- seltene Events
- Lucky Moments
- kritische Produktionsresultate
- situative Ausnahmezustände

### 3. Die visuelle Identität ist noch funktional

Die Phase funktioniert spielmechanisch, aber die UI ist noch nicht stark genug als:

- “neues Spiel im Spiel”
- Maschinenraum / HQ / Industriezentrum

inszeniert.

### 4. Alte und neue HQ-Ideen liegen teilweise nebeneinander

Es gibt noch eine Übergangsphase zwischen:

- altem `Crafting-HQ`-Denken
- neuem `Post-Cash-HQ`-Denken

Das ist okay für den aktuellen Ausbau, sollte aber später konsolidiert werden.

## Sinnvolle Nächste Ausbaustufen

Die folgenden Richtungen passen gut zum bereits gebauten System.

### A. Seltene HQ-Events

Mögliche Beispiele:

- `Power Surge`
  - Overdrive ohne Cooldown für 10 Sekunden
- `Signal Drift`
  - Precision Window stärker, aber kürzer
- `Contaminated Alloy`
  - ein Materialfluss sinkt kurz, ein anderer explodiert

Warum sinnvoll:

- mehr Spontaneität
- mehr Dopamin-Momente
- mehr aktives Reagieren

### B. Produktionsdoktrinen

Eine frühe dauerhafte Wahl könnte den HQ-Stil prägen:

- `Throughput`
  - mehr passive Extraktion
  - schwächere Burst-Fenster
- `Precision`
  - stärkere aktive Fenster
  - geringerer Basisertrag

Warum sinnvoll:

- mehr Identität
- mehr Wiederspiel-Fantasie im Kopf
- das HQ fühlt sich weniger generisch an

### C. Erweiterte Komponentenketten

Beispiele:

- Zwischenprodukte
- zwei alternative Rezepte für denselben Output
- seltene High-End-Komponenten

Warum sinnvoll:

- mehr Tiefe
- mehr Ressourcenabwägung
- mehr “Wie richte ich meinen Flow ein?”

Wichtig:

Nur schrittweise einführen.
Zu viele Produktionsstufen auf einmal würden die klare V1 verwässern.

### D. HQ-Projekte Statt Nur Tier-Fortschritt

Statt nur linearer Core-Stufen könnten später konkrete Projekte entstehen:

- neuer Extraktionsarm
- stabilere Präzisionskammer
- zweite Assembly-Linie
- Event-Radar

Warum sinnvoll:

- freigeschaltete Features fühlen sich greifbarer an
- Fortschritt bekommt mehr Persönlichkeit

### E. Eigene Audio-/Visual-Dramaturgie

Der Schritt ist wichtig, sobald die Mechanik stabil ist.

Sinnvolle Hebel:

- anderer Hintergrundsound für HQ
- stärkere Overdrive-/Precision-FX
- klarer Fortschrittsmoment bei Core-Installationen
- andere Farb- und Layoutsprache als im Geldspiel

## Technische Leitlinien Für Die Nächsten Schritte

Für weitere Ausbauten sollten folgende Regeln beibehalten werden:

### 1. `hq_phase` bleibt eine echte Laufzeitgrenze

Nicht wieder alte Cash-Intervalle oder Semantik in die neue Phase zurückleaken lassen.

### 2. Neue HQ-Mechaniken zuerst als saubere Helper oder dedizierte Hooks modellieren

Die aktuelle Richtung mit testbaren HQ-Helpern ist gut und sollte fortgesetzt werden.

### 3. Alte HQ-/Crafting-Überbleibsel bewusst konsolidieren

Nicht alles sofort löschen, aber mittelfristig klar entscheiden:

- was gehört noch zur Capital-Phase?
- was gehört dauerhaft zur HQ-Phase?
- was ist nur historischer Ballast?

## Zusammenfassung

`Production HQ` ist aktuell in einem guten Übergangszustand:

- der wichtigste Paradigmenwechsel ist gebaut
- die neue Phase ist bereits spielbar
- die alte Capital-Phase läuft in HQ nicht mehr unsichtbar weiter
- erste aktive Produktionsentscheidungen sind vorhanden

Was jetzt noch fehlt, ist nicht mehr die Grundidee, sondern:

- mehr Tiefe
- mehr Persönlichkeit
- mehr Event- und Dramaturgie-Momente
- schrittweise stärkere Eigenständigkeit der HQ-Welt

Die wichtigste Grundlage dafür ist bereits da.
