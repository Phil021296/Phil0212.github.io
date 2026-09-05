# Unity-Portplan

Die Browser-GUI ist nur eine Präsentationsschicht. `core/gameCore.js` und `core/actionInterpreter.js` enthalten die Regeln, `data/` die Inhalte.

Unity-Zielstruktur:
- Assets/Scripts/Core/GameCore.cs
- Assets/Scripts/Core/ActionInterpreter.cs
- Assets/Scripts/Models/*.cs
- Assets/StreamingAssets/Data/*.json
- Assets/Scripts/UI/*

IDs für Orte, Items, Traits, Herkünfte, NPCs und Quests bleiben identisch. Savegames verwenden dieselben Feldnamen, damit eine spätere Migration möglich bleibt.
