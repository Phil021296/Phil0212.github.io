import {pendingEncounter} from './encounters.js';
import {activeChapter,longChoices,longApply,longStatus} from './longCampaign.js';
import {TEXT,ARRIVALS,endingText} from './storyContent.js';
export const VERSION='1.4.0';
export const PEOPLE={
 kael:{name:'Kael Voss',role:'Vermittler',voice:'Kurze Sätze, trockener Humor; weicht seiner Schuld aus.',desire:'Lyra lebend aus der Haft bringen.',boundary:'Er verkauft niemanden ein zweites Mal.'},
 lyra:{name:'Dr. Lyra Venn',role:'Xenoarchäologin',voice:'Präzise; wird unter Stress leise.',desire:'Die Warnung beweisen, ohne sie zur Waffe zu machen.',boundary:'Menschenleben sind keine Versuchsdaten.'},
 mara:{name:'Mara Sato',role:'Pilotin der Wayfarer',voice:'Pragmatisch, direkt, beiläufig warm.',desire:'Crew und Bruder auf Helios-9 nach Hause bringen.',boundary:'Kein aussichtsloser Kampf.'}
};
export function ensureStory(core){
 const s=core.state;s.story??={schema:2,minutes:0,beats:{},journal:[],chronicle:[],visits:{},ending:null};
 const t=s.story;t.beats??={};t.journal??=[];t.chronicle??=[];t.visits??={};t.minutes??=0;
 if(!t.migrated){
  if(s.flags.metKael)t.beats.signal=true;
  if(s.flags.nereidUnlocked){t.beats.kael=true;t.beats.lyra=true;t.beats.briefing=true;}
  if(s.flags.artifactAwake)t.beats.scan=true;
  if(s.flags.archiveTouched&&s.quests.main_echo.status==='completed')t.beats.decoded=true;
  t.migrated=true;
 }
 for(const id of Object.keys(PEOPLE)){s.npc[id]??={trust:0,status:'Unbekannt'};const n=s.npc[id];n.respect??=0;n.anger??=0;n.fear??=0;n.shortTerm??=[];n.longTerm??=[];}
 s.npc.mara.status='crew';if(t.beats.lyra)s.npc.lyra.status='crew';
 return t;
}
export function opening(core){ensureStory(core);return TEXT.opening;}
export function rememberTurn(core,input,narrative,result){
 const t=ensureStory(core);t.chronicle.push({turn:core.state.turn,location:core.state.location,input,narrative,events:result.events||[]});t.chronicle=t.chronicle.slice(-80);
 core.state.lastNarrative=narrative;core.state.lastResolution=result;
}
export function chapter(core){
 const t=ensureStory(core),b=t.beats;
 if(activeChapter(core))return longStatus(core);
 if(t.ending)return {number:'EPILOG',title:'Was von uns bleibt',goal:'Deine Entscheidungen haben Spuren hinterlassen. Du findest sie im Logbuch.'};
 if(b.decoded)return {number:'KAPITEL 04',title:'Eine Zukunft ist keine Schuld',goal:'Entscheide, was mit der Warnung des Archivs geschieht.'};
 if(b.briefing)return {number:'KAPITEL 03',title:'Unter fremden Sternen',goal:'Fliege von der Brücke nach Nereid IV und erreiche das Echo-Archiv.'};
 if(b.kael)return {number:'KAPITEL 02',title:'Niemand bleibt zurück',goal:b.lyra?'Sprich mit Lyra über die Warnung.':'Befreie Lyra aus der Sicherheitssektion von Helios-9.'};
 return {number:'KAPITEL 01',title:'Das letzte Licht',goal:b.signal?'Finde Kael im Last Light auf Helios-9.':'Lies Lyras Nachricht auf der Brücke.'};
}
const ch=(id,label,detail='')=>({id,label,detail,kind:'story',target:id});
export function storyChoices(core){
 const t=ensureStory(core),s=core.state,b=t.beats,l=s.location,a=[];
 if(t.ending)return longChoices(core);
 if(s.hp<=0)return [ch('recover','Dich von der Crew bergen lassen','Rückkehr zur Krankenstation · medizinische Schulden')];
 if(s.hp<100&&s.inventory.includes('medkit'))a.push(ch('use_medkit','Ein Medkit verwenden','Verbraucht ein Medkit · 30 Gesundheit'));
 if(l==='helios_docks'&&s.ship.fuel<40)a.push(ch('refuel','Die Wayfarer auftanken lassen','40 Treibstoff · 40 Credits oder eine offene Rechnung'));
 if(l==='ship_bridge'){
  if(!b.signal)a.push(ch('read_signal','Die Nachricht zurückverfolgen','Lyras letzten Aufenthaltsort feststellen'));
  if(!b.scan)a.push(ch('scan_artifact','Das Artefakt untersuchen','Eine Referenzmessung sichern'));
  if(!b.mara)a.push(ch('speak_mara','Mara nach ihrer Einschätzung fragen','Was sie an Helios-9 hält'));
  if(b.briefing)a.push(ch('launch_nereid','Kurs auf Nereid IV setzen','5 Treibstoff · Abflug von der Brücke'));
 }
 if(l==='helios_bar'){
  if(!s.flags.heliosConflictResolved){
   if(!b.readRoom)a.push(ch('read_room','Die Männer und den Raum beobachten','Einen Ausweg finden, bevor Waffen sprechen'));
   a.push(ch('negotiate','Dem Anführer einen Rückzug anbieten','Charisma · leichter mit einem Druckmittel'),ch('pay_passage','Kaels offene Rechnung begleichen','100 Credits · kein Blutvergießen'),ch('service_route','Kael über den Wartungsgang herausholen','Reflexe · bei Entdeckung drohen Verletzungen'));
   if(s.inventory.includes('compact_pistol'))a.push(ch('fight_bar','Die Waffe ziehen und Kael den Weg freikämpfen','Kampf · Verletzungen und Fahndung riskieren'));
  }else if(!b.kael)a.push(ch('kael_truth','Kael fragen, was mit Lyra geschehen ist','Er schuldet dir eine ehrliche Antwort'));
  else if(!b.kaelAfter)a.push(ch('kael_after','Kael mit seiner Entscheidung konfrontieren','Er hat Lyras Vertrauen verkauft'));
 }
 if(l==='helios_security'&&b.kael&&!b.lyra)a.push(ch('release_lyra','Kaels Freigabecode vorlegen','Lyra offiziell aus dem Gewahrsam übernehmen'),ch('hack_detention','Die Zellensteuerung überbrücken','Technik · du hinterlässt eine Spur'));
 if(b.lyra&&!b.briefing&&presentNPCs(core).includes('lyra'))a.push(ch('lyra_briefing','Lyra erklären lassen, was das Echo zeigt','Die Gefahr bekommt einen Namen'));
 if(b.briefing&&!b.promise&&presentNPCs(core).includes('lyra'))a.push(ch('promise_lyra','Lyra versprechen, die Warnung nicht zu verkaufen','Eine Zusage, an die sie sich erinnern wird'));
 if(l==='ship_engineering'&&s.quests.side_engine.status!=='completed')a.push(ch('repair_coupler','Mit Mara den Energiekoppler stabilisieren','Technik · bessere Reserven für den Rückflug'));
 if(l==='ship_quarters'&&!b.watch)a.push(ch('quiet_watch','Eine ruhige Wache mit Mara verbringen','Erholen und miteinander reden'));
 if(l==='ship_medbay'&&s.hp<100&&(t.medicalUses||0)<3)a.push(ch('autodoc','Die Verletzungen versorgen lassen','20 Gesundheit · begrenzte Vorräte'));
 if(l==='ship_cargo'&&!b.salvage&&!s.inventory.includes('salvage_parts'))a.push(ch('cargo_parts','Die geborgenen Ersatzteile sichern','Bergungskomponenten mitnehmen'));
 if(l==='ruins_gate'&&b.lyra&&!s.flags.gateOpened)a.push(ch('open_gate','Mit Lyra das Artefakt an das Tor setzen','Willenskraft · eine fremde Erinnerung'));
 if(l==='ruins_archive'&&b.lyra&&!b.decoded)a.push(ch('decode_archive','Die Aufzeichnung zusammensetzen','Intelligenz · Lyra hilft beim Abgleich'));
 if(l==='ruins_archive'&&b.decoded)a.push(ch('ending_broadcast','Die Warnung öffentlich übertragen','Helios-9 warnen · deinen Standort preisgeben'),ch('ending_shelter','Mara eine stille Evakuierung organisieren lassen','Kontakte schützen · weniger Menschen erreichen'),ch('ending_sell','Helix das Archiv gegen eine Evakuierung überlassen','Versorgung sichern · Beweise aus der Hand geben'));
 return a;
}
export function presentNPCs(core){
 const s=core.state,t=ensureStory(core),ids=[];
 if(s.location.startsWith('ship_')||activeChapter(core))ids.push('mara');
 if(t.beats.lyra)ids.push('lyra');
 if(s.location==='helios_bar')ids.push('kael');
 return ids;
}
export function exitsFor(core){
 const extended=activeChapter(core);if(extended&&(pendingEncounter(core)||core.state.hp<=0))return [];if(extended)return Object.keys(extended.sites).filter(id=>id!==core.state.location&&(core.state.location===extended.hub||id===extended.hub)).map(id=>({id,label:extended.sites[id][0],kind:'travel',target:id}));
 if(core.state.story?.ending)return [];
 const s=core.state,ids=[...core.location().exits];
 if(s.location==='nereid_surface')ids.push('ship_bridge');
 return [...new Set(ids)].filter(id=>id!=='ruins_archive'||s.flags.gateOpened).map(id=>({id,label:core.data.world.locations[id].name,kind:'travel',target:id}));
}
export function atmosphere(core){
 const s=core.state,t=ensureStory(core),scene=s.scenes?.[s.location];
 if(activeChapter(core))return core.location().desc+' '+(t.expansion.attention>=8?'An den Zugängen werden inzwischen Ausweise geprüft.':t.expansion.attention>=4?'Eure Namen tauchen in den Kontrollprotokollen auf.':'Noch könnt ihr euch unauffällig bewegen.');
 if(t.ending)return 'Die entscheidende Übertragung ist raus. Zum ersten Mal seit Helios-9 muss niemand sofort antworten.';
 if(s.location==='helios_bar'&&t.beats.approach==='violent')return 'Glassplitter liegen unter den Tischen. Kael sitzt neben der umgestürzten Bank; in der Ferne läuft eine Sirene.';
 if(s.location==='helios_bar')return s.flags.heliosConflictResolved?(t.beats.approach==='escaped'?'Der Versorgungsgang ist still. Kael wartet, bis dein Atem wieder ruhig wird.':'Kael schiebt sein unberührtes Glas von sich. Die Männer sind gegangen.'):scene?.alarmLevel>=3?'Der Barkeeper hat die Musik abgestellt. Jetzt hören alle zu.':'Kael sieht zu dir, dann zum Seitenausgang. Drei Männer stehen zwischen euch.';
 if(s.location==='helios_security')return t.beats.lyra?'Lyras Zelle steht offen. Im Flur läuft die nächste Schicht auf.':'Hinter dem Sicherheitsglas klappert ein Stift. Jemand wartet darauf, dass du zuerst sprichst.';
 if(s.location.startsWith('ruins_'))return 'Das Licht reagiert auf Bewegung. Wenn Lyra stehen bleibt, hält auch das Flimmern inne.';
 if(s.location==='ship_bridge')return t.beats.briefing?'Nereid IV steht im Navigationsspeicher. Mara hat den Kurs berechnet, aber noch nicht bestätigt.':'Ein offener Funkkanal. Ein schwarzes Artefakt. Mara wartet auf deine Entscheidung.';
 return core.location().desc;
}
export function arrival(core){
 if(activeChapter(core))return core.location().desc;
 const s=core.state,t=ensureStory(core);t.visits[s.location]=(t.visits[s.location]||0)+1;
 if(s.location==='helios_bar'&&s.flags.heliosConflictResolved)return 'Ein neuer Gast sitzt am alten Tisch der Söldner. Kael nickt dir zu; der Barkeeper stellt wortlos ein sauberes Glas bereit.';
 if(s.location==='helios_security'&&t.beats.lyra)return 'Die Beamtin erkennt euch und schaut demonstrativ auf ihren Bildschirm. Zelle 04 ist leer. Lyra bleibt an deiner Seite.';
 if(t.visits[s.location]>1)return atmosphere(core)+'\n\n'+(presentNPCs(core).includes('lyra')?'Lyra hält sich neben dir. Diesmal wartet sie nicht darauf, dass du sie zum Weitergehen aufforderst.':'Du kennst den Weg jetzt. An den Spuren eures letzten Besuchs hat sich nichts geändert.');
 return ARRIVALS[s.location]||core.location().desc;
}
function entry(core,title,text){
 const t=ensureStory(core);if(t.journal.some(e=>e.title===title))return;
 t.journal.push({title,text,turn:core.state.turn});core.remember(text,75,'story');core.state.xp+=20;core.state.level=1+Math.floor(core.state.xp/100);
}
export function applyStory(core,id,check){
 if(id.startsWith('long_'))return longApply(core,id,check);
 if(!storyChoices(core).some(c=>c.id===id))throw new Error('Diese Möglichkeit ist in der aktuellen Szene nicht verfügbar.');
 const s=core.state,t=ensureStory(core),b=t.beats,events=[];let narrative='';
 const fact=x=>events.push(x);
 const trust=(id,delta,text)=>{core.relation(id,delta);s.npc[id].longTerm.push({turn:s.turn,event:text});fact(PEOPLE[id].name+': Vertrauen '+(delta>0?'+':'')+delta);};
 const clear=()=>{s.flags.heliosConflictResolved=true;s.scenes.helios_bar.hostiles=0;};
 switch(id){
 case 'recover':
  s.previousLocation=s.location;s.location='ship_medbay';s.hp=35;t.medicalDebt=(t.medicalDebt||0)+80;t.minutes+=20;
  narrative='Du kommst auf der Krankenliege zu dir. Der Gurt drückt über deiner Brust. Mara sitzt auf dem Boden neben der Tür und dreht dein Terminal zwischen den Fingern.\n\n„Beim nächsten Mal“, sagt sie, „meldest du dich früher.“\n\nDu willst antworten, aber sie steht schon auf. Auf dem Terminal wartet die Rechnung des Notdienstes. Die Crew hat dich nicht zurückgelassen.';fact('35 Gesundheit; 80 Credits medizinische Schulden; zur Wayfarer geborgen.');break;
 case 'use_medkit':
  core.removeItem('medkit');core.heal(30);narrative='Du reißt die Versiegelung mit den Zähnen auf. Das Gel brennt auf der Haut, dann wird der Schmerz stumpfer. Du wartest, bis deine Hand wieder ruhig ist, bevor du die leere Hülle wegsteckst.';fact('Medkit verbraucht; bis zu 30 Gesundheit wiederhergestellt.');break;
 case 'refuel':
  if(s.credits>=40){core.addCredits(-40);fact('40 Credits bezahlt.');}else{t.dockDebt=(t.dockDebt||0)+40;fact('40 Credits Dockschulden vermerkt.');}
  s.ship.fuel=Math.min(100,s.ship.fuel+40);narrative='Der Schlauch am Dockanschluss versteift sich unter Druck. Mara überwacht die Anzeige und bestätigt dem Techniker die Übernahme.\n\n'+(t.dockDebt?'„Die Rechnung hängt jetzt an meiner Kennung“, sagt sie. „Denk daran, wenn wir wieder hier sind.“':'„Damit kommen wir hin und zurück“, sagt sie. Diesmal klingt der Satz nicht wie eine Frage.');fact('40 Treibstoff aufgenommen.');break;
 case 'fight_bar':{
  const ok=check('combat',b.readRoom?11:15,['combat','ranged']);const injury=ok?5:18;core.damage(injury);clear();b.approach='violent';s.reputation.crimson+=2;t.wanted=true;
  narrative=ok?'Du ziehst, bevor der Anführer seine Hand schließen kann. Dein Schuss trifft die Tischkante neben ihm; Holzsplitter schlagen gegen sein Gesicht. Kael kippt den Tisch um und zieht dich hinter die Sitzbank.\n\nDer Gegenschuss streift deinen Arm. Dann schreit der Barkeeper ein einziges Wort: „Sicherheit!“\n\nDie Männer weichen zum Ausgang zurück. Du könntest ihnen folgen. Du tust es nicht. Kael drückt ein gefaltetes Tuch gegen deinen Arm. Niemand in der Bar sieht dich noch beiläufig an.':'Der Anführer ist schneller, als du dachtest. Sein Schuss trifft dich, bevor du sauber zielen kannst. Du feuerst zurück, und die Lampen über dem Tisch zerplatzen.\n\nKael packt deinen Kragen. Ihr kommt hinter die Sitzbank, während der Barkeeper den Sicherheitsalarm auslöst.\n\nDie Männer verlassen den Raum, bevor die Wachen eintreffen. Kael nimmt dir die Waffe aus der Hand und gibt sie dir erst wieder, als dein Finger nicht mehr am Abzug liegt. „Jetzt kennen sie uns beide“, sagt er.';
  fact(injury+' Gesundheit verloren; Crimson-Aufmerksamkeit +2; Sicherheitsalarm ausgelöst.');s.scenes.helios_bar.guardsAlerted=true;s.scenes.helios_bar.alarmLevel=3;break;}

 case 'read_signal':b.signal=true;s.flags.knowsEcho=true;narrative=TEXT.signal;entry(core,'Eine Stimme aus Zelle 04','Lyras Nachricht endete in der Sicherheitssektion. Kael wartet im Last Light.');fact('Treffpunkt und Haftort bekannt.');break;
 case 'scan_artifact':b.scan=true;s.flags.artifactAwake=true;narrative=TEXT.scan;entry(core,'Elf Sekunden','Eine Referenzmessung des Artefakts kann helfen, das Archiv zu entschlüsseln.');fact('Referenzmessung gesichert.');break;
 case 'speak_mara':b.mara=true;narrative=TEXT.mara;entry(core,'Maras Zuhause','Maras Bruder lebt auf Helios-9. Für sie ist die Station kein Punkt auf einer Karte.');break;
 case 'read_room':b.readRoom=true;narrative=TEXT.readRoom;fact('Druckmittel und offener Wartungsgang entdeckt.');break;
 case 'negotiate':{
  const ok=check('charisma',b.readRoom?10:15,['persuasion','calm_social']);narrative=ok?TEXT.negotiateWin:TEXT.negotiateFail;
  if(ok){clear();b.approach='diplomacy';trust('kael',3,'Du hast die Söldner ohne Gewalt zum Gehen gebracht.');}
  else{s.scenes.helios_bar.alarmLevel++;b.readRoom=true;fact('Zahlung und Wartungsgang bleiben offen.');}break;}
 case 'pay_passage':
  if(s.credits<100){narrative='Dein Guthaben reicht nicht. Kael bemerkt es und deutet mit dem Kinn zum Seitengang.';fact('Nichts bezahlt.');break;}
  core.addCredits(-100);clear();b.approach='paid';narrative=TEXT.pay;trust('kael',2,'Du hast seine Schulden beglichen.');fact('100 Credits bezahlt.');break;
 case 'service_route':{
  const ok=check('reflexes',b.readRoom?10:14,['stealth']);clear();b.approach='escaped';narrative=ok?TEXT.escapeWin:TEXT.escapeFail;
  if(!ok){core.damage(6);s.reputation.crimson++;fact('6 Gesundheit verloren; Crimson kennt dein Gesicht.');}break;}
 case 'kael_truth':b.kael=true;b.signal=true;s.flags.metKael=true;s.flags.kaelSafe=true;narrative=TEXT.kael;entry(core,'Der Preis eines Kontakts','Kael verkaufte den Transportkontakt an Helix. Sein Code erlaubt die Übernahme von Lyra aus Zelle 04.');fact('Freigabecode erhalten.');break;
 case 'kael_after':b.kaelAfter=true;narrative=TEXT.kaelAfter;s.npc.kael.anger+=3;break;
 case 'release_lyra':case 'hack_detention':{
  const quiet=id==='release_lyra',ok=quiet||check('tech',13,['hacking']);b.lyra=true;s.npc.lyra.status='crew';narrative=quiet?TEXT.release:ok?TEXT.hackWin:TEXT.hackFail;
  if(!quiet){s.reputation.helix--;if(!ok){core.damage(8);fact('8 Gesundheit verloren; Sicherheitsalarm.');}}
  trust('lyra',quiet?3:2,quiet?'Du hast die Verantwortung für ihre Freilassung übernommen.':'Du bist trotz des Risikos in die Sicherheitssektion eingedrungen.');entry(core,'Niemand bleibt zurück','Lyra ist frei und begleitet die Wayfarer.');break;}
 case 'lyra_briefing':b.briefing=true;s.flags.nereidUnlocked=true;narrative=TEXT.briefing;entry(core,'Nicht irgendeine Station','Helix plant einen Feldtest unter Helios-9. Im Archiv auf Nereid IV liegt der vollständige Beleg.');fact('Nereid IV als Flugziel freigeschaltet.');break;
 case 'promise_lyra':b.promise=true;narrative=TEXT.promise;core.promise('Die Warnung wird nicht an Helix verkauft.');trust('lyra',2,'Du hast versprochen, die Warnung nicht an Helix zu verkaufen.');break;
 case 'repair_coupler':{
  const ok=check('tech',12,['repair','engineering']);s.ship.reactorStability=ok?100:85;s.quests.side_engine.status='completed';b.repaired=true;narrative=ok?TEXT.repairWin:TEXT.repairFail;entry(core,'Ein Schiff, das uns trägt','Mara und du habt den Energiekoppler stabilisiert.');fact('Reaktor stabilisiert; Nebenmission abgeschlossen.');break;}
 case 'quiet_watch':b.watch=true;core.heal(8);narrative=TEXT.watch;trust('mara',1,'Du hast dir Zeit für eine gemeinsame Wache genommen.');fact('Bis zu 8 Gesundheit wiederhergestellt.');break;
 case 'autodoc':t.medicalUses=(t.medicalUses||0)+1;core.heal(20);narrative='Die Liege ist kalt. Der Autodoc arbeitet ohne Fragen. Du beobachtest die grüne Anzeige, bis das Zittern in deinen Händen nachlässt.';fact('Bis zu 20 Gesundheit wiederhergestellt.');break;
 case 'cargo_parts':b.salvage=true;core.addItem('salvage_parts');narrative='Zwischen den verkohlten Kisten findest du einen versiegelten Satz Kupplungsringe. Du prüfst jeden einzeln und legst die brauchbaren Teile in die Werkzeugtasche.\n\nAuf dem leeren Behälter steht noch der Name des Wracks. Du drehst ihn zur Wand.';fact('Bergungskomponenten aufgenommen.');break;
 case 'launch_nereid':
  if(s.ship.fuel<5){narrative='Mara verwirft den Kurs. „Nicht mit diesen Reserven. Wir brauchen Treibstoff vom Dockring.“';break;}
  s.ship.fuel-=5;s.previousLocation=s.location;s.location='nereid_surface';narrative=arrival(core);fact('Nereid IV erreicht; 5 Treibstoff verbraucht.');break;
 case 'open_gate':
  if(!check('willpower',12,['mental','ancient_tech'])){core.damage(5);fact('5 Gesundheit durch Echo-Kontakt verloren.');}
  s.flags.gateOpened=true;narrative=TEXT.gate;fact('Tor geöffnet.');break;
 case 'decode_archive':
  if(!check('intelligence',b.scan?9:13,['analysis','ancient_tech'])){core.damage(4);fact('4 Gesundheit durch Überlastung verloren.');}
  b.decoded=true;s.flags.archiveTouched=true;narrative=TEXT.decode;entry(core,'Neun Minuten','Das Archiv belegt: Ein rechtzeitiger Testabbruch kann Helios-9 retten.');fact('Vollständige Warnung gesichert.');break;
 case 'ending_broadcast':case 'ending_shelter':case 'ending_sell':
  t.ending=id;s.quests.main_echo.status='completed';s.quests.main_echo.stage=4;narrative=endingText(id,b);
  s.previousLocation=s.location;s.location='ship_bridge';s.ship.fuel=Math.max(0,s.ship.fuel-5);if(!b.repaired)s.ship.hull=Math.max(0,s.ship.hull-5);
  if(id==='ending_broadcast'){trust('lyra',5,'Du hast die Warnung öffentlich gemacht.');s.reputation.helix-=3;s.reputation.freeSystems+=3;}
  else if(id==='ending_shelter'){trust('mara',4,'Du hast ihr die zivile Rettungskette anvertraut.');s.reputation.freeSystems++;}
  else{core.addCredits(400);fact('400 Credits erhalten.');s.reputation.helix+=2;trust('lyra',b.promise?-12:-5,'Du hast Helix die Verfügung über das Archiv gegeben.');}
  if(b.promise)for(const p of s.promises)if(p.text.includes('Helix'))p.kept=id!=='ending_sell';
  entry(core,'Was von uns bleibt',id==='ending_broadcast'?'Die Warnung ist öffentlich. Helix kennt deine Signatur.':id==='ending_shelter'?'Eine zivile Rettungskette wurde aufgebaut. Wie viele sie erreichte, bleibt ungewiss.':'Helix hat den Test ausgesetzt und kontrolliert die Beweise. Lyra hat Vertrauen verloren.');fact('Erster Handlungsbogen abgeschlossen.');break;
 }
 t.minutes+=3;const c=chapter(core);s.quests.main_echo.title='Das letzte Licht';s.quests.main_echo.objectives=[c.goal];
 return {events,narrative,choice:id};
}
