# -*- coding: utf-8 -*-
"""
Extrait par FAMILLE : largeur, profondeur, hauteur (cm) et poids (kg) depuis la
ligne CARATTERISTICHE TECNICHE des pages produit (boitier identique sur toutes
les puissances d'une famille). Validé contre Split vérifié par l'équipe
(58x119x54, 170 kg) et Mini (poids 150). Aucune invention : absent = null.
"""
import fitz, json, re, sys
sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(r"C:\Users\Awles\Downloads\Catalistino_2026_Girolami_IT_EN_FR_ES.pdf")

FAM = ["TWIN SLIM MATERIA","TWIN SLIM","TWIN MINI","ROUND COAX","ROUND","SLIM COAX","SLIM",
    "CURVY","FLOW","MINI","VERT MAIOLICA","VERT","SPLIT","GRID VERTICALE","GRID PANORAMA",
    "ALFA BIO","SOFT MAIOLICA","SOFT SLIM","SOFT","SHARP","EDGE","FURNI",
    "TI SLIM PANORAMA","TI SLIM","TI PANORAMA","TI"]

def page_text(pno):
    return doc[pno].get_text().upper()

def extract(pno):
    pg = doc[pno]; ws = pg.get_text("words"); rows = {}
    for w in ws: rows.setdefault(round(w[1] / 3.0), []).append(w)
    ykeys = sorted(rows)
    block = None
    for i, yk in enumerate(ykeys):
        line = " ".join(w[4] for w in sorted(rows[yk], key=lambda w: w[0]))
        if "CARATTERISTICHE TECNICHE" in line.upper():
            block = []
            for j in range(i + 1, min(i + 6, len(ykeys))):
                block.append(" ".join(w[4] for w in sorted(rows[ykeys[j]], key=lambda w: w[0])))
            break
    if not block: return None
    txt = " ".join(block)
    # paires WxD (premiere paire = base produit)
    pairs = re.findall(r"(\d{2,3})x(\d{2,3})", txt)
    W = int(pairs[0][0]) if pairs else None
    D = int(pairs[0][1]) if pairs else None
    # poids = nombre apres le diametre fumees (80/100/130) sur la ligne vol/kg
    wt = None
    m = re.search(r"\bkg\b\s+(\d{2,3})\s+(\d{2,3})\b", txt)
    if m: wt = int(m.group(2))  # apres Ø
    # hauteur = premier H{n}
    H = None
    mh = re.search(r"H\s*(\d{2,3})(?:[.,]\d+)?", txt)
    if mh: H = int(mh.group(1))
    return {"W": W, "H": H, "D": D, "weight": wt, "raw": txt[:90]}

result = {}
for pno in range(20, 100):  # pages produit air/inserts/hydro
    t = page_text(pno)
    if "CARATTERISTICHE TECNICHE" not in t: continue
    fam = next((f for f in FAM if f in t), None)
    if not fam: continue
    if fam in result: continue  # premiere occurrence = page produit (boitier)
    g = extract(pno)
    if g: result[fam] = g

for f in FAM:
    if f in result:
        g = result[f]
        print(f"{f:<22} W{g['W']} H{g['H']} D{g['D']}  {g['weight']}kg   | {g['raw']}")
json.dump(result, open("family_geometry.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("\nEcrit family_geometry.json")
