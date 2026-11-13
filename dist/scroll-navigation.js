(()=>{
 const header=document.querySelector('.site-header'),topbar=document.querySelector('.aimo-topbar');
 if(!header)return;
 const shell=document.createElement('div'),space=document.createElement('div');
 shell.className='aimo-nav-shell';space.className='aimo-nav-spacer';space.setAttribute('aria-hidden','true');
 (topbar||header).before(shell);if(topbar)shell.append(topbar);shell.append(header);shell.after(space);
 let floating=false,hidden=false,last=Math.max(0,scrollY),anchor=last,frame=0,threshold=220,reserved=0;
 function measure(){
  if(floating)return;
  const r=header.getBoundingClientRect(),first=topbar&&getComputedStyle(topbar).display!=='none'?topbar:header;
  threshold=Math.max(100,r.bottom+scrollY+20);
  const style=getComputedStyle(header);
  reserved=document.body.classList.contains('home-page')?0:r.bottom-first.getBoundingClientRect().top+parseFloat(style.marginBottom||0)+parseFloat(getComputedStyle(first).marginTop||0);
 }
 function show(value){if(hidden===!value)return;hidden=!value;shell.classList.toggle('nav-hidden',hidden);shell.inert=hidden;}
 function update(){
  frame=0;const y=Math.max(0,scrollY),delta=y-last;
  if(y<=24){floating=false;shell.classList.remove('nav-floating','nav-hidden');shell.inert=false;hidden=false;space.style.height='0px';anchor=y;}
  else{
   if(!floating&&y>threshold){measure();floating=true;space.style.height=reserved+'px';shell.classList.add('nav-floating');show(false);anchor=y;}
   if(floating){
    if(document.querySelector('dialog[open]')||shell.contains(document.activeElement)){show(true);anchor=y;}
    else if(Math.abs(y-anchor)>=8){show(delta<0);anchor=y;}
   }
  }
  last=y;
 }
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 measure();window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',()=>{measure();queue();},{passive:true});
 shell.addEventListener('focusin',()=>show(true));window.addEventListener('pageshow',queue);queue();
})();
