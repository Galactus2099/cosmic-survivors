/* Sprite-frame body detail tests: visible ornament geometry, stable anchoring,
 * species/skin differentiation and preservation of existing animations. */
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const art=fs.readFileSync('classic/js/mods/species-art.js','utf8');
function load(){
  const window={};
  vm.runInNewContext(art,{window,console,Math,performance:{now(){return 2200}}},{filename:'species-art.js'});
  return window.CosmicSpeciesArt;
}
const mod=load();
assert.ok(mod);
for(const dex of [150,6,94,448])assert.equal(mod.supported(dex),true,'supported '+dex);
for(const dex of [1,25,249,0,undefined])assert.equal(mod.supported(dex),false,'unsupported '+dex);
assert.notEqual(mod.signatures[150],mod.signatures[6],'Mewtwo-specific layout distinct');
assert.notEqual(mod.signatures[94],mod.signatures[448],'Gengar-specific layout distinct');
class FakeContext{
  constructor(){this.calls=[];this.saved=0;this.restored=0;this.globalAlpha=1;}
  save(){this.calls.push(['save']);this.saved++;}
  restore(){this.calls.push(['restore']);this.restored++;}
  translate(...p){this.calls.push(['translate',...p]);}
  scale(...p){this.calls.push(['scale',...p]);}
  rotate(...p){this.calls.push(['rotate',...p]);}
  beginPath(){this.calls.push(['path']);}
  moveTo(...p){this.calls.push(['move',...p]);}
  lineTo(...p){this.calls.push(['line',...p]);}
  closePath(){this.calls.push(['close']);}
  fill(){this.calls.push(['fill',this.fillStyle]);}
  stroke(){this.calls.push(['stroke',this.strokeStyle]);}
  arc(...p){this.calls.push(['arc',...p]);}
  ellipse(...p){this.calls.push(['ellipse',...p]);}
  fillRect(...p){this.calls.push(['rect',...p]);}
  strokeRect(...p){this.calls.push(['strokeRect',...p]);}
}
const styles=['shadow','gold','prismatic','galaxy','crimson'];
const meta={w:48,h:56,ax:23.5,ay:31.5};
const patterns={};
for(const dex of [150,6,94,448]){
 for(const skin of styles){
   const ctx=new FakeContext();
   const a={dex,cur:'Walk',frame:2,dir:0};
   const ok=mod.apply(ctx,a,skin,meta,2,3.5);
   assert.equal(ok,true,'decorates '+dex+' '+skin);
   assert.equal(ctx.saved,ctx.restored,'restores canvas for '+dex+' '+skin);
   assert.deepEqual(ctx.calls.find(x=>x[0]==='translate'),['translate',47,63],'anchored at sprite feet');
   assert.ok(ctx.calls.filter(x=>x[0]==='fill').length>=3,'separate solid body details for '+dex+' '+skin);
   const colors=new Set(ctx.calls.filter(x=>x[0]==='fill').map(x=>x[1]));
   assert.ok(colors.size>=2,'multiple colors for '+dex+' '+skin);
   patterns[dex+':'+skin]=[...colors].sort().join(',');
 }
}
assert.notEqual(patterns['150:prismatic'],patterns['150:galaxy']);
assert.notEqual(patterns['150:galaxy'],patterns['150:gold']);
assert.notEqual(patterns['150:shadow'],patterns['150:crimson']);
const ctx=new FakeContext();
assert.equal(mod.apply(ctx,{dex:25,cur:'Idle',dir:0},'prismatic',meta,2,1),false,'unconfigured creatures use materials only');
assert.equal(mod.apply(ctx,{dex:150,cur:'Faint',dir:0},'prismatic',meta,2,1),false,'no horns floating over fainted Pokémon');
assert.equal(mod.apply(ctx,{dex:150,cur:'Walk',dir:0},'normal',meta,2,1),false,'normal remains untouched');
assert.equal(ctx.calls.length,0,'no drawing for unsupported states');
const back=new FakeContext();
mod.apply(back,{dex:150,cur:'Walk',dir:4},'galaxy',meta,2,1);
assert.equal(back.saved,back.restored);
const mirrored=new FakeContext();
mod.apply(mirrored,{dex:150,cur:'Walk',dir:6},'gold',meta,2,1);
assert.ok(mirrored.calls.some(x=>x[0]==='scale'&&x[1]===-1),'left-facing ornament mirrors direction');
const a=new FakeContext(),b=new FakeContext();
mod.apply(a,{dex:150,cur:'Idle',frame:0,dir:0},'prismatic',{...meta,ax:15.5,ay:35.5},2,1);
mod.apply(b,{dex:150,cur:'Attack',frame:0,dir:0},'prismatic',{...meta,ax:39.5,ay:46.5},2,1);
assert.deepEqual(a.calls.find(x=>x[0]==='translate'),['translate',31,71]);
assert.deepEqual(b.calls.find(x=>x[0]==='translate'),['translate',79,93]);
const padded=new FakeContext();
mod.apply(padded,{dex:150,cur:'Idle',frame:0,dir:0},'shadow',{...meta,ax:15.5,ay:35.5},2,1,18);
assert.deepEqual(padded.calls.find(x=>x[0]==='translate'),['translate',49,89],'padding moves crown clear of atlas clipping without changing body anchor');
assert.ok(fx.includes('const cw=w+pad*2,ch=h+pad*2'),'render has transparent ornament margins');
const fx=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
assert.ok(fx.includes('window.CosmicSpeciesArt.apply(tex,anim,id,m,k,t,pad)'),'ornaments composited inside animated sprite material');
assert.ok(fx.indexOf('window.CosmicSpeciesArt.apply')<fx.indexOf('ctx.drawImage(temp,dx,dy)'),'details are part of sprite layer');
console.log('Species cosmetic ornament tests passed: 4 characters, 5 skins, frame anchors, directions, faint/normal fallbacks.');
