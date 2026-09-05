# VOIDBOUND: Echoes of the Fallen — Browser v1.0

Browserbasierter Sci-Fi-RPG-Vertical-Slice mit freier Texteingabe und Unity-portabler Datenstruktur.

## Start lokal
Unter Windows `start.bat` ausführen oder im Projektordner einen statischen Webserver starten, z. B. `python -m http.server 8000`.

## Render
Das Projekt enthält `render.yaml`. Repository mit Render als Blueprint verbinden. Die Anwendung ist eine statische Website.

## v1.0-Funktionen
- Charaktererstellung mit exakt 30 gemeinsam verteilbaren Attributpunkten
- 8 Attribute, jeweils 1–8
- 9 Herkünfte mit situativen Vor- und Nachteilen
- positive und negative Eigenschaften
- freie Texteingabe mit Intent-, Ziel-, Methoden- und Ton-Erkennung
- W20-Proben mit Attribut-, Herkunfts- und Eigenschaftsboni
- längere dynamische Storytexte mit Erfolgs- und Fehlschlagsvarianten
- World State, Erinnerungen, gespeicherte Handlungen und NPC-Vertrauen
- Inventar und Gegenstandsdaten
- Missionen und Questfortschritt
- Crew/Kontakte
- Reputation
- Schiffswerte und Reparatur-Nebenmission
- Sternenkarte und freischaltbare Reiseziele
- unterschiedliche Umgebungs-GUIs für Schiff, Maschinenraum, Quartier, Krankenstation, Frachtraum, Station, Bar, Markt, Planet und Architektenruinen
- lokaler Autosave via localStorage
- JSON-Savegame Download und Import
- Akt I als spielbarer Storyabschnitt

## Unity-Port
Spiellogik (`core/`) und Content (`data/*.json`) sind von der Browser-GUI getrennt. Beim Unity-Port werden die Core-Klassen nach C# übertragen; IDs, Datenmodelle, Story-/World-State-Strukturen und JSON-Inhalte können weitgehend übernommen werden.

## PostgreSQL / Neon Cloud-Speicher

Diese Ausgabe enthält zusätzlich einen Node-Backend-Service. Jeder Browser erhält beim ersten Aufruf eine anonyme Spieler-ID und ein geheimes Spielertoken. Das Token wird nur im Browser gespeichert; in PostgreSQL liegt ausschließlich dessen SHA-256-Hash. Der komplette Spielstand wird serverseitig als JSONB gespeichert.

### Render

1. Projekt zu GitHub hochladen.
2. In Render als Blueprint aus `render.yaml` anlegen.
3. Render fragt beim ersten Blueprint-Setup nach `DATABASE_URL`.
4. Dort die Neon PostgreSQL Connection String als geheime Environment Variable hinterlegen. Sie darf nicht in `render.yaml`, JavaScript oder Git stehen.
5. Deploy starten. Die Tabellen `players` und `savegames` werden beim Serverstart automatisch angelegt.

### Datenmodell

- `players`: Spieler-ID, Token-Hash, Charakter-/Anzeigename, Version, Erstellungszeit, letzte Aktivität.
- `savegames`: genau ein aktueller Cloud-Spielstand pro Spieler, gespeichert als PostgreSQL `JSONB`.

Der lokale Browser-Spielstand bleibt als Fallback bestehen. Dadurch kann bei einem kurzen Datenbank- oder Netzwerkproblem weitergespielt werden.
