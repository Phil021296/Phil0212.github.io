import {encounterView,expedition} from '../core/encounters.js';
import {activeChapter} from '../core/longCampaign.js';
import {GameCore} from '../core/gameCore.js';
import {resolveChoice} from '../core/gameMaster.js';
import {ensureStory,opening,chapter,storyChoices,exitsFor,atmosphere,PEOPLE,presentNPCs,rememberTurn} from '../core/campaign.js';
import {cloudSave} from './cloudSave.js';
const app=document.querySelector('#app');
const data=Object.fromEntries(await Promise.all(['backgrounds','traits','world','items','crew'].map(async n=>[n,await(await fetch('./data/'+n+'.json')).json()])));
let core=new GameCore(data),busy=false,gmEnabled=false,serverAvailable=false,localOnly=false,page='story',notice='',saveStatus='Lokal gespeichert',draft='';
const KEY='voidbound-v1-save';
const labels={strength:'Stärke',reflexes:'Reflexe',intelligence:'Intelligenz',perception:'Wahrnehmung',charisma:'Charisma',willpower:'Willenskraft',tech:'Technik',combat:'Kampf'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prose=s=>String(s||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+esc(p).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replaceAll('\n','<br>')+'</p>').join('');
const button=(label,attrs='',cls='')=>'<button class="'+cls+'" '+attrs+'>'+esc(label)+'</button>';
const titleName=id=>data.world.locations[id]?.name||id;
function archiveLocal(){const old=localStorage.getItem(KEY);if(old)localStorage.setItem(KEY+'-backup-'+Date.now(),old);}
function save(){if(!core.state.player)return;try{localStorage.setItem(KEY,core.serialize());saveStatus=localOnly||!serverAvailable?'Lokal gespeichert':core.state.gameMaster?'In der Cloud gespeichert':'Lokal gesichert';}catch{saveStatus='Speicher voll — bitte Spielstand exportieren';}}
function exportSave(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([core.serialize()],{type:'application/json'}));a.download='VOIDBOUND-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function importSave(file){if(!file)return;file.text().then(raw=>{const restored=new GameCore(data);restored.load(raw);archiveLocal();core=restored;localOnly=true;localStorage.setItem('voidbound-local-branch','true');ensureStory(core);save();page='story';notice='Als lokale Kopie geladen. Dein Cloud-Spielstand bleibt erhalten.';render();}).catch(e=>{notice=e.message;render();});}
function home(){
 app.innerHTML='<main class="landing"><div class="orbit-art" aria-hidden="true"><i></i><i></i><span>H-9</span></div><div class="landing-copy"><span class="eyebrow">ECHOES OF THE FALLEN</span><h1>VOIDBOUND<span>Das letzte Licht</span></h1><p class="lead">Eine vermisste Forscherin. Eine Warnung, die es noch nicht geben dürfte. Und eine Station, auf der jemand auf euch wartet.</p><p class="landing-note">Ein erzählerisches Science-Fiction-Rollenspiel über Vertrauen und den Preis einer Entscheidung.</p><div class="landing-actions">'+(core.state.player?button('Geschichte fortsetzen','id="continue"','primary'):'')+button(core.state.player?'Eine neue Reise beginnen':'Deine Reise beginnen','id="new"','primary subtle')+'<label class="file-button">Spielstand laden<input type="file" id="import" accept=".json,application/json"></label></div><div class="mode-note">'+(gmEnabled?'Freie Eingaben mit KI-Spielleiter verfügbar':'Vollständig spielbarer Handlungsbogen · lokal und ohne Anmeldung')+'</div><p class="notice" role="status">'+esc(notice)+'</p></div></main>';
 document.querySelector('#continue')?.addEventListener('click',()=>{page='story';render();});
 document.querySelector('#new').onclick=()=>{localOnly=Boolean(core.state.player)||!serverAvailable;creator();};
 document.querySelector('#import').onchange=e=>importSave(e.target.files[0]);
}
function creator(){
 let stats={strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3};
 app.innerHTML='<main class="creator"><button id="back" class="back">← Zurück</button><span class="eyebrow">DEIN PLATZ IN DIESER GESCHICHTE</span><h1>Wer kommt an Bord?</h1><p class="lead">Du hast das Artefakt aus einem Wrack geborgen. Was dich dorthin geführt hat, entscheidest du.</p><label>Name<input id="name" maxlength="24" value="Rook" autocomplete="off"></label><label>Deine Herkunft<select id="background">'+data.backgrounds.map(b=>'<option value="'+b.id+'">'+esc(b.name)+'</option>').join('')+'</select></label><div id="origin" class="origin"></div><details><summary>Attribute und Eigenschaften anpassen <span>30 Punkte</span></summary><div class="stat-editor">'+Object.entries(stats).map(([k,v])=>'<label>'+labels[k]+'<input type="number" min="1" max="8" value="'+v+'" data-stat="'+k+'"></label>').join('')+'</div><p id="point-count">30 / 30 Punkte</p><h3>Zwei Stärken</h3>'+data.traits.positive.map((t,i)=>'<label class="check"><input type="checkbox" value="'+t.id+'" '+(i<2?'checked':'')+'><span><strong>'+esc(t.name)+'</strong><small>'+esc(t.desc)+'</small></span></label>').join('')+'<label>Eine Schwäche<select id="negative">'+data.traits.negative.map(t=>'<option value="'+t.id+'">'+esc(t.name)+'</option>').join('')+'</select></label></details><p class="notice" role="status" id="creator-error"></p><button id="start" class="primary">Die Nachricht empfangen →</button><p class="muted">Du kannst später jeden Spielstand als Datei sichern.</p></main>';
 const bg=document.querySelector('#background');const showBg=()=>{const b=data.backgrounds.find(x=>x.id===bg.value);document.querySelector('#origin').innerHTML='<p>'+esc(b.desc)+'</p><small>'+esc(b.plus)+'<br>'+esc(b.minus)+'</small>';};showBg();bg.onchange=showBg;
 document.querySelector('#back').onclick=home;
 document.querySelectorAll('[data-stat]').forEach(e=>e.oninput=()=>{stats[e.dataset.stat]=Number(e.value);document.querySelector('#point-count').textContent=Object.values(stats).reduce((a,b)=>a+b,0)+' / 30 Punkte';});
 document.querySelector('#start').onclick=()=>{try{
 const next=new GameCore(data);next.createCharacter({name:document.querySelector('#name').value,background:bg.value,stats,positiveTraits:[...document.querySelectorAll('input[type=checkbox]:checked')].map(e=>e.value),negativeTrait:document.querySelector('#negative').value});
 archiveLocal();localStorage.setItem('voidbound-local-branch',String(localOnly));core=next;ensureStory(core);core.state.version='1.2.0';core.state.lastNarrative=opening(core);notice='';save();page='story';render();
 }catch(e){document.querySelector('#creator-error').textContent=e.message;}};
}
function statusBar(){const s=core.state;return '<div class="vitals"><span><small>GESUNDHEIT</small>'+s.hp+'<i>%</i></span><span><small>CREDITS</small>'+s.credits+'</span><span><small>CREW</small>'+Object.values(s.npc).filter(n=>n.status==='crew').length+'</span></div>';}
function render(){
 if(!core.state.player){home();return;}ensureStory(core);
 const s=core.state,c=chapter(core);save();
 app.innerHTML='<div class="game-layout"><header class="topbar"><button id="home" class="wordmark" aria-label="Hauptmenü">VOIDBOUND<span>ECHOES OF THE FALLEN</span></button><span class="chapter-label">'+esc(c.number)+'</span><span class="save-indicator" id="save-status">'+esc(saveStatus)+'</span></header><div class="game-grid"><aside class="companion"><div class="orbit-art small" aria-hidden="true"><i></i><i></i><span>'+(s.location.startsWith('ruins')||s.location.startsWith('nereid')?'N-IV':'H-9')+'</span></div><span class="eyebrow">'+esc(c.number)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.goal)+'</p>'+statusBar()+'<div class="present"><small>IN DEINER NÄHE</small>'+presentNPCs(core).map(id=>'<p><span class="avatar">'+PEOPLE[id].name.split(' ').map(x=>x[0]).slice(-2).join('')+'</span>'+esc(PEOPLE[id].name)+'</p>').join('')+'</div></aside><main id="content" tabindex="-1">'+panel()+'</main></div><nav class="main-nav" aria-label="Hauptnavigation">'+[['story','Geschichte'],['journal','Logbuch'],['crew','Crew'],['ship','Schiff'],['more','Mehr']].map(([id,label])=>button(label,'data-page="'+id+'" '+(page===id?'aria-current="page"':''),page===id?'active':'')).join('')+'</nav></div>';
 document.querySelector('#home').onclick=()=>{if(!busy)home();};
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{draft=document.querySelector('#action')?.value||draft;page=b.dataset.page;render();});
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>act({choiceId:b.dataset.choice,input:b.dataset.label}));
 document.querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>act({travelId:b.dataset.travel,input:'Nach '+titleName(b.dataset.travel)+' gehen'}));
 document.querySelector('#act-form')?.addEventListener('submit',e=>{e.preventDefault();act({input:document.querySelector('#action').value.trim()});});
 document.querySelector('#export')?.addEventListener('click',exportSave);
 document.querySelector('#import')?.addEventListener('change',e=>importSave(e.target.files[0]));
 document.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>{const entry=s.story.chronicle[Number(b.dataset.read)];document.querySelector('#past-scene').innerHTML='<h2>'+esc(titleName(entry.location))+'</h2><p class="your-action">'+esc(entry.input)+'</p>'+prose(entry.narrative);document.querySelector('#past-scene').scrollIntoView({behavior:'smooth',block:'start'});});
}

