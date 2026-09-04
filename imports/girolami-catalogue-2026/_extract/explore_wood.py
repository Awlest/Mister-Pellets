# -*- coding: utf-8 -*-
"""Explore les pages bois du Catalistino pour comprendre la mise en page des
dimensions (Frame, Vision Evo, MBS, Alfa, TC Evo, TC Bio Evo)."""
import fitz, re, sys
sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(r"C:\Users\Awles\Downloads\Catalistino_2026_Girolami_IT_EN_FR_ES.pdf")

WOOD = ["FRAME", "VISION EVO", "VISION", "MBS", "ALFA", "TC BIO EVO", "TC EVO"]

for pno in range(doc.page_count):
    t = doc[pno].get_text().upper()
    fam = next((f for f in WOOD if f in t), None)
    if not fam:
        continue
    has_tech = "CARATTERISTICHE TECNICHE" in t or "TECHNICAL" in t or "CARACT" in t
    # cherche des indices de dimensions
    dims = re.findall(r"(\d{2,3})\s*[xX]\s*(\d{2,3})", t)
    weights = re.findall(r"(\d{2,3})\s*KG", t)
    print(f"--- page {pno} | fam={fam} | tech={has_tech} | dimsXX={dims[:6]} | kg={weights[:6]}")

print("\n=== DUMP d'une page Frame (texte brut autour des specs) ===")
for pno in range(doc.page_count):
    t = doc[pno].get_text()
    if "FRAME" in t.upper() and ("CARATTERISTICHE" in t.upper() or re.search(r"\d{2,3}\s*[xX]\s*\d{2,3}", t)):
        print(f">>> PAGE {pno}")
        print(t[:1500])
        break
