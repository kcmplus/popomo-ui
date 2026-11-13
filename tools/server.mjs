import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{try{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let target=path.resolve(root,'.'+rel);if(!target.startsWith(root)){res.writeHead(403);res.end();return;}let info=await stat(target).catch(()=>null);if(info?.isDirectory())target=path.join(target,'index.html');else if(!info&&!path.extname(target))target+='.html';const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404);res.end('Not found');}});
server.listen(0,'127.0.0.1',()=>{const url='http://127.0.0.1:'+server.address().port+'/';console.log('POPOMO V35: '+url+' | Ctrl+C to stop');const command=process.platform==='darwin'?'open':process.platform==='win32'?'rundll32':'xdg-open';const args=process.platform==='win32'?['url.dll,FileProtocolHandler',url]:[url];const child=spawn(command,args,{stdio:'ignore',detached:true});child.on('error',()=>console.log('Open the URL above in your browser.'));child.unref();});
