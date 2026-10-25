/* Cosmic Survivors Classic — animated material shaders for 5 cosmetic families.
 * Enhances original SpriteCollab frame pixels at draw time. No sprite art is
 * duplicated, and original Walk/Attack/Hurt/Faint animations remain intact.
 * These are procedural skin effects, not bespoke replacement sprite sheets.
 */
(() => {
  'use strict';
  const TAU=Math.PI*2;
  const palette={
    shadow:['#080714','#3f1c75','#b277ef'],
    gold:['#482810','#e3a735','#fff3b4'],
    prismatic:['#ff679e','#68eafa','#ffd46d'],
    galaxy:['#080e2b','#5434a4','#87c1ff'],
    crimson:['#180817','#a81c4d','#f8bb6a']
  };
  const filters={
    shadow:'grayscale(.65) brightness(.75) contrast(1.35)',
    gold:'sepia(.85) saturate(1.65) brightness(1.08)',
    prismatic:'saturate(1.15) contrast(1.08)',
    galaxy:'saturate(.8) brightness(.84) hue-rotate(20deg)',
    crimson:'saturate(1.15) contrast(1.18)'
  };
  const temp=document.createElement('canvas');
  const tex=temp.getContext&&temp.getContext('2d',{alpha:true});
  function random(seed){
    const q=Math.sin(seed*127.1+34.7)*43758.5453;
    return q-Math.floor(q);
  }
  function linear(c,x0,y0,x1,y1,stops){
    const g=c.createLinearGradient(x0,y0,x1,y1);
    for(const [pos,col] of stops)g.addColorStop(pos,col);
    return g;
  }
  function point(c,x,y,r,col){
    c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  }
  function spark(c,x,y,r,col){
    c.strokeStyle=col;c.lineWidth=Math.max(1,r*.25);
    c.beginPath();c.moveTo(x-r,y);c.lineTo(x+r,y);c.moveTo(x,y-r);c.lineTo(x,y+r);c.stroke();
  }
  function facets(c,w,h,t){
    const colors=['#ffd87d','#77fcff','#ec8cff','#93c1ff','#ff9bb6','#beffbd'];
    for(let i=0;i<19;i++){
      const u=random(i+13.4)*w,v=random(i+93.1)*h;
      const r=Math.max(8,w*.14+random(i+4.9)*w*.22);
      const a=(i%5)*1.11+t*.08;
      c.fillStyle=colors[(i+Math.floor(t*.7))%colors.length];
      c.globalAlpha=.15+.15*(.5+.5*Math.sin(t*1.4+i));
      c.beginPath();c.moveTo(u,v);
      c.lineTo(u+Math.cos(a)*r,v+Math.sin(a)*r);
      c.lineTo(u+Math.cos(a+2.3)*r*.7,v+Math.sin(a+2.3)*r*.7);
      c.closePath();c.fill();
      c.strokeStyle='#ffffff';c.lineWidth=1;c.globalAlpha=.18;c.stroke();
    }
  }
  function starfield(c,w,h,t){
    for(let i=0;i<65;i++){
      const u=(random(i*12.73+1)*w+t*(1+i%4)*1.8)%w;
      const v=(random(i*18.3+3)*h+t*(i%3+1)*.35)%h;
      const r=(i%9===0?2.1:.7)+(i%3)*.19;
      c.globalAlpha=.3+.68*(.5+.5*Math.sin(t*1.9+i*1.73));
      if(i%9===0)spark(c,u,v,r+1.9,i%2?'#f8edff':'#a9efff');
      else point(c,u,v,r,i%3?'#e5cbff':'#ffffff');
    }
  }
  function material(c,id,w,h,t){
    c.save();
    c.globalCompositeOperation='source-atop';
    if(id==='prismatic'){
      const sway=(Math.sin(t*.88)+1)*.22;
      c.globalAlpha=.78;
      c.fillStyle=linear(c,-w*.3+w*sway,-h*.1,w*1.25+w*sway,h*1.2,[
        [0,'#fb5889'],[.16,'#fbc36b'],[.34,'#ecfbaa'],[.51,'#73f8ed'],
        [.67,'#8fa8ff'],[.84,'#d98cfc'],[1,'#ff9db9']]);
      c.fillRect(0,0,w,h);
      facets(c,w,h,t);
      c.globalAlpha=.3;c.fillStyle=linear(c,w*.1,0,w*.8,h,[
        [0,'#ffffff00'],[.37,'#ffffff00'],[.45,'#ffffffcc'],[.51,'#ffffff00'],[1,'#ffffff00']
      ]);c.fillRect(0,0,w,h);
      for(let i=0;i<19;i++){
        const x=random(i+22.3)*w,y=random(i+35.9)*h;
        c.globalAlpha=.35+.55*(.5+.5*Math.sin(t*2.5+i*1.5));
        spark(c,x,y,2+i%3,i%2?'#ffffff':'#fffdc1');
      }
    } else if(id==='galaxy'){
      c.globalAlpha=.81;
      c.fillStyle=linear(c,w*(.2+.08*Math.sin(t*.4)),0,w*.8,h,[
        [0,'#10122a'],[.27,'#3d1a82'],[.49,'#3a54bb'],[.68,'#161144'],[1,'#080f32']]);
      c.fillRect(0,0,w,h);
      c.globalAlpha=.31;c.fillStyle=linear(c,0,h*.2,w,h*.85,[
        [0,'#9a52f8aa'],[.48,'#f053c34d'],[.75,'#62caffae'],[1,'#42056833']]);
      c.fillRect(0,0,w,h);
      starfield(c,w,h,t);
    } else if(id==='shadow'){
      c.globalAlpha=.78;
      c.fillStyle=linear(c,0,h*.9,w,h*.12,[
        [0,'#080514'],[.4,'#151024'],[.65,'#361357'],[1,'#10071c']]);
      c.fillRect(0,0,w,h);
      c.globalAlpha=.26;
      c.fillStyle=linear(c,w*.14,0,w*.9,h,[[0,'#bd60ff'],[.5,'#44238c'],[1,'#000000']]);
      c.fillRect(0,0,w,h);
    } else if(id==='gold'){
      c.globalAlpha=.65;
      const shift=(Math.sin(t*1.5)+1)*.2;
      c.fillStyle=linear(c,-w*.22+w*shift,0,w*.88+w*shift,h*.7,[
        [0,'#3b220c'],[.16,'#c77a1b'],[.33,'#ffe48e'],[.40,'#fff9dc'],
        [.47,'#c38121'],[.69,'#f4cd69'],[1,'#634017']]);
      c.fillRect(0,0,w,h);
      c.globalAlpha=.24;c.fillStyle='#fff8c4';
      for(let i=0;i<8;i++){
        const xx=(i*w/5+t*18)%w;
        c.fillRect(xx,0,Math.max(1,w*.008),h);
      }
    } else if(id==='crimson'){
      c.globalAlpha=.78;
      c.fillStyle=linear(c,0,0,w,h,[
        [0,'#130819'],[.3,'#65122e'],[.51,'#b3234b'],[.73,'#260d35'],[1,'#080515']]);
      c.fillRect(0,0,w,h);
      c.globalAlpha=.4;c.fillStyle=linear(c,w*.1,0,w*.82,h,[
        [0,'#ffb450'],[.22,'#ec314e44'],[.62,'#7122a755'],[1,'#ffd16b']]);
      c.fillRect(0,0,w,h);
      for(let i=0;i<18;i++){
        const x=random(i+85.8)*w,y=random(i+13.2)*h;
        c.globalAlpha=.35+.5*(.5+.5*Math.sin(t*1.3+i));
        point(c,x,y,(i%4===0?1.8:.8),i%4?'#e33563':'#ffd380');
      }
    }
    c.restore();
  }
  function glow(ctx,id,x,y,size,t){
    const col=palette[id]||palette.shadow;
    const r=Math.max(13,size);
    ctx.save();
    ctx.translate(x,y);
    ctx.globalAlpha=.57;
    ctx.strokeStyle=col[1];ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,4,r*1.45,r*.45,Math.sin(t*.4)*.17,0,TAU);ctx.stroke();
    ctx.globalAlpha=.32;ctx.strokeStyle=col[2];ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,4,r*1.73,r*.56,-Math.sin(t*.45)*.3,0,TAU);ctx.stroke();
    if(id==='prismatic'){
      const rainbow=['#ff7da8','#ffe58f','#8fffc1','#87e7ff','#bda0ff'];
      for(let i=0;i<11;i++){
        const a=t*1.15+i*TAU/11,rr=r*(1.45+(i%3)*.14);
        ctx.globalAlpha=.58+.34*Math.sin(t*2+i)**2;
        spark(ctx,Math.cos(a)*rr,Math.sin(a)*r*.7-r*.8,i%3+2,rainbow[i%rainbow.length]);
      }
    } else if(id==='galaxy'){
      for(let i=0;i<17;i++){
        const a=t*.45+i*TAU/17;
        ctx.globalAlpha=.4+.35*Math.sin(t*1.4+i)**2;
        if(i%5===0)spark(ctx,Math.cos(a)*r*1.6,Math.sin(a)*r*1.25-r,2.5,'#a7eaff');
        else point(ctx,Math.cos(a)*r*1.5,Math.sin(a)*r*1.1-r,1.3,'#d9b2ff');
      }
    } else if(id==='shadow'){
      for(let i=0;i<9;i++){
        const a=i*TAU/9+t*.22;
        const rise=((t*.29+i/9)%1);
        ctx.globalAlpha=(1-rise)*.33;
        ctx.fillStyle=i%2?'#733cbd':'#241137';
        ctx.beginPath();ctx.ellipse(Math.cos(a)*r*(.6+rise),-rise*r*2-3,2+rise*4,3+rise*5,.2,0,TAU);ctx.fill();
      }
    } else if(id==='gold'){
      for(let i=0;i<7;i++){
        const a=t*.82+i*TAU/7;
        ctx.globalAlpha=.6+.3*Math.sin(t*2+i)**2;
        spark(ctx,Math.cos(a)*r*1.33,Math.sin(a)*r*.75-r*.45,2.1,i%2?'#fff2a6':'#ffcb52');
      }
    } else if(id==='crimson'){
      for(let i=0;i<10;i++){
        const a=t*.53+i*TAU/10,rr=r*(.85+.26*Math.sin(t+i));
        ctx.globalAlpha=.5+.3*(.5+.5*Math.sin(t*1.5+i));
        ctx.fillStyle=i%3?'#e94b69':'#f6ad60';
        ctx.beginPath();ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr-r*.4);
        ctx.lineTo(Math.cos(a)*rr-3,Math.sin(a)*rr-r*.4-8);
        ctx.lineTo(Math.cos(a)*rr+3,Math.sin(a)*rr-r*.4-3);
        ctx.closePath();ctx.fill();
      }
    }
    ctx.restore();
  }
  function render(base,anim,ctx,x,y,opts,skin){
    // The special Mega Galaxy artwork is active only after Charizard X/Y evolves.
    // Every other creature/skin keeps the existing original animation pipeline.
    const mega=window.CosmicMegaGalaxy&&window.CosmicMegaGalaxy.isApplicable(anim,skin);
    const prismaticMega=window.CosmicMegaPrismatic&&window.CosmicMegaPrismatic.applicable(anim,skin);
    if(anim){anim.cosmicGalaxyMegaActive=!!mega;anim.cosmicPrismaticMegaActive=!!prismaticMega;}
    if(!skin||skin.id==='normal'){base.call(anim,ctx,x,y,opts);return;}
    const id=skin.id,m=window.G&&G.Sprites&&G.Sprites.animMeta&&G.Sprites.animMeta(anim.dex,anim.cur,anim.shiny);
    const k=window.G&&G.Sprites&&G.Sprites.PX*anim.scale;
    const w=m&&Math.ceil(m.w*k),h=m&&Math.ceil(m.h*k);
    const fitted=!!(window.CosmicSpeciesArt&&window.CosmicSpeciesArt.supported&&
      window.CosmicSpeciesArt.supported(anim.dex)&&anim.cur!=='Faint');
    const pad=fitted?Math.max(6,Math.ceil(k*9)):0;
    const cw=w+pad*2,ch=h+pad*2;
    if(!tex||!m||!k||!w||!h||cw>512||ch>512||typeof ctx.drawImage!=='function'||typeof tex.createLinearGradient!=='function'){
      ctx.save();ctx.filter=filters[id]||skin.filter||'none';base.call(anim,ctx,x,y,opts);ctx.restore();return;
    }
    if(mega){
      // The partial back ring sits BEHIND Charizard's body.
      window.CosmicMegaGalaxy.drawUnderlay(ctx,anim,x,y);
      // The pre-rendered Mega frame covers the entire silhouette, head included.
      if(window.CosmicMegaGalaxy.drawSprite(ctx,anim,x,y,opts,skin))return;
    }
    if(prismaticMega){
      // New Mewtwo X/Y crystal wings and armor are actual pre-rendered frame
      // pixels, not props hovering over a normal Prismatic Mewtwo body.
      window.CosmicMegaPrismatic.underlay(ctx,anim,x,y);
      if(window.CosmicMegaPrismatic.drawSprite(ctx,anim,x,y,opts,skin))return;
    }

    // Pixel-baked Mewtwo variants are real standalone transparent animation
    // atlases. When ready, draw them directly without piling procedural
    // material/crown layers over the hand-placed crystals and stars.
    if(window.CosmicSpriteAtlas&&window.CosmicSpriteAtlas.draw(ctx,anim,x,y,opts,skin)){
      glow(ctx,id,x,y-7*k,Math.max(w,h)*.28,performance.now()/1000);
      return;
    }
    // Prefer generated pixel-accurate textures for every remaining Pokémon.
    // Unlike screen-space hue filters these are recolored once per SOURCE
    // animation atlas and retain outlines, geometry and all facing directions.
    // This also preserves skin during the game's white hurt-flash.
    if(window.CosmicUniversalAtlas&&window.CosmicUniversalAtlas.draw(ctx,anim,x,y,opts,skin))return;
    if(opts&&opts.flash&&!mega&&!prismaticMega){base.call(anim,ctx,x,y,opts);return;} // memory / missing source fallback
    if(temp.width!==cw)temp.width=cw;
    if(temp.height!==ch)temp.height=ch;
    tex.setTransform(1,0,0,1,0,0);
    tex.clearRect(0,0,cw,ch);
    tex.imageSmoothingEnabled=false;
    tex.save();tex.filter=filters[id]||'none';
    // Draw base frame with its feet at the same local offset as the world frame.
    base.call(anim,tex,m.ax*k+pad,m.ay*k+pad,{...opts,alpha:1});
    tex.restore();
    const t=performance.now()/1000;
    material(tex,id,cw,ch,t);
    // Additional body-specific crest/armor/gem geometry follows each sprite
    // frame's feet anchor, keeping Walk/Attack animations intact.
    // Never stack the old floating crystal crown on a Mega fallback.
    // It could detach from Mewtwo's head when the live PNG was still loading
    // or when the user deliberately switched to the old comparison shader.
    if(!mega&&!prismaticMega&&window.CosmicSpeciesArt&&window.CosmicSpeciesArt.apply){
      window.CosmicSpeciesArt.apply(tex,anim,id,m,k,t,pad);
    }
    const dx=Math.round(x-m.ax*k-pad),dy=Math.round(y-m.ay*k-pad);
    const prior=ctx.globalAlpha;
    if(opts&&opts.alpha!=null)ctx.globalAlpha*=opts.alpha;
    ctx.drawImage(temp,dx,dy);
    ctx.globalAlpha=prior;
    glow(ctx,id,x,y-7*k,Math.max(w,h)*.28,t);
  }
  window.CosmicSkinFX={render,glow,filters,palette};
})();