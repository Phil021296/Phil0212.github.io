# Prüfbericht VOIDBOUND 1.2

Stand: 09.09.2026. Aktives Projekt: C:\Users\philc\Documents\VOIDBound.

## Automatisierte Prüfung

`npm run verify` bestanden: Syntaxprüfung und 23 Tests.

Geprüft wurden unter anderem:
- vollständige Durchläufe zu allen drei Enden;
- vollständiger Durchlauf mit ausschließlich schlechten Würfen;
- Verhandlungsbonus nach Beobachten, alternative Befreiungswege;
- Kampfkosten und Sicherheitsalarm;
- Wiederholungs- und Belohnungssperren;
- NPC-Anwesenheit und Gesprächsgedächtnis;
- Heilung, Bergung, Treibstoff bei leerem Konto;
- Laden älterer und Ablehnen beschädigter Spielstände;
- Abbruch bei einem simulierten Erzählerfehler;
- HTTP-Spielzüge, Speicherrevisionen und Wiederholungsschutz.

Die gemeldete Fehlermeldung innerhalb des HTTP-Tests gehört zum absichtlich simulierten Provider-Ausfall.

## Browserprüfung

Die Prüfung lief auf einem getrennten Testursprung http://127.0.0.1:18012. Dadurch wurden keine Spielstände auf dem normalen Spielursprung geändert.

Im Browser geprüft: Charaktererstellung, Eröffnung, Nachricht lesen, Reise zum Dockring und ins Last Light, Rechnung begleichen, Kaels Auskunft und Kapitelwechsel. Ein Neustart zeigte den Fortsetzen-Button und stellte Zug, Ort sowie letzte Erzählung wieder her. Eine negierte freie Eingabe im lokalen Modus löste keine falsche Handlung aus.

Layout-Simulation bei 320 × 740 und 430 × 900: kein horizontaler Überlauf; sichtbare Schaltflächen mindestens 48 Pixel hoch. Desktop- und mobile Leseansicht visuell geprüft. Dies sind Browser-Simulationen, keine echten Android-/iPhone-Gerätetests.

## Nicht geprüft oder nicht erzeugt

Keine produktive Neon-Datenbank verbunden; keine Live-KI-Anfragen ausgeführt. Der HTTP-Test verwendet kontrollierte Provider- und Datenbank-Ersatzobjekte. Er ist kein Nachweis für echte PostgreSQL-Sperrkonkurrenz oder eine ausgeführte Neon-Migration.

Keine APK, kein AAB und kein Xcode-Projekt erstellt. Nichts öffentlich bereitgestellt.
