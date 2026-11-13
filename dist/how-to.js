let lang='en';try{lang=localStorage.getItem('popomo-language')==='zh'?'zh':'en';}catch{}
function translate(){document.documentElement.lang=lang==='en'?'en':'zh-CN';document.title=(lang==='en'?'How to use':'使用教程')+' · POPOMO';document.querySelector('#flow-language').value=lang;document.querySelectorAll('[data-guide-en]').forEach(e=>e.textContent=e.dataset[lang==='en'?'guideEn':'guideZh']);}
document.querySelector('#flow-language').onchange=e=>{lang=e.target.value;try{localStorage.setItem('popomo-language',lang);}catch{}translate();};translate();
