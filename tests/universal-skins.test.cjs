/* Universal cosmetic pixel coverage and silhouette/alpha/regression tests. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const metaSrc=fs.readFileSync('classic/js/data/sprites-meta.js','utf8');
const G={};vm.runInNewContext(metaSrc,{G},{filename:'sprites-meta.js'});
const dexes=Object.keys(G.SPRITE_META).filter(k=>G.SPRITE_META[k]?.a&&
  Object.keys(G.SPRITE_META[k].a).length>0);
assert.ok(dexes.length>=900,'expect at least 900 backed creature sprite datasets');
const source=fs.readFileSync('classic/js/mods/universal-pixel-atlas.js','utf8');
const families=['shadow','gold','prismatic','galaxy','crimson'];
const made=[],all=[];
class Context{
 constructor(canvas){this.canvas=canvas;this.globalAlpha=1;this.calls=[];}
 clearRect(){}drawImage(...a){this.calls.push(a);}
 createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4),width:w,height:h};}
 getImageData(x,y,w,h){
   const a=this.createImageData(w,h);
   // Flat orange sprite on an opaque body with a perfectly clear border.
   for(let py=0;py<h;py++)for(let px=0;px<w;px++){
     const i=(py*w+px)*4;
     if(px%8>0&&px%8<7&&py%8>0&&py%8<7){a.data[i]=237;a.data[i+1]=122;a.data[i+2]=42;a.data[i+3]=255;}
   }
   return a;
 }
 putImageData(a){this.canvas.pixels=a.data;}
 save(){this.saved={alpha:this.globalAlpha}}
 restore(){this.globalAlpha=this.saved?.alpha??1}
}
const document={createElement(name){
 assert.equal(name,'canvas');const c={width:0,height:0,pixels:null};
 c.getContext=()=>c.ctx||(c.ctx=new Context(c));made.push(c);return c;
}};
const m={w:8,h:8,n:2,r:8,ax:3,ay:6};
const srcImage={naturalWidth:16,naturalHeight:64};
const sprite={img:srcImage,ready:true};
G.Sprites={PX:2,animMeta(){return m},sheet(){return sprite},white(){return {white:true}}};
const window={G};
const asyncQueue=[];
vm.runInNewContext(source,{window,G,document,Math,console,Uint8ClampedArray,setTimeout(fn){asyncQueue.push(fn);}}, {filename:'universal-pixel-atlas.js'});
const art=window.CosmicUniversalAtlas;
for(const dex of dexes){for(const family of families)assert.equal(art.supported(dex,family),true);}
for(const dex of [0,-5,12000])assert.equal(art.supported(dex,'galaxy'),false);
assert.equal(art.supported(150,'normal'),false);
const cover=art.coverage();
assert.equal(cover.species,dexes.length);
assert.equal(cover.possibleLooks,dexes.length*5);
const samples={},input=new Uint8ClampedArray([237,122,42,255,9,15,21,0,28,30,44,255,187,85,42,128]);
for(const family of families){
 const pixel=new Uint8ClampedArray(input);
 art.pixelize(pixel,2,2,family,150);samples[family]=pixel;
 assert.deepEqual(Array.from(pixel.filter((_,i)=>i%4===3)),[255,0,255,128],'preserves source alpha '+family);
 assert.notDeepEqual(Array.from(pixel.slice(0,3)),[237,122,42],'recolors full body '+family);
}
for(let i=0;i<families.length;i++)for(let j=i+1;j<families.length;j++)
 assert.notDeepEqual(Array.from(samples[families[i]].slice(0,3)),Array.from(samples[families[j]].slice(0,3)),'distinct material palettes');
const out=new Context({}),anim={dex:150,cur:'Idle',frame:1,dir:7,scale:1,shiny:false,cosmicPlayer:true};
assert.equal(art.draw(out,anim,80,100,{alpha:.8},{id:'galaxy'}),true);
assert.deepEqual(out.calls[0].slice(1),[8,56,8,8,74,88,16,16],'exact frame crop and feet alignment');
assert.equal(out.globalAlpha,1,'preserves drawing opacity');
const result=made.at(-1).pixels;
assert.ok(result&&result.length===16*64*4,'full sprite sheet was rendered once');
assert.equal(result[3],0,'clear silhouette transparent outer edge');
const pos=(2*16+2)*4;
assert.equal(result[pos+3],255,'inside silhouette remains opaque');
assert.notDeepEqual(Array.from(result.slice(pos,pos+3)),[237,122,42],'no orange original survives on skin');
const count=made.length;art.draw(out,anim,80,100,{},'galaxy');
assert.equal(made.length,count,'reuse generated texture instead of processing every frame');
assert.ok(art.coverage().hits>=1);
const before=out.calls.length;
assert.equal(art.draw(out,{...anim,cosmicPlayer:false},80,100,{},'gold'),false,'never draws over enemies');
assert.equal(out.calls.length,before);
assert.equal(art.draw(out,anim,80,100,{flash:true,softFlash:true},'galaxy'),true,'hurt frame handled');
assert.equal(out.globalAlpha,1);
const live=fs.readFileSync('classic/js/mods/skin-fx.js','utf8');
const curated=live.indexOf('window.CosmicSpriteAtlas.draw(ctx,anim,x,y,opts,skin)');
const universal=live.lastIndexOf('window.CosmicUniversalAtlas.draw(ctx,anim,x,y,opts,skin)');
assert.ok(curated>=0&&universal>curated,'custom curated sheet takes priority');
assert.ok(universal<live.indexOf('base.call(anim,tex,m.ax*k+pad'),'universal pixel art before hue-overlay fallback');
const page=fs.readFileSync('classic/index.html','utf8');
assert.ok(page.indexOf('js/mods/universal-pixel-atlas.js')<page.indexOf('js/mods/skin-fx.js'));
const gallery=fs.readFileSync('classic/skin-gallery.html','utf8');
assert.ok(gallery.includes('js/data/sprites-meta.js')&&gallery.includes('js/mods/universal-pixel-atlas.js'));
assert.ok(gallery.includes('Show original')===false); // Two-up always-on before/after
// A large sprite sheet must NEVER be processed in one blocking render frame.
Object.assign(m,{w:150,h:80,n:4,r:8,ax:74,ay:50});
srcImage.naturalWidth=600;srcImage.naturalHeight=640;
const big={...anim,dex:6,frame:2,dir:3};
assert.equal(art.draw(out,big,80,100,{},'crimson'),false,'large skin safely falls back during preparation');
assert.ok(asyncQueue.length>0,'large sheets prepare on nonblocking scheduled tasks');
assert.ok(art.coverage().pending>=1,'skin marked as generating');
let steps=0;
while(asyncQueue.length&&steps++<200){asyncQueue.shift()()}
assert.ok(steps>4&&steps<200,'work is split across multiple small tasks');
assert.equal(art.draw(out,big,80,100,{},'crimson'),true,'large skin becomes ready without a page reload');
assert.equal(art.coverage().pending,0,'completed job cleans up pending status');
console.log('PASS: '+dexes.length+' species × five skins = '+(dexes.length*5)+' potential combinations, alpha silhouettes, stable frames, white flash and cache.');
