/* Guest Test Lab and Haunted Hollow feature regression. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const labSource=fs.readFileSync('classic/js/mods/test-lab.js','utf8');
const hollowSource=fs.readFileSync('classic/js/mods/haunted-hollow.js','utf8');
function runLab(guest,search='?testlab=1'){
 let started=0,withDex=0,waves=0,megaCalls=0,jumpCalls=0,commits=0;
 const save={partner:25,partnerShiny:true,owned:{25:true}};
 const G={
   DB:{save,guest,online:false,commit(){commits++}},
   DEX_BY:{6:{name:'Charizard'},25:{name:'Pikachu'},150:{name:'Mewtwo'}},
   Game:{state:'ui',player:null,startRun(){withDex=save.partner;this.player={dex:withDex};this.state='playing';started++}},
 };
 const window={G,CosmicHalloween:{startWaves(){waves++;G.Game.startRun()},qaSetWave(){jumpCalls++;return true}},CosmicMega:{demoOffer(){megaCalls++;return true}}};
 const document={readyState:'loading',addEventListener(){}};
 const lab={location:{search},window,G,document,console};
 vm.runInNewContext(labSource,lab,{filename:'test-lab.js'});
 return {api:window.CosmicTestLab,G,save,result:()=>({started,withDex,waves,megaCalls,jumpCalls,commits})};
}
const g=runLab(true);
assert.equal(g.api.enabled,true);
assert.equal(g.api.safe(),true);
assert.equal(g.api.startPreview(150,'waves'),true);
assert.equal(g.result().withDex,150);
assert.equal(g.save.partner,25,'real account partner restored immediately');
assert.equal(g.save.partnerShiny,true);
assert.equal(g.result().waves,1);
assert.equal(g.result().commits,0);
assert.equal(g.api.forceMega(),true);
assert.equal(g.result().megaCalls,1);
assert.equal(g.api.jumpWave(20),true);
assert.equal(g.result().jumpCalls,1);
const n=runLab(false);
assert.equal(n.api.safe(),false,'non-guest users cannot borrow Pokémon');
assert.equal(n.api.startPreview(150,'solo'),false);
assert.equal(n.result().started,0,'normal accounts never launch loaner runs');
const off=runLab(true,'');
assert.equal(off.api.enabled,false);
assert.equal(off.api.startPreview(150,'solo'),false,'must opt in with URL');
assert.equal(off.result().started,0);

// Haunted overlay remains noncolliding and runs only when Waves is active.
let active=false,drawn=0;
const ctx={save(){},restore(){},translate(){},scale(){},fillRect(){drawn++;},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},arc(){},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},set globalAlpha(v){}};
let regular=0;const G={World:{drawGround(){regular++}}};
const window={G,CosmicHalloween:{state(){return {waves:active}}}};
vm.runInNewContext(hollowSource,{G,window,performance:{now(){return 1000}},Math,console},{filename:'haunted-hollow.js'});
const cam={left(){return 0},top(){return 0},w:768,h:432};
G.World.drawGround(ctx,cam);assert.equal(drawn,0);
active=true;G.World.drawGround(ctx,cam);assert.ok(drawn>=1,'Waves has distinct scenery');
assert.equal(regular,2,'underlying game floor always renders normally');
console.log('Test Lab: guest-only loaners, in-run controls, no save commits, opt-in safety; Haunted overlay: passed.');
