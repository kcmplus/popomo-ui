import {mountPhoneSelector,phoneColor} from './phone-models.js?v=13b';
const text=(zh,en)=>document.documentElement.lang.startsWith('en')?en:zh;
let catalog,chosenModel=null,chosenColor='blue',pendingAction=null;
const catalogPromise=fetch('./flow-assets/data.json').then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(v=>catalog=v);
const chooser=document.createElement('dialog');chooser.className='home-model-dialog';document.body.append(chooser);
async function photoData(file){if(!file)return '';if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('photo');const image=await createImageBitmap(file),scale=Math.min(1,1400/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);image.close();return canvas.toDataURL('image/jpeg',.9);}
async function goDesign(action){
 const source=action.type||action.source||'template';
 const entry={...action,id:crypto.randomUUID(),model:chosenModel.name,phoneColor:chosenColor,source,template:action.template||['bloom','type','abstract','sunset'][action.index]||'bloom',launchSource:action.designId?null:source};
 delete entry.file;delete entry.type;
 if(action.file)entry.image=await photoData(action.file);
 sessionStorage.setItem('popomo-design-entry',JSON.stringify(entry));
 location.href='./customize.html?entry='+encodeURIComponent(entry.id)+'#design';
}
function drawModels(){
 chooser.setAttribute('aria-label',text('选择机型与颜色','Choose your phone & color'));
 chooser.innerHTML=`<header class="home-model-head"><div><p>YOUR PERFECT FIT</p><h2>${text('选择你的机型与颜色','Choose your phone & color')}</h2></div><button data-home-model-close aria-label="${text('关闭','Close')}">×</button></header><div class="home-phone-selector"></div><div class="home-model-footer"><span data-phone-summary>${chosenModel?.name||text('请选择机型','Choose a model')}</span><button class="btn primary" data-home-model-next ${chosenModel?'':'disabled'}>${text('开始设计','Start designing')} →</button></div>`;
 mountPhoneSelector(chooser.querySelector('.home-phone-selector'),{models:catalog.models,value:chosenModel?.name,color:chosenColor,t:text,onChange:(m,c)=>{chosenModel=m;chosenColor=c;chooser.querySelector('[data-phone-summary]').textContent=m.name+' · '+text(phoneColor(c).zh,phoneColor(c).en);chooser.querySelector('[data-home-model-next]').disabled=false;}});
 chooser.querySelector('[data-home-model-close]').onclick=()=>chooser.close();
 chooser.querySelector('[data-home-model-next]').onclick=async e=>{if(!chosenModel)return;e.currentTarget.disabled=true;try{await goDesign(pendingAction);}catch{chooser.querySelector('[data-home-model-next]').disabled=false;window.popomoHome.notify(text('暂时无法打开，请重试','Unable to open. Please retry.'));}};
}
async function start(action){pendingAction=action;try{await catalogPromise;drawModels();chooser.showModal();}catch{window.popomoHome.notify(text('机型暂时无法加载，请重试','Phone models could not load. Please retry.'));}}
window.addEventListener('popomo-start',event=>start(event.detail));
document.querySelectorAll('[data-home-ai]').forEach(button=>button.addEventListener('click',()=>start({type:'ai'})));
document.querySelector('.v2-entries a[href="#collection"]')?.addEventListener('click',e=>{e.preventDefault();start({type:'template'});});
window.addEventListener('popomo-open-saved',async event=>{await catalogPromise;const design=event.detail;chosenColor=design.phoneColor||design.flowState?.phoneColor||'blue';chosenModel=catalog.models.find(m=>m.name===design.model)||catalog.models[0];await goDesign({...design,designId:design.id,type:design.source,launchSource:null});});
