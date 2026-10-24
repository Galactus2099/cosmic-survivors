/* Prismatic Mega Mewtwo visual regression and fallback tests. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('classic/js/mods/prismatic-mega-mewtwo.js','utf8');
const meta={w:32,h:64,n:8,r:8,ax:15.5,ay:35.5};
const created=[];
class ImageMock{
 constructor(){this.naturalWidth=(meta.w+32)*meta.n;this.naturalHeight=(meta.h+32)*meta.r;created.push(this);}
 set src(url){this._src=url;this.onload?.();}
 get src(){return this._src;}
}
const p={dex:150,cosmicForm:{name:'Mega Mewtwo X',form:'x'}};
const G={Game:{player:p},Sprites:{PX:2,animMeta(){return meta}}};
const window={G,CosmicSpriteAtlas:{mode:'auto'}};
const ctx={
 globalAlpha:1,filter:'none',draws:[],beginPath(){},moveTo(){},lineTo(){},stroke(){},
 ellipse(){},save(){this.s=(this.s||0)+1},restore(){this.r=(this.r||0)+1},
 drawImage(...args){this.draws.push(args)}
};
vm.runInNewContext(source,{window,G,Image:ImageMock,performance:{now(){return 24000}},Math,console},{filename:'prismatic-mega-mewtwo.js'});
const mod=window.CosmicMegaPrismatic;
const anim={dex:150,cosmicPlayer:true,scale:1,cur:'Idle',frame:5,dir:7};
assert.equal(mod.applicable(anim,'prismatic'),true);
assert.equal(mod.applicable(anim,'galaxy'),false);
assert.equal(mod.applicable({...anim,dex:6},'prismatic'),false);
assert.equal(mod.drawSprite(ctx,anim,90,200,{alpha:.6},'prismatic'),true);
assert.ok(created[0].src.includes('/150/prismatic/x/Idle.png'));
assert.deepEqual(ctx.draws[0].slice(1),[
  5*64,7*96,64,96,90-Math.round((15.5+16)*2),200-Math.round((35.5+16)*2),128,192
]);
assert.equal(ctx.globalAlpha,1);
assert.equal(ctx.filter,'none');
assert.equal(mod.drawSprite(ctx,anim,90,200,{flash:true},'prismatic'),true);
assert.equal(ctx.filter,'none');
const n=created.length;
assert.equal(mod.drawSprite(ctx,anim,90,200,{},'prismatic'),true);
assert.equal(created.length,n,'images cached');
anim.cosmicPrismaticMegaActive=true;
mod.underlay(ctx,anim,90,200);
mod.aura(ctx,anim,90,200);
assert.equal(ctx.s,ctx.r,'canvas context saved/restored');
assert.ok((ctx.s||0)>=6,'small separate crystal sparkles/orbits');
p.cosmicForm={name:'Mega Mewtwo Y',form:'y'};
assert.equal(mod.drawSprite(ctx,anim,90,200,{},'prismatic'),true);
assert.ok(created.some(x=>x.src.includes('/y/Idle.png')),'different Y animation');
window.CosmicSpriteAtlas.mode='off';
assert.equal(mod.drawSprite(ctx,anim,90,200,{},'prismatic'),false);
window.CosmicSpriteAtlas.mode='auto';
p.cosmicForm=null;
assert.equal(mod.applicable(anim,'prismatic'),false);
assert.equal(mod.drawSprite(ctx,anim,90,200,{},'prismatic'),false);
p.cosmicForm={form:'x'};
assert.equal(mod.drawSprite(ctx,anim,90,200,{},'galaxy'),false);
const render=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
const mega=fs.readFileSync('classic/js/mods/mega-evolution.js','utf8');
const html=fs.readFileSync('classic/index.html','utf8');
assert.ok(render.includes('window.CosmicMegaPrismatic.drawSprite(ctx,anim,x,y,opts,skin)'));
assert.ok(render.includes('anim.cosmicPrismaticMegaActive=!!prismaticMega'));
assert.ok(mega.includes('window.CosmicMegaPrismatic.warmup(form.form)'));
assert.ok(mega.includes('window.CosmicMegaPrismatic.aura(ctx,anim,x,y)'));
assert.ok(html.indexOf('prismatic-mega-mewtwo.js')<html.indexOf('skin-fx.js'));
console.log('Prismatic Mega Mewtwo: distinct X/Y, source-frame cropping, cache, flash, original-skin and no-Mega fallbacks pass.');
