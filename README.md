# VOIDBOUND: Echoes of the Fallen — Browser Vertical Slice v0.1

## Start unter Windows
1. ZIP entpacken.
2. `start.bat` doppelklicken.
3. Der Browser öffnet `http://localhost:8080`.

Falls `py` nicht verfügbar ist: Im Projektordner `python -m http.server 8080` starten und danach die Adresse im Browser öffnen.

## Bereits enthalten
- Charaktererstellung mit 6 Herkünften, Vor- und Nachteilen
- 8 Attribute
- 2 positive + 1 negative Eigenschaft
- W20-Regelsystem
- Freie Texteingaben mit regelbasierter Interpretation
- dynamische Umgebungs-GUI für Raumschiff, Station und Alienruine
- World State, Erinnerungen, Reputation, Inventar, Credits, HP und Schild
- mehrere begehbare Orte und ein kleiner Akt-I-Vertical-Slice
- JSON-Datenstruktur und getrennte Core-/UI-Schichten für späteren Unity-Port
- Savegame-Export als JSON

## Unity-Port
Die Browseroberfläche liegt ausschließlich unter `/browser`. Kernlogik liegt unter `/core`, Inhalte unter `/data`. Für Unity werden die Core-Klassen in C# gespiegelt; JSON-Strukturen und IDs bleiben erhalten.

## Deployment auf Render
Diese Version enthält eine `render.yaml` für Render Blueprint Deployments.

1. Projekt in ein GitHub-Repository hochladen.
2. In Render **New > Blueprint** auswählen.
3. Das Repository verbinden.
4. Render erkennt die `render.yaml` automatisch.
5. Deployment starten.

Die Seite wird als **Static Site** bereitgestellt. Es ist kein Build-Befehl notwendig; `index.html` liegt direkt im Publish-Verzeichnis.
