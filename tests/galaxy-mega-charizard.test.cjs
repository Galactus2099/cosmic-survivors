/* Galaxy Mega Charizard X/Y: image loading, form selection, overlays and fallback. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const file=fs.readFileSync('classic/js/mods/galaxy-mega-charizard.js','utf8');
const loaded=[];
const m={w:40,h:48,n:4,r:8,ax:19.5,ay:27.5};
class ImageMock{
 constructor(){loaded.push(this);this.naturalWidth=(m.w+28)*m.n;this.naturalHeight=(m.h+28)*m.r;}
 set src(src){this._src=src;this.onload?.();}
 get src(){return this._src;}
}
const player={dex:6,cosmicForm:{name:'Mega Charizard X',form:'x'}};
const G={
 Game:{player},
 Sprites:{PX:2,animMeta(){return m}},
};
const window={G,CosmicSpriteAtlas:{mode:'auto'}};
let tick=0;
const ctx={draws:[],arcs:0,sparkles:0,globalAlpha:1,filter:'none',
 save(){this.saves=(this.saves||0)+1;},
 restore(){this.restores=(this.restores||0)+1;},
 beginPath(){},ellipse(){this.arcs++},arc(){this.arcs++},stroke(){},
 fill(){},moveTo(){},lineTo(){this.sparkles++},
 drawImage(...args){this.draws.push(args);}};
vm.runInNewContext(file,{window,G,console,Image:ImageMock,Math,performance:{now(){return tick}}},{filename:'galaxy-mega-charizard.js'});
const mod=window.CosmicMegaGalaxy;
const anim={dex:6,cosmicPlayer:true,cur:'Idle',frame:2,dir:5,scale:1};
assert.equal(mod.isApplicable(anim,'galaxy'),true);
assert.equal(mod.isApplicable(anim,'gold'),false);
assert.equal(mod.isApplicable({...anim,dex:150},'galaxy'),false);
assert.equal(mod.drawSprite(ctx,anim,100,200,{alpha:.7},'galaxy'),true);
assert.equal(loaded.length,1,'single sheet request');
assert.ok(loaded[0].src.includes('mega-variants/6/galaxy/x/Idle.png'));
assert.deepEqual(ctx.draws[0].slice(1),[
  2*68,5*76,68,76,Math.round(100-(19.5+14)*2),
  Math.round(200-(27.5+14)*2),136,152
]);
assert.equal(ctx.globalAlpha,1);
assert.equal(ctx.filter,'none');
assert.equal(mod.drawSprite(ctx,anim,100,200,{flash:true},'galaxy'),true);
assert.equal(ctx.globalAlpha,1);
assert.equal(ctx.filter,'none','white flash restores canvas filter');
assert.equal(loaded.length,1,'repeated frames share cached texture');
anim.cosmicGalaxyMegaActive=true;
mod.drawUnderlay(ctx,anim,100,200);
mod.drawAura(ctx,anim,100,200);
assert.ok(ctx.arcs>=7,'two orbital halves plus two planets');
assert.ok(ctx.sparkles>=6,'1-3 visible star crosses');
assert.equal(ctx.saves,ctx.restores,'canvas save/restore balanced');
assert.equal(mod.warmup('x'),true);
assert.ok(mod.status().ready>=4);
player.cosmicForm={name:'Mega Charizard Y',form:'y'};
assert.equal(mod.drawSprite(ctx,anim,100,200,{},'galaxy'),true);
assert.ok(loaded.some(a=>a.src.includes('/y/Idle.png')),'Y has separate atlas');
window.CosmicSpriteAtlas.mode='off';
assert.equal(mod.drawSprite(ctx,anim,100,200,{},'galaxy'),false,'Test Lab A/B disables special atlas');
window.CosmicSpriteAtlas.mode='auto';
player.cosmicForm=null;
assert.equal(mod.isApplicable(anim,'galaxy'),false,'no Mega form = original galaxy art');
assert.equal(mod.drawSprite(ctx,anim,100,200,{},'galaxy'),false);
player.cosmicForm={name:'Mega Charizard X',form:'x'};
assert.equal(mod.drawSprite(ctx,anim,100,200,{},'prismatic'),false,'other variants unaffected');
const fx=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
const mega=fs.readFileSync('classic/js/mods/mega-evolution.js','utf8');
assert.ok(fx.includes('window.CosmicMegaGalaxy.drawSprite(ctx,anim,x,y,opts,skin)'));
assert.ok(fx.includes('anim.cosmicGalaxyMegaActive=!!mega'));
assert.ok(mega.includes('window.CosmicMegaGalaxy.drawAura(ctx,anim,x,y)'));
assert.ok(mega.includes('window.CosmicMegaGalaxy.warmup(form.form)'));
const html=fs.readFileSync('classic/index.html','utf8');
assert.ok(html.indexOf('galaxy-mega-charizard.js')<html.indexOf('skin-fx.js'));
console.log('Galaxy Mega Charizard tests passed: forms X/Y, crop, galaxy-only gate, full-reskin atlas, two planets, stars and fallback.');
