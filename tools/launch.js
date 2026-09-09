import {server} from './preview.js';
import {spawn} from 'node:child_process';
const port=Number(process.env.PORT||8012),url='http://127.0.0.1:'+port;
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port '+port+' ist bereits belegt. Schließe das andere VOIDBOUND-Startfenster und starte erneut.':error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
 console.log('VOIDBOUND · Das letzte Licht\n'+url+'\nDieses Fenster geöffnet lassen.');
 if(process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'}).on('error',()=>console.log('Bitte die Adresse im Browser öffnen.'));
});
