/* Cosmic Survivors Classic — first physically exported cosmetic frame atlases.
 * All variants are derivative fan sprites. Keep SpriteCollab CC BY-NC credits.
 * Atlas format is exactly the same as the original SpriteCollab animation PNG.
 * If a file is missing or still downloading, the normal dynamic skin renderer
 * keeps the game playable without placeholders or broken images.
 */
(() => {
 'use strict';
 const ENABLED=Object.fromEntries([6,94,150,448].map(dex=>[dex,new Set(['prismatic','galaxy'])]));
 const LOADED=new Map();
 const VERSION='2';
 let mode='auto';
 const KEY=['Idle','Walk','Attack','Shoot','Charge','Hurt','Faint'];
 const isSupported=(dex,skin)=>!!(ENABLED[Number(dex)]&&ENABLED[Number(dex)].has(skin));
 function acquire(dex,skin,anim){
   if(!isSupported(dex,skin)||!KEY.includes(anim))return null;
   const key=dex+'/'+skin+'/'+anim;
   let item=LOADED.get(key);
   if(item)return item;
   const img=new Image();
   item={img,ready:false,failed:false,key};
   img.onload=()=>{item.ready=true;item.failed=false;};
   img.onerror=()=>{item.failed=true;item.ready=false;};
   // Absolute root-relative via document.baseURI: GitHub Pages uses /classic/.
   img.src='assets/variants/'+dex+'/'+skin+'/'+anim+'.png?v='+VERSION;
   LOADED.set(key,item);
   return item;
 }
 function draw(ctx,anim,x,y,opts,skin){
   if(mode==='off'||!ctx||!anim||!skin)return false;
   const id=typeof skin==='string'?skin:skin.id;
   if(!isSupported(anim.dex,id))return false;
   const sheet=acquire(anim.dex,id,anim.cur);
   if(!sheet||!sheet.ready||sheet.failed)return false;
   const m=window.G&&G.Sprites&&G.Sprites.animMeta&&G.Sprites.animMeta(anim.dex,anim.cur,anim.shiny);
   const k=window.G&&G.Sprites&&G.Sprites.PX*anim.scale;
   if(!m||!k||!Number.isFinite(k))return false;
   // No source geometry change: the original frame timings and camera
   // positions remain identical, including hits/hurts and attack directions.
   const ix=Math.min(m.n-1,Math.max(0,Number(anim.frame)||0));
   const iy=Math.min(m.r-1,Math.max(0,Number(anim.dir)||0));
   if(sheet.img.naturalWidth!==m.w*m.n||sheet.img.naturalHeight!==m.h*m.r)return false;
   const dx=Math.round(x-m.ax*k),dy=Math.round(y-m.ay*k);
   const alpha=opts&&opts.alpha;
   const oldAlpha=ctx.globalAlpha;
   if(alpha!=null)ctx.globalAlpha*=alpha;
   try{ctx.drawImage(sheet.img,ix*m.w,iy*m.h,m.w,m.h,dx,dy,m.w*k,m.h*k);}
   catch(_){ctx.globalAlpha=oldAlpha;return false;}
   ctx.globalAlpha=oldAlpha;
   return true;
 }
 function warmup(dex=150,skin='prismatic'){
   if(!isSupported(dex,skin))return false;
   for(const a of ['Idle','Walk','Attack','Hurt'])acquire(dex,skin,a);
   return true;
 }
 const api={
   isSupported,draw,warmup,
   get mode(){return mode;},
   set mode(next){if(next==='auto'||next==='off')mode=next;},
   status(){
     const states={ready:0,pending:0,failed:0};
     for(const entry of LOADED.values())states[entry.failed?'failed':entry.ready?'ready':'pending']++;
     return states;
   }
 };
 window.CosmicSpriteAtlas=api;
})();