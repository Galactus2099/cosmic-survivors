/* Haunted Hollow: deterministic ambient world-space scenery in Waves mode.
 * Art-only overlay, does NOT create impassable obstacles or alter mechanics.
 */
(() => {
'use strict';
const hash=(x,y,n=0)=>{const a=Math.sin((x+11)*127.1+(y-8)*311.7+n*23.73)*43758.5453;return a-Math.floor(a)};
function active(){return !!(window.CosmicHalloween&&window.CosmicHalloween.state&&window.CosmicHalloween.state().waves)}
function pumpkin(ctx,x,y,s){
ctx.save();ctx.translate(x,y);ctx.scale(s,s);
ctx.fillStyle='#130c1b99';ctx.beginPath();ctx.ellipse(1,4,16,5,0,0,6.283);ctx.fill();
ctx.fillStyle='#48212a';ctx.beginPath();ctx.ellipse(0,-7,12,10,0,0,6.283);ctx.fill();
ctx.strokeStyle='#bd603c';ctx.lineWidth=2;for(const r of [-6,0,6]){ctx.beginPath();ctx.ellipse(r,-7,6,10,0,0,6.283);ctx.stroke();}
ctx.fillStyle='#d88b49';ctx.fillRect(-2,-18,4,5);
ctx.fillStyle='#ffbc60';ctx.beginPath();ctx.moveTo(-7,-10);ctx.lineTo(-2,-8);ctx.lineTo(-7,-4);ctx.fill();ctx.beginPath();ctx.moveTo(6,-10);ctx.lineTo(2,-8);ctx.lineTo(7,-5);ctx.fill();
ctx.restore();
}
function gravestone(ctx,x,y,s){
ctx.save();ctx.translate(x,y);ctx.scale(s,s);
ctx.fillStyle='#100c1980';ctx.beginPath();ctx.ellipse(0,3,16,5,0,0,6.283);ctx.fill();
ctx.fillStyle='#2e263e';ctx.beginPath();ctx.moveTo(-9,-4);ctx.lineTo(-9,-19);ctx.quadraticCurveTo(-9,-34,0,-34);ctx.quadraticCurveTo(9,-34,9,-19);ctx.lineTo(9,-4);ctx.closePath();ctx.fill();
ctx.strokeStyle='#827390';ctx.lineWidth=2;ctx.stroke();
ctx.strokeStyle='#b8a7bf';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(0,-16);ctx.moveTo(-5,-24);ctx.lineTo(5,-24);ctx.stroke();
ctx.restore();
}
function glyph(ctx,x,y,r,t){
ctx.save();ctx.translate(x,y);ctx.strokeStyle='#b5679c';ctx.globalAlpha=.24+.1*Math.sin(t+x*.03);
ctx.lineWidth=1;
ctx.beginPath();ctx.ellipse(0,0,r,r*.54,.1,0,6.283);ctx.stroke();
ctx.beginPath();ctx.moveTo(-r*.55,0);ctx.lineTo(0,-r*.6);ctx.lineTo(r*.55,0);ctx.lineTo(0,r*.6);ctx.closePath();ctx.stroke();
ctx.restore();
}
function decorate(ctx,cam){
if(!active()||!cam||typeof cam.left!=='function')return;
const left=cam.left(),top=cam.top(),width=cam.w,height=cam.h,t=performance.now()/1000;
ctx.save();
ctx.fillStyle='rgba(25,5,43,.15)';ctx.fillRect(left-5,top-5,width+10,height+10);
const tile=142,x0=Math.floor(left/tile)-1,y0=Math.floor(top/tile)-1;
const x1=Math.ceil((left+width)/tile)+1,y1=Math.ceil((top+height)/tile)+1;
for(let iy=y0;iy<=y1;iy++)for(let ix=x0;ix<=x1;ix++){
 const n=hash(ix,iy),x=(ix+.1+hash(ix,iy,2)*.8)*tile,y=(iy+.1+hash(ix,iy,3)*.8)*tile;
 if(n<.29)gravestone(ctx,x,y,.65+hash(ix,iy,4)*.47);
 else if(n<.57)pumpkin(ctx,x,y,.5+hash(ix,iy,5)*.45);
 else if(n<.82)glyph(ctx,x,y,11+hash(ix,iy,6)*22,t);
 else {
 ctx.save();ctx.fillStyle='#f2a3d3';ctx.globalAlpha=.10+.10*Math.sin(t*1.2+ix*2+iy);
 ctx.beginPath();ctx.arc(x,y-16+Math.sin(t+ix)*3,2.5,0,6.283);ctx.fill();ctx.restore();
 }
}
ctx.restore();
}
function install(){
if(!(window.G&&G.World&&G.World.drawGround))return;
const old=G.World.drawGround;
G.World.drawGround=function(ctx,cam){const result=old.call(this,ctx,cam);decorate(ctx,cam);return result;};
}
install();
})();