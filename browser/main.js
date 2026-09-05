import {GameCore} from '../core/gameCore.js';
import {ActionInterpreter} from '../core/actionInterpreter.js';

const [backgrounds,traits,world]=await Promise.all([
  fetch('../data/backgrounds.json').then(r=>r.json()),
  fetch('../data/traits.json').then(r=>r.json()),
  fetch('../data/world.json').then(r=>r.json())
]);
const core=new GameCore({backgrounds,traits,world});
const interpreter=new ActionInterpreter();
const app=document.querySelector('#app');

function statLabel(k){return ({strength:'Stärke',reflexes:'Reflexe',intelligence:'Intelligenz',perception:'Wahrnehmung',charisma:'Charisma',willpower:'Willenskraft',tech:'Technik',combat:'Kampf'})[k]||k}

function creator(){
  app.innerHTML=`<div class="creator-shell"><section class="creator-card">
    <div class="eyebrow">VOIDBOUND // ECHOES OF THE FALLEN</div><h1>Wer bist du im Void?</h1>
    <p>Erstelle deinen Charakter. Herkunft und Eigenschaften beeinflussen echte Proben, Reaktionen und spätere Konsequenzen.</p>
    <label>Name<input id="name" value="Rook" maxlength="24"></label>
    <div class="grid2"><div><h3>Herkunft</h3><div id="bgs" class="cards"></div></div><div><h3>Eigenschaften</h3><div id="traits"></div></div></div>
    <h3>Attribute <small>Verteile Werte von 3–8</small></h3><div class="stats-editor" id="stats"></div>
    <button class="primary" id="start">KAMPAGNE STARTEN</button>
  </section></div>`;
  let selectedBg=backgrounds[0].id; let positives=new Set([traits.positive[0].id,traits.positive[1].id]); let negative=traits.negative[0].id;
  const bgBox=document.querySelector('#bgs');
  backgrounds.forEach((b,i)=>{const el=document.createElement('button');el.className='select-card'+(i===0?' active':'');el.innerHTML=`<b>${b.name}</b><span>${b.desc}</span><em>+ ${b.plus}</em><i>– ${b.minus}</i>`;el.onclick=()=>{selectedBg=b.id;[...bgBox.children].forEach(x=>x.classList.remove('active'));el.classList.add('active')};bgBox.append(el)});
  const tbox=document.querySelector('#traits');
  tbox.innerHTML=`<div class="trait-title">2 Stärken</div>${traits.positive.map(t=>`<label class="check"><input type="checkbox" value="${t.id}" ${positives.has(t.id)?'checked':''}> <b>${t.name}</b><span>${t.desc}</span></label>`).join('')}<div class="trait-title danger">1 Schwäche</div>${traits.negative.map((t,i)=>`<label class="check"><input type="radio" name="neg" value="${t.id}" ${i===0?'checked':''}> <b>${t.name}</b><span>${t.desc}</span></label>`).join('')}`;
  tbox.addEventListener('change',e=>{ if(e.target.type==='checkbox'){ const checked=[...tbox.querySelectorAll('input[type=checkbox]:checked')]; if(checked.length>2){e.target.checked=false;return;} positives=new Set(checked.map(x=>x.value)); } else negative=e.target.value; });
  const stats={strength:5,reflexes:5,intelligence:5,perception:5,charisma:5,willpower:5,tech:5,combat:5};
  const sbox=document.querySelector('#stats');
  for(const k of Object.keys(stats)){sbox.insertAdjacentHTML('beforeend',`<label>${statLabel(k)}<input type="range" min="3" max="8" value="5" data-stat="${k}"><output>5</output></label>`)}
  sbox.oninput=e=>{if(e.target.matches('input')){stats[e.target.dataset.stat]=+e.target.value;e.target.nextElementSibling.value=e.target.value}};
  document.querySelector('#start').onclick=()=>{ if(positives.size!==2){alert('Bitte genau 2 positive Eigenschaften wählen.');return;} core.createCharacter({name:document.querySelector('#name').value,background:selectedBg,positiveTraits:[...positives],negativeTrait:negative,stats}); game(); };
}

function sceneArt(type){
  if(type==='ship') return `<div class="scene-art ship-art"><div class="window"><div class="planet"></div><div class="stars"></div></div><div class="console left"></div><div class="console right"></div><div class="deck-lines"></div></div>`;
  if(type==='station') return `<div class="scene-art station-art"><div class="neon">HELIOS-9</div><div class="gantry g1"></div><div class="gantry g2"></div><div class="crowd"></div></div>`;
  return `<div class="scene-art ruins-art"><div class="moon"></div><div class="monolith m1"></div><div class="monolith m2"></div><div class="glyphs">◈ ⟡ ◇ ⌁</div></div>`;
}

