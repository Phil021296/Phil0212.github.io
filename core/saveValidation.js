const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const fail=()=>{throw new Error('Der Spielstand ist unvollständig oder beschädigt. Die bisherige Reise bleibt erhalten.');};
export function validateSave(parsed,core){
 if(!record(parsed)||typeof parsed.version!=='string'||!record(parsed.player))fail();
 const p=parsed.player;
 if(typeof p.name!=='string'||!p.name.trim()||p.name.length>64||!core.validateStats(p.stats).ok)fail();
 if(!core.data.backgrounds.some(b=>b.id===p.background))fail();
 if(!Array.isArray(p.positiveTraits)||p.positiveTraits.length!==2||new Set(p.positiveTraits).size!==2||p.positiveTraits.some(id=>!core.data.traits.positive.some(t=>t.id===id))||!core.data.traits.negative.some(t=>t.id===p.negativeTrait))fail();
 if(!Object.hasOwn(core.data.world.locations,parsed.location))fail();
 for(const k of ['turn','credits','xp','level','hp','shield'])if(parsed[k]!==undefined&&(!Number.isFinite(parsed[k])||parsed[k]<0))fail();
 for(const k of ['inventory','history','log','memories','promises','rollHistory'])if(parsed[k]!==undefined&&!Array.isArray(parsed[k]))fail();
 if(parsed.inventory?.some(x=>typeof x!=='string'))fail();
 for(const k of ['flags','npc','ship','quests','reputation','equipment','scenes'])if(parsed[k]!==undefined&&!record(parsed[k]))fail();
 if(parsed.npc&&Object.values(parsed.npc).some(n=>!record(n)||['longTerm','shortTerm'].some(k=>n[k]!==undefined&&!Array.isArray(n[k]))))fail();
 if(parsed.scenes&&Object.values(parsed.scenes).some(n=>!record(n)))fail();
 if(parsed.quests&&Object.values(parsed.quests).some(q=>!record(q)||q.objectives!==undefined&&!Array.isArray(q.objectives)))fail();
 if(parsed.story!==undefined){
  if(!record(parsed.story)||parsed.story.beats!==undefined&&!record(parsed.story.beats))fail();
  for(const key of ['journal','chronicle'])if(parsed.story[key]!==undefined&&!Array.isArray(parsed.story[key]))fail();
 }
 const expansion=parsed.story?.expansion;
 if(expansion!==undefined){
 if(!record(expansion)||!Number.isInteger(expansion.index)||expansion.index<0||expansion.index>1||typeof expansion.active!=='boolean'||!record(expansion.cases)||!Number.isFinite(expansion.attention)||expansion.attention<0)fail();
 for(const q of Object.values(expansion.cases))if(!record(q)||!Array.isArray(q.leads)||!Array.isArray(q.read)||q.leads.length>3||q.read.length>3||typeof q.solved!=='boolean'||typeof q.done!=='boolean')fail();
 }
 if(parsed.lastResolution&&(!record(parsed.lastResolution)||!Array.isArray(parsed.lastResolution.events)||!Array.isArray(parsed.lastResolution.rolls)))fail();
 const fresh=core.freshState(),state={...fresh,...parsed};
 for(const k of ['flags','ship','reputation','equipment'])state[k]={...fresh[k],...parsed[k]};
 state.npc={...fresh.npc,...parsed.npc};
 state.quests={...fresh.quests,...parsed.quests};
 for(const id of Object.keys(fresh.quests))state.quests[id]={...fresh.quests[id],...parsed.quests?.[id]};
 return state;
}
