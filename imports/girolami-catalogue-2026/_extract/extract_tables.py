# -*- coding: utf-8 -*-
"""
Extraction layout-aware des tables de prix Girolami (CATALISTINO 2026).
Reconstruit les colonnes MODELLO | DATI TECNICI | COLORE | CODICE | PREZZO
en clusterisant les mots par position (x,y) plutot que par flux texte.

Sortie : un dump texte aligne par page + un JSON de lignes brutes, pour
relecture humaine avant encodage. AUCUNE invention : un prix qui ne
s'aligne sur aucune ligne couleur reste vide.
"""
import fitz, json, sys, re

PDF = r"C:\Users\Awles\Downloads\Catalistino_2026_Girolami_IT_EN_FR_ES.pdf"

# Pages tables EN PERIMETRE (tout sauf chaudieres CALDAIE p.104-116).
PAGES = {
    "AIR_STOVES":   [24,26,28,30,32,34,36,38,40,42,44,46,48],
    "PELLET_INSERTS":[58,60,62],
    "HYDRO_STOVES": [66,68,70,72,74,76],
    "HYDRO_INSERTS":[86,88,90,92,94,96,98],
    "WOOD_HYDRO_FP":[123,124,125,126],
    "WOOD_MONOBLOCKS":[134,136,138,140,142,144,145,146,147,148,149],
    "WOOD_INSERTS": [158,160,161],
}

def ytol(words, tol=3.0):
    """Groupe les mots en lignes visuelles par proximite verticale (y0)."""
    rows = []
    for w in sorted(words, key=lambda w:(w[1], w[0])):
        placed = False
        for r in rows:
            if abs(r["y"] - w[1]) <= tol:
                r["words"].append(w); placed = True; break
        if not placed:
            rows.append({"y": w[1], "words":[w]})
    for r in rows:
        r["words"].sort(key=lambda w:w[0])
    rows.sort(key=lambda r:r["y"])
    return rows

def find_header_cols(rows):
    """Trouve la ligne d'en-tete MODELLO...PREZZO et renvoie les x des colonnes."""
    for r in rows:
        txt = " ".join(w[4] for w in r["words"]).upper()
        if "MODELLO" in txt and "PREZZO" in txt:
            anchors = {}
            for w in r["words"]:
                u = w[4].upper()
                if u == "MODELLO": anchors["model"] = w[0]
                elif u in ("DATI","RIVESTIMENTO"): anchors["tech"] = w[0]
                elif u in ("COLORE","FINITURA","RIVESTIMENTO"): anchors["color"] = w[0]
                elif u == "CODICE": anchors["code"] = w[0]
                elif u == "PREZZO": anchors["price"] = w[0]
            return r["y"], anchors
    return None, None

def col_of(x, anchors):
    # boundaries = midpoints entre anchors connus
    order = ["model","tech","color","code","price"]
    present = [(k,anchors[k]) for k in order if k in anchors]
    best=None; bestd=1e9
    for k,ax in present:
        # assign to nearest anchor whose x <= word start, else nearest
        pass
    # simple: assign to the anchor with greatest x that is <= x (+ tolerance)
    chosen = present[0][0]
    for k,ax in present:
        if x >= ax - 25:
            chosen = k
    return chosen

def extract_page(doc, pno):
    pg = doc[pno]
    words = [w for w in pg.get_text("words")]
    rows = ytol(words, tol=3.0)
    hy, anchors = find_header_cols(rows)
    out = {"page": pno, "header_anchors": anchors, "rows": []}
    if anchors is None:
        out["error"] = "no header found"
        return out
    started = False
    for r in rows:
        txt = " ".join(w[4] for w in r["words"])
        up = txt.upper()
        if r["y"] <= hy + 1:  # skip header & above
            if "MODELLO" in up and "PREZZO" in up:
                started = True
            continue
        if not started:
            continue
        # stop at accessories / footer markers
        if up.startswith("ACCESSORI") or "ECO DESIGN" in up or up.startswith("KIT ") or up.startswith("TERMOSTATO") or up.startswith("SENSORE"):
            break
        cells = {"model":[], "tech":[], "color":[], "code":[], "price":[]}
        for w in r["words"]:
            cells[col_of(w[0], anchors)].append(w[4])
        rowd = {k:" ".join(v) for k,v in cells.items()}
        rowd["y"] = round(r["y"],1)
        if any(rowd[k] for k in ("model","tech","color","code","price")):
            out["rows"].append(rowd)
    return out

def main():
    doc = fitz.open(PDF)
    allout = {}
    lines = []
    for cat, pages in PAGES.items():
        lines.append(f"\n{'='*90}\n## CATEGORY: {cat}\n{'='*90}")
        for pno in pages:
            res = extract_page(doc, pno)
            allout[f"{cat}:p{pno}"] = res
            lines.append(f"\n--- PAGE {pno} (anchors={res.get('header_anchors')}) ---")
            if "error" in res:
                lines.append(f"  !! {res['error']}")
                continue
            for rd in res["rows"]:
                lines.append(
                    f"  M[{rd['model']:<22}] T[{rd['tech']:<26}] "
                    f"C[{rd['color']:<20}] #[{rd['code']:<14}] P[{rd['price']}]"
                )
    with open("_extract/tables_raw.json","w",encoding="utf-8") as f:
        json.dump(allout, f, ensure_ascii=False, indent=1)
    with open("_extract/tables_dump.txt","w",encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Pages traitees: {sum(len(v) for v in PAGES.values())}")
    print(f"Ecrit: _extract/tables_dump.txt  +  _extract/tables_raw.json")

if __name__ == "__main__":
    main()
