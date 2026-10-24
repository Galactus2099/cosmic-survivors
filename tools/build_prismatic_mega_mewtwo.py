#!/usr/bin/env python3
"""Pre-render two distinct Prismatic Mega Mewtwo fan sprite sets.

Fourteen transparent PNG atlases: X and Y, seven animations, eight facing
directions. Uses CC BY-NC 4.0 SpriteCollab Mewtwo (#150) frames, preserving
their face, animation poses, timing and original pixel transparency. Unique
pixel crowns, X fighter armor / Y psychic aerial fins, crystal chest cores,
and refracted tail extensions provide recognizable *Mega-form differences*.

Unofficial derivative fan art, NOT original/canonical Nintendo art. Credits
must remain in classic/CREDITS.md. Python packages: pillow + numpy.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import random
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from build_more_variant_atlases import sprite_meta

DEX=150
PAD=16
FORMS=("x","y")
ANIMS=("Idle","Walk","Attack","Shoot","Charge","Hurt","Faint")
PALETTES={
  "x":{"base":"#21366d","edge":"#272047","armor":"#5fe6fa",
       "spark":"#ffffff","gem":"#ff87cd","reflect":"#ffe4a0",
       "blade":"#ad81ed","shadow":"#10194b"},
  "y":{"base":"#653788","edge":"#251646","armor":"#ee92ed",
       "spark":"#fcfaff","gem":"#7af3f9","reflect":"#ffe4ad",
       "blade":"#8ebdff","shadow":"#29215f"}
}

def poly(d,pts,color,outline=None,width=1):
    pp=[(round(x),round(y)) for x,y in pts]
    d.polygon(pp,fill=color)
    if outline:d.line(pp+[pp[0]],fill=outline,width=width,joint="curve")

def gem(d,x,y,r,color,outline,shine):
    poly(d,[(x,y-1.7*r),(x+.9*r,y-.35*r),(x+.67*r,y+.85*r),
            (x,y+1.28*r),(x-.87*r,y+.6*r),(x-.9*r,y-.5*r)],color,outline)
    poly(d,[(x,y-1.7*r),(x+.85*r,y-.35*r),(x,y+1.28*r)],shine)
    d.line([(round(x),round(y-1.7*r)),(round(x),round(y+1.28*r))],fill="#f9ffff",width=1)

def star(d,x,y,r,color):
    x,y,r=round(x),round(y),round(r)
    d.line([(x-r,y),(x+r,y)],fill=color,width=1)
    d.line([(x,y-r),(x,y+r)],fill=color,width=1)
    d.point((x,y),fill="#ffffff")

def crystalize(src,meta,form):
    original=np.asarray(src.convert("RGBA"),dtype=np.uint8)
    h,w=original.shape[:2]
    y,x=np.indices((h,w),dtype=np.float32)
    u=(x%meta["w"])/max(1,meta["w"]-1)
    v=(y%meta["h"])/max(1,meta["h"]-1)
    r=original[:,:,:3].astype(np.float32)
    l=(.2126*r[:,:,0]+.7152*r[:,:,1]+.0722*r[:,:,2])/255.
    lighting=np.clip(.18+1.12*l,.08,1.25)
    phase=u*7.3-v*5.6+np.sin(v*8)*.75
    facets=(np.floor(u*9)+np.floor(v*11))%5
    if form=="x":
      # Psychic fighter: deep sapphire facets, fuchsia edges, aqua refraction.
      rr=67+38*np.sin(phase)+47*(facets==1)
      gg=104+63*np.sin(phase+1.2)+54*(facets==2)
      bb=175+46*np.sin(phase+2.6)+19*(facets==3)
    else:
      # Levitation form: pink amethyst, pale cyan cores and opalescent edges.
      rr=158+57*np.sin(phase+.4)+16*(facets==4)
      gg=119+66*np.sin(phase+2.5)+48*(facets==0)
      bb=166+54*np.sin(phase+4.0)+21*(facets==1)
    col=np.stack([rr,gg,bb],axis=-1)
    shine=np.where(facets==2,1.14,.92)
    col*=lighting[...,None]*shine[...,None]
    output=original.copy()
    output[:,:,:3]=np.clip(col,0,255).astype(np.uint8)
    # original alpha copied EXACTLY, no transparent area gets orange/flat tint
    return Image.fromarray(output,"RGBA")

def back_extensions(size,ax,ay,form,frame,dir,anim):
    """Extra full-silhouette art behind the recognizable original head/body."""
    p=PALETTES[form]
    layer=Image.new("RGBA",size,(0,0,0,0))
    if anim=="Faint":return layer
    d=ImageDraw.Draw(layer)
    turn=-1 if dir in (5,6,7) else 1
    bob=math.sin(frame*1.3)*1.7 if anim=="Walk" else 0
    for side in (-1,1):
      if form=="x":
        # X = broad fighting armor and twin angular psychic blade crests.
        pts=[(ax+side*8,ay-18),(ax+side*22,ay-28+bob),
             (ax+side*25,ay-38+bob),(ax+side*27,ay-23),
             (ax+side*20,ay-12),(ax+side*12,ay-10)]
        poly(d,pts,p["shadow"],p["edge"],2)
        d.line([(round(ax+side*13),round(ay-16)),
                (round(ax+side*25),round(ay-33+bob))],fill=p["armor"],width=2)
        gem(d,ax+side*22,ay-27+bob,2.1,p["gem"],p["edge"],p["spark"])
      else:
        # Y = tall psychic head fins and trailing translucent aura ribbons;
        # keeps Mewtwo's head and torso visible in front.
        pts=[(ax+side*7,ay-23),(ax+side*17,ay-43+bob),
             (ax+side*20,ay-50+bob),(ax+side*22,ay-34+bob),
             (ax+side*15,ay-15)]
        poly(d,pts,p["blade"],p["edge"],2)
        d.line([(round(ax+side*12),round(ay-20)),
                (round(ax+side*20),round(ay-45+bob))],fill=p["armor"],width=1)
    # Refracted psychic tail loops radiate outward from original tail root.
    side=turn
    tx,ty=ax+side*12,ay-3
    if form=="x":
      d.arc((round(tx-16),round(ty-16),round(tx+16),round(ty+16)),
            20,280,fill=p["armor"],width=3)
      d.arc((round(tx-14),round(ty-12),round(tx+14),round(ty+12)),
            195,340,fill=p["gem"],width=2)
    else:
      d.arc((round(tx-19),round(ty-21),round(tx+19),round(ty+21)),
            42,330,fill=p["blade"],width=3)
      d.arc((round(tx-15),round(ty-15),round(tx+15),round(ty+15)),
            120,320,fill=p["gem"],width=2)
    return layer

def front_details(canvas,meta,form,dir,fi,anim):
    if anim=="Faint":return
    p=PALETTES[form]
    d=ImageDraw.Draw(canvas)
    ax=meta["ax"]+PAD
    ay=meta["ay"]+PAD
    facing_away=dir in (3,4,5)
    head=ay-25
    sy=ay-16
    cy=ay-11
    side=-1 if dir in (5,6,7) else 1
    # Recognizable Mewtwo face is from the underlying SpriteCollab sheet:
    # adorn it, never replace it with a generic dragon-like muzzle.
    if form=="x":
      poly(d,[(ax-8,head+1),(ax-10,head-7),(ax-6,head-13),
             (ax-2,head-5)],p["shadow"],p["gem"])
      poly(d,[(ax+8,head+1),(ax+10,head-7),(ax+6,head-13),
             (ax+2,head-5)],p["shadow"],p["gem"])
      gem(d,ax,head-6,3,p["gem"],p["edge"],p["reflect"])
    else:
      gem(d,ax,head-10,4,p["gem"],p["edge"],p["spark"])
      gem(d,ax-7,head-5,2.5,p["blade"],p["edge"],p["spark"])
      gem(d,ax+7,head-5,2.5,p["blade"],p["edge"],p["spark"])
      d.arc((round(ax-9),round(head-7),round(ax+9),round(head+3)),
            12,171,fill=p["spark"],width=1)
    # Armor is a distinct silhouette. X is stocky, Y is sleek.
    for side in (-1,1):
      sx=ax+side*(11 if form=="x" else 10)
      if form=="x":
        poly(d,[(sx-side*4,sy-4),(sx+side*4,sy-7),
                (sx+side*9,sy-1),(sx+side*7,sy+6),
                (sx-side*4,sy+4)],p["armor"],p["edge"],2)
        gem(d,sx+side*2,sy,3,p["gem"],p["edge"],p["spark"])
        # Chunky gauntlets to make X look noticeably stronger.
        wx,wy=ax+side*12,ay-5
        poly(d,[(wx-4,wy-4),(wx+4,wy-4),(wx+5,wy+2),
                (wx-4,wy+3)],p["shadow"],p["armor"],1)
      else:
        poly(d,[(sx-side*3,sy-3),(sx+side*4,sy-9),
                (sx+side*6,sy-2),(sx+side*3,sy+6)],
             p["blade"],p["spark"],1)
        gem(d,sx,sy,2.7,p["gem"],p["edge"],p["spark"])
        wx,wy=ax+side*12,ay-5
        gem(d,wx,wy,2.3,p["armor"],p["edge"],p["spark"])
    if not facing_away:
      # The heart/core is embedded at the exact character torso position.
      gem(d,ax,cy,5,p["gem"],p["edge"],p["reflect"])
      d.arc((round(ax-8),round(cy-8),round(ax+8),round(cy+8)),
            30,160,fill=p["armor"],width=1)
    # Sparkles baked in on opaque colored pixels, not a cloud of random cubes.
    rng=random.Random(1500+fi*43+dir*317+len(anim)*29+(0 if form=="x" else 97))
    opaque=canvas.getchannel("A")
    for i in range(30):
      x=rng.randrange(max(1,round(ax-17)),min(canvas.width-2,round(ax+18))+1)
      y=rng.randrange(max(1,round(ay-29)),min(canvas.height-2,round(ay+6))+1)
      if opaque.getpixel((x,y))>160:
        if i%6==0:star(d,x,y,2,p["spark"])
        else:d.point((x,y),fill=p["reflect"] if i%2 else p["spark"])
    if anim in ("Attack","Shoot") and fi%3==0:
      star(d,ax+side*7,cy-10,2,p["spark"])

def export(root:Path,verify=False):
    meta=sprite_meta(root,DEX)
    target=root/"classic/assets/mega-variants/150/prismatic"
    manifest={
        "dex":150,"style":"prismatic","forms":list(FORMS),"pad":PAD,
        "version":1,"generator":"tools/build_prismatic_mega_mewtwo.py",
        "license_note":"Derivative SpriteCollab CC BY-NC 4.0 fan artwork; retain classic/CREDITS.md",
        "atlases":{}
    }
    for form in FORMS:
      folder=target/form
      folder.mkdir(parents=True,exist_ok=True)
      for anim in ANIMS:
        m=meta[anim]
        source=root/"classic/assets/pokemon/150"/(anim+".png")
        if not source.is_file():raise FileNotFoundError(source)
        orig=Image.open(source).convert("RGBA")
        assert orig.size==(m["w"]*m["n"],m["h"]*m["r"]),source
        colored=crystalize(orig,m,form)
        fw,fh=m["w"]+2*PAD,m["h"]+2*PAD
        atlas=Image.new("RGBA",(fw*m["n"],fh*m["r"]),(0,0,0,0))
        for dir in range(m["r"]):
          for fi in range(m["n"]):
            xx,yy=fi*m["w"],dir*m["h"]
            frame=colored.crop((xx,yy,xx+m["w"],yy+m["h"]))
            rendered=Image.new("RGBA",(fw,fh),(0,0,0,0))
            if anim!="Faint":
              rear=back_extensions((fw,fh),m["ax"]+PAD,m["ay"]+PAD,form,fi,dir,anim)
              rendered.alpha_composite(rear)
            rendered.alpha_composite(frame,(PAD,PAD))
            front_details(rendered,m,form,dir,fi,anim)
            atlas.paste(rendered,(fi*fw,dir*fh))
        assert atlas.getchannel("A").getextrema()==(0,255)
        out=folder/(anim+".png")
        atlas.save(out,optimize=True,compress_level=9)
        manifest["atlases"][form+"/"+anim]={
          "width":atlas.width,"height":atlas.height,"frameWidth":fw,
          "frameHeight":fh,"frames":m["n"],"directions":m["r"],
          "bytes":out.stat().st_size,"sha256":hashlib.sha256(out.read_bytes()).hexdigest()
        }
        print("PRISMATIC MEGA",form,anim,atlas.size,out.stat().st_size)
    (target/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    assert len(manifest["atlases"])==14
    if verify:print("Verified all 14 Prismatic Mega Mewtwo X/Y animations; source frames and direction counts retained")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    p.add_argument("--verify",action="store_true")
    a=p.parse_args()
    export(a.root,a.verify)
