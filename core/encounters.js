import {ENCOUNTERS} from './encounterContent.js';
const SITES={lift_rescue:'h9_maintenance',water_queue:'h9_concourse',witness_escort:'h9_council',grid_blackout:'h9_maintenance',landing_storm:'choir_ridge',garden_crossing:'choir_habitat',drone_standoff:'choir_ridge',choir_farewell:'choir_vault'};
const HUBS=['h9_coordination','choir_camp'];
const ch=(id,label,detail)=>({id:'long_'+id,label,detail,kind:'story',target:'long_'+id});
export function expedition(core){
 const e=core.state.story?.expansion;if(!e?.active)return null;
 e.expedition??={supplies:6,fatigue:0,lastCheckpoint:0,scenes:{},flags:{},provisioned:0};
 const r=e.expedition;
 if(r.provisioned<e.index){r.supplies=Math.min(12,r.supplies+6);r.fatigue=Math.max(0,r.fatigue-2);r.provisioned=e.index;}
 return r;
}
const checkpoint={id:'checkpoint',title:'Eure Namen auf der Liste',stages:[{title:'Eine Kontrolle am Ausgang',text:'Als ihr eure Unterlagen zusammenpackt, warten zwei Sicherheitsleute an der Tür. Eure öffentlichen Auftritte und die protokollierten Zugriffe haben eine Prüfung ausgelöst. Mara bleibt neben den versiegelten Fundstücken stehen. Die Beamtin will wissen, welche davon ihr selbst beschafft habt.',options:[
{id:'records',label:'Die Herkunft der Beweise sauber darlegen',text:'Du trennst Originale von Aussagen und markierst die Lücken. Die Beamtin quittiert den Bestand. Eure nächste Untersuchung bleibt unbehelligt.',effect:{attention:-2},stat:'intelligence',failure:'Die Prüfung findet eine Lücke in der Übergabekette. Ihr behaltet die Originale, müsst aber eine ergänzende Erklärung abgeben.'},
{id:'wait',label:'Die Prüfung begleiten und eine Kopie verlangen',text:'Ihr bleibt, bis jedes Siegel im Protokoll steht. Es kostet Kraft, aber kein Original verlässt ohne Quittung eure Hände.',effect:{fatigue:2,attention:-1}}
]}]};
export function pendingEncounter(core){
 const e=core.state.story?.expansion,r=expedition(core);if(!r)return null;if(r.activeScene){const event=ENCOUNTERS.find(v=>v.id===r.activeScene);return {event,step:r.scenes[event.id]?.step||0};}if(core.state.location!==HUBS[e.index])return null;
 const event=ENCOUNTERS.find(v=>v.chapter===e.index&&e.cases[v.after]?.done&&!r.scenes[v.id]?.done);
 if(event)return {event,step:r.scenes[event.id]?.step||0};
 if(e.attention>=r.lastCheckpoint+4)return {event:checkpoint,step:0};
 return null;
}
export function encounterChoices(core){
 const r=expedition(core);if(!r)return null;
 if(core.state.hp<=0)return [ch('rescue','Von der Crew bergen und behandeln lassen','35 Gesundheit · 60 Credits medizinische Schulden · Begegnung bleibt offen')];
 const pending=pendingEncounter(core);if(!pending)return null;
 if(pending.event.id!=='checkpoint'&&!r.activeScene)return [ch('scene_start','Zum Einsatz aufbrechen: '+pending.event.title,'Begegnung vor Ort · Rückkehr nach Abschluss')];
 return pending.event.stages[pending.step].options.filter(o=>(!o.effect.supplies||r.supplies+o.effect.supplies>=0)&&(!['fire','disable'].includes(o.id)||core.state.inventory.includes('compact_pistol'))).map(o=>ch('scene_'+o.id,o.label,[o.stat?'Probe · Schwierigkeit steigt bei Erschöpfung':'Ohne Probe',o.effect.supplies<0?(-o.effect.supplies)+' Einsatzvorräte':null,o.effect.fatigue>0?'Erschöpfung +'+o.effect.fatigue:null].filter(Boolean).join(' · ')));
}
export function campChoices(core){
 const r=expedition(core),e=core.state.story.expansion;if(!r||core.state.location!==HUBS[e.index])return [];
 const a=[];
 if(r.supplies>0&&(r.fatigue>0||core.state.hp<100))a.push(ch('camp_rest','Mit der Crew verschnaufen','1 Einsatzvorrat · 20 Gesundheit · Erschöpfung −3'));
 if(r.supplies<12&&core.state.credits>=25)a.push(ch('camp_supply','Einen Einsatzvorrat beschaffen','25 Credits · lokale Versorgung'));
 return a;
}
export function encounterApply(core,id,check){
 const r=expedition(core),e=core.state.story.expansion,s=core.state,t=s.story;let narrative='',events=[];
 if(id==='long_rescue'){s.hp=35;r.activeScene=null;r.fatigue=Math.min(8,r.fatigue+2);t.medicalDebt=(t.medicalDebt||0)+60;s.location=HUBS[e.index];return {narrative:'Mara bringt dich zurück. Als du wieder aufwachst, sitzt Lyra am Rand der Liege. „Der Einsatz wartet. Du jetzt auch.“ Die offenen Entscheidungen bleiben bestehen.',events:['Gesundheit 35','Medizinische Schulden +60']};}
 if(id==='long_camp_rest'){r.supplies--;r.fatigue=Math.max(0,r.fatigue-3);s.hp=Math.min(100,s.hp+20);t.minutes+=25;return {narrative:r.flags.armed_escort?'Mara legt die gereinigte Waffe weit weg von den Essensschalen. Ihr sprecht zuerst über die Verletzten. Erst danach über den nächsten Weg.':'Mara teilt die letzte warme Portion. Lyra klappt ihre Unterlagen zu, als sie merkt, dass du immer noch auf dieselbe Zeile starrst. Für eine Weile bleibt der Funk leise.',events:['Einsatzvorrat −1','Gesundheit +20, höchstens 100','Erschöpfung −3, mindestens 0']};}
 if(id==='long_camp_supply'){s.credits-=25;r.supplies++;return {narrative:'Du übernimmst ein versiegeltes Paket mit Akkus, Verbänden und Notwasser. Die Ausgabe bestätigt die Stückzahl auf deinem Beleg.',events:['25 Credits bezahlt','Einsatzvorrat +1']};}
 const {event,step}=pendingEncounter(core);if(id==='long_scene_start'){r.activeScene=event.id;s.previousLocation=s.location;s.location=SITES[event.id];return {narrative:'Ihr brecht gemeinsam auf. '+core.location().desc,events:['Einsatzort erreicht: '+core.location().name]};}const o=event.stages[step].options.find(o=>'long_scene_'+o.id===id);
 const local=r.scenes[event.id]?.flags||{};const cover=local.escort_cover||local.braced;
 const dc=14+Math.floor(r.fatigue/2)+(e.attention>=8?2:0)-(cover&&['combat','reflexes'].includes(o.stat)?2:0);
 const success=!o.stat||check(o.stat,dc,[]);
 narrative=success?o.text:o.failure;
 const effect=o.effect;
 if(effect.supplies){r.supplies+=effect.supplies;events.push('Einsatzvorräte '+effect.supplies);}
 if(effect.fatigue){r.fatigue=Math.max(0,Math.min(8,r.fatigue+effect.fatigue));events.push('Erschöpfung: '+r.fatigue);}
 if(effect.attention){e.attention=Math.max(0,e.attention+effect.attention);events.push('Aufmerksamkeit: '+e.attention);}
 if(effect.trust){core.relation('mara',effect.trust);events.push('Mara: Vertrauen +'+effect.trust);}
 if(effect.flag&&success){r.flags[effect.flag]=true;if(event.id!=='checkpoint'){r.scenes[event.id]??={step:0,done:false,outcomes:[],flags:{}};r.scenes[event.id].flags??={};r.scenes[event.id].flags[effect.flag]=true;}}
 if(!success){r.fatigue=Math.min(8,r.fatigue+1);e.attention++;if(['combat','reflexes','tech','perception'].includes(o.stat)){const damage=cover?6:12;s.hp=Math.max(0,s.hp-damage);events.push('Verletzung: −'+damage+' Gesundheit');}events.push('Erschöpfung +1','Aufmerksamkeit +1');}
 if(event.id==='checkpoint'){r.lastCheckpoint=e.attention;events.push('Kontrolle abgeschlossen');}
 else{
 const p=r.scenes[event.id]??={step:0,done:false,outcomes:[]};
 p.outcomes.push({choice:o.id,success,turn:s.turn});p.step++;
 if(p.step===event.stages.length){p.done=true;r.activeScene=null;s.previousLocation=s.location;s.location=HUBS[e.index];narrative+='\n\nIhr kehrt gemeinsam zum Ausgangspunkt zurück. Die Aufzeichnungen des Einsatzes liegen im Logbuch.';t.journal.push({title:event.title,text:p.outcomes.map((v,i)=>event.stages[i].options.find(x=>x.id===v.choice)[v.success?'text':'failure']).join('\n\n'),turn:s.turn});s.npc.mara.longTerm.push({turn:s.turn,event:event.title+': Einsatz gemeinsam abgeschlossen.'});events.push(event.title+' abgeschlossen');}
 }
 t.minutes+=5;return {narrative,events};
}
export function encounterView(core){
 const p=pendingEncounter(core);return p?{title:p.event.title,stage:p.event.stages[p.step].title,text:p.event.stages[p.step].text,step:p.step+1,total:p.event.stages.length}:null;
}
