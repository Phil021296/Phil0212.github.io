export class GameCore {
  constructor(data) {
    this.data = data;
    this.state = this.freshState();
  }

  freshState(){
    return {
      version:"0.1.0",
      player:null,
      location:"ship_bridge",
      credits:850,
      hp:100,
      shield:65,
      xp:0,
      inventory:["Kompaktpistole","Multitool","Unbekanntes Artefakt"],
      flags:{ metKael:false, knowsEcho:false, artifactAwake:false },
      reputation:{ union:0, crimson:0, helix:0 },
      memories:[],
      log:[]
    };
  }

  createCharacter(c){
    const base={strength:5,reflexes:5,intelligence:5,perception:5,charisma:5,willpower:5,tech:5,combat:5};
    const bg=this.data.backgrounds.find(b=>b.id===c.background);
    if(bg?.mods) for(const [k,v] of Object.entries(bg.mods)) base[k]=(base[k]||5)+v;
    for(const [k,v] of Object.entries(c.stats||{})) base[k]=v + (bg?.mods?.[k]||0);
    this.state.player={name:c.name||"Rook",background:c.background,positiveTraits:c.positiveTraits,negativeTrait:c.negativeTrait,stats:base};
    this.pushLog(`CHARAKTER ERSTELLT: ${this.state.player.name}`);
    return this.state;
  }

  pushLog(text){ this.state.log.unshift({time:new Date().toISOString(),text}); this.state.log=this.state.log.slice(0,30); }
  remember(text, importance=50){ this.state.memories.push({text,importance}); }

  d20(){ return Math.floor(Math.random()*20)+1; }
  check(stat,difficulty,bonus=0){
    const value=this.state.player?.stats?.[stat] ?? 5;
    const roll=this.d20();
    const mod=Math.floor((value-5)/2)+bonus;
    const total=roll+mod;
    return {roll,mod,total,difficulty,success:roll===20 || (roll!==1 && total>=difficulty),critical:roll===20,fumble:roll===1};
  }

  travel(location){
    if(!this.data.world.locations[location]) return false;
    this.state.location=location;
    this.pushLog(`ORT: ${this.data.world.locations[location].name}`);
    return true;
  }

  serialize(){ return JSON.stringify(this.state,null,2); }
  load(json){ const parsed=JSON.parse(json); if(!parsed?.version) throw new Error("Ungültiger Spielstand"); this.state=parsed; }
}
