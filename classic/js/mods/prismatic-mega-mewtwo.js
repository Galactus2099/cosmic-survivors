/* Prismatic Mega Mewtwo X/Y animation atlases.
 * Unofficial derivative SpriteCollab sprites — see classic/CREDITS.md.
 * Only transforms the current local player's #150 with skin 'prismatic'.
 * Falls back safely to ordinary Prismatic art if image loading fails.
 */
(() => {
'use strict';
const ROOT='assets/mega-variants/150/prismatic/';
const ANIMS=new Set(['Idle','Walk','Attack','Shoot','Charge','Hurt','Faint']);
const CACHE=new Map(),PAD=16,VERSION=1,TAU=Math.PI*2;
const PALETTE={
  x:{rim:'#75ecfa',accent:'#ff88cf',shine:'#fff1b5'},
  y:{rim:'#f8a4fa',accent:'#98e4ff',shine:'#fff9df'}
};
function formNow(){
  const p=window.G&&G.Game&&G.Game.player;
  return p&&Number(p.dex)===150&&p.cosmicForm&&
    ['x','y'].includes(p.cosmicForm.form)?p.cosmicForm.form:null;
}
function applicable(anim,skin){
  const id=typeof skin==='string'?skin:skin&&skin.id;
  return !!(anim&&anim.cosmicPlayer&&Number(anim.dex)===150&&id==='prismatic'&&formNow());
}
function acquire(form,animation){
  if(!PALETTE[form]||!ANIMS.has(animation))return null;
  const name=form+'/'+animation;
  if(CACHE.has(name))return CACHE.get(name);
  const img=new Image(),entry={img,ready:false,failed:false};
  CACHE.set(name,entry);
  img.onload=()=>{entry.ready=true;entry.failed=false;};
  img.onerror=()=>{entry.ready=false;entry.failed=true;};
  img.src=ROOT+name+'.png?v='+VERSION;
  return entry;
}
function warmup(form){
  if(!PALETTE[form])return false;
  for(const name of ['Idle','Walk','Attack','Hurt'])acquire(form,name);
  return true;
}
function drawSprite(ctx,anim,x,y,opts,skin){
  if(window.CosmicSpriteAtlas&&window.CosmicSpriteAtlas.mode==='off')return false;
  if(!applicable(anim,skin))return false;
  const form=formNow(),a=acquire(form,anim.cur);
  if(!a||!a.ready||a.failed)return false;
  const sprites=window.G&&G.Sprites;
  const m=sprites&&sprites.animMeta&&sprites.animMeta(anim.dex,anim.cur,anim.shiny);
  const k=sprites&&sprites.PX*anim.scale;
  if(!m||!Number.isFinite(k)||k<=0)return false;
  const fw=m.w+PAD*2,fh=m.h+PAD*2;
  if(a.img.naturalWidth!==fw*m.n||a.img.naturalHeight!==fh*m.r)return false;
  const col=Math.max(0,Math.min(m.n-1,Math.floor(anim.frame||0)));
  const row=Math.max(0,Math.min(m.r-1,Math.floor(anim.dir||0)));
  const alpha=ctx.globalAlpha,filter=ctx.filter;
  try{
    if(opts&&opts.alpha!=null)ctx.globalAlpha*=opts.alpha;
    if(opts&&opts.flash)ctx.filter='brightness(2)';
    ctx.drawImage(a.img,col*fw,row*fh,fw,fh,
      Math.round(x-(m.ax+PAD)*k),Math.round(y-(m.ay+PAD)*k),
      fw*k,fh*k);
  }catch(_){ctx.globalAlpha=alpha;ctx.filter=filter;return false;}
  ctx.globalAlpha=alpha;ctx.filter=filter;
  return true;
}
function orbit(ctx,x,y,rx,ry,stroke,angle,start,end,alpha){
  ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=stroke;
  ctx.lineWidth=1.7;ctx.beginPath();
  ctx.ellipse(x,y,rx,ry,angle,start,end);
  ctx.stroke();ctx.restore();
}
function glint(ctx,x,y,r,color,opacity){
  ctx.save();ctx.globalAlpha*=opacity;ctx.strokeStyle=color;
  ctx.lineWidth=1.1;ctx.beginPath();
  ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);
  ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);
  ctx.stroke();ctx.restore();
}
function underlay(ctx,anim,x,y){
  if(!anim.cosmicPrismaticMegaActive||anim.cur==='Faint')return;
  const form=formNow();if(!form)return;
  const p=PALETTE[form],scale=G.Sprites.PX*(anim.scale||1),r=19*scale;
  const t=performance.now()/1000;
  orbit(ctx,x,y-12*scale,r*1.13,r*.36,p.rim,.10+Math.sin(t*.5)*.08,
    Math.PI,2*Math.PI,.26);
}
function aura(ctx,anim,x,y){
  if(!anim.cosmicPrismaticMegaActive||anim.cur==='Faint')return;
  const form=formNow();if(!form)return;
  const c=PALETTE[form],scale=G.Sprites.PX*(anim.scale||1),r=19*scale;
  const t=performance.now()/1000,yy=y-12*scale;
  // Restraint: one lower semi-orbit, small glints, no character-obscuring
  // spinning diamond icons. The primary form changes are in the PNG artwork.
  orbit(ctx,x,yy,r*1.13,r*.36,c.rim,.10+Math.sin(t*.5)*.08,
    0,Math.PI,.52);
  orbit(ctx,x,yy,r*1.28,r*.38,c.accent,-.12,
    0,Math.PI,.38);
  for(let i=0;i<4;i++){
    const a=(i/4)*TAU+t*.43;
    glint(ctx,x+Math.cos(a)*r*1.43,yy+Math.sin(a)*r*.67-4*scale,
      (i%2?1.8:2.6)*scale,i%2?c.shine:c.rim,
      .3+.36*(.5+.5*Math.sin(t*1.9+i)));
  }
}
window.CosmicMegaPrismatic={
  applicable,formNow,drawSprite,underlay,aura,warmup,
  status(){
    const o={ready:0,pending:0,failed:0};
    for(const e of CACHE.values())o[e.failed?'failed':e.ready?'ready':'pending']++;
    return o;
  }
};
})();