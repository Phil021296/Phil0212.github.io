import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {mountActions} from '../backend/actionRoutes.js';
import {GameCore} from '../core/gameCore.js';
import {readFile} from 'node:fs/promises';
const data=Object.fromEntries(await Promise.all(['backgrounds','traits','world','items','crew'].map(async n=>[n,JSON.parse(await readFile(new URL(`../data/${n}.json`,import.meta.url)))])));
test('HTTP-Spielzug: speichern, Wiederholung, Revisionskonflikt und Rollback',async()=>{
 const core=new GameCore(data);core.createCharacter({name:'Test',background:data.backgrounds[0].id,positiveTraits:data.traits.positive.slice(0,2).map(x=>x.id),negativeTrait:data.traits.negative[0].id,stats:{strength:4,reflexes:4,intelligence:4,perception:4,charisma:4,willpower:4,tech:3,combat:3}});
 let row={state:core.state,revision:1,updated_at:'test'},backup,receipts=new Map(),savedReceipts,calls=0,fail=false;
 const pool={connect:async()=>({release(){},async query(sql,args=[]){
  if(sql==='BEGIN'){backup=structuredClone(row);savedReceipts=new Map(receipts);return {};}
  if(sql==='COMMIT')return {};
  if(sql==='ROLLBACK'){row=backup;receipts=savedReceipts;return {};}
  if(sql.startsWith('SELECT id FROM'))return {rows:[{id:'test'}]};
  if(sql.startsWith('SELECT state'))return {rows:[structuredClone(row)]};
  if(sql.startsWith('SELECT input'))return {rows:receipts.has(args[1])?[{input:receipts.get(args[1])}]:[]};
  if(sql.startsWith('UPDATE savegames')){row={state:JSON.parse(args[0]),revision:row.revision+1,updated_at:'test'};return {rows:[row]};}
  if(sql.startsWith('INSERT INTO gm_requests')){receipts.set(args[1],args[2]);return {};}
  throw Error(sql);
 }})};
 const provider={configured:true,async interpret(){calls++;return {intent:'Beobachten',tone:'neutral',actions:[{kind:'observe',target:'self',description:'Umsehen',negated:false}]};},async narrate(){if(fail)throw Error('provider');return 'Du schaust dich um.';}};
 const app=express();app.use(express.json());mountActions(app,pool,(req,res,next)=>{req.playerId='test';next();},{provider,gameData:data});
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const send=body=>fetch(base+'/api/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{
  const body={input:'Ich sehe mich um.',requestId:'isolated-request-0001',revision:1};
  const first=await send(body);assert.equal(first.status,200);assert.equal((await first.json()).revision,2);assert.equal(row.state.turn,1);
  const replay=await send(body);assert.equal((await replay.json()).replayed,true);assert.equal(calls,1);assert.equal(row.state.turn,1);
  assert.equal((await send({...body,requestId:'isolated-request-0002'})).status,409);
  assert.equal((await send({...body,input:'Anderer Text'})).status,409);
  fail=true;assert.equal((await send({...body,requestId:'isolated-request-0003',revision:2})).status,503);assert.equal(row.revision,2);assert.equal(row.state.turn,1);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
