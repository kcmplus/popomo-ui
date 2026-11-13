import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/background-layout.js',import.meta.url),'utf8');
const {backgroundRect,constrainBackground}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const model={width:300,height:600};
test('fit preserves entire photo; blur independently covers case',()=>{
 const l={imageWidth:1000,imageHeight:600,x:50,y:50,scale:.5,fit:'blur'};
 const r=backgroundRect(l,model);assert.equal(r.width,150);assert.equal(r.height,90);
 const bg=backgroundRect(l,model,true);assert.ok(bg.width>=300&&bg.height>=600);
});
test('fill constrains dragging and rotation so all case corners remain covered',()=>{
 for(const rotation of [0,15,45,90,180,270])for(const [imageWidth,imageHeight] of [[1000,600],[600,1000],[600,600]]){
 const l={imageWidth,imageHeight,x:95,y:5,scale:1.3,rotation,fit:'cover'};constrainBackground(l,model);const r=backgroundRect(l,model),a=rotation*Math.PI/180;
 for(const [x,y] of [[0,0],[300,0],[0,600],[300,600]]){const dx=x-r.x,dy=y-r.y;assert.ok(Math.abs(Math.cos(a)*dx+Math.sin(a)*dy)<=r.width/2+1e-8);assert.ok(Math.abs(-Math.sin(a)*dx+Math.cos(a)*dy)<=r.height/2+1e-8);}
 }
});
