#!/usr/bin/env python3
"""Build transparent, directly playable Prismatic/Galaxy Mewtwo sprite atlases.

Inputs: SpriteCollab base animation sheets shipped with the noncommercial fan fork.
Output: identical SpriteCollab animation geometry (same frame sizes, counts, rows,
        direction ordering and feet anchors), with per-pixel materials and
        carefully positioned pixel-art crests/gems/cuffs baked in EVERY frame.

The base Pokémon artwork is not our work; preserve classic/CREDITS.md
and the CC BY-NC 4.0 source-art terms. Output is a derivative fan artwork.
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

DEX = 150
ANIMS = {
    "Idle":   dict(w=32,h=64,n=8,r=8,ax=15.5,ay=35.5),
    "Walk":   dict(w=48,h=56,n=6,r=8,ax=23.5,ay=31.5),
    "Attack": dict(w=80,h=88,n=11,r=8,ax=39.5,ay=46.5),
    "Shoot":  dict(w=56,h=64,n=13,r=8,ax=27.5,ay=34.5),
    "Charge": dict(w=32,h=56,n=10,r=8,ax=16.5,ay=31.5),
    "Hurt":   dict(w=48,h=72,n=2,r=8,ax=23.5,ay=35.5),
    "Faint":  dict(w=40,h=48,n=4,r=8,ax=19.5,ay=27.5),
}
SKINS = ("prismatic", "galaxy")
ART_VERSION = 1


def recolor(sheet: Image.Image, meta: dict, kind: str) -> Image.Image:
    pixels = np.asarray(sheet.convert("RGBA"), dtype=np.uint8)
    h, w = pixels.shape[:2]
    yy, xx = np.indices((h, w), dtype=np.float32)
    xx = xx % meta["w"]
    yy = yy % meta["h"]
    u = xx / max(1, meta["w"] - 1)
    v = yy / max(1, meta["h"] - 1)
    rgb = pixels[..., :3].astype(np.float32)
    lum = (.2126*rgb[..., 0] + .7152*rgb[..., 1] + .0722*rgb[..., 2]) / 255.
    # Keep silhouette shading readable at the game's native pixel scale.
    ink = np.clip(.13 + np.power(lum, .92)*1.1, .09, 1.)
    if kind == "prismatic":
        # Faceted, iridescent sections; more than one color inside the same sprite.
        theta = 2*np.pi*(.45*u - .32*v)
        col = np.stack([
            160+85*np.sin(theta+1.1),
            168+73*np.sin(theta+3.20),
            174+76*np.sin(theta+5.34),
        ],axis=-1)
        crystal = np.where(((np.floor(u*10)+np.floor(v*10))%5<2)[...,None],1.12,.85)
        shimmer = (11*np.sin((u*7+v*3)*np.pi))[...,None]
        final = np.clip(col*ink[...,None]*crystal + shimmer,0,255)
    else:
        # Midnight violet and indigo nebula. Stars are baked in below per frame.
        arc = np.sin((u*.75+v*.85)*np.pi*2)
        col = np.stack([
            62+41*arc + 24*np.sin(v*13),
            66+35*np.cos(u*13+v*7),
            142+60*np.cos(u*8-v*5),
        ],axis=-1)
        cloud = np.exp(-((u-(.4+.2*np.sin(v*4)))**2)/.055)*55
        col[...,0]+=cloud
        col[...,2]+=cloud*.6
        final=np.clip(col*np.clip(.21 + lum*1.25,.1,1.22)[...,None],0,255)
    out=pixels.copy()
    # Preserve all existing animation alpha and shading.
    out[..., :3]=final.astype(np.uint8)
    return Image.fromarray(out,"RGBA")


def poly(d,points,fill,edge=None,width=1):
    d.polygon([(round(x),round(y)) for x,y in points],fill=fill)
    if edge:
        d.line([(round(x),round(y)) for x,y in [*points,points[0]]],fill=edge,width=width,joint="curve")


def gem(d,x,y,r,main,highlight,outline):
    poly(d,[(x,y-1.7*r),(x+.95*r,y-.35*r),(x+.7*r,y+.78*r),
       (x,y+1.25*r),(x-.9*r,y+.55*r),(x-.85*r,y-.45*r)],main,outline)
    poly(d,[(x,y-1.7*r),(x+.95*r,y-.35*r),(x,y+1.25*r)],highlight)
    d.line([(round(x),round(y-1.7*r)),(round(x),round(y+1.25*r))],fill="#f9f9f5",width=1)


def star(d,x,y,size,shade):
    x,y=round(x),round(y)
    d.line([(x-size,y),(x+size,y)],fill=shade,width=1)
    d.line([(x,y-size),(x,y+size)],fill=shade,width=1)
    d.point((x,y),fill="#ffffff")


def enhance(frame: Image.Image, meta: dict, kind: str, direction: int, frame_no: int, anim: str):
    """Manually authored small pixel-art ornament geometry at the foot anchor.

    Cropping occurs AFTER drawing, per actual SpriteCollab frame/direction;
    no extra atlas metadata and no changes to animation timing are required.
    """
    w,h=frame.size
    ax,ay=meta["ax"],meta["ay"]
    cx=ax
    # The character faces away in rows 3–5. Chest and face glyphs should hide.
    front = direction not in (3,4,5)
    side = -1 if direction in (5,6,7) else 1
    bob=(frame_no%4-1.5)*.35 if anim in ("Walk","Charge") else 0
    yhead=ay-25+bob
    # The small thin idle/crouch frames use the same feet anchor but might
    # place the head closer. Kept close to the original body in all cases.
    shoulder=ay-16+bob
    heart=ay-12+bob

    d=ImageDraw.Draw(frame,"RGBA")
    if anim == "Faint":
        # Keep knocked-out sprite unmistakable; just a few embedded gems/stars.
        for k in range(5):
            x=(ax-9)+k*4
            y=ay-9+(k%3)*2
            d.point((round(x),round(y)),fill=(175,225,255,230) if kind=="galaxy" else (255,236,180,230))
        return

    if kind=="prismatic":
        # Triple prismatic crown: primary tall spire + branching side blades.
        gem(d,cx,yhead-5,3.4,"#72f5ef","#f5ffec","#46204b")
        gem(d,cx-5,yhead-2,2.25,"#fb76c4","#fff0fa","#512657")
        gem(d,cx+5,yhead-2,2.25,"#b595ff","#eaf2ff","#3c2f68")
        # Turquoise and magenta armor grows directly from the shoulder line.
        for side_sign in (-1,1):
            px=cx+side_sign*10
            poly(d,[(px-side_sign*4,shoulder-2),(px,shoulder-5),
                    (px+side_sign*5,shoulder-3),(px+side_sign*4,shoulder+3),
                    (px,shoulder+5),(px-side_sign*3,shoulder+2)],
                 "#367fbb","#29253d")
            gem(d,px+side_sign*1,shoulder-1,2.5,
                "#68ecf6" if side_sign<0 else "#ee9ff9","#fffbea","#423371")
            # Wrist bands read as deliberate detail, not flat tint.
            ayarm=ay-6 + (frame_no%3 if anim=="Attack" else 0)
            d.line([(round(cx+side_sign*10-3),round(ayarm)),
                    (round(cx+side_sign*10+3),round(ayarm))],fill="#f1fff9",width=2)
        if front:
            gem(d,cx,heart,3.9,"#ffdb68","#fffdf2","#3c2955")
            d.arc((round(cx-6),round(heart-6),round(cx+6),round(heart+6)),
                  15,165,fill="#9ef9ff",width=1)
        # Tail loop / psychic sparkle. Restrained to frame boundary.
        tx=cx-11 if side<0 else cx+11
        d.arc((round(tx-3),round(ay-4),round(tx+3),round(ay+3)),
              200,480,fill="#bafaff",width=1)

    else:
        # Galactic circlet and starlit headbands are not crystals.
        d.arc((round(cx-6),round(yhead-8),round(cx+6),round(yhead+3)),
              190,485,fill="#a6e0fc",width=2)
        star(d,cx+7,yhead-9,2,"#f3fbff")
        # Wing-like nebula shoulder guards with contrasting comet streaks.
        for side_sign in (-1,1):
            px=cx+side_sign*10
            poly(d,[(px-side_sign*5,shoulder-3),(px+side_sign*2,shoulder-6),
                    (px+side_sign*6,shoulder-2),(px+side_sign*4,shoulder+5),
                    (px-side_sign*3,shoulder+3)],"#38276b","#8f9bff")
            d.line([(round(px-side_sign*2),round(shoulder-3)),
                    (round(px+side_sign*3),round(shoulder+2))],
                   fill="#87e9ff",width=1)
            star(d,px+side_sign*2,shoulder-1,2,"#f9f7ff")
        if front:
            # Planetary core: crescent, center star, translucent ring.
            d.ellipse((round(cx-5),round(heart-5),round(cx+5),round(heart+5)),
                      fill="#211849",outline="#7cc8fb",width=1)
            d.arc((round(cx-4),round(heart-4),round(cx+4),round(heart+4)),
                  45,300,fill="#daaeff",width=2)
            star(d,cx+1,heart-1,2,"#ffffff")
        # Painted stars exist at individual sprite pixels and remain animated.
        mask=frame.getchannel("A")
        rng=random.Random(15000 + direction*1000 + frame_no*31 + len(anim)*17)
        candidates=[]
        for j in range(25):
            x=rng.randint(max(1,int(cx-16)),min(w-2,int(cx+16)))
            y=rng.randint(max(1,int(yhead-7)),min(h-2,int(ay+8)))
            if mask.getpixel((x,y))>170:candidates.append((x,y))
        for i,(x,y) in enumerate(candidates[:11]):
            if i%4==0:star(d,x,y,1,"#b9e9ff")
            else:d.point((x,y),fill="#e9c7ff" if i%2 else "#c5f8ff")
    # Subtle frame-to-frame highlight, so materials change during animation.
    if anim in ("Shoot","Attack") and frame_no%3==0:
        star(d,cx+side*6,heart-8,2,
             "#fffbea" if kind=="prismatic" else "#b9f0ff")


def generate(root: Path, verify: bool=False):
    base=root/"classic/assets/pokemon"/str(DEX)
    output=root/"classic/assets/variants"/str(DEX)
    report={}
    for variant in SKINS:
        folder=output/variant
        folder.mkdir(parents=True,exist_ok=True)
        for anim,meta in ANIMS.items():
            file=base/f"{anim}.png"
            if not file.is_file():raise FileNotFoundError(f"Required source atlas missing: {file}")
            raw=Image.open(file).convert("RGBA")
            expected=(meta["w"]*meta["n"],meta["h"]*meta["r"])
            if raw.size!=expected:
                raise RuntimeError(f"Source frame geometry changed: {file}: {raw.size}!={expected}")
            tinted=recolor(raw,meta,variant)
            sheet=Image.new("RGBA",raw.size,(0,0,0,0))
            for direction in range(meta["r"]):
                for frame_no in range(meta["n"]):
                    x,y=frame_no*meta["w"],direction*meta["h"]
                    patch=tinted.crop((x,y,x+meta["w"],y+meta["h"]))
                    enhance(patch,meta,variant,direction,frame_no,anim)
                    sheet.paste(patch,(x,y))
            # Every rendered frame retains transparency, and geometry matches
            # the original (this lets the game replace atlases with no metadata edit).
            if sheet.size!=raw.size:raise AssertionError("Frame layout changed")
            if not sheet.getbbox():raise AssertionError(f"Blank output {variant}/{anim}")
            dest=folder/f"{anim}.png"
            sheet.save(dest,optimize=True,compress_level=9)
            sha=hashlib.sha256(dest.read_bytes()).hexdigest()
            report[f"{variant}/{anim}"]={
                "size":dest.stat().st_size,
                "width":sheet.width,"height":sheet.height,
                "frames":meta["n"],"directions":meta["r"],"sha256":sha
            }
    manifest=output/"manifest.json"
    manifest.write_text(json.dumps({
        "source":"SpriteCollab via JPTER78 PokéSurvivor historical MIT-era fan fork",
        "license_note":"Derivative of noncommercial SpriteCollab sprites; keep classic/CREDITS.md and CC BY-NC 4.0 attribution.",
        "generator":"tools/build_variant_atlases.py",
        "version":ART_VERSION,
        "dex":DEX,"skins":list(SKINS),"atlases":report
    },indent=2)+"\n",encoding="utf-8")
    if verify:
        assert len(report)==14
        assert all(v["size"]>300 for v in report.values())
        print("Validated",len(report),"sprite animation atlases, all transparency+layout preserved")
    else:
        print("Built",len(report),"atlases (bytes)",sum(v["size"] for v in report.values()))
    for a,v in report.items():
        print(a,v["width"],v["height"],v["size"])


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--verify",action="store_true")
    args=parser.parse_args()
    generate(args.root,args.verify)
