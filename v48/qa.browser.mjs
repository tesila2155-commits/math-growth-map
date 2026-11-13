import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];
const exercise=async(width,height,name)=>{
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,hasTouch:width<500});
 page.on('pageerror',e=>failures.push(name+': pageerror '+e.message));
 const url=pathToFileURL(resolve('v48/index.html')).href;
 await page.goto(url,{waitUntil:'load'});await page.locator('#view .hero').first().waitFor({timeout:12000});
 assert(!((await page.locator('#view').innerText()).includes('正在打开你的数学地图')),'boot is stuck');
 await page.locator('.navitem[data-page="universe"]').click();
 await page.locator('[data-book-root="knowledge"]').waitFor();
 assert.equal(await page.locator('[data-book-stage="knowledge"]').count(),1);
 assert.equal(await page.locator('#cosmosSvg').count(),1);
 await page.locator('#cosmosSearch').fill('乘法分配律');
 await page.locator('[data-action="cosmos-find"]').click();
 assert((await page.locator('[data-book-stage="knowledge"]').innerText()).includes('乘法分配律'));
 for(let i=1;i<=6;i++){
  await page.locator('[data-action="story-goto"][data-id="knowledge:'+i+'"]').click();
  assert.equal(await page.locator('[data-book-stage="knowledge"]').count(),1);
  assert.equal(await page.locator('.storybook-illustration svg').count(),1);
 }
 await page.locator('[data-action="story-goto"][data-id="knowledge:5"]').click();
 const range=page.locator('#storyLabRange');assert.equal(await range.count(),1);
 await range.evaluate(el=>{el.value='7';el.dispatchEvent(new Event('input',{bubbles:true}))});
 assert((await page.locator('#storyLabEquation').innerText()).includes('4 × 7'));
 await page.locator('[data-action="story-goto"][data-id="knowledge:1"]').click();
 const nodes=page.locator('[data-book-stage="knowledge"] [data-action="cosmos-focus"]');
 assert((await nodes.count())>0,'tree has no clickable nodes');
 await nodes.first().click();
 assert((await page.locator('[data-book-stage="knowledge"]').innerText()).includes('知识生长树'));
 await page.locator('.navitem[data-page="abilities"]').click();
 await page.locator('[data-action="ability"]').first().click();
 assert.equal(await page.locator('[data-book-root="ability"]').count(),1);
 for(let i=0;i<6;i++){
  await page.locator('[data-action="story-goto"][data-id="ability:'+i+'"]').click();
  assert.equal(await page.locator('[data-book-stage="ability"]').count(),1);
  assert.equal(await page.locator('[data-book-stage="ability"] .storybook-illustration svg').count(),1);
 }
 await page.locator('[data-action="story-goto"][data-id="ability:0"]').click();
 await page.locator('[data-book-stage="ability"] [data-action="story-hurdle"]').first().click();
 assert((await page.locator('[data-book-stage="ability"]').innerText()).includes('开始探索'));
 await page.locator('[data-action="story-goto"][data-id="ability:3"]').click();
 await page.locator('[data-action="story-mind-lab"][data-id="1"]').click();
 assert.equal(await page.locator('#mindLabTiles').count(),1);
 assert((await page.locator('[data-book-stage="ability"]').innerText()).includes('旋转45°'));
 const html=await page.locator('#view').innerHTML();
 assert(!html.includes('undefined'),'UI contains undefined marker');
 await page.close();
 console.log(name+': PASS');
};
try{await exercise(1300,900,'desktop');await exercise(390,844,'mobile');if(failures.length)throw Error(failures.join('\n'));console.log('V4.8 browser E2E passed')}finally{await browser.close()}
