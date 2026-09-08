# VOIDBOUND 1.1 – AI Game Master

Entwicklungsstand vom 08.09.2026. Eigenständiges Projekt im Ordner `VOIDBOUND/`.

## Start und Konfiguration

`start.bat` oder `npm run preview` startet die lokale Browservorschau auf http://127.0.0.1:8000. Dieser Modus funktioniert ohne Pakete oder Zugangsdaten und verwendet ausdrücklich den klassischen Regelinterpreter. Er ist keine KI-Demo.

Für den KI-Betrieb: `npm ci`, anschließend die Server-Umgebungsvariablen `DATABASE_URL`, `OPENAI_API_KEY` und `OPENAI_MODEL` setzen und `npm start` ausführen. `OPENAI_MODEL` muss die ID eines im eigenen API-Projekt verfügbaren Modells mit Structured Outputs sein. Es gibt absichtlich keine fest behauptete Modellverfügbarkeit. Eine `.env`-Datei allein wird von `npm start` nicht geladen; beim Hosting die Variablen in den Server-Einstellungen setzen. `.env.example` dokumentiert die Namen ohne echte Zugangsdaten. Der Render-Blueprint fragt diese Variablen ab. Für mobile Online-Nutzung ist eine öffentliche HTTPS-Adresse nötig.

Die KI erhält die Spielereingabe, Charakter- und Szenendaten, relevante Erinnerungen, die jüngsten Handlungen und die letzte Erzählung. Weder Datenbank-Zugang noch Spielertoken gehen an die KI. Zwei API-Aufrufe pro Spielzug können Kosten verursachen. API-Schlüssel ausschließlich serverseitig konfigurieren.

## Ablauf

1. Der angemeldete Browser sendet Eingabe, Spielzug-ID und bekannte Speicherrevision.
2. Der Server sperrt den Spielerdatensatz und liest den aktuellen PostgreSQL-Spielstand. Wiederholte IDs führen denselben Spielzug nicht erneut aus; veraltete Revisionen werden abgelehnt.
3. Die KI interpretiert den ganzen Satz als strukturierte Teilhandlungen inklusive Negationen und Ton. Sie liefert keine direkten Zustandsänderungen.
4. Die Engine prüft Zielanwesenheit, Wege, Storysperren, Ausrüstung und verfügbare Beute. Sie würfelt selbst und verändert den Zustand.
5. Der Erzähler erhält die tatsächlich berechneten Folgen. Der Text wird nicht als Zustandsänderung ausgeführt. Würfe und Folgen sind zusätzlich im aufklappbaren Regelergebnis sichtbar.
6. Zustand, Szene, Erzählung und Wiederholungsbeleg werden in einer Datenbanktransaktion gespeichert. Erst danach erhält der Browser die Antwort und eine lokale Kopie.

Ein fehlgeschlagener KI-Aufruf bricht die Transaktion ab. Bei einer verlorenen Antwort bleibt die Spielzug-ID im Browser erhalten. Dieselbe Eingabe kann erneut gesendet werden. Servergeführte Spielstände können nicht durch den alten Cloud-Upload oder die lokale Sternenkarte überschrieben werden. Ältere Spielstände werden als Ausgangspunkt übernommen; sobald ein KI-Spielzug erfolgt, führt der Server den Zustand. Original-ZIP und Starfleet-Odyssey-Daten bleiben unverändert.

## Umgesetzt

- Semantische Interpretation und dynamische Erzählung über die Responses API.
- Eigene Regeln für Gespräche, Drohungen, Beleidigungen, Schutz, Ignorieren, Kampf, Gewalt gegen Türen, Schleichen, Hacking, Reparaturen, Reisen, Beute, Kauf, Heilung, Ruhe und Artefakte.
- Initiative, Trefferwurf, Gegenfeuer, Deckung und Entfernung sowie Alarm bei Schüssen.
- Persistente Szenen mit Türzustand, Lärm, Alarm, Gegnerzustand, Beute und letzten Handlungen.
- NPC-Vertrauen, Respekt, Ärger, Angst-Feld, Stimmung und Gesprächsgedächtnis. Langzeiterinnerung für Kaels Koordinatenübergabe.
- Vorhandene Attributverteilung, Herkunfts-/Eigenschaftsboni, Inventar, Schiff und Missionen werden weiterverwendet. Akt-I-Fortschritt und Reaktorreparatur haben serverseitige Bedingungen.
- Unabhängige W20-Würfe; gleiche Folgewürfe sind wieder erlaubt.

## Grenzen und Prüfung

Dies ist eine erste implementierte v1.1, kein fertig balanciertes universelles Rollenspiel. Nicht vorhandene Ziele und noch nicht modellierte mechanische Interaktionen werden abgelehnt oder ändern keinen Zustand. NPC-Anwesenheit und Beute sind derzeit explizit pro Ort hinterlegt. Neue Gegenstände, komplexe Gegnertaktiken, dynamische NPC-Erzeugung, vollständige Langzeitgedächtnis-Konsolidierung und differenzierte Angst-Regeln sind noch nicht enthalten. Das Lyra/Piraten-Beispiel ist keine in dieser Ausgabe neu eingefügte Begegnung; im Last Light ist weiterhin Kael anwesend.

Die Engine verhindert erfundene Zustandsänderungen. Dass ein generierter Erzähltext nie eine falsche Behauptung enthält, lässt sich durch die Erzählinstruktion allein nicht garantieren; das sichtbare Regelergebnis ist maßgeblich. Die Live-Erzählqualität muss mit echten Modellantworten bewertet werden.

`npm run verify` prüft Syntax und automatisierte Tests. Die HTTP-Tests verwenden einen isolierten Datenbank-Ersatz und einen kontrollierten KI-Ersatz. Damit sind Ablauf, Revisionskonflikte, Wiederholungsschutz und Fehlerabbruch geprüft, aber keine echte PostgreSQL-Sperrkonkurrenz oder Neon-Migration. Keine produktive Datenbank wurde verbunden, keine kostenpflichtige KI-Anfrage ausgeführt und nichts veröffentlicht. Browseransicht ist eine PC-Vorschau; keine echten Handytests oder APK/AAB/Xcode-Ausgaben.

API-Grundlage: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
