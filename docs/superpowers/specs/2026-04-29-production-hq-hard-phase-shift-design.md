# Production HQ Hard Phase Shift Design

## Ziel

Dieses Dokument beschreibt den gewünschten Late-Game-Umbau für das Clicker Game:

`Production HQ` soll kein weiterer Ausbau-Tab im Geldspiel sein, sondern ein irreversibler Systembruch nach dem Einstieg in `Crafting`.

Das Ziel ist ein klarer `Paperclips`-artiger Moment:

- sichtbarer Paradigmenwechsel
- Geldphase endet dauerhaft
- alte Menüs verschwinden
- neues Produktionsspiel beginnt

## Produktentscheidung

Die bevorzugte Lösung ist ein `Hard Phase Shift`.

Bewusst verworfen wurden:

- `Soft Conversion`
  Geld bleibt im Hintergrund relevant und wird nur im UI entwertet.
- `Parallel Worlds`
  Spieler kann zwischen altem Geldspiel und HQ hin- und herspringen.

Beides schwächt den gewünschten Bruch. Das neue Late-Game soll nicht wie ein weiterer Layer wirken, sondern wie ein neuer Abschnitt mit neuen Regeln.

## Spielerischer Trigger

Der Wechsel wird nicht automatisch beim Freischalten von `Crafting` ausgelöst.

Vorbedingungen:

- `Wealth Production` ist freigeschaltet
- der Spieler hat mindestens `10 Collectible Coins`
- der Spieler hat mindestens `5 Gold Reserves`

Wenn diese Bedingungen erfüllt sind, erscheint ein einmaliger CTA:

- Titel: `Production HQ Ready`
- Primäraktion: `Enter Production HQ`
- Warnung: `This permanently ends the cash phase.`

Der Wechsel wird also bewusst vom Spieler bestätigt und nicht still im Hintergrund ausgelöst.

## Verhalten Beim Eintritt

Beim Klick auf `Enter Production HQ` wird der Spielstatus irreversibel von `capital_phase` nach `hq_phase` verschoben.

Das bedeutet:

- `money` spielt mechanisch keine Rolle mehr
- die alte Geldökonomie erzeugt keinen relevanten Fortschritt mehr
- alle alten Geld- und Prestige-Menüs verschwinden aus der Haupt-UI
- `Production HQ` wird zur einzigen primären Spielfläche

Der Übergang ist dauerhaft. Eine Rückkehr zur alten Phase ist nicht vorgesehen.

## Sichtbare UI-Folgen

Nach dem Eintritt werden folgende Bereiche aus der Hauptoberfläche entfernt:

- `Money Banner`
- `Basic Upgrades`
- `Premium Upgrades`
- `Investments`
- `Prestige`
- bestehende geldbezogene CTA- und Roadmap-Elemente

Die Navigation und Primärmetriken werden neu auf die HQ-Phase ausgerichtet.

Der Spieler soll innerhalb weniger Sekunden verstehen:

`Das alte Spiel ist vorbei.`

## Rolle Von Coin Und Gold Reserve

`Collectible Coin` und `Gold Reserve` bleiben erhalten, aber nur als Schwellenobjekte für den Eintritt.

Sie sind in diesem Design:

- kein verbrauchter Eintrittspreis
- keine Hauptwährung des neuen HQ-Spiels
- kein dauerhaftes zentrales Farmziel im alten Sinne

Sie dokumentieren, dass der Spieler genug industrielle Basis aufgebaut hat, um die Geldphase hinter sich zu lassen.

## HQ-V1 Loop

Die erste Version des neuen Systems soll bewusst klein bleiben und eine neue Denkweise etablieren, nicht sofort ein großes Fabrikspiel simulieren.

Kernressourcen:

- `Raw Materials`
- `Components`
- `HQ Progress`

Kernloop:

1. Rohstoffe erzeugen oder extrahieren
2. Rohstoffe in Komponenten verarbeiten
3. Komponenten in HQ-Fortschritt investieren
4. neue Kapazität, Slots oder Effizienzmodule freischalten
5. dadurch neue Produktionsstufen erreichen

Wichtig ist:

`HQ Progress` ist kein umbenanntes Geld.

