let lang=window.PopomoLocale.get();
function translate(){lang=window.PopomoLocale.get();document.documentElement.lang=lang==='en'?'en':'zh-CN';document.title=(lang==='en'?'How to use':'使用教程')+' · POPOMO';document.querySelector('#flow-language').value=lang;document.querySelectorAll('[data-guide-en]').forEach(e=>e.textContent=e.dataset[lang==='en'?'guideEn':'guideZh']);}
translate();

window.PopomoLocale.subscribe(()=>translate());
