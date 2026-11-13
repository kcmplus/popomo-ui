from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os,webbrowser
os.chdir(str(Path(__file__).resolve().parent.parent/'dist'))
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  from urllib.parse import urlsplit
  path=urlsplit(self.path).path
  if not Path('.'+path).exists() and Path('.'+path+'.html').is_file():
   self.path=self.path.replace(path,path+'.html',1)
  super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
url='http://127.0.0.1:'+str(server.server_port)+'/'
print('POPOMO V35: '+url+' | Ctrl+C to stop',flush=True)
webbrowser.open(url)
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