function game(lastText='Du erwachst auf der Brücke der Wayfarer. Das unbekannte Artefakt liegt vor dir auf der Konsole.'){
  const loc=world.locations[core.state.location], p=core.state.player;
  app.innerHTML=`<main class="game-shell scene-${loc.type}">
    ${sceneArt(loc.type)}
    <header><div><span class="logo">VOIDBOUND</span><small>ECHOES OF THE FALLEN</small></div><div class="topstats"><span>◉ ${core.state.credits} cr</span><span>HP ${core.state.hp}%</span><span>SH ${core.state.shield}%</span></div></header>
    <aside class="left-panel glass"><div class="portrait">${p.name.slice(0,1).toUpperCase()}</div><h2>${p.name}</h2><span class="muted">${backgrounds.find(b=>b.id===p.background)?.name}</span><div class="meters"><label>Gesundheit<div><i style="width:${core.state.hp}%"></i></div></label><label>Schild<div><i style="width:${core.state.shield}%"></i></div></label></div><div class="navbuttons"><button data-panel="char">CHARAKTER</button><button data-panel="inventory">INVENTAR</button><button data-panel="memory">ERINNERUNGEN</button><button id="save">SAVEGAME</button></div></aside>
    <section class="narrative glass"><div class="location-tag">${loc.type.toUpperCase()}</div><h1>${loc.name}</h1><p class="locdesc">${loc.desc}</p><div id="result" class="result"><p>${lastText}</p></div><div class="prompt"><label>WAS MÖCHTEST DU TUN ODER SAGEN?</label><textarea id="action" placeholder="Schreibe frei, z. B. Ich scanne das Artefakt ..."></textarea><button id="act" class="primary">AKTION AUSFÜHREN</button></div></section>
    <aside class="right-panel glass"><h3>SITUATION</h3><div class="context">${contextFor(core.state.location)}</div><h3>AKT I · DAS SIGNAL</h3><p>${core.state.flags.knowsEcho?'Du hast Hinweise auf „ECHO“ gefunden. Finde heraus, was dahinter steckt.':'Untersuche das Artefakt und finde heraus, warum Helios-9 dich kontaktiert hat.'}</p><h3>LETZTE EREIGNISSE</h3><div class="mini-log">${core.state.log.slice(0,5).map(x=>`<span>${x.text}</span>`).join('')}</div></aside>
    <footer>Freie Texteingabe · regelbasierte Konsequenzen · World-State aktiv</footer>
  </main><div id="modal"></div>`;
  document.querySelector('#act').onclick=act; document.querySelector('#action').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();act()}});
  document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));
  document.querySelector('#save').onclick=downloadSave;
}
function contextFor(loc){
  const m={ship_bridge:'Artefakt auf Konsole<br>Helios-9 voraus<br>Dockfreigabe verfügbar',ship_corridor:'Maschinenraum nahe<br>Instabile Energieversorgung<br>Brücke achtern',helios_docks:'Wayfarer angedockt<br>Bar „Last Light“ geöffnet<br>Informant: Kael Voss',helios_bar:'3 bewaffnete Söldner<br>Kael Voss am hinteren Tisch<br>Wartungszugang vorhanden',ruins_gate:'Architektentor aktiv<br>Atmosphäre dünn<br>Artefakt reagiert'};return m[loc]||'';
}
function act(){const ta=document.querySelector('#action');const text=ta.value.trim();const r=interpreter.interpret(text,core);core.pushLog(text||'gezögert');game(r.text)}
function showPanel(type){
 const m=document.querySelector('#modal'); const p=core.state.player;
 let body='';
 if(type==='char') body=`<h2>${p.name}</h2><div class="sheet">${Object.entries(p.stats).map(([k,v])=>`<div><span>${statLabel(k)}</span><b>${v}</b></div>`).join('')}</div>`;
 if(type==='inventory') body=`<h2>Inventar</h2>${core.state.inventory.map(i=>`<div class="item">${i}</div>`).join('')}`;
 if(type==='memory') body=`<h2>Erinnerungen</h2>${core.state.memories.length?core.state.memories.sort((a,b)=>b.importance-a.importance).map(x=>`<div class="item"><b>${x.importance}</b> ${x.text}</div>`).join(''):'<p>Noch keine prägenden Erinnerungen.</p>'}`;
 m.innerHTML=`<div class="modal-bg"><div class="modal-card glass"><button id="close">×</button>${body}</div></div>`; document.querySelector('#close').onclick=()=>m.innerHTML='';
}
function downloadSave(){const blob=new Blob([core.serialize()],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='voidbound-save.json';a.click();URL.revokeObjectURL(a.href)}
creator();
