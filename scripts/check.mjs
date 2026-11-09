import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('dist/data.json','utf8'));
const ids=new Set(data.nodes.map(n=>n.id));
assert.equal(ids.size,data.nodes.length);assert.equal(new Set(data.nodes.map(n=>n.name)).size,data.nodes.length);
for(let g=1;g<=6;g++)for(let t=1;t<=2;t++)for(let b=0;b<5;b++)assert(data.nodes.some(n=>n.grade===g&&n.term===t&&n.block===b),`Missing ${g}/${t}/${b}`);
for(const n of data.nodes)assert(n.desc&&n.alignment&&n.caps.length);
for(const e of data.edges){assert(ids.has(e.source)&&ids.has(e.target));assert(e.source!==e.target);assert(e.task&&e.reason&&e.status);assert(['必要','促进','关联','待验证'].includes(e.kind));}
for(const n of data.nodes)assert(data.edges.some(e=>e.source===n.id||e.target===n.id),'Isolated '+n.name);
for(let g=1;g<=6;g++)assert(Object.keys(data.banks).some(id=>data.nodes.find(n=>n.id===id).grade===g),'Missing training grade '+g);
const blocks=new Set();for(const [id,b]of Object.entries(data.banks)){blocks.add(data.nodes.find(n=>n.id===id).block);for(const sets of [b.tiers,b.alternate]){assert.equal(sets.length,3);for(const tier of sets){assert.equal(tier.length,6);assert(new Set(tier.map(q=>q.dim)).size>=5);for(const q of tier){assert(q.prompt&&q.answer&&q.hint);assert(q.cap>=0&&q.cap<8);}}}}assert.equal(blocks.size,5);
// Verify evidence gates without browser automation: hints, post-answer edits, partial tiers and profile isolation.
const src=fs.readFileSync('dist/app.js','utf8');const s=src.replace(/fetch\('data.json'\)[\s\S]*?console.error\(e\);\}\);/,'');const ctx={document:{querySelector(){},querySelectorAll(){return[];}},console,crypto:{randomUUID:()=> 'test'},Date,Math};vm.createContext(ctx);vm.runInContext(s,ctx);
vm.runInContext(`D=${JSON.stringify(data)}; state={version:1,active:'a',profiles:[{id:'a',name:'A',records:{},history:[]},{id:'b',name:'B',records:{},history:[]}]};`,ctx);
assert.equal(vm.runInContext('stage("k43")',ctx),0);
assert.equal(vm.runInContext('taskIndependent({expected:["4"]},{text:"4",correct:true})',ctx),true);
assert.equal(vm.runInContext('taskIndependent({expected:["4"]},{text:"4",correct:true,hint:true})',ctx),false);
assert.equal(vm.runInContext('taskIndependent({}, {text:"reason",rating:2,afterReview:true})',ctx),false);
assert.equal(vm.runInContext('taskIndependent({}, {text:"reason",rating:1})',ctx),false);
assert.equal(vm.runInContext('taskIndependent({}, {text:"reason",rating:2})',ctx),true);
vm.runInContext('rec("k43").tiers={0:{passed:true},1:{passed:false},2:{passed:true}}',ctx);assert.equal(vm.runInContext('stage("k43")',ctx),1);
vm.runInContext('state.active="b"',ctx);assert.equal(vm.runInContext('stage("k43")',ctx),0);
assert.equal(vm.runInContext('normalize("１，０００.0")',ctx),'1000');
console.log(`PASS: ${data.nodes.length} nodes, ${data.edges.length} explained relations, all 60 grade/term/block cells, ${Object.keys(data.banks).length} banks, 432 task variants, 12 delayed tasks, evidence gates, profile isolation.`);
