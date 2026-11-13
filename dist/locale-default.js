(()=>{
 const valid=value=>value==='en'||value==='zh';
 const requested=new URLSearchParams(location.search).get('lang');
 let saved;try{saved=localStorage.getItem('popomo-language');}catch{}
 let language=valid(requested)?requested:valid(saved)?saved:'en';
 const listeners=new Set();
 const sync=()=>{
  const root=document.documentElement;
  const htmlLang=language==='zh'?'zh-CN':'en';
  if(root.lang!==htmlLang)root.lang=htmlLang;
  root.dataset.language=language;
  document.querySelectorAll('#language-select,#flow-language').forEach(select=>{select.value=language;});
  document.querySelectorAll('[data-site-zh][data-site-en]').forEach(el=>{
   const text=el.dataset[language==='en'?'siteEn':'siteZh'];
   if(el.textContent!==text)el.textContent=text;
  });
 };
 const set=value=>{
  if(!valid(value))return;
  const changed=language!==value;
  language=value;
  try{localStorage.setItem('popomo-language',language);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',language);
  try{history.replaceState(history.state,'',url);}catch{}
  sync();
  if(changed)listeners.forEach(listener=>listener(language));
 };
 // Page renderers read this state; only a user's selection changes it.
 window.PopomoLocale={get:()=>language,set,sync,subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}};
 sync();
 const selectLanguage=e=>{if(e.target.matches?.('#language-select,#flow-language'))set(e.target.value);};
 document.addEventListener('input',selectLanguage,true);
 document.addEventListener('change',selectLanguage,true);
 // The mobile menu works even before its deferred page module has loaded.
 document.addEventListener('click',e=>{const button=e.target.closest?.('[data-mn-lang]');if(button)set(button.dataset.mnLang);},true);
 document.addEventListener('DOMContentLoaded',sync,{once:true});
 window.addEventListener('pageshow',sync);
})();
