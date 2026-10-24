/* Galaxy Mega Charizard X/Y — full-body sprite atlas and restrained cosmic FX.
 * This is unofficial derivative SpriteCollab pixel art: see CREDITS.md.
 * Gameplay never depends on these images; missing images fall back to the
 * prior procedural skin. All effects only apply after Mega Evolution.
 */
(() => {
  'use strict';
  const DIR="assets/mega-variants/6/galaxy/";
  const ANIMS=new Set(['Idle','Walk','Attack','Shoot','Charge','Hurt','Faint']);
  const CACHE=new Map();
  const PAD=14,REV=1,TAU=Math.PI*2;
  const COLORS={x:{ring:'#80e9ff',rim:'#ec9cff',planet:'#6b9fff'},
                y:{ring:'#b8a1ff',rim:'#f7b6e5',planet:'#9b87e8'}};

  function formNow(){
    const p=window.G&&G.Game&&G.Game.player;
    return p&&Number(p.dex)===6&&p.cosmicForm&&
      ['x','y'].includes(p.cosmicForm.form)?p.cosmicForm.form:null;
  }
  function isApplicable(anim,skin){
    return !!(anim&&anim.cosmicPlayer&&Number(anim.dex)===6&&
      (typeof skin==='string'?skin:skin&&skin.id)==='galaxy'&&formNow());
  }
  function acquire(form,anim){
    if(!COLORS[form]||!ANIMS.has(anim))return null;
    const key=form+'/'+anim;
    if(CACHE.has(key))return CACHE.get(key);
    const img=new Image();
    const entry={img,ready:false,failed:false};
    CACHE.set(key,entry);
    img.onload=()=>{entry.ready=true;entry.failed=false;};
    img.onerror=()=>{entry.failed=true;entry.ready=false;};
    img.src=DIR+key+'.png?v='+REV;
    return entry;
  }
  function warmup(form){
    if(!COLORS[form])return false;
    for(const anim of ['Idle','Walk','Attack','Hurt'])acquire(form,anim);
    return true;
  }
  function drawSprite(ctx,anim,x,y,opts,skin){
    if(window.CosmicSpriteAtlas&&window.CosmicSpriteAtlas.mode==='off')return false;
    if(!isApplicable(anim,skin))return false;
    const form=formNow(),a=acquire(form,anim.cur);
    if(!a||!a.ready||a.failed)return false;
    const m=window.G&&G.Sprites&&G.Sprites.animMeta&&G.Sprites.animMeta(anim.dex,anim.cur,anim.shiny);
    const k=window.G&&G.Sprites&&G.Sprites.PX*anim.scale;
    if(!m||!k||!Number.isFinite(k)||!Number.isFinite(x)||!Number.isFinite(y))return false;
    const fw=m.w+PAD*2,fh=m.h+PAD*2;
    if(a.img.naturalWidth!==fw*m.n||a.img.naturalHeight!==fh*m.r)return false;
    const i=Math.max(0,Math.min(m.n-1,Math.floor(anim.frame||0)));
    const d=Math.max(0,Math.min(m.r-1,Math.floor(anim.dir||0)));
    const oldAlpha=ctx.globalAlpha,oldFilter=ctx.filter;
    try {
      if(opts&&opts.alpha!=null)ctx.globalAlpha*=opts.alpha;
      // Hurt flash brightens GALAXY art; never falls back to orange base sprite.
      if(opts&&opts.flash)ctx.filter='brightness(2.1)';
      ctx.drawImage(a.img,i*fw,d*fh,fw,fh,
        Math.round(x-(m.ax+PAD)*k),Math.round(y-(m.ay+PAD)*k),fw*k,fh*k);
    } catch (_){
      ctx.globalAlpha=oldAlpha;ctx.filter=oldFilter;return false;
    }
    ctx.globalAlpha=oldAlpha;ctx.filter=oldFilter;
    return true;
  }
  function ring(ctx,x,y,rx,ry,angle,color,width,start,end,alpha){
    ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,start,end);
    ctx.stroke();ctx.restore();
  }
  function sparkle(ctx,x,y,s,color,alpha=1){
    ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=color;
    ctx.lineWidth=Math.max(1,s*.22);ctx.beginPath();
    ctx.moveTo(x-s,y);ctx.lineTo(x+s,y);
    ctx.moveTo(x,y-s);ctx.lineTo(x,y+s);
    ctx.stroke();ctx.restore();
  }
  function planet(ctx,x,y,r,fill,phase){
    ctx.save();
    ctx.fillStyle='#0e173e';ctx.strokeStyle='#e0c1ff';ctx.lineWidth=1.1;
    ctx.beginPath();ctx.arc(x,y,r+1.5,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.fillStyle='#e5fbff';ctx.globalAlpha=.8;
    ctx.beginPath();ctx.arc(x-r*.32,y-r*.34,Math.max(1,r*.25),0,TAU);ctx.fill();
    // The tilted half-ring follows the tiny planet, instead of a huge
    // geometrical halo obscuring Charizard's head.
    ctx.strokeStyle='#ffd6aa';ctx.lineWidth=1.45;ctx.globalAlpha=.9;
    ctx.beginPath();ctx.ellipse(x,y,r+3,r*.46,phase,.10*Math.PI,1.04*Math.PI);ctx.stroke();
    ctx.restore();
  }
  function center(anim,x,y){
    const k=window.G&&G.Sprites?G.Sprites.PX*(anim.scale||1):2;
    return {k,cx:x,cy:y-14*k,r:Math.max(18,19*k)};
  }
  function drawUnderlay(ctx,anim,x,y){
    if(!anim.cosmicGalaxyMegaActive||!formNow()||anim.cur==='Faint')return;
    const t=performance.now()/1000,{cx,cy,r}=center(anim,x,y),c=COLORS[formNow()];
    ring(ctx,cx,cy,r*1.28,r*.31,-.19+Math.sin(t*.17)*.12,c.ring,2.0,1.03*Math.PI,2.03*Math.PI,.47);
    ring(ctx,cx,cy,r*1.38,r*.39,.26,c.rim,1.0,.95*Math.PI,2.0*Math.PI,.37);
  }
  function drawAura(ctx,anim,x,y){
    if(!anim.cosmicGalaxyMegaActive||!formNow()||anim.cur==='Faint')return;
    const t=performance.now()/1000,{cx,cy,r,k}=center(anim,x,y),c=COLORS[formNow()];
    // Half-horizontal orbit plus a slanted half halo from approved concept B.
    ring(ctx,cx,cy,r*1.34,r*.32,-.19+Math.sin(t*.17)*.12,c.ring,1.7,.07*Math.PI,1.00*Math.PI,.8);
    ring(ctx,cx,cy,r*1.41,r*.40,.26,c.rim,1.55,0,.94*Math.PI,.55);
    // Two clear miniature planets; not the previous ambiguous floating cubes.
    const p1=t*.55,p2=t*.55+Math.PI*1.13;
    planet(ctx,cx+Math.cos(p1)*r*1.35,cy+Math.sin(p1)*r*.35,
      Math.max(3,3.3*k),c.planet,.3);
    planet(ctx,cx+Math.cos(p2)*r*1.38,cy+Math.sin(p2)*r*.39,
      Math.max(2,2.5*k),'#a75cec',-.4);
    // Exactly three soft star-crosses orbit outside the body.
    for(let j=0;j<3;j++){
      const phase=j*TAU/3-t*.29;
      sparkle(ctx,cx+Math.cos(phase)*r*1.53,cy+Math.sin(phase)*r*.95-5*k,
        (j%2?2.1:2.7)*k,j%2?'#f7b4ff':'#a8f7ff',
        .48+.29*(.5+.5*Math.sin(t*2+j)));
    }
  }
  const api={
    isApplicable,formNow,drawSprite,drawAura,drawUnderlay,warmup,
    status(){let ready=0,pending=0,failed=0;for(const a of CACHE.values()){
      if(a.failed)failed++;else if(a.ready)ready++;else pending++;
    }return {ready,pending,failed};}
  };
  window.CosmicMegaGalaxy=api;
})();