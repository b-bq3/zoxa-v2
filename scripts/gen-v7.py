#!/usr/bin/env python3
# ===== Zoxa Icon V7 =====
# Pillow b2S — Sh2h Zoxa 7rfy

from PIL import Image, ImageDraw
import os

SZ = 512
H = SZ // 2

img = Image.new('RGBA', (SZ, SZ), (15, 15, 25, 255))
d = ImageDraw.Draw(img)

# BG
d.rounded_rectangle([15, 15, SZ-15, SZ-15], 55, fill=(15, 15, 25, 255))
d.rounded_rectangle([25, 25, SZ-25, SZ-25], 48, fill=(28, 28, 42, 255))

# Red border glow
for i in range(3):
    a = 50 - i * 15
    d.rounded_rectangle([30-i*3, 30-i*3, SZ-30+i*3, SZ-30+i*3], 50, outline=(220, 38, 38, max(0, a)), width=3-i)

# Glow
for i in range(6):
    a = 25 - i * 4
    d.ellipse([H-130-i*10, H+10-130-i*10, H+130+i*10, H+10+130+i*10], fill=(220, 38, 38, max(0, a)))

# === BIG Z ===
ps = 20
gp = 3
st = ps + gp
sx = H - 4 * st
sy = H - 4 * st

# Shadow
for ox, oy in [(3, 3)]:
    for i in range(9):
        d.rectangle([sx + i*st + ox, sy + oy, sx + i*st + ps + ox, sy + ps + oy], fill=(0, 0, 0, 80))
    for i in range(8):
        d.rectangle([sx + (8-i)*st + ox, sy + (i+1)*st + oy, sx + (8-i)*st + ps + ox, sy + (i+1)*st + ps + oy], fill=(0, 0, 0, 80))
    for i in range(9):
        d.rectangle([sx + i*st + ox, sy + 9*st + oy, sx + i*st + ps + ox, sy + 9*st + ps + oy], fill=(0, 0, 0, 80))

# Top row
for i in range(9):
    d.rectangle([sx + i*st, sy, sx + i*st + ps, sy + ps], fill=(255, 80, 80, 255) if i%2==0 else (220, 38, 38, 255))

# Diagonal
for i in range(8):
    d.rectangle([sx + (8-i)*st, sy + (i+1)*st, sx + (8-i)*st + ps, sy + (i+1)*st + ps], fill=(220, 38, 38, 255) if i%2==0 else (185, 28, 28, 255))

# Bottom row
for i in range(9):
    d.rectangle([sx + i*st, sy + 9*st, sx + i*st + ps, sy + 9*st + ps], fill=(255, 80, 80, 255) if i%2==0 else (220, 38, 38, 255))

# === Pickaxe ===
pkx = H - 65
pky = H + 40

# Handle
d.rectangle([pkx+4, pky+3, pkx+10, pky+100+3], fill=(0, 0, 0, 80))
d.rectangle([pkx+2, pky, pkx+10, pky+100], fill=(160, 160, 170, 255))
d.rectangle([pkx+4, pky+10, pkx+8, pky+90], fill=(220, 220, 230, 255))

# Head
d.polygon([pkx-18, pky-13, pkx+34, pky-13, pkx+12, pky+37, pkx+4, pky+37], fill=(0, 0, 0, 80))
d.polygon([pkx-20, pky-15, pkx+32, pky-15, pkx+10, pky+35, pkx+2, pky+35], fill=(220, 220, 230, 255))
d.polygon([pkx-15, pky-10, pkx+27, pky-10, pkx+8, pky+28, pkx+4, pky+28], fill=(28, 28, 42, 255))
d.polygon([pkx-20, pky-15, pkx+32, pky-15, pkx+10, pky+35, pkx+2, pky+35], outline=(220, 38, 38, 255), width=2)

# Gold stars
for x, y, r in [(90, 95, 4), (425, 85, 3), (80, 405, 3), (430, 410, 4), (H, 50, 3)]:
    d.ellipse([x-r, y-r, x+r, y+r], fill=(255, 185, 0, 255))
    d.ellipse([x-r+1, y-r+1, x+r-1, y+r-1], fill=(255, 220, 80, 255))

# Text ZOXA
tx = H
ty = SZ - 55

# Z
for i in range(8):
    d.rectangle([tx-70+i*6, ty, tx-70+i*6+4, ty+4], fill=(255, 80, 80, 255))
for i in range(7):
    d.rectangle([tx-70+(7-i)*6, ty+(i+1)*6, tx-70+(7-i)*6+4, ty+(i+1)*6+4], fill=(220, 38, 38, 255))
for i in range(8):
    d.rectangle([tx-70+i*6, ty+8*6, tx-70+i*6+4, ty+8*6+4], fill=(255, 80, 80, 255))

# O
for i in range(8):
    d.rectangle([tx-26+i*6, ty, tx-26+i*6+4, ty+4], fill=(255, 80, 80, 255))
    d.rectangle([tx-26+i*6, ty+8*6, tx-26+i*6+4, ty+8*6+4], fill=(255, 80, 80, 255))
for i in range(7):
    d.rectangle([tx-26, ty+(i+1)*6, tx-26+4, ty+(i+1)*6+4], fill=(220, 38, 38, 255))
    d.rectangle([tx-26+7*6, ty+(i+1)*6, tx-26+7*6+4, ty+(i+1)*6+4], fill=(220, 38, 38, 255))

# X
for i in range(8):
    d.rectangle([tx+18+i*6, ty, tx+18+i*6+4, ty+4], fill=(255, 80, 80, 255))
    d.rectangle([tx+18+i*6, ty+8*6, tx+18+i*6+4, ty+8*6+4], fill=(255, 80, 80, 255))
for i in range(7):
    d.rectangle([tx+18+(7-i)*6, ty+(i+1)*6, tx+18+(7-i)*6+4, ty+(i+1)*6+4], fill=(255, 80, 80, 255))
    d.rectangle([tx+18+i*6, ty+(i+1)*6, tx+18+i*6+4, ty+(i+1)*6+4], fill=(255, 80, 80, 255))

# A
for i in range(8):
    d.rectangle([tx+62+i*6, ty, tx+62+i*6+4, ty+4], fill=(255, 80, 80, 255))
    d.rectangle([tx+62+i*6, ty+8*6, tx+62+i*6+4, ty+8*6+4], fill=(255, 80, 80, 255))
for i in range(3):
    d.rectangle([tx+62, ty+(i+1)*6, tx+62+4, ty+(i+1)*6+4], fill=(220, 38, 38, 255))
    d.rectangle([tx+62+7*6, ty+(i+1)*6, tx+62+7*6+4, ty+(i+1)*6+4], fill=(220, 38, 38, 255))
    d.rectangle([tx+62, ty+5*6+i*6, tx+62+4, ty+5*6+i*6+4], fill=(220, 38, 38, 255))
    d.rectangle([tx+62+7*6, ty+5*6+i*6, tx+62+7*6+4, ty+5*6+i*6+4], fill=(220, 38, 38, 255))
for i in range(8):
    d.rectangle([tx+62+i*6, ty+4*6, tx+62+i*6+4, ty+4*6+4], fill=(255, 80, 80, 255))

# Save
os.makedirs('public/icons', exist_ok=True)
img.save('public/icons/zoxa-icon-v7.png', 'PNG')
print('✅ V7 done')