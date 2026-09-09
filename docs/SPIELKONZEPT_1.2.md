# Das letzte Licht — Spielkonzept 1.2

## Dramaturgie

Die Eröffnung beginnt mit einer konkreten Störung: Lyras Nachricht bricht ab. Das Artefakt und Maras Beziehung zur Station machen die Gefahr persönlich, bevor abstrakte Hintergrundinformationen hinzukommen.

1. **Das letzte Licht:** Kael steckt im Last Light fest. Beobachten, Verhandeln, Zahlung, Flucht und Gewalt führen auf unterschiedlichen Wegen zu seiner Auskunft.
2. **Niemand bleibt zurück:** Kael hat einen Transportkontakt verkauft, der Lyra in Haft brachte. Sein Freigabecode lässt sich für eine offizielle Übernahme oder einen riskanten technischen Ausbruch verwenden.
3. **Unter fremden Sternen:** Lyra erklärt die Warnung. Die Crew reist nach Nereid IV; Reparatur, Referenzmessung und ein Versprechen haben eigene Auswirkungen.
4. **Eine Zukunft ist keine Schuld:** Das Archiv zeigt eine vermeidbare Katastrophe. Öffentliche Warnung, zivile Rettungskette oder Übergabe an Helix erzeugen unterschiedliche Folgen und Epiloge.

## Figuren

- **Mara** hält das Schiff flugbereit. Ihr Bruder lebt auf der bedrohten Station. Sie verlangt keine Heldentaten, sondern dass die Crew zurückkommt.
- **Kael** trägt Verantwortung für einen verkauften Kontakt. Seine Hilfe tilgt diese Schuld nicht automatisch.
- **Lyra** will ihre Erkenntnisse zur Warnung nutzen. Ob du dein Versprechen hältst oder Helix die Kontrolle überlässt, verändert ihr Vertrauen.

Figurenanwesenheit kommt aus dem Spielzustand. Mara ist auf dem Schiff; Lyra begleitet dich erst nach der Befreiung. Erinnerungen und Versprechen bleiben im Speicher und sind im Crew-Bereich nachlesbar.

## Regeln und Erzählung

`core/storyContent.js` enthält die ausgearbeiteten Szenen. `core/campaign.js` bietet nur zur Situation passende Handlungen an und definiert ihre Bedingungen, Kosten und Folgen. `core/gameMaster.js` würfelt und setzt Handlungen um. Ein Ortswechsel muss über einen tatsächlich verfügbaren Ausgang führen.

Für frei formulierte KI-Handlungen bleibt die Trennung bestehen: Interpretation → Prüfung durch die Engine → Erzählung des Ergebnisses. Die KI erhält zusätzlich Kapitel, entdeckte Fakten und Figurenstimmen. Direkte Szenenbuttons verwenden den geschriebenen Szenentext und benötigen keinen Modellaufruf.

Der alte `actionInterpreter.js` bleibt als historische Referenz im Quellprojekt. Er wird von der neuen Oberfläche nicht importiert. Der lokale Modus gibt bei unbekannten Eingaben keine erfundenen Erfolge aus.

## Konsequenzen

Fehlgeschlagene Verhandlungen erschließen andere Möglichkeiten. Eine missglückte Flucht oder Befreiung kostet Gesundheit beziehungsweise erhöht Aufmerksamkeit, setzt aber den Handlungsbogen fort. Kampfunfähigkeit erlaubt eine Bergung mit medizinischen Schulden. Niedriger Treibstoff kann am Dock gegen Bezahlung oder eine offene Rechnung aufgefüllt werden.

Die drei Abschlüsse unterscheiden sich in Information, Fraktionsruf, Vertrauen und gehaltenen oder gebrochenen Versprechen. Eine vorherige Reparatur verändert die Rückflugbeschreibung und den Schiffszustand. Der Epilog kehrt auch im tatsächlichen Zustand zur Wayfarer zurück.

## Bewusste Grenzen

Die angebotenen Story-Handlungen sind ein ausgearbeiteter Handlungsbogen, keine unbegrenzt simulierte Welt. Weitere Akte, umfassende Fraktionsreaktionen, komplexe Kämpfe über viele Gegnerzüge und ein dynamisches Wirtschaftssystem sind nicht enthalten. Offene Rechnungen werden gespeichert und angezeigt; eine eigene Schuldenquest ist noch nicht ausgearbeitet.

Der freie KI-Modus ist vorbereitet, aber die Qualität echter Modellantworten wurde ohne konfigurierte Zugangsdaten nicht live beurteilt. Der Erzähler kann keine Gegenstände oder Werte direkt vergeben; seine Prosa ist dennoch keine formal garantierte Darstellung aller Weltfakten.
