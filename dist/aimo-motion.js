(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.querySelector('.v2-hero'),stage=document.querySelector('.v2-fan'),cards=[...stage.querySelectorAll('.fan-case')];
 let progress=2,visible=true,hover=false,focused=false,drag=null,blockedClick=false,autoStart=0,autoBase=2,autoRunning=false,autoTimer=0,settleTimer=0,semanticsTimer=0,dragFrame=0,resizeFrame=0,transition=null,galleryEffects=[],orbitEffects=[],pageActive=true;
 const duration=cards.length*12000;
 const settings=()=>innerWidth<=760?{w:142,rx:385,ry:210,step:.43,limit:2.25}:{w:210,rx:650,ry:320,step:.36,limit:3.3};
 const ease=t=>1-Math.pow(1-t,3);
 function current(){if(autoRunning)return autoBase+(performance.now()-autoStart)/12000;if(transition){const t=Math.min(1,(performance.now()-transition.start)/transition.duration);return transition.from+(transition.to-transition.from)*ease(t);}return progress;}
 function state(index,value,cfg){const count=cards.length,position=((index-value+count*1000+count/2)%count)-count/2,angle=position*cfg.step;return{transform:`translate3d(${(Math.sin(angle)*cfg.rx-cfg.w/2).toFixed(2)}px,${((1-Math.cos(angle))*cfg.ry).toFixed(2)}px,0) rotate(${(angle*180/Math.PI*.66).toFixed(2)}deg)`,opacity:Math.max(0,Math.min(1,(cfg.limit-Math.abs(position))*2))};}
 function semantics(card,shown){if(card.dataset.inView===String(shown))return;card.dataset.inView=String(shown);card.tabIndex=shown?0:-1;card.setAttribute('aria-hidden',String(!shown));card.style.pointerEvents=shown?'':'none';}
 function layout(value=progress){const cfg=settings();cards.forEach((card,i)=>{const s=state(i,value,cfg);card.style.transform=s.transform;card.style.opacity=String(s.opacity);semantics(card,s.opacity>.01);});}
 function cancelEffects(){galleryEffects.forEach(effect=>effect.cancel());galleryEffects=[];}
 function freeze(){const value=current();clearTimeout(autoTimer);clearTimeout(settleTimer);clearTimeout(semanticsTimer);autoTimer=settleTimer=semanticsTimer=0;autoRunning=false;transition=null;cancelEffects();progress=((value%cards.length)+cards.length)%cards.length;layout();}
 function allowed(){return pageActive&&visible&&!document.hidden&&!reduce.matches&&!hover&&!focused&&!drag&&!document.querySelector('dialog[open],.mn-drawer[open]');}
 function startAuto(){autoTimer=0;if(!allowed()||autoRunning||transition)return;const cfg=settings();autoBase=progress;autoStart=performance.now();autoRunning=true;
  cards.forEach((card,i)=>{const frames=Array.from({length:241},(_,n)=>({...state(i,autoBase+cards.length*n/240,cfg),offset:n/240}));galleryEffects.push(card.animate(frames,{duration,iterations:Infinity,easing:'linear'}));});
  function updateSemantics(){if(!autoRunning)return;const cfg=settings(),value=current();cards.forEach((card,i)=>semantics(card,state(i,value,cfg).opacity>.01));semanticsTimer=setTimeout(updateSemantics,1000);}updateSemantics();
 }
 function schedule(delay=900){clearTimeout(autoTimer);autoTimer=0;if(allowed())autoTimer=setTimeout(startAuto,delay);}
 function moveTo(value){const from=current();freeze();const to=value;progress=to;layout(to);if(reduce.matches){schedule();return;}const cfg=settings(),ms=520;transition={from,to,start:performance.now(),duration:ms};cards.forEach((card,i)=>{const frames=Array.from({length:19},(_,n)=>({...state(i,from+(to-from)*ease(n/18),cfg),offset:n/18}));if(frames.some(s=>s.opacity>0))galleryEffects.push(card.animate(frames,{duration:ms,easing:'linear'}));});settleTimer=setTimeout(()=>{transition=null;cancelEffects();progress=((to%cards.length)+cards.length)%cards.length;layout();schedule(2800);},ms+20);}
 function nudge(direction){const target=Math.round(current())+direction;moveTo(target);}
 stage.querySelector('[data-fan-prev]').addEventListener('click',()=>nudge(-1));stage.querySelector('[data-fan-next]').addEventListener('click',()=>nudge(1));
 stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;freeze();}});stage.addEventListener('pointerleave',()=>{hover=false;schedule();});
 stage.addEventListener('focusin',()=>{focused=true;freeze();});stage.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=stage.contains(document.activeElement);schedule();});});
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('.fan-controls'))return;freeze();drag={x:e.clientX,y:e.clientY,initial:progress,horizontal:false,id:e.pointerId};blockedClick=false;});
 stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.horizontal){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;schedule();return;}if(Math.abs(dx)<8)return;drag.horizontal=true;blockedClick=true;stage.setPointerCapture(e.pointerId);stage.classList.add('is-dragging');}e.preventDefault();progress=drag.initial-dx/(innerWidth<=760?150:220);if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;layout();});},{passive:false});
 function release(e){if(!drag)return;const moved=drag.horizontal;drag=null;stage.classList.remove('is-dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(dragFrame){cancelAnimationFrame(dragFrame);dragFrame=0;}if(moved)moveTo(Math.round(progress));else schedule();}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('click',e=>{if(blockedClick&&!e.target.closest('.fan-controls')){e.preventDefault();e.stopImmediatePropagation();blockedClick=false;}},true);
 stage.addEventListener('keydown',e=>{if(!e.target.matches('.fan-case'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();nudge(e.key==='ArrowRight'?1:-1);}});
 // Precompute the orbital path once. Only transform/opacity animate; no per-frame DOM writes.
 function buildOrbit(){orbitEffects.forEach(effect=>effect.cancel());orbitEffects=[];const orbit=hero.querySelector('.hero-orbit'),w=orbit.clientWidth,h=orbit.clientHeight;[...orbit.children].forEach((dot,i)=>{const r=dot.offsetWidth/2,frames=Array.from({length:97},(_,n)=>{const angle=n/96*Math.PI*2+i*Math.PI*2/3;return{transform:`translate3d(${(w/2+Math.cos(angle)*w/2-r).toFixed(2)}px,${(h/2+Math.sin(angle)*h/2-r).toFixed(2)}px,0)`};});dot.style.transform=frames[0].transform;if(!reduce.matches)orbitEffects.push(dot.animate(frames,{duration:24000,iterations:Infinity,easing:'linear'}));});syncOrbit();}
 function syncOrbit(){const paused=!pageActive||!visible||document.hidden||reduce.matches||!!document.querySelector('dialog[open],.mn-drawer[open]');hero.classList.toggle('is-motion-paused',paused);orbitEffects.forEach(effect=>paused?effect.pause():effect.play());}
 function sync(){freeze();syncOrbit();schedule();}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(hero);
 document.addEventListener('visibilitychange',sync);new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('resize',()=>{if(resizeFrame)return;resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;freeze();buildOrbit();schedule();});},{passive:true});
 reduce.addEventListener('change',()=>{freeze();buildOrbit();schedule();if(reduce.matches)document.querySelectorAll('.aimo-waiting').forEach(el=>el.classList.add('aimo-visible'));});
 const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('aimo-visible');reveals.unobserve(e.target);}}),{threshold:.1});
 document.querySelectorAll('.studio-copy,.collection-toolbar,.design-card,.faq-list').forEach(el=>{if(!reduce.matches&&el.getBoundingClientRect().top>innerHeight){el.classList.add('aimo-waiting');reveals.observe(el);}});
 document.addEventListener('focusin',e=>e.target.closest('.aimo-waiting')?.classList.add('aimo-visible'));
 const aiSection=document.querySelector('.v2-ai');
 if(aiSection){
  const title=aiSection.querySelector('.ai-scroll-title'),lines=[...title.querySelectorAll('.ai-reveal-line')],flower=aiSection.querySelector('.ai-scroll-rosette');
  let aiVisible=false,aiFrame=0;
  const clamp=x=>Math.max(0,Math.min(1,x));
  function paintAI(){
   aiFrame=0;if(!aiVisible&&!reduce.matches)return;
   const box=aiSection.getBoundingClientRect(),height=innerHeight;
   const turn=(height-box.top)/(height+box.height);
   flower.style.transform='rotate('+(reduce.matches?0:turn*320)+'deg)';
   lines.forEach((line,i)=>{
    const r=line.getBoundingClientRect();
    const fill=reduce.matches?1:clamp((height*.88-r.top)/(height*.28));
    line.style.setProperty('--reveal-fill',(fill*100).toFixed(2)+'%');
   });
  }
  function queueAI(){if(!aiFrame&&(aiVisible||reduce.matches))aiFrame=requestAnimationFrame(paintAI);}
  new IntersectionObserver(entries=>{aiVisible=entries[0].isIntersecting;aiSection.classList.toggle('is-motion-paused',!aiVisible);if(aiVisible)queueAI();},{threshold:0}).observe(aiSection);
  window.addEventListener('scroll',queueAI,{passive:true});
  window.addEventListener('resize',queueAI,{passive:true});
  reduce.addEventListener('change',queueAI);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueAI();});
  new MutationObserver(queueAI).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  queueAI();
 }
 window.addEventListener('pagehide',()=>{pageActive=false;freeze();orbitEffects.forEach(effect=>effect.pause());});window.addEventListener('pageshow',e=>{if(e.persisted){pageActive=true;sync();}});
 layout();buildOrbit();schedule(1500);
})();
