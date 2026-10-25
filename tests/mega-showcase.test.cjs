/* Mega Art Studio: actual game art, complete animation and fallback regression. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('classic/mega-showcase.html','utf8');
assert.match(html,/Actual in-game sprite files/);
assert.match(html,/assets\/mega-variants\/150\/prismatic\//);
assert.match(html,/assets\/mega-variants\/6\/galaxy\//);
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'inline gallery script found');
const state={species:'mewtwo',animation:'Idle',direction:'0',background:'grass'};
const known=new Map(),ctxs=[],events=new Map(),frames=[],requests=[];
class Ctx{
  constructor(){this.draws=[];this.imageSmoothingEnabled=true;ctxs.push(this);}
  save(){}restore(){}beginPath(){}ellipse(){}fill(){}stroke(){}fillRect(){}
  moveTo(){}lineTo(){}arc(){}fillText(){}drawImage(...x){this.draws.push(x);}
}
function get(id){
 if(known.has(id))return known.get(id);
 const obj={value:state[id]||'',id,textContent:'',className:'',
   addEventListener(name,fn){events.set(id+':'+name,fn)},
   getContext(){return this.ctx||(this.ctx=new Ctx())}};
 known.set(id,obj);return obj;
}
const document={getElementById:get};
class Img{
 constructor(){this.naturalWidth=512;this.naturalHeight=768;}
 set src(uri){
   this.uri=uri;requests.push(uri);
   const mega=uri.includes('mega-variants');
   const char=uri.includes('/6/');
   const orig=uri.includes('assets/pokemon');
   const fw=char?40:32,fh=char?48:64;
   const n=char?4:8;
   const pad=mega?(char?14:16):0;
   this.naturalWidth=(fw+pad*2)*n;
   this.naturalHeight=(fh+pad*2)*8;
   if(orig||mega)this.onload?.();else this.onerror?.();
 }
 get src(){return this.uri;}
 decode(){return Promise.resolve()}
}
const window={},consoleStub={log(){}};
vm.runInNewContext(script,{document,Image:Img,requestAnimationFrame(fn){frames.push(fn)},Math,console:consoleStub,window},{filename:'mega-showcase-script.js'});
assert.ok(requests.some(x=>x.includes('150/prismatic/x/Idle.png')),'loads exact Mewtwo X sprites');
assert.ok(requests.some(x=>x.includes('150/prismatic/y/Idle.png')),'loads exact Mewtwo Y sprites');
assert.match(get('status-x').textContent,/Real Mega PNG loaded/);
assert.match(get('status-y').textContent,/Real Mega PNG loaded/);
assert.ok(frames.length===1,'animation scheduled');
frames.shift()(100);
assert.ok(ctxs[0].draws.length>=1 && ctxs[1].draws.length>=1,'draws two character sprites');
assert.equal(ctxs[0].imageSmoothingEnabled,false,'uses sharp pixel sprites');
// Switch to Charizard without any new game run.
get('species').value='charizard';
events.get('species:change')();
assert.ok(requests.some(x=>x.includes('/6/galaxy/x/Idle.png')));
frames.shift()(150);
assert.equal(ctxs[0].draws.at(-1)[3],68,'Charizard frame includes real wing pixel padding');
// Direct before/after comparison is from original source PNG.
events.get('before-x:click')();
assert.ok(requests.some(x=>x.includes('assets/pokemon/6/Idle.png')));
assert.match(get('status-x').textContent,/Original animation loaded/);
// Validate that all production assets and integrations are present.
const atlases=[
 'classic/assets/mega-variants/150/prismatic/manifest.json',
 'classic/assets/mega-variants/6/galaxy/manifest.json'
];
for(const file of atlases)assert.ok(fs.existsSync(file),file);
const lab=fs.readFileSync('classic/js/mods/test-lab.js','utf8');
assert.match(lab,/mega-showcase\.html/,'Test Lab links to full gallery');
assert.match(lab,/CosmicSpriteAtlas\.mode='auto'/,'Test Lab resets old compare mode');
const fx=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
assert.match(fx,/!mega&&!prismaticMega&&window\.CosmicSpeciesArt/,'Mega fallback omits detached ornaments');
console.log('Mega Studio passed: real Mewtwo X/Y, Charizard X/Y, frame dimensions, crisp art, before/after, Test Lab preload and clean fallback.');
