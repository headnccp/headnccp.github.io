"""Styled QR: round data dots, rounded finder squares, purple ribbon in the centre."""
import sys
import segno
from PIL import Image, ImageDraw

url, out = sys.argv[1], sys.argv[2]
FINAL = 2000          # output px
SS = 3                # supersampling factor
INK = (0, 0, 0)
PURPLE = (91, 42, 134)
PURPLE_DARK = (67, 32, 95)

qr = segno.make(url, error="h", micro=False, boost_error=False)
matrix = [list(r) for r in qr.matrix]
n = len(matrix)
quiet = 4
cell = FINAL * SS // (n + 2 * quiet)
size = cell * (n + 2 * quiet)
img = Image.new("RGB", (size, size), "white")
d = ImageDraw.Draw(img)

def xy(c, r):
    return (quiet + c) * cell, (quiet + r) * cell

finders = [(0, 0), (n - 7, 0), (0, n - 7)]
def in_finder(c, r):
    return any(fc <= c < fc + 7 and fr <= r < fr + 7 for fc, fr in finders)

# Centre logo area (cleared), ~22% of the symbol width -- safe at error level H.
logo_mods = int(n * 0.22) | 1
lo = (n - logo_mods) // 2
def in_logo(c, r):
    return lo - 1 <= c < lo + logo_mods + 1 and lo - 1 <= r < lo + logo_mods + 1

pad = cell * 0.08
for r in range(n):
    for c in range(n):
        if matrix[r][c] and not in_finder(c, r) and not in_logo(c, r):
            x, y = xy(c, r)
            d.ellipse([x + pad, y + pad, x + cell - pad, y + cell - pad], fill=INK)

for fc, fr in finders:
    x, y = xy(fc, fr)
    s = 7 * cell
    d.rounded_rectangle([x, y, x + s, y + s], radius=cell * 2.2, fill=INK)
    d.rounded_rectangle([x + cell, y + cell, x + s - cell, y + s - cell], radius=cell * 1.4, fill="white")
    d.rounded_rectangle([x + 2 * cell, y + 2 * cell, x + s - 2 * cell, y + s - 2 * cell], radius=cell * 0.9, fill=INK)

# Awareness ribbon in the cleared centre.
bx, by = xy(lo, lo)
bs = logo_mods * cell
def P(u, v):
    return bx + u / 100 * bs, by + v / 100 * bs

def bezier(p0, p1, p2, p3, steps=60):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        a, b, c_, e = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
        pts.append((a * p0[0] + b * p1[0] + c_ * p2[0] + e * p3[0],
                    a * p0[1] + b * p1[1] + c_ * p2[1] + e * p3[1]))
    return [P(*p) for p in pts]

w = int(bs * 0.15)
# Loop: from the crossing, up the left side, over the top, down the right side.
loop = bezier((50, 58), (22, 30), (34, 4), (50, 4)) + bezier((50, 4), (66, 4), (78, 30), (50, 58))
leg_a = bezier((50, 58), (40, 72), (32, 84), (24, 96))   # to bottom-left
leg_b = bezier((50, 58), (60, 72), (68, 84), (76, 96))   # to bottom-right
def stroke(pts, col):
    # Stamp discs along a densely resampled path: smooth edges, no joint artefacts.
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        steps = max(1, int(((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5 / 2))
        for i in range(steps + 1):
            px, py = x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps
            d.ellipse([px - w / 2, py - w / 2, px + w / 2, py + w / 2], fill=col)

stroke(leg_a, PURPLE_DARK)
stroke(loop, PURPLE)
stroke(leg_b, PURPLE)

img.resize((FINAL, FINAL), Image.LANCZOS).save(out)
print(out, n, "modules")
