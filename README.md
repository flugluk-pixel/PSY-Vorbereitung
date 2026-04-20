# Speedrechner

Lokale, portable Trainingsumgebung mit 14 kognitiven Übungen. Die Anwendung läuft direkt aus der HTML-Datei, ohne Server und ohne Build-Schritt.

Die Übungslogik ist inzwischen vollständig in externe Dateien aufgeteilt; alle Mini-Module verwenden konsistente State-Container für Session-, Aufgaben- und Timerzustand.

## Schnellstart

- App öffnen: `PSY-Vorbereitung.html`
- In VS Code Smoke-Test starten: Task `Smoke-Test ausführen`
- Direkt per Shell testen:
  - Windows: `powershell -ExecutionPolicy Bypass -File .\tests\run-smoke-test.ps1`
  - macOS/Linux: `bash ./tests/run-smoke-test.sh`

## Voraussetzungen

- Für die App: ein aktueller Browser mit aktiviertem `localStorage`
- Für den Smoke-Test: `node` und `npm` im Pfad

## Projektaufbau

- `PSY-Vorbereitung.html`: Einstiegspunkt mit allen Screens und Templates
- `CHANGELOG.md`: kompaktes Änderungsprotokoll der letzten Anpassungen
- `assets/css/app.css`: gesamtes Styling
- `assets/js/core.js`: globaler Zustand, Navigation, Screen-Steuerung, Timer-Grundlogik
- `assets/js/exercises.js`: Übungslogik und modulbezogene Abläufe
- `assets/js/analytics.js`: Verlauf, Dashboard, Leistungswert, Export
- `tests/playwright-smoke.cjs`: browserbasierter Schnelltest
- `tests/run-smoke-test.ps1`: Windows-Wrapper für den Smoke-Test
- `tests/run-smoke-test.sh`: Unix-Wrapper für den Smoke-Test
- `STRUKTUR.md`: kompakte Struktur- und Transfernotiz

## Datenhaltung

- Trainingsdaten werden lokal im Browser über `localStorage` gespeichert.
- Es gibt keinen Server und keine Cloud-Synchronisation.
- Export ist über die Statistikansicht möglich.

## Hinweise

- Private/Inkognito-Modi können `localStorage` einschränken oder nach dem Schließen löschen.
- Die Anwendung ist bewusst ohne Build-Tool gehalten, damit sie leicht kopierbar und offline nutzbar bleibt.
- Der Smoke-Test installiert Playwright in einen temporären Cache außerhalb des Projektordners.
- Die Modularchitektur ist auf konsistente State-Container vereinheitlicht; neue Übungen sollten dieses Muster beibehalten statt lose Globals einzuführen.

## Letzte Änderungen (Scoring)

- Reaktionszeit-Auswertung im Testmodus für langsamere visuelle Module korrigiert: RT-Grenzen werden jetzt pro Modul über `rtMultiplier` skaliert statt global mit starren 1000 ms.
- Modulabhängige Komponenten-Gewichtung eingeführt: schnelle Reaktionsmodule gewichten `speed` höher, komplexere visuelle Module gewichten `accuracy` und `consistency` stärker.
- Interpretationstexte kontextsensitiv erweitert: schnelle Basisreaktion und komplexe visuelle Suche werden sprachlich getrennt eingeordnet.
- Analytics-Reaktionsprofil ebenfalls kontextsensitiv gemacht (Tempo-, Konstanz- und Genauigkeitstexte pro Modultyp differenziert).
- Kritischen Zonen-Edge-Case in der Score-Berechnung behoben: offene Zonenränder (`min`/`max` fehlt) erzeugen keine `NaN`-Scores mehr; Top-Leistungen verlieren dadurch keine Komponenten (`speed`/`consistency`/`memory`) mehr.
- Änderungen wurden gegen den Smoke-Test (`tests/run-smoke-test.ps1`) und zusätzliche Engine-Checks mit synthetischen Repro-Fällen validiert.