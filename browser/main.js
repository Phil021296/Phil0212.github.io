import {GameCore} from '../core/gameCore.js';
import {ActionInterpreter} from '../core/actionInterpreter.js';
import {cloudSave} from './cloudSave.js';

const [backgrounds,traits,world,items,crew]=await Promise.all([
  fetch('../data/backgrounds.json').then(r=>r.json()),fetch('../data/traits.json').then(r=>r.json()),fetch('../data/world.json').then(r=>r.json()),fetch('../data/items.json').then(r=>r.json()),fetch('../data/crew.json').then(r=>r.json())
]);
const core=new GameCore({backgrounds,traits,world,items,crew});const interpreter=new ActionInterpreter();const app=document.querySelector('#app');
let gmEnabled=false,busy=false;
const STAT_LABEL={strength:'Stärke',reflexes:'Reflexe',intelligence:'Intelligenz',perception:'Wahrnehmung',charisma:'Charisma',willpower:'Willenskraft',tech:'Technik',combat:'Kampf'};
const DEFAULT_STATS={strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3};
const statLabel=k=>STAT_LABEL[k]||k;
const html=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const story=s=>html(s).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').split('\n').filter(Boolean).map(p=>`<p>${p}</p>`).join('');

function creator(){
 let selectedBg=backgrounds[0].id, positives=new Set([traits.positive[0].id,traits.positive[1].id]),negative=traits.negative[0].id,stats={...DEFAULT_STATS};
 app.innerHTML=`<div class="creator-shell"><section class="creator-card">
 <div class="eyebrow">VOIDBOUND // ECHOES OF THE FALLEN // VERSION 1.1 · AI GAME MASTER</div><h1>Wer wirst du im Void?</h1>
 <p class="lead">Deine Werte sind begrenzt. Du besitzt insgesamt <b>30 Attributpunkte</b>. Herkunft und Eigenschaften geben situative Vor- und Nachteile, verändern diese 30 Punkte aber nicht.</p>
 <label class="name-label">Name<input id="name" value="Rook" maxlength="24"></label>
 <div class="grid2"><div><h3>Herkunft</h3><div id="bgs" class="cards"></div></div><div><h3>Eigenschaften</h3><div id="traits"></div></div></div>
 <div class="allocation-head"><div><h3>Attribute</h3><span>Jeder Wert 1–8 · zusammen exakt 30</span></div><div id="points" class="points"></div></div>
 <div class="stats-editor" id="stats"></div>
 <div class="creator-actions"><button class="secondary" id="loadCloud">CLOUD-SPIELSTAND LADEN</button><button class="secondary" id="loadLocal">LOKALEN SPIELSTAND LADEN</button><label class="secondary file-btn">SAVE-DATEI LADEN<input id="loadFile" type="file" accept="application/json"></label><button class="primary" id="start">KAMPAGNE STARTEN</button></div>
 </section></div>`;
 const bgBox=document.querySelector('#bgs');
 backgrounds.forEach((b,i)=>{const el=document.createElement('button');el.className='select-card'+(i===0?' active':'');el.innerHTML=`<b>${b.name}</b><span>${b.desc}</span><em>${b.plus}</em><i>– ${b.minus}</i>`;el.onclick=()=>{selectedBg=b.id;[...bgBox.children].forEach(x=>x.classList.remove('active'));el.classList.add('active')};bgBox.append(el)});
 const tbox=document.querySelector('#traits');tbox.innerHTML=`<div class="trait-title">2 Stärken</div>${traits.positive.map(t=>`<label class="check"><input type="checkbox" value="${t.id}" ${positives.has(t.id)?'checked':''}><b>${t.name}</b><span>${t.desc}</span></label>`).join('')}<div class="trait-title danger">1 Schwäche</div>${traits.negative.map((t,i)=>`<label class="check"><input type="radio" name="neg" value="${t.id}" ${i===0?'checked':''}><b>${t.name}</b><span>${t.desc}</span></label>`).join('')}`;
 tbox.onchange=e=>{if(e.target.type==='checkbox'){const checked=[...tbox.querySelectorAll('input[type=checkbox]:checked')];if(checked.length>2){e.target.checked=false;return}positives=new Set(checked.map(x=>x.value))}else negative=e.target.value};
 const sbox=document.querySelector('#stats');
 for(const k of Object.keys(stats)){sbox.insertAdjacentHTML('beforeend',`<div class="stat-control"><span>${statLabel(k)}</span><div><button data-dec="${k}">−</button><output data-out="${k}">${stats[k]}</output><button data-inc="${k}">+</button></div></div>`)}
 function used(){return Object.values(stats).reduce((a,b)=>a+b,0)}
 function renderPoints(){const u=used(),left=30-u;const p=document.querySelector('#points');p.innerHTML=`<b>${left}</b><span>Punkte übrig</span>`;p.className='points '+(left===0?'ok':left<0?'bad':'');document.querySelector('#start').disabled=left!==0}
 sbox.onclick=e=>{const inc=e.target.dataset.inc,dec=e.target.dataset.dec;if(inc){if(stats[inc]<8&&used()<30)stats[inc]++;}if(dec){if(stats[dec]>1)stats[dec]--;}const k=inc||dec;if(k)document.querySelector(`[data-out="${k}"]`).value=stats[k];renderPoints()};renderPoints();
 document.querySelector('#start').onclick=async()=>{if(positives.size!==2)return alert('Bitte genau 2 positive Eigenschaften wählen.');try{core.createCharacter({name:document.querySelector('#name').value,background:selectedBg,positiveTraits:[...positives],negativeTrait:negative,stats});core.state.lastNarrative=introText();saveLocal();game(core.state.lastNarrative);await persistCloud();}catch(e){alert(e.message)}};
 document.querySelector('#loadCloud').onclick=async()=>{const state=await cloudSave.load();if(!state)return alert('Für diesen Spieler wurde noch kein Cloud-Spielstand gefunden oder die Cloud ist nicht erreichbar.');try{core.load(JSON.stringify(state));saveLocal();game(core.state.lastNarrative||'Der Cloud-Spielstand wurde aus der Datenbank geladen. Deine Entscheidungen, Beziehungen und Erinnerungen sind wieder da.')}catch(e){alert(e.message)}};
 document.querySelector('#loadLocal').onclick=()=>{const s=localStorage.getItem('voidbound-v1-save');if(!s)return alert('Kein lokaler Spielstand gefunden.');try{core.load(s);game(core.state.lastNarrative||'Der lokale Spielstand wurde geladen. Die Systeme der Wayfarer setzen dort wieder ein, wo du sie verlassen hast.')}catch(e){alert(e.message)}};
 document.querySelector('#loadFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{core.load(await f.text());saveLocal();game('Spielstand geladen. Deine Entscheidungen, Beziehungen und Erinnerungen wurden wiederhergestellt.')}catch(err){alert(err.message)}};
}

function introText(){const p=core.state.player,bg=core.background();return `Seit drei Tagen gehört das Artefakt dir – falls man etwas besitzen kann, das auf keinem Scanner dieselbe Masse besitzt. Du hast es aus einem Wrack am Rand des Tantalus-Feldes geborgen, und seitdem schläfst du schlechter.\n\nJetzt liegt es auf der Hauptkonsole der VSS Wayfarer. Draußen schiebt sich Helios-9 langsam über die Frontscheibe. Eine ungelesene Nachricht blinkt im Kommunikationspuffer. Absender: Kael Voss.\n\nDeine Vergangenheit als **${bg.name}** hat dich gelehrt, dass Zufälle selten so sauber aussehen. Das Artefakt bleibt schwarz und reglos. Trotzdem hast du das Gefühl, dass es auf etwas wartet – vielleicht auf dich.`}

function sceneArt(type){
 const common='<div class="dust"></div><div class="vignette"></div>';
 if(type==='ship')return `<div class="scene-art ship-art"><div class="window"><div class="planet"></div><div class="stars"></div></div><div class="console left"></div><div class="console right"></div><div class="deck-lines"></div>${common}</div>`;
 if(type==='ship_engine')return `<div class="scene-art engine-art"><div class="reactor"></div><div class="pipe p1"></div><div class="pipe p2"></div><div class="sparks"></div>${common}</div>`;
 if(['ship_quarters','ship_med','ship_cargo','ship_airlock'].includes(type))return `<div class="scene-art interior-art ${type}"><div class="wallpanel"></div><div class="room-object"></div><div class="door"></div>${common}</div>`;
 if(['station','station_market','security','bar'].includes(type))return `<div class="scene-art station-art ${type}"><div class="neon">${type==='bar'?'LAST LIGHT':'HELIOS-9'}</div><div class="gantry g1"></div><div class="gantry g2"></div><div class="crowd"></div>${common}</div>`;
 if(type==='planet')return `<div class="scene-art planet-art"><div class="horizon"></div><div class="distant-ruin"></div><div class="moon"></div>${common}</div>`;
 return `<div class="scene-art ruins-art ${type}"><div class="moon"></div><div class="monolith m1"></div><div class="monolith m2"></div><div class="glyphs">◈ ⟡ ◇ ⌁</div>${common}</div>`;
}

function game(lastText){
 const loc=core.location(),p=core.state.player;const bg=core.background();saveLocal();
 app.innerHTML=`<main class="game-shell scene-${loc.type}">${sceneArt(loc.type)}
 <header><div><span class="logo">VOIDBOUND</span><small>ECHOES OF THE FALLEN · v1.1</small></div><div class="topstats"><span>◉ ${core.state.credits} cr</span><span>HP ${core.state.hp}%</span><span>SH ${core.state.shield}%</span><span>LV ${core.state.level}</span></div></header>
 <aside class="left-panel glass"><div class="portrait">${html(p.name[0]?.toUpperCase()||'?')}</div><h2>${html(p.name)}</h2><span class="muted">${html(bg?.name)}</span><div class="meters"><label>Gesundheit <b>${core.state.hp}%</b><div><i style="width:${core.state.hp}%"></i></div></label><label>Schild <b>${core.state.shield}%</b><div><i style="width:${core.state.shield}%"></i></div></label></div><div class="navbuttons"><button data-panel="char">CHARAKTER</button><button data-panel="inventory">INVENTAR</button><button data-panel="quests">MISSIONEN</button><button data-panel="crew">CREW</button><button data-panel="ship">SCHIFF</button><button data-panel="map">STERNENKARTE</button><button data-panel="rep">REPUTATION</button><button data-panel="memory">ERINNERUNGEN</button><button data-panel="help">SPIELHILFE</button><button id="save">SAVE-DATEI</button></div></aside>
 <section class="narrative glass"><div class="location-tag">${loc.zone.toUpperCase()} // ${loc.type.toUpperCase()}</div><h1>${html(loc.name)}</h1><p class="locdesc">${html(loc.desc)}</p><div id="result" class="result">${story(lastText||'Was möchtest du tun?')}${resolutionHtml()}</div><div class="prompt"><p class="muted">${gmEnabled?"KI-Spielleiter · Online":"Klassischer Offline-Modus · regelbasierte Antworten"}</p><label>DEINE HANDLUNG – FREIE TEXTEINGABE</label><textarea id="action" placeholder="z. B. Ich beobachte die Söldner erst, tue dann so als wäre ich Wartungstechniker und versuche unbemerkt hinter Kael zu gelangen."></textarea><div class="prompt-bottom"><span>Das Spiel wertet Absicht, Ziel, Methode und Ton deiner Eingabe aus.</span><button id="act" class="primary">AKTION AUSFÜHREN</button></div></div></section>
 <aside class="right-panel glass"><h3>SITUATION</h3><div class="chips">${(loc.affordances||[]).map(x=>`<span>${html(x)}</span>`).join('')}</div><h3>AKT I · DAS SIGNAL</h3>${questSummary()}<h3>LETZTE EREIGNISSE</h3><div class="mini-log">${core.state.log.slice(0,6).map(x=>`<span>${html(x.text)}</span>`).join('')}</div></aside>
 <footer>World State aktiv · ${core.state.memories.length} Erinnerungen · ${core.state.history.length} gespeicherte Handlungen · Sofort-Autosave · Spieler-ID ${html(cloudSave.playerId?.slice(0,8)||'offline')} · <span id="save-status">${cloudSave.online?'Cloud verbunden':'lokaler Fallback'}</span></footer></main><div id="modal"></div>`;
 document.querySelector('#act').onclick=act;document.querySelector('#action').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();act()}};document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));document.querySelector('#save').onclick=downloadSave;
}
function questSummary(){const q=core.state.quests.main_echo;return `<p><b>${html(q.title)}</b></p>${q.objectives.map(x=>`<p class="objective">◆ ${html(x)}</p>`).join('')}`}
async function act(forcedInput){
 if(busy)return;
 const ta=document.querySelector('#action');const text=typeof forcedInput==='string'?forcedInput:ta.value.trim();if(!text)return;
 busy=true;
 const button=document.querySelector('#act');button.disabled=true;button.textContent='WELT REAGIERT …';
 try{
  if(gmEnabled){
   if(!core.state.gameMaster&&!localStorage.getItem(`voidbound-pending-turn-${cloudSave.playerId}`)&&!(await persistCloud()))throw new Error('Der Ausgangsspielstand konnte nicht gespeichert werden. Bitte erneut versuchen.');
   const state=await cloudSave.action(text);core.load(JSON.stringify(state));saveLocal();game(core.state.lastNarrative);
  }else{
   if(core.state.gameMaster)throw new Error('Dieser KI-Spielstand benötigt den KI-Server. Der Spielstand bleibt erhalten.');
   const r=interpreter.interpret(text,core);core.state.lastPlayerInput=text;core.state.lastNarrative=r.text;
   saveLocal();game(r.text);await persistCloud();
  }
 }catch(error){alert(error.message);}
 finally{busy=false;const b=document.querySelector('#act');if(b){b.disabled=false;b.textContent='AKTION AUSFÜHREN';}}
}
function saveLocal(){if(core.state.player)localStorage.setItem('voidbound-v1-save',core.serialize())}
async function persistCloud(){if(!core.state.player)return false;if(core.state.gameMaster){saveLocal();return true;}saveLocal();const ok=await cloudSave.save(core.state);if(ok)core.state.lastSavedTurn=core.state.turn;return ok;}
function downloadSave(){const blob=new Blob([core.serialize()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`voidbound-v1-${core.state.player.name}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function showPanel(type){const m=document.querySelector('#modal'),p=core.state.player;let title='',body='';
 if(type==='char'){title='Charakter';body=`<div class="char-head"><div class="portrait big">${html(p.name[0])}</div><div><h2>${html(p.name)}</h2><p>${html(core.background().name)}</p></div></div><div class="sheet">${Object.entries(p.stats).map(([k,v])=>`<div><span>${statLabel(k)}</span><b>${v}</b></div>`).join('')}</div><h3>Eigenschaften</h3><div class="item"><b>+</b>${p.positiveTraits.map(id=>core.trait(id)?.name).join(' · ')}</div><div class="item"><b>–</b>${core.trait(p.negativeTrait)?.name}</div><p class="muted">Attributsumme: ${Object.values(p.stats).reduce((a,b)=>a+b,0)} / 30</p>`}
 if(type==='inventory'){title='Inventar';body=core.state.inventory.map(id=>{const i=core.item(id);return `<div class="item"><b>${html(i.name)}</b><span>${html(i.desc)}</span><small>${html(i.type)}</small></div>`}).join('')}
 if(type==='quests'){title='Missionen';body=Object.values(core.state.quests).map(q=>`<div class="quest"><b>${html(q.title)}</b><em>${html(q.status)}</em>${q.objectives.map(o=>`<p>◆ ${html(o)}</p>`).join('')}</div>`).join('')}
 if(type==='crew'){title='Crew & Kontakte';body=crew.map(c=>{const s=core.state.npc[c.id]||{};return `<div class="crew-card"><b>${html(c.name)}</b><small>${html(c.role)}</small><p>${html(c.desc)}</p><div>Vertrauen <strong>${s.trust??c.trust}</strong> · ${html(s.status||c.status)}</div><p>Respekt ${s.respect??0} · Ärger ${s.anger??0} · Angst ${s.fear??0}</p><p>${html(s.mood||"abwartend")}</p>${(s.shortTerm||[]).slice(-3).map(x=>`<p class="muted">${html(x.input)} — ${html(x.outcome)}</p>`).join("")}</div>`}).join('')}
 if(type==='ship'){title=core.state.ship.name;const s=core.state.ship;body=`<div class="ship-grid">${[['Hülle',s.hull],['Schild',core.state.shield],['Treibstoff',s.fuel],['Reaktor',s.reactorStability]].map(([n,v])=>`<div><span>${n}</span><b>${v}%</b><i><u style="width:${v}%"></u></i></div>`).join('')}</div><h3>Module</h3>${s.modules.map(x=>`<div class="item">${html(x)}</div>`).join('')}<p>Frachtraum: ${s.cargo}/${s.cargoMax}</p>`}
 if(type==='map'){title='Sternenkarte';body=`<div class="map"><button data-go="ship_bridge">VSS WAYFARER</button><button data-go="helios_docks">HELIOS-9</button><button data-go="nereid_surface" ${core.state.flags.nereidUnlocked?'':'disabled'}>NEREID IV ${core.state.flags.nereidUnlocked?'':'· GESPERRT'}</button></div><p class="muted">Direkte Fernreisen sind nur möglich, wenn das Ziel storyseitig bekannt ist. Innerhalb eines Ortes bewegst du dich über deine freie Texteingabe.</p>`}
 if(type==='rep'){title='Reputation';const names={union:'Terranische Union',crimson:'Crimson Fleet',helix:'Helix Corporation',freeSystems:'Freie Systeme'};body=Object.entries(core.state.reputation).map(([k,v])=>`<div class="rep-row"><span>${names[k]||k}</span><b>${v>0?'+':''}${v}</b></div>`).join('')}
 if(type==='memory'){title='Erinnerungen & Konsequenzen';body=core.state.memories.length?[...core.state.memories].sort((a,b)=>b.importance-a.importance).map(x=>`<div class="memory"><b>${x.importance}</b><span>${html(x.text)}</span><small>${html(x.type)} · Runde ${x.turn}</small></div>`).join(''):'<p>Noch keine prägenden Erinnerungen.</p>'}
 if(type==='help'){title='So spielst du';body=`<p>Du musst keine Antwortoption anklicken. Schreibe natürlich, was dein Charakter tun oder sagen soll. Je konkreter deine Eingabe, desto genauer kann das Regelsystem Methode und Ziel bestimmen.</p><div class="item"><b>Beispiel:</b><span>„Ich beobachte erst, ob die Wachen nervös wirken. Dann behaupte ich ruhig, ich sei von der Wartung und müsse hinter ihnen an das Terminal.“</span></div><p>Die Engine nutzt deine Attribute, Herkunft, Eigenschaften, Ausrüstung, den Ort und vorherige Entscheidungen. Ein Fehlschlag beendet eine Idee nicht automatisch – du kannst sie verändern oder kombinieren.</p>`}
 m.innerHTML=`<div class="modal-bg"><div class="modal-card glass"><button id="close">×</button><div class="eyebrow">VOIDBOUND DATABASE</div><h1>${title}</h1>${body}</div></div>`;document.querySelector('#close').onclick=()=>m.innerHTML='';m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(busy)return;const id=b.dataset.go;if(gmEnabled||core.state.gameMaster){m.innerHTML="";act(`Ich reise nach ${core.data.world.locations[id].name}.`);return;}if(id==='nereid_surface'&&!core.state.flags.nereidUnlocked)return;core.forceTravel(id);core.state.lastNarrative=`Die Navigation bestätigt den Kurs. ${core.location().desc}`;m.innerHTML='';game(core.state.lastNarrative);persistCloud()})
}
async function bootstrap(){
  try{gmEnabled=Boolean((await (await fetch('/api/gm')).json()).enabled);}catch{}
  await cloudSave.init();
  let cloudState=null,localState=null;
  try{cloudState=await cloudSave.load();}catch{}
  try{const raw=localStorage.getItem('voidbound-v1-save');if(raw)localState=JSON.parse(raw);}catch{}
  const cloudTurn=Number(cloudState?.turn??-1),localTurn=Number(localState?.turn??-1);
  const chosen=cloudState?.gameMaster?cloudState:localTurn>cloudTurn?localState:cloudState||localState;
  if(chosen?.player){
    try{
      core.load(JSON.stringify(chosen));
      saveLocal();
      if(localTurn>cloudTurn&&!core.state.gameMaster)await persistCloud();
      game(core.state.lastNarrative||`Du kehrst in Runde ${core.state.turn} zu ${core.location().name} zurück. Dein letzter Spielstand wurde automatisch wiederhergestellt.`);
      const pending=JSON.parse(localStorage.getItem(`voidbound-pending-turn-${cloudSave.playerId}`)||'null');if(pending)document.querySelector('#action').value=pending.input;
      return;
    }catch(error){console.warn('Autosave konnte nicht geladen werden:',error);}
  }
  creator();
}
bootstrap();

function resolutionHtml(){const r=core.state.lastResolution;if(!r)return "";return `<details><summary>Regelergebnis</summary>${story(r.events.join("\n"))}${story(r.rolls.map(x=>`W20: ${x.roll} + ${x.mod} = ${x.total} gegen ${x.difficulty} (${statLabel(x.stat)}) – ${x.success?"Erfolg":"Fehlschlag"}`).join("\n"))}</details>`;}
