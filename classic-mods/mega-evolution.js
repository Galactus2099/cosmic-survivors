/* Cosmic Survivors Classic — in-run Mega / Primal / Crowned forms.
 * Independent noncommercial add-on: mechanically real transformations with
 * current animated base sprite + custom VFX; canonical form sprites are TODO.
 * Never connects to the original PokéSurvivor servers.
 */
(() => {
  'use strict';
  const ELIGIBLE=new Set([3,6,9,15,18,65,80,94,115,127,130,142,150,181,208,212,214,229,248,254,257,260,282,303,306,308,310,319,323,334,354,359,362,373,376,380,381,382,383,384,428,445,448,460,475,531,719,888,889]);
  const PRIMAL={382:'Primal Kyogre',383:'Primal Groudon'};
  const CROWN={888:'Crowned Zacian',889:'Crowned Zamazenta'};
  const TWO={6:['Mega Charizard X','Mega Charizard Y'],150:['Mega Mewtwo X','Mega Mewtwo Y']};
  const COLOR={
    fire:'#ff985e',water:'#6ce1fc',grass:'#88e39b',psychic:'#e5aaff',
    ghost:'#a07aff',dark:'#ac83e6',dragon:'#ba9bfc',electric:'#ffd96e',
    ice:'#a3f6fa',steel:'#ffdda1',fairy:'#f9a8dd',fighting:'#f69d79'
  };
  let player=null,offer=null,rollTime=0,lastWave=0,latestForm=null,dialog=null,compact=null;
  const GAME=()=>window.G&&G.Game, ACCOUNT=()=>window.G&&G.DB&&G.DB.save;
  function eligible(dex){return ELIGIBLE.has(Number(dex));}
  function typesColor(p){return COLOR[p&&p.mon&&p.mon.types&&p.mon.types[0]]||'#b998ff';}
  function formsFor(dex){
    if(PRIMAL[dex])return [{name:PRIMAL[dex],form:'primal',color:'#fbb16b',stats:[1.33,1.28,1.08,.92]}];
    if(CROWN[dex])return [{name:CROWN[dex],form:'crowned',color:'#f9d87e',stats:[1.25,1.26,1.15,.90]}];
    if(TWO[dex])return [
      {name:TWO[dex][0],form:'x',color:'#93b9ff',stats:[1.28,1.35,1.08,.90]},
      {name:TWO[dex][1],form:'y',color:'#fbd28a',stats:[1.22,1.30,1.14,.88]}
    ];
    return [{name:'Mega '+((G.DEX_BY&&G.DEX_BY[dex]&&G.DEX_BY[dex].name)||'Pokémon'),form:'mega',color:'#e4b1ff',stats:[1.28,1.30,1.11,.90]}];
  }
  function history(){
    const s=ACCOUNT();
    if(!s)return null;
    if(!s.cosmicMegaHistory||typeof s.cosmicMegaHistory!=='object')s.cosmicMegaHistory={count:0,forms:{}};
    return s.cosmicMegaHistory;
  }
  function record(form){
    const h=history();if(!h)return;
    h.count=(h.count||0)+1;
    h.forms[form.name]=(h.forms[form.name]||0)+1;
    if(G.DB&&!G.DB.guest)G.DB.commit(true);
  }
  function aura(ctx,anim,x,y){
    if(!anim.cosmicPlayer||!GAME()||!GAME().player)return;
    const pl=GAME().player,mega=pl.cosmicForm;
    if(!mega)return;
    const t=performance.now()/1000,scale=anim.scale||1;
    const rad=Math.max(19,pl.r*1.3);
    ctx.save();
    // Extra crest ornaments and wings intentionally provide a distinct form
    // silhouette without pretending to be canonical Mega artwork.
    ctx.translate(x,y-17*scale);
    ctx.globalAlpha=.85;
    ctx.strokeStyle=mega.color;ctx.lineWidth=2.5;
    for(let wing=-1;wing<=1;wing+=2){
      ctx.beginPath();
      ctx.moveTo(wing*rad*.50,-1*scale);
      ctx.quadraticCurveTo(wing*(rad+23),-23*scale,wing*(rad+14),-38*scale);
      ctx.quadraticCurveTo(wing*(rad+1),-19*scale,wing*rad*.65,-5*scale);
      ctx.stroke();
    }
    ctx.globalAlpha=.57;
    ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,-1*scale,rad+8,9*scale,t*.55,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,rad+5,16*scale,-t*.4,0,Math.PI*2);ctx.stroke();
    for(let k=0;k<7;k++){
      const a=t*.8+k*Math.PI*2/7;
      ctx.fillStyle=k%2?'#fff4c9':mega.color;
      ctx.beginPath();ctx.arc(Math.cos(a)*(rad+9),Math.sin(a)*(rad*.65)-13*scale,2.3,0,Math.PI*2);ctx.fill();
    }
    if(mega.form==='primal'||mega.form==='crowned'){
      ctx.strokeStyle='#ffe3a0';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-12,-23);ctx.lineTo(0,-34);ctx.lineTo(12,-23);ctx.stroke();
    }
    ctx.restore();
  }
  function transform(form){
    if(!player||player.dead||player.cosmicForm)return false;
    const [hp,atk,spd,cd]=form.stats;
    const oldMax=player.maxHp;
    player.maxHp=Math.round(player.maxHp*hp);
    player.hp=Math.min(player.maxHp,player.hp+(player.maxHp-oldMax)+oldMax*.2);
    player.atkMul*=atk;player.spdMul*=spd;player.cdMul*=cd;
    player.cosmicForm={name:form.name,form:form.form,color:form.color};
    player.invuln=Math.max(player.invuln||0,2.5);
    latestForm=form.name;
    record(form);
    if(G.FX&&G.FX.ring)G.FX.ring(player.x,player.y,20,160,form.color,1.4,7);
    if(G.Camera&&G.Camera.kick)G.Camera.kick(1);
    if(G.Audio&&G.Audio.sfx)G.Audio.sfx('shinyGet');
    if(G.Spawner&&G.Spawner.say)G.Spawner.say('✨ '+form.name+'! MEGA EVOLUTION!',4,true);
    drawStatus();
    return true;
  }
  function createUI(){
    if(dialog)return;
    dialog=document.createElement('div');
    dialog.id='cm-mega-choice';dialog.hidden=true;
    dialog.innerHTML='<section class="cm-mega-panel" role="dialog" aria-modal="true" aria-labelledby="cm-mega-title"><p class="cm-kicker">✦ RARE UNIQUE CARD FOUND ✦</p><h2 id="cm-mega-title">Mega Evolution</h2><p id="cm-mega-explain">Choose a form to transform for the rest of this run.</p><div id="cm-mega-forms"></div><button type="button" id="cm-mega-later">Not now · skip Mega</button></section>';
    document.body.appendChild(dialog);
    // Block the original game hotkeys while its simulation is paused here.
    if(typeof window.addEventListener==='function'){
      window.addEventListener('keydown',e=>{
        if(!dialog||dialog.hidden)return;
        const key=(e.code||e.key||'').toLowerCase();
        if(['escape','keyp','digit1','digit2','numpad1','numpad2'].includes(key)){
          e.preventDefault();
          if(e.stopImmediatePropagation)e.stopImmediatePropagation();
          if(key==='escape')finish(null);
          else if(key==='digit1'||key==='numpad1'||key==='digit2'||key==='numpad2'){
            const index=(key.endsWith('2')?1:0);
            const el=dialog.querySelector('#cm-mega-forms').children[index];
            if(el&&el.click)el.click();
          }
        }
      },true);
    }
    dialog.querySelector('#cm-mega-later').onclick=()=>finish(null);
    compact=document.createElement('div');compact.id='cm-mega-status';compact.hidden=true;
    document.body.appendChild(compact);
  }
  function show(){
    if(!dialog||!offer||!player)return;
    if(G.Game.state!=='playing'||(G.UI&&G.UI.isOpen&&(['scr-levelup','scr-bond','scr-item','scr-pause'].some(id=>G.UI.isOpen(id)))))return;
    G.Game.togglePause(); // exactly pauses base engine before input is offered
    if(G.UI&&G.UI.hide)G.UI.hide('scr-pause');
    dialog.hidden=false;
    const list=dialog.querySelector('#cm-mega-forms');list.replaceChildren();
    for(const f of offer){
      const b=document.createElement('button');b.className='cm-form';b.style.setProperty('--mega-color',f.color);
      const ring=document.createElement('span');ring.className='cm-form-icon';ring.textContent=f.form==='crowned'?'♛':f.form==='primal'?'☼':'✧';
      const tt=document.createElement('strong');tt.textContent=f.name;
      const ss=document.createElement('small');const d=f.stats;ss.textContent='HP +'+Math.round((d[0]-1)*100)+'% · ATK +'+Math.round((d[1]-1)*100)+'% · SPEED +'+Math.round((d[2]-1)*100)+'% · COOL­DOWN −'+Math.round((1-d[3])*100)+'%';
      b.append(ring,tt,ss);b.onclick=()=>finish(f);
      list.appendChild(b);
    }
    (list.querySelector('button')||dialog.querySelector('#cm-mega-later')).focus();
  }
  function finish(form){
    if(!dialog||dialog.hidden)return;
    dialog.hidden=true;offer=null;
    if(form)transform(form);
    if(G.Game.state==='paused')G.Game.togglePause();
  }
  function drawStatus(){
    if(!compact)return;
    const p=GAME()&&G.Game.player;
    const mega=p&&p.cosmicForm;
    compact.hidden=!(mega&&G.Game.state!=='ui');
    if(mega)compact.textContent='✦ '+mega.name+' · ACTIVE';
  }
  function update(dt){
    const game=GAME();if(!game||game.state!=='playing'||!game.player)return;
    const p=game.player;
    if(player!==p){player=p;offer=null;rollTime=0;lastWave=0;latestForm=null;dialog.hidden=true;}
    if(!eligible(p.dex)||p.dead||p.cosmicForm)return;
    if(offer){show();return;}
    const w=window.CosmicHalloween&&window.CosmicHalloween.state&&window.CosmicHalloween.state();
    if(w&&w.waves){
      if(w.round>=20&&w.round!==lastWave){
        lastWave=w.round;
        const chance=w.round>=28||Math.random()<.24;
        if(chance)offer=formsFor(p.dex);
      }
    } else {
      const t=game.st&&game.st.time||0;
      if(t<1800)return; // 30 minutes of game time in Classic solo
      if(!rollTime)rollTime=1800;
      if(t>=rollTime){
        rollTime=t+45;
        if(t>=2040||Math.random()<.26)offer=formsFor(p.dex);
      }
    }
    if(offer)show();
  }
  function badge(){
    const s=ACCOUNT();
    const info=document.getElementById('menu-partner-info');
    if(!info)return;
    const existing=info.querySelector('.cm-capable');
    if(existing)existing.remove();
    if(s&&eligible(s.partner)){
      const span=document.createElement('span');span.className='cm-capable';
      span.textContent='✦ MEGA CAPABLE';
      info.appendChild(span);
    }
  }
  function install(){
    createUI();
    const prevStart=G.Game.startRun;
    G.Game.startRun=function(...args){const res=prevStart.apply(this,args);player=G.Game.player;rollTime=0;lastWave=0;offer=null;latestForm=null;drawStatus();return res;};
    const spawner=G.Spawner.update;
    G.Spawner.update=function(dt,players,t){const v=spawner.call(this,dt,players,t);update(dt);return v;};
    const oldMenu=G.MenuUI.open;
    G.MenuUI.open=function(...args){const res=oldMenu.apply(this,args);badge();drawStatus();return res;};
    const prevDraw=G.Sprites.Animator.prototype.draw;
    G.Sprites.Animator.prototype.draw=function(ctx,x,y,opt){prevDraw.call(this,ctx,x,y,opt);aura(ctx,this,x,y);};
    // Developer-only interface for offline unit tests, not a public in-game cheat.
    window.CosmicMega={eligible,formsFor,current:()=>player&&player.cosmicForm?player.cosmicForm:null,history};
  }
  install();
})();