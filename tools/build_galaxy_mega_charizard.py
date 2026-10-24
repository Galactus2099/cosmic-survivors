#!/usr/bin/env python3
"""Build Galaxy Mega Charizard X/Y sprite atlases with Charizard's original head.

Uses the SpriteCollab Charizard (#6) animation silhouettes (CC BY-NC 4.0).
The orange skin is replaced on EVERY visible pixel with dark nebula blues,
violets and icy highlights. Extra horns, jagged galaxy wings, a star core and
blue-violet flame are pixel-painted per frame. Original frames are preserved
in order, count, direction and timing, with a transparent margin for art.
This remains derivative fan artwork, not an official Mega Charizard sprite.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

from build_more_variant_atlases import sprite_meta

DEX=6
FORMS=("x","y")
ANIMS=("Idle","Walk","Attack","Shoot","Charge","Hurt","Faint")
PAD=14
VERSION=1
GALAXY_COLORS={
    "x": {"outline":"#13122e","wing":"#39319a","wingtip":"#73ebff",
          "crystal":"#63daff","bright":"#e5fbff","nebula":"#ac67f4"},
    "y": {"outline":"#20123b","wing":"#61369a","wingtip":"#e49eff",
          "crystal":"#a7b8ff","bright":"#fff1eb","nebula":"#f48ad1"},
}

def poly(draw,pts,color,outline=None,width=1):
    points=[(round(x),round(y)) for x,y in pts]
    draw.polygon(points,fill=color)
    if outline:draw.line(points+[points[0]],fill=outline,width=width)

def star(draw,x,y,r,c):
    x,y,r=round(x),round(y),round(r)
    draw.line([(x-r,y),(x+r,y)],fill=c,width=1)
    draw.line([(x,y-r),(x,y+r)],fill=c,width=1)

def reskin(src,meta,form):
    """Pixel-level *opaque* body recolor; no orange pixels from source remain."""
    src=np.asarray(src.convert("RGBA"),dtype=np.uint8)
    h,w=src.shape[:2]
    yy,xx=np.indices((h,w),dtype=np.float32)
    # Local frame coordinates make nebula pattern follow pose and direction.
    u=np.mod(xx,meta["w"])/max(1,meta["w"]-1)
    v=np.mod(yy,meta["h"])/max(1,meta["h"]-1)
    brightness=(src[:,:,0]*.23+src[:,:,1]*.59+src[:,:,2]*.18)/255.
    m=np.clip(.27+brightness*.87,.18,1.18)
    starcloud=np.sin(u*12+v*7+np.sin(v*17)*1.6)
    base=np.empty((h,w,3),dtype=np.float32)
    if form=="x":
        base[:,:,0]=36+38*starcloud+18*np.sin(v*17)
        base[:,:,1]=44+40*np.sin(u*9-v*12)+15*np.cos(v*16)
        base[:,:,2]=139+48*np.cos(u*7-v*12)
    else:
        base[:,:,0]=68+53*starcloud+20*np.cos(v*13)
        base[:,:,1]=33+34*np.sin(u*11+v*6)
        base[:,:,2]=136+48*np.cos(u*9-v*11)
    # A distinct cyan/magenta galaxy streamer running through the sprite.
    stripe=np.exp(-((u-(.43+.16*np.sin(v*5)))**2)/.023)
    base[:,:,0]+=stripe*(29 if form=="y" else 12)
    base[:,:,1]+=stripe*(28 if form=="x" else 10)
    base[:,:,2]+=stripe*39
    # Violet-blue must dominate every colored pixel, including the warmest
    # Mega Y nebula streaks: no orange can sneak through on bright original
    # Charizard highlights or the belly.
    base[:,:,2]=np.maximum(base[:,:,2],base[:,:,0]*.98+13)
    result=src.copy()
    result[:,:,:3]=np.clip(base*m[...,None],0,255).astype(np.uint8)
    # Preserve the original silhouette's transparency verbatim.
    return Image.fromarray(result,"RGBA")

def wings_and_tail(size,ax,ay,frame_no,form,back=True):
    c=GALAXY_COLORS[form]
    layer=Image.new("RGBA",size,(0,0,0,0))
    d=ImageDraw.Draw(layer)
    shift=math.sin(frame_no*1.25)*1.8
    for sign in (-1,1):
        # Recognizably Charizard-style angular wing membranes, not a new head.
        p=[
            (ax+sign*9,ay-12),
            (ax+sign*20,ay-26+shift),
            (ax+sign*26,ay-38+shift),
            (ax+sign*30,ay-24+shift),
            (ax+sign*29,ay-10),
            (ax+sign*23,ay-16),
            (ax+sign*17,ay-9),
        ]
        poly(d,p,c["wing"],c["outline"],2)
        d.line([(round(ax+sign*10),round(ay-12)),
                (round(ax+sign*26),round(ay-37+shift))],fill=c["wingtip"],width=2)
        d.line([(round(ax+sign*16),round(ay-16)),
                (round(ax+sign*27),round(ay-11))],fill=c["nebula"],width=2)
        star(d,ax+sign*24,ay-22+shift,2,c["bright"])
    # Position blue-pink tail fire behind the main body (never an orange flame).
    side=1 if back else -1
    tx=ax+side*22
    fy=ay+2
    poly(d,[(tx-side*6,fy+5),(tx-side*2,fy-5),
            (tx+side*2,fy-14),(tx+side*6,fy-8),
            (tx+side*10,fy-23),(tx+side*12,fy-9),
            (tx+side*9,fy+2),(tx+side*4,fy+7)],"#654cff","#19235a",2)
    poly(d,[(tx-side*2,fy+3),(tx+side,fy-8),(tx+side*5,fy-13),
            (tx+side*7,fy-4),(tx+side*4,fy+5)],"#52ccff")
    poly(d,[(tx+side,fy+1),(tx+side*3,fy-6),
            (tx+side*5,fy+2)],"#f9c0ff")
    return layer

def ornaments(sheet,meta,form,direction,fi,animation):
    c=GALAXY_COLORS[form]
    w,h=sheet.size
    ax,ay=PAD+meta["ax"],PAD+meta["ay"]
    d=ImageDraw.Draw(sheet)
    backrow=direction in (3,4,5)
    side=-1 if direction in (5,6,7) else 1
    if animation=="Faint":
        for offset in (-5,0,5):star(d,ax+offset,ay-6,1,c["crystal"])
        return
    # Charizard's original facial outline remains in the center: only two
    # small horn / brow highlights, leaving recognisable muzzle and eyes.
    hy=ay-20+(fi%3-1)*.5
    for sign in (-1,1):
        poly(d,[(ax+sign*4,hy-1),(ax+sign*8,hy-9),
                (ax+sign*11,hy-11),(ax+sign*9,hy-4)],c["wingtip"],c["outline"])
        d.line([(round(ax+sign*6),round(hy-3)),
                (round(ax+sign*10),round(hy-9))],fill=c["bright"],width=1)
    # Small brow accent, no new generic dragon face.
    d.line([(round(ax+side*3),round(hy+3)),
            (round(ax+side*9),round(hy+2))],fill=c["crystal"],width=1)
    # Shoulder/wing armor and contrasting cosmic star dust.
    for sign in (-1,1):
        sx=ax+sign*12
        sy=ay-14
        poly(d,[(sx-sign*4,sy-2),(sx+sign*2,sy-6),
                (sx+sign*6,sy-1),(sx+sign*5,sy+4),
                (sx-sign*3,sy+3)],"#343280",c["wingtip"])
        star(d,sx+sign*2,sy-1,2,c["bright"])
    if not backrow:
        # Little spiral galaxy / luminous chest core replacing all orange belly.
        cx,cy=ax,ay-9
        d.ellipse((round(cx-5),round(cy-6),round(cx+5),round(cy+4)),
                  fill="#191947",outline=c["crystal"],width=1)
        d.arc((round(cx-4),round(cy-5),round(cx+4),round(cy+3)),
              45,290,fill=c["nebula"],width=2)
        star(d,cx+1,cy-1,2,c["bright"])
    # Glassy claw highlights for the four-limbed Charizard silhouette.
    for sign in (-1,1):
        x,y=ax+sign*9,ay-1
        d.line([(round(x-2),round(y)),(round(x+2),round(y))],
               fill=c["crystal"],width=1)
    # Frame-specific constellations painted on the character itself.
    rng=random.Random(600+fi*53+direction*251+len(animation)*23+(0 if form=="x" else 9))
    base_alpha=sheet.getchannel("A")
    for j in range(22):
        xx=rng.randrange(max(0,round(ax-16)),min(w-1,round(ax+17))+1)
        yy=rng.randrange(max(0,round(ay-27)),min(h-1,round(ay+3))+1)
        if base_alpha.getpixel((xx,yy))>180:
            if j%6==0:star(d,xx,yy,1,"#eaffff")
            else:d.point((xx,yy),fill=c["bright"] if j%2 else c["nebula"])

def render_frame(frame,meta,form,direction,fi,animation):
    padded=Image.new("RGBA",(frame.width+2*PAD,frame.height+2*PAD),(0,0,0,0))
    # Full-body galaxy replacement of ALL the original orange first.
    # Then wing and tail components behind, then original Charizard silhouette
    # on top to keep the official-looking face and body profile unmistakable.
    if animation!="Faint":
        back=wings_and_tail(padded.size,meta["ax"]+PAD,meta["ay"]+PAD,fi,form,
                            back=direction not in (5,6,7))
        padded.alpha_composite(back)
    padded.alpha_composite(frame,(PAD,PAD))
    ornaments(padded,meta,form,direction,fi,animation)
    return padded

def generate(root:Path,verify=False):
    meta=sprite_meta(root,DEX)
    out=root/"classic/assets/mega-variants/6/galaxy"
    manifest={"dex":6,"style":"galaxy","forms":list(FORMS),"pad":PAD,
              "license_note":"Derivative SpriteCollab Pokémon art CC BY-NC 4.0; keep classic/CREDITS.md",
              "version":VERSION,"atlases":{}}
    for form in FORMS:
        folder=out/form;folder.mkdir(parents=True,exist_ok=True)
        for anim in ANIMS:
            m=meta[anim]
            source=root/"classic/assets/pokemon/6"/(anim+".png")
            if not source.is_file():raise FileNotFoundError(source)
            original=Image.open(source).convert("RGBA")
            if original.size!=(m["w"]*m["n"],m["h"]*m["r"]):
                raise AssertionError("Source geometry changed: "+str(source))
            converted=reskin(original,m,form)
            fw,fh=m["w"]+2*PAD,m["h"]+2*PAD
            atlas=Image.new("RGBA",(fw*m["n"],fh*m["r"]),(0,0,0,0))
            for direction in range(m["r"]):
                for i in range(m["n"]):
                    x,y=i*m["w"],direction*m["h"]
                    frame=converted.crop((x,y,x+m["w"],y+m["h"]))
                    expanded=render_frame(frame,m,form,direction,i,anim)
                    atlas.paste(expanded,(i*fw,direction*fh))
            target=folder/(anim+".png")
            atlas.save(target,optimize=True,compress_level=9)
            assert atlas.getchannel("A").getextrema()==(0,255)
            manifest["atlases"][form+"/"+anim]={
                "width":atlas.width,"height":atlas.height,
                "frameWidth":fw,"frameHeight":fh,
                "frames":m["n"],"directions":m["r"],
                "bytes":target.stat().st_size,
                "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
            }
            print("GALAXY MEGA",form,anim,atlas.size,target.stat().st_size)
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    assert len(manifest["atlases"])==14
    if verify:print("Verified fourteen full-body, expanded transparent Galaxy Mega Charizard animation atlases")

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--verify",action="store_true")
    args=parser.parse_args()
    generate(args.root,args.verify)
