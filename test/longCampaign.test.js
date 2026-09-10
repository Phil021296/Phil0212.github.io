import {encounterChoices} from '../core/encounters.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GameCore} from '../core/gameCore.js';
import {ensureStory,storyChoices,rememberTurn} from '../core/campaign.js';
import {resolveChoice} from '../core/gameMaster.js';
import {CAMPAIGN} from '../core/longCampaign.js';
const data=Object.fromEntries(await Promise.all(['world','backgrounds','traits','items','crew'].map(async n=>[n,JSON.parse(await readFile(new URL('../data/'+n+'.json',import.meta.url)))])));
const choose=(c,id)=>{const r=resolveChoice(c,{choiceId:id,input:id});rememberTurn(c,id,r.narrative,r);return r;};
function settle(c){for(let i=0;i<60;i++){const a=encounterChoices(c);if(!a)return;choose(c,a[0].id);const save=c.serialize();c.load(save);}throw Error('Begegnung endet nicht');}
const go=(c,id)=>{settle(c);if(c.state.location!==id)resolveChoice(c,{travelId:id,input:id});};
function fresh(){const c=new GameCore(data);c.createCharacter({name:'QA',background:data.backgrounds[0].id,positiveTraits:data.traits.positive.slice(0,2).map(x=>x.id),negativeTrait:data.traits.negative[0].id,stats:{strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3}});ensureStory(c);c.state.story.ending='ending_sell';c.d20=()=>1;return c;}
test('Beide Erweiterungskapitel einschließlich aller Nebenfälle spielbar und speicherbar',()=>{
 const c=fresh();choose(c,'long_begin');assert.match(c.state.lastNarrative,/Helix/);
 for(const chapter of CAMPAIGN){
 for(const m of chapter.missions){
 go(c,chapter.hub);settle(c);choose(c,'long_case_'+m.id);
 assert.throws(()=>choose(c,'long_public'));
 for(let i=0;i<m.leads.length;i++){
 go(c,m.leads[i].site);choose(c,'long_lead_'+i);assert.throws(()=>choose(c,'long_lead_'+i));choose(c,'long_read_'+i);
 const saved=c.serialize();c.load(saved);assert.equal(c.state.story.expansion.selected,m.id);
 if(i<m.leads.length-1)go(c,chapter.hub);
 }
 go(c,chapter.hub);settle(c);choose(c,'long_answer_'+((m.correct+1)%3));assert.equal(c.state.story.expansion.cases[m.id].solved,false);
 choose(c,'long_answer_'+m.correct);choose(c,m.optional?'long_quiet':'long_public');
 assert.throws(()=>choose(c,'long_public'));
 }
 settle(c);choose(c,'long_finish');
 if(chapter!==CAMPAIGN.at(-1))choose(c,'long_next');
 }
 assert.equal(c.state.story.expansion.finished,true);
 assert.equal(storyChoices(c).length,0);
 assert.equal(Object.values(c.state.story.expansion.cases).filter(x=>x.done).length,18);
 assert.ok(c.state.story.journal.length>=72);assert.equal(Object.values(c.state.story.expansion.expedition.scenes).filter(x=>x.done).length,8);
});
test('Vorsichtiger Zugang sichert Hinweise ohne Würfelkomplikation; Reihenfolge bleibt verbindlich',()=>{
 const c=fresh();choose(c,'long_begin');assert.throws(()=>choose(c,'long_case_mandate'));
 choose(c,'long_case_manifest');assert.throws(()=>choose(c,'long_read_0'));
 go(c,'h9_ward');choose(c,'long_careful_0');assert.equal(c.state.story.expansion.attention,0);
 assert.throws(()=>resolveChoice(c,{travelId:'choir_vault',input:'Abkürzung'}));
});
