# Neu: VOIDBOUND 1.3

Zwei zusätzliche spielbare Kapitel. Nach dem bisherigen Ende im Spiel fortsetzen. Details und Grenzen der Spielzeit: [Kapitel 1.3](docs/KAPITEL_1.3.md).

# VOIDBOUND · Das letzte Licht — Version 1.2

Ein spielbarer erster Handlungsbogen für ein erzählerisches Science-Fiction-Rollenspiel. Du suchst eine verschwundene Forscherin, erfährst von einem gefährlichen Versuch auf Helios-9 und entscheidest, wem du vertraust und was aus der Warnung wird.

## Starten

Unter Windows **start.bat** doppelt anklicken. Das Startfenster geöffnet lassen. Der Browser öffnet **http://127.0.0.1:8012** erst, wenn der lokale Server bereit ist.

Alternativ: `npm run preview`, danach dieselbe Adresse im Browser öffnen.

Node.js muss installiert sein (hier mit Node.js 24 geprüft). Der lokale Handlungsbogen braucht weder Zugangsdaten noch eine Datenbank noch installierte Zusatzpakete. Ist Port 8012 schon belegt, das andere Startfenster schließen. Es wird nicht versehentlich eine fremde oder alte Vorschau geöffnet.

## Was neu ist

- Zusammenhängende Geschichte in vier Kapiteln mit drei unterschiedlichen Abschlüssen.
- Kael, Lyra und Mara mit eigenen Interessen, Erinnerungen und persönlichen Konflikten.
- Verhandeln, bezahlen, schleichen oder kämpfen; Beobachten verändert die Chancen.
- Befreiung statt bloßem Vertrauenswert, nachwirkende Versprechen und ein Epilog, der Entscheidungen aufgreift.
- Fehlschläge mit Verletzungen und Aufmerksamkeit statt endloser Wiederholungen. Bergung, medizinische Versorgung und Treibstoff auf Rechnung verhindern Sackgassen.
- Ruhige Leseansicht, fünf Hauptbereiche, Logbuch mit vergangenen Szenen und nachvollziehbare Würfe.

## Lokales Spiel und KI

Der ganze Handlungsbogen lässt sich über die angezeigten Szenenhandlungen spielen. Die Buttons lösen echte Regelentscheidungen aus. Der alte allgemeine Textbaustein-Interpreter wird in der Oberfläche nicht mehr verwendet.

Mit einem konfigurierten KI-Server können eigene Eingaben semantisch interpretiert und passend zur tatsächlichen Handlung erzählt werden. Ohne KI werden nur eindeutig unterstützte Szenenbefehle und Ortswechsel angenommen. Bei unklaren oder negierten Eingaben wird keine vermeintlich passende Aktion erfunden.

Für den Cloud-Server `npm ci` ausführen, `DATABASE_URL` als geheime Server-Umgebungsvariable setzen und `npm start` verwenden. Für freie KI-Handlungen zusätzlich `OPENAI_API_KEY` und `OPENAI_MODEL` setzen. Der Server lädt eine .env-Datei nicht automatisch. Der Render-Blueprint enthält die entsprechenden Variablen. Keine Zugangsdaten in Browserdateien ablegen. Mobile Online-Nutzung benötigt eine erreichbare HTTPS-Adresse.

## Spielstände

Spielstände bleiben im Browser und können unter **Mehr → Spielstand als Datei sichern** exportiert werden. Vor einem neuen Spiel oder Import wird die bisherige lokale Kopie zusätzlich gespeichert. Importierte Spielstände werden geprüft; ungültige Dateien ersetzen den aktuellen Stand nicht. Neue lokale Reisen und importierte Kopien überschreiben keinen servergeführten Spielstand.

Die ältere Vorschau lief auf Port 8000. Browser trennen den Speicher nach Adresse: Ein dort gespeicherter Spielstand ist nicht gelöscht, erscheint auf Port 8012 aber nicht automatisch. In der alten Vorschau exportieren und in der neuen über **Spielstand laden** importieren. Auch `localhost` und `127.0.0.1` sind verschiedene Speicherorte.

Der vorherige Quellstand liegt unter `Sicherungen/vor_story_1.2_20260908_174901/`. Das vorhandene `VOIDBound.rar` ist ein älteres Paket; das neue Paket heißt `VOIDBOUND_v1.2_Das_letzte_Licht.zip`.

## Prüfen und weiterentwickeln

`npm run verify` prüft Syntax und automatisierte Tests. [Prüfbericht](docs/PRUEFBERICHT_1.2.md) und [Aufbau der Geschichte](docs/SPIELKONZEPT_1.2.md) beschreiben Umfang und Grenzen. Dies ist ein abgeschlossener erster Handlungsbogen, noch kein mehraktiges fertiges Rollenspiel.

Das aktuelle Arbeitsprojekt ist **C:\Users\philc\Documents\VOIDBound**.

