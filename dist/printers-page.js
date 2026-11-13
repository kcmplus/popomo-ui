import {mountPrinterList} from './printers.js?v=37';
let lang=window.PopomoLocale.get();
function render(){lang=window.PopomoLocale.get();document.documentElement.lang=lang==='en'?'en':'zh-CN';document.querySelector('#flow-language').value=lang;document.title=lang==='en'?'POPOMO · Print locations':'POPOMO · 打印设备';document.querySelector('#printers-main').innerHTML=`<div class="printers-page-heading"><p>FIND YOUR PRINT SPOT</p><h1>${lang==='en'?'Your next stop. Your new case.':'在纽约，找到你的打印点。'}</h1><span>${lang==='en'?'Choose your location, find a printer, and open directions.':'定位或选择区域，查看设备坐标并开启导航。'}</span></div><div id="printer-directory"></div>`;mountPrinterList(document.querySelector('#printer-directory'));}render();

window.PopomoLocale.subscribe(()=>render());
