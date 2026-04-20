# PSY-Vorbereitung

Lokale, portable Trainingsumgebung mit 16 kognitiven Übungen. Die Anwendung läuft ohne Build-Schritt und kann direkt aus der HTML-Datei oder als PWA genutzt werden.

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
- Für PWA-Installation auf iPad: Bereitstellung per HTTPS (zum Beispiel GitHub Pages)

## Projektaufbau

- `PSY-Vorbereitung.html`: Einstiegspunkt mit allen Screens und Templates
- `CHANGELOG.md`: kompaktes Änderungsprotokoll der letzten Anpassungen
- `assets/css/app.css`: gesamtes Styling
- `assets/js/core.js`: globaler Zustand, Navigation, Screen-Steuerung, Timer-Grundlogik
- `assets/js/exercises.js`: Übungslogik und modulbezogene Abläufe
- `assets/js/analytics.js`: Verlauf, Dashboard, Leistungswert, Export
- `assets/js/pwa.js`: Registrierung des Service Workers
- `manifest.webmanifest`: PWA-Metadaten (Name, Farben, Start-URL, Icons)
- `sw.js`: Service Worker mit App-Shell-Caching für Offline-Nutzung nach erstem Laden
- `assets/icons/`: App-Icons für PWA und iOS-Home-Bildschirm
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
- Für iPad-Home-Screen-Installation und zuverlässige Service-Worker-Funktionen sollte die App über HTTPS ausgeliefert werden.
- Der Smoke-Test installiert Playwright in einen temporären Cache außerhalb des Projektordners.
- Die Modularchitektur ist auf konsistente State-Container vereinheitlicht; neue Übungen sollten dieses Muster beibehalten statt lose Globals einzuführen.

## Release-Checklist (GitHub + iPad)

1. Änderungen lokal prüfen
  - Smoke-Test ausführen: `powershell -ExecutionPolicy Bypass -File .\tests\run-smoke-test.ps1`
2. PWA-Änderungen vorbereiten
  - Bei Asset-/Manifest-Updates `CACHE_NAME` in `sw.js` erhöhen (z. B. `...-v5`)
  - Optional Cache-Busting für iOS/Safari nutzen (z. B. `?v=5` bei Manifest/Icon-Links)
3. Änderungen veröffentlichen
  - `git add .`
  - `git commit -m "<kurze aenderungsbeschreibung>"`
  - `git push origin main`
4. GitHub Pages prüfen
  - Live-URL öffnen und Hard-Reload ausführen
5. iPad verifizieren
  - Alte Homescreen-App löschen
  - Seite in Safari neu öffnen
  - Erneut `Zum Home-Bildschirm` hinzufügen
6. Ergebnis prüfen
  - App-Name unter dem Icon korrekt
  - Neues Icon sichtbar
  - Kernflow startet und Ergebnisansichten funktionieren

## Letzte Änderungen

### iPad und PWA
- Responsive Regeln für iPad-Breiten (761-1024 px) ergänzt, ohne Desktop-Layout zu verschlechtern.
- Touch-Ziele auf mobilen/coarse Pointer verbessert (mindestens 44 px, angepasste Hover-Interaktion).
- PWA-Support ergänzt (`manifest.webmanifest`, `sw.js`, `assets/js/pwa.js`, App-Icons), damit die App auf iPad zum Home-Bildschirm hinzugefügt werden kann.

### Scoring

- Reaktionszeit-Auswertung im Testmodus für langsamere visuelle Module korrigiert: RT-Grenzen werden jetzt pro Modul über `rtMultiplier` skaliert statt global mit starren 1000 ms.
- Modulabhängige Komponenten-Gewichtung eingeführt: schnelle Reaktionsmodule gewichten `speed` höher, komplexere visuelle Module gewichten `accuracy` und `consistency` stärker.
- Interpretationstexte kontextsensitiv erweitert: schnelle Basisreaktion und komplexe visuelle Suche werden sprachlich getrennt eingeordnet.
- Analytics-Reaktionsprofil ebenfalls kontextsensitiv gemacht (Tempo-, Konstanz- und Genauigkeitstexte pro Modultyp differenziert).
- Kritischen Zonen-Edge-Case in der Score-Berechnung behoben: offene Zonenränder (`min`/`max` fehlt) erzeugen keine `NaN`-Scores mehr; Top-Leistungen verlieren dadurch keine Komponenten (`speed`/`consistency`/`memory`) mehr.
- Änderungen wurden gegen den Smoke-Test (`tests/run-smoke-test.ps1`) und zusätzliche Engine-Checks mit synthetischen Repro-Fällen validiert.