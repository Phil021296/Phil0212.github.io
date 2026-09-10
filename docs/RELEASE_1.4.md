# VOIDBOUND 1.4 – Einsätze und Konsequenzen

## Neue spielbare Inhalte
Acht mehrstufige Begegnungen mit insgesamt 24 Entscheidungsszenen ergänzen die 18 Fälle der Kapitel 5 und 6:
- Das Gewicht der Kabine: Ivens Rettung, Lastsicherung und die Zeit danach.
- Am letzten Hahn: eine eskalierende Wasserausgabe im Wohnring.
- Der Weg zum Rat: Zeugenschutz, Deckung, Verhandlung oder Schusswechsel.
- Neunzig Sekunden Dunkelheit: Notstrom und sichere Umschaltung.
- Unter dem Glassturm: Navigation, Bergung und Rückkehr im Sturm.
- Der erste Schritt nach oben: eine tatsächlich zugängliche Evakuierungsroute.
- Bergungsrecht: Konfrontation mit dem Helix-Shuttle.
- Eine Stimme weniger: Abschied, Archivzugang und Verantwortung gegenüber Sen.

Ein Einsatz beginnt nach dem zugehörigen Fall mit einem ausdrücklichen Aufbruch. Der tatsächliche Spielort wechselt; nach dem Abschluss kehrt die Crew zum Ausgangspunkt zurück.

## Verbindliche Folgen
Sechs Einsatzvorräte zu Beginn und weitere sechs beim nächsten Kapitel, bis höchstens zwölf. Lagerpausen verbrauchen einen Vorrat und behandeln Wunden sowie Erschöpfung. Nachschub kostet Credits. Für jede Begegnung existiert ein Weg ohne Vorräte, Geld oder Waffe.
Erschöpfung erhöht die Schwierigkeit von Proben. Sichere, sorgfältige Untersuchungen benötigen mehr fiktive Weltzeit und erhöhen Erschöpfung. Misslungene riskante Handlungen können verletzen. Deckung erleichtert passende Proben innerhalb der vorbereiteten Begegnung; sie gilt nicht dauerhaft für alle späteren Einsätze.
Gestiegene Aufmerksamkeit löst am Ausgangspunkt Kontrollen aus. Die Kontrolle muss abgeschlossen werden, bevor der nächste Einsatz beginnt.
Crewvertrauen, ausgewählte Folgen und Einsatzprotokolle werden gespeichert. Bei Kampfunfähigkeit kann die Crew bergen; offene Szenen bleiben erhalten. KI-Eingaben erhalten die aktuelle Begegnung und müssen dieselben Szenenhandlungen verwenden, um sie aufzulösen.

## Bestehende Spielstände
Laufende Kapitel erhalten die neuen Einsatzfelder beim Laden bzw. Fortsetzen. Bereits gelöste relevante Fälle können noch ausstehende Folgebegegnungen auslösen. Vollständig abgeschlossene Kampagnen werden nicht zurückgesetzt. Vorherige Sicherungen bleiben erhalten.
Gesicherte Fundstücke, NPC-Erinnerungen und Fallfortschritt bleiben bestehen. Fehlerhafte Begegnungsdaten werden beim Import abgewiesen.

## Prüfung
30 automatisierte Tests erfolgreich. Beide Kapitel mit sämtlichen Nebenfällen und Begegnungen durchlaufen, einschließlich Speichern/Laden zwischen Handlungen. Zusätzliche Prüfungen für leere Vorräte, fehlende Waffe, schlechte Würfe, Deckung, Bergung, Kontrollauslöser, gesperrte KI-Abkürzungen und beschädigte Imports.
Lokaler Browsertest auf eigenem Ursprung: Testspielstand importiert, Wohnring-Einsatz begonnen, drei Entscheidungen ausgeführt, Ressourcenverbrauch und Rückkehr geprüft. 320 Pixel Breite: kein horizontaler Überlauf, sichtbare Schaltflächen mindestens 48 Pixel hoch. Kein Test auf echter Handy-Hardware.
Die vorhandenen HTTP-Tests simulieren Datenbank und KI-Anbieter; eine echte Neon- oder KI-Verbindung wurde nicht geprüft.

## Umfang und Hosting
Fünf bis sechs Stunden pro Kapitel bleiben ein noch nicht durch Spieltests belegtes Ziel. Diese Fassung fügt echte Entscheidungsszenen hinzu, garantiert aber keine feste Spielzeit und keine AAA-Produktionsqualität.
Das angegebene Render-Ziel ist eine Static Site. Dort funktionieren die lokalen Spielstände und Szenenhandlungen. Freie KI-Deutung und PostgreSQL-Cloudspeicherung benötigen weiterhin den separaten konfigurierten Node-Server; ein statischer Deploy startet ihn nicht.
