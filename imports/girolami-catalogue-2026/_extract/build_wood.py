# -*- coding: utf-8 -*-
"""
Lot BOIS Girolami (relevé manuel FIDÈLE depuis le PDF, pages produits + fiches
techniques). Une fiche par modèle catalogue, prix = config de base HT, options
(ventilé, gauche/droite, serpentine eau chaude, keraltek/ghisa) décrites dans le
texte plutôt que multipliées en SKU. Aucune invention : spec absente = null.
Sortie : 01b-extraction-girolami-bois.json (même schéma que le coeur pellet).
"""
import json
TVA=1.21
def ttc(ht): return round(ht*TVA) if ht else None
def slug(s):
    import re
    s=s.lower().replace("é","e")
    return re.sub(r"^-+|-+$","",re.sub(r"[^a-z0-9]+","-",s))

# (family, name, base_code, priceHT, power, powerMax, eff, productType, isHydro,
#  combustible, isInsert, vol, weight, water)
W=[
 ("TC EVO","TC EVO Plus 80","31057",4580,27,27.2,86.2,"hydro",True,"wood",False,675,None,None),
 ("TC EVO","TC EVO 75","31005",2880,27,27.5,88.0,"hydro",True,"wood",False,675,None,None),
 ("TC EVO","TC EVO 75 DX/SX","3009",3500,27,27.5,88.0,"hydro",True,"wood",False,675,None,None),
 ("TC EVO","TC EVO 75 Curvo","31021",4000,27,27.5,88.0,"hydro",True,"wood",False,675,None,None),
 ("TC Bio Evo","TC Bio Evo 80","31057-KLP",6900,30,29.7,89.6,"hybride",True,"hybrid",False,730,390,105),
 ("Frame","Frame 80","3062",3760,11,10.7,85.1,"insert",False,"wood",True,356,300,None),
 ("Frame","Frame 80 DX/SX","3062DX",4430,11,10.7,85.1,"insert",False,"wood",True,356,300,None),
 ("Frame","Frame 100","3063",4170,13,12.5,85.2,"insert",False,"wood",True,416,320,None),
 ("Frame","Frame 100 DX/SX","3063DX",4840,13,12.5,85.2,"insert",False,"wood",True,416,320,None),
 ("Frame","Frame 120","3064",5000,14,14.3,85.1,"insert",False,"wood",True,476,380,None),
 ("Frame","Frame 120 DX/SX","3064DX",5770,14,14.3,85.1,"insert",False,"wood",True,476,380,None),
 ("Alfa","Alfa","3014N",3700,11,10.7,85.1,"insert",False,"wood",True,None,None,None),
 ("Alfa","Alfa Double","3019N",4640,11,10.7,85.1,"insert",False,"wood",True,None,None,None),
 ("MBS","MBS F 80","3065",2270,11,10.7,85.1,"insert",False,"wood",True,None,None,None),
 ("MBS","MBS F 100","3067",2780,13,12.5,85.2,"insert",False,"wood",True,None,None,None),
 ("MBS","MBS F 120","3069",2880,14,14.3,85.1,"insert",False,"wood",True,None,None,None),
 ("Vision Evo","Vision Evo 60","3073",2000,11,10.7,85.1,"insert",False,"wood",True,None,None,None),
 ("Vision Evo","Vision Evo 70","3071",2200,11,10.7,85.1,"insert",False,"wood",True,None,None,None),
 ("Vision Evo","Vision Evo 80","3072",2370,11,10.7,85.1,"insert",False,"wood",True,None,None,None),
 ("Vision Evo","Vision Evo 90","3074",2470,13,12.5,85.2,"insert",False,"wood",True,None,None,None),
 ("Vision Evo","Vision Evo 100","3075",2630,13,12.5,85.2,"insert",False,"wood",True,None,None,None),
]
prods=[]
for fam,name,code,ht,pwr,pmax,eff,ptype,hydro,comb,ins,vol,wt,water in W:
    prods.append({
        "base":code,"slug":"girolami-"+slug(name),"sku":("GIR-"+code).replace("/","-"),
        "name":"Girolami "+name,"family":fam,"model":name,"powerClass":pwr,"power":pwr,
        "productType":ptype,"category":"WOOD","combustible":comb,
        "isCanalizable":False,"isCoassiale":False,"isHydro":hydro,
        "isAirtight":False,"isInsert":ins,
        "powerMaxKW":pmax,"powerNomKW":None,"efficiency":eff,"heatedVolumeM3":vol,
        "hopperCapacity":None,"weight":wt,"smokeOutletMm":None,"waterL":water,
        "priceHT":ht,"priceTTC":ttc(ht),
        "variants":[],  # bois : pas de variante couleur (finitions decrites en texte)
    })
out={"_meta":{"source":"CATALISTINO 2026 Girolami — lot BOIS","rule":"Relevé manuel fidèle, prix config de base HT.",
    "note":"Options (ventilé, DX/SX, serpentine, keraltek/ghisa) décrites en texte, non multipliées en SKU."},
    "count":len(prods),"variantCount":0,"products":prods}
json.dump(out,open("01b-extraction-girolami-bois.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
print("Lot bois:",len(prods),"fiches")
for p in prods: print(f"  {p['slug']:<30} {p['power']}kW  {p['priceTTC']} TTC  [{p['productType']}/{p['combustible']}]")
