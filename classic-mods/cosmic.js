/* Cosmic Survivors - Classic cosmetic extension. No dependencies.
   Adds player-only skins and Halloween lanterns; Mega is handled in-run. */
(() => {
  'use strict';
  const SKINS = [
    {id:'normal',title:'Original',cost:0,accent:'#fff'},
    {id:'shadow',title:'Shadow',cost:0,accent:'#ad78ff',filter:'grayscale(.8) brightness(.64) contrast(1.6) sepia(.24) hue-rotate(205deg)'},
    {id:'gold',title:'Gold',cost:30,accent:'#ffd26b',filter:'sepia(1) saturate(4.2) hue-rotate(347deg) brightness(1.28)'},
    {id:'prismatic',title:'Prismatic',cost:45,accent:'#73e7fd',filter:'saturate(3) hue-rotate(54deg) brightness(1.18)'},
    {id:'galaxy',title:'Galaxy',cost:55,accent:'#ad88ff',filter:'saturate(1.9) hue-rotate(215deg) contrast(1.3)'},
    {id:'crimson',title:'Crimson Nebula',cost:90,accent:'#fb547b',filter:'saturate(2.8) hue-rotate(304deg) contrast(1.6)'}
  ];
  const MEGA_DEX = new Set([3,6,9,15,18,65,80,94,115,127,130,142,150,181,208,212,214,229,248,254,257,260,282,303,306,308,310,319,323,334,354,359,362,373,376,380,381,384,428,445,448,460,475,531,719]);
  const KEY='cosmic.classic.fan.1';
  function read() { try { return JSON.parse(localStorage.getItem(KEY))||{}; } catch(e){return {};}}
  const save=Object.assign({skins:{},lanterns:0,mega:{},lastEarn:{},claimed:false},read());
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}
  function currentDex(){return window.G&&G.DB&&G.DB.save ? Number(G.DB.save.partner) : 0;}
  function currentSkin(){const lab=window.CosmicTestLab;return lab&&lab.enabled&&lab.safe()?lab.skin:(save.skins[currentDex()]||'normal');}
  function money(){return Number(save.lanterns)||0;}
  function installed(){return !!(window.G&&G.Player&&G.Sprites&&G.Sprites.Animator);}
  function notify(msg){ const e=document.getElementById('cosmic-toast');if(!e)return;e.textContent=msg;e.classList.add('show');clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.remove('show'),2300); }
  function chosenMega(){return false;}

  function skinEffect(ctx,a,x,y) {
    if(!a.cosmicPlayer) return;
    const s=SKINS.find(s=>s.id===currentSkin())||SKINS[0];
    if(s.id==='normal'&&!chosenMega())return;
    const t=performance.now()/1000, r=11*a.scale;
    ctx.save();
    ctx.translate(x,y-5*a.scale);
    const halo=chosenMega()?'#f5d076':s.accent;
    ctx.globalAlpha=.45;
    ctx.strokeStyle=halo;ctx.lineWidth=1.8;
    ctx.beginPath();ctx.ellipse(0,4,r*1.7,r*.65,t/2,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=.65;
    for(let i=0;i<5;i++){
      const q=t*(i%2?-.8:.65)+i*1.26;
      const rad=r*(1.15+(i%3)*.15);
      ctx.fillStyle=i%2?'#fff':halo;
      ctx.beginPath();ctx.arc(Math.sin(q)*rad, -17+Math.cos(q*1.2)*r,1.4+(i%2),0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function installHooks(){
    if(!installed() || G.Player.__cosmicWrapped)return false;
    const OriginalPlayer=G.Player;
    G.Player=class CosmicPlayer extends OriginalPlayer {
      constructor(...args){
        super(...args);
        if(this.anim) this.anim.cosmicPlayer=true;
        this.cosmicLastLanternKills=0;
      }
    };
    G.Player.__cosmicWrapped=true;
    const spriteDraw=G.Sprites.Animator.prototype.draw;
    G.Sprites.Animator.prototype.draw=function(ctx,x,y,opts={}){
      if(!this.cosmicPlayer)return spriteDraw.call(this,ctx,x,y,opts);
      const s=SKINS.find(s=>s.id===currentSkin())||SKINS[0];
      // Only the current player's animated frame is material-shaded.
      // The original sprite sheets and every enemy remain unchanged.
      if(window.CosmicSkinFX&&window.CosmicSkinFX.render){
        window.CosmicSkinFX.render(spriteDraw,this,ctx,x,y,opts,s);
      }else{
        ctx.save();
        if(s.filter)ctx.filter=s.filter;
        spriteDraw.call(this,ctx,x,y,opts);
        ctx.restore();
        skinEffect(ctx,this,x,y);
      }
    };
    const priorUpdate=G.Player.prototype.update;
    G.Player.prototype.update=function(dt){
      const answer=priorUpdate.call(this,dt);
      const gained=Math.floor((this.kills||0)/25);
      if(gained>this.cosmicLastLanternKills){
        const count=Math.min(15,gained-this.cosmicLastLanternKills);
        save.lanterns+=count;this.cosmicLastLanternKills=gained;persist();notify('🎃 +'+count+' Spirit Lantern'+(count>1?'s':'')+'!');
      }
      return answer;
    };
    return true;
  }
  function menu(){
    const overlay=document.createElement('div');
    overlay.id='cosmic-overlay';
    overlay.innerHTML='<div class="cosmic-panel" role="dialog" aria-modal="true" aria-label="Cosmic wardrobe"><button id="cosmic-close" aria-label="Close">✕</button><div class="cosmic-kicker">COSMIC SURVIVORS · FAN MOD</div><h2>Variants & Halloween</h2><p>Change your current partner\'s look. Spend Spirit Lanterns earned from every 25 enemies defeated during a run.</p><div class="cosmic-stats"></div><div class="cosmic-grid" id="cosmic-skin-grid"></div><div class="cosmic-mega" id="cosmic-mega"></div><div class="cosmic-event" id="cosmic-event"></div><p class="cosmic-footnote">Visual effects now use animated procedural textures, particles and highlights applied to the existing sprites; Mewtwo, Charizard, Gengar and Lucario have additional fitted procedural crown, armor, gem and sigil details. Hand-painted alternate sprite sheets remain future work. Mega now appears as a rare mid-run Unique card; authentic alternate Mega sprite sheets remain future work. Saves are local to this browser.</p></div>';
    document.body.appendChild(overlay);
    const button=document.createElement('button');
    button.id='cosmic-open';button.textContent='✦ Cosmic Wardrobe / Halloween';
    document.body.appendChild(button);
    const toast=document.createElement('div');toast.id='cosmic-toast';document.body.appendChild(toast);
    button.onclick=()=>{render();overlay.classList.add('open')};
    overlay.querySelector('#cosmic-close').onclick=()=>overlay.classList.remove('open');
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open')){overlay.classList.remove('open');e.stopPropagation();}});
  }
  function render(){
    const root=document.getElementById('cosmic-overlay');if(!root)return;
    const dex=currentDex(),name=window.G&&G.DEX_BY&&G.DEX_BY[dex]?G.DEX_BY[dex].name:'current partner',selected=currentSkin();
    const tailored=!!(window.CosmicSpeciesArt&&window.CosmicSpeciesArt.supported(dex));
    root.querySelector('.cosmic-stats').textContent=name+' · #'+(dex||'?')+'  |  🎃 '+money()+' Spirit Lanterns'+(tailored?' · ✦ CUSTOM BODY DETAILS':'');
    const grid=root.querySelector('#cosmic-skin-grid');grid.replaceChildren();
    for(const s of SKINS){
      const owned=s.cost===0||save.claimed||s.id===selected||!!save['skinUnlocked_'+s.id];
      const el=document.createElement('button');
      el.className='cosmic-skin'+(s.id===selected?' chosen':'');
      el.dataset.skin=s.id;
      el.dataset.fitted=tailored&&s.id!=='normal'?'1':'0';
      const descriptions={normal:'Classic sprite',shadow:'Midnight smoke & violet runes',gold:'Animated metallic light',prismatic:'Rainbow crystals & sparkles',galaxy:'Nebula clouds & starfield',crimson:'Crimson flames & gold stardust'};
      el.style.setProperty('--skin-color',s.accent);
      el.innerHTML='<span class="cosmic-orb"></span><b>'+s.title+'</b><small class="cosmic-material">'+descriptions[s.id]+'</small>'+(tailored&&s.id!=='normal'?'<small class="cosmic-fitted">✦ SPECIES DETAILS</small>':'')+'<small>'+(s.id===selected?'✓ EQUIPPED':owned?'Equip':'🎃 '+s.cost+' Lanterns')+'</small>';
      el.onclick=()=>{
        if(!owned){if(money()<s.cost){notify('Earn more Lanterns in dungeon runs!');return;}save.lanterns-=s.cost;save['skinUnlocked_'+s.id]=true;}
        if(!dex){notify('Choose a partner first');return;}
        save.skins[dex]=s.id;persist();notify(s.title+' equipped for '+name);render();
      };
      grid.appendChild(el);
    }
    const mega=root.querySelector('#cosmic-mega');
    if(MEGA_DEX.has(dex) || [382,383,888,889].includes(dex)){
      mega.innerHTML='<div><b>✨ Mega Capable</b><p>Unlock a rare transformation card after 30 minutes in Classic solo or from Wave 20 in Waves. Earn the upgrade during your run; no pre-run toggle is needed.</p></div>';
    }else{mega.innerHTML='<span>✨ Mega Evolution is available for compatible final-stage Pokémon. Try Charizard, Mewtwo, Gengar, Lucario, Kyogre or Groudon.</span>';}
    root.querySelector('#cosmic-event').innerHTML='<h3>🎃 Haunting of the Rift</h3><p>Halloween event collection: defeat enemies in a dungeon to earn Spirit Lanterns, then unlock Gold, Prismatic, Galaxy and Crimson Nebula appearances. This event stays available so you can earn cosmetics year-round.</p>';
  }
  function start(){
    menu();
    let tries=0;
    const timer=setInterval(()=>{tries++;if(installHooks()||tries>=30)clearInterval(timer)},100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
