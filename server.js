import express from 'express';
import pg from 'pg';
import crypto from 'crypto';
import path from 'path';
import {fileURLToPath} from 'url';
import {mountActions} from './backend/actionRoutes.js';

const {Pool}=pg;
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const PORT=Number(process.env.PORT||10000);
const DATABASE_URL=process.env.DATABASE_URL;

if(!DATABASE_URL){
  console.error('DATABASE_URL fehlt. Hinterlege die Neon-Verbindungszeichenfolge als geheime Umgebungsvariable.');
  process.exit(1);
}

const pool=new Pool({
  connectionString:DATABASE_URL,
  ssl:{rejectUnauthorized:false},
  max:10,
  idleTimeoutMillis:30000,
  connectionTimeoutMillis:10000
});

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'2mb'}));

const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const newToken=()=>crypto.randomBytes(32).toString('hex');

async function initDatabase(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id UUID PRIMARY KEY,
      token_hash TEXT NOT NULL,
      display_name VARCHAR(64),
      game_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS savegames (
      player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
      game_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
      state JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players(last_seen_at DESC);
    ALTER TABLE savegames ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_savegames_updated ON savegames(updated_at DESC);
    CREATE TABLE IF NOT EXISTS gm_requests (
      player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      request_id VARCHAR(80) NOT NULL,
      input TEXT NOT NULL,
      PRIMARY KEY(player_id,request_id)
    );
  `);
}

async function authenticate(req,res,next){
  const id=req.header('x-player-id');
  const auth=req.header('authorization')||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!id||!token)return res.status(401).json({error:'player_auth_required'});
  try{
    const {rows}=await pool.query('SELECT id, token_hash FROM players WHERE id=$1',[id]);
    if(!rows[0])return res.status(401).json({error:'unknown_player'});
    const expected=Buffer.from(rows[0].token_hash,'hex');
    const actual=Buffer.from(sha256(token),'hex');
    if(expected.length!==actual.length||!crypto.timingSafeEqual(expected,actual))return res.status(401).json({error:'invalid_player_token'});
    req.playerId=id;
    await pool.query('UPDATE players SET last_seen_at=NOW() WHERE id=$1',[id]);
    next();
  }catch(error){
    console.error('Auth error:',error);
    res.status(500).json({error:'database_error'});
  }
}

app.get('/api/health',async(_req,res)=>{
  try{await pool.query('SELECT 1');res.json({ok:true,database:true});}
  catch{res.status(503).json({ok:false,database:false});}
});

app.post('/api/player',async(req,res)=>{
  const id=crypto.randomUUID();
  const token=newToken();
  try{
    await pool.query('INSERT INTO players(id,token_hash) VALUES($1,$2)',[id,sha256(token)]);
    res.status(201).json({playerId:id,playerToken:token});
  }catch(error){
    console.error('Create player error:',error);
    res.status(500).json({error:'database_error'});
  }
});

app.get('/api/player',authenticate,async(req,res)=>{
  const {rows}=await pool.query('SELECT id,display_name,game_version,created_at,last_seen_at FROM players WHERE id=$1',[req.playerId]);
  res.json({player:rows[0]});
});

app.get('/api/save',authenticate,async(req,res)=>{
  const {rows}=await pool.query('SELECT game_version,state,updated_at,revision FROM savegames WHERE player_id=$1',[req.playerId]);
  if(!rows[0])return res.status(404).json({error:'no_savegame'});
  res.json({gameVersion:rows[0].game_version,state:rows[0].state,updatedAt:rows[0].updated_at,revision:Number(rows[0].revision||0)});
});

app.put('/api/save',authenticate,async(req,res)=>{
  const state=req.body?.state;
  if(!state||typeof state!=='object'||!state.player)return res.status(400).json({error:'invalid_savegame'});
  const serialized=JSON.stringify(state);
  if(Buffer.byteLength(serialized,'utf8')>1_500_000)return res.status(413).json({error:'savegame_too_large'});
  const displayName=String(state.player?.name||'').trim().slice(0,64)||null;
  const gameVersion=String(state.version||'1.0.0').slice(0,32);
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    await client.query('SELECT id FROM players WHERE id=$1 FOR UPDATE',[req.playerId]);
    const existing=await client.query('SELECT state FROM savegames WHERE player_id=$1',[req.playerId]);
    if(existing.rows[0]?.state?.gameMaster){await client.query('ROLLBACK');return res.status(409).json({error:'server_authoritative_save'});}
    await client.query('UPDATE players SET display_name=$1,game_version=$2,last_seen_at=NOW() WHERE id=$3',[displayName,gameVersion,req.playerId]);
    const saved=await client.query(`
      INSERT INTO savegames(player_id,game_version,state,updated_at,revision)
      VALUES($1,$2,$3::jsonb,NOW(),1)
      ON CONFLICT(player_id) DO UPDATE SET
        game_version=EXCLUDED.game_version,
        state=EXCLUDED.state,
        updated_at=NOW(),
        revision=savegames.revision+1
      RETURNING updated_at,revision
    `,[req.playerId,gameVersion,serialized]);
    await client.query('COMMIT');
    res.json({ok:true,savedAt:saved.rows[0].updated_at,revision:Number(saved.rows[0].revision)});
  }catch(error){
    await client.query('ROLLBACK');
    console.error('Save error:',error);
    res.status(500).json({error:'database_error'});
  }finally{client.release();}
});

mountActions(app,pool,authenticate);
for(const dir of ['browser','core','data'])app.use('/'+dir,express.static(path.join(__dirname,dir)));
app.get('/',(_req,res)=>res.sendFile(path.join(__dirname,'index.html')));

initDatabase().then(()=>{
  app.listen(PORT,'0.0.0.0',()=>console.log(`VOIDBOUND läuft auf Port ${PORT}`));
}).catch(error=>{
  console.error('Datenbankinitialisierung fehlgeschlagen:',error);
  process.exit(1);
});
