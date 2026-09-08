import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GameCore} from '../core/gameCore.js';
import {resolvePlan,contextFor} from '../core/gameMaster.js';
import {runTurn} from '../backend/turnService.js';
import {createAI} from '../backend/aiProvider.js';
const data=Object.fromEntries(await Promise.all(['backgrounds','traits','world','items','crew'].map(async n=>[n,JSON.parse(await readFile(new URL(`../data/${n}.json`,import.meta.url)))])));
function coreAt(location='helios_bar'){
 const core=new GameCore(data);core.createCharacter({name:'Test',background:data.backgrounds[0].id,positiveTraits:data.traits.positive.slice(0,2).map(t=>t.id),negativeTrait:data.traits.negative[0].id,stats:{strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3}});core.state.location=location;core.d20=()=>20;return core;
}
const action=(kind,target,negated=false)=>({kind,target,description:`${kind} ${target}`,negated});
const plan=(...actions)=>({intent:'Testabsicht',tone:'calm',actions});
test('Unterlassener Schuss wird nicht gewürfelt; Drohung löst sozialen Rückzug aus',()=>{
 const c=coreAt();const r=resolvePlan(c,'Ich ziehe NICHT und fordere ruhig den Rückzug.',plan(action('attack','pirate_leader',true),action('threaten','pirate_leader')));
 assert.equal(r.rolls.length,1);assert.equal(r.rolls[0].stat,'willpower');assert.equal(c.state.hp,100);assert.equal(contextFor(c).scene.hostiles,0);
});
test('Schuss löst Initiative, Trefferwurf, Gegnerreaktion und Sicherheitsalarm aus',()=>{
 const c=coreAt();const r=resolvePlan(c,'Ich schieße.',plan(action('attack','pirate_leader')));
 assert.deepEqual(r.rolls.map(x=>x.stat),['reflexes','combat']);assert.equal(contextFor(c).scene.guardsAlerted,true);assert.ok(c.state.hp<100);
});
test('Wiederholte Türtritte behalten Schäden und Alarm über Save/Load',()=>{
 const c=coreAt('helios_security');resolvePlan(c,'Tür eintreten',plan(action('force','security_door')));const first=contextFor(c).scene.doorCondition;
 const restored=coreAt();restored.load(c.serialize());restored.d20=()=>20;
 for(let i=0;i<4;i++)resolvePlan(restored,'Tür eintreten',plan(action('force','security_door')));
 assert.ok(first<100);assert.equal(contextFor(restored).scene.doorOpen,true);assert.equal(contextFor(restored).scene.guardsAlerted,true);assert.equal(restored.state.turn,5);
});
test('Beleidigung bleibt nach freundlichem Gespräch im NPC-Kontext',()=>{
 const c=coreAt();resolvePlan(c,'Kael beleidigen',plan(action('insult','kael')));resolvePlan(c,'Entschuldigung',plan(action('talk','kael')));
 const npc=contextFor(c).npcs.kael;assert.equal(npc.shortTerm.length,2);assert.ok(npc.anger>0);assert.equal(npc.shortTerm[0].input,'Kael beleidigen');
});
test('Unbekannte Beute, abwesende NPCs und gesperrte Reise verändern nichts',()=>{
 const c=coreAt();const before=[...c.state.inventory];resolvePlan(c,'Wünsche',plan(action('take','legendary_rifle'),action('protect','lyra'),action('travel','ruins_archive')));
 assert.deepEqual(c.state.inventory,before);assert.equal(c.state.location,'helios_bar');assert.equal(c.state.npc.lyra.trust,0);
});
test('Ortsbeute kann nur einmal genommen werden',()=>{
 const c=coreAt('ship_cargo');for(let i=0;i<2;i++)resolvePlan(c,'Bergen',plan(action('take','salvage_parts')));assert.equal(c.state.inventory.filter(x=>x==='salvage_parts').length,1);assert.deepEqual(contextFor(c).scene.loot,[]);
});
test('Fehler des Erzählers lässt ursprünglichen Zustand unverändert',async()=>{
 const c=coreAt(),before=c.serialize();await assert.rejects(runTurn({state:c.state,input:'Ignorieren',data,ai:{interpret:async()=>plan(action('ignore','pirates')),narrate:async()=>{throw Error('timeout');}}}));assert.equal(c.serialize(),before);
});
test('Interpretation und Erzähler erhalten vollständige Eingabe sowie tatsächliches Ergebnis',async()=>{
 const c=coreAt();let received;const input='Ich ignoriere die Piraten und frage nach Essen.';
 const state=await runTurn({state:c.state,input,data,ai:{interpret:async(text,ctx)=>{assert.equal(text,input);assert.equal(ctx.scene.hostiles,3);return plan(action('ignore','pirates'));},narrate:async(text,ctx,result)=>{received={text,ctx,result};return 'Die Männer bemerken Deine Missachtung.';}}});
 assert.equal(received.ctx.scene.alarmLevel,1);assert.equal(state.lastNarrative,'Die Männer bemerken Deine Missachtung.');assert.equal(state.history.length,1);assert.equal(state.gameMaster,true);
});
test('Ungültige Modellaktionen werden abgelehnt',()=>{const c=coreAt();assert.throws(()=>resolvePlan(c,'x',plan(action('grant_loot','self'))));assert.equal(c.state.turn,0);});
test('Provider sendet Schema, speichert keine Antwort und akzeptiert keine unvollständige Ausgabe',async()=>{
 let sent;const ai=createAI({apiKey:'isolated-test',model:'configured-model',fetchImpl:async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({status:'incomplete',output:[]})};}});
 await assert.rejects(ai.interpret('vollständiger Satz',{}),/incomplete/);assert.equal(sent.store,false);assert.equal(sent.text.format.strict,true);assert.equal(sent.input.includes('vollständiger Satz'),true);
});