function evidenceBoard(){
 const c=activeChapter(core);if(!c)return '';
 const e=core.state.story.expansion;
 return '<section class="evidence-board"><span class="eyebrow">ERMITTLUNGEN</span><h2>'+esc(c.title)+'</h2>'+c.missions.map(m=>{
 const q=e.cases[m.id],open=m.requires.every(id=>e.cases[id]?.done);if(!open)return '<p class="muted">'+esc(m.title)+' · Weitere Erkenntnisse nötig</p>';
 return '<details'+(e.selected===m.id?' open':'')+'><summary>'+esc(m.title)+' · '+(q?.done?'Abgeschlossen':!open?'Weitere Erkenntnisse nötig':m.optional?'Crewgeschichte':'Offen')+'</summary><p>'+esc(m.brief)+'</p>'+m.leads.map((l,i)=>'<p><strong>'+esc(l.title)+'</strong> · '+esc(c.sites[l.site][0])+'<br>'+(q?.read[i]?esc(l.document):q?.leads[i]?'Gesichert – am Fundort lesen':'Noch nicht gesichert')+'</p>').join('')+(q?.solved?'<p>'+esc(m.explanation)+'</p>':'')+'</details>';
 }).join('')+'</section>';
}

function encounterPanel(){const v=encounterView(core),r=expedition(core);if(!r)return '';return '<section class="encounter-panel"><p class="expedition-status">Einsatzvorräte '+r.supplies+' · Erschöpfung '+r.fatigue+'/8 · Aufmerksamkeit '+core.state.story.expansion.attention+'</p>'+(v?'<span class="eyebrow">BEGEGNUNG · '+v.step+'/'+v.total+'</span><h2>'+esc(v.title)+'</h2><h3>'+esc(v.stage)+'</h3>'+prose(v.text):'')+'</section>';}
function panel(){
 const s=core.state,t=s.story,c=chapter(core);
 if(page==='story')return '<article class="story"><div class="scene-heading"><span class="eyebrow">'+esc(data.world.locations[s.location].zone.toUpperCase())+'</span><span class="turn-label">Zug '+s.turn+'</span></div><h1>'+esc(titleName(s.location).split(' · ').at(-1))+'</h1><p class="scene-situation">'+esc(atmosphere(core))+'</p>'+(s.lastPlayerInput?'<div class="your-action"><small>DEINE HANDLUNG</small>'+esc(s.lastPlayerInput)+'</div>':'')+'<div class="narrative" aria-live="polite">'+prose(s.lastNarrative)+'</div>'+resolution()+encounterPanel()+(t.ending&&!storyChoices(core).length?'<section class="ending"><span class="eyebrow">KAPITELABSCHLUSS</span><h2>Was von uns bleibt</h2><p>'+esc(t.journal.at(-1)?.text)+'</p>'+button('Entscheidungen im Logbuch ansehen','data-page="journal"','primary')+'</section>':'<section class="choices" aria-label="Handlungsmöglichkeiten"><h2>Was tust du?</h2>'+storyChoices(core).map(x=>'<button class="choice" data-choice="'+x.id+'" data-label="'+esc(x.label)+'" '+(busy?'disabled':'')+'><span>'+esc(x.label)+'</span><small>'+esc(x.detail)+'</small><b aria-hidden="true">↗</b></button>').join('')+'<form id="act-form"><label for="action">Deine eigenen Worte</label><textarea id="action" maxlength="4000" rows="3" placeholder="'+(gmEnabled?'Beschreibe, was du tust oder sagst …':'Zum Beispiel: Ich spreche mit Kael.')+'" '+(busy?'disabled':'')+'>'+esc(draft)+'</textarea><div class="input-footer"><small>'+(gmEnabled?'Der Spielleiter berücksichtigt deine Absicht und die bisherige Geschichte.':'Ohne KI: Szenenhandlungen und einfache Ortswechsel. Freie Deutung benötigt den KI-Spielleiter.')+'</small><button class="primary" type="submit" '+(busy?'disabled':'')+'>'+(busy?'Die Szene geht weiter …':'Handeln →')+'</button></div></form></section><section class="exits"><h3>Weitergehen</h3>'+exitsFor(core).map(e=>button(e.label.split(' · ').at(-1),'data-travel="'+e.id+'" '+(busy?'disabled':''),'exit')).join('')+'</section>')+'<p class="notice" role="status">'+esc(notice)+'</p></article>';
 if(page==='journal')return '<section class="panel"><span class="eyebrow">LOGBUCH DER WAYFARER</span><h1>Was wir wissen</h1><p class="lead">'+esc(c.goal)+'</p>'+evidenceBoard()+'<div class="journal">'+(t.journal.length?t.journal.map(x=>'<article><small>ZUG '+x.turn+'</small><h2>'+esc(x.title)+'</h2><p>'+esc(x.text)+'</p></article>').join(''):'<p>Noch liegt nur Lyras Nachricht vor dir. Die ersten Spuren warten auf der Brücke.</p>')+'</div><h2>Aufträge</h2>'+Object.values(s.quests).map(q=>'<article class="card"><small>'+esc(q.status==='completed'?'Abgeschlossen':'Offen')+'</small><h3>'+esc(q.title)+'</h3>'+q.objectives.map(x=>'<p>'+esc(x)+'</p>').join('')+'</article>').join('')+'<h2>Vergangene Szenen</h2><div class="history-list">'+t.chronicle.map((x,i)=>button('Zug '+x.turn+' · '+x.input,'data-read="'+i+'"','history-row')).reverse().join('')+'</div><article id="past-scene" class="narrative"></article></section>';
 if(page==='crew')return '<section class="panel"><span class="eyebrow">MENSCHEN, KEINE RESSOURCEN</span><h1>An deiner Seite</h1>'+Object.entries(PEOPLE).filter(([id])=>id==='mara'||s.npc[id].status!=='Unbekannt').map(([id,p])=>{const n=s.npc[id];return '<article class="crew-card"><div class="crew-title"><span class="avatar">'+esc(p.name.split(' ').map(x=>x[0]).slice(-2).join(''))+'</span><div><small>'+esc(p.role)+'</small><h2>'+esc(p.name)+'</h2></div></div><p>'+esc(id==='mara'?'Sie hält die Wayfarer flugbereit. Auf Helios-9 lebt ihr Bruder.':id==='kael'?'Ein Kontakt, der einen Fehler nicht mehr rückgängig machen kann.':t.beats.lyra?'Sie ist aus der Haft befreit. Die Warnung lässt sie trotzdem nicht schlafen.':'Du kennst bislang nur ihre abgebrochene Nachricht.')+'</p><div class="relationship"><span>Vertrauen <strong>'+n.trust+'</strong></span><span>'+esc(n.anger>20?'Verletzt':n.trust<0?'Distanziert':n.trust>15?'Verbunden':'Vorsichtig')+'</span></div>'+[...n.longTerm,...n.shortTerm].slice(-4).map(m=>'<p class="memory-note">'+esc(m.event||m.outcome)+'</p>').join('')+'</article>';}).join('')+'<h2>Versprechen</h2>'+(s.promises.length?s.promises.map(p=>'<p class="card">'+esc(p.text)+'<small>'+esc(p.kept===true?'Gehalten':p.kept===false?'Gebrochen':'Noch offen')+'</small></p>').join(''):'<p class="muted">Was du zusagst, bleibt nicht folgenlos.</p>')+'</section>';
 if(page==='ship')return '<section class="panel"><span class="eyebrow">DEIN ZUHAUSE ZWISCHEN DEN STERNEN</span><h1>'+esc(s.ship.name)+'</h1><p class="lead">Mara hält sie zusammen. Nicht jede Reparatur ist schön. Jede zählt.</p><div class="ship-stats">'+[['Hülle',s.ship.hull],['Reaktor',s.ship.reactorStability],['Treibstoff',s.ship.fuel],['Schild',s.shield]].map(([n,v])=>'<div><span>'+n+'</span><strong>'+v+'%</strong><meter min="0" max="100" value="'+v+'">'+v+'</meter></div>').join('')+'</div><h2>Erreichbare Wege</h2><p class="muted">Du kannst nur von deinem aktuellen Ort weiterreisen. Fernflüge starten auf der Brücke.</p>'+exitsFor(core).map(e=>button(e.label,'data-travel="'+e.id+'" '+(busy?'disabled':''),'route')).join('')+'<h2>Module</h2>'+s.ship.modules.map(x=>'<p class="card">'+esc(x)+'</p>').join('')+'</section>';
 return '<section class="panel"><span class="eyebrow">DEINE REISE</span><h1>'+esc(s.player.name)+'</h1><p>'+esc(core.background()?.name)+'</p><details open><summary>Ausrüstung & Inventar</summary>'+s.inventory.map(id=>{const i=core.item(id);return '<article class="item"><h3>'+esc(i.name)+'</h3><p>'+esc(i.desc)+'</p></article>';}).join('')+'</details><details><summary>Attribute</summary><div class="sheet">'+Object.entries(s.player.stats).map(([k,v])=>'<div>'+labels[k]+'<strong>'+v+'</strong></div>').join('')+'</div><p>Erfahrung '+s.xp+' · Stufe '+s.level+'</p></details><details><summary>Ruf bei den Fraktionen</summary>'+Object.entries(s.reputation).map(([id,v])=>'<p>'+esc(({union:'Terranische Union',crimson:'Crimson Fleet',helix:'Helix',freeSystems:'Freie Systeme'})[id])+' <strong>'+v+'</strong></p>').join('')+'</details><h2>Offene Rechnungen</h2><p>Dock: '+(t.dockDebt||0)+' Credits · Medizin: '+(t.medicalDebt||0)+' Credits</p><h2>Spielstand</h2><p>'+esc(saveStatus)+'. Vor dem Import und einem neuen Spiel wird die lokale Version zusätzlich gesichert.</p>'+button('Spielstand als Datei sichern','id="export"','primary')+'<label class="file-button">Spielstand importieren<input type="file" id="import" accept=".json,application/json"></label><details><summary>So spielst du</summary><p>Die Szenenhandlungen sind konkrete Möglichkeiten, keine Pflichtreihenfolge. Beobachten kann Verhandlungen erleichtern. Ein gescheiterter Versuch kann dich verletzen oder Aufmerksamkeit erzeugen, ohne den Weg abzuschneiden.</p><p>Eigene Formulierungen werden mit aktivem KI-Spielleiter im Zusammenhang ausgewertet. Ohne KI kannst du den gesamten Handlungsbogen über die Szenenhandlungen spielen. Die Würfe stehen unter „Folgen & Proben“.</p></details></section>';
}
function resolution(){
 const r=core.state.lastResolution;if(!r)return '';
 return '<details class="resolution"><summary>Folgen & Proben</summary>'+r.events.map(e=>'<p>'+esc(e)+'</p>').join('')+r.rolls.map(x=>'<p class="roll">'+esc(labels[x.stat])+' · W20 '+x.roll+' + '+x.mod+' = <strong>'+x.total+'</strong> gegen '+x.difficulty+' · '+(x.success?'Erfolg':'Fehlschlag')+'</p>').join('')+'</details>';
}
function matchLocal(input){
 const n=input.toLocaleLowerCase('de').replace(/[.!?]/g,'').trim(),choices=storyChoices(core);
 const exact=choices.find(c=>c.label.toLocaleLowerCase('de')===n);if(exact)return {choiceId:exact.id};
 if(/\b(nicht|kein|keine|keinen|aber|und|schieß|schiesse|schieße|töte|beleidige|drohe)\b/.test(n))return null;
 const aliases={read_signal:/^(ich )?(lese|prüfe|verfolge|öffne).*(nachricht|signal)$/,scan_artifact:/^(ich )?(untersuche|scanne|prüfe) (das )?artefakt$/,speak_mara:/^(ich )?(spreche|rede) mit mara$/,read_room:/^(ich )?(beobachte|untersuche) (den )?raum$/,kael_truth:/^(ich )?(spreche|rede) mit kael$/,lyra_briefing:/^(ich )?(spreche|rede) mit lyra$/,repair_coupler:/^(ich )?repariere (den )?(koppler|reaktor)$/,release_lyra:/^(ich )?(zeige|nutze) (den )?freigabecode$/,decode_archive:/^(ich )?entschlüssele (die )?aufzeichnung$/,open_gate:/^(ich )?öffne (das )?tor$/};
 const match=choices.filter(c=>aliases[c.id]?.test(n));if(match.length===1)return {choiceId:match[0].id};
 if(/^(ich )?(gehe|reise|laufe|betrete|geh)\b/.test(n)){const exits=exitsFor(core).filter(e=>n.includes(e.label.split(' · ').at(-1).toLocaleLowerCase('de')));if(exits.length===1)return {travelId:exits[0].id};}
 return null;
}
async function act({input,choiceId,travelId}){
 if(busy||!input)return;
 const pending=!localOnly&&serverAvailable?JSON.parse(localStorage.getItem('voidbound-pending-turn-'+cloudSave.playerId)||'null'):null;
 if(pending&&pending.input===input){choiceId=pending.choiceId;travelId=pending.travelId;}
 
 if(!choiceId&&!travelId&&!gmEnabled){const match=matchLocal(input);if(!match){notice='Diese freie Handlung kann der lokale Modus nicht sicher deuten. Wähle eine Szenenhandlung oder aktiviere den KI-Spielleiter auf dem Server.';draft=input;render();return;}({choiceId,travelId}=match);}
 busy=true;draft=input;notice='';render();
 try{
 if(serverAvailable&&!localOnly){
  if(!core.state.gameMaster&&!localStorage.getItem('voidbound-pending-turn-'+cloudSave.playerId)&&!(await cloudSave.save(core.state)))throw new Error('Der Ausgangsspielstand konnte nicht in der Cloud gesichert werden.');
  core.load(JSON.stringify(await cloudSave.action(input,{choiceId,travelId})));
 }else{
  if(!choiceId&&!travelId)throw new Error('Für diese Handlung wird der KI-Spielleiter benötigt.');
  const next=new GameCore(data);next.load(core.serialize());const result=resolveChoice(next,{choiceId,travelId,input});rememberTurn(next,input,result.narrative,result);core=next;
 }
 draft='';save();page='story';
 }catch(e){notice=e.message;}
 finally{busy=false;render();document.querySelector('.scene-heading')?.scrollIntoView({block:'start',behavior:'smooth'});}
}
async function bootstrap(){
 try{const r=await fetch('/api/gm',{signal:AbortSignal.timeout(3000)});if(r.ok){const cfg=await r.json();gmEnabled=Boolean(cfg.enabled);serverAvailable=true;}}catch{}
 let local=null,remote=null;try{local=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
 if(serverAvailable){await cloudSave.init();remote=await cloudSave.load();}
 const localBranch=localStorage.getItem('voidbound-local-branch')==='true';
 const chosen=localBranch&&local?.player?local:remote?.gameMaster?remote:local||remote;
 if(chosen?.player){try{core.load(JSON.stringify(chosen));ensureStory(core);localOnly=localBranch||!serverAvailable;const p=JSON.parse(localStorage.getItem('voidbound-pending-turn-'+cloudSave.playerId)||'null');draft=p?.input||'';}catch(e){notice='Der vorhandene Spielstand wurde nicht verändert: '+e.message;}}
 home();
}
bootstrap();
