import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/locale-default.js',import.meta.url),'utf8');
function boot({saved='zh',query='',blocked=false}={}){
 const events={},windowEvents={},storage=new Map([['popomo-language',saved]]),select={value:'zh'},label={dataset:{siteZh:'首页',siteEn:'Home'},textContent:'首页'};
 const document={documentElement:{lang:'en',dataset:{}},querySelectorAll:selector=>selector.includes('data-site')?[label]:[select],addEventListener:(type,fn)=>events[type]=fn};
 const location={href:'https://example.com/'+query,search:query};
 const history={state:{draft:'kept'},replaceState(state,unused,url){this.state=state;location.href=String(url);}};
 const window={addEventListener:(type,fn)=>windowEvents[type]=fn};
 const localStorage={getItem:key=>{if(blocked)throw Error('disabled');return storage.get(key);},setItem:(key,value)=>{if(blocked)throw Error('disabled');storage.set(key,value);}};
 vm.runInNewContext(source,{window,document,location,history,localStorage,URL,URLSearchParams,Set});
 return {api:window.PopomoLocale,document,select,label,location,history,storage,events,windowEvents,choose(value,type='input'){select.value=value;events[type]({target:{matches:()=>true,value}});}};
}
test('early user choice survives deferred initialization and form restoration',()=>{
 const page=boot();let renders=0;page.api.subscribe(()=>renders++);
 page.choose('en');page.select.value='zh';page.events.DOMContentLoaded();page.windowEvents.pageshow();
 assert.equal(page.api.get(),'en');assert.equal(page.select.value,'en');assert.equal(page.label.textContent,'Home');assert.equal(page.document.documentElement.lang,'en');assert.equal(page.storage.get('popomo-language'),'en');
 assert.equal(new URL(page.location.href).searchParams.get('lang'),'en');assert.equal(page.history.state.draft,'kept');
 page.choose('en','change');assert.equal(renders,1,'input and change must not rebuild the editor twice');
});
test('language remains in memory when browser storage is unavailable',()=>{
 const page=boot({blocked:true});page.choose('zh');page.events.DOMContentLoaded();assert.equal(page.api.get(),'zh');assert.equal(page.label.textContent,'首页');page.choose('en');assert.equal(page.api.get(),'en');
});
test('explicit URL language is honored, then the next user choice wins',()=>{
 const page=boot({query:'?lang=en&entry=design#review'});assert.equal(page.api.get(),'en');page.choose('zh');assert.equal(page.api.get(),'zh');const url=new URL(page.location.href);assert.equal(url.searchParams.get('entry'),'design');assert.equal(url.hash,'#review');assert.equal(url.searchParams.get('lang'),'zh');
});
