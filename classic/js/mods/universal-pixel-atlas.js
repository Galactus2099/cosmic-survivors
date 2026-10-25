/* Cosmic Survivors Classic — UNIVERSAL PIXEL MATERIALS
 * Every creature with SpriteCollab animation metadata gets body-clipped,
 * deterministic appearance pixels. The original outlines, alpha, animation
 * frames, facing directions and foot anchors remain unchanged.
 *
 * THIS IS UNIVERSAL GENERATED PIXEL ART, NOT PER-SPECIES HAND-PAINTED SKINS.
 * Bespoke Prismatic/Galaxy and two Mega sets remain preferred when available.
 * SpriteCollab artwork: CC BY-NC 4.0; preserve classic/CREDITS.md.
 */
(() => {
'use strict';
const FAMILIES=['shadow','gold','prismatic','galaxy','crimson'];
const PRESETS={
 shadow:[[9,8,23],[26,17,53],[65,29,107],[161,101,219]],
 gold:[[55,33,13],[133,79,19],[234,173,62],[255,248,190]],
 prismatic:[[239,72,149],[252,187,99],[136,247,227],[114,165,250],[193,127,250]],
 galaxy:[[13,15,40],[31,27,94],[70,40,135],[68,131,204],[177,113,221]],
 crimson:[[24,9,28],[70,15,47],[151,27,79],[228,69,99],[251,175,106]]
};
const CACHE=new Map(),MAX_CACHE=14,MAX_PIXELS=3_600_000;
let hits=0,misses=0,failures=0,created=0;
const clamp=(n,a=0,b=255)=>Math.min(b,Math.max(a,n));
const frac=n=>n-Math.floor(n);
function mix(a,b,t){return a+(b-a)*t;}
function hash(x,y,salt){
  let h=(Math.imul(x+132,374761393)^Math.imul(y+31,668265263)^Math.imul(salt+17,2246822519))|0;
  h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;
}
function palette(style,x,y,dex,lum){
  const stops=PRESETS[style];if(!stops)return null;
  const ph=(x*.022+y*.011+dex*.031);
  let u;
  if(style==='prismatic')u=(frac(ph*.63+Math.sin((x+y)*.031)*.08)*(.999999));
  else if(style==='galaxy')u=clamp(.33+.29*Math.sin(ph*.77)+.19*Math.cos(x*.053-y*.032),0,.99999);
  else if(style==='gold')u=clamp(.25+.50*Math.sin(x*.046+y*.022+1.7)**2,0,.99999);
  else if(style==='crimson')u=clamp(.23+.36*Math.sin(ph*.91+2.4)+.12*Math.cos(x*.063),0,.99999);
  else u=clamp(.17+.25*Math.sin(ph+.3),0,.99999);
  const index=u*(stops.length-1),i=Math.floor(index),t=index-i;
  let p=[0,1,2].map(c=>mix(stops[i][c],stops[Math.min(i+1,stops.length-1)][c],t));
  // Shade physically follows original source sprite, preserving recognizable
  // face outlines and pre-existing highlights, with NO surviving orange body.
  const f=style==='gold'?(0.17+lum*1.16):(0.17+lum*1.08);
  p=p.map(v=>v*f);
  // Species + pose-fixed micro facets, not disjoint screen-space attachments.
  if(style==='prismatic'){
    const q=hash(Math.floor(x/5),Math.floor(y/6),dex)%5;
    const facet=(q===0?1.13:q===1?.86:1);
    p=p.map(v=>v*facet);
  }
  if(style==='galaxy'){
    const nebula=(Math.sin(x*.085+y*.052+dex*.7)+1)*.5;
    p[0]+=nebula*16*lum;p[2]+=nebula*23*lum;
    const star=hash(x,y,dex+7)%263===1;
    if(star&&lum>.19)p=[191+53*lum,222+33*lum,255];
  }
  if(style==='gold'&&hash(x,y,dex)%179===0&&lum>.3)p=[255,251,206];
  if(style==='shadow'&&hash(x,y,dex+9)%347===0&&lum>.27)p=[157,88,218];
  if(style==='crimson'&&hash(x,y,dex+13)%251===0&&lum>.3)p=[255,175,100];
  // Outline colors stay nearly black, not bright overlapping shapes.
  if(lum<.1)p=p.map((v,i)=>v*(.22+lum*.8)+(i===2?4:0));
  return p.map(v=>Math.round(clamp(v)));
}
function supported(dex,style){
  return FAMILIES.includes(style)&&Number.isInteger(Number(dex))&&!!(window.G&&G.SPRITE_META&&G.SPRITE_META[Number(dex)]&&G.SPRITE_META[Number(dex)].a);
}
function pixelize(pixels,width,height,style,dex){
  if(!PRESETS[style]||!pixels||pixels.length!==width*height*4)throw Error('Invalid cosmetic source buffer');
  // Recolor ALL opaque silhouette pixels. Transparent pixels remain unchanged.
  for(let y=0,i=0;y<height;y++){
    for(let x=0;x<width;x++,i+=4){
      const a=pixels[i+3];if(a===0)continue;
      const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      const lum=(.2126*r+.7152*g+.0722*b)/255;
      const p=palette(style,x,y,dex,lum);
      pixels[i]=p[0];pixels[i+1]=p[1];pixels[i+2]=p[2];
    }
  }
  return pixels;
}
function entryKey(dex,anim,shiny,skin){return dex+'/'+anim+(shiny?'/s':'')+'/'+skin;}
function get(dex,anim,shiny,skin){
  if(!supported(dex,skin))return null;
  const sprites=window.G&&G.Sprites;
  if(!sprites||!sprites.sheet||!sprites.animMeta)return null;
  const meta=sprites.animMeta(dex,anim,shiny);
  if(!meta||meta.w*meta.n*meta.h*meta.r>MAX_PIXELS)return null;
  const s=sprites.sheet(dex,anim,shiny);
  if(!s||!s.ready||!s.img||!s.img.naturalWidth)return null;
  const key=entryKey(dex,anim,shiny,skin),old=CACHE.get(key);
  if(old&&old.source===s.img){
    hits++;CACHE.delete(key);CACHE.set(key,old);return old;
  }
  CACHE.delete(key);misses++;
  const w=meta.w*meta.n,h=meta.h*meta.r;
  if(s.img.naturalWidth!==w||s.img.naturalHeight!==h)return null;
  const can=document.createElement('canvas');
  can.width=w;can.height=h;
  const ctx=can.getContext&&can.getContext('2d',{willReadFrequently:true});
  if(!ctx||!ctx.getImageData||!ctx.putImageData)return null;
  try{
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(s.img,0,0,w,h);
    const image=ctx.getImageData(0,0,w,h);
    pixelize(image.data,w,h,skin,Number(dex));
    ctx.putImageData(image,0,0);
  }catch(_){failures++;return null;} // SecurityErrors / memory: legacy renderer continues.
  const item={canvas:can,source:s.img,meta};
  CACHE.set(key,item);created++;
  while(CACHE.size>MAX_CACHE)CACHE.delete(CACHE.keys().next().value);
  return item;
}
function draw(ctx,anim,x,y,opts,skin){
  if(!ctx||!anim||!anim.cosmicPlayer||!ctx.drawImage)return false;
  const style=typeof skin==='string'?skin:skin&&skin.id;
  if(!supported(anim.dex,style))return false;
  const sprites=window.G&&G.Sprites;
  const item=get(anim.dex,anim.cur,anim.shiny,style);
  if(!item)return false;
  const m=item.meta,k=sprites.PX*anim.scale;
  if(!Number.isFinite(k)||k<=0)return false;
  const col=Math.max(0,Math.min(m.n-1,Math.floor(Number(anim.frame)||0)));
  const row=Math.max(0,Math.min(m.r-1,Math.floor(Number(anim.dir)||0)));
  const dx=Math.round(x-m.ax*k),dy=Math.round(y-m.ay*k);
  ctx.save();
  try{
    const opacity=opts&&opts.alpha!=null?Number(opts.alpha):1;
    if(opacity<=0){ctx.restore();return true;}
    ctx.globalAlpha*=opacity;
    ctx.drawImage(item.canvas,col*m.w,row*m.h,m.w,m.h,dx,dy,m.w*k,m.h*k);
    // Original game uses a half-strength WHITE flash on hurt (softFlash).
    // Keep that feedback without letting the original body color show.
    if(opts&&opts.flash&&opts.softFlash&&sprites.white){
      const source=sprites.sheet(anim.dex,anim.cur,anim.shiny);
      if(source&&source.ready){
        ctx.globalAlpha*=.55;
        ctx.drawImage(sprites.white(source.img),col*m.w,row*m.h,m.w,m.h,dx,dy,m.w*k,m.h*k);
      }
    }
    ctx.restore();return true;
  }catch(_){ctx.restore();failures++;return false;}
}
function clear(){CACHE.clear();}
window.CosmicUniversalAtlas={
  supported,draw,clear,pixelize,palette,
  coverage(){
    const meta=window.G&&G.SPRITE_META||{},dexes=Object.keys(meta).filter(k=>meta[k]&&meta[k].a);
    return {species:dexes.length,materials:FAMILIES.length,possibleLooks:dexes.length*FAMILIES.length,
      cache:CACHE.size,hits,misses,created,failures,mode:'generated-on-demand'};
  }
};
})();
