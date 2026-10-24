/* Node smoke regression test: mid-run Mega cards and form stats. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
class El {
  constructor(tag='div'){this.tag=tag;this.children=[];this.hidden=false;this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){}};this.dataset={};this.parentNode=null;this._inner='';}
  set innerHTML(s){this._inner=s;}
  get innerHTML(){return this._inner;}
  appendChild(x){this.children.push(x);x.parentNode=this;return x;}
  append(...xs){for(const x of xs)this.appendChild(x);}
  replaceChildren(...xs){this.children=[];this.append(...xs);}
  querySelector(sel){
    if(this.id==='cm-mega-choice'){
      this.nodes=this.nodes||{};
      return this.nodes[sel]||(this.nodes[sel]=new El('div'));
    }
    if(sel==='button')return this.children.find(x=>x.tag==='button')||null;
    return null;
  }
  focus(){}
}
const elements={};const body=new El('body'),info=new El('div');
const document={
  body,createElement(tag){return new El(tag);},
  getElementById(id){return id==='menu-partner-info'?info:null;}
};
const announcements=[];
const save={partner:6,cosmicMegaHistory:null};
let time=0,wave=null,paused=0,sound=0,baseSpawns=0;
function makePlayer(dex=6){
 return {dex,mon:{types:['fire']},maxHp:100,hp:75,atkMul:1,spdMul:1,cdMul:1,dead:false,invuln:0,r:15,x:10,y:10};
}
const G={
  DB:{save,guest:false,commit(){save.persisted=true}},
  DEX_BY:{6:{name:'Charizard'},150:{name:'Mewtwo'},94:{name:'Gengar'},382:{name:'Kyogre'},383:{name:'Groudon'},888:{name:'Zacian'},889:{name:'Zamazenta'}},
  Spawner:{update(){baseSpawns++;},say(s){announcements.push(s)}},
  Game:{
    state:'ui',player:null,st:{get time(){return time}},
    startRun(){this.player=makePlayer(save.partner);this.state='playing';time=0;return true},
    togglePause(){this.state=this.state==='playing'?'paused':'playing';paused++;}
  },
  MenuUI:{open(){}},
  UI:{isOpen(){return false},hide(){}},
  Sprites:{Animator:function(){}},
  Audio:{sfx(){sound++}},
  FX:{ring(){}},Camera:{kick(){}}
};
G.Sprites.Animator.prototype.draw=function(){};
const math=Object.create(Math);math.random=()=>0;
const window={G,CosmicHalloween:{state(){return {waves:wave!==null,round:wave}}}};
const ctx={window,G,document,Math:math,console,performance:{now(){return 2000}},setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){}};
vm.runInNewContext(fs.readFileSync('classic/js/mods/mega-evolution.js','utf8'),ctx,{filename:'mega-evolution.js'});
const addon=window.CosmicMega;
assert.equal(addon.eligible(6),true);
assert.equal(addon.eligible(1),false);
assert.deepEqual(Array.from(addon.formsFor(6).map(x=>x.name)),['Mega Charizard X','Mega Charizard Y']);
assert.equal(addon.formsFor(382)[0].name,'Primal Kyogre');
assert.equal(addon.formsFor(888)[0].name,'Crowned Zacian');

// Solo: no premature transformation before 30 minutes.
G.Game.startRun();
time=1799;G.Spawner.update(.04,[],time);
assert.equal(G.Game.state,'playing');
assert.equal(G.Game.player.cosmicForm,undefined);
time=1800;G.Spawner.update(.04,[],time);
assert.equal(G.Game.state,'paused');
assert.equal(paused,1);
const dialog=body.children.find(x=>x.id==='cm-mega-choice');
assert.ok(dialog&&!dialog.hidden);
const forms=dialog.querySelector('#cm-mega-forms');
assert.equal(forms.children.length,2);
forms.children[1].onclick();
assert.equal(G.Game.state,'playing');
assert.equal(paused,2);
assert.equal(G.Game.player.cosmicForm.name,'Mega Charizard Y');
assert.ok(G.Game.player.maxHp>=120);
assert.ok(G.Game.player.atkMul>1.2);
assert.ok(G.Game.player.hp>75);
assert.equal(save.cosmicMegaHistory.forms['Mega Charizard Y'],1);
assert.ok(save.persisted);
time=1900;G.Spawner.update(.04,[],time);
assert.equal(save.cosmicMegaHistory.count,1,'may transform once per run');

// Waves: from round 20, not 19.
wave=19;save.partner=150;G.Game.startRun();
G.Spawner.update(.04,[],0);assert.equal(G.Game.state,'playing');
wave=20;G.Spawner.update(.04,[],0);
assert.equal(G.Game.state,'paused');
assert.equal(forms.children.length,2);
forms.children[0].onclick();
assert.equal(G.Game.player.cosmicForm.name,'Mega Mewtwo X');

// Primal / Crowned form choices and non-capable species.
wave=null;save.partner=382;G.Game.startRun();time=1800;G.Spawner.update(.04,[],time);
assert.equal(forms.children.length,1);
forms.children[0].onclick();assert.equal(G.Game.player.cosmicForm.name,'Primal Kyogre');
save.partner=888;G.Game.startRun();time=1800;G.Spawner.update(.04,[],time);
forms.children[0].onclick();assert.equal(G.Game.player.cosmicForm.name,'Crowned Zacian');
save.partner=1;G.Game.startRun();time=2040;G.Spawner.update(.04,[],time);
assert.equal(G.Game.state,'playing');
assert.equal(baseSpawns,8,'original engine spawns still run');
console.log('Mega smoke tests pass: eligibility, solo 30min, Wave 20, choices, stat buffs, persistence, and baseline spawner.');
