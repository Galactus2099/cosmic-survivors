/* Cosmic Survivors Classic — species-aware cosmetic ornaments.
 * PROCEDURAL fan-game VFX attached to authentic SpriteCollab animations.
 * No claim of new sprite-sheet files or canonical alternate Pokemon forms.
 * Works on frames of different sizes via feet anchor (ax,ay), and is
 * deliberately limited to four species before expanding art coverage.
 */
(() => {
  'use strict';
  const TAU=Math.PI*2;
  const SUPPORTED=new Set([150,6,94,448]); // Mewtwo, Charizard, Gengar, Lucario
  const TINT={
    prismatic:['#81f9f4','#ff90d7','#fae798','#af96ff'],
    galaxy:['#7fdfff','#d7a1ff','#f6edff','#4e54b7'],
    gold:['#e6ae3c','#fff1ab','#b97a24','#fffdf0'],
    shadow:['#54248b','#b679f6','#170d2f','#dba8ff'],
    crimson:['#a91a49','#ffc267','#230921','#f64e73']
  };
  function supported(dex){return SUPPORTED.has(Number(dex));}
  const signatures={
    150:'Psychic crown / shoulder crystals / chest core / arm cuffs',
    6:'Dragon brow / armored wing joints / chest jewel / ember tips',
    94:'Spectral horn tips / cheek plates / shadow belly sigil',
    448:'Aura ear guards / shoulder plates / chest sigil / wrist blades'
  };
  const layouts={
    // Frame-relative coordinates, in original sprite pixels, from feet anchor.
    150:{head:[0,-25],left:[-10,-16],right:[10,-16],core:[0,-12],arms:[[-11,-6],[11,-6]],far:[-16,-7],wide:12},
    6:{head:[3,-21],left:[-13,-14],right:[13,-14],core:[0,-11],arms:[[-9,-3],[9,-3]],far:[-19,-6],wide:16},
    94:{head:[0,-23],left:[-13,-16],right:[13,-16],core:[0,-11],arms:[[-13,-8],[13,-8]],far:[-14,-3],wide:16},
    448:{head:[0,-26],left:[-11,-17],right:[11,-17],core:[0,-13],arms:[[-12,-6],[12,-6]],far:[-15,-5],wide:11}
  };
  function polygon(c,points,fill,outline,width=1){
    c.beginPath();c.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
    c.closePath();c.fillStyle=fill;c.fill();
    if(outline){c.strokeStyle=outline;c.lineWidth=width;c.stroke();}
  }
  function crystal(c,x,y,r,color,edge,tilt=0){
    c.save();c.translate(x,y);c.rotate(tilt);
    polygon(c,[[0,-r*1.5],[r*.78,-r*.3],[r*.58,r],[0,r*1.34],[-r*.74,r*.67],[-r*.85,-r*.55]],color,edge,1);
    c.globalAlpha=.7;
    polygon(c,[[0,-r*1.5],[r*.78,-r*.3],[0,r*1.34]],'#ffffff80',null);
    c.globalAlpha=.8;c.strokeStyle='#fff9';c.lineWidth=.75;
    c.beginPath();c.moveTo(0,-r*1.5);c.lineTo(0,r*1.34);c.stroke();c.restore();
  }
  function star(c,x,y,r,color){
    c.strokeStyle=color;c.lineWidth=Math.max(.7,r*.2);
    c.beginPath();c.moveTo(x-r,y);c.lineTo(x+r,y);c.moveTo(x,y-r);c.lineTo(x,y+r);c.stroke();
    c.fillStyle=color;c.beginPath();c.arc(x,y,Math.max(.6,r*.18),0,TAU);c.fill();
  }
  function crescent(c,x,y,r,color){
    c.save();c.strokeStyle=color;c.lineWidth=1.4;
    c.beginPath();c.arc(x,y,r,-.85*Math.PI,.8*Math.PI);c.stroke();c.restore();
  }
  function crown(c,head,colors,style,t,dir,dex){
    const [hx,hy]=head;
    if(style==='prismatic'){
      crystal(c,hx,hy-6,2.9,colors[0],'#ffffff',0);
      crystal(c,hx-5,hy-3,2,colors[1],'#fff',-.27);
      crystal(c,hx+5,hy-3,2,colors[3],'#fff',.27);
      if(dex===448||dex===150){ // species-specific pointed psychic/aura headband
        c.strokeStyle='#e5ffff';c.lineWidth=1;
        c.beginPath();c.moveTo(hx-7,hy);c.lineTo(hx,hy-2.1);c.lineTo(hx+7,hy);c.stroke();
      }
    }else if(style==='galaxy'){
      crescent(c,hx,hy-5,5,'#c7b5ff');
      star(c,hx+5,hy-10,2.6,'#e4ffff');
      star(c,hx-6,hy-6,1.6,'#8ce6ff');
    }else if(style==='gold'){
      polygon(c,[[hx-7,hy-2],[hx-7,hy-6],[hx-4,hy-4],[hx-2,hy-10],[hx,hy-5],[hx+2,hy-11],[hx+5,hy-5],[hx+7,hy-7],[hx+7,hy-2]],colors[0],'#fff3ba');
      c.fillStyle=colors[1];c.fillRect(hx-1,hy-4,2,2);
    }else if(style==='shadow'){
      polygon(c,[[hx-7,hy-1],[hx-6,hy-7],[hx-2,hy-14],[hx-2,hy-3]],colors[2],colors[1]);
      polygon(c,[[hx+7,hy-1],[hx+6,hy-7],[hx+2,hy-14],[hx+2,hy-3]],colors[2],colors[1]);
      c.globalAlpha=.9;c.strokeStyle=colors[1];c.lineWidth=.9;
      c.beginPath();c.moveTo(hx-3,hy-2);c.lineTo(hx,hy-5);c.lineTo(hx+3,hy-2);c.stroke();
    }else if(style==='crimson'){
      polygon(c,[[hx-6,hy-1],[hx-7,hy-8],[hx-4,hy-13],[hx-3,hy-5],[hx,hy-4],[hx+3,hy-5],[hx+4,hy-13],[hx+7,hy-8],[hx+6,hy-1]],colors[2],colors[3]);
      star(c,hx,hy-4,2,'#ffbd85');
    }
  }
  function plates(c,layout,colors,style,t,dex){
    const b=[layout.left,layout.right];
    for(let i=0;i<b.length;i++){
      const [x,y]=b[i],side=i?1:-1;
      if(style==='prismatic'){
        crystal(c,x,y,3.7,i?colors[3]:colors[0],'#ffffff',side*.35);
        crystal(c,x+side*3,y+5,2,colors[1],'#defaff',side*.25);
      }else if(style==='galaxy'){
        polygon(c,[[x-side*2,y-3],[x+side*3,y-2],[x+side*5,y+4],[x-side*1,y+3]],colors[3],colors[1]);
        star(c,x+side,y-1,2.5,'#eaf4ff');
        star(c,x-side*3,y+2,1.3,colors[0]);
      }else if(style==='gold'){
        polygon(c,[[x-side*5,y-1],[x-side*2,y-5],[x+side*4,y-4],[x+side*5,y+4],[x-side*4,y+5]],colors[0],colors[1]);
        c.strokeStyle='#fff4ae';c.lineWidth=1;
        c.beginPath();c.moveTo(x-side*3,y-2);c.lineTo(x+side*2,y+2);c.stroke();
      }else if(style==='shadow'){
        polygon(c,[[x-side*5,y-5],[x-side*4,y-12],[x+side*2,y-4],[x+side*4,y+4],[x-side*3,y+3]],colors[2],colors[1]);
        c.globalAlpha=.55;star(c,x,y,2,colors[3]);c.globalAlpha=1;
      }else if(style==='crimson'){
        polygon(c,[[x-side*5,y-4],[x-side*4,y-10],[x+side*2,y-6],[x+side*5,y+4],[x-side*3,y+3]],colors[2],colors[3]);
        c.strokeStyle=colors[1];c.lineWidth=1;c.beginPath();c.moveTo(x-side*3,y-3);c.lineTo(x+side*3,y+2);c.stroke();
      }
    }
    if(dex===6){
      // Wing hinge ornaments: tucked inside the animation sprite area.
      for(const side of [-1,1]){
        const x=side*layout.wide,y=-19;
        if(style==='prismatic')crystal(c,x,y,3.2,colors[2],colors[0],side*.3);
        else if(style==='gold'||style==='crimson'){
          polygon(c,[[x,y-7],[x+side*4,y+1],[x-side*3,y+4]],colors[0],colors[1]);
        }else{star(c,x,y,2.8,colors[1]);}
      }
    }else if(dex===448){
      // Lucario's unmistakable small forehead-to-shoulder aura chevrons.
      c.strokeStyle=colors[1];c.lineWidth=1.4;
      c.beginPath();c.moveTo(-7,-21);c.lineTo(-10,-26);c.moveTo(7,-21);c.lineTo(10,-26);c.stroke();
    }else if(dex===94){
      // Ectoplasmic cheek crests fitted around Gengar's broad head.
      c.globalAlpha=.76;c.strokeStyle=colors[1];c.lineWidth=1.2;
      c.beginPath();c.moveTo(-13,-18);c.lineTo(-17,-23);c.moveTo(13,-18);c.lineTo(17,-23);c.stroke();c.globalAlpha=1;
    }
  }
  function core(c,layout,colors,style,t,dir,dex){
    const [cx,cy]=layout.core;
    // Back-facing frames conceal the front emblem, but keep silhouette pieces.
    if(dir===3||dir===4||dir===5)return;
    if(style==='prismatic'){
      crystal(c,cx,cy,3.4,colors[2],'#ffffff',Math.sin(t)*.12);
      c.globalAlpha=.56;c.strokeStyle=colors[1];c.lineWidth=.8;
      c.beginPath();c.arc(cx,cy,5.5,0,TAU);c.stroke();c.globalAlpha=1;
    }else if(style==='galaxy'){
      c.fillStyle='#100d39';c.beginPath();c.arc(cx,cy,5,0,TAU);c.fill();
      crescent(c,cx,cy,4.8,colors[0]);star(c,cx+1.5,cy-1.4,2.8,'#ffffff');
    }else if(style==='gold'){
      polygon(c,[[cx,cy-6],[cx+5,cy],[cx,cy+6],[cx-5,cy]],colors[0],colors[1],1.5);
      star(c,cx,cy,2.6,'#fffac7');
    }else if(style==='shadow'){
      polygon(c,[[cx,cy-6],[cx+4,cy],[cx,cy+5],[cx-4,cy]],colors[2],colors[1]);
      c.strokeStyle=colors[3];c.lineWidth=1;
      c.beginPath();c.moveTo(cx-2,cy);c.lineTo(cx,cy-3);c.lineTo(cx+2,cy);c.lineTo(cx,cy+3);c.stroke();
    }else if(style==='crimson'){
      c.fillStyle=colors[2];c.beginPath();c.arc(cx,cy,5,0,TAU);c.fill();
      polygon(c,[[cx,cy-5],[cx+3,cy],[cx,cy+5],[cx-3,cy]],colors[0],colors[1]);
    }
  }
  function cuffs(c,layout,colors,style,t,dex){
    for(const [x,y] of layout.arms){
      if(style==='prismatic')crystal(c,x,y,2.0,colors[0],colors[2],.35);
      else if(style==='galaxy')star(c,x,y,2.4,colors[0]);
      else if(style==='gold'){c.fillStyle=colors[0];c.fillRect(x-3,y-1,6,3);c.strokeStyle=colors[1];c.strokeRect(x-3,y-1,6,3);}
      else if(style==='shadow'){c.globalAlpha=.6;star(c,x,y,2.5,colors[1]);c.globalAlpha=1;}
      else if(style==='crimson'){polygon(c,[[x-3,y+1],[x-1,y-3],[x+2,y-4],[x+3,y+2]],colors[2],colors[3]);}
    }
    if(dex===150&&style==='prismatic'){
      // Mewtwo's psychic tail ring: follows body rather than screen.
      c.globalAlpha=.8;c.strokeStyle=colors[1];c.lineWidth=1.2;
      c.beginPath();c.ellipse(layout.far[0],layout.far[1],5,2.2,-.3,0,TAU);c.stroke();c.globalAlpha=1;
    }
    if(dex===6&&style==='crimson'){
      const [x,y]=layout.far;
      polygon(c,[[x,y-6],[x+2,y-13],[x+4,y-7],[x+5,y-1],[x-3,y+1]],'#e93a5b',colors[1]);
    }
  }
  function apply(ctx,anim,skin,m,k,t,pad=0){
    if(!ctx||!anim||!skin||!m||!Number.isFinite(k)||k<=0)return false;
    const dex=Number(anim.dex);
    const id=typeof skin==='string'?skin:skin.id;
    const layout=layouts[dex],colors=TINT[id];
    if(!layout||!colors||anim.cur==='Faint')return false;
    // Do not decorate fallback frames or unsupported species.
    const dir=Math.max(0,Math.min(7,Number(anim.dir)||0));
    ctx.save();
    ctx.translate(m.ax*k+pad,m.ay*k+pad);
    ctx.scale(k,k);
    if(dir===6||dir===7||dir===5)ctx.scale(-1,1);
    // Slight movement is tied to the animated frame, never screen pixels.
    const move=anim.cur==='Walk'||anim.cur==='Run';
    const bob=move?Math.sin((anim.frame||0)*Math.PI/3)*.65:0;
    ctx.translate(0,bob);
    crown(ctx,layout.head,colors,id,t,dir,dex);
    plates(ctx,layout,colors,id,t,dex);
    core(ctx,layout,colors,id,t,dir,dex);
    cuffs(ctx,layout,colors,id,t,dex);
    ctx.restore();
    return true;
  }
  window.CosmicSpeciesArt={apply,supported,signatures};
})();