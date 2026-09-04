# -*- coding: utf-8 -*-
"""
Parse les pages-tables Girolami en produits structures.
Regroupe les lignes couleur par CODE DE BASE (ex 8050, 7008-P), puis associe
modele / puissance / rendement / prix par proximite verticale (coordonnees).

Regle d'or : aucune invention. Prix introuvable = null. Spec absente = null.
Sortie : _extract/products_parsed.json  +  _extract/products_summary.txt
"""
import fitz, json, re

PDF = r"C:\Users\Awles\Downloads\Catalistino_2026_Girolami_IT_EN_FR_ES.pdf"

PAGES = {
    "AIR_STOVES":   [24,26,28,30,32,34,36,38,40,42,44,46,48],
    "PELLET_INSERTS":[58,60,62],
    "HYDRO_STOVES": [66,68,70,72,74,76],
    "HYDRO_INSERTS":[86,88,90,92,94,96],
}

FAMILY_KEYWORDS = ["TWIN SLIM MATERIA","TWIN SLIM","TWIN MINI","ROUND","SLIM",
    "CURVY","FLOW","MINI","VERT MAIOLICA","VERT","SPLIT","GRID VERTICALE",
    "GRID PANORAMA","ALFA","SOFT MAIOLICA","SOFT SLIM","SOFT","SHARP","EDGE",
    "FURNI","TI SLIM PANORAMA","TI SLIM","TI PANORAMA","TI"]

CONFIG_TOKENS = ["CANALIZZATA","DUCTED","COASSIALE","COAXIAL","CANALIZZAZIONE",
    "DUCTING","CONVEZIONE","VENTILATO"]

CODE_RE = re.compile(r'^\d{3,4}[A-Z]?(?:-P)?(?:[/-][A-Z0-9]+)?$')
PRICE_RE = re.compile(r'^\d{1,3}[.,]\d{3}[.,]\d{2}$')
KW_RE = re.compile(r'(\d{1,2}[.,]\d{1,2})\s*KW', re.I)
PCT_RE = re.compile(r'(\d{2}[.,]\d{1,2})\s*%')
NUM_RE = re.compile(r'\d{1,3}[.,]\d{1,2}')

# Couleur derivee du suffixe de code (fiable) ; fallback si OCR couleur vide.
SUFFIX_COLOR = {"GR":"Gris anthracite","NE":"Noir","BO":"Bordeaux","DB":"Bronze",
    "VE":"Vert","AV":"Ivoire","BNNE":"Blanc","BONE":"Bordeaux",
    "SC":"Corten","SA":"Ivoire","SG":"Gris anthracite"}
# Normalisation IT/EN -> FR depuis la colonne COLORE.
def norm_color(raw):
    if not raw: return None
    u=raw.upper()
    if "BIANCO" in u or "WHITE" in u: return "Blanc"
    if "NERO" in u or "BLACK" in u: return "Noir"
    if "BORDEAUX" in u: return "Bordeaux"
    if "GRIGIO" in u or "GREY" in u or "GRIS" in u: return "Gris anthracite"
    if "DARK" in u or "BRONZ" in u: return "Bronze"
    if "VERDE" in u or "GREEN" in u: return "Vert"
    if "AVOR" in u or "IVORY" in u: return "Ivoire"
    if "CORTEN" in u: return "Corten"
    return None
def color_from_code(code):
    c=code.strip()
    if '/' in c:
        suf=c.rsplit('/',1)[1]
        return SUFFIX_COLOR.get(suf)
    m=re.match(r'^.*-(S[ACG])$',c)
    if m: return SUFFIX_COLOR.get(m.group(1))
    return None  # code de base : couleur via OCR (souvent Blanc/Noir)

def ytol_rows(words, tol=3.0):
    rows=[]
    for w in sorted(words,key=lambda w:(w[1],w[0])):
        for r in rows:
            if abs(r["y"]-w[1])<=tol:
                r["words"].append(w); break
        else:
            rows.append({"y":w[1],"words":[w]})
    for r in rows: r["words"].sort(key=lambda w:w[0])
    rows.sort(key=lambda r:r["y"])
    return rows

