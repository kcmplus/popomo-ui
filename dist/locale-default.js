(()=>{
 const requested=new URLSearchParams(location.search).get('lang');
 let language=requested==='zh'?'zh':'en';
 try{
  // The old default was saved automatically; migrate it once to the new default.
  if(localStorage.getItem('popomo-locale-default')==='en-1'&&!['en','zh'].includes(requested))language=localStorage.getItem('popomo-language')==='zh'?'zh':'en';
  localStorage.setItem('popomo-locale-default','en-1');
  localStorage.setItem('popomo-language',language);
 }catch{}
 document.documentElement.lang=language==='en'?'en':'zh-CN';
 document.documentElement.dataset.language=language;
})();
