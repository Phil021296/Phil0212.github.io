import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GameCore} from '../core/gameCore.js';
import {resolveChoice,contextFor} from '../core/gameMaster.js';
import {ensureStory,storyChoices,rememberTurn} from '../core/campaign.js';
const data=Object.fromEntries(await Promise.all(['backgrounds','traits','world','items','crew'].map(async n=>[n,JSON.parse(await readFile(new URL('../data/'+n+'.json',import.meta.url)))])));
function fresh(roll=20){const c=new GameCore(data);c.createCharacter({name:'QA',background:data.backgrounds[0].id,positiveTraits:data.traits.positive.slice(0,2).map(x=>x.id),negativeTrait:data.traits.negative[0].id,stats:{strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3}});c.d20=()=>roll;ensureStory(c);return c;}
const choose=(c,id)=>{const r=resolveChoice(c,{choiceId:id,input:id});rememberTurn(c,id,r.narrative,r);return r;};
const go=(c,id)=>{const r=resolveChoice(c,{travelId:id,input:'Reise '+id});rememberTurn(c,'Reise '+id,r.narrative,r);};
function reachArchive(c,{escape=false,promise=true}={}){
 choose(c,'read_signal');choose(c,'scan_artifact');go(c,'helios_docks');go(c,'helios_bar');choose(c,'read_room');
 choose(c,escape?'service_route':'pay_passage');choose(c,'kael_truth');go(c,'helios_docks');go(c,'helios_security');choose(c,escape?'hack_detention':'release_lyra');choose(c,'lyra_briefing');if(promise)choose(c,'promise_lyra');
 go(c,'helios_docks');go(c,'ship_airlock');go(c,'ship_corridor');go(c,'ship_engineering');choose(c,'repair_coupler');go(c,'ship_corridor');go(c,'ship_bridge');choose(c,'launch_nereid');go(c,'ruins_gate');choose(c,'open_gate');go(c,'ruins_archive');choose(c,'decode_archive');
}
for(const ending of ['ending_broadcast','ending_shelter','ending_sell'])test('Vollständiger Handlungsbogen: '+ending,()=>{
 const c=fresh();reachArchive(c);choose(c,ending);assert.equal(c.state.story.ending,ending);assert.equal(c.state.quests.main_echo.status,'completed');assert.ok(c.state.story.journal.length>=6);assert.ok(c.state.story.chronicle.length>20);assert.equal(c.state.promises[0].kept,ending!=='ending_sell');assert.equal(storyChoices(c)[0].id,'long_begin');
 const restored=fresh();restored.load(c.serialize());assert.equal(restored.state.story.ending,ending);assert.equal(restored.state.lastNarrative,c.state.lastNarrative);
});
test('Auch durchgehend schlechte Würfe blockieren Flucht und Befreiung nicht',()=>{const c=fresh(1);reachArchive(c,{escape:true});assert.ok(c.state.hp>0&&c.state.hp<100);choose(c,'ending_broadcast');assert.equal(c.state.story.ending,'ending_broadcast');});
test('Vorzeitiges Ende und wiederholte Belohnungen sind gesperrt',()=>{const c=fresh();assert.throws(()=>choose(c,'ending_sell'));assert.equal(c.state.turn,0);choose(c,'read_signal');const xp=c.state.xp;assert.throws(()=>choose(c,'read_signal'));assert.equal(c.state.xp,xp);assert.throws(()=>go(c,'ruins_archive'));});
test('Lyra erscheint erst nach der Befreiung, Mara bleibt am Schiff',()=>{const c=fresh();assert.ok(contextFor(c).npcs.mara);go(c,'helios_docks');assert.ok(!contextFor(c).npcs.lyra);assert.ok(!contextFor(c).npcs.mara);});
test('Beobachtung senkt die Verhandlungsschwierigkeit',()=>{const c=fresh(1);go(c,'helios_docks');go(c,'helios_bar');const first=choose(c,'negotiate');const second=choose(c,'negotiate');assert.ok(second.rolls[0].difficulty<first.rolls[0].difficulty);assert.ok(storyChoices(c).some(x=>x.id==='service_route'));});

test('Kampf verändert Wunden, Aufmerksamkeit und verfügbare Gesprächsszene',()=>{const c=fresh(1);go(c,'helios_docks');go(c,'helios_bar');choose(c,'fight_bar');assert.equal(c.state.hp,82);assert.equal(c.state.reputation.crimson,2);assert.ok(storyChoices(c).some(x=>x.id==='kael_truth'));assert.ok(c.state.scenes.helios_bar.guardsAlerted);});
test('Leerer Tank und leeres Konto lassen die Reise gegen dokumentierte Schulden weitergehen',()=>{const c=fresh();c.state.ship.fuel=0;c.state.credits=0;go(c,'helios_docks');choose(c,'refuel');assert.equal(c.state.ship.fuel,40);assert.equal(c.state.credits,0);assert.equal(c.state.story.dockDebt,40);});
test('Kampfunfähiger Charakter kann geborgen werden und weiterreisen',()=>{const c=fresh();c.state.hp=0;assert.throws(()=>go(c,'helios_docks'));choose(c,'recover');assert.equal(c.state.hp,35);assert.equal(c.state.location,'ship_medbay');assert.equal(c.state.story.medicalDebt,80);choose(c,'use_medkit');assert.equal(c.state.hp,65);assert.ok(!c.state.inventory.includes('medkit'));});
test('Beschädigter Import verändert den aktuellen Spielstand nicht',()=>{const c=fresh();const before=c.serialize();for(const patch of [{location:'missing'},{player:{name:'falsch'}},{inventory:{}},{story:{chronicle:{}}}]){assert.throws(()=>c.load(JSON.stringify({...JSON.parse(before),...patch})));assert.equal(c.serialize(),before);}});
test('Ältere Spielstände erhalten fehlende Standardfelder und bewahren Inventar und Fortschritt',()=>{const c=fresh();const old=JSON.parse(c.serialize());old.version='1.0.1';old.flags={nereidUnlocked:true};delete old.story;delete old.quests.side_engine;old.credits=321;c.load(JSON.stringify(old));ensureStory(c);assert.equal(c.state.credits,321);assert.equal(c.state.flags.nereidUnlocked,true);assert.equal(c.state.story.beats.briefing,true);assert.ok(c.state.quests.side_engine);});
