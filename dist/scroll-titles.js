(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const headings=[...document.querySelectorAll('.v2-hero h1,.studio-title h2,.section-heading h2,.faq h2')];
 const active=new Set();let frame=0,records=[];
 const clamp=n=>Math.max(0,Math.min(1,n));
 function setup(){
  // Read original colors before applying transparent text paint to any element.
  document.querySelectorAll('.scroll-ink').forEach(el=>el.classList.remove('scroll-ink'));
  records=headings.map(heading=>{
   const lines=[...heading.querySelectorAll(':scope > .scroll-title-line')];
   const targets=lines.length?lines:[heading];
   return {heading,hero:heading.matches('h1'),lines:targets.map(line=>({line,pieces:[line,...line.querySelectorAll('span')].map(el=>({el,color:getComputedStyle(el).color}))}))};
  });
  records.forEach(record=>record.lines.forEach(({pieces})=>pieces.forEach(({el,color})=>{
   el.style.setProperty('--ink-color',color);
   el.style.setProperty('--ink-muted','color-mix(in srgb, '+color+' 24%, transparent)');
   el.classList.add('scroll-ink');
  })));
  queue();
 }
 function paint(){
  frame=0;const height=innerHeight,writes=[];
  records.forEach(record=>{
   if(!active.has(record.heading)&&!reduce.matches)return;
   record.lines.forEach(({line,pieces},index)=>{
    const r=line.getBoundingClientRect();
    // Keep the opening message legible, then complete its reveal with the first scroll.
    const progress=reduce.matches?1:record.hero?clamp(.62-index*.18+Math.max(0,scrollY)/180):clamp((height*.9-r.top)/(height*.3));
    const edge=r.left+r.width*progress;
    pieces.forEach(({el})=>{const box=el.getBoundingClientRect();const fill=el===line?progress:clamp((edge-box.left)/Math.max(1,box.width));writes.push([el,(fill*100).toFixed(2)+'%']);});
   });
  });
  writes.forEach(([el,fill])=>{if(el.style.getPropertyValue('--ink-fill')!==fill)el.style.setProperty('--ink-fill',fill);});
 }
 function queue(){if(!frame)frame=requestAnimationFrame(paint);}
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)active.add(e.target);else active.delete(e.target);});queue();},{rootMargin:'80px',threshold:0});
 headings.forEach(heading=>observer.observe(heading));
 setup();window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true});
 reduce.addEventListener('change',queue);window.addEventListener('pageshow',queue);
 // Hero markup is refreshed by the language switch; rebuild paint references afterwards.
 new MutationObserver(setup).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