def header(rows):
    for r in rows:
        t=" ".join(w[4] for w in r["words"]).upper()
        if "MODELLO" in t and "PREZZO" in t:
            a={}
            for w in r["words"]:
                u=w[4].upper()
                if u=="MODELLO":a["model"]=w[0]
                elif u=="DATI":a["tech"]=w[0]
                elif u=="COLORE":a["color"]=w[0]
                elif u=="CODICE":a["code"]=w[0]
                elif u=="PREZZO":a["price"]=w[0]
            return r["y"],a
    return None,None

def colbands(a):
    # x bands [start,end) using midpoints between known anchors, in order
    keys=[k for k in ["model","tech","color","code","price"] if k in a]
    xs=[a[k] for k in keys]
    bands={}
    for i,k in enumerate(keys):
        lo = 0 if i==0 else (xs[i-1]+xs[i])/2
        hi = 9999 if i==len(keys)-1 else (xs[i]+xs[i+1])/2
        bands[k]=(lo,hi)
    return bands

def cell(word_x, bands):
    for k,(lo,hi) in bands.items():
        if lo<=word_x<hi: return k
    return None

def base_of(code):
    c=code.strip()
    if '/' in c: c=c.rsplit('/',1)[0]
    m=re.match(r'^(.*?)-S[ACG]$',c)
    if m: c=m.group(1)
    return c

def parse_page(doc,pno):
    pg=doc[pno]; words=pg.get_text("words")
    rows=ytol_rows(words)
    hy,a=header(rows)
    if a is None or "code" not in a: return None
    bands=colbands(a)
    # collect typed tokens with y
    codes=[]; prices=[]; models=[]; techs=[]; colors=[]; configs=[]
    for r in rows:
        if r["y"]<=hy+1: continue
        line=" ".join(w[4] for w in r["words"]).upper()
        if line.startswith("ACCESSORI") or "ECO DESIGN" in line: break
        if "MODELLO" in line and "PREZZO" in line: continue  # second header
        # combustible marker line
        for w in r["words"]:
            c=cell(w[0],bands); txt=w[4]
            y=w[1]
            if c=="code" and CODE_RE.match(txt):
                codes.append((y,txt))
            elif c=="price" and PRICE_RE.match(txt):
                prices.append((y,txt))
            elif c=="color" and txt.strip():
                colors.append((y,txt))
        # model column text per row (joined)
        mwords=[w[4] for w in r["words"] if cell(w[0],bands)=="model"]
        twords=[w[4] for w in r["words"] if cell(w[0],bands)=="tech"]
        mtxt=" ".join(mwords).strip(); ttxt=" ".join(twords).strip()
        if mtxt:
            up=mtxt.upper()
            if any(k in up for k in CONFIG_TOKENS):
                configs.append((r["y"],up))
            fam=next((k for k in FAMILY_KEYWORDS if up.startswith(k) or (" "+k+" ") in (" "+up+" ")),None)
            if fam and re.search(r'\d',up):
                models.append((r["y"],mtxt))
        if ttxt:
            techs.append((r["y"],ttxt))
    # group codes by base
    groups={}
    for y,code in codes:
        b=base_of(code)
        groups.setdefault(b,{"base":b,"codes":[],"ys":[]})
        groups[b]["codes"].append(code); groups[b]["ys"].append(y)
    out=[]
    for b,g in groups.items():
        ymin=min(g["ys"]); ymax=max(g["ys"]); W=6
        # model : tous les mots colonne MODELLO dans la fenetre du groupe
        mtxts=[t for (yy,t) in models if ymin-W<=yy<=ymax+W]
        model=None
        for t in mtxts:  # priorite : famille + chiffre
            up=t.upper()
            if any(k in up for k in FAMILY_KEYWORDS) and re.search(r'\d',up):
                model=t; break
        if model is None:  # famille sans chiffre dans la fenetre
            for t in mtxts:
                if any(k in t.upper() for k in FAMILY_KEYWORDS): model=t; break
        if model is None and models:  # label primaire le plus proche (toute la page)
            gy=(ymin+ymax)/2
            model=min(models,key=lambda m:abs(m[0]-gy))[1]
        if model is None and mtxts: model=mtxts[0]
        powerClass=None
        if model:
            mm=re.search(r'(\d{1,2})',model)
            if mm: powerClass=int(mm.group(1))
        cfg=[c[1] for c in configs if ymin-W<=c[0]<=ymax+W]
        # tech : concatener toutes les lignes tech de la fenetre
        tech=" ".join(t for (yy,t) in techs if ymin-W<=yy<=ymax+W)
        kws=[float(x.replace(',','.')) for x in KW_RE.findall(tech)]
        pcts=[float(x.replace(',','.')) for x in PCT_RE.findall(tech)]
        eff=None
        if pcts: eff=pcts[0]
        else:
            for nstr in NUM_RE.findall(tech):
                v=float(nstr.replace(',','.'))
                if 80<=v<100 and v not in kws: eff=v; break
        POWERMAX_CLASS={6.02:6,8.65:9,11.26:12,13.65:14,15.02:14,18.1:18,22.07:22,24.06:26}
        if powerClass is None and kws:
            powerClass=POWERMAX_CLASS.get(round(kws[0],2))
        # prix : le plus proche d'un code du groupe (<=14 px)
        price=None
        if prices:
            best=min(prices,key=lambda p:min(abs(p[0]-yy) for yy in g["ys"]))
            if min(abs(best[0]-yy) for yy in g["ys"])<=14:
                digits=re.sub(r'\D','',best[1]); price=int(digits)/100 if digits else None
        # couleurs : OCR (colonne) normalise, fallback suffixe code
        cols=[]
        for y,code in zip(g["ys"],g["codes"]):
            cc=[c[1] for c in colors if abs(c[0]-y)<=2.5 and not re.match(r'^[\d.,%]+$',c[1])]
            cname=norm_color(" ".join(cc)) or color_from_code(code)
            cols.append({"code":code,"color":cname})
        # combustible
        up=(model or "").upper()
        if b.endswith("-P") or "PELLET" in up: comb="pellet"
        elif "HYBRID" in up: comb="hybrid"
        else: comb=None
        cfgflat=" ".join(cfg).upper()+" "+up
        out.append({
            "page":pno,"base":b,"model":model,"powerClass":powerClass,
            # CANALIZZ (italien) = vraie canalisation. "DUCTED"/"VENTILATO" seuls
            # = ventilé (cas ALFA/FRAME bois), PAS canalisable.
            "isCanalizzata":("CANALIZZ" in cfgflat),
            "isCoassiale":("COASSIAL" in cfgflat or "COAXIAL" in cfgflat),
            "combustible":comb,
            "powerMax":kws[0] if len(kws)>=1 else None,
            "powerNom":kws[1] if len(kws)>=2 else None,
            "efficiency":eff,"priceHT":price,"colors":cols,
        })
    out.sort(key=lambda o:min(g for g in [0]) if False else o["base"])
    return out

