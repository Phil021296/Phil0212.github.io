# VOIDBOUND 1.3 – Erweiterte Kampagne

Ablage: C:\Users\philc\Documents\VOIDBound

## Einstieg
Das Spiel wie bisher mit start.bat starten. Nach einem der drei bisherigen Enden erscheint „Kapitel 5 beginnen“. Auch ein bereits abgeschlossener lokaler Spielstand kann weitergeführt werden. Kapitel 6 folgt auf den Abschluss der Hauptfälle in Kapitel 5. Vor dem Abschluss können offene Nebenfälle noch gespielt werden.

## Inhalt
Kapitel 5: Asche im Dockring – 8 Hauptfälle und 4 optionale Geschichten auf Helios-9. Maras Bruder, manipulierte Rettungslisten, Wasserversorgung, Beweissicherung und politische Verantwortung bilden eine verzweigte Abfolge.
Kapitel 6: Der stumme Chor – 5 Hauptfälle und eine persönliche Geschichte für Lyra auf Nereid. Sichere Landung, ein irreführendes Lebenszeichen, die Nachkommen einer vermissten Besatzung und der Umgang mit einem Erinnerungsarchiv führen zum Abschluss.
Insgesamt 18 Fälle, 54 unterscheidbare Fundstücke und 15 neue Orte.

Im Koordinationsraum beziehungsweise Basislager einen Fall auswählen. Hinweise am jeweiligen Ort sichern und ausdrücklich lesen. Die drei Befunde am Ausgangspunkt zusammenführen und eine Schlussfolgerung wählen. Das Logbuch enthält eine aufklappbare Übersicht mit Fundorten und gelesenen Originalen. Fälle lassen sich wechseln, ohne Fortschritt zu verlieren.

Vorsichtige Untersuchung mit Crewunterstützung vermeidet eine Probe und kostet mehr fiktive Weltzeit. Misslungene schnelle Untersuchungen erhöhen die gespeicherte Aufmerksamkeit, blockieren den Hinweis aber nicht. Aufmerksamkeit ist derzeit ein sichtbarer Konsequenzwert; sie löst noch keine eigenständige Gegner-Simulation aus. Öffentliche und vertrauliche Abschlüsse verändern Aufzeichnungen und teilweise Crewvertrauen. Das frühere Archiv-Ende verändert den Einstieg.

## Spielzeit und Produktionsstand
5–6 Stunden je Kapitel bleiben ein Ausbauziel, keine gemessene Spielzeit. Die vorhandenen Texte und Fälle allein garantieren diese Dauer nicht. Die früheren Kapitel 1–4 bleiben kürzer. Es gibt keine künstlichen Wartezeiten oder Mindestzug-Sperren.
Diese Fassung ist eine spielbare Erweiterung mit Schwerpunkt Ermittlungen und Erkundung. Neue ausformulierte taktische Kampfbegegnungen, umfangreiche reaktive Alltagsabläufe und eine durch Spieltests belegte Langkapitel-Dramaturgie fehlen noch. AAA-Produktionsqualität wird nicht behauptet.

## Prüfung
npm run verify: 25 Tests bestanden. Beide neuen Kapitel einschließlich sämtlicher optionaler Fälle durchlaufen; falsche Antworten, fehlende Voraussetzungen, wiederholte Belohnungen und Ortsabkürzungen geprüft. Zwischen Fundstücken Spielstand exportiert und erneut geladen. Bestehende drei Enden und bisherige Engine-Tests weiterhin erfolgreich.
Browserprüfung dieser Fassung: Startseite auf isoliertem lokalen Port 18013 geladen. Kein vollständiger visueller Kapitel-Durchlauf und kein Gerätetest. Kein echter Neon-/KI-Provider-Test; HTTP-Transaktionstests verwenden isolierte Test-Doubles.
Sicherung vor den Änderungen: Sicherungen/vor_langkapitel_20260909_125628.
