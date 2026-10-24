/* Cosmic Survivors Classic — Halloween & Waves.
   Plays alongside the pinned MIT-era survivor engine. Offline/local accounts only.
   Custom event content, not the original Doofcraft server or assets. */
(() => {
  'use strict';

  const SHOP = [
    {id:'haunted-backdrop',name:'Haunted Menu',cost:12,icon:'🌒',desc:'An eerie purple-red background for the main menu.'},
    {id:'pumpkin-aura',name:'Pumpkin Aura',cost:24,icon:'🎃',desc:'Orange lantern glow follows your Pokémon in every run.'},
    {id:'spectral-trail',name:'Spectral Trail',cost:32,icon:'👻',desc:'Floating phantom sparkles during movement.'},
    {id:'shadow-mewtwo',name:'Shadow Mewtwo Pack',cost:75,icon:'🌑',dex:150,desc:'Unlocks Mewtwo plus a special shadow aura. Equip Shadow in Cosmic Wardrobe.'},
    {id:'shadow-lugia',name:'Shadow Lugia Pack',cost:95,icon:'🦇',dex:249,desc:'Unlocks Lugia plus a special shadow aura. Equip Shadow in Cosmic Wardrobe.'}
  ];
  const WAVE_LIMIT=64;
  let pendingWaves=false, waves=false, round=null;
  let lastKillsPaid=0, earnedInRun=0, nextSave=0;
  let hud=null, hudText='', shopRoot=null;

  function eventSave(){
    const s=window.G&&G.DB&&G.DB.save;
    if(!s)return null;
    if(!s.cosmicHalloween || typeof s.cosmicHalloween!=='object')s.cosmicHalloween={corn:0,unlocks:{},bestWave:0,totalCorn:0};
    const a=s.cosmicHalloween;
    a.corn=Number.isFinite(Number(a.corn))?Math.max(0,Math.floor(Number(a.corn))):0;
    a.unlocks=a.unlocks&&typeof a.unlocks==='object'?a.unlocks:{};
    a.bestWave=Number(a.bestWave)||0;
    a.totalCorn=Number(a.totalCorn)||0;
    return a;
  }
  function commit(){if(G.DB&&G.DB.save&& !G.DB.guest)G.DB.commit(true);}
  function msg(t){
    if(G.Spawner&&G.Spawner.say&&G.Game&&G.Game.state==='playing')G.Spawner.say(t,2.5,true);
    const e=document.querySelector('#hw-toast');
    if(e){e.textContent=t;e.classList.add('shown');clearTimeout(msg.timer);msg.timer=setTimeout(()=>e.classList.remove('shown'),2700);}
  }
  function addCorn(n,why){
    const s=eventSave();if(!s||n<=0)return;
    n=Math.floor(n);
    s.corn+=n;s.totalCorn+=n;earnedInRun+=n;
    commit();drawHud();
    if(why)msg('🎃 +'+n+' Candy Corn — '+why);
  }
  function checkKills(){
    const p=G.Game&&G.Game.player;
    if(!p)return;
    const total=Math.floor(Math.max(0,p.kills||0)/10);
    if(total>lastKillsPaid){const add=Math.min(999,total-lastKillsPaid);lastKillsPaid=total;addCorn(add,null);}
  }

  function playerAura(ctx,a,x,y){
    if(!a.cosmicPlayer)return;
    const s=eventSave();if(!s)return;
    const dex=Number(G.Game&&G.Game.player&&G.Game.player.dex),t=performance.now()/1000;
    const preview=window.CosmicTestLab&&window.CosmicTestLab.safe()?window.CosmicTestLab.previewUnlocks:{};
    const unlocked=k=>!!(s.unlocks[k]||preview[k]);
    const phantom=(dex===150&&unlocked('shadow-mewtwo'))||(dex===249&&unlocked('shadow-lugia'));
    const pumpkin=unlocked('pumpkin-aura'),trail=unlocked('spectral-trail');
    if(!phantom&&!pumpkin&&!trail)return;
    ctx.save();ctx.translate(x,y-6);
    if(pumpkin){ctx.strokeStyle='#ff9f45';ctx.globalAlpha=.65;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,5,24+Math.sin(t*4)*2,11,0,0,6.283);ctx.stroke();}
    if(phantom){ctx.strokeStyle='#c077ff';ctx.globalAlpha=.6;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-5,25,18,t*.7,0,6.283);ctx.stroke();}
    if(trail){ctx.globalAlpha=.75;for(let i=0;i<4;i++){const ang=t*.7+i*1.57;ctx.fillStyle=i%2?'#e0abff':'#ffc0f4';ctx.beginPath();ctx.arc(Math.cos(ang)*19,-18+Math.sin(ang*1.7)*17,2.2,0,6.283);ctx.fill();}}
    ctx.restore();
  }
  function setupAura(){
    if(!G.Player.__cosmicWrapped)return false;
    const proto=G.Sprites.Animator.prototype;
    if(proto.__halloweenWrapped)return true;
    const before=proto.draw;
    proto.draw=function(ctx,x,y,opt){
      before.call(this,ctx,x,y,opt);
      if(this.cosmicPlayer)playerAura(ctx,this,x,y);
    };
    proto.__halloweenWrapped=true;
    return true;
  }

  function startWave(){
    if(!waves)return;
    const n=round.number, boss=n%25===0;
    round.quota=Math.min(90,9+Math.round(n*1.75))+(boss?6:0);
    round.sent=0;round.timer=0;round.wait=0;round.boss=boss;round.bossSent=false;round.phase='fight';
    G.Spawner.say(boss?'⚠ BOSS WAVE '+n+'!':'🌊 Wave '+n+' — survive!',3,true);
    if(boss)G.Audio.sfx('boss');
    drawHud(true);
  }
  function advanceWave(){
    const n=round.number;
    const reward=2+Math.floor(n/4)+(round.boss?12:0);
    addCorn(reward,'Wave '+n+' complete');
    const s=eventSave();
    if(s){s.bestWave=Math.max(s.bestWave,n);commit();}
    round.phase='between';round.wait=2.7;
    G.Spawner.say('Wave '+n+' complete! 🎃 +'+reward+' Candy Corn',2.8,true);
    drawHud(true);
  }

  function spawnOne(boss){
    const player=G.Game&&G.Game.player;
    if(!player)return false;
    const clock=Math.min(1800,Math.max(0,(round.number-1)*42));
    const def=boss?G.Enemies.BOSSES[Math.min(G.Enemies.BOSSES.length-1,Math.floor(round.number/25)-1)]:G.U.pick(G.Enemies.bagAt(clock));
    if(!def)return false;
    let x,y,found=false;
    for(let i=0;i<14;i++){
      const angle=Math.random()*Math.PI*2,dist=G.Camera.outerRadius()+30+Math.random()*65;
      x=player.x+Math.cos(angle)*dist;
      y=player.y+Math.sin(angle)*dist*.90;
      if(G.World.isFree(x,y,18)||boss||G.Sprites.hovers(def.dex)){found=true;break;}
    }
    if(!found)return false;
    const scale=boss?G.Enemies.bossScale(clock):G.Enemies.scale(clock);
    const e=new G.Enemy(def,x,y,scale,boss);
    const mult=1+Math.min(2.3,round.number*.016);
    e.maxHp=Math.max(1,Math.round(e.maxHp*mult*(boss?.7:1)));
    e.hp=e.maxHp;e.dmg*=boss?.92:.85;
    e.xp=Math.round(e.xp*(boss?2:1.5));
    G.EnemyMgr.add(e);
    return true;
  }

  function tickWaves(dt,players,t){
    // Spawning pauses during a legendary Rift or scripted cutscene.
    if(G.Rift.inArena||G.Judgment.active)return;
    if(!round)return;
    if(round.phase==='between'){
      round.wait-=dt;
      if(round.wait<=0){round.number++;startWave();}
      return;
    }
    // Do not complete a wave while a boss is pending or enemies are still alive.
    if(round.boss&&!round.bossSent){
      if(spawnOne(true))round.bossSent=true;
    }
    if(round.sent<round.quota&&G.EnemyMgr.count<WAVE_LIMIT){
      round.timer-=dt;
      if(round.timer<=0){
        const max=Math.min(3,round.quota-round.sent,WAVE_LIMIT-G.EnemyMgr.count);
        let spawned=0;
        for(let i=0;i<max;i++){if(!spawnOne(false))break;spawned++;}
        round.sent+=spawned;
        round.timer=.58+Math.random()*.26;
      }
    }
    if(round.sent>=round.quota&&(!round.boss||round.bossSent)&&G.EnemyMgr.count===0)advanceWave();
    drawHud();
  }

  function drawHud(force){
    if(!hud)return;
    hud.hidden=!waves;
    if(!waves)return;
    const s=eventSave();
    const title=round?'WAVE '+round.number+(round.boss?' · BOSS':''):'WAVES';
    const status=round&&round.phase==='between'?'Next wave in '+Math.max(0,Math.ceil(round.wait))+'s':
      round?(round.sent+'/'+round.quota+' spawned · '+G.EnemyMgr.count+' alive'):'';
    const value=title+'|'+status+'|'+(s?s.corn:0)+'|'+earnedInRun;
    if(force||value!==hudText){hudText=value;hud.querySelector('.hw-title').textContent=title;hud.querySelector('.hw-status').textContent=status;hud.querySelector('.hw-corn').textContent='🎃 '+(s?s.corn:0)+' Candy Corn (+'+earnedInRun+' this run)';}
  }

  function buy(id){
    const item=SHOP.find(x=>x.id===id),s=eventSave();
    if(!s||!item)return;
    if(s.unlocks[id]){msg('Already owned');return;}
    if(s.corn<item.cost){msg('Not enough Candy Corn');return;}
    if(item.dex&&(!G.DEX_BY[item.dex])){msg('This special Pokémon is unavailable');return;}
    s.corn-=item.cost;s.unlocks[id]=true;
    if(item.dex)G.DB.grant(item.dex,'cosmic-halloween');
    commit();applyTheme();renderShop();msg(item.name+' unlocked!');
  }
  function applyTheme(){
    const s=eventSave();
    const demo=window.CosmicTestLab&&window.CosmicTestLab.safe()&&window.CosmicTestLab.previewUnlocks['haunted-backdrop'];
    document.body.classList.toggle('hw-haunted',!!(s&&(s.unlocks['haunted-backdrop']||demo)));
  }
  function renderShop(){
    if(!shopRoot)return;
    const s=eventSave();if(!s)return;
    shopRoot.querySelector('#hw-bank').textContent='🎃 '+s.corn+' Candy Corn · Best wave '+s.bestWave;
    const grid=shopRoot.querySelector('#hw-shop-items');grid.replaceChildren();
    for(const item of SHOP){
      const bought=!!s.unlocks[item.id],b=document.createElement('button');
      b.className='hw-item'+(bought?' hw-owned':'');
      b.disabled=bought;
      const h=document.createElement('span');h.className='hw-item-icon';h.textContent=item.icon;
      const info=document.createElement('span');info.className='hw-item-info';
      const title=document.createElement('strong');title.textContent=item.name;
      const desc=document.createElement('small');desc.textContent=item.desc;
      info.append(title,desc);
      const price=document.createElement('span');price.className='hw-price';price.textContent=bought?'✓ OWNED':'🎃 '+item.cost;
      b.append(h,info,price);b.onclick=()=>buy(item.id);grid.append(b);
    }
  }
  function openShop(){
    if(!eventSave()){msg('Enter a local account or guest mode first');return;}
    if(G.Game&&G.Game.state!=='ui'){msg('Finish your run before shopping');return;}
    renderShop();shopRoot.hidden=false;shopRoot.querySelector('button.hw-close').focus();
  }
  function closeShop(){shopRoot.hidden=true;}

  function makeUI(){
    if(!document.getElementById('scr-menu'))return;
    const area=document.querySelector('#scr-menu .menu-list');
    if(area&&!document.getElementById('hw-waves-start')){
      const wavesButton=document.createElement('button');
      wavesButton.className='menu-item';wavesButton.id='hw-waves-start';
      wavesButton.innerHTML='🌊 Waves Mode <small>Endless rounds · boss every 25 waves</small>';
      wavesButton.onclick=()=>{if(!G.DB.save){msg('Log in or use guest mode');return;}pendingWaves=true;G.Game.startRun();};
      const shopButton=document.createElement('button');
      shopButton.className='menu-item';shopButton.id='hw-menu-shop';
      shopButton.innerHTML='🎃 Halloween Shop <small>Candy Corn · special Pokémon · cosmetics</small>';
      shopButton.onclick=openShop;
      const playButton=area.querySelector('[data-go="play"]');if(playButton)playButton.after(wavesButton,shopButton);else area.append(wavesButton,shopButton);
    }
    hud=document.createElement('aside');hud.id='hw-waves-hud';hud.hidden=true;
    hud.innerHTML='<b class="hw-title"></b><span class="hw-status"></span><span class="hw-corn"></span>';
    document.body.appendChild(hud);
    const toast=document.createElement('div');toast.id='hw-toast';document.body.appendChild(toast);
    shopRoot=document.createElement('div');shopRoot.id='hw-shop';shopRoot.hidden=true;
    shopRoot.innerHTML='<section class="hw-shop-panel" role="dialog" aria-modal="true" aria-label="Halloween Shop"><button class="hw-close" aria-label="Close Halloween Shop">✕</button><span class="hw-eyebrow">COSMIC SURVIVORS · HAUNTING OF THE RIFT</span><h2>🎃 Halloween Shop</h2><p>Earn Candy Corn by defeating enemies in any run, plus bonuses for clearing Waves. Unlock special Pokémon and spooky cosmetic effects.</p><div id="hw-bank"></div><div id="hw-shop-items"></div><p class="hw-note">This is an independent fan-event prototype. Special shadow packs currently use the regular Pokémon sprite with a shadow aura; unique Shadow artwork, Haunted Hollow map and exact Doofcraft rules are not implemented yet. Local saves only.</p></section>';
    document.body.appendChild(shopRoot);
    shopRoot.querySelector('.hw-close').onclick=closeShop;
    shopRoot.addEventListener('click',e=>{if(e.target===shopRoot)closeShop()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!shopRoot.hidden){closeShop();e.stopPropagation();}},true);
    applyTheme();
  }

  function wrapGame(){
    if(!(G.Game&&G.Spawner&&G.RunUI))return;
    const origStart=G.Game.startRun;
    G.Game.startRun=function(...args){
      waves=pendingWaves&&!args[0];pendingWaves=false;
      round=waves?{number:1}:null;earnedInRun=0;lastKillsPaid=0;hudText='';
      const ans=origStart.apply(this,args);
      if(waves)startWave();
      drawHud(true);
      return ans;
    };
    const origSpawn=G.Spawner.update;
    G.Spawner.update=function(dt,players,t){
      if(!waves){const v=origSpawn.call(this,dt,players,t);checkKills();return v;}
      const v=tickWaves(dt,players,t);checkKills();return v;
    };
    const origJudgment=G.Judgment.update;
    G.Judgment.update=function(...args){if(waves)return;return origJudgment.apply(this,args);};
    const origOver=G.RunUI.showOver;
    G.RunUI.showOver=function(result,onBack){
      if(waves&&round){
        const finished=round.phase==='between'?round.number:Math.max(0,round.number-1);
        result.breakdown=(result.breakdown||'')+' · 🌊 Waves '+finished+' · 🎃 +'+earnedInRun+' Candy Corn';
      }
      waves=false;round=null;drawHud(true);applyTheme();
      return origOver.call(this,result,onBack);
    };
    const origMenu=G.MenuUI.open;
    G.MenuUI.open=function(...args){const o=origMenu.apply(this,args);applyTheme();return o;};
    window.CosmicHalloween={
      state:()=>({waves,round:round&&round.number,phase:round&&round.phase,corn:eventSave()&&eventSave().corn}),
      startWaves:()=>{pendingWaves=true;G.Game.startRun();},openShop,buy,applyPreview:applyTheme,
      qaSetWave(n){
        const lab=window.CosmicTestLab;
        if(!(lab&&lab.enabled&&lab.safe())||!waves||!round||G.Game.state!=='playing')return false;
        const wave=Math.max(1,Math.min(250,Math.floor(Number(n)||1)));
        G.EnemyMgr.clear();
        round.number=wave;
        startWave();return true;
      }
    };
  }

  wrapGame();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeUI);
  else makeUI();
  let artAttempts=0;
  const artTimer=setInterval(()=>{if(setupAura()||++artAttempts>=60)clearInterval(artTimer);},120);
})();
