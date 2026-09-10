import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GameCore} from '../core/gameCore.js';
import {ensureStory,storyChoices,exitsFor} from '../core/campaign.js';
import {resolveChoice,resolvePlan,contextFor} from '../core/gameMaster.js';
import {expedition,pendingEncounter} from '../core/encounters.js';
import {ENCOUNTERS} from '../core/encounterContent.js';
const data=Object.fromEntries(await Promise.all(['world','backgrounds','traits','items','crew'].map(async n=>[n,JSON.parse(await readFile(new URL('../data/'+n+'.json',import.meta.url)))])));
function fresh(){const c=new GameCore(data);c.createCharacter({name:'QA',background:data.backgrounds[0].id,positiveTraits:data.traits.positive.slice(0,2).map(x=>x.id),negativeTrait:data.traits.negative[0].id,stats:{strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3}});ensureStory(c);c.state.story.ending='ending_sell';c.d20=()=>1;choose(c,'long_begin');expedition(c);return c;}
const choose=(c,id)=>resolveChoice(c,{choiceId:id,input:id});
test('Alle Begegnungen bleiben ohne Geld, Ausrüstung oder Vorräte lösbar',()=>{
 for(const event of ENCOUNTERS){
 const c=fresh(),e=c.state.story.expansion;e.index=event.chapter;c.state.location=event.chapter?'choir_camp':'h9_coordination';
 e.cases[event.after]={done:true};const r=expedition(c);r.supplies=0;c.state.credits=0;c.state.inventory=[];
 let turns=0;while(!r.scenes[event.id]?.done){assert.ok(turns++<12,event.id);const a=storyChoices(c);assert.ok(a.length,event.id);choose(c,a[0].id);}
 assert.equal(r.supplies,0);
 }
});
test('Deckung erleichtert den Schuss nur in der vorbereiteten Begegnung',()=>{
 const c=fresh(),e=c.state.story.expansion;e.cases.trial={done:true};choose(c,'long_scene_start');choose(c,'long_scene_cover');
 const shot=choose(c,'long_scene_fire');assert.equal(shot.rolls[0].difficulty,12);assert.equal(c.state.hp,94);
 choose(c,'long_scene_choice');e.index=1;c.state.location='choir_camp';e.cases.interference={done:true};choose(c,'long_scene_start');choose(c,'long_scene_record');
 const later=choose(c,'long_scene_disable');assert.ok(later.rolls[0].difficulty>=14);assert.equal(c.state.hp,82);
});
test('Begegnungen sperren Reise und KI-Abkürzungen; Bergung erhält Fortschritt',()=>{
 const c=fresh(),e=c.state.story.expansion;e.cases.lifts={done:true};choose(c,'long_scene_start');choose(c,'long_scene_brace');
 assert.equal(exitsFor(c).length,0);assert.ok(contextFor(c).campaign.encounter);
 const before=c.serialize();assert.throws(()=>resolvePlan(c,'weg',{intent:'Reisen',tone:'ruhig',actions:[{kind:'travel',target:'h9_ward',description:'weg',negated:false}]}));assert.equal(c.serialize(),before);
 c.state.hp=0;assert.equal(storyChoices(c)[0].id,'long_rescue');choose(c,'long_rescue');assert.equal(c.state.hp,35);assert.equal(expedition(c).scenes.lift_rescue.step,1);assert.equal(c.state.story.medicalDebt,60);
});
test('Aufmerksamkeit löst Kontrolle aus; Ruhe verbraucht Vorrat und kann nicht gratis wiederholt werden',()=>{
 const c=fresh(),e=c.state.story.expansion;e.attention=4;assert.equal(pendingEncounter(c).event.id,'checkpoint');choose(c,'long_scene_wait');assert.equal(pendingEncounter(c),null);
 c.state.hp=70;const r=expedition(c);r.supplies=1;choose(c,'long_camp_rest');assert.equal(r.supplies,0);assert.equal(c.state.hp,90);assert.throws(()=>choose(c,'long_camp_rest'));
});
test('Beschädigte Begegnungsspielstände werden ohne Verlust der laufenden Reise abgelehnt',()=>{
 const c=fresh(),before=c.serialize();
 for(const patch of [{supplies:-1},{fatigue:99},{scenes:{unknown:{step:5,done:true,outcomes:[]}}},{scenes:{lift_rescue:{step:1,done:false,outcomes:[{choice:'invented',success:true}]}}}]){
 const bad=JSON.parse(before);Object.assign(bad.story.expansion.expedition,patch);assert.throws(()=>c.load(JSON.stringify(bad)));assert.equal(c.serialize(),before);
 }
});
