const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const hoverPointer=matchMedia('(hover: hover) and (pointer: fine)');
// Keep the full heading accessible while its visual letters appear in sequence.
const headline=document.querySelector('.hero-copy h1');
if(!headline.hasAttribute('aria-label'))headline.setAttribute('aria-label',headline.textContent.trim());
const titleNodes=[];
const walker=document.createTreeWalker(headline,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('svg')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
while(walker.nextNode())titleNodes.push(walker.currentNode);
const titleLetters=[];
titleNodes.forEach(node=>{const fragment=document.createDocumentFragment();for(const character of Array.from(node.textContent)){const letter=document.createElement('span');letter.className='title-char';letter.textContent=character;letter.setAttribute('aria-hidden','true');fragment.append(letter);titleLetters.push(letter);}node.replaceWith(fragment);});
headline.classList.add('has-letter-motion');
let titlePlayed=false;let titleAnimations=[];
function playTitle(){if(titlePlayed)return;titlePlayed=true;if(reduceMotion.matches)return;titleAnimations=titleLetters.map((letter,i)=>letter.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,delay:100+i*Math.min(85,900/titleLetters.length),easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}));}
const arrow=document.querySelector('.draw-arrow .arrow-play');
const arrowLine=arrow.querySelector('.arrow-line'),arrowTip=arrow.querySelector('.arrow-tip');
let arrowAnimations=[];
function playArrow(){arrowAnimations.forEach(a=>a.cancel());arrowAnimations=[];if(reduceMotion.matches)return;
 arrowAnimations.push(arrowLine.animate([{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:650,easing:'ease-in-out',fill:'backwards'}));
 arrowAnimations.push(arrowTip.animate([{opacity:0,strokeDasharray:'1',strokeDashoffset:1},{opacity:1,strokeDasharray:'1',strokeDashoffset:0}],{duration:230,delay:490,easing:'ease-out',fill:'backwards'}));
 arrowAnimations.push(arrow.animate([{transform:'translate(0,0) rotate(0deg)'},{transform:'translate(4px,2px) rotate(5deg)',offset:.35},{transform:'translate(-1px,-1px) rotate(-2deg)',offset:.7},{transform:'translate(0,0) rotate(0deg)'}],{duration:600,delay:650,easing:'ease-in-out'}));
}
if('IntersectionObserver' in window){const heroObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(entry.target===headline)playTitle();else playArrow();heroObserver.unobserve(entry.target);}}),{threshold:.25});heroObserver.observe(headline);heroObserver.observe(document.querySelector('.draw-arrow'));}else{playTitle();playArrow();}
reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches){titleAnimations.forEach(a=>a.cancel());arrowAnimations.forEach(a=>a.cancel());}});
const motionJobs=new WeakMap();
function playMotion(el,frames,options){motionJobs.get(el)?.cancel();if(reduceMotion.matches||!el.animate)return;const animation=el.animate(frames,options);motionJobs.set(el,animation);}

// Reveal below-fold sections once; keyboard focus always makes them visible.
let revealObserver;
function reveal(el){el.classList.remove('reveal-wait');el.classList.add('reveal-in');revealObserver?.unobserve(el);}
if(!reduceMotion.matches&&'IntersectionObserver' in window){
 revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)reveal(entry.target);}),{threshold:.06});
 document.querySelectorAll('.quick-steps,.collection .section-heading,.collection-toolbar,.design-card,.how-inner>div,.faq>div').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-wait');revealObserver.observe(el);}});
}
document.addEventListener('focusin',e=>{const el=e.target.closest('.reveal-wait');if(el)reveal(el);});
reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches){document.querySelectorAll('.reveal-wait').forEach(reveal);motionJobs.get(document.querySelector('#draft-count'))?.cancel();resetScene();}});

// Small depth feedback only while a desktop pointer interacts with the scene.
const scene=document.querySelector('.hero-art');let sceneFrame=0,sceneX=0,sceneY=0,sceneBounds;
function resetScene(){cancelAnimationFrame(sceneFrame);sceneFrame=0;scene.style.setProperty('--photo-x','0px');scene.style.setProperty('--photo-y','0px');scene.style.setProperty('--phone-x','0px');scene.style.setProperty('--phone-y','0px');scene.style.setProperty('--phone-angle','12deg');}
scene.addEventListener('pointerenter',()=>{sceneBounds=scene.getBoundingClientRect();});
scene.addEventListener('pointermove',e=>{if(reduceMotion.matches||!hoverPointer.matches||e.pointerType==='touch')return;const r=sceneBounds||scene.getBoundingClientRect();sceneX=(e.clientX-r.left)/r.width-.5;sceneY=(e.clientY-r.top)/r.height-.5;if(sceneFrame)return;sceneFrame=requestAnimationFrame(()=>{scene.style.setProperty('--photo-x',`${sceneX*-8}px`);scene.style.setProperty('--photo-y',`${sceneY*-6}px`);scene.style.setProperty('--phone-x',`${sceneX*12}px`);scene.style.setProperty('--phone-y',`${sceneY*8}px`);scene.style.setProperty('--phone-angle',`${12+sceneX*3}deg`);sceneFrame=0;});});
scene.addEventListener('pointerleave',resetScene);scene.addEventListener('pointercancel',resetScene);window.addEventListener('blur',resetScene);
let lastArrowReplay=0;
function replayArrow(){const now=performance.now();if(now-lastArrowReplay<1400)return;lastArrowReplay=now;playArrow();}
scene.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&hoverPointer.matches)replayArrow();});
scene.addEventListener('focusin',replayArrow);
scene.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&!e.target.closest('button'))replayArrow();});


// The existing upload validator also handles files dropped onto the scene.
let dragDepth=0;
scene.addEventListener('dragenter',e=>{if(!Array.from(e.dataTransfer.types).includes('Files'))return;e.preventDefault();dragDepth++;scene.classList.add('is-dragover');});
scene.addEventListener('dragover',e=>{if(!Array.from(e.dataTransfer.types).includes('Files'))return;e.preventDefault();e.dataTransfer.dropEffect='copy';});
scene.addEventListener('dragleave',()=>{dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)scene.classList.remove('is-dragover');});
scene.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;scene.classList.remove('is-dragover');const file=e.dataTransfer.files[0];if(file)loadPhoto(file);});

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.design-card:not([hidden])').forEach((card,i)=>{reveal(card);playMotion(card,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,delay:i*35,easing:'ease-out'});});}));
document.querySelector('#reset-preview').addEventListener('click',()=>{zoom.value=100;position.value=50;adjust();playMotion(document.querySelector('.preview-phone'),[{transform:'scale(.98)'},{transform:'scale(1)'}],{duration:200,easing:'ease-out'});});
document.querySelector('#save-draft').addEventListener('click',()=>{playMotion(document.querySelector('#draft-count'),[{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:350,easing:'ease-out'});});
document.querySelectorAll('.faq details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)playMotion(item.querySelector('p'),[{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});}));
