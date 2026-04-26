# Projektstruktur

Die Anwendung bleibt bewusst ohne Build-Schritt portabel.

Der aktuelle JS-Aufbau trennt gemeinsame Infrastruktur, Übungslogik und Auswertung klar voneinander; die Mini-Module verwenden ein einheitliches State-Container-Muster.

## Umgebung

- Browser mit aktiviertem `localStorage`
- Für den Smoke-Test: `node` und `npm` im Pfad
- Kein lokaler Server und kein Build-Tool notwendig
- Für PWA-Installation (iPad/Home-Screen): HTTPS-Bereitstellung empfohlen (zum Beispiel GitHub Pages)

## Dateien

- `PSY-Vorbereitung.html`
  - Einstiegspunkt mit kompletter Oberfläche
  - lädt nur noch externe CSS- und JS-Dateien
- `assets/css/app.css`
  - gesamtes Styling
- `assets/js/core.js`
  - globaler Zustand, Hilfsfunktionen, Navigation, Screen-Logik
  - zentrale State-Container und gemeinsame Timer-Cleanup-Helfer
- `assets/js/exercises.js`
  - gemeinsamer Anfangsteil der Übungslogik
  - frühe Module und modulübergreifende Helfer für Practice-Mode, Result-Guards und Startlogik
- `assets/js/exercises-rotation-speed.js`
  - Rotation, deklarative Action-Bindings, Speed-Rechnen, Kopfrechnen
- `assets/js/exercises-perception.js`
  - Formen vergleichen, Digit Span, Flanker, Visuelle Suche
- `assets/js/exercises-verbal.js`
  - P/Q-Scanner und Wortanalogien
- `assets/js/exercises-abstract.js`
  - Figurenmatrix und Operatorcheck
- `assets/js/analytics.js`
  - Verlauf, Leistungswert, Dashboard-Zusammenfassung, Export
- `assets/js/pwa.js`
  - registriert den Service Worker beim Laden
- `manifest.webmanifest`
  - PWA-Metadaten (Name, Start-URL, Darstellung, Theme-Farben, Icons)
- `sw.js`
  - App-Shell-Caching und Offline-Fallback nach erstem Laden
- `assets/icons/`
  - PWA- und iOS-Icons

## Transfer

Zum Übertragen reicht es, den kompletten Ordner zusammen zu kopieren.

Wichtig:
- Die relativen Pfade zwischen HTML und `assets/` müssen erhalten bleiben.
- Es wird kein Server und kein Build-Tool benötigt.
- Die Trainingsdaten liegen weiterhin lokal im Browser über `localStorage`.
- Für Home-Screen-Installation auf iPad die Seite per HTTPS bereitstellen.

## Start

- App lokal öffnen: `PSY-Vorbereitung.html`
- In VS Code testen: Task `Smoke-Test ausführen`
- Überblick und Bedienung: `README.md`

## Script-Reihenfolge

Die Anwendung bleibt ein Plain-Script-Setup ohne Bundler oder ES-Module. Deshalb ist die Lade-Reihenfolge der Übungsdateien verbindlich:

1. `assets/js/core.js`
2. `assets/js/exercises.js`
3. `assets/js/exercises-rotation-speed.js`
4. `assets/js/exercises-perception.js`
5. `assets/js/exercises-verbal.js`
6. `assets/js/exercises-abstract.js`

Danach folgen die Scoring-, App-, Analytics- und PWA-Skripte.

Wichtig:

- Neue Übungen nur dann weiter auslagern, wenn die Reihenfolge der globalen Abhängigkeiten erhalten bleibt.
- Kein isoliertes Umordnen einzelner `<script>`-Tags ohne erneuten Smoke-Test.

## Smoke-Test

Für einen wiederholbaren Browser-Schnelltest ohne `node_modules` im Projektordner:

- `powershell -ExecutionPolicy Bypass -File .\tests\run-smoke-test.ps1`
- `bash ./tests/run-smoke-test.sh`
- VS Code Task: `Smoke-Test ausführen`

Der Wrapper legt Playwright in einem temporären Cache außerhalb des Projekts ab und prüft zentrale Klickpfade im Dashboard und in mehreren Übungen headless gegen die lokale HTML-Datei.
