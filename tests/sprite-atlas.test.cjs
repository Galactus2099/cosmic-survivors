/* Regression tests for exact-frame transparent variant atlas playback. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('classic/js/mods/sprite-atlas.js','utf8');
let fetches=0,images=[];
class FakeImage{
 constructor(){this.naturalWidth=256;this.naturalHeight=512;images.push(this);}
 set src(s){this._src=s;fetches++;if(s.includes('/Faint.'))this.onerror?.();else this.onload?.();}
 get src(){return this._src;}
}
const G={Sprites:{PX:2,animMeta(){return {w:32,h:64,ax:15.5,ay:35.5,n:8,r:8}}}};
const window={G},ctx={globalAlpha:1,calls:[],drawImage(...args){this.calls.push(args)}};
vm.runInNewContext(source,{G,window,Image:FakeImage,console,Math},{filename:'sprite-atlas.js'});
const api=window.CosmicSpriteAtlas;
assert.equal(api.isSupported(150,'galaxy'),true);
assert.equal(api.isSupported(150,'prismatic'),true);
assert.equal(api.isSupported(150,'gold'),false);
assert.equal(api.isSupported(6,'prismatic'),false);
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
api.mode='off';assert.equal(api.draw(ctx,p,100,200,{},'galaxy'),false,'A/B toggle disables png rendering');
api.mode='auto';assert.equal(api.draw(ctx,p,100,200,{},'galaxy'),true);
const original=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
const ref=original.indexOf('window.CosmicSpriteAtlas.draw(ctx,anim,x,y,opts,skin)');
const proced=original.indexOf('material(tex,id,cw,ch,t)');
assert.ok(ref>=0&&ref<proced,'atlas preferred before procedural materials');
const page=fs.readFileSync('classic/index.html','utf8');
assert.ok(page.indexOf('js/mods/sprite-atlas.js')<page.indexOf('js/mods/skin-fx.js'),'atlas loads before skin renderer');
console.log('Atlas loader: 8-way frame crop, alpha, lazy load/cache, unsupported fallback, force-shader mode, script integration passed.');
