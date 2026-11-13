import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const base=process.cwd();
const output=path.join(base,'v48','tests','screenshots');
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:920},deviceScaleFactor:1});
const errs=[];
page.on('pageerror',e=>errs.push(e.message));
page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const uri=pathToFileURL(path.join(base,'v48','index.html')).href;
const snap=async name=>{await page.locator('.storybook-shell').screenshot({path:path.join(output,name+'.png'),animations:'disabled'})};

try {
 await page.goto(uri,{waitUntil:'domcontentloaded'});
 await page.locator('.home-hero').waitFor({timeout:15000});
 await page.locator('.navitem[data-page="universe"]').click();
 await page.locator('[data-book-stage="knowledge"]').waitFor();
 const knowledge=['经典星云图','知识生长树','知识进化阶梯','知识地铁图','知识关系网络','知识变形实验室','知识技能树'];
 for(let i=0;i<knowledge.length;i++){
   await page.locator('[data-action="story-goto"][data-id="knowledge:'+i+'"]').click();
   assert.equal((await page.locator('.storybook-heading h2').textContent()).trim(),knowledge[i]);
   await page.locator('.storybook-illustration svg').waitFor();
   await snap('knowledge-'+String(i+1).padStart(2,'0'));
 }
 // Real mathematical input, not a simulated answer
 await page.locator('#storyLabRange').waitFor({state:'detached'}).catch(()=>{});
 await page.locator('[data-action="story-goto"][data-id="knowledge:5"]').click();
 const range=page.locator('#storyLabRange');
 await range.evaluate(el=>{el.value='7';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal((await page.locator('#storyLabLeft').textContent()).trim(),'28');
 assert.match(await page.locator('#storyLabEquation').textContent(),/4 × 7/);
 // Swipe left across the heading; should turn one page without changing route.
 await page.locator('[data-action="story-goto"][data-id="knowledge:1"]').click();
 await page.evaluate(()=>{window.__gestures=[];for(const t of ['pointerdown','pointerup','mousedown','mouseup','pointercancel'])document.addEventListener(t,e=>window.__gestures.push({t,target:e.target.tagName,closest:e.target.closest('[data-book-stage]')?.dataset.bookStage||null,x:e.clientX,y:e.clientY}),true);});
 const box=await page.locator('.storybook-heading').boundingBox();
 await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5);
 await page.mouse.down();
 await page.mouse.move(box.x+box.width*.15,box.y+box.height*.5,{steps:10});
 await page.mouse.up();
 console.log('SWIPE DEBUG',JSON.stringify(await page.evaluate(()=>({events:window.__gestures,current:document.querySelector('.storybook-heading h2')?.textContent}))));
 assert.match(await page.locator('.storybook-heading h2').textContent(),/知识进化阶梯/);

 await page.locator('.navitem[data-page="abilities"]').click();
 await page.locator('[data-action="ability"]').first().click();
 const abilities=['能力跨栏赛道','能力进化树','能力挑战岛','思维变形实验室','迁移冒险地图','能力成长时间轴'];
 for(let i=0;i<abilities.length;i++){
   await page.locator('[data-action="story-goto"][data-id="ability:'+i+'"]').click();
   assert.equal((await page.locator('.storybook-heading h2').textContent()).trim(),abilities[i]);
   await page.locator('.storybook-illustration svg').waitFor();
   await snap('ability-'+String(i+1).padStart(2,'0'));
 }
 await page.locator('[data-action="story-goto"][data-id="ability:3"]').click();
 await page.locator('[data-action="story-mind-lab"][data-id="1"]').click();
 assert.match(await page.locator('.storybook-lab .active').textContent(),/旋转45°/);
 const localKey=await page.evaluate(()=>Object.keys(localStorage).find(x=>x==='math-growth-v4-students'));
 assert.equal(localKey,'math-growth-v4-students');

 await page.setViewportSize({width:390,height:844});
 await page.locator('.navitem[data-page="universe"]').click();
 await page.locator('[data-action="story-goto"][data-id="knowledge:0"]').click();
 await snap('mobile-nebula');
 await page.locator('[data-action="story-goto"][data-id="knowledge:3"]').click();
 await snap('mobile-metro');
 await page.locator('[data-action="story-goto"][data-id="knowledge:5"]').click();
 await snap('mobile-lab');
 assert.equal(errs.length,0,errs.join('\n'));
 console.log('PASS: 7 knowledge pages, 6 ability pages, horizontal swipe, numerical lab, mobile views, storage key.');
} finally {await browser.close();}
