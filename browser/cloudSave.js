const ID_KEY='voidbound-cloud-player-id';
const TOKEN_KEY='voidbound-cloud-player-token';

class CloudSave {
  constructor(){
    this.playerId=localStorage.getItem(ID_KEY);
    this.playerToken=localStorage.getItem(TOKEN_KEY);
    this.ready=false;
    this.online=false;
    this.lastSavedAt=null;
    this.lastRevision=0;
    this.inFlight=Promise.resolve();
  }
  headers(){return {'Content-Type':'application/json','x-player-id':this.playerId||'','Authorization':`Bearer ${this.playerToken||''}`};}
  async init(){
    try{
      if(this.playerId&&this.playerToken){
        const r=await fetch('/api/player',{headers:this.headers(),cache:'no-store'});
        if(r.ok){this.ready=true;this.online=true;return true;}
        if(r.status===401){localStorage.removeItem(ID_KEY);localStorage.removeItem(TOKEN_KEY);this.playerId=null;this.playerToken=null;}
      }
      const r=await fetch('/api/player',{method:'POST'});
      if(!r.ok)throw new Error('player_create_failed');
      const data=await r.json();
      this.playerId=data.playerId;this.playerToken=data.playerToken;
      localStorage.setItem(ID_KEY,this.playerId);localStorage.setItem(TOKEN_KEY,this.playerToken);
      this.ready=true;this.online=true;return true;
    }catch(error){console.warn('Cloud-Speicher nicht erreichbar:',error);this.online=false;return false;}
  }
  async save(state){
    if(!state?.player)return false;
    if(!this.ready&&!(await this.init()))return false;
    // Snapshot verhindert, dass sich der Zustand während eines laufenden Requests weiter verändert.
    const snapshot=JSON.parse(JSON.stringify(state));
    const doSave=async()=>{
      try{
        const r=await fetch('/api/save',{method:'PUT',headers:this.headers(),body:JSON.stringify({state:snapshot}),cache:'no-store'});
        if(!r.ok)throw new Error(`save_${r.status}`);
        const data=await r.json();
        this.online=true;this.lastSavedAt=data.savedAt;this.lastRevision=data.revision||this.lastRevision;
        return true;
      }catch(error){console.warn('Cloud-Save fehlgeschlagen:',error);this.online=false;return false;}
    };
    // Speichervorgänge strikt nacheinander ausführen. Dadurch kann ein älterer Request nie einen neueren überschreiben.
    this.inFlight=this.inFlight.then(doSave,doSave);
    return this.inFlight;
  }
  async load(){
    if(!this.ready&&!(await this.init()))return null;
    try{
      const r=await fetch('/api/save',{headers:this.headers(),cache:'no-store'});
      if(r.status===404)return null;
      if(!r.ok)throw new Error(`load_${r.status}`);
      const data=await r.json();this.online=true;this.lastSavedAt=data.updatedAt;this.lastRevision=data.revision||0;return data.state;
    }catch(error){console.warn('Cloud-Load fehlgeschlagen:',error);this.online=false;return null;}
  }
}
export const cloudSave=new CloudSave();
