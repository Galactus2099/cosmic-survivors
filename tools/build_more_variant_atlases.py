#!/usr/bin/env python3
"""Export transparent, pixel-baked Prismatic/Galaxy animated fan-art atlases.

Charizard #6, Gengar #94, Lucario #448, 7 sprite animations, 8 facing
directions. Original SpriteCollab frame geometry and timing remain untouched.
This uses derivative noncommercial SpriteCollab art. Preserve CREDITS.md.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import random
import re
from pathlib import Path
from PIL import Image, ImageDraw
from build_variant_atlases import recolor, gem, poly, star

SPECIES = {
    6: "Charizard",
    94: "Gengar",
    448: "Lucario",
}
SKINS = ("prismatic", "galaxy")
ANIMS = ("Idle", "Walk", "Attack", "Shoot", "Charge", "Hurt", "Faint")
VERSION = 1


def sprite_meta(root, dex):
    """Extract only the exact per-species JSON dictionary from generated metadata."""
    file = root / "classic/js/data/sprites-meta.js"
    content = file.read_text(encoding="utf-8")
    match = re.search(r"^\s*" + str(dex) + r":\s*(\{[^\r\n]+\})\s*,?\s*$",
                      content, re.MULTILINE)
    if not match:
        raise RuntimeError(f"SpriteCollab metadata for dex #{dex} is missing")
    return json.loads(match.group(1))["a"]


def point(d, x, y, color):
    d.point((round(x), round(y)), fill=color)


def band(d, a, b, color, width=1):
    d.line([(round(a[0]),round(a[1])), (round(b[0]),round(b[1]))],
           fill=color,width=width)


def build_details(frame, meta, dex, kind, direction, fi, anim):
    """Species-specific details directly painted into each RGBA frame.

    Frame coordinates depend on original feet anchors; unlike a moving screen
    overlay these details are pre-composited and direction-specific.
    """
    d = ImageDraw.Draw(frame, "RGBA")
    w,h=frame.size
    cx=float(meta["ax"])
    foot=float(meta["ay"])
    front=direction not in (3,4,5)
    side=-1 if direction in (5,6,7) else 1
    bob=math.sin(fi*math.pi/3)*.6 if anim in ("Walk","Charge") else 0
    if dex==6:    # Charizard: brow crests, dragon-wing joints, blazing tail.
        head=max(7,foot-21)+bob
        shoulder=max(11,foot-15)+bob
        chest=foot-10+bob
        ex=14
    elif dex==94: # Gengar: ectoplasmic brow, jagged side horns, ghost seal.
        head=max(9,foot-18)+bob
        shoulder=max(13,foot-13)+bob
        chest=foot-8+bob
        ex=11
    else:         # Lucario: pointed aura ears, shoulder pauldrons, wrist blades.
        head=max(8,foot-24)+bob
        shoulder=max(13,foot-16)+bob
        chest=foot-11+bob
        ex=10

    if anim=="Faint":
        # Keep faint animation readable; add only a few subdued in-sprite pixels.
        color="#b8ebff" if kind=="galaxy" else "#ffe5ae"
        for j in range(4):
            x=cx-6+j*4
            y=max(2,foot-9)+(j%2)*2
            if 0<=x<w and 0<=y<h:point(d,x,y,color)
        return

    if kind=="prismatic":
        # Species-specific crown and ear/crest pattern.
        if dex==6:
            gem(d,cx-5,head-4,2.5,"#fbb0e8","#fff4b0","#573566")
            gem(d,cx+6,head-6,2.7,"#8ceff2","#f8ffff","#443c7d")
            band(d,(cx-8,head+2),(cx+8,head+2),"#eefdf9")
        elif dex==94:
            # Wide, uneven ghost spike crown; reflect Gengar's broad face.
            poly(d,[(cx-10,head+4),(cx-8,head-4),(cx-4,head+1),
                    (cx,head-7),(cx+3,head+1),(cx+9,head-5),
                    (cx+10,head+4)],"#a4b1ff","#f4fbff")
            gem(d,cx,head+3,2.4,"#ff8ad4","#ffffff","#623a7a")
        else:
            # Lucario: long faceted aura ears and glowing forehead gem.
            for sign in (-1,1):
                gem(d,cx+sign*7,head-7,2.0,
                    "#7af5ef" if sign<0 else "#e6a0fa","#fff9d9","#4e4b8e")
            gem(d,cx,head,2.4,"#fff098","#ffffff","#4b487b")
        # Two fitted armor shoulders, wrist gems and body centerpiece.
        for sign in (-1,1):
            x=cx+sign*ex
            poly(d,[(x-sign*4,shoulder-3),(x+sign*3,shoulder-5),
                    (x+sign*6,shoulder+2),(x+sign*2,shoulder+5),
                    (x-sign*4,shoulder+3)],"#4262c5","#bdffff")
            gem(d,x,shoulder-1,2.3,"#6ff1ef" if sign<0 else "#ed8ff8",
                "#fff8de","#403c8d")
            wrist_y=min(h-3,foot-3+(fi%2 if anim in ("Attack","Shoot") else 0))
            gem(d,cx+sign*(ex-2),wrist_y,1.6,"#f6d276","#ffffff","#6f69a8")
        if front:
            gem(d,cx,chest,3.4,"#ffd36f","#fff8db","#3b4083")
            d.arc((round(cx-5),round(chest-5),round(cx+5),round(chest+5)),
                  30,150,fill="#b6faff",width=1)
        if dex==6:
            # Crystallized dragon wing hinges / special flame-tipped tail.
            for sign in (-1,1):
                gem(d,cx+sign*(ex+4),shoulder+2,2.6,
                    "#f2a3ff","#fff9e2","#654589")
            gem(d,cx+side*16,min(h-4,foot+2),2.1,
                "#fff1a6","#ffffff","#cb6698")
        elif dex==94:
            # Ghost's crystalline cheek wisps.
            for sign in (-1,1):
                gem(d,cx+sign*11,head+7,1.8,"#ff8bc4","#fff","#58398b")
        else:
            # Lucario's recognizable crossed aura cuffs.
            band(d,(cx-5,foot-3),(cx-1,foot-8),"#d7fff8",2)
            band(d,(cx+5,foot-3),(cx+1,foot-8),"#d7fff8",2)
    else:
        # Nebula-blue body and actual star/planet armor, no rainbow crystal crown.
        if dex==6:
            d.arc((round(cx-8),round(head-8),round(cx+8),round(head+5)),
                  190,490,fill="#c0b7fd",width=2)
            star(d,cx+6,head-5,2,"#baf8ff")
            # Deep-space wing membrane markings.
            for sign in (-1,1):
                x=cx+sign*(ex+4)
                poly(d,[(x-sign*3,shoulder-7),(x+sign*5,shoulder),
                        (x,shoulder+7)],"#383a82","#92e2ff")
                star(d,x,shoulder-2,2,"#f1eeff")
        elif dex==94:
            # Starry spectral horns flanking a central moon.
            for sign in (-1,1):
                x=cx+sign*8
                poly(d,[(x-sign*3,head+5),(x,head-7),
                        (x+sign*4,head+4)],"#433589","#9bc8ff")
            d.arc((round(cx-4),round(head-5),round(cx+4),round(head+3)),
                  40,320,fill="#a8f0ff",width=2)
        else:
            for sign in (-1,1):
                x=cx+sign*7
                poly(d,[(x-sign*2,head+4),(x,head-9),
                        (x+sign*3,head+3)],"#3945a2","#9de6ff")
            star(d,cx,head,2,"#ffffff")
        # Twilight pauldrons and comet streaks.
        for sign in (-1,1):
            x=cx+sign*ex
            poly(d,[(x-sign*4,shoulder-3),(x+sign*2,shoulder-5),
                    (x+sign*5,shoulder+4),(x-sign*2,shoulder+4)],
                 "#352466","#9ec4ff")
            band(d,(x-sign*3,shoulder-2),(x+sign*3,shoulder+3),
                 "#7be7ff")
            star(d,x,shoulder,2,"#f7f7ff")
            star(d,cx+sign*(ex-2),min(h-4,foot-3),1,"#a6eaff")
        if front:
            # Planetary chest core.
            d.ellipse((round(cx-4),round(chest-4),round(cx+4),round(chest+4)),
                      fill="#17163f",outline="#85c8ff",width=1)
            d.arc((round(cx-3),round(chest-3),round(cx+3),round(chest+3)),
                  50,310,fill="#c8a6ff",width=2)
            star(d,cx+1,chest-1,1,"#ffffff")

        # Actual baked starlight on solid pixels. Key varies with direction
        # and animation frame, so the constellation moves with the action.
        solid=frame.getchannel("A")
        rng=random.Random(103+37*dex+direction*311+fi*57+len(anim)*19)
        area=(max(1,round(cx-ex-5)),min(w-2,round(cx+ex+5)),
              max(1,round(head-6)),min(h-2,round(foot+3)))
        if area[1]>area[0] and area[3]>area[2]:
            stars=0
            for n in range(42):
                px=rng.randrange(area[0],area[1]+1)
                py=rng.randrange(area[2],area[3]+1)
                if solid.getpixel((px,py))>160:
                    if n%5==0:star(d,px,py,1,"#dbf9ff")
                    else:point(d,px,py,"#d7bfff" if n%2 else "#8fd7ff")
                    stars+=1
                    if stars==12:break
    if anim in ("Attack","Shoot") and fi%3==0:
        star(d,cx+side*5,max(3,chest-7),2,
             "#fff9e3" if kind=="prismatic" else "#baf7ff")


def export(root:Path, verify=False):
    destination=root/"classic/assets/variants"
    all_reports={}
    for dex,name in SPECIES.items():
        meta=sprite_meta(root,dex)
        for skin in SKINS:
            path=destination/str(dex)/skin
            path.mkdir(parents=True,exist_ok=True)
            for anim in ANIMS:
                if anim not in meta:
                    raise RuntimeError(f"Required animation missing: {dex}/{anim}")
                m=meta[anim]
                file=root/"classic/assets/pokemon"/str(dex)/(anim+".png")
                if not file.is_file():raise FileNotFoundError(file)
                original=Image.open(file).convert("RGBA")
                dimensions=(m["w"]*m["n"],m["h"]*m["r"])
                if original.size!=dimensions:
                    raise RuntimeError(f"Wrong SpriteCollab geometry {file}: {original.size} expected {dimensions}")
                tinted=recolor(original,m,skin)
                dest=Image.new("RGBA",original.size,(0,0,0,0))
                for direction in range(m["r"]):
                    for i in range(m["n"]):
                        x,y=i*m["w"],direction*m["h"]
                        patch=tinted.crop((x,y,x+m["w"],y+m["h"]))
                        build_details(patch,m,dex,skin,direction,i,anim)
                        dest.paste(patch,(x,y))
                if dest.size!=original.size:raise AssertionError("Size changed")
                if dest.getchannel("A").getextrema()!=(0,255):
                    raise RuntimeError(f"Expected some fully transparent+opaque pixels: {dex}/{skin}/{anim}")
                target=path/(anim+".png")
                dest.save(target,optimize=True,compress_level=9)
                all_reports[f"{dex}/{skin}/{anim}"]={
                    "width":dest.width,"height":dest.height,
                    "frames":m["n"],"directions":m["r"],
                    "sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
                    "bytes":target.stat().st_size,
                }
        manifest={
            "dex":dex,"species":name,"version":VERSION,"skins":list(SKINS),
            "license_note":"Derivative from SpriteCollab noncommercial Pokémon art, CC BY-NC 4.0; preserve classic/CREDITS.md.",
            "generator":"tools/build_more_variant_atlases.py",
            "atlases":{k.split("/",1)[1]:v for k,v in all_reports.items() if k.startswith(str(dex)+"/")}
        }
        (destination/str(dex)/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    if len(all_reports)!=42:raise AssertionError(f"Expected 42 atlases; got {len(all_reports)}")
    print("Generated",len(all_reports),"real transparent animation PNG atlases")
    print("Total bytes:",sum(x["bytes"] for x in all_reports.values()))
    for key,v in all_reports.items():
        print(key,v["width"],v["height"],v["bytes"])
    if verify:print("Verified sizes, directions, frame counts, transparency and SHA-256 hashes")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    p.add_argument("--verify",action="store_true")
    args=p.parse_args()
    export(args.root,args.verify)
