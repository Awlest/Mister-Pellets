# -*- coding: utf-8 -*-
"""
Construit le JSON canonique d'extraction Girolami (coeur pellet) a partir de
products_parsed.json. Fusionne par code de base, derive famille/config/type,
attache les specs des fiches techniques (p163-171, valeurs relevees a la main
depuis le PDF, FIDELES), calcule le TTC = round(HT*1.21).

Regle d'or : aucune invention. Spec absente = null.
Sortie : 01-extraction-girolami.json (+ resume console)
"""
import json, re, sys
sys.stdout.reconfigure(encoding="utf-8")

src = json.load(open("_extract/products_parsed.json", encoding="utf-8"))

# ---- Specs fiches techniques (FIDELE au catalogue, p163-171) -----------------
# Cle = puissance nominale "classe". Valeurs : kW max focolaire, kW nominal,
# rendement %, volume m3, reservoir kg, sortie fumees mm, poids kg (None = "voir
# fiche produit" dans le catalogue), contenu eau L (hydro).
AIR = {  # ROUND/SLIM/CURVY/FLOW/VERT/VERT MAIOLICA/SPLIT (+ COAX) et MINI
    6:  {"powerMaxKW":6.02,"powerNomKW":5.77,"eff":95.80,"volumeM3":165,"hopperKg":15,"smokeMm":80,"weightKg":None},
    9:  {"powerMaxKW":8.65,"powerNomKW":8.31,"eff":96.01,"volumeM3":276,"hopperKg":15,"smokeMm":80,"weightKg":None},
    12: {"powerMaxKW":11.26,"powerNomKW":10.84,"eff":96.21,"volumeM3":310,"hopperKg":15,"smokeMm":80,"weightKg":None},
    14: {"powerMaxKW":13.65,"powerNomKW":13.03,"eff":95.46,"volumeM3":373,"hopperKg":15,"smokeMm":80,"weightKg":None},
}
TWIN_MINI = {6:{"powerMaxKW":6.02,"powerNomKW":5.77,"eff":95.80,"volumeM3":165,"hopperKg":15,"smokeMm":130,"weightKg":150}}
TWIN_SLIM = {
    9:  {"powerMaxKW":8.65,"powerNomKW":8.31,"eff":96.01,"volumeM3":276,"hopperKg":30,"smokeMm":130,"weightKg":170},
    12: {"powerMaxKW":11.26,"powerNomKW":10.84,"eff":96.21,"volumeM3":310,"hopperKg":30,"smokeMm":130,"weightKg":170},
}
HYDRO = {  # SOFT/SOFT MAIOLICA/SOFT SLIM/SHARP/EDGE/FURNI + TI* (eff data sheet p165/169)
    14: {"powerMaxKW":15.02,"powerH2OKW":13.47,"eff":96.44,"volumeM3":375,"hopperKg":25,"smokeMm":100,"weightKg":250,"waterL":43},
    18: {"powerMaxKW":18.10,"powerH2OKW":15.92,"eff":96.22,"volumeM3":452,"hopperKg":25,"smokeMm":100,"weightKg":250,"waterL":43},
    22: {"powerMaxKW":22.07,"powerH2OKW":19.09,"eff":95.93,"volumeM3":551,"hopperKg":25,"smokeMm":100,"weightKg":250,"waterL":43},
    26: {"powerMaxKW":24.06,"powerH2OKW":20.67,"eff":95.78,"volumeM3":584,"hopperKg":25,"smokeMm":100,"weightKg":250,"waterL":43},
}
GRID = {
    9:  {"powerMaxKW":8.65,"powerNomKW":8.31,"eff":96.01,"volumeM3":276,"hopperKg":30,"smokeMm":130,"weightKg":170},
    12: {"powerMaxKW":11.26,"powerNomKW":10.84,"eff":96.21,"volumeM3":310,"hopperKg":30,"smokeMm":130,"weightKg":170},
}
# Overrides modeles dont le nom n'a pas pu etre lu proprement (5 cas).
NAME_OVERRIDE = {
    "3042":"TI SLIM PANORAMA 14 HYBRID","3043":"TI SLIM PANORAMA 18 HYBRID",
    "3044":"TI SLIM PANORAMA 22 HYBRID","3045":"TI SLIM PANORAMA 26 HYBRID",
    "3015":"ALFA BIO",
}

