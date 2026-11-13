// One placement calculation for the editor, review and exported artwork.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const isBackground=l=>l.origin==='background'||l.id==='photo-background';
export function backgroundRect(layer,model,blur=false){
 const iw=layer.imageWidth||model.width,ih=layer.imageHeight||model.height;
 const fit=blur||!['contain','blur'].includes(layer.fit)?Math.max:Math.min;
 const angle=(blur?0:layer.rotation||0)*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
 const factor=(fit===Math.max?Math.max((model.width*c+model.height*s)/iw,(model.width*s+model.height*c)/ih):fit(model.width/iw,model.height/ih))*(blur?1.12:(layer.scale||1));
 return {width:iw*factor,height:ih*factor,x:(blur?50:layer.x??50)/100*model.width,y:(blur?50:layer.y??50)/100*model.height,rotation:blur?0:layer.rotation||0};
}
export function constrainBackground(layer,model){
 if(['contain','blur'].includes(layer.fit))return;
 layer.scale=Math.max(1,layer.scale||1);
 const r=backgroundRect(layer,model),a=r.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const mx=Math.max(0,(r.width-Math.abs(c)*model.width-Math.abs(s)*model.height)/2),my=Math.max(0,(r.height-Math.abs(s)*model.width-Math.abs(c)*model.height)/2);
 const dx=r.x-model.width/2,dy=r.y-model.height/2;
 const u=Math.max(-mx,Math.min(mx,c*dx+s*dy)),v=Math.max(-my,Math.min(my,-s*dx+c*dy));
 layer.x=50+(c*u-s*v)/model.width*100;layer.y=50+(s*u+c*v)/model.height*100;
}
export function backgroundMarkup(layer,model,interactive=false,label='Background'){
 const rect=backgroundRect(layer,model);
 const style=r=>`position:absolute;max-width:none;width:${r.width/model.width*100}%;height:${r.height/model.height*100}%;left:${r.x/model.width*100}%;top:${r.y/model.height*100}%;transform:translate(-50%,-50%) rotate(${r.rotation}deg);object-fit:fill;pointer-events:none`;
 const image=(r,blur=false)=>`<img src="${esc(layer.src)}" draggable="false" alt="" style="${style(r)}${blur?`;filter:blur(3.5cqw)` : ''}" ${blur?'class="background-blur"':''}>`;
 return `<div class="background-frame" ${interactive?`data-object="${esc(layer.id)}" role="button" tabindex="0" aria-label="${esc(label)}"`:''} style="position:absolute;inset:0;overflow:hidden;container-type:size;touch-action:none;cursor:grab">${layer.fit==='blur'?image(backgroundRect(layer,model,true),true):''}${image(rect)}</div>`;
}
export function drawBackground(ctx,image,layer,model){
 const resolved={...layer,imageWidth:image.naturalWidth||image.width,imageHeight:image.naturalHeight||image.height};
 function paint(blur){const r=backgroundRect(resolved,model,blur);ctx.save();if(blur)ctx.filter=`blur(${model.width*.035}px)`;ctx.translate(r.x,r.y);ctx.rotate(r.rotation*Math.PI/180);ctx.drawImage(image,-r.width/2,-r.height/2,r.width,r.height);ctx.restore();}
 if(layer.fit==='blur')paint(true);paint(false);
}