def main():
    doc=fitz.open(PDF)
    result={}
    summ=[]
    total=0
    for cat,pages in PAGES.items():
        result[cat]=[]
        summ.append(f"\n{'='*80}\n{cat}\n{'='*80}")
        for pno in pages:
            recs=parse_page(doc,pno)
            if recs is None:
                summ.append(f"  p{pno}: NO HEADER / skipped"); continue
            for r in recs:
                result[cat].append(r); total+=1
                cols=", ".join(f"{c['color']}={c['code']}" for c in r["colors"])
                flags=[]
                if r["isCanalizzata"]: flags.append("CANAL")
                if r["isCoassiale"]: flags.append("COAX")
                if r["combustible"]: flags.append(r["combustible"].upper())
                summ.append(f"  p{r['page']} base={r['base']:<10} '{r['model']}' "
                    f"PWR={r['powerMax']}/{r['powerNom']} EFF={r['efficiency']} "
                    f"HT={r['priceHT']} [{','.join(flags)}]")
                summ.append(f"        colors[{len(r['colors'])}]: {cols}")
    with open("_extract/products_parsed.json","w",encoding="utf-8") as f:
        json.dump(result,f,ensure_ascii=False,indent=1)
    with open("_extract/products_summary.txt","w",encoding="utf-8") as f:
        f.write("\n".join(summ))
    print("Produits (base-codes) extraits:",total)
    print("Ecrit _extract/products_parsed.json + products_summary.txt")

if __name__=="__main__": main()
