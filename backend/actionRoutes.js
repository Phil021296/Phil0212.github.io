import {readFile} from 'node:fs/promises';
import {createAI} from './aiProvider.js';
import {runTurn} from './turnService.js';
const data=Object.fromEntries(await Promise.all(['backgrounds','traits','world','items','crew'].map(async name=>[name,JSON.parse(await readFile(new URL(`../data/${name}.json`,import.meta.url),'utf8'))])));
const ai=createAI();
export function mountActions(app,pool,authenticate,{provider=ai,gameData=data}={}){
 app.get('/api/gm',(_req,res)=>res.json({enabled:provider.configured,version:'1.2.0'}));
 app.post('/api/action',authenticate,async(req,res)=>{
  const {input,requestId,revision,choiceId,travelId}=req.body||{};
  if(typeof input!=='string'||!input.trim()||input.length>4000||typeof requestId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(requestId)||!Number.isSafeInteger(revision)||revision<0)return res.status(400).json({error:'invalid_action'});
  if((choiceId!==undefined&&typeof choiceId!=='string')||(travelId!==undefined&&typeof travelId!=='string')||(choiceId&&travelId))return res.status(400).json({error:'invalid_action'});
  const fingerprint=choiceId||travelId?JSON.stringify({input,choiceId,travelId}):input;
  if(!provider.configured&&!choiceId&&!travelId)return res.status(503).json({error:'ai_not_configured'});
  let client;
  try{
   client=await pool.connect();await client.query('BEGIN');
   // All saves and turns lock the same player row, including first-save races.
   await client.query('SELECT id FROM players WHERE id=$1 FOR UPDATE',[req.playerId]);
   const {rows}=await client.query('SELECT state,revision,updated_at FROM savegames WHERE player_id=$1',[req.playerId]);
   const current=rows[0];
   if(!current){await client.query('ROLLBACK');return res.status(409).json({error:'save_required'});}
   const receipt=await client.query('SELECT input FROM gm_requests WHERE player_id=$1 AND request_id=$2',[req.playerId,requestId]);
   if(receipt.rows.length){await client.query('COMMIT');if(receipt.rows[0].input!==fingerprint)return res.status(409).json({error:'request_id_reused'});return res.json({state:current.state,revision:Number(current.revision),savedAt:current.updated_at,replayed:true});}
   if(Number(current.revision)!==revision){await client.query('ROLLBACK');return res.status(409).json({error:'revision_conflict'});}
   const state=await runTurn({state:current.state,input,data:gameData,ai:provider,choiceId,travelId});
   const saved=await client.query('UPDATE savegames SET state=$1::jsonb,game_version=$2,revision=revision+1,updated_at=NOW() WHERE player_id=$3 RETURNING revision,updated_at',[JSON.stringify(state),'1.2.0',req.playerId]);
   await client.query('INSERT INTO gm_requests(player_id,request_id,input) VALUES($1,$2,$3)',[req.playerId,requestId,fingerprint]);
   await client.query('COMMIT');
   res.json({state,revision:Number(saved.rows[0].revision),savedAt:saved.rows[0].updated_at});
  }catch(error){if(client)await client.query('ROLLBACK').catch(()=>{});console.error('Game-Master-Spielzug fehlgeschlagen:',error.name);res.status(503).json({error:'turn_failed'});}
  finally{client?.release();}
 });
}