CONFIG_WORDS = {"CANALIZZATA","DUCTED","COASSIALE","COAXIAL","HYBRID","PELLET","NOM","/"}

def slugify(s):
    s=s.lower()
    s=(s.replace("é","e").replace("è","e").replace("à","a").replace("ô","o"))
    s=re.sub(r"[^a-z0-9]+","-",s); return re.sub(r"^-+|-+$","",s)

def derive(model, base):
    up=(model or NAME_OVERRIDE.get(base) or "").upper()
    up=re.sub(r"([A-Z])(\d)", r"\1 \2", up)  # EDGE18 -> EDGE 18
    isCanal="CANALIZZ" in up or "DUCTED" in up
    isCoax="COASSIAL" in up or "COAXIAL" in up
    comb = "pellet" if (base.endswith("-P") or "PELLET" in up) else ("hybrid" if "HYBRID" in up else None)
    toks=[t for t in re.split(r"\s+",up) if t and not t.isdigit() and t not in CONFIG_WORDS]
    family=" ".join(toks).strip()
    return family, isCanal, isCoax, comb

def engine_specs(family, power):
    f=family.upper()
    if f.startswith("TWIN MINI"): return TWIN_MINI.get(power)
    if f.startswith("TWIN SLIM"): return TWIN_SLIM.get(power)
    if f.startswith("GRID"): return GRID.get(power)
    if any(f.startswith(x) for x in ["SOFT","SHARP","EDGE","FURNI","TI"]): return HYDRO.get(power)
    if any(f.startswith(x) for x in ["ROUND","SLIM","CURVY","FLOW","MINI","VERT","SPLIT"]): return AIR.get(power)
    return None

def product_type(family, isCanal, isHydroIns, comb):
    f=family.upper()
    if f.startswith("GRID") or f.startswith("ALFA"): return "insert"
    if any(f.startswith(x) for x in ["SOFT","SHARP","EDGE","FURNI"]):
        return "hybride" if comb=="hybrid" else "hydro"
    if f.startswith("TI"):
        return "hybride" if comb=="hybrid" else "hydro"  # insert hydro -> hydro + note insert
    return "canalisable" if isCanal else "standard"

def ttc(ht): return round(ht*1.21) if ht else None

# ---- Fusion par code de base (gere TWIN SLIM standard+materia meme base) ------
merged={}  # base -> product
for cat, recs in src.items():
    for r in recs:
        base=r["base"]; model=r["model"]
        family,_dc,_dx,comb=derive(model,base)
        # flags config : on fait CONFIANCE au parseur (marqueurs CANALIZZATA/
        # COASSIALE lus en colonne), pas au nom de modele souvent tronque.
        isCanal=r.get("isCanalizzata",False); isCoax=r.get("isCoassiale",False)
        power=r["powerClass"]
        key=base
        if key not in merged:
            merged[key]={"base":base,"category":cat,"family":family,
                "powerClass":power,"isCanalizzata":isCanal,"isCoassiale":isCoax,
                "combustible":comb,"model":model or NAME_OVERRIDE.get(base),
                "pPowerMax":r.get("powerMax"),"pPowerNom":r.get("powerNom"),"pEff":r.get("efficiency"),
                "variants":[]}
        p=merged[key]
        for c in r["colors"]:
            p["variants"].append({"color":c["color"],"code":c["code"],
                "priceHT":r["priceHT"],"priceTTC":ttc(r["priceHT"])})

