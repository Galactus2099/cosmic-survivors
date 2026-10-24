/* Node smoke tests for the isolated Halloween/Waves addon. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const announcements=[];
let originalSpawnerCalls=0, commits=0;
const enemies=[];
const save={partner:150,owned:{},cosmicHalloween:null};
const G={
  DB:{save,guest:false,commit(){commits++;},grant(dex,source){save.owned[dex]={from:source}}},
  Player:{__cosmicWrapped:false},
  Sprites:{Animator:function(){},hovers(){return true}},
  Game:{player:null,state:'ui',startRun(){this.player={dex:150,kills:0};this.state='playing';return true;}},
  Spawner:{update(){originalSpawnerCalls++;},say(s){announcements.push(s)}},
  Rift:{inArena:false},Judgment:{active:false,update(){}},
  MenuUI:{open(){}},RunUI:{showOver(result,cb){this.lastResult=result;}},
  EnemyMgr:{get count(){return enemies.length;},add(x){enemies.push(x);},clear(){enemies.length=0;}},
  Enemy:function(def,x,y,sc,boss){this.def=def;this.x=x;this.y=y;this.hp=this.maxHp=def.hp*sc.hp;this.dmg=def.dmg*sc.dmg;this.xp=def.xp;this.boss=boss;},
  Enemies:{BOSSES:[{dex:150,hp:160,dmg:8,xp:25}],bagAt(){return [{dex:10,hp:12,dmg:2,xp:4}]},scale(){return {hp:1,dmg:1,spd:1}},bossScale(){return {hp:1,dmg:1,spd:1}}},
  U:{pick(a){return a[0]}},Camera:{outerRadius(){return 200}},World:{isFree(){return true}}
};
G.Sprites.Animator.prototype.draw=function(){};
const window={G};
const document={readyState:'loading',body:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
const context={window,G,document,console,performance:{now(){return 1000}},setInterval(){return 1},clearInterval(){},setTimeout(){return 1},clearTimeout(){},Math};
vm.runInNewContext(fs.readFileSync('classic/js/mods/halloween-waves.js','utf8'),context,{filename:'halloween-waves.js'});
assert.equal(typeof window.CosmicHalloween.startWaves,'function');
assert.equal(typeof window.CosmicHalloween.buy,'function');

G.Game.startRun();
G.Spawner.update(1,[],0);
assert.equal(originalSpawnerCalls,1,'normal gameplay must keep original spawner');
assert.equal(window.CosmicHalloween.state().waves,false);

G.EnemyMgr.clear();
window.CosmicHalloween.startWaves();
assert.equal(window.CosmicHalloween.state().waves,true);
assert.equal(window.CosmicHalloween.state().round,1);
for(let i=0;i<25;i++)G.Spawner.update(1,[G.Game.player],i);
assert.ok(enemies.length>=10,'waves must spawn Pokémon enemies');
assert.equal(originalSpawnerCalls,1,'waves must not call normal spawner');

G.Game.player.kills=20;
G.Spawner.update(1,[G.Game.player],26);
assert.equal(save.cosmicHalloween.corn,2,'ten defeats per candy corn');
enemies.length=0;
G.Spawner.update(1,[G.Game.player],27);
assert.equal(window.CosmicHalloween.state().phase,'between');
assert.equal(save.cosmicHalloween.corn,4,'clearing wave 1 grants 2 candy corn');
G.Spawner.update(3,[G.Game.player],30);
assert.equal(window.CosmicHalloween.state().round,2);

save.cosmicHalloween.corn=100;
window.CosmicHalloween.buy('haunted-backdrop');
assert.equal(save.cosmicHalloween.corn,88);
assert.equal(save.cosmicHalloween.unlocks['haunted-backdrop'],true);
window.CosmicHalloween.buy('shadow-mewtwo');
assert.equal(save.cosmicHalloween.corn,13);
assert.equal(save.cosmicHalloween.unlocks['shadow-mewtwo'],true);
assert.equal(save.owned[150].from,'cosmic-halloween');
window.CosmicHalloween.buy('shadow-mewtwo');
assert.equal(save.cosmicHalloween.corn,13,'purchase cannot charge twice');
assert.ok(commits>=3,'new currencies and unlocks commit to local saves');
G.Game.startRun();
G.Spawner.update(1,[G.Game.player],0);
assert.equal(originalSpawnerCalls,2,'new standard run restores original spawner');
console.log('Passed Halloween/Waves smoke tests: original game, spawns, rounds, corn and shop.');
