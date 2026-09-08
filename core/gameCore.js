export class GameCore {
  static STAT_KEYS=['strength','reflexes','intelligence','perception','charisma','willpower','tech','combat'];
  static STAT_POINTS=30;
  static STAT_MIN=1;
  static STAT_MAX=8;

  constructor(data){this.data=data;this.state=this.freshState();}

  freshState(){
    return {
      version:'1.0.1',createdAt:new Date().toISOString(),player:null,location:'ship_bridge',previousLocation:null,
      credits:850,hp:100,shield:65,xp:0,level:1,
      inventory:['compact_pistol','multitool','echo_artifact','medkit'],
      equipment:{weapon:'compact_pistol',armor:null,tool:'multitool'},
      ship:{name:'VSS Wayfarer',hull:82,shield:65,fuel:76,power:71,reactorStability:64,cargo:18,cargoMax:60,modules:['Mk-I Reaktor','Navigationskern','Kurzstreckenschild','Sensorpaket']},
      flags:{metKael:false,kaelSafe:false,knowsEcho:false,artifactAwake:false,nereidUnlocked:false,gateOpened:false,archiveTouched:false,heliosConflictResolved:false},
      reputation:{union:0,crimson:0,helix:0,freeSystems:0},
      npc:{kael:{trust:10,status:'Kontakt'},lyra:{trust:0,status:'Unbekannt'},mara:{trust:0,status:'Unbekannt'}},
      quests:{main_echo:{title:'Akt I · Das Signal',stage:0,status:'active',objectives:['Untersuche das unbekannte Artefakt auf der Wayfarer.']},side_engine:{title:'Flackernde Reserven',stage:0,status:'active',objectives:['Untersuche den instabilen Energiekoppler im Maschinenraum.']}},
      memories:[],promises:[],history:[],log:[],turn:0,lastAction:null,lastPlayerInput:'',lastNarrative:'',lastSavedTurn:-1,rollHistory:[]
    };
  }

  validateStats(stats){
    const vals=GameCore.STAT_KEYS.map(k=>Number(stats?.[k]));
    if(vals.some(v=>!Number.isInteger(v)||v<GameCore.STAT_MIN||v>GameCore.STAT_MAX)) return {ok:false,error:`Jeder Wert muss zwischen ${GameCore.STAT_MIN} und ${GameCore.STAT_MAX} liegen.`};
    const sum=vals.reduce((a,b)=>a+b,0);
    if(sum!==GameCore.STAT_POINTS) return {ok:false,error:`Du musst genau ${GameCore.STAT_POINTS} Punkte verteilen. Aktuell: ${sum}.`};
    return {ok:true,sum};
  }

  createCharacter(c){
    const validation=this.validateStats(c.stats); if(!validation.ok) throw new Error(validation.error);
    if(!this.data.backgrounds.some(b=>b.id===c.background)) throw new Error('Ungültige Herkunft.');
    if(!Array.isArray(c.positiveTraits)||new Set(c.positiveTraits).size!==2||c.positiveTraits.length!==2||c.positiveTraits.some(id=>!this.data.traits.positive.some(t=>t.id===id))) throw new Error('Wähle genau zwei unterschiedliche positive Eigenschaften.');
    if(!this.data.traits.negative.some(t=>t.id===c.negativeTrait))throw new Error('Wähle eine gültige negative Eigenschaft.');
    this.state.player={name:(c.name||'Rook').trim().slice(0,24)||'Rook',background:c.background,positiveTraits:[...c.positiveTraits],negativeTrait:c.negativeTrait,stats:{...c.stats}};
    this.remember(`Du hast deine Reise als ${this.background()?.name||'Unbekannter'} begonnen.`,55,'origin');
    this.pushLog(`CHARAKTER ERSTELLT: ${this.state.player.name}`); return this.state;
  }

  background(){return this.data.backgrounds.find(b=>b.id===this.state.player?.background);}
  trait(id){return [...(this.data.traits?.positive||[]),...(this.data.traits?.negative||[])].find(t=>t.id===id);}
  item(id){return this.data.items?.find(i=>i.id===id)||{id,name:id,desc:''};}
  location(){return this.data.world.locations[this.state.location];}
  pushLog(text){this.state.log.unshift({turn:this.state.turn,time:new Date().toISOString(),text});this.state.log=this.state.log.slice(0,50);}
  remember(text,importance=50,type='event'){if(!this.state.memories.some(m=>m.text===text))this.state.memories.push({text,importance,type,turn:this.state.turn});}
  promise(text){this.state.promises.push({text,turn:this.state.turn,kept:null});this.remember(`Versprechen: ${text}`,80,'promise');}
  advanceTurn(){this.state.turn++;}
  randomInt(min,max){
    const range=max-min+1;
    if(globalThis.crypto?.getRandomValues){
      const a=new Uint32Array(1),limit=Math.floor(4294967296/range)*range;
      do{globalThis.crypto.getRandomValues(a);}while(a[0]>=limit);
      return min+(a[0]%range);
    }
    return min+Math.floor(Math.random()*range);
  }
  d20(){
    const roll=this.randomInt(1,20);
    this.state.rollHistory=[...(this.state.rollHistory||[]),roll].slice(-40);
    return roll;
  }
  repeatCount(raw){
    const n=String(raw||'').trim().toLowerCase();
    return this.state.history.filter(h=>String(h.raw||'').trim().toLowerCase()===n&&h.location===this.state.location).length;
  }

  contextualBonus(tags=[]){
    let bonus=0; const reasons=[]; const bg=this.background();
    for(const tag of tags){if(bg?.bonuses?.[tag]){bonus+=bg.bonuses[tag];reasons.push(`${bg.name} +${bg.bonuses[tag]}`);}}
    for(const id of this.state.player?.positiveTraits||[]){const tr=this.trait(id);if(tr?.tags?.some(t=>tags.includes(t))){bonus+=2;reasons.push(`${tr.name} +2`);}}
    const neg=this.trait(this.state.player?.negativeTrait);
    if(neg?.id==='hothead'&&tags.includes('calm_social')){bonus-=2;reasons.push('Hitzkopf -2');}
    if(neg?.id==='paranoid'&&tags.includes('observation')){bonus+=1;reasons.push('Paranoid +1');}
    return {bonus,reasons};
  }

  check(stat,difficulty,tags=[],extra=0){
    const value=this.state.player?.stats?.[stat]??1; const roll=this.d20();
    const repeat=Math.max(0,Number(this.state.currentActionRepeat||0));
    const repeatPenalty=Math.min(4,Math.floor(repeat/2));
    const effectiveDifficulty=difficulty+repeatPenalty;
    const statMod=Math.floor((value-1)/2); const ctx=this.contextualBonus(tags); const mod=statMod+ctx.bonus+extra; const total=roll+mod;
    const success=roll===20||(roll!==1&&total>=effectiveDifficulty); const degree=roll===20?'critical':roll===1?'fumble':success?(total>=effectiveDifficulty+5?'strong':'success'):(total<=effectiveDifficulty-5?'bad':'fail');
    return {stat,value,roll,statMod,contextBonus:ctx.bonus,reasons:ctx.reasons,mod,total,difficulty:effectiveDifficulty,baseDifficulty:difficulty,repeatPenalty,success,degree,critical:roll===20,fumble:roll===1};
  }

  travel(id){const target=this.data.world.locations[id]; if(!target)return false; const current=this.location(); if(current?.exits&&!current.exits.includes(id)){return false;} this.state.previousLocation=this.state.location;this.state.location=id;this.advanceTurn();this.pushLog(`ORT: ${target.name}`);return true;}
  forceTravel(id){if(!this.data.world.locations[id])return false;this.state.previousLocation=this.state.location;this.state.location=id;this.advanceTurn();this.pushLog(`ORT: ${this.data.world.locations[id].name}`);return true;}
  damage(n){this.state.hp=Math.max(0,this.state.hp-n);return this.state.hp;}
  heal(n){this.state.hp=Math.min(100,this.state.hp+n);return this.state.hp;}
  addCredits(n){this.state.credits=Math.max(0,this.state.credits+n);}
  addItem(id){if(!this.state.inventory.includes(id))this.state.inventory.push(id);}
  removeItem(id){this.state.inventory=this.state.inventory.filter(x=>x!==id);}
  setQuest(id,patch){if(this.state.quests[id])Object.assign(this.state.quests[id],patch);}
  setObjectives(id,objectives){if(this.state.quests[id])this.state.quests[id].objectives=objectives;}
  relation(id,delta){if(!this.state.npc[id])this.state.npc[id]={trust:0,status:'Bekannt'};this.state.npc[id].trust=Math.max(-100,Math.min(100,(this.state.npc[id].trust||0)+delta));}
  reputation(id,delta){this.state.reputation[id]=(this.state.reputation[id]||0)+delta;}
  recordAction(action){this.state.lastAction=action;this.state.history.push({...action,turn:this.state.turn,location:this.state.location});this.state.history=this.state.history.slice(-120);}

  serialize(){return JSON.stringify(this.state,null,2);}
  load(json){const parsed=JSON.parse(json);if(!parsed?.version||!parsed.player)throw new Error('Ungültiger Spielstand');this.state={...this.freshState(),...parsed};}
}
