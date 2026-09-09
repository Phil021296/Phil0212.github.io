// Authored scenes: facts and consequences are applied by campaign.js, never inferred from prose.
export const TEXT={
opening:`Mara nimmt die Füße von der Konsole, als die Nachricht eintrifft. Nicht wegen des Tons. Wegen des Absenders.

„Lyra Venn“, liest sie. „Die Forscherin von deinem Wrack?“

Das Bild setzt mitten in einer Bewegung ein. Eine Frau in einem grauen Mantel drückt eine Hand gegen ihr Ohr. Hinter ihr zieht jemand einen Metallstuhl über den Boden.

„Hör zu. Das Stück, das du geborgen hast — bring es nicht zum Zoll. Kael wartet im Last Light. Er weiß, wie du mich findest.“ Sie blickt an der Kamera vorbei. „Und wenn es mit deiner Stimme spricht, antworte nicht.“

Die Verbindung bricht ab.

Auf der Konsole liegt das schwarze Artefakt. Seit drei Tagen war es kalt. Jetzt hinterlässt es einen schmalen Ring aus Kondenswasser. Vor dem Fenster dreht sich Helios-9. In ihren Wohnringen gehen die ersten Lichter der Nachtschicht an.

Mara wartet einen Moment. „Wir können immer noch abdocken“, sagt sie. Ihre Hand liegt bereits neben dem Anflugregler.`,
signal:`Du spielst die letzten zwei Sekunden noch einmal ab. Hinter Lyra sagt jemand eine Nummer: vier. Mara hält das Bild an. Auf der Scheibe hinter Lyras Kopf steht das Emblem der Stationssicherheit.

„Das ist kein Verhörraum von Helix“, sagt Mara. „Die haben sie offiziell festsetzen lassen.“

Im Nachrichtenanhang liegt eine einzige Zeile von Kael: Last Light. Komm ohne Uniform.

Mara schiebt dir den Anflugplan hin. „Die Bar ist gleich hinter dem Zoll. Ich halte die Wayfarer bereit.“`,
scan:`Du legst das Artefakt in den Diagnosering. Die Anzeige zeigt einen Impuls, dann einen zweiten, genau elf Sekunden vor dem ersten. Mara tippt auf die Uhr. Sie geht richtig.

Aus dem Lautsprecher kommt ein kurzes Einatmen. Dein Einatmen. Du hältst unwillkürlich die Luft an.

„Dann schalten wir die Lautsprecher ab“, sagt Mara. Sie tut es selbst.

Die Referenzmessung bleibt im Speicher. Was immer das Archiv aufzeichnet: Ihr habt jetzt etwas zum Vergleichen.`,
mara:`„Mein Bruder arbeitet da unten“, sagt Mara. Sie zeigt auf einen unscheinbaren Lichtstreifen am Dockring. „Er repariert die Aufzüge. Beschwert sich jeden zweiten Tag über die Schwerkraft und zieht trotzdem nicht weg.“

Sie schiebt den Anflugregler einen Fingerbreit vor.

„Wenn diese Frau Hilfe braucht, hören wir sie an. Aber du versprichst mir eins: Wenn es schiefgeht, kommst du zur Schleuse. Ich möchte nicht entscheiden müssen, wie lange ich warte.“`,
readRoom:`Du bleibst einen Moment an der Theke. Im Spiegel hinter den Flaschen siehst du, was Kael sieht: einen Wartungsgang, dessen Tür von einem Getränkekasten offen gehalten wird.

Der jüngste Söldner schaut bei jedem Ruf aus der Bar auf. An seinem Ärmel sitzt ein frischer Flicken. Sein Anführer dagegen prüft wiederholt die Anzeige seines Armbands. Die Männer warten auf Geld, nicht auf einen Kampf.

Der Barkeeper stellt ein Glas vor dich. „Die Rechnung vom hinteren Tisch steht seit zwei Stunden offen“, sagt er. „Nur damit wir uns verstehen.“`,
negotiateWin:`Du bleibst außerhalb seiner Armlänge und sprichst leise genug, dass der Raum kein Publikum wird. Es gibt hier keine Beute, die eine Schießerei und eine Stationssperre wert wäre.

Der Mann schaut an dir vorbei zu seinem jüngsten Begleiter. Der hat das Holster bereits wieder geschlossen.

„Eine Nacht“, sagt der Anführer zu Kael. „Dann ist das dein Problem.“

Als die drei gehen, fängt die Musik wieder an. Kael schiebt dir den freien Stuhl hin. „Ich hatte einen besseren Empfang geplant.“`,
negotiateFail:`Du lässt ihm einen Ausweg, aber er hört eine Drohung. Sein Daumen bleibt am offenen Holster.

„Dann bezahl seine Rechnung.“ Er dreht das Armband zu dir: 100 Credits. „Oder geh.“

Während er spricht, schiebt Kael mit dem Fuß den Getränkekasten im Seitengang weiter vor die Tür. Du hast jetzt zwei Wege. Keiner verlangt, dass du denselben Satz noch einmal sagst.`,
pay:`Du bestätigst die Überweisung, bevor Kael widersprechen kann. Der Anführer prüft den Eingang zweimal. Dann schließt er das Holster.

„Man kann also doch mit euch reden.“

Kael wartet, bis die Tür hinter den Männern zufällt. „Ich zahle dir das zurück.“ Er blickt auf dein Terminal. „Nicht heute. Aber ich vergesse es nicht.“`,
escapeWin:`Du wartest auf den klirrenden Einsatz der Musik. Kael stößt sein Glas um, und während zwei der Männer zurückweichen, ziehst du die Wartungstür auf.

Der Gang dahinter ist zu eng zum Rennen. Ihr geht schnell, Schulter an Schulter zwischen warmen Leitungen, bis der Lärm der Bar nur noch ein dumpfer Takt ist.

Kael lacht einmal, ohne Freude. „Gut. Jetzt der Teil, wegen dem du mich hassen wirst.“`,
escapeFail:`Die Tür fällt zu früh ins Schloss. Ein Mann packt deinen Ärmel; du reißt dich los und schlägst mit der Schulter gegen die Leitung. Kael zieht dich durch den Spalt.

Hinter euch schlägt jemand gegen das Metall. Ihr müsst nicht stehen bleiben, um die Worte zu verstehen.

Im Versorgungsgang drückt Kael dir ein Tuch auf die blutende Stelle. „Tut mir leid“, sagt er. „Für mehr als das.“`,
kael:`Kael faltet das Etikett seiner Flasche in schmale Streifen.

„Lyra wollte einen sicheren Transport für ihre Aufzeichnungen. Ich habe den Käufer überprüft. Dachte ich.“

Er legt einen Freigabecode auf dein Terminal. Auftraggeber: HELIX. Übergabeort: ZELLE 04.

„Sie haben nicht die Aufzeichnungen abgeholt.“

Du wartest. Kael hält deinem Blick diesmal stand.

„Mit dem Code kannst du sie übernehmen. Offiziell bist du dann für sie verantwortlich. Ich kann nicht mehr durch diese Tür gehen. Du schon.“`,
kaelAfter:`„Du hast nicht nachgefragt“, sagst du.

Kael nickt, ohne sich zu verteidigen. Das macht es nicht besser.

„Nein.“ Er schiebt den letzten Streifen des Etiketts von sich. „Ich werde dir jetzt nicht erklären, wie schwer mein Leben war. Bring sie da raus. Wenn sie danach meinen Namen nie wieder hören will, hat sie recht.“`,
release:`Die Beamtin vergleicht den Code mit deinem Ausweis. Sie tippt langsam, nicht misstrauisch, nur müde.

„Die Haftung geht auf Sie über.“

Die Zellentür öffnet sich. Lyra nimmt ihren Mantel vom Stuhl und geht an dir vorbei, bis das Sicherheitsglas hinter euch liegt. Erst dort bleibt sie stehen.

„Danke“, sagt sie. „Und jetzt müssen wir darüber reden, was du da mit dir herumträgst.“`,
hackWin:`Der Wartungsanschluss erkennt Kaels Code, obwohl er nicht für diese Tür gedacht war. Du hältst die Schleife offen, bis das Schloss ausrastet.

Lyra braucht keine zweite Aufforderung. Im Treppenhaus zieht sie ihren Mantel an, während sie läuft. „Ich hoffe, dein Schiff ist näher als der nächste Wachwechsel.“`,
hackFail:`Die Tür öffnet sich genau in dem Moment, in dem der Alarm beginnt. Ein Betäubungsimpuls trifft dich seitlich. Lyra fängt dich ab, bevor dein Kopf gegen das Geländer schlägt.

Sie zieht dich durch die Brandschutztür. Hinter euch verriegelt ein Schott, diesmal zu eurem Vorteil.

„Atmen“, sagt sie. „Nur weiteratmen. Erklären können wir es uns draußen.“`,
briefing:`Lyra legt zwei Aufnahmen nebeneinander. Auf der ersten trägt Helios-9 einen intakten Wohnring. Auf der zweiten fehlen sechs Segmente. Datum und Uhrzeit sind identisch.

„Die Expedition fand ein Archiv auf Nereid IV. Es bewahrt keine Bilder der Zukunft auf. Es speichert Versuche. Entscheidungen. Was danach übrig blieb.“

Sie vergrößert einen Eintrag. Helix: Reaktorversuch H-9.

„Sie werden einen Feldtest unter dem Dockring durchführen. Sie glauben, die Station überlebt ihn.“

Mara meldet sich über Funk. „Mein Bruder wohnt darüber.“

Lyra senkt den Blick nicht. „Dann brauchen wir die vollständige Aufzeichnung. Mit meinem Fragment glaubt uns niemand.“ Sie schickt die Koordinaten nach Nereid an die Wayfarer.`,
promise:`„Ich werde es ihnen nicht verkaufen“, sagst du.

Lyra schaut dich einen Moment lang an. „Sag das nicht nur, weil es gerade richtig klingt.“

Du bleibst dabei. Sie nickt. Kein Dank diesmal. Sie nimmt dich beim Wort.`,
repairWin:`Mara hält den Lichtstreifen zwischen den Zähnen, während du den Koppler ausrichtest. Als die Kontakte schließen, hört das Flackern auf. Das Schiff klingt plötzlich eine Spur ruhiger.

Sie nimmt die Lampe aus dem Mund. „So. Jetzt kann ich mich wieder über andere Dinge beschweren.“`,
repairFail:`Die alte Halterung bricht beim Lösen. Ihr ersetzt sie durch eine provisorische Strebe aus dem Frachtraum. Schön ist es nicht, aber der Lasttest bleibt stabil.

Mara zieht die letzte Schraube nach. „Reicht für den Flug. Die große Reparatur schulden wir ihr, wenn wir wieder da sind.“`,
watch:`Im Quartier läuft ein alter Film ohne Ton. Mara behauptet, ihn nicht zu kennen, und sagt trotzdem jeden zweiten Satz eine Sekunde zu früh.

Eine Weile sprecht ihr über nichts, das gerettet werden muss. Den Geschmack echten Kaffees. Eine Landebahn, die auf keiner Karte mehr steht.

Als sie aufsteht, lässt sie den Becher neben deinem stehen. „Zehn Minuten“, sagt sie. „Dann übernehme ich wieder.“`,
gate:`Du hältst das Artefakt an die schwarze Fläche. Für einen Augenblick ist dein Handschuh zu groß. Deine Hände sind jünger. Jemand ruft deinen Namen aus einem Zimmer, das es seit Jahren nicht mehr gibt.

Lyra fasst dich am Unterarm. „Bleib hier. Sieh mich an.“

Du findest den Druck ihrer Finger wieder. Der Reif fällt in einem Stück von der Wand. Dahinter öffnet sich ein schmaler Spalt.

Lyra wartet, bis du selbst nickst, bevor sie dich loslässt.`,
decode:`Ihr legt Lyras Fragment über die beschädigte Projektion. Die fehlenden Segmente füllen sich, eines nach dem anderen.

Helix startet den Test. Das Feld kippt. Drei Evakuierungsbefehle bleiben in einer internen Warteschlange hängen. Die erste Fähre startet neun Minuten zu spät.

Dann beginnt dieselbe Sequenz erneut. Dieses Mal wird der Test abgebrochen. Der Wohnring bleibt stehen. Es ist kein Schicksal. Es ist eine Entscheidung, die jemand rechtzeitig treffen muss.

Mara hört schweigend mit. Als die Projektion endet, fragt sie nur: „Kannst du es senden?“

Lyra sieht auf die offene Verbindung. „Öffentlich, dann kennen sie unseren Standort. Über eure Kontakte, dann erreichen wir weniger Menschen. Oder wir geben Helix den Beleg und hoffen, dass sie sich daran halten.“

Niemand greift nach deinem Terminal.`
};
export const ARRIVALS={
helios_docks:`Die Schleuse gibt mit einem trockenen Schlag frei. Warme Luft riecht nach Kühlmittel und gebratenen Zwiebeln. Eine Mutter zieht ihrem schlafenden Kind die Kapuze ins Gesicht, während über ihnen ein Frachter die nächste Schicht ankündigt.

Am Ausgang blinkt ein Wegweiser: LAST LIGHT. Darunter klebt ein handgeschriebener Zettel: Heute keine Kredite.`,
helios_bar:`Du hörst das Last Light, bevor du es siehst: eine alte Basslinie, Eis im Glas, ein Streit, der zu leise geführt wird.

Kael sitzt unter einer defekten Leuchtröhre. Drei Männer haben sich um seinen Tisch verteilt. Der Älteste hält keine Waffe in der Hand. Er hat sein Holster geöffnet.

„Der Platz ist besetzt“, sagt er, als du näher kommst. Kael blickt kurz zum Seitengang. Nur kurz. Der Mann bemerkt es trotzdem.`,
helios_security:`Eine Beamtin schiebt zwei Becher zur Seite, damit dein Ausweis auf den Scanner passt. Hinter ihr leuchtet ZELLE 04.

Durch das Glas siehst du Lyra. Sie sitzt gerade, beide Hände auf den Knien. Als sie das Artefakt unter deiner Jacke erkennt, verändert sich ihr Gesicht. Nicht Erleichterung. Sorge.

„Sie ist zur Befragung hier“, sagt die Beamtin. „Wer übernimmt die Verantwortung?“`,
nereid_surface:`Die Wayfarer setzt auf, und für einige Sekunden ist nur Maras Atmen im Funk zu hören. Dann fällt violetter Staub gegen die Scheibe.

„Triebwerke bleiben warm“, sagt sie. „Keine Heldengeschichten, die ich erst beim Rückflug erfahre.“

Lyra prüft den Verschluss ihres Anzugs. Am Horizont stehen schwarze Pfeiler in einer Linie, die auf keiner Naturkarte vorkommt. Sie geht nicht voran. Sie wartet, bis du neben ihr stehst.`,
ruins_gate:`Das Tor hat weder Schloss noch Fuge. An seiner Oberfläche hängt eine dünne Schicht Reif, obwohl dein Anzug Außentemperaturen über null meldet.

Lyra legt die Hand nicht darauf. Sie hält sie wenige Zentimeter davor. „Auf der Expedition haben wir gedacht, es wäre eine Bibliothek“, sagt sie. „Dann hat es angefangen, unsere Namen zu benutzen.“`,
ruins_archive:`Hinter dem Tor ist der Wind verschwunden. Ihr hört eure Schritte zweimal: einmal unter den Füßen, einmal weit über euch.

In der Mitte des Raums hängt eine beschädigte Sternenkarte. Helios-9 ist deutlich zu erkennen. Ein Teil des Wohnrings fehlt.

Lyra bleibt stehen. „Das ist keine Vorhersage“, sagt sie. „Das ist ein Protokoll. Jemand hat es schon einmal versucht.“`
};
export function endingText(id,b){
 const flight=b.repaired?'Die reparierte Wayfarer nimmt den Rückflug ohne eine einzige rote Anzeige.':'Mara hält den alten Koppler von Hand unter seiner Lastgrenze. Es wird ein langsamer Rückflug.';
 if(id==='ending_broadcast')return `Du sendest nicht an eine Behörde. Du sendest an den Dockring, die Fährgesellschaften, die Schichtkanäle und jedes zivile Relais, das antwortet.

Die ersten beiden Verbindungen brechen ab. Die dritte bleibt. Eine Frau aus der Leitstelle stellt eine Frage, dann noch eine. Im Hintergrund hört ihr, wie sie jemandem das Wort abschneidet.

Sieben Minuten später wird der Feldtest ausgesetzt. Die Evakuierungsfähren starten trotzdem.

Helix kennt jetzt deine Signatur. Lyra weiß das. Sie lehnt sich neben dich an die Konsole, als hätte sie endlich aufgehört, auf eine Tür zu achten.

${flight}

Auf dem Rückweg bekommt Mara eine Nachricht von ihrem Bruder: Bin auf Fähre 12. Mein Werkzeug habe ich vergessen.

Zum ersten Mal lacht sie, ohne sich danach sofort zu entschuldigen.`;
 if(id==='ending_shelter')return `Mara ruft keine Leitstelle an. Sie ruft ihren Bruder an. Dann eine Fährpilotin. Dann einen Mann, dem sie seit fünf Jahren keinen Gefallen mehr tun wollte.

Im Dockring beginnt ein Gerücht, das zu genaue Zahlen enthält, um ignoriert zu werden. Eine Fähre wird gewartet und fliegt trotzdem ab. Eine Schicht meldet sich geschlossen krank.

Als die Stationsleitung den Test aussetzt, sind die ersten Menschen bereits unterwegs. Andere warten noch auf Bestätigung. Ob ihr sie rechtzeitig erreicht habt, lässt sich von Nereid aus nicht feststellen.

${flight}

Lyra setzt sich zu dir. „Wir wissen nicht, wie viele“, sagt sie. Sie wirft es dir nicht vor. Das macht die Frage nicht leichter.

Mara schickt die Liste der erreichten Fähren. Neben dem Namen ihres Bruders steht ein kleines grünes Häkchen.`;
 return `Die Vertreterin von Helix hört die Aufzeichnung bis zum Ende an. Sie fragt nicht, ob sie echt ist. Sie fragt, wer noch eine Kopie hat.

Du verlangst die Aussetzung des Tests und eine Evakuierung. Sie bestätigt beides schriftlich. Dann geht das Archiv an einen Firmenserver. 400 Credits werden als „Bergungsaufwand“ überwiesen.

Der Test wird ausgesetzt. In den öffentlichen Nachrichten steht nichts von einer Warnung.

${flight}

Lyra packt ihre Aufzeichnungen in eine kleine Tasche. ${b.promise?'„Du hast es versprochen“, sagt sie. Sie wartet auf keine Erklärung.':'„Sie entscheiden jetzt, was davon wahr sein darf“, sagt sie.'}

Als Helios-9 wieder vor dem Fenster steht, sind ihre Lichter an. Das war das Ziel. Es ist trotzdem nicht alles, was ihr zurückgebracht habt.`;
}
