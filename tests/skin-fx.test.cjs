/* Shader contract tests: only hero frames get animated procedural finishes.
   Ensures distinct materials, preservation of base animation frames and alpha. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
let tick=12000,baseCalls=0,stars=0,comps=[],palette=[];
class Canvas2D{
 constructor(){this.globalAlpha=1;this.drawn=0;this.filter='none';this.gradients=[];this.strokes=0;this.sparks=0;this.composites=[];}
 set globalCompositeOperation(s){this.composites.push(s);this._op=s;}
 get globalCompositeOperation(){return this._op;}
 createLinearGradient(x0,y0,x1,y1){const g={stops:[],bounds:[x0,y0,x1,y1],addColorStop(t,c){this.stops.push([t,c]);palette.push(c)}};this.gradients.push(g);return g;}
 setTransform(){}clearRect(){}save(){}restore(){}beginPath(){}arc(){stars++}ellipse(){}fill(){}stroke(){this.strokes++}fillRect(){this.drawn++}drawImage(){this.drawn++}translate(){}moveTo(){}lineTo(){}closePath(){}
}
const off=new Canvas2D(),on=new Canvas2D();
const canvas={width:0,height:0,getContext(){return off}};
const window={G:{Sprites:{PX:2,animMeta(){return {w:56,h:60,ax:28,ay:53}}}}};
const document={createElement(x){assert.equal(x,'canvas');return canvas}};
const sandbox={window,G:window.G,document,console,Math,performance:{now(){return tick}}};
vm.runInNewContext(src,sandbox,{filename:'skin-fx.js'});
const fx=window.CosmicSkinFX;
assert.ok(fx&&fx.render&&fx.filters&&fx.palette);
const anim={dex:150,cur:'Walk',frame:2,shiny:false,scale:1,cosmicPlayer:true};
const base=function(ctx,x,y,opts){baseCalls++;assert.equal(this.frame,2);assert.equal(x,ctx===off?56:100);assert.equal(y,ctx===off?106:200);ctx.fillRect(0,0,112,120);};
const before=off.gradients.length;
fx.render(base,anim,on,100,200,{}, {id:'normal'});
assert.equal(baseCalls,1,'normal sprite remains untouched');
assert.equal(off.gradients.length,before,'normal does not invoke shader');
const samples={};
for(const skin of ['shadow','gold','prismatic','galaxy','crimson']){
 const gd=off.gradients.length,dx=on.drawn;
 const alpha=on.globalAlpha;
 fx.render(base,anim,on,100,200,{alpha:.6},{id:skin});
 assert.equal(on.globalAlpha,alpha,'alpha restored for '+skin);
 assert.ok(off.gradients.length>gd,'material gradient for '+skin);
 assert.ok(on.drawn>dx,'composited player sprite for '+skin);
 assert.ok(off.composites.includes('source-atop'),'texture clipped to sprite');
 samples[skin]=off.gradients.slice(gd).map(x=>x.stops.map(y=>y[1])).flat();
}
assert.ok(samples.prismatic.length>=7);
assert.ok(samples.prismatic.some(x=>x==='#73f8ed'),'prismatic gets cyan');
assert.ok(samples.prismatic.some(x=>x==='#fb5889'),'prismatic gets pink');
assert.ok(samples.galaxy.some(x=>x==='#3a54bb'),'galaxy has blue nebula');
assert.ok(samples.gold.some(x=>x==='#fff9dc'),'gold has brilliant metallic reflection');
assert.ok(samples.crimson.some(x=>x==='#b3234b'),'crimson has red finish');
assert.ok(samples.shadow.some(x=>x==='#080514'),'shadow is dark/violet');
const b=baseCalls,g=off.gradients.length;
fx.render(base,anim,on,100,200,{flash:true},{id:'prismatic'});
assert.equal(baseCalls,b+1,'hurt frame preserved');
assert.equal(off.gradients.length,g,'flash bypasses shader');
const b2=baseCalls;window.G.Sprites.animMeta=()=>null;
fx.render(base,anim,on,100,200,{}, {id:'prismatic'});
assert.equal(baseCalls,b2+1,'missing atlas metadata falls back safely');
console.log('Passed five visual materials, clipped gradients, frame preservation, flash and missing-frame fallback.');
