import {constrainBackground,drawBackground} from './background-layout.js?v=36';

// Work on a copy: cancel never changes the design or consumes an undo step.
export async function openPhotoCrop({layer,model,t,onApply}){
 if(document.querySelector('#photo-crop-dialog'))return;
 const draft=structuredClone(layer);
 const load=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
 const [photo,mask,overlay]=await Promise.all([load(layer.src),load(model.mask),load(model.overlay)]);
 Object.assign(draft,{imageWidth:photo.naturalWidth,imageHeight:photo.naturalHeight,fit:'cover',scale:Math.max(1,layer.scale||1)});
 if(document.querySelector('#photo-crop-dialog'))return;
 const modal=document.createElement('dialog');modal.id='photo-crop-dialog';modal.className='photo-crop-dialog';
 modal.setAttribute('aria-labelledby','photo-crop-title');
 modal.innerHTML=`<header class="photo-crop-head"><div><h2 id="photo-crop-title">${t('裁剪照片','Crop photo')}</h2><p>${t('按手机壳比例取景，拖动或双指缩放','Drag or pinch to frame your photo for this case')}</p></div><button type="button" data-crop-close aria-label="${t('取消裁剪','Cancel crop')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div class="photo-crop-stage"><canvas tabindex="0" role="img" aria-label="${t('裁剪预览，拖动照片或使用方向键调整位置','Crop preview. Drag the photo or use arrow keys to reposition.')}"></canvas></div><div class="photo-crop-controls"><label for="photo-crop-zoom">${t('缩放','Zoom')}</label><input id="photo-crop-zoom" type="range" min="100" max="300" step="1"><output for="photo-crop-zoom"></output><div class="photo-crop-tools"><button type="button" data-crop-rotate>${t('旋转 90°','Rotate 90°')}</button><button type="button" data-crop-reset>${t('重置','Reset')}</button></div></div><footer class="photo-crop-footer"><button type="button" class="secondary" data-crop-cancel>${t('取消','Cancel')}</button><button type="button" class="primary" data-crop-apply>${t('确认裁剪','Apply crop')}</button></footer>`;
 const canvas=modal.querySelector('canvas'),ctx=canvas.getContext('2d'),slider=modal.querySelector('input'),output=modal.querySelector('output');
 canvas.width=model.width;canvas.height=model.height;canvas.style.aspectRatio=model.width+'/'+model.height;
 const focus=document.activeElement;
 (document.fullscreenElement||document.body).append(modal);modal.showModal();
 function paint(){
  constrainBackground(draft,model);ctx.clearRect(0,0,canvas.width,canvas.height);drawBackground(ctx,photo,draft,model);
  ctx.save();ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=Math.max(1,model.width/350);ctx.beginPath();
  for(let i=1;i<3;i++){ctx.moveTo(model.width*i/3,0);ctx.lineTo(model.width*i/3,model.height);ctx.moveTo(0,model.height*i/3);ctx.lineTo(model.width,model.height*i/3);}ctx.stroke();ctx.restore();
  ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0,model.width,model.height);ctx.globalCompositeOperation='source-over';ctx.drawImage(overlay,0,0,model.width,model.height);
  slider.value=Math.round(draft.scale*100);output.value=slider.value+'%';
 }
 const points=new Map();let gesture;
 const measure=()=>{const a=[...points.values()];return {x:a.reduce((sum,p)=>sum+p.x,0)/a.length,y:a.reduce((sum,p)=>sum+p.y,0)/a.length,distance:a.length>1?Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y):0};};
 canvas.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture=measure();};
 canvas.onpointermove=e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=measure(),rect=canvas.getBoundingClientRect();if(next.distance&&gesture.distance)draft.scale=Math.max(1,Math.min(3,draft.scale*next.distance/gesture.distance));draft.x+=(next.x-gesture.x)/rect.width*100;draft.y+=(next.y-gesture.y)/rect.height*100;gesture=next;paint();};
 canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=e=>{points.delete(e.pointerId);gesture=points.size?measure():null;};
 canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?5:1;draft.x+=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;draft.y+=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;paint();};
 slider.oninput=()=>{draft.scale=Number(slider.value)/100;paint();};
 modal.querySelector('[data-crop-rotate]').onclick=()=>{draft.rotation=((draft.rotation||0)+90)%360;draft.x=draft.y=50;paint();};
 modal.querySelector('[data-crop-reset]').onclick=()=>{Object.assign(draft,{x:50,y:50,scale:1,rotation:0});paint();};
 modal.querySelectorAll('[data-crop-cancel],[data-crop-close]').forEach(b=>b.onclick=()=>modal.close());
 modal.querySelector('[data-crop-apply]').onclick=()=>{onApply(draft);modal.close();};
 modal.addEventListener('close',()=>{modal.remove();if(focus?.isConnected)focus.focus({preventScroll:true});},{once:true});
 paint();canvas.focus({preventScroll:true});
}
