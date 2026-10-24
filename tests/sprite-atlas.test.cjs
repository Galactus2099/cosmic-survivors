/* Regression tests for exact-frame transparent variant atlas playback. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('classic/js/mods/sprite-atlas.js','utf8');
let fetches=0,images=[];
const dimensions={6:{w:40,h:48,n:4,r:8,ax:19.5,ay:27.5},94:{w:32,h:40,n:8,r:8,ax:15.5,ay:23.5},150:{w:32,h:64,n:8,r:8,ax:15.5,ay:35.5},448:{w:32,h:56,n:6,r:8,ax:15.5,ay:31.5}};
class FakeImage{
 constructor(){this.naturalWidth=256;this.naturalHeight=512;images.push(this);}
 set src(s){
 this._src=s;fetches++;
 const dex=Number(s.match(/\/variants\/(\d+)\//)?.[1])||150;
 const meta=dimensions[dex]||dimensions[150];
 this.naturalWidth=meta.w*meta.n;this.naturalHeight=meta.h*meta.r;
 if(s.includes('/Faint.'))this.onerror?.();else this.onload?.();
}
 get src(){return this._src;}
}
const G={Sprites:{PX:2,animMeta(dex){return dimensions[dex]}}};
const window={G},ctx={globalAlpha:1,calls:[],drawImage(...args){this.calls.push(args)}};
vm.runInNewContext(source,{G,window,Image:FakeImage,console,Math},{filename:'sprite-atlas.js'});
const api=window.CosmicSpriteAtlas;
assert.equal(api.isSupported(150,'galaxy'),true);
assert.equal(api.isSupported(150,'prismatic'),true);
assert.equal(api.isSupported(150,'gold'),false);
for(const dex of [6,94,150,448]){
 assert.equal(api.isSupported(dex,'prismatic'),true);
 assert.equal(api.isSupported(dex,'galaxy'),true);
}
assert.equal(api.isSupported(25,'prismatic'),false);
const p={dex:150,cur:'Idle',frame:3,dir:6,scale:1,shiny:false};
assert.equal(api.draw(ctx,p,100,200,{alpha:.5},'galaxy'),true);
assert.equal(ctx.calls.length,1);
assert.deepEqual(ctx.calls[0].slice(1),[96,384,32,64,69,129,64,128]);
assert.equal(ctx.globalAlpha,1,'restores original opacity');
const before=fetches;api.draw(ctx,p,100,200,{},'galaxy');
assert.equal(fetches,before,'cache same animation sheet');
assert.equal(api.draw(ctx,p,100,200,{},'shadow'),false);
assert.equal(api.draw(ctx,{...p,cur:'Faint'},100,200,{},'prismatic'),false,'failed PNG safely falls back');
assert.equal(api.status().failed,1);
for(const dex of [6,94,448]){
 const frame={dex,cur:'Idle',frame:1,dir:2,scale:1,shiny:false};
 for(const skin of ['prismatic','galaxy']){
  const old=ctx.calls.length;
  assert.equal(api.draw(ctx,frame,100,200,{},skin),true,'atlas loads '+dex+'/'+skin);
  assert.equal(ctx.calls.length,old+1);
  assert.equal(ctx.calls[old][1],dimensions[dex].w,'source X uses per-species width');
  assert.equal(ctx.calls[old][2],2*dimensions[dex].h,'source Y uses per-species direction row');
 }
}
api.mode='off';assert.equal(api.draw(ctx,p,100,200,{},'galaxy'),false,'A/B toggle disables png rendering');
api.mode='auto';assert.equal(api.draw(ctx,p,100,200,{},'galaxy'),true);
const original=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
const ref=original.indexOf('window.CosmicSpriteAtlas.draw(ctx,anim,x,y,opts,skin)');
const proced=original.indexOf('material(tex,id,cw,ch,t)');
assert.ok(ref>=0&&ref<proced,'atlas preferred before procedural materials');
const page=fs.readFileSync('classic/index.html','utf8');
assert.ok(page.indexOf('js/mods/sprite-atlas.js')<page.indexOf('js/mods/skin-fx.js'),'atlas loads before skin renderer');
console.log('Atlas loader: 8-way frame crop, alpha, lazy load/cache, unsupported fallback, force-shader mode, script integration passed.');
