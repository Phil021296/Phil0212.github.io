# Unity-Port-Konzept

Browser -> Unity
- `core/gameCore.js` -> `Assets/Scripts/Core/GameCore.cs`
- `core/actionInterpreter.js` -> `Assets/Scripts/Narrative/ActionInterpreter.cs`
- `data/*.json` -> `Assets/StreamingAssets/Data/*.json`
- `browser/*` wird NICHT portiert; Unity bekommt eine eigene UI Toolkit/uGUI-Schicht.

Wichtig: IDs wie `ship_bridge`, `helios_bar`, `ruins_gate`, Trait-/Background-IDs und World-State-Flags bleiben identisch. Dadurch können Inhalte, Save-Struktur und Storyregeln portiert werden, ohne sie in Unity neu zu erfinden.
