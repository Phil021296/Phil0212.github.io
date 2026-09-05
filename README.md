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
