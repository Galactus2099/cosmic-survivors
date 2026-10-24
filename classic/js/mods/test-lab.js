/* Cosmic Survivors Classic — Guest-only Test Lab.
 * Enable via /classic/?testlab=1. Never unlocks permanent progress or spends
 * your real account's currencies. Borrowed partners last for one guest run.
 */
(() => {
'use strict';
const enabled=/(?:^|[?&])testlab=1(?:&|$)/.test(location.search||'');
const loaners=[{id:6,label:'Charizard (Mega X/Y)'},{id:150,label:'Mewtwo (Mega X/Y)'},{id:94,label:'Gengar (Mega)'},{id:448,label:'Lucario (Mega)'},{id:382,label:'Kyogre (Primal)'},{id:383,label:'Groudon (Primal)'},{id:888,label:'Zacian (Crowned)'},{id:889,label:'Zamazenta (Crowned)'},{id:3,label:'Venusaur (Mega)'},{id:9,label:'Blastoise (Mega)'}];
const variants=[{id:'normal',name:'Normal'},{id:'shadow',name:'Shadow'},{id:'gold',name:'Gold'},{id:'prismatic',name:'Prismatic'},{id:'galaxy',name:'Galaxy'},{id:'crimson',name:'Crimson Nebula'}];
const items=[{id:'haunted-backdrop',name:'Haunted menu'},{id:'pumpkin-aura',name:'Pumpkin aura'},{id:'spectral-trail',name:'Spectral trail'},{id:'shadow-mewtwo',name:'Shadow Mewtwo aura'},{id:'shadow-lugia',name:'Shadow Lugia aura'}];
const flags={};let skin='normal',panel=null,button=null,status=null,pausedByLab=false;
function safe(){return !!(enabled&&window.G&&G.DB&&G.DB.guest&&!G.DB.online);}
function toast(s){if(status)status.textContent=s;}
const api={enabled, get skin(){return safe()?skin:null;}, get previewUnlocks(){return safe()?flags:{};}, safe, borrow,startPreview,forceMega,jumpWave,open:openLab};
window.CosmicTestLab=api;
if(!enabled)return;

function openLab(){
 if(!panel)return;
 panel.hidden=false;
 if(!safe()){
   panel.querySelector('#tl-main').hidden=true;
   panel.querySelector('#tl-guest-hint').hidden=false;
   toast('Testing is available in Guest mode only. Your real save is protected.');
   return;
 }
 panel.querySelector('#tl-main').hidden=false;
 panel.querySelector('#tl-guest-hint').hidden=true;
 const inRun=G.Game&&G.Game.state!=='ui'&&G.Game.state!=='over';
 panel.querySelector('#tl-borrow').hidden=inRun;
 panel.querySelector('#tl-inrun').hidden=!inRun;
 refresh();
 if(G.Game&&G.Game.state==='playing'){G.Game.togglePause();pausedByLab=true;if(G.UI&&G.UI.hide)G.UI.hide('scr-pause');}
}
function closeLab(){
 if(!panel)return;
 panel.hidden=true;
 if(pausedByLab){pausedByLab=false;if(G.Game&&G.Game.state==='paused')G.Game.togglePause();}
}
function startPreview(dex,mode){
 if(!safe())return false;
 const s=G.DB.save,d=Number(dex);
 if(!s||!G.DEX_BY[d]){toast('That Pokémon is not in this game build.');return false;}
 if(G.Game.state!=='ui'){toast('Finish your current run before borrowing a partner.');return false;}
 skin='normal';closeLab();
 const previous={partner:s.partner,shiny:s.partnerShiny};
 try{
   s.partner=d;s.partnerShiny=false;
   if(mode==='waves'&&window.CosmicHalloween)window.CosmicHalloween.startWaves();
   else G.Game.startRun();
 }finally{s.partner=previous.partner;s.partnerShiny=previous.shiny;}
 toast('Borrowed Pokémon: #'+d+' · testing run started');
 return true;
}
function borrow(dex,mode){return startPreview(dex,mode)}
function forceMega(){
 if(!safe()||!G.Game||G.Game.state!=='playing'){toast('Start a Guest test run first.');return false;}
 if(!window.CosmicMega||!window.CosmicMega.demoOffer){toast('Mega module unavailable.');return false;}
 closeLab();
 const ok=window.CosmicMega.demoOffer();
 if(!ok)toast('A Mega choice is only available to eligible Pokémon once per run.');
 return !!ok;
}
function jumpWave(n=20){
 if(!safe()||!window.CosmicHalloween||!window.CosmicHalloween.qaSetWave){toast('Start a Guest Waves run first.');return false;}
 closeLab();
 const ok=window.CosmicHalloween.qaSetWave(n);
 if(!ok)toast('This control only works during a Waves run.');
 return !!ok;
}
function chooseSkin(v){
 if(!safe())return;
 if(!variants.some(x=>x.id===v))return;
 skin=v;if(window.CosmicSpriteAtlas&&window.CosmicSpriteAtlas.warmup)window.CosmicSpriteAtlas.warmup(G.Game&&G.Game.player?G.Game.player.dex:150,v);refresh();toast(v+' skin preview active (not purchased)');
}
function chooseItem(v){
 if(!safe())return;
 flags[v]=!flags[v];
 if(window.CosmicHalloween&&window.CosmicHalloween.applyPreview)window.CosmicHalloween.applyPreview();
 refresh();toast('Temporary preview: '+v+(flags[v]?' on':' off'));
}
function refresh(){
 if(!panel)return;
 const s=panel.querySelector('#tl-skin');if(s)s.value=skin;
 panel.querySelectorAll('[data-hw-preview]').forEach(el=>el.classList.toggle('tl-on',!!flags[el.dataset.hwPreview]));
 const compare=panel.querySelector('#tl-compare-png');
 if(compare&&window.CosmicSpriteAtlas)compare.textContent=window.CosmicSpriteAtlas.mode==='off'
   ?'↩ Procedural shader comparison (PNG OFF)':'◆ Transparent Pixel Atlas ON (Mewtwo)';
}
function makeUI(){
 button=document.createElement('button');button.id='tl-open';button.type='button';button.textContent='🔬 TEST LAB';button.onclick=openLab;
 document.body.appendChild(button);
 panel=document.createElement('div');panel.id='tl-overlay';panel.hidden=true;
 panel.innerHTML='<section id="tl-panel" role="dialog" aria-modal="true" aria-label="Cosmic Test Lab"><button id="tl-close" type="button" aria-label="Close Test Lab">✕</button><span class="tl-eyebrow">COSMIC SURVIVORS CLASSIC · GUEST SANDBOX</span><h2>🔬 Feature Test Lab</h2><p>Preview the new features without unlocking Pokémon, spending currency, or changing your saved account. Test runs use Guest mode, so their progress is not saved.</p><div id="tl-guest-hint" hidden><b>Guest mode required</b><p>Use the game menu’s <b>Salir / Log out</b> button, then choose <b>Invitado / Guest</b> at login. Your existing local account remains saved. You can switch back after testing.</p></div><div id="tl-main"><div id="tl-borrow"><h3>Borrow a Pokémon for one run</h3><div class="tl-row"><label for="tl-pokemon">Pokémon</label><select id="tl-pokemon"></select></div><div class="tl-buttons"><button id="tl-solo">▶ Start Solo Test</button><button id="tl-waves">🌊 Start Waves Test</button></div></div><div id="tl-inrun" hidden><h3>Instant feature tests</h3><div class="tl-buttons"><button id="tl-mega">✨ Show Mega Choice Now</button><button id="tl-jump">🌊 Jump to Wave 20</button></div></div><h3>Preview skin without buying it</h3><div class="tl-row"><label for="tl-skin">Creature appearance</label><select id="tl-skin"></select></div><div class="tl-buttons"><button id="tl-compare-png" type="button">◆ Pixel Atlases ON (4 Pokémon)</button></div><p class="tl-hint">Compare new baked PNG frame artwork with the earlier procedural material effect. Available for Mewtwo Prismatic and Galaxy.</p><h3>Preview Halloween rewards</h3><div class="tl-chips" id="tl-items"></div></div><p class="tl-status" id="tl-status">This testing panel is only enabled with ?testlab=1.</p><p class="tl-hint">Temporary visuals last only for this tab. You will still need to unlock the real items in your regular account.</p></section>';
 document.body.appendChild(panel);
 panel.querySelector('#tl-close').onclick=closeLab;
 panel.addEventListener('click',e=>{if(e.target===panel)closeLab()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.stopImmediatePropagation();e.preventDefault();closeLab()}},true);
 status=panel.querySelector('#tl-status');
 const select=panel.querySelector('#tl-pokemon');
 for(const x of loaners){if(!G.DEX_BY[x.id])continue;const o=document.createElement('option');o.value=x.id;o.textContent=x.label;select.appendChild(o);}
 const cssSelect=panel.querySelector('#tl-skin');
 for(const x of variants){const o=document.createElement('option');o.value=x.id;o.textContent=x.name;cssSelect.appendChild(o);}
 cssSelect.onchange=()=>chooseSkin(cssSelect.value);
 const cont=panel.querySelector('#tl-items');
 for(const x of items){const el=document.createElement('button');el.type='button';el.textContent=x.name;el.dataset.hwPreview=x.id;el.onclick=()=>chooseItem(x.id);cont.appendChild(el);}
 panel.querySelector('#tl-solo').onclick=()=>borrow(select.value,'solo');
 panel.querySelector('#tl-waves').onclick=()=>borrow(select.value,'waves');
 panel.querySelector('#tl-mega').onclick=forceMega;
 panel.querySelector('#tl-jump').onclick=()=>jumpWave(20);
 panel.querySelector('#tl-compare-png').onclick=()=>{
   const a=window.CosmicSpriteAtlas;
   if(!safe()||!a)return;
   a.mode=a.mode==='auto'?'off':'auto';
   refresh();
   toast(a.mode==='auto'?'Pixel animation atlases enabled':'Procedural shader comparison enabled');
 };
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeUI);else makeUI();
})();