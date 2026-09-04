# -*- coding: utf-8 -*-
"""Extrait poids + dimensions du CORPS (LxP H{H}) par modele bois depuis le
Catalistino. Le corps = paire WxD la plus grande suivie de 'H{n}'. Le foyer
(plus petit) et les references fixes (120x80) sont ignores. Aucune invention:
on imprime les candidats bruts pour verification humaine."""
import fitz, re, sys, json
sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(r"C:\Users\Awles\Downloads\Catalistino_2026_Girolami_IT_EN_FR_ES.pdf")

# Regex titre modele -> (label, slug)
TITLES = [
    (r"\bFRAME\s+(\d{2,3})\b", "frame"),
    (r"\bVISION\s+EVO\s+(\d{2,3})\b", "vision-evo"),
    (r"\bMBS\s*F?\s+(\d{2,3})\b", "mbs-f"),
    (r"\bTC\s*BIO\s*EVO\s+(\d{2,3})\b", "tc-bio-evo"),
    (r"\bTC\s*EVO\s+(\d{2,3})\b", "tc-evo"),
    (r"\bALFA\s+DOUBLE\b", "alfa-double"),
    (r"\bALFA\b", "alfa"),
]

# corps = WxD suivi de H{n} (ex "80x60 H 70", "92x56 H 50")
BODY = re.compile(r"(\d{2,3})\s*[xX]\s*(\d{2,3})\s*H\s*(\d{2,3})")
# poids: nombre suivi de kg, ou apres 'Peso/Weight'
KG = re.compile(r"(\d{2,3})\s*[kK][gG]")

rows = []
seen = set()
for pno in range(doc.page_count):
    t = doc[pno].get_text()
    up = t.upper()
    if "CARATTERISTICHE TECNICHE" not in up:
        continue
    model = None; slug = None
    for pat, base in TITLES:
        m = re.search(pat, up)
        if m:
            num = m.group(1) if m.groups() else None
            slug = f"girolami-{base}-{num}" if num else f"girolami-{base}"
            model = m.group(0).title()
            break
    if not slug or slug in seen:
        continue
    # zone specs : page entiere (les dims peuvent etre avant/apres le header)
    zone = t
    bodies = BODY.findall(zone)  # liste (W,D,H) en ordre de lecture
    kgs = KG.findall(zone)
    # ignore la boite de reference fixe 120x80 / 135x80
    real = [b for b in bodies if not (int(b[1]) == 80 and int(b[0]) in (120, 135))]
    if not real:
        continue
    seen.add(slug)
    # corps = PREMIERE paire reelle en ordre de lecture (le foyer vient apres)
    W, D, H = real[0]
    weight = max((int(x) for x in kgs), default=None)
    rows.append({"slug": slug, "model": model, "page": pno,
                 "W": int(W), "H": int(H), "D": int(D), "weight": weight,
                 "all_bodies": bodies, "kg_found": kgs})

print(f"{'SLUG':<28}{'MODELE':<16}{'p.':>4}  {'LxHxP (cm)':<16}{'poids':>7}   candidats(WxDxH)")
for r in sorted(rows, key=lambda r: r["slug"]):
    print(f"{r['slug']:<28}{r['model']:<16}{r['page']:>4}  "
          f"{r['W']}x{r['H']}x{r['D']:<10}{str(r['weight'])+'kg':>7}   {r['all_bodies']}")
json.dump(rows, open("wood_geometry.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"\n{len(rows)} modeles -> wood_geometry.json")