# ---- Enrichissement final -----------------------------------------------------
products=[]
for base,p in merged.items():
    fam=p["family"]; power=p["powerClass"]; comb=p["combustible"]
    specs=engine_specs(fam,power) or {}
    isHydro=any(fam.upper().startswith(x) for x in ["SOFT","SHARP","EDGE","FURNI","TI"])
    isInsert=fam.upper().startswith("GRID") or fam.upper().startswith("ALFA") or fam.upper().startswith("TI")
    ptype=product_type(fam,p["isCanalizzata"],isHydro,comb)
    # nom commercial
    famtitle=" ".join(w.capitalize() for w in fam.split())
    famtitle=re.sub(r"^Ti\b","TI",famtitle)  # TI = acronyme termocamino inserto
    suffix=[]
    if comb=="hybrid": suffix.append("Hybride bois-pellet")
    elif comb=="pellet" and isHydro: suffix.append("Pellet")
    if p["isCanalizzata"]: suffix.append("canalisable")
    if p["isCoassiale"]: suffix.append("coaxiale")
    pwr_label=str(power) if power else ""
    name=f"Girolami {famtitle} {pwr_label}".strip()
    slug=slugify(f"girolami-{fam}"+(f"-{power}" if power else ""))+ (("-canalisable" if p["isCanalizzata"] else "")+("-coaxiale" if p["isCoassiale"] else "")+("-pellet" if comb=="pellet" and isHydro else "")+("-hybride" if comb=="hybrid" else ""))
    base_ht=min((v["priceHT"] for v in p["variants"] if v["priceHT"]), default=None)
    powerMaxKW=specs.get("powerMaxKW") or p.get("pPowerMax")
    powerNomKW=specs.get("powerNomKW") or specs.get("powerH2OKW") or p.get("pPowerNom")
    efficiency=specs.get("eff") or p.get("pEff")
    power_field=power if power else (round(powerMaxKW) if powerMaxKW else None)
    products.append({
        "base":base,"slug":slug,"sku":f"GIR-{base}".replace("/","-"),
        "name":name+(" "+", ".join(suffix) if suffix else ""),
        "family":famtitle,"model":p["model"],"powerClass":power,"power":power_field,
        "productType":ptype,"category":p["category"],
        "combustible":comb,
        "isCanalizable":p["isCanalizzata"],"isCoassiale":p["isCoassiale"],
        "isHydro":isHydro,"isAirtight": not isHydro and not isInsert,  # poeles air = ermetica
        "isInsert":isInsert,
        "powerMaxKW":powerMaxKW,"powerNomKW":powerNomKW,
        "efficiency":efficiency,"heatedVolumeM3":specs.get("volumeM3"),
        "hopperCapacity":specs.get("hopperKg"),"weight":specs.get("weightKg"),
        "smokeOutletMm":specs.get("smokeMm"),"waterL":specs.get("waterL"),
        "priceHT":base_ht,"priceTTC":ttc(base_ht),
        "variants":p["variants"],
    })

products.sort(key=lambda x:(x["category"],x["base"]))
out={"_meta":{"source":"CATALISTINO 2026 Girolami (valid 01/05/2026)",
    "rule":"Aucune invention. Donnee absente = null.",
    "priceConvention":"PREZZO catalogue = HT. priceTTC = round(HT*1.21).",
    "specsSource":"Fiches techniques p163-171 (volume/reservoir/poids/rendement)",
    "scope":"Tout sauf chaudieres (CALDAIE exclues). Coeur pellet."},
    "count":len(products),"variantCount":sum(len(p["variants"]) for p in products),
    "products":products}
json.dump(out,open("01-extraction-girolami.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
print(f"Produits: {len(products)}  Variantes: {out['variantCount']}")
# resume
from collections import Counter
byfam=Counter(p["family"] for p in products)
for f,n in sorted(byfam.items()): print(f"  {f:<22} {n} produit(s)")
print("\nSpec manquante (volume None):",[p["slug"] for p in products if p["heatedVolumeM3"] is None])
