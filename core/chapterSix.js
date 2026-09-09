const lead=(title,site,stat,entry,document)=>({title,site,stat,entry,document});
const mission=(id,title,requires,brief,leads,question,answers,correct,explanation,publicEnding,quietEnding,optional=false)=>({id,title,requires,brief,leads,question,answers,correct,explanation,publicEnding,quietEnding,optional});
export const CHAPTER_SIX={number:6,id:'choir',title:'Der stumme Chor',hub:'choir_camp',targetMinutes:[300,360],
premise:'Drei Tage nach Helios erreicht euch ein Signal von Nereids Nachtseite. Es enthält keine Warnung, sondern die Kennung eines seit achtzehn Jahren vermissten Forschungsschiffs. Lyra erkennt die Stimme ihrer ehemaligen Mentorin. Die Aufnahme wurde gestern erstellt.',
sites:{
choir_camp:['Nereid · Basislager','Schwarzer Staub sammelt sich in den Falten der Zelte. Mara hält die Triebwerke warm.'],
choir_wreck:['Nereid · Wrack der Orison','Der Rumpf liegt auf der Seite. Innen hängen Becher noch an ihren Magnetleisten.'],
choir_ridge:['Nereid · Glasgrat','Unter deinen Sohlen antwortet der Grat mit einem tiefen Ton.'],
choir_array:['Nereid · Antennenfeld','Jede Schüssel zeigt auf einen anderen Punkt unter dem Horizont.'],
choir_habitat:['Nereid · Unterirdischer Garten','Wurzeln drängen durch die Fugen. Zwischen ihnen leuchten handgeschriebene Wegweiser.'],
choir_vault:['Nereid · Resonanzkammer','Die Wände geben eure Schritte mit einer halben Sekunde Verspätung zurück.']},
missions:[
mission('landing','Der Boden unter uns',[],'Die erste Sonde verschwindet im Staub. Ihr Telemetriesignal läuft weiter, als sei sie noch über der Oberfläche. Mara nimmt die Hand vom Landeschub. „Wir setzen erst auf, wenn wir wissen, was uns trägt.“',[
lead('Hohlraumkarte','choir_ridge','perception','Du folgst den Rissen bis zum Rand einer eingesunkenen Platte.','Der zentrale Talkessel ist eine dünne Kruste über einem Hohlraum. Der dunkle Westgrat besteht aus massivem Gestein.'),
lead('Die letzte Landung','choir_wreck','intelligence','Im Cockpit riecht es nach kaltem Kunststoff. Der letzte Anflug ist noch gespeichert.','Die Orison setzte im Talkessel auf. Das rechte Bein brach durch; der anschließende Schub drehte den Rumpf auf die Seite.'),
lead('Schubfenster','choir_array','tech','Ein alter Wetterempfänger zeichnet trotz defekter Uhr weiter auf.','Die Staubfront zieht von Osten. Der Westgrat bleibt im Windschatten; ein kurzer senkrechter Anflug minimiert die Sichtlücke.')
],'Wo kann die Wayfarer sicher bleiben?',['Im geschützten Talkessel','Auf dem massiven Westgrat','Direkt auf dem Wrack'],1,'Tragfähiger Boden und Windschatten fallen am Westgrat zusammen. Die vermeintlich sichere Senke war die Falle.',
'Mara veröffentlicht die Landekoordinaten für spätere Rettungsteams. Eine fremde Empfangsbestätigung erscheint, verschwindet dann wieder.',
'Ihr markiert den Platz lokal. Mara lässt das Positionslicht brennen. „Für den Rückweg“, sagt sie.'),
mission('voice','Eine Stimme von gestern',['landing'],'Lyra hört die Nachricht zum vierten Mal. Beim fünften Durchlauf spricht sie einen Satz mit, bevor er kommt. „Das hat sie damals zu mir gesagt.“ Eine persönliche Erinnerung ist noch kein Lebenszeichen.',[
lead('Spracharchiv','choir_wreck','intelligence','Lyras Finger bleiben über dem Löschsymbol stehen. Dann öffnet sie die Rohdaten.','Der Satz stammt aus einer alten Unterrichtsaufzeichnung. Atempausen und Hintergrundgeräusche sind identisch.'),
lead('Frischer Träger','choir_array','tech','Du legst Original und Empfang nebeneinander.','Die Übertragung ist neu, die Audiodaten sind alt. Ein automatischer Sender fügt aktuelle Zeitstempel hinzu.'),
lead('Antwort unter der Stimme','choir_vault','perception','Nach dem letzten Wort bleibt ein Klicken. Es klingt bei jeder Wiederholung anders.','Die Klickfolge beantwortet eure aktuelle Entfernungsmessung. Ein aktives System verwendet alte Stimmen als Hülle für neue Daten.')
],'Was ist tatsächlich belegt?',['Die Mentorin lebt','Die gesamte Nachricht ist achtzehn Jahre alt','Ein aktives System sendet Archivmaterial'],2,'Der neue Zeitstempel beweist einen heutigen Sender, keine überlebende Sprecherin.',
'Lyra zeichnet eine sachliche Warnung vor falschen Lebenszeichen auf. Danach bittet sie dich, die persönliche Aufnahme nicht mitzuschicken.',
'Ihr bewahrt die Aufnahme im privaten Crewarchiv. Lyra hört sie diesmal nur einmal. „Danke, dass du mir keine Gewissheit verkauft hast.“'),
mission('survivors','Die Menschen unter dem Garten',['voice'],'Unter den Wurzeln brennt Licht. Ein Kind fragt durch eine Rohrleitung, ob ihr wegen der Stimmen kommt. Hinter ihm sagt jemand scharf, es solle nichts versprechen.',[
lead('Die Tür ohne Schloss','choir_habitat','charisma','Eine Frau namens Sen lässt euch Wasser durch eine Durchreiche reichen.','Die Gemeinschaft stammt von der Orison. Sie bleibt wegen einer beschädigten Druckschleuse unten, nicht aus religiöser Verehrung des Chors.'),
lead('Ersatzdichtung','choir_wreck','tech','Ein Ersatzteil liegt noch in seiner Transporthalterung.','Die Dichtung passt zur Gartenschleuse. Ihre Oberfläche ist intakt; nur die Halterung muss gelöst werden.'),
lead('Druckgefälle','choir_vault','intelligence','Lyra lässt den Messwert von Sen gegenprüfen.','Der Garten kann stufenweise an den Außendruck angepasst werden. Ein sofortiges Öffnen würde die Kranken gefährden.')
],'Wie wird ein Auszug möglich?',['Tor sprengen','Dichtung einsetzen und Druck stufenweise angleichen','Den Chor abschalten'],1,'Ein mechanisches Problem verlangt keine Opfergabe. Sen besteht darauf, den Druckausgleich selbst abzunehmen.',
'Die offene Rettungsmeldung erreicht auch die Familien der Orison. Sen lässt die Namen einzeln vorlesen, bevor jemand antwortet.',
'Ihr beginnt mit den Kranken. Sen entscheidet selbst, wann sie den übrigen Bewohnern den Weg nach oben zeigt.'),
mission('interference','Jemand hört mit',['survivors'],'Am Grat steht eine fremde Drohne. Sie richtet ihre Optik auf den Garteneingang. Mara fragt über Funk, ob sie sie abschießen soll. Ein Schuss würde den Beobachter verraten lassen, was er schon weiß.',[
lead('Flugspur','choir_ridge','perception','Du bleibst hinter einer Glasrippe, bis die Optik weiterzieht.','Die Drohne kartiert Personenbewegungen. Sie trägt keinen Sprengsatz; ihre Funkverbindung führt zu einem Helix-Relais.'),
lead('Rückkanal','choir_array','tech','Der Sender wechselt Frequenzen, aber nicht seine Paketgröße.','Ein Wartungsbefehl kann die Drohne zur Landung bringen. Der Befehl braucht die lokale Seriennummer.'),
lead('Serviceplatte','choir_wreck','reflexes','Im Schutz des Wracks wartest du, bis die Drohne tief genug passiert.','Die Seriennummer ist lesbar. Im Speicher liegt ein Bergungsauftrag, der lebende Bewohner als ungemeldete Besatzung aufführt.')
],'Welche Maßnahme schützt Bewohner und Beweise?',['Drohne über dem Garten abschießen','Wartungslandung auslösen und Speicher sichern','Die Position des Gartens bestätigen'],1,'Eine kontrollierte Landung erhält den Speicher und verhindert einen Absturz über den Menschen.',
'Ihr veröffentlicht den Bergungsauftrag mit gesicherten Metadaten. Helix kann nicht mehr behaupten, nichts von den Bewohnern gewusst zu haben.',
'Sen bekommt die Kopie zuerst. „Wir entscheiden, wer uns findet“, sagt sie. Die Drohne bleibt ausgeschaltet.'),
mission('choir','Was die Wand erinnert',['interference'],'Die Resonanzkammer spricht mit Stimmen, die niemand aus eurer Crew kennt. Jede bittet um etwas anderes. Lyra stellt den Lautsprecher leiser. „Wir brauchen eine Frage, auf die eine Erinnerung nicht zufällig antworten kann.“',[
lead('Die neue Frage','choir_vault','willpower','Du fragst nach der Farbe von Maras gerade eingeschaltetem Notsignal.','Das System erkennt Licht und Position, aber reagiert auf Namen mit Archivzitaten. Es beobachtet, ohne die ursprünglichen Menschen wiederherzustellen.'),
lead('Energiepfad','choir_array','tech','Die Antennen speisen den Untergrund, statt Nachrichten ins All zu schicken.','Der Chor stabilisiert zugleich die Temperatur im Garten. Ein abruptes Abschalten würde die Ernte und die letzten Kranken gefährden.'),
lead('Sens Antrag','choir_habitat','charisma','Sen liest eure Messungen langsam. Beim Temperaturdiagramm bleibt sie stehen.','Die Bewohner wollen eine Wahl: umziehen oder mit unabhängiger Wärmeversorgung bleiben. Niemand hat euch die Entscheidung über ihre Heimat übertragen.')
],'Was muss vor einer Abschaltung geschehen?',['Unabhängige Wärme und Zustimmung der Bewohner sichern','Alle Stimmen löschen','Die Bewohner ohne Rückfrage evakuieren'],0,'Die Stimmen sind ein Archiv. Die Menschen im Garten leben jetzt. Ihre Versorgung und ihre Entscheidung gehen vor.',
'Ihr übergebt die Daten einem offenen Forschungskonsortium unter Sens Bedingungen. Lyra unterschreibt als Zeugin, nicht als Eigentümerin.',
'Das Archiv bleibt versiegelt, bis Sen über den Zugang entscheidet. Mara lädt die erste Lieferung Heizmodule aus. Diesmal startet ihr ohne jemanden zurücklassen zu müssen.'),
mission('mentor','Der ungesendete Brief',['voice'],'Lyra bittet dich um zehn Minuten ohne Messgeräte. In der Orison liegt noch das persönliche Fach ihrer Mentorin. Sie möchte es öffnen und hat Angst davor.',[
lead('Entwurf','choir_wreck','perception','Zwischen Wartungszetteln steckt ein kleiner Datenträger.','Der Brief lobt Lyras Widerspruch gegen einen unsicheren Versuch. Er wurde vor dem Absturz geschrieben und nie gesendet.'),
lead('Versuchsregister','choir_vault','intelligence','Du vergleichst Datum und Versuchscode, ohne den privaten Text zu kopieren.','Der kritisierte Versuch wurde tatsächlich abgesagt. Lyras Einwand hatte eine Wirkung, von der sie nichts wusste.'),
lead('Ein stiller Platz','choir_ridge','willpower','Mara hält den Funk frei. Du setzt dich neben Lyra und wartest.','Lyra möchte den Brief behalten. Sie will selbst entscheiden, ob sie später darüber spricht.')
],'Was schuldet ihr Lyra?',['Eine öffentliche Ehrung ohne Rückfrage','Den Brief im Forschungsarchiv veröffentlichen','Privatsphäre und die überprüfte Information'],2,'Ein persönlicher Brief ist kein Fundstück für eine Pressekonferenz.',
'Mit Lyras Zustimmung veröffentlicht ihr ausschließlich die fachliche Korrektur. Der Brief bleibt bei ihr.',
'Lyra steckt den Datenträger ein. Auf dem Rückweg spricht sie zum ersten Mal über etwas, das ihre Mentorin nicht besser wusste.',true)
]};
