#!/usr/bin/env python3
# ===== Zoxa PWA Icon Generator =====
# 7rfy: pillow, math
# y5r: 192x192, 384x384, 512x512 PNG + SVG

from PIL import Image, ImageDraw, ImageFont
import math, os, io

SZ = 512
H = SZ // 2
C = {
    'bg': (10, 10, 15),
    'r1': (220, 30, 30),
    'r2': (180, 20, 20),
    'r3': (255, 60, 60),
    'w1': (220, 220, 230),
    'w2': (150, 150, 160),
    'g1': (40, 40, 50),
    'g2': (30, 30, 38),
    'gl': (255, 80, 80, 30),
}

def dr_cr(d, x, y, r, c):
    """Draw circle"""
    d.ellipse([x-r, y-r, x+r, y+r], fill=c)

def dr_rr(d, x1, y1, x2, y2, r, c):
    """Draw rounded rect"""
    d.rounded_rectangle([x1, y1, x2, y2], r, fill=c)

def dr_px(d, x, y, s, c):
    """Draw pixel block"""
    d.rectangle([x, y, x+s, y+s], fill=c)

def dr_tr(d, pts, c):
    """Draw triangle"""
    d.polygon(pts, fill=c)

def main():
    img = Image.new('RGBA', (SZ, SZ), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # === BG ===
    dr_rr(d, 20, 20, SZ-20, SZ-20, 60, C['bg'])
    dr_rr(d, 40, 40, SZ-40, SZ-40, 50, C['g1'])

    # === Glow behind Z ===
    for i in range(5):
        a = 40 - i * 8
        r = 160 + i * 20
        gx = H
        gy = H + 10
        dr_cr(d, gx, gy, r, (C['r1'][0], C['r1'][1], C['r1'][2], max(0, a)))

    # === Pixel Z ===
    px = 24  # pixel size
    gap = 4
    ps = px + gap

    # Z shape: top row, diagonal, bottom row
    zx = H - 4 * ps
    zy = H - 4 * ps

    # Top row (9 pixels)
    for i in range(9):
        dr_px(d, zx + i * ps, zy, px, C['r1'])

    # Diagonal
    for i in range(8):
        dr_px(d, zx + (8 - i) * ps, zy + (i + 1) * ps, px, C['r2'])

    # Bottom row (9 pixels)
    for i in range(9):
        dr_px(d, zx + i * ps, zy + 9 * ps, px, C['r1'])

    # === Pickaxe behind Z ===
    pkx = H - 95
    pky = H + 30
    # Handle
    d.rectangle([pkx, pky, pkx+8, pky+120], fill=C['w2'])
    # Head
    d.polygon([
        pkx-20, pky-10,
        pkx+28, pky-10,
        pkx+8, pky+30,
        pkx, pky+30,
    ], fill=C['w1'])
    # Head detail
    d.polygon([
        pkx-15, pky-5,
        pkx+23, pky-5,
        pkx+6, pky+25,
        pkx, pky+25,
    ], fill=C['g2'])

    # === Small stars/particles ===
    for x, y, r in [(100, 80, 3), (420, 70, 2), (80, 400, 2), (430, 410, 3), (H, 60, 2)]:
        dr_cr(d, x, y, r, C['w2'])

    # === Border glow ===
    for i in range(3):
        w = 3 - i
        a = 80 - i * 25
        dr_rr(d, 20-i*2, 20-i*2, SZ-20+i*2, SZ-20+i*2, 60, (C['r1'][0], C['r1'][1], C['r1'][2], a))

    # === Save ===
    os.makedirs('public/icons', exist_ok=True)

    # SVG
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="64" fill="#1a1a2e"/>
  <rect x="40" y="40" width="432" height="432" rx="48" fill="#28283a"/>
  <circle cx="256" cy="266" r="200" fill="rgba(220,38,38,0.15)"/>
  <text x="256" y="300" font-family="monospace" font-size="280" font-weight="bold" fill="url(#g)" text-anchor="middle" dominant-baseline="middle">Z</text>
  <rect x="256" y="380" width="12" height="80" rx="6" fill="#9696a0"/>
  <polygon points="236,370 284,370 268,410 248,410" fill="#dcdce6"/>
</svg>'''
    with open('public/icons/icon.svg', 'w') as f:
        f.write(svg)
    print('✅ SVG done')

    # PNG sizes
    for s in [192, 384, 512]:
        si = img.resize((s, s), Image.LANCZOS)
        si.save(f'public/icons/icon-{s}x{s}.png', 'PNG')
        print(f'✅ {s}x{s} PNG done')

    print('✅ All icons generated')
    print(f'📁 public/icons/')

if __name__ == '__main__':
    main()