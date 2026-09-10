const option=(id,label,text,effect={},stat=null,failure='')=>({id,label,text,effect,stat,failure});
const stage=(title,text,options)=>({title,text,options});
export const ENCOUNTERS=[
{id:'lift_rescue',chapter:0,after:'lifts',title:'Das Gewicht der Kabine',stages:[
stage('Ein Meter Luft','Mara kommt mit einem offenen Funkgerät in den Koordinationsraum. Aus dem Lautsprecher spricht Iven sehr langsam. Die Kabine über ihm ist abgesackt. Der Seiteneinstieg aus eurem Plan ist frei, doch niemand hat das Gegengewicht gesichert. Ihr erreicht den Schacht, während eine Schraube nach der anderen aus der Decke springt.',[
option('brace','Zwei Einsatzvorräte für eine Stütze einsetzen','Du spannst die Stütze zwischen die Träger. Das Kreischen wird leiser. Iven antwortet erst, als Mara seinen Namen ein zweites Mal sagt.',{supplies:-2,flag:'braced'}),
option('rig','Die Last mit dem alten Wartungszug abfangen','Der Zug hält. Du markierst die belastete Kette, damit niemand sie später löst.',{flag:'braced'},'tech','Die Kette rutscht. Mara fängt deinen Arm, aber ein Splitter trifft dich. Ihr müsst den Seiteneinstieg unter Last benutzen.')
]),
stage('Zwei Menschen im Schacht','Unter der Kabine sitzt ein Hafenarbeiter mit Ivens Jacke über den Beinen. Iven weigert sich, vor ihm herauszuklettern. „Er hört dich“, sagt Mara zu dir. „Sag nichts, was du nicht halten kannst.“',[
option('patient','Den Verletzten gemeinsam auf eine Trage ziehen','Du zählst jeden Zug laut. Iven stützt den Kopf des Mannes; Mara zieht erst, wenn beide bereit sind.',{fatigue:1,flag:'rescued_worker'}),
option('quick','Iven zuerst durch die enge Öffnung ziehen','Iven schafft den Durchlass. Von der anderen Seite hilft er sofort weiter. Für einen Moment hat Mara nur seine Hand gesehen und geglaubt, es wäre alles vorbei.',{attention:1},'reflexes','Dein Stiefel rutscht an der Kante ab. Ihr fangt euch, doch deine Schulter schlägt gegen den Stahl.')
]),
stage('Nach dem Lärm','In der Notstation kann Mara ihren Bruder wieder sehen. Sie setzt sich nicht auf den freien Stuhl, bis Iven ihn mit dem Fuß zu ihr schiebt. Auf deinem Ärmel ist sein Blut längst trocken.',[
option('stay','Bei den Geschwistern bleiben','Iven schläft mitten im Satz ein. Mara nimmt dir den kalten Becher aus der Hand. „Du musst heute niemanden mehr überzeugen.“',{trust:2,fatigue:-1}),
option('report','Den Schacht für die nächste Schicht absichern','Du hinterlässt eine verständliche Skizze statt eines Häkchens im Formular. Am Ausgang wartet Mara auf dich. Sie hat zwei Becher dabei.',{attention:-1,flag:'safe_shaft'})
])]},
{id:'water_queue',chapter:0,after:'water',title:'Am letzten Hahn',stages:[
stage('Eine Schlange wird zur Front','Die Sperre ist aufgehoben, aber im Wohnring kommt das Wasser noch nicht an. Zwei private Wachleute schieben einen Jungen von der Entnahmestelle weg. Hinter ihm werden Kanister auf den Boden gestellt. Das Geräusch geht durch die ganze Halle.',[
option('speak','Mit den belegten Messwerten öffentlich widersprechen','Du liest die Ventilnummer und den Freigabevermerk vor. Eine der Wachen nimmt die Hand vom Jungen. Er hebt seinen Kanister selbst auf.',{flag:'queue_calm'},'charisma','Die Wache redet über dich hinweg. Jemand wirft einen leeren Becher; die Menge rückt näher.'),
option('shield','Zwischen Wachen und Wartende treten','Du stellst den Kanister wieder auf. Die Wache muss um dich herumsprechen. Der Junge geht zu seiner Mutter zurück.',{fatigue:1,flag:'queue_calm'})
]),
stage('Ein falscher Alarm','Eine Wache meldet plötzlich eine angebliche Sabotage am Verteiler. Du erkennst die alte Sperrnummer aus euren Unterlagen. Die echte Stationssicherheit fragt über Funk nach einer Lagebeschreibung.',[
option('evidence','Die überprüfbaren Daten an die Leitstelle geben','Du übermittelst Messwert, Uhrzeit und Zeugen getrennt. Die Leitstelle widerruft den Sabotagealarm.',{attention:-1},'intelligence','Der Kanal ist überlastet. Ihr erreicht die Leitstelle erst, als die Namen der Wartenden bereits erfasst wurden.'),
option('supply','Einen Einsatzvorrat an die Wartenden verteilen','Euer Notwasser reicht nicht für alle, aber für die Kinder. Die Erwachsenen organisieren die Reihenfolge, während Lyra die Leitstelle erreicht.',{supplies:-1,trust:1})
]),
stage('Der erste Becher','Der Hahn hustet braunes Wasser, dann klares. Niemand jubelt. Die Frau mit dem Jungen lässt den ersten Becher lange laufen, bevor sie ihn füllt.',[
option('watch','Bei der Verteilung helfen','Du trägst Kanister, bis deine Finger steif sind. Als du gehst, stehen die Leute noch immer in einer Reihe. Diesmal bestimmt keine Wache den Preis.',{fatigue:1,flag:'water_allies'}),
option('delegate','Die Anwohner ihre eigene Ausgabe organisieren lassen','Du gibst den Schlüssel der Frau. Sie fragt nicht nach deinem Namen, sondern danach, wen sie erreicht, wenn das Ventil wieder schließt.',{trust:1})
])]},
{id:'witness_escort',chapter:0,after:'trial',title:'Der Weg zum Rat',stages:[
stage('Ein leerer Korridor','Eure Zeugin kommt nicht zum vereinbarten Treffpunkt. Auf ihrem Kanal hörst du Schritte und eine fremde Stimme: „Wir klären nur etwas.“ Mara zeigt auf die Seitentreppe. Von dort könnt ihr den Gang überblicken.',[
option('cover','Von der Seitentreppe aus Deckung sichern','Mara bleibt hinter dem Geländer, während du zur Zeugin gehst. Die Männer sehen, dass sie euch nicht alle gleichzeitig im Blick haben.',{flag:'escort_cover'}),
option('approach','Offen auftreten und die Ladung zum Rat zeigen','Du hältst die Ladung so, dass die Korridorkamera sie erfasst. Der Mann liest den Namen des vorsitzenden Ratsmitglieds zweimal.',{},'charisma','Er behauptet, die Ladung sei gefälscht, und greift nach deinem Handgelenk.')
]),
stage('Die gezogene Waffe','Der jüngere Mann zieht eine Pistole. Er hält sie zu hoch, sein Partner fährt ihn dafür an. Eure Zeugin steht zwischen einer geschlossenen Ladentür und dem freien Weg zum Rat.',[
option('negotiate','Dem Jüngeren einen Ausweg anbieten','Du sprichst nur mit ihm. „Steck sie weg. Ihr geht. Sie geht.“ Sein Partner flucht, als die Pistole sinkt.',{attention:-1},'willpower','Er schießt in die Decke. Im Splitterregen bringt Mara die Zeugin hinter das Geländer.'),
option('fire','Aus gesicherter Deckung den Waffenarm unter Feuer nehmen','Dein Schuss trifft die Abdeckung neben seinem Arm. Er lässt die Pistole fallen. Mara zieht die Zeugin aus der Schusslinie.',{attention:2,flag:'armed_escort'},'combat','Der Schuss geht zu weit links. Die Antwort trifft die Geländerkante und verletzt dich am Oberarm.'),
option('divert','Einen Vorrat als Rauchsignal für den Rückzug verwenden','Mara wirft die Signalfackel auf die leere Seite des Ganges. Ihr führt die Zeugin über die Treppe hinaus.',{supplies:-1,attention:1})
]),
stage('Vor der Tür','Die Zeugin zittert. „Wenn ich jetzt gehe, erzählen sie, ich hätte alles erfunden.“ Hinter der Ratstür warten Mikrofone. Du hast keinen Anspruch darauf, dass sie für eure Sache weitergeht.',[
option('choice','Ihr die Entscheidung und einen geschützten Raum geben','Sie trinkt Wasser und liest ihre Aussage noch einmal. Dann bittet sie um eine Befragung ohne Publikum. Du leitest die Bitte weiter.',{trust:2,flag:'witness_protected'}),
option('record','Eine schriftliche Aussage unter ihrem Namen anbieten','Sie korrigiert einen Satz, bevor sie unterschreibt. Den Teil, den sie nicht selbst gesehen hat, streicht sie aus.',{attention:-1})
])]},
{id:'grid_blackout',chapter:0,after:'grid',title:'Neunzig Sekunden Dunkelheit',stages:[
stage('Die falsche Leitung','Im Koordinationsraum gehen die Lampen aus. Eure vorbereitete Umschaltung läuft, aber der medizinische Rückkanal bleibt stumm. Der Lastplan stimmt; jemand hat den mobilen Generator am falschen Verteiler angeschlossen.',[
option('route','Mara zum Verteiler lotsen','Du hältst die Planzeichnung gegen das Notlicht und liest jede Abzweigung einzeln vor. Am dritten Knoten findet Mara den falschen Stecker.',{},'intelligence','Du verwechselst zwei spiegelgleiche Abzweige. Die Korrektur kostet Kraft und wertvolle Zeit.'),
option('battery','Zwei Einsatzvorräte als Brückenversorgung einsetzen','Lyra verbindet eure Akkus mit den medizinischen Notgeräten. Auf dem Funkkanal wird wieder gesprochen.',{supplies:-2,flag:'backup_power'})
]),
stage('Eine Hand am Schalter','Der Techniker wartet auf deine Bestätigung. Hinter ihm schreit jemand, er solle endlich einschalten. Die Testlast zeigt einen Ausschlag, der sich noch nicht stabilisiert hat.',[
option('test','Auf die Bestätigung der Notstation warten','Du lässt den Techniker den Test wiederholen. Erst als die Pflegerin die Versorgung unter Last bestätigt, gebt ihr den Hauptkreis frei.',{fatigue:1,flag:'power_safe'}),
option('repair','Den instabilen Kontakt selbst überbrücken','Mit isolierten Klemmen ziehst du den Kontakt fest. Der Lastwert steht, bevor du den Handschuh loslässt.',{},'tech','Die Klemme schlägt zurück. Lyra zieht dich aus dem Arbeitsbereich; der Techniker übernimmt die Sicherung.')
]),
stage('Licht in den Fenstern','Nicht alle Fenster werden gleichzeitig hell. Im Wohnring klatscht jemand, in der Notstation läuft einfach die Arbeit weiter. Mara lehnt am Verteiler und lacht einmal kurz, ohne dass etwas lustig gewesen wäre.',[
option('credit','Die Arbeit der Stationsleute benennen','In deinem Bericht stehen die Namen der Schichten, die weitergearbeitet haben. Am Ende streicht Mara das Wort „Heldentat“ aus einem fremden Entwurf.',{attention:-1,trust:1}),
option('reserve','Einen Ersatzakku für die nächste Störung sichern','Der Techniker kennzeichnet den Akku für eure Crew. „Beim nächsten Mal vor der Dunkelheit anrufen“, sagt er.',{supplies:1})
])]},
{id:'landing_storm',chapter:1,after:'landing',title:'Unter dem Glassturm',stages:[
stage('Der Himmel wird weiß','Der Westgrat trägt das Schiff, doch der Staub kommt schneller als berechnet. Eure Instrumententasche liegt noch am Rand des Antennenfeldes. Ihr könnt sie sehen, bis der erste Schleier aus Glassplittern darüberzieht.',[
option('tether','Mit Sicherungsleine zur Tasche gehen','Mara hält das Seil auf Spannung. Du zählst Schritte statt auf das verschwindende Lagerlicht zu schauen.',{fatigue:1,flag:'storm_tether'}),
option('sacrifice','Die Tasche aufgeben und Ersatzmaterial verwenden','Die Tasche verschwindet im Sturm. Ihr rekonstruiert die wichtigsten Instrumente aus eurem Einsatzvorrat.',{supplies:-2,flag:'storm_safe'})
]),
stage('Ein Licht auf der falschen Seite','Ein blaues Blinken erscheint links von euch. Es sieht aus wie Maras Signal, doch der Rückweg führt rechts entlang. Lyra greift nach deinem Ärmel.',[
option('bearing','Dem aufgezeichneten Peilkurs folgen','Du prüfst den Kurs an der Felswand. Das blaue Licht bleibt hinter euch; später findet ihr dort nur reflektierendes Glas.',{flag:'storm_safe'}),
option('measure','Das fremde Blinken aus der Deckung vermessen','Die Entfernung verändert sich nicht mit euren Schritten. Du erkennst die Reflexion und markierst die Stelle als optische Falle.',{attention:-1},'perception','Ein Splitterschauer trifft die Kante. Du ziehst den Kopf zurück, aber dein Handschuh ist aufgerissen.')
]),
stage('In der Schleuse','Mara schließt das Außenschott und zählt euch, obwohl sie genau sieht, dass ihr beide da seid. Lyra setzt sich auf den Boden. Aus ihrer Kapuze rieselt ein kleiner Haufen schwarzes Glas.',[
option('warm','Die Schicht abbrechen und gemeinsam aufwärmen','Niemand hält heute eine Ansprache. Mara stellt warmes Wasser zwischen euch und wartet, bis deine Hände wieder ruhig sind.',{fatigue:-2,trust:1}),
option('log','Die Gefahr für spätere Teams kartieren','Du zeichnest die falschen Lichter ein, bevor die Erinnerung unscharf wird. Mara hängt die Karte neben die Schleuse.',{flag:'storm_map'})
])]},
{id:'garden_crossing',chapter:1,after:'survivors',title:'Der erste Schritt nach oben',stages:[
stage('Eine Rampe für alle','Die reparierte Schleuse ist offen. Sen steht davor, neben ihr ein älterer Mann mit zwei Gehstöcken. Der Weg über die Wurzeln ist für euch leicht. Für ihn endet er nach drei Metern.',[
option('ramp','Mit zwei Vorräten eine tragfähige Rampe bauen','Ihr verschraubt die Platten, statt sie nur aufzulegen. Sen geht zuerst darüber und dreht sich dann um, um dem Mann die Hand zu reichen.',{supplies:-2,flag:'accessible'}),
option('carry','Eine gesicherte Tragekette organisieren','Du teilst die Strecke in kurze Abschnitte. Niemand wird getragen, ohne vorher gefragt zu werden.',{fatigue:2,flag:'accessible'})
]),
stage('Die Pflanzen bleiben','Ein Mädchen trägt einen Topf, größer als ihr Rucksack. Sen erklärt, dass er den letzten Ableger einer Obstpflanze enthält. Für ihn war auf eurer Frachtliste kein Platz.',[
option('space','Einen Einsatzvorrat zugunsten des Topfes zurücklassen','Mara vermerkt die Änderung. Das Mädchen fragt, ob die Pflanze im Schiff ein Fenster bekommt.',{supplies:-1,trust:2,flag:'garden_seed'}),
option('secure','Den Topf in einer äußeren Transporthalterung sichern','Du polsterst die Halterung mit leerem Verpackungsmaterial. Sen prüft jeden Gurt selbst, bevor sie nickt.',{flag:'garden_seed'},'tech','Die Halterung ist zu schmal. Ihr tragt den Topf zu zweit; deine verletzte Schulter meldet sich bei jedem Schritt.')
]),
stage('Wer bleibt','Drei Bewohner wollen im Garten bleiben. Ihre Wärmeversorgung läuft, ihre Vorräte reichen. Sen zählt die Plätze im Shuttle und streicht keinen der drei Namen durch.',[
option('respect','Einen regelmäßigen Kontakt statt Abflug verlangen','Ihr vereinbart Funkzeiten. Sen lässt den Rückweg offen und steckt den Ersatzsender neben die Tür.',{flag:'garden_autonomy',trust:1}),
option('radio','Einen eigenen Notsender zurücklassen','Mara erklärt den Bewohnern die Batterieanzeige und lässt sie den ersten Proberuf selbst auslösen.',{supplies:-1,flag:'garden_radio'})
])]},
{id:'drone_standoff',chapter:1,after:'interference',title:'Bergungsrecht',stages:[
stage('Menschen im Raster','Die abgeschaltete Drohne fehlt ihrem Betreiber. Ein Helix-Shuttle meldet sich am Grat und fordert Zugang zum Garten. Sein Pilot spricht von Material, obwohl eure Beweise Menschen zeigen.',[
option('record','Die Forderung auf offenem Kanal wiederholen lassen','Du bittest um Bestätigung jedes einzelnen Wortes. Nach einer Pause bezeichnet der Pilot die Bewohner als Personen.',{flag:'helix_record'},'charisma','Er bricht den öffentlichen Kanal ab. Auf der privaten Frequenz klingt seine nächste Forderung härter.'),
option('position','Die Wayfarer zwischen Shuttle und Garten stellen','Mara dreht das Schiff, bis der Zugang im Schatten eures Rumpfs liegt. „Ich bewege mich erst, wenn du es sagst.“',{fatigue:1,flag:'escort_cover'})
]),
stage('Zielerfassung','Eine rote Markierung läuft über eure Außenkamera. Das Shuttle wartet auf eine Reaktion, die sich später als Angriff beschreiben lässt. Ihr habt den Speicher seiner eigenen Drohne.',[
option('proof','Den Bergungsauftrag mit Empfangsbestätigung übermitteln','Die Empfangsbestätigung kommt. Dann schweigt der Pilot lange genug, dass Mara wieder atmen kann.',{attention:-1},'intelligence','Er verweigert die Bestätigung. Ihr sichert den Sendenachweis; die Zielerfassung bleibt noch einen Moment aktiv.'),
option('jam','Den Zielkanal mit einem Einsatzmodul stören','Das rote Raster zerfällt. Ihr gewinnt Zeit, die Beweise über einen zweiten Kanal zu senden.',{supplies:-1,attention:1}),
option('disable','Die Außenantenne des Shuttles gezielt beschießen','Mara hält den Kurs, während du die unbemannte Antenne anvisierst. Das Zielraster erlischt.',{attention:3,flag:'armed_escort'},'combat','Die Salve verfehlt die Antenne. Ein Gegenschuss trifft eure Außenhaut; im Cockpit lösen sich Abdeckungen.')
]),
stage('Der Rückzug','Das Shuttle dreht ab. Sen kommt aus der Schleuse und fragt zuerst, ob jemand verletzt ist. Erst danach sieht sie auf die verschwindende Kennung.',[
option('sen','Sen die weitere Kontaktaufnahme überlassen','Du gibst ihr die Kanaldaten. Sie schreibt ihre erste Nachricht langsam, ohne jemanden um eine Formulierung zu bitten.',{trust:2,flag:'garden_autonomy'}),
option('beacon','Die Belege an einen öffentlichen Notruf hängen','Eine zivile Station bestätigt den Empfang. Eure Namen sind jetzt leichter zu finden, die Bewohner ebenfalls schwerer zu verschweigen.',{attention:2})
])]},
{id:'choir_farewell',chapter:1,after:'choir',title:'Eine Stimme weniger',stages:[
stage('Die letzte Kopie','Lyra steht vor der Resonanzkammer. Das System bietet eine persönliche Antwort ihrer Mentorin an. Du weißt, dass es ihre Worte neu zusammensetzt. Lyra weiß es auch. Trotzdem bleibt sie stehen.',[
option('wait','Neben Lyra warten, ohne für sie zu entscheiden','Du lehnst dich gegen die Wand. Nach einer Weile schaltet Lyra den privaten Kanal aus. „Ich wollte nur noch einmal hören, dass ich recht hatte.“',{trust:2}),
option('truth','Die Herkunft jeder Antwort sichtbar machen','Du aktivierst die Quellenanzeige. Neben jedem Satz steht jetzt sein altes Datum. Lyra liest die Daten, dann nickt sie.',{flag:'archive_sources'})
]),
stage('Ein Archiv ist kein Eigentümer','Sen bringt die Nutzungsvereinbarung zurück. Ein Satz ist gestrichen: dauerhafter exklusiver Zugang. Daneben hat sie geschrieben, dass auch ihre Kinder entscheiden können müssen.',[
option('revoke','Widerrufbaren Zugang und lokale Abschaltung einrichten','Die erste Freigabe gehört Sen. Du lässt sie den Zugang sperren und erneut öffnen, bevor ihr geht.',{flag:'archive_consent'},'tech','Die Fernverbindung akzeptiert die lokale Sperre nicht. Ihr trennt sie physisch und dokumentiert die Einschränkung.'),
option('offline','Das Archiv bis zu einer sicheren Lösung offline lassen','Die Temperaturregelung läuft unabhängig weiter. Lyra legt eine versiegelte lokale Kopie in Sens Hände.',{flag:'archive_consent'})
]),
stage('Ein freier Platz am Tisch','Am Abend ist die Wayfarer voller Geräusche: neue Stimmen, Besteck und ein Streit darüber, wie viel Licht die Pflanze braucht. Mara schiebt dir einen Teller zu. Niemand braucht gerade eine Entscheidung von dir.',[
option('table','Mit der Crew essen','Lyra erzählt eine Geschichte über eine verpatzte Prüfung. Mara lacht an der falschen Stelle und Lyra erzählt sie deshalb noch einmal.',{fatigue:-3,trust:2}),
option('watch','Die erste ruhige Wache übernehmen','Du hörst die anderen durch die offene Brückentür. Mara kommt später mit deinem Teller und bleibt, bis die Sterne wieder wie Sterne aussehen.',{fatigue:-1,trust:1})
])]}
];
