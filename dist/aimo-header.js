const dialog=document.querySelector('#aimo-contact-dialog');
const en=()=>document.documentElement.lang.startsWith('en');
function syncContact(){dialog?.querySelectorAll('[data-site-en]').forEach(el=>el.textContent=el.dataset[en()?'siteEn':'siteZh']);dialog?.querySelector('[data-contact-close]')?.setAttribute('aria-label',en()?'Close':'关闭');}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{syncContact();dialog.showModal();}));
dialog?.querySelector('[data-contact-close]')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
new MutationObserver(syncContact).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});syncContact();
const paths={
 '↗':'<path d="M5 19 19 5M5 5h14v14"/>',
 '→':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 '←':'<path d="M20 12H4m6-6-6 6 6 6"/>',
 '✳':'<path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>',
 '✦':'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>'
};
function normalizeIcons(){document.querySelectorAll('.mn-links i,.v2-entries i,.hero-flow-arrow,.fan-spark,.ai-spark,.card-arrow,.studio-tutorial b,.fan-controls button,.v2-kicker>span,.v2-ai .btn>span').forEach(el=>{if(el.querySelector('svg'))return;const path=paths[el.textContent.trim()];if(!path)return;el.innerHTML=`<svg class="aimo-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;});}
normalizeIcons();
