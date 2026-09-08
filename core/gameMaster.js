// Only this engine changes the world. Model output is an untrusted action proposal.
export const KINDS=['observe','talk','threaten','insult','protect','ignore','attack','force','sneak','hack','repair','travel','take','buy','heal','rest','use'];
const own=(o,k)=>Object.hasOwn(o,k);
const clamp=n=>Math.max(0,Math.min(100,n));
export function sceneFor(core){
 const s=core.state;
 s.scenes??={};
 if(!own(s.scenes,s.location))s.scenes[s.location]={noise:0,alarmLevel:0,guardsAlerted:false,doorCondition:100,doorOpen:false,hostiles:s.location==='helios_bar'&&!s.flags.heliosConflictResolved?3:0,enemyHp:30,cover:false,distance:8,recentActions:[],loot:s.location==='ship_cargo'?['salvage_parts']:[]};
 return s.scenes[s.location];
}
export function contextFor(core){
 const s=core.state,scene=sceneFor(core);
 const npcs=s.location==='helios_bar'?['kael']:s.location==='ruins_archive'?['lyra']:[];
 for(const [id,npc] of Object.entries(s.npc))if(npc.status==='crew'&&!npcs.includes(id))npcs.push(id);
 const objects={ship_bridge:['echo_artifact','ship_systems'],ship_engineering:['reactor'],ship_cargo:['artifact_crate'],helios_security:['security_door','terminal'],ruins_gate:['gate','glyphs'],ruins_archive:['archive']}[s.location]||[];
 return {location:{id:s.location,...core.location()},scene,player:s.player,hp:s.hp,inventory:s.inventory,equipment:s.equipment,ship:s.ship,flags:s.flags,quests:s.quests,reputation:s.reputation,npcs:Object.fromEntries(npcs.map(id=>[id,s.npc[id]])),targets:[...new Set(['self',...npcs,...objects,...(scene.hostiles?['pirate_leader','pirates']:[]),...s.inventory,...scene.loot,...core.location().exits,...(s.location==='helios_market'?core.data.items.filter(i=>i.value>0).map(i=>i.id):[]),...(['ship','ship_airlock','planet'].includes(core.location().type)?['ship_bridge','helios_docks',...(s.flags.nereidUnlocked?['nereid_surface']:[])]:[])])],recentActions:s.history.slice(-12),memories:s.memories.slice(-20),lastNarrative:s.lastNarrative,allowedKinds:KINDS};
}
export function validatePlan(plan){
 if(!plan||typeof plan.intent!=='string'||typeof plan.tone!=='string'||!Array.isArray(plan.actions)||!plan.actions.length||plan.actions.length>6)throw new Error('invalid_ai_plan');
 for(const a of plan.actions)if(!KINDS.includes(a.kind)||typeof a.target!=='string'||typeof a.description!=='string'||a.description.length>1000||typeof a.negated!=='boolean')throw new Error('invalid_ai_action');
 return plan;
}
export function resolvePlan(core,raw,proposal){
 const plan=validatePlan(proposal),s=core.state,origin=s.location,events=[],rolls=[];
 s.version='1.1.0';s.gameMaster=true;s.currentActionRepeat=0;
 const check=(stat,dc,tags=[])=>{const r=core.check(stat,dc,tags);rolls.push(r);return r.success;};
 const note=text=>events.push(text);
 core.advanceTurn();
 for(const a of plan.actions){
  if(a.negated){note(`Nicht ausgeführt: ${a.description}`);continue;}
  const ctx=contextFor(core),scene=ctx.scene;
  if(!ctx.targets.includes(a.target)){note(`Nicht möglich: ${a.target} ist hier kein verfügbares Ziel.`);continue;}
  const npc=ctx.npcs[a.target];
  if(npc){npc.respect??=0;npc.anger??=0;npc.fear??=0;npc.shortTerm??=[];npc.longTerm??=[];}
  const hostile=['pirates','pirate_leader'].includes(a.target)&&scene.hostiles>0;
  switch(a.kind){
   case 'travel': {
    const id=a.target;
    const remote=['ship_bridge','helios_docks','nereid_surface'].includes(id)&&['ship','ship_airlock','planet'].includes(core.location().type);
    if(!own(core.data.world.locations,id)||(!core.location().exits.includes(id)&&!remote)||id==='nereid_surface'&&!s.flags.nereidUnlocked||id==='ruins_archive'&&!s.flags.gateOpened){note('Dieser Weg ist noch nicht zugänglich.');break;}
    if(remote&&s.ship.fuel<5){note('Für diese Reise fehlt Treibstoff.');break;}
    if(remote)s.ship.fuel-=5;
    s.previousLocation=s.location;s.location=id;note(`Ort erreicht: ${core.location().name}.`);break;
   }
   case 'protect': scene.cover=true;if(npc){core.relation(a.target,2);npc.respect=clamp(npc.respect+2);}note('Du positionierst dich schützend; Deckung für den nächsten Angriff verbessert.');break;
   case 'threaten': case 'talk': case 'insult': {
    if(!npc&&!hostile){note('Hier ist kein ansprechbarer Gesprächspartner vorhanden.');break;}
    if(npc){
     const delta=a.kind==='insult'?-4:check('charisma',12+Math.floor(npc.anger/20),['social',...(plan.tone==='calm'?['calm_social']:[])])?2:-1;
     core.relation(a.target,delta);npc.anger=clamp(npc.anger+(a.kind==='insult'?12:delta>0?-3:2));npc.respect=clamp(npc.respect+(delta>0?1:0));npc.mood=npc.anger>20?'verletzt und vorsichtig':npc.trust>20?'zugewandt':'abwartend';
     npc.shortTerm.push({turn:s.turn,input:raw,outcome:`Vertrauen ${delta}, Ärger ${npc.anger}`});npc.shortTerm=npc.shortTerm.slice(-12);
     note(`${a.target}: Vertrauen ${delta>0?'+':''}${delta}; Stimmung ${npc.mood}.`);
     if(a.target==='kael'&&!scene.hostiles&&!s.flags.nereidUnlocked&&delta>0){s.flags.metKael=true;s.flags.kaelSafe=true;s.flags.nereidUnlocked=true;core.setObjectives('main_echo',['Reise nach Nereid IV und untersuche das Architektentor.']);npc.longTerm.push({turn:s.turn,event:'Kael vertraute dir die Koordinaten von Nereid IV an.'});note('Kael übergibt die Koordinaten von Nereid IV.');}
    }else{
     const ok=check(a.kind==='threaten'?'willpower':'charisma',18+scene.alarmLevel,['social',...(plan.tone==='calm'?['calm_social']:[])]);
     if(ok){scene.hostiles=0;s.flags.heliosConflictResolved=true;s.reputation.crimson++;note('Die Söldner ziehen sich zurück. Crimson-Aufmerksamkeit +1.');}
     else{scene.alarmLevel++;note('Der Anführer hält dagegen und fordert 100 Credits; es wurde nichts bezahlt.');}
    }break;
   }
   case 'ignore': if(scene.hostiles){scene.alarmLevel++;note('Die demonstrative Missachtung verschärft die Konfrontation.');}else note('Du wendest deine Aufmerksamkeit ab.');break;
   case 'attack': {
    if(!hostile){note('Dieses Ziel ist nicht als angreifbarer Gegner vorhanden.');break;}
    if(!s.inventory.includes(s.equipment.weapon)){note('Keine verfügbare ausgerüstete Waffe.');break;}
    const initiative=check('reflexes',12,['combat']);
    if(!initiative){core.damage(scene.cover?3:7);note('Der Gegner reagiert zuerst und verletzt dich.');}
    const hit=check('combat',scene.distance>10?17:14,['combat']);
    if(hit){scene.enemyHp=Math.max(0,scene.enemyHp-15);note('Treffer: Gegnergesundheit −15.');if(!scene.enemyHp){scene.hostiles--;scene.enemyHp=scene.hostiles?30:0;note('Ein Gegner ist kampfunfähig.');}}
    else note('Der Schuss verfehlt sein Ziel; Umstehende suchen Deckung.');
    scene.noise=100;scene.alarmLevel+=2;scene.guardsAlerted=true;s.reputation.crimson++;if(scene.hostiles){core.damage(scene.cover?4:9);note('Die übrigen Gegner erwidern das Feuer.');}else s.flags.heliosConflictResolved=true;
    note('Stationssicherheit alarmiert.');break;
   }
   case 'force': {
    if(!['security_door','gate'].includes(a.target)){note('Hier ist keine gewaltsam zu öffnende Tür vorhanden.');break;}
    if(scene.doorOpen){note('Die Tür ist bereits offen.');break;}
    if(a.target==='gate'){note('Das Architektentor widersteht mechanischer Gewalt.');break;}
    scene.doorCondition=Math.max(0,scene.doorCondition-(check('strength',14,['physical'])?35:12));scene.noise=clamp(scene.noise+22);scene.alarmLevel=Math.floor(scene.noise/25);scene.guardsAlerted=scene.noise>=60;scene.doorOpen=scene.doorCondition===0;
    note(`Türzustand ${scene.doorCondition}/100; Lärm ${scene.noise}; ${scene.doorOpen?'Tür offen.':scene.guardsAlerted?'Wachen reagieren hinter der Tür.':'Tür beschädigt.'}`);break;
   }
   case 'sneak': scene.cover=check('reflexes',14+scene.alarmLevel,['stealth']);if(!scene.cover)scene.alarmLevel++;note(scene.cover?'Du erreichst Deckung.':'Deine Bewegung wird bemerkt.');break;
   case 'repair': if(a.target!=='reactor'||s.location!=='ship_engineering'||!s.inventory.includes('multitool')){note('Eine Reparatur ist hier mit dieser Ausrüstung nicht möglich.');break;}if(s.quests.side_engine.status==='completed'){note('Der Energiekoppler ist bereits repariert.');break;}if(check('tech',14,['repair'])){s.ship.reactorStability=100;core.setQuest('side_engine',{status:'completed'});note('Energiekoppler repariert; Nebenmission abgeschlossen.');}else{scene.noise=clamp(scene.noise+10);note('Reparatur noch nicht gelungen.');}break;
   case 'take': if(!scene.loot.includes(a.target)){note('Dieser Gegenstand liegt hier nicht als Beute bereit.');break;}core.addItem(a.target);scene.loot=scene.loot.filter(id=>id!==a.target);note(`Aufgenommen: ${a.target}.`);break;
   case 'buy': {const item=core.data.items.find(i=>i.id===a.target&&i.value>0&&i.type!=='quest');if(s.location!=='helios_market'||!item||s.inventory.includes(item.id)||s.credits<item.value){note('Dieser Kauf ist nicht möglich.');break;}core.addCredits(-item.value);core.addItem(item.id);note(`${item.name} gekauft: −${item.value} Credits.`);break;}
   case 'heal': if(s.inventory.includes('medkit')&&s.hp<100){core.removeItem('medkit');core.heal(30);note('Medkit verbraucht; bis zu 30 Gesundheit wiederhergestellt.');}else note('Kein Medkit nötig oder verfügbar.');break;
   case 'rest': if(s.location==='ship_quarters'){core.heal(10);note('Ruhepause: bis zu 10 Gesundheit wiederhergestellt.');}else note('Hier kannst du nicht sicher ruhen.');break;
   case 'use': case 'observe': case 'hack': {
    if(a.target==='echo_artifact'&&s.inventory.includes('echo_artifact')&&!s.flags.artifactAwake&&check('intelligence',12,['ancient_tech'])){s.flags.artifactAwake=true;s.flags.knowsEcho=true;core.setObjectives('main_echo',['Suche Kael im Last Light auf Helios-9 auf.']);note('Das Artefakt reagiert auf ein Signal von Nereid; Kael könnte mehr wissen.');}
    else if(a.target==='gate'&&a.kind==='use'&&s.inventory.includes('echo_artifact')&&check('intelligence',14,['ancient_tech'])){s.flags.gateOpened=true;note('Das Artefakt öffnet das Architektentor.');}
    else if(a.target==='archive'&&!s.flags.archiveTouched&&check('intelligence',14,['ancient_tech'])){s.flags.archiveTouched=true;core.setQuest('main_echo',{status:'completed',stage:4});core.setObjectives('main_echo',['Akt I abgeschlossen: Das Echo-Archiv wurde erreicht.']);note('Das Echo-Archiv offenbart seine Sternenkarte. Akt I abgeschlossen.');}
    else if(a.target==='terminal'&&a.kind==='hack'){note(check('tech',15,['hacking'])?'Zugriff auf lokale Sicherheitsinformationen gelungen.':'Zugriff verweigert.');}
    else note(`Untersucht: ${a.target}. Verfügbare Ortsinformationen und bestehender Zustand bleiben verbindlich.`);break;
   }
  }
  scene.recentActions.push({turn:s.turn,...a});scene.recentActions=scene.recentActions.slice(-20);
 }
 if(s.hp===0)note('Du bist kampfunfähig; medizinische Hilfe ist erforderlich.');
 const result={intent:plan.intent,tone:plan.tone,actions:plan.actions,events,rolls,origin,location:s.location,hp:s.hp};
 core.recordAction({raw,...result});core.pushLog(events.join(' '));s.lastPlayerInput=raw;
 return result;
}
