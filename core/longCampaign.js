import {CHAPTER_FIVE} from './chapterFive.js';
import {CHAPTER_SIX} from './chapterSix.js';
export const CAMPAIGN=[CHAPTER_FIVE,CHAPTER_SIX];
const choice=(id,label,detail='')=>({id:'long_'+id,label,detail,kind:'story',target:'long_'+id});
export function activeChapter(core){return core.state.story?.expansion?.active?CAMPAIGN[core.state.story.expansion.index]:null;}
export function longChoices(core){
 const t=core.state.story,e=t.expansion,c=activeChapter(core);
 if(!c&&e&&!e.finished)return [choice('next','Kapitel 6 beginnen: Der stumme Chor','Aufbruch nach Nereid')];
 if(!c)return t.ending&&!e?.finished?[choice('begin','Kapitel 5 beginnen: Asche im Dockring','Die Folgen deiner Entscheidung auf Helios-9')]:[];
 const out=[],p=e.cases,selected=c.missions.find(m=>m.id===e.selected);
 if(core.state.location===c.hub){
 for(const m of c.missions.filter(m=>!p[m.id]?.done&&m.requires.every(id=>p[id]?.done)))out.push(choice('case_'+m.id,m.title,m.optional?'Crewgeschichte · optional':'Ermittlung · Hauptgeschichte'));
 if(c.missions.filter(m=>!m.optional).every(m=>p[m.id]?.done))out.push(choice('finish','Den Handlungsbogen abschließen','Offene Nebengeschichten bleiben im Logbuch vermerkt'));
 }
 if(selected&&!p[selected.id]?.done){
 const q=p[selected.id];
 selected.leads.forEach((l,i)=>{
 if(l.site!==core.state.location)return;
 if(!q.leads[i]){out.push(choice('lead_'+i,l.title,'Untersuchen · Probe mit möglichen Komplikationen'));out.push(choice('careful_'+i,l.title+' – mit Unterstützung','Die Crew hilft; zusätzliche Zeit, sichere Beweissicherung'));}
 else if(!q.read[i])out.push(choice('read_'+i,'Fundstück lesen: '+l.title,'Originalaufzeichnung prüfen'));
 });
 if(q.read.filter(Boolean).length===selected.leads.length&&core.state.location===c.hub){
 if(!q.solved)selected.answers.forEach((a,i)=>out.push(choice('answer_'+i,a,selected.question)));
 else {out.push(choice('public','Die Erkenntnisse öffentlich vertreten','Transparenz · Aufmerksamkeit steigt'));out.push(choice('quiet','Die Betroffenen zuerst informieren','Vertrauliche Hilfe · Crewvertrauen steigt'));}
 }
 }
 return out;
}
export function longApply(core,id,check){
 if(!longChoices(core).some(x=>x.id===id))throw Error('Diese Handlung ist nicht verfügbar.');
 const s=core.state,t=s.story;let e=t.expansion,c=activeChapter(core),narrative='',events=[];
 if(id==='long_next'){e.index++;e.active=true;e.selected=null;c=CAMPAIGN[e.index];s.location=c.hub;narrative=c.premise;}else if(id==='long_begin'){
 e=t.expansion={active:true,index:0,cases:{},selected:null,attention:0};c=CAMPAIGN[0];s.location=c.hub;
 narrative=c.premise+'\n\n'+(t.ending==='ending_sell'?'Am Schalter hängt bereits das Helix-Siegel. Lyra sieht es und zieht ihre Hand von der Konsole. „Dieses Mal behalten wir Kopien.“':t.ending==='ending_broadcast'?'Deine Stimme läuft noch immer in den Nachrichtenschleifen. Eine Frau erkennt dich, sagt aber nichts. Sie reicht dir eine Liste mit Vermissten.':'Mara findet die ersten Namen eurer stillen Rettungskette an einer Wand. Neben manchen steht ein Haken. Neben anderen ein Fragezeichen.')+'\n\nAuf dem Tisch liegen offene Fälle. Ihr entscheidet selbst, wo ihr anfangt.';
 }else if(id.startsWith('long_case_')){
 const m=c.missions.find(m=>m.id===id.slice(10));e.selected=m.id;e.cases[m.id]??={leads:[],read:[],solved:false,done:false,attempts:0};narrative=m.brief;
 }else if(id==='long_finish'){
 e.active=false;e.finished=e.index===CAMPAIGN.length-1;narrative='Die Koordinationshalle leert sich nicht auf einmal. Zuerst werden die Listen kürzer. Dann bleiben die Stühle länger unbesetzt. Mara sitzt neben dir auf dem Tisch und lässt die Beine baumeln. „Iven hat gefragt, ob du immer so viele Fragen stellst.“\n\nSie lächelt, bevor sie weiterredet. „Ich habe gesagt: nur wenn die Antworten wichtig sind.“\n\nHelios gehört jetzt denen, die hier bleiben. Eure Entscheidungen stehen im Logbuch; nicht jede offene Wunde ist damit geheilt.';if(e.index===1)narrative='Sen steht am Rand des Landeplatzes. Hinter ihr gehen die ersten Bewohner über den Grat. Andere bleiben im Garten, dessen neue Heizung bereits arbeitet. Die Stimmen im Archiv werden leiser, als Lyra die Tür schließt.\n\nMara wartet an der Rampe. „Diesmal haben alle einen Weg“, sagt sie. Du siehst noch einmal zurück, bevor ihr startet.';events.push('Kapitel abgeschlossen: '+c.title);
 }else{
 const m=c.missions.find(m=>m.id===e.selected),q=e.cases[m.id];
 if(id.startsWith('long_lead_')||id.startsWith('long_careful_')){
 const i=Number(id.split('_').at(-1)),l=m.leads[i],careful=id.startsWith('long_careful_');
 const ok=careful||check(l.stat,14,[]);q.leads[i]=true;
 narrative=l.entry+'\n\n'+(careful?'Ihr arbeitet zu zweit. Lyra hält die Herkunft der Aufzeichnung fest, während du das Material sicherst.':ok?'Du sicherst die Aufzeichnung, bevor der Zugriff geschlossen wird.':'Der Zugriff löst eine Rückfrage aus. Ihr bekommt das Material, aber eure Namen stehen jetzt im Kontrollprotokoll.');
 if(!ok){e.attention++;events.push('Aufmerksamkeit +1');}
 t.minutes+=careful?12:5;
 }else if(id.startsWith('long_read_')){
 const i=Number(id.split('_').at(-1)),l=m.leads[i];q.read[i]=true;narrative=l.document;
 t.journal.push({title:m.title+' · '+l.title,text:l.document,turn:s.turn});
 }else if(id.startsWith('long_answer_')){
 const answer=Number(id.split('_').at(-1));q.attempts++;
 if(answer===m.correct){q.solved=true;narrative=m.explanation+'\n\nLyra schließt die letzte Datei. „Das können wir belegen. Jetzt müssen wir entscheiden, wem wir es sagen.“';}
 else narrative='Lyra legt die Aufzeichnungen nebeneinander. „Diese Erklärung passt noch nicht zu allen Befunden. Lass uns die Originale im Logbuch vergleichen, bevor wir jemanden beschuldigen.“\n\n'+m.question;
 }else{
 q.done=true;q.resolution=id==='long_public'?'public':'quiet';narrative=q.resolution==='public'?m.publicEnding:m.quietEnding;
 if(q.resolution==='public')e.attention++;else core.relation('mara',1);
 s.xp+=30;s.level=1+Math.floor(s.xp/100);t.journal.push({title:m.title+' · abgeschlossen',text:narrative,turn:s.turn});events.push(m.title+' abgeschlossen');
 s.npc.mara.longTerm.push({turn:s.turn,event:m.title+': '+q.resolution});
 }
 }
 t.minutes+=2;return {narrative,events};
}
export function longStatus(core){const c=activeChapter(core);if(!c)return null;const e=core.state.story.expansion,m=c.missions.find(x=>x.id===e.selected&&!e.cases[x.id]?.done);return {number:'KAPITEL '+c.number,title:c.title,goal:m?m.title+': Hinweise vor Ort sichern, lesen und im Koordinationsraum abgleichen.':'Wähle im Koordinationsraum einen offenen Fall.'};}