Das Spiel soll nach dem Shift nicht “Euro mit anderem Label” anbieten, sondern Produktionslogik, Verarbeitung und Ausbau.

## Empfohlener Umfang Für V1

Um Risiko zu begrenzen und die Identität trotzdem klar zu machen, sollte die erste HQ-Version klein und geschlossen sein.

Empfohlen:

- `3` Basismaterialien
- `2-3` Komponenten
- `1` HQ-Tier- oder Fortschrittsleiste
- `3-5` erste HQ-Upgrades oder Freischaltungen

Damit entsteht bereits:

- ein neuer Kernloop
- eine neue Informationsarchitektur
- ein echter visuell-mechanischer Bruch

ohne das Spiel sofort zu überfrachten.

## Architekturelle Leitentscheidung

Der Wechsel muss als globaler Spielphasenstatus modelliert werden, nicht als lose Sammlung einzelner Hide-Flags.

Empfohlenes Kernmodell:

- `gamePhase: "capital_phase" | "hq_phase"`
- `hasEnteredProductionHq: boolean`

Neue HQ-State-Bereiche:

- `hqMaterials`
- `hqComponents`
- `hqTier` oder `hqProgress`
- `hqUpgrades`
- `hqProductionState`

Alter State sollte nicht physisch gelöscht werden. Er darf im Save erhalten bleiben, wird in `hq_phase` aber nicht mehr in UI oder Progressionslogik verwendet.

Das reduziert Migrationsrisiko und vereinfacht Debugging und spätere Statistikansichten.

## UX-Inszenierung

Der Eintritt sollte nicht wie ein normaler Unlock oder Kaufbutton aussehen.

Empfohlen:

- Fullscreen Confirmation oder sehr dominantes Modal
- klare irreversible Sprache
- kurze Transition-Inszenierung vor dem UI-Wechsel
- anschließend neue Navigation, neue Primärmetriken, neues Framing

Zu vermeiden:

- stilles Umspringen ohne Erklärung
- ein kleiner Button zwischen normalen Upgrades
- alte Menüs, die nach dem Wechsel nur “deaktiviert” herumliegen

## Balancing-Grundsätze

Der Trigger `10 Coin / 5 Gold Reserve` soll sich verdient anfühlen und den Einstieg bewusst nach hinten ziehen.

Balancing-Ziele:

- der Eintritt ist klar Late-Game
- der Spieler spürt Vorbereitung und Aufbau
- der Wechsel fühlt sich wie ein Meilenstein an, nicht wie ein zufälliger Nebeneffekt

Für V1 ist nicht das perfekte Endgame-Balancing entscheidend, sondern:

- Klarheit des Bruchs
- Lesbarkeit des neuen Loops
- Gefühl einer neuen Phase

## Risiken

### 1. Der Bruch bleibt nur kosmetisch

Wenn Geld intern doch weiterhin viele Regeln steuert oder wenn alte Systeme zu sichtbar bleiben, verliert die Idee ihren Kern.

### 2. Die HQ-Phase ist zu dünn

Wenn nach dem Eintritt nur eine andere Ressource mit ähnlichem Kaufmuster wartet, wirkt der Shift wie ein UI-Trick.

### 3. Der Scope wird zu groß

Wenn sofort zu viele Produktionsketten, Zwischenprodukte und Sonderregeln implementiert werden, steigt das Risiko stark und die erste Version verliert Fokus.

## Nicht-Ziele Für V1

Diese Punkte sind bewusst nicht Teil der ersten Umsetzung:

- Rückkehr in die Geldphase
- zweite Prestige-Schleife innerhalb des HQ
- riesiger Fabriksimulator mit langen Produktionsbäumen
- vollständige Löschung des alten Save-Zustands

## Erfolgskriterien

Die Lösung ist erfolgreich, wenn:

- der Spieler den Eintritt als echten `Boom`-Moment wahrnimmt
- die alte Geldphase nach dem Wechsel keine mentale Hauptrolle mehr spielt
- `Production HQ` sich wie ein neues Spiel im selben Spiel anfühlt
- der neue Loop ohne Geld verständlich und motivierend funktioniert
