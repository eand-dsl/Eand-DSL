#!/usr/bin/env python3
"""Convert the licensed Suisse Intl TTFs into Latin + Arabic woff2 subsets."""
import os, subprocess, sys

SRC = "/Users/kushal.l.sharma/Downloads/e&-Suisse font"
OUT = "/Users/kushal.l.sharma/Desktop/E&DSA/apps/docs/public/fonts"

LATIN = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
         "U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,"
         "U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
ARABIC = ("U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,"
          "U+08E3-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200E,U+2010-2011,"
          "U+204F,U+2E41,U+FDF2,U+FDFC")

# (weight, latin source file, arabic source file)
# Book (450) has NO Arabic glyphs, so Arabic at 450 is served from Regular.
FACES = [
    (300, "SuisseIntl-Light.ttf",    "SuisseIntl-Light.ttf"),
    (400, "SuisseIntl-Regular.ttf",  "SuisseIntl-Regular.ttf"),
    (450, "SuisseIntl-Book.ttf",     "SuisseIntl-Regular.ttf"),
    (500, "SuisseIntl-Medium.ttf",   "SuisseIntl-Medium.ttf"),
    (600, "SuisseIntl-SemiBold.ttf", "SuisseIntl-SemiBold.ttf"),
    (700, "SuisseIntl-Bold.ttf",     "SuisseIntl-Bold.ttf"),
]

os.makedirs(OUT, exist_ok=True)
rows = []

for weight, latin_src, arabic_src in FACES:
    for script, src, ranges in (("latin", latin_src, LATIN), ("arabic", arabic_src, ARABIC)):
        src_path = os.path.join(SRC, src)
        dest = os.path.join(OUT, f"suisse-{weight}-{script}.woff2")
        cmd = [
            sys.executable, "-m", "fontTools.subset", src_path,
            f"--unicodes={ranges}",
            "--layout-features=*",
            "--flavor=woff2",
            "--desubroutinize",
            f"--output-file={dest}",
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"FAIL {dest}\n{r.stderr[-500:]}")
            continue
        size = os.path.getsize(dest)
        rows.append((weight, script, src, size))
        print(f"  {os.path.basename(dest):32s} {size/1024:7.1f} KB  <- {src}")

print(f"\ntotal: {sum(r[3] for r in rows)/1024:.1f} KB across {len(rows)} files")
