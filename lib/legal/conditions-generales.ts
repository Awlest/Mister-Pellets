import { COMPANY, CONSUMER_MEDIATION, DATA_AUTHORITY } from "./company";
import type { LegalBlock, LegalSite } from "./types";

/**
 * Conditions générales de vente et d'installation d'AWLEST SRL.
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (voir types.ts). Le texte
 * contractuel est le même partout ; seuls le chapeau et les coordonnées de
 * contact viennent de `site.ts`.
 *
 * Base : les conditions publiées sur awlest.com (relevées le 18/09/2026 puis
 * le 25/10/2026), fusionnées le 25/10/2026 avec les clauses propres à Mister
 * Pellets et à Mister Clim (Partie III). Les écarts avec awlest.com sont
 * listés dans la description de la PR qui a introduit ce fichier. Références
 * légales relues sur Justel le 25/10/2026 : Livre 7 du Code civil (loi du
 * 22/07/2026, MB du 23/09/2026) applicable au 01/09/2027 ; CDE VI.83, 17° ;
 * Livre XIX ; VI.91 ; loi du 30/03/1976, art. 57 ; Livre 6, art. 6.3. C'est un
 * document contractuel : toute modification vient de Dorian ou de son
 * conseil, jamais d'une reformulation de confort.
 */
export function conditionsGenerales(site: LegalSite): LegalBlock[] {
  const C = COMPANY;
  const contact = `[${site.email}](mailto:${site.email}) ou [${site.phone}](tel:${site.phoneHref})`;

  return [
    {
      p: `Ces conditions sont celles d'AWLEST SRL. Elles sont identiques sur les sites de ses quatre marques (awlest.com, mister-pellets.be, mister-clim.be et mister-bois.be). Sous la marque ${site.brand}, nous ${site.activity}. Pour toute démarche prévue ci-dessous (rétractation, réclamation, signalement d'un dégât), vous pouvez nous joindre à ${contact}.`,
    },
    {
      p: `${C.name}, ${C.legalForm}, siège social ${C.seat}, BCE et TVA ${C.vat}, ${C.register}. Unité d'établissement, atelier, bureau et showroom : ${C.establishment}. Téléphone ${C.phone}, e-mail ${C.email}, site ${C.website}. Les présentes conditions s'appliquent à toutes les prestations fournies sous ce numéro d'entreprise, quelle que soit la marque utilisée : Awlest, Mister Pellets, Mister Clim ou Mister Bois. Les termes « AWLEST », « l'entreprise » ou « nous » désignent indistinctement AWLEST SRL et ces marques. Chaque marque a ses propres coordonnées, indiquées sur son site et sur le devis ; elles valent, comme celles du siège, pour toutes les démarches prévues aux présentes.`,
    },

    { h2: "Conditions d'application : quelle partie s'applique à vous ?" },
    {
      p: "A. Le présent document comporte trois parties. La Partie I (conditions consommateurs, B2C) s'applique exclusivement au client qui est une personne physique agissant à des fins n'entrant pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole, par exemple pour l'équipement de son habitation privée. La Partie II (conditions professionnels, B2B) s'applique exclusivement au client qui contracte, même partiellement, dans le cadre d'une telle activité, qu'il s'agisse d'une société, d'une association, d'un indépendant, d'une profession libérale, d'un agriculteur ou de toute personne agissant pour un bien affecté à son activité. La Partie III réunit les conditions particulières propres à certaines marques ; elle complète la Partie I ou la Partie II, selon la qualité du client.",
    },
    {
      p: "B. La qualité du client s'apprécie à la date de conclusion du contrat, au regard de l'objet du contrat, de la destination du bien équipé et des mentions du devis (numéro d'entreprise, dénomination, adresse de facturation). Le client indique sa qualité sur le devis. Le client qui se déclare professionnel ou qui communique un numéro d'entreprise à des fins de facturation est réputé relever de la Partie II ; il ne peut se prévaloir ultérieurement de la Partie I que s'il établit qu'il a contracté à des fins étrangères à toute activité professionnelle.",
    },
    {
      p: "C. Les Parties I et II ne se cumulent pas. Lorsque le client relève de la Partie I, aucune clause de la Partie II ne lui est opposable. Lorsque le client relève de la Partie II, la Partie I ne s'applique pas, à l'exception des dispositions que la loi rendrait impératives à son égard. En cas de doute sur la qualité du client, la Partie I s'applique.",
    },
    {
      p: "D. Les renvois à un article, dans chaque partie, visent les articles de cette même partie, sauf mention contraire. Le devis signé et ses avenants prévalent sur l'ensemble ; viennent ensuite les conditions particulières de la marque (Partie III), puis la Partie I ou la Partie II ; les notices et fiches techniques des fabricants complètent le tout. Les présentes conditions sont annexées au devis, remises sur support durable et disponibles sur chacun de nos sites ; le client reconnaît en avoir pris connaissance avant de contracter.",
    },

    { h2: "Partie I. Conditions applicables aux consommateurs (B2C)" },
    { p: "Applicables uniquement au client consommateur, tel que défini au préambule." },
    {
      p: "Les présentes conditions respectent le Livre VI et le Livre XIX du Code de droit économique. Elles ne portent atteinte à aucun de vos droits légaux impératifs (garanties légales, droit de rétractation, encadrement des frais de retard, choix du tribunal). Toute clause qui serait contraire à une disposition impérative est réputée réduite à ce que la loi permet, sans affecter le reste du contrat.",
    },

    { h3: "1. Champ d'application et définitions" },
    {
      p: "1.1. Les présentes conditions s'appliquent à toute offre, vente, fourniture, installation, entretien et dépannage réalisés par l'entreprise pour un consommateur, notamment : systèmes photovoltaïques, onduleurs, batteries de stockage et bornes de recharge ; pompes à chaleur air/eau et air/air, climatisation, ventilation simple et double flux, boilers thermodynamiques ; poêles à pellets, à bois et hybrides, poêles hydro, inserts et foyers, cuisinières à bois, cheminées, tubage et ramonage ; rénovation énergétique et prestations connexes.",
    },
    {
      p: "1.2. Est consommateur toute personne physique qui agit à des fins n'entrant pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole. Le client qui agit, même partiellement, à des fins professionnelles relève de la Partie II.",
    },
    {
      p: "1.3. Le client reconnaît avoir reçu, lu et accepté les présentes conditions avant la conclusion du contrat. Elles sont annexées au devis et disponibles sur chacun de nos sites. En cas de contradiction, le devis signé prévaut, puis les conditions particulières de la marque (Partie III), puis les présentes conditions, puis les notices et fiches techniques des fabricants.",
    },

    { h3: "2. Devis, information précontractuelle et formation du contrat" },
    {
      p: "2.1. Avant la conclusion du contrat, nous vous communiquons les caractéristiques essentielles des biens et services, le prix total toutes taxes comprises, les modalités de paiement et d'exécution, l'existence et les conditions du droit de rétractation, les garanties et nos coordonnées. Ces informations font partie du contrat.",
    },
    {
      p: "2.2. Sauf mention contraire, nos devis sont valables 30 jours calendaires. Le contrat est formé par la signature du devis ou par tout accord écrit équivalent (e-mail, signature électronique). Toute modification requiert un accord écrit des deux parties. Les prix reposent sur les informations, photos, plans et mesures que vous nous communiquez ; une visite technique peut être organisée pour les confirmer.",
    },
    {
      p: "2.3. Lorsque l'étude, la visite technique ou l'ouverture des lieux révèle une contrainte non décelable au moment du devis (structure ou toiture insuffisante, installation électrique non conforme, absence de tirage, conduit impropre, présence d'amiante, réseaux non signalés, accès difficile), nous vous adressons un devis complémentaire. Vous restez libre de l'accepter ou de le refuser. À défaut d'accord, la partie de la prestation devenue impossible est résolue sans indemnité de part et d'autre, les prestations et frais déjà engagés restant dus à leur juste valeur.",
    },
    {
      p: "2.4. Sauf mention expresse au devis, ne sont pas compris : les mises en conformité électriques (RGIE), structurelles, hydrauliques ou de fumisterie ; les travaux de finition (plâtrage, peinture, carrelage) ; le déplacement d'obstacles non signalés ; les frais de nacelle, d'échafaudage ou de grue non prévus ; les frais du gestionnaire de réseau (raccordement, compteur) ; les démarches d'urbanisme, de copropriété ou de bailleur ; l'évacuation d'anciens appareils non prévue au devis.",
    },
    {
      p: "2.5. Les estimations de production, de rendement, d'économies, de temps de retour, de primes ou d'avantages fiscaux sont fournies à titre indicatif, sur la base d'hypothèses standard (ensoleillement, orientation, consommation, tarifs). Elles ne constituent pas un engagement. L'octroi et le montant des primes, certificats verts, tarifs de rachat et avantages fiscaux dépendent exclusivement des autorités et de votre situation ; nous ne pouvons en garantir ni l'obtention ni le maintien.",
    },
    {
      p: "2.6. Vous garantissez être propriétaire du bien ou disposer de l'accord écrit du propriétaire ou de la copropriété, et détenir les autorisations requises. Les conséquences d'un défaut d'autorisation (démontage, remise en état, amendes) sont à votre charge.",
    },
    {
      p: "2.7. Les prix, fourchettes et estimations affichés sur nos sites ou calculés par nos outils en ligne (configurateurs, estimations, prix « à partir de ») sont indicatifs. Ils ne constituent pas une offre : seul le devis engage l'entreprise. La réservation d'un rendez-vous en ligne ne forme aucun contrat de vente ou d'entreprise.",
    },

    { h3: "3. Droit de rétractation" },
    {
      p: "3.1. Pour tout contrat conclu à distance ou hors établissement (par exemple signé à votre domicile à l'issue de la visite technique, ou conclu par échange d'e-mails), vous disposez de 14 jours calendaires pour vous rétracter sans motif ni pénalité. Le délai court à compter de la conclusion du contrat pour les services, et de la réception du bien pour les ventes, y compris lorsque la vente comprend la pose. Pour exercer ce droit, adressez-nous avant l'expiration du délai une déclaration dénuée d'ambiguïté, par courrier à notre siège ou par e-mail à l'adresse de la marque avec laquelle vous avez contracté. Le formulaire type figurant à la fin de la Partie I peut être utilisé mais n'est pas obligatoire.",
    },
    {
      p: "3.2. En cas de rétractation, nous remboursons tous les paiements reçus, y compris les frais de livraison standard, au plus tard 14 jours après en avoir été informés, par le même moyen de paiement, sauf accord contraire et sans frais pour vous. Pour une vente, nous pouvons différer le remboursement jusqu'à la récupération du bien ou jusqu'à ce que vous ayez fourni une preuve de son expédition, la date retenue étant celle du premier de ces faits.",
    },
    {
      p: "3.3. Si vous demandez expressément, sur support durable, que les prestations commencent avant la fin du délai, vous restez tenu de payer un montant proportionnel aux prestations déjà fournies au moment de la rétractation, matériel livré ou posé compris. Le droit de rétractation ne s'applique pas aux biens confectionnés selon vos spécifications ou nettement personnalisés, ni aux prestations pleinement exécutées avec votre accord préalable exprès et votre reconnaissance de la perte du droit de rétractation, ni aux travaux d'entretien ou de réparation urgents que vous avez expressément sollicités.",
    },
    {
      p: "3.4. Si des biens vous ont été livrés, vous nous les renvoyez ou nous les remettez sans retard excessif et au plus tard 14 jours après nous avoir communiqué votre rétractation. Les frais directs de renvoi sont à votre charge. Lorsqu'un bien ne peut normalement pas être renvoyé par la poste en raison de sa nature (poêle, unité extérieure, batterie, par exemple), le devis indique le coût de sa reprise ; à défaut de cette indication, la reprise est à nos frais. Votre responsabilité n'est engagée qu'à l'égard de la dépréciation du bien résultant de manipulations autres que celles nécessaires pour établir sa nature, ses caractéristiques et son bon fonctionnement.",
    },

    { h3: "4. Prix, acomptes et paiements intermédiaires" },
    {
      p: "4.1. Les prix sont exprimés en euros, toutes taxes comprises. Le taux de TVA applicable dépend de votre situation (âge et usage du logement, nature des travaux), que vous certifiez. Nos factures portent la mention légale relative au taux réduit ; toute rectification imposée par l'administration à la suite d'une déclaration inexacte de votre part est à votre charge.",
    },
    {
      p: "4.2. Sauf convention particulière, le paiement s'effectue par acomptes suivant l'avancement. L'entreprise fixe le montant et le moment des acomptes et factures intermédiaires en fonction des commandes de matériel, des livraisons et de l'avancement réel, étant entendu que le total appelé avant la mise en service ne dépasse pas la valeur du matériel approvisionné ou livré et des prestations réalisées à la date de chaque facture. À titre indicatif : un acompte à la commande destiné à l'approvisionnement du matériel et à la réservation du chantier, une ou plusieurs factures intermédiaires à la livraison du matériel et aux étapes clés, le solde à la mise en service. Le détail figure au devis et dans les conditions particulières de la marque, et peut être adapté par l'entreprise dans ces limites selon le déroulement réel du chantier.",
    },
    {
      p: "4.3. Les factures sont payables à leur échéance, et à défaut d'échéance dans les 8 jours calendaires de leur réception. Si une facture vous paraît erronée, signalez-le-nous par écrit dès que possible, de préférence dans les 14 jours calendaires de sa réception : nous la vérifions et, le cas échéant, la rectifions. La partie non contestée reste payable à l'échéance.",
    },

    { h3: "5. Retard de paiement" },
    {
      p: "5.1. En cas de non-paiement à l'échéance, nous vous adressons un premier rappel gratuit. Aucun intérêt ni indemnité n'est dû avant l'expiration d'un délai de 14 jours calendaires prenant cours le troisième jour ouvrable suivant l'envoi du rappel, ou le lendemain de son envoi s'il est électronique. Tout rappel ultérieur peut être facturé 7,50 € majorés des frais d'envoi postaux.",
    },
    {
      p: "5.2. Passé ce délai, sont dus de plein droit, conformément au Livre XIX du Code de droit économique : des intérêts de retard au taux d'intérêt de référence de la loi du 2 août 2002 majoré de huit points, calculés sur le solde impayé ; et une indemnité forfaitaire couvrant les frais de recouvrement amiable, plafonnée à 20 € si le solde dû est inférieur ou égal à 150 €, à 30 € majorés de 10 % du montant dû sur la tranche comprise entre 150,01 € et 500 €, et à 65 € majorés de 5 % du montant dû sur la tranche supérieure à 500 €, avec un maximum de 2 000 €. Ces montants correspondent aux plafonds légaux ; aucune autre somme ne peut vous être réclamée au titre du recouvrement amiable.",
    },
    {
      p: "5.3. En cas de retard de paiement, l'entreprise peut suspendre les prestations en cours, les interventions d'entretien et de dépannage, ainsi que l'exécution des garanties commerciales, jusqu'au complet paiement. Les garanties légales ne sont pas affectées. Le contrat de crédit éventuel est régi par ses propres conditions.",
    },

    { h3: "6. Vos obligations, accès, zone de travail et présence" },
    {
      p: "6.1. Vous vous engagez à : assurer un accès libre, sûr et continu aux lieux d'intervention (intérieur, extérieur, toiture, local technique, tableau électrique) ; mettre à disposition l'eau et l'électricité nécessaires ; nous signaler par écrit, avant l'intervention, toute particularité connue (réseaux encastrés, amiante, état de la toiture ou des conduits, animaux, alarme, stationnement, servitudes) ; dégager et rendre accessible la zone de travail (mobilier, objets, véhicules, végétation) avant l'arrivée des techniciens et prévoir un espace de stockage temporaire ; informer vos voisins des nuisances raisonnables liées aux travaux.",
    },
    {
      p: "6.2. Une présence est requise au début et à la fin de chaque intervention : vous-même ou une personne majeure que vous mandatez accueille les techniciens, confirme l'emplacement des équipements, valide le plan d'action et signe la fiche d'intervention. Le mandataire vous engage pour ces validations.",
    },
    {
      p: "6.3. Vous êtes responsable de l'état préexistant du bâtiment, de la toiture, des supports, des conduits et des installations existantes. Sauf information écrite contraire de votre part, l'installation électrique est présumée conforme et mise à la terre, la toiture et la structure présumées aptes à recevoir les équipements, les réseaux encastrés présumés localisés et l'absence d'amiante présumée. Ces présomptions sont simples : vous conservez la possibilité de les renverser par toute preuve. Les percements et saignées sont exécutés sur la base de vos informations ; le percement dans des matériaux non signalés (béton armé, pierre, composite) est facturé en supplément, sur devis.",
    },
    {
      p: "6.4. Si, à l'arrivée des techniciens, personne n'est présent pour les accueillir et valider la faisabilité, ou si la zone n'est pas préparée, l'intervention est reportée. Les frais réellement engagés sont facturés, à titre indicatif 75 € pour un déplacement sans intervention possible et 60 € par heure entamée et par personne présente sur chantier pour l'attente ou la manutention supplémentaire (soit 120 € par heure pour deux techniciens), sur justification. Le report est fixé en fonction de nos disponibilités, sans que nous puissions être tenus à une date déterminée.",
    },

    { h3: "7. Sous-traitance" },
    {
      p: "7.1. Vous acceptez que l'entreprise confie tout ou partie des prestations à un ou plusieurs sous-traitants qualifiés de son choix, ou remplace un sous-traitant par un autre, sans avoir à vous en informer préalablement. L'entreprise conserve la direction technique et la responsabilité de l'ensemble à votre égard et demeure votre interlocuteur unique. Vous accordez aux sous-traitants le même accès et la même coopération qu'à l'entreprise.",
    },
    {
      p: "7.2. Vos réclamations et l'exercice des garanties s'effectuent auprès de l'entreprise, qui coordonne les interventions. Cette centralisation ne porte pas atteinte aux droits que la loi vous réserve, en ce compris la possibilité, prévue par le Livre 6 du Code civil, d'agir en responsabilité extracontractuelle contre un sous-traitant, lequel peut vous opposer les moyens de défense issus du présent contrat. Vous vous abstenez de confier directement aux sous-traitants de l'entreprise des travaux relatifs à l'installation pendant la durée des garanties, sous peine de perte des garanties commerciales de l'entreprise sur les éléments concernés.",
    },

    { h3: "8. Annulation, report et modification à votre initiative" },
    {
      p: "8.1. Si vous mettez fin au contrat avant le début des travaux, sans faute de l'entreprise et hors droit de rétractation, une indemnité de dédit est due pour couvrir les frais engagés et le manque à gagner. Elle est fixée à 15 % du prix total TTC du contrat. Le matériel déjà commandé spécifiquement pour votre chantier ou confectionné sur mesure vous reste acquis et vous est facturé en sus, à son prix. Selon les circonstances de votre dossier (annulation très précoce, matériel réaffectable, frais réellement évités), cette indemnité peut être réduite ; nous l'apprécions au cas par cas et de bonne foi.",
    },
    {
      p: "8.2. Réciproquement, conformément à l'article VI.83, 17° du Code de droit économique, si l'entreprise renonce elle-même à exécuter le contrat sans motif légitime avant tout commencement d'exécution, elle vous verse une indemnité d'un montant équivalent, calculée sur la même base.",
    },
    {
      p: "8.3. Toute demande de report, de changement de date ou de modification de la commande doit nous parvenir par écrit au moins cinq jours ouvrables avant la date convenue ; dans ce cas, le report est gratuit. Passé ce délai, un forfait d'adaptation d'agenda de 75 € TTC par rendez-vous reporté peut vous être facturé, correspondant au coût du créneau perdu et de la replanification des équipes. Si le report nous est notifié moins de 24 heures avant l'intervention, ou si nos techniciens se présentent sans avoir été prévenus, l'article 6.4 s'applique en lieu et place de ce forfait. Le matériel déjà commandé ou livré fait, le cas échéant, l'objet de frais de stockage sur justification. Réciproquement, si l'entreprise reporte de sa propre initiative un rendez-vous convenu moins de cinq jours ouvrables à l'avance, sans motif extérieur (intempéries, retard de livraison, gestionnaire de réseau, force majeure, maladie), une indemnité du même montant vous est due. Un report décale l'intervention selon nos disponibilités sans engager notre responsabilité. Après deux reports ou annulations de rendez-vous de votre fait, l'entreprise peut mettre fin au contrat et appliquer l'article 8.1.",
    },

    { h3: "9. Délais d'exécution" },
    {
      p: "9.1. Les délais sont donnés à titre indicatif et de bonne foi. Nous mettons tout en œuvre pour les respecter et vous informons de tout retard significatif pour convenir d'un nouveau planning. Les retards dus à des causes extérieures (intempéries rendant les travaux impossibles ou dangereux, ruptures ou retards d'approvisionnement, défaillance d'un fournisseur, délais du gestionnaire de réseau, de l'organisme de contrôle ou des administrations, force majeure) suspendent les délais sans donner lieu à indemnité. Un délai ferme n'est contractuel que s'il est expressément qualifié de tel au devis.",
    },

    { h3: "10. Fin d'intervention, photographies et signalement dans les 24 heures" },
    {
      p: "10.1. À la fin de chaque intervention, les techniciens photographient l'installation et les lieux et vous invitent à vérifier avec eux l'état des lieux, du mobilier, du matériel et de l'installation, puis à signer la fiche d'intervention. Ces photographies horodatées et la fiche signée font foi de l'état des lieux et de l'installation à la fin de l'intervention, sauf preuve contraire.",
    },
    {
      p: "10.2. Tout dégât apparent au bâtiment, au mobilier, aux abords ou au matériel installé, ainsi que tout défaut visible de la pose ou de l'installation, doit être signalé à l'entreprise dans les 24 heures suivant la fin de l'intervention, avec photographies, de préférence par e-mail à l'adresse de la marque avec laquelle vous avez contracté, qui constitue le canal de référence pour la traçabilité et le traitement rapide ; tout autre écrit daté est admis. Ce délai est justifié par le fait qu'au-delà, il devient impossible de distinguer un dégât lié à l'intervention d'un dégât survenu ensuite, les lieux restant sous votre seule garde.",
    },
    {
      p: "10.3. À défaut de signalement dans ce délai, les lieux et l'installation sont présumés avoir été laissés sans dégât apparent ni défaut visible et acceptés en l'état sur ces points. Vous conservez la faculté de prouver que le dommage est imputable à l'intervention, mais la charge de cette preuve vous incombe alors intégralement, et l'entreprise n'est pas tenue de prendre en charge les frais de constat, d'expertise ou de recherche engagés unilatéralement. Ce délai ne concerne ni les défauts cachés, ni les défauts de fonctionnement qui se révèlent à l'usage, ni la garantie légale de conformité, ni la garantie des vices cachés, qui restent régis par la loi et par l'article 12. Les traces d'usage normales d'un chantier (poussière, légères marques nettoyables) ne constituent pas des dégâts.",
    },

    { h3: "11. Réception et réserves" },
    {
      p: "11.1. À l'achèvement des travaux, une réception a lieu en votre présence. Vous disposez d'un délai raisonnable pour examiner l'installation et consigner vos réserves dans le procès-verbal ou la fiche d'intervention. La mise en service, l'utilisation de l'installation, le raccordement au réseau ou la signature de la fiche sans réserve valent réception des éléments concernés, sans préjudice de vos garanties légales.",
    },
    {
      p: "11.2. Les réserves fondées, portant sur une non-conformité aux spécifications contractuelles, sont levées dans un délai raisonnable et sans frais, aux heures ouvrables et sous réserve d'accès. Les demandes qui excèdent le contrat (améliorations, adaptations, esthétique non prévue au devis, performances non contractuellement garanties) font l'objet d'un devis distinct.",
    },

    { h3: "12. Garanties" },
    {
      p: "12.1. Garanties légales. Vous bénéficiez de la garantie légale de conformité de deux ans (articles 1649bis et suivants de l'ancien Code civil et, pour les contrats conclus à partir du 1er septembre 2027, articles 7.2.38 et suivants du Code civil), qui couvre également les défauts résultant d'une installation incorrecte lorsque l'installation fait partie du contrat, ainsi que de la garantie des vices cachés. Tout défaut de conformité apparaissant dans les deux ans de la livraison est présumé exister au moment de celle-ci, sauf preuve contraire. Pour bénéficier de la garantie légale de conformité, vous nous informez du défaut dans les deux mois de sa constatation ; aucun mode de notification particulier ne vous est imposé. Vous choisissez entre la réparation et le remplacement du bien, sauf si le remède choisi est impossible ou entraîne des coûts disproportionnés ; si vous optez pour la réparation, le délai de garantie est prolongé une fois d'un an. Ces garanties s'appliquent de plein droit, sans condition d'entretien, et ne peuvent être ni exclues ni réduites.",
    },
    {
      p: "12.2. Garantie des fabricants. Les équipements bénéficient en outre de la garantie commerciale du fabricant, selon sa durée, son étendue et ses conditions propres (enregistrement du produit, entretien, usage), qui vous sont remises avec les notices. Nous vous assistons dans sa mise en œuvre. Les prestations non couvertes par le fabricant (diagnostic, dépose, repose, transport, déplacement) après l'expiration de la garantie légale sont facturées au tarif en vigueur.",
    },
    {
      p: "12.3. Garantie commerciale d'installation. Au-delà des garanties légales, l'entreprise offre une garantie commerciale sur ses travaux d'installation dont la durée, si elle excède deux ans, est précisée au devis ou dans les conditions particulières de la marque (Partie III). Cette garantie commerciale est subordonnée à un usage normal, au respect des notices, à un entretien conforme aux prescriptions des fabricants et, pour les appareils de combustion et les pompes à chaleur, à un entretien annuel par un professionnel. Elle s'exerce auprès de l'entreprise et n'affecte pas les garanties légales.",
    },
    {
      p: "12.4. Sont exclus des garanties commerciales de l'entreprise, sans préjudice des garanties légales : l'usure normale ; le défaut d'entretien ; l'usage non conforme ; les réglages, modifications ou réparations par vous-même ou un tiers non mandaté par l'entreprise ; les défauts du bâtiment, de la toiture, des conduits et des installations préexistantes ; les dommages dus aux événements climatiques (grêle, tempête, gel, neige), à la foudre, aux surtensions, aux variations et coupures du réseau ; les défaillances des réseaux tiers (électricité, eau, internet) et des services en ligne des fabricants ; les nuisibles ; les pertes de données de monitoring ; les décolorations, salissures et micro-fissures sans incidence fonctionnelle. Toute rupture de scellé ou modification des paramètres réseau de l'onduleur ou des protections par un tiers entraîne la perte des garanties commerciales sur les éléments concernés.",
    },
    {
      p: "12.5. Responsabilité décennale. Pour les seuls travaux qui s'incorporent au bâtiment et sont susceptibles d'affecter sa solidité, sa stabilité ou son étanchéité, l'entreprise est tenue de la responsabilité décennale (articles 1792 et 2270 de l'ancien Code civil et, pour les contrats conclus à partir du 1er septembre 2027, article 7.4.57 du Code civil) et, lorsque la loi du 31 mai 2017 l'impose, justifie de l'assurance obligatoire correspondante. La plupart des installations techniques dissociables ne relèvent pas de ce régime.",
    },

    { h3: "13. Responsabilité" },
    {
      p: "13.1. Notre responsabilité s'apprécie selon le droit commun. Nous réparons le dommage prévisible qui résulte d'un manquement qui nous est imputable. Ne relèvent pas de notre responsabilité les dommages causés par un usage anormal, un défaut d'entretien, une intervention d'un tiers, des informations inexactes ou incomplètes de votre part, un défaut préexistant du bâtiment ou de ses installations, une défaillance des réseaux ou un cas de force majeure. Les limitations du présent article ne s'appliquent ni aux atteintes à la vie ou à l'intégrité physique, ni à la faute intentionnelle ou à la faute lourde de l'entreprise.",
    },
    {
      p: "13.2. Les pertes de production, de rendement, de primes ou d'avantages fiscaux, les surconsommations et les frais de relogement liés à un retard de raccordement, de contrôle ou d'approvisionnement imputable à un tiers (gestionnaire de réseau, organisme de contrôle, fabricant, administration) ne peuvent être réclamés à l'entreprise.",
    },

    { h3: "14. Réserve de propriété et risques" },
    {
      p: "14.1. Le matériel et les équipements livrés restent la propriété de l'entreprise jusqu'au paiement intégral du prix, conformément à la loi du 11 juillet 2013 relative aux sûretés réelles mobilières. Cette réserve ne fait pas obstacle au transfert des risques de perte, de vol et de détérioration dès la livraison sur le lieu du chantier, le matériel étant placé sous votre garde.",
    },

    { h3: "15. Données personnelles, images et communications" },
    {
      p: `15.1. Nous traitons vos données pour l'exécution du contrat (article 6.1.b du RGPD), le respect de nos obligations légales et comptables (article 6.1.c) et la gestion de la relation commerciale au titre de notre intérêt légitime (article 6.1.f), y compris les données de monitoring de l'installation. Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité, et pouvez introduire une réclamation auprès de l'${DATA_AUTHORITY.name} (${DATA_AUTHORITY.url.replace("https://", "")}). Les données sont conservées pendant la relation puis archivées selon les délais légaux (notamment sept ans pour les factures et les pièces comptables) et pendant la durée des garanties. Le détail figure dans la [politique de confidentialité](${site.paths.privacy}) de chacun de nos sites.`,
    },
    {
      p: "15.2. Sauf opposition écrite de votre part avant la réception, l'entreprise peut utiliser des photographies de l'installation réalisée, sans mention de votre identité ni de votre adresse et sans personne identifiable, à des fins de références et de communication commerciale. Vous pouvez vous y opposer à tout moment par simple e-mail.",
    },
    {
      p: "15.3. Les communications électroniques (e-mail, messagerie, plateforme de signature) constituent des preuves valables entre les parties. Vous acceptez de recevoir devis, factures et documents contractuels par voie électronique. L'entreprise peut céder le contrat ou ses créances à une société liée, sans diminution de vos garanties.",
    },

    { h3: "16. Réclamations, médiation et droit applicable" },
    {
      p: `16.1. Adressez toute réclamation à la marque avec laquelle vous avez contracté (pour ${site.brand} : ${contact}) ou au siège (${C.email}, ${C.phone}). Nous en accusons réception et nous nous efforçons de vous apporter une réponse motivée dans les meilleurs délais.`,
    },
    {
      p: `16.2. Pour les litiges de consommation, vous pouvez recourir gratuitement au ${CONSUMER_MEDIATION.name} (SPF Économie, ${CONSUMER_MEDIATION.address}, ${CONSUMER_MEDIATION.url.replace("https://", "")}), qui traite votre demande ou la transmet à l'organe de règlement extrajudiciaire compétent.`,
    },
    {
      p: "16.3. Le contrat est soumis au droit belge. En cas de litige, vous pouvez saisir le tribunal de votre domicile ou du lieu d'exécution du contrat. Les dispositions impératives de protection du consommateur restent applicables si elles vous sont plus favorables.",
    },

    { h3: "17. Contrats d'entretien" },
    {
      p: "17.1. Lorsqu'un contrat d'entretien à durée déterminée prévoit sa reconduction tacite, cette clause figure en caractères gras, dans un cadre distinct du texte, au recto de la première page du contrat, avec ses conséquences, la date limite pour vous opposer à la reconduction et la manière de le faire. Après la reconduction, vous pouvez résilier le contrat à tout moment, sans indemnité, moyennant un préavis de deux mois au plus.",
    },

    { h3: "18. Dispositions finales" },
    {
      p: "18.1. La nullité éventuelle d'une clause n'affecte pas les autres. Une clause qui excéderait une limite légale est réputée réduite à cette limite.",
    },
    {
      p: "18.2. Les références au Code civil s'entendent des dispositions en vigueur à la date de conclusion du contrat. Pour les contrats conclus à partir du 1er septembre 2027, date d'application du Livre 7 du Code civil (contrats spéciaux, loi du 22 juillet 2026), les références aux articles de l'ancien Code civil sont réputées faites aux dispositions correspondantes de ce Livre, sans réduction de vos droits.",
    },
    {
      p: "18.3. Pour un contrat ponctuel, la version applicable des présentes conditions est celle annexée au devis. Le fait pour l'entreprise de ne pas se prévaloir d'une clause à un moment donné ne vaut pas renonciation à s'en prévaloir ultérieurement.",
    },

    { h3: "Formulaire type de rétractation (Partie I)" },
    {
      p: "Réservé au client consommateur. À compléter et à nous renvoyer uniquement si vous souhaitez vous rétracter du contrat. Son usage n'est pas obligatoire.",
    },
    {
      p: `À l'attention de ${C.name}, ${C.seat.replace(", Belgique", "")}, ${site.email}, ${site.phone}.`,
    },
    {
      ul: [
        "Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante :",
        "Numéro de devis ou de contrat :",
        "Commandé le :",
        "Nom et prénom du consommateur :",
        "Adresse :",
        "Téléphone :",
        "E-mail :",
        "Date :",
        "Signature (uniquement en cas d'envoi sur papier) :",
      ],
    },

    { h2: "Partie II. Conditions applicables aux professionnels (B2B)" },
    { p: "Applicables uniquement au client professionnel, tel que défini au préambule." },
    {
      p: "Les présentes conditions sont soumises au Livre 5 et au Livre 6 du Code civil et au Titre 3/1 du Livre VI du Code de droit économique. Elles ne s'appliquent pas aux consommateurs.",
    },

    { h3: "1. Champ d'application et qualification" },
    {
      p: "1.1. Les présentes conditions régissent toute offre, vente, fourniture, installation, modification, entretien, dépannage et prestation technique réalisée par AWLEST au profit d'un client agissant dans le cadre de son activité professionnelle, notamment en matière de photovoltaïque, stockage, bornes de recharge, pompes à chaleur, climatisation, ventilation, boilers thermodynamiques, poêles à pellets et à bois, inserts et foyers, cheminées, tubage, ramonage et rénovation énergétique.",
    },
    {
      p: "1.2. Le client déclare et garantit agir à des fins professionnelles. Toute déclaration inexacte sur sa qualité engage sa responsabilité et autorise AWLEST à résilier le contrat aux torts du client, sans préjudice de la réparation de son dommage. Les consommateurs relèvent de la Partie I.",
    },
    {
      p: "1.3. Les présentes conditions sont réputées connues et acceptées par le client, qui reconnaît avoir eu la possibilité d'en prendre connaissance avant de contracter (art. 5.23 du Code civil). Elles prévalent sur toute condition d'achat du client, quelle qu'en soit la mention. Le commencement d'exécution vaut renonciation du client à ses propres conditions.",
    },
    {
      p: "1.4. Les parties conviennent expressément et en connaissance de cause des clauses ci-après relatives aux acomptes, à la facturation, aux délais de signalement, aux pénalités, à la limitation de responsabilité et à la répartition des risques. Elles reconnaissent que ces clauses sont justifiées par les intérêts légitimes d'AWLEST (avance de trésorerie, approvisionnement de matériel spécifique, coordination de chantier, garantie du paiement, maîtrise du planning et de la preuve) et qu'elles ne créent pas de déséquilibre manifeste au sens des articles VI.91/3 et suivants du Code de droit économique, les deux parties étant des entreprises.",
    },
    {
      p: "1.5. Hiérarchie des documents : le devis signé et ses avenants, puis le cahier des charges technique validé, puis les conditions particulières de la marque (Partie III), puis les présentes conditions, puis les fiches techniques et notices des fabricants.",
    },

    { h3: "2. Devis et formation du contrat" },
    {
      p: "2.1. Sauf mention contraire, les devis sont valables 21 jours calendaires. Passé ce délai, les prix peuvent être révisés. Le contrat est formé par la signature du devis, par tout accord écrit équivalent (e-mail, signature électronique) ou par le commencement d'exécution. Toute modification requiert un avenant écrit ; aucune modification verbale n'est opposable à AWLEST.",
    },
    {
      p: "2.2. Les prix reposent sur les informations, plans, mesures et photos communiqués par le client, qui en garantit l'exactitude. Une visite technique peut être organisée pour les confirmer. Toute contrainte non décelable au moment du devis (structure insuffisante, installation électrique non conforme, absence de tirage, amiante, accès difficile, réseaux non signalés) donne lieu à un devis complémentaire, réputé accepté à défaut d'opposition écrite dans les 48 heures ouvrables. À défaut d'accord, la partie devenue impossible est résolue sans indemnité de part et d'autre, les prestations et frais déjà engagés restant dus.",
    },
    {
      p: "2.3. Sauf mention expresse au devis, ne sont pas compris : les mises en conformité électriques (RGIE), structurelles, hydrauliques ou de fumisterie, les raccordements spéciaux, les travaux de finition (plâtrage, peinture, carrelage), le déplacement d'obstacles non signalés, les frais de nacelle, d'échafaudage ou de grue non prévus, les frais de raccordement et de compteur du gestionnaire de réseau, les démarches d'urbanisme et de copropriété. Ces prestations sont facturées au tarif en vigueur majoré de 35 % pour sujétion technique.",
    },
    {
      p: "2.4. Les estimations de production, de rendement, d'économies, de retour sur investissement, de primes ou d'avantages fiscaux, ainsi que les prix et estimations affichés sur nos sites, sont fournis à titre purement indicatif sur la base d'hypothèses standard. Ils ne constituent ni un engagement ni une garantie. L'octroi et le montant des primes, certificats verts et avantages fiscaux dépendent exclusivement des autorités compétentes et de la situation du client.",
    },

    { h3: "3. Prix, acomptes, facturation et révision" },
    {
      p: "3.1. Les prix s'entendent hors TVA. Le client garantit l'exactitude de la situation déclarée aux fins d'application d'un taux réduit ; toute rectification imposée par l'administration reste à sa charge, en principal, intérêts et amendes.",
    },
    {
      p: "3.2. AWLEST détermine librement le montant et le calendrier des acomptes et des factures intermédiaires en fonction de l'approvisionnement du matériel, des livraisons, des jalons de chantier et de son exposition financière, sans autre limite que le prix total convenu. À titre indicatif : acompte à la commande, facture intermédiaire à la livraison du matériel et aux étapes clés, solde à la mise en service. Le solde est payable à 8 jours nets, par dérogation expresse au délai supplétif de 30 jours entre entreprises. AWLEST peut exiger à tout moment une garantie bancaire ou un paiement anticipé si la situation financière du client le justifie.",
    },
    {
      p: "3.3. Les prix sont fermes 30 jours après acceptation. Au-delà, ils sont révisables selon l'évolution réelle et objective des coûts propres à la prestation (matériaux, énergie, transport, main-d'œuvre), sur justificatifs. Conformément à l'article 57 de la loi du 30 mars 1976 relative aux mesures de redressement économique, la révision porte au maximum sur 80 % du prix, 20 % restant fixes, et repose sur des paramètres représentant les coûts réels, à l'exclusion de l'indice des prix à la consommation et de tout indice général. Toute hausse de plus de 3 % de ces coûts autorise une révision proportionnelle, y compris en cours d'exécution.",
    },

    { h3: "4. Paiement et retard de paiement" },
    {
      p: "4.1. Toute facture impayée à l'échéance produit de plein droit et sans mise en demeure des intérêts de retard au taux de la loi du 2 août 2002 concernant la lutte contre le retard de paiement dans les transactions commerciales (taux applicable au semestre en cours) majoré de 3 points, ainsi qu'une indemnité forfaitaire de 15 % du montant impayé, avec un minimum de 250 €, couvrant forfaitairement les frais administratifs internes de recouvrement. Les parties conviennent que ce forfait constitue une estimation raisonnable de ce dommage au sens de l'article 5.88 du Code civil. S'y ajoutent les frais externes de recouvrement, de contentieux et d'exécution réellement exposés.",
    },
    {
      p: "4.2. Le non-paiement d'une seule échéance rend immédiatement exigibles toutes les sommes dues au titre de l'ensemble des contrats en cours entre les parties. AWLEST peut suspendre sans préavis toutes ses prestations, y compris les garanties commerciales et le support, retenir le matériel non livré, désactiver à distance les fonctionnalités de monitoring dont elle assure l'accès, et subordonner la reprise des relations à la constitution de garanties.",
    },
    {
      p: "4.3. Toute contestation de facture doit être adressée par écrit motivé dans les 8 jours calendaires de sa réception, à défaut de quoi la facture est réputée acceptée. La contestation ne suspend pas l'exigibilité de la partie non contestée. Le client renonce à toute compensation avec des créances non reconnues par AWLEST ou non judiciairement établies.",
    },

    { h3: "5. Obligations du client" },
    {
      p: "5.1. Le client s'engage à : fournir un accès libre, sûr et permanent aux lieux (intérieur, extérieur, toiture, local technique) pendant toute la durée des travaux ; mettre gratuitement à disposition l'eau, l'électricité (230 V, 16 A) et un espace de stockage fermé ; communiquer toutes les informations utiles (plans à jour, réseaux encastrés, structure, présence d'amiante ou de matériaux dangereux, contraintes d'exploitation, servitudes) ; obtenir à ses frais toutes les autorisations requises (urbanisme, copropriété, propriétaire, gestionnaire de réseau) ; dégager entièrement la zone de travail (mobilier, objets, véhicules, végétation) avant l'arrivée des techniciens ; assurer la présence d'un représentant habilité au démarrage pour valider l'emplacement des équipements et le plan d'action ; prévenir par écrit au moins 5 jours ouvrables à l'avance de toute contrainte d'accès ou de planning ; s'abstenir de toute intervention concurrente non coordonnée.",
    },
    {
      p: "5.2. Sauf déclaration écrite contraire, l'installation électrique existante est présumée conforme et mise à la terre, les structures et la toiture présumées aptes à recevoir les équipements, les réseaux encastrés présumés localisés et l'absence d'amiante présumée avérée. Ces présomptions sont simples et peuvent être renversées par toute preuve ; elles répartissent la charge de la preuve sans limiter les moyens de preuve du client.",
    },
    {
      p: "5.3. Le client répond de l'état, de la solidité et de l'étanchéité préexistants de la toiture, des supports et des conduits. AWLEST ne répond pas des désordres liés à un défaut préexistant, apparent ou caché, du bâtiment ou de ses installations. Les percements et saignées sont exécutés sur la base des informations fournies ; le percement dans des matériaux non signalés est facturé en supplément (forfait minimum 175 € HTVA par percement, outre le matériel spécialisé). En cas d'atteinte à un réseau non signalé, AWLEST procède à la sécurisation d'urgence sans engager sa responsabilité ; les frais restent à charge du client, qui garantit AWLEST contre tout recours de tiers.",
    },
    {
      p: "5.4. Tout manquement du client aux obligations ci-dessus entraîne de plein droit la suspension des travaux à ses frais et risques, la prolongation corrélative des délais et une indemnité de 150 € HTVA par jour de suspension. En cas de zone non dégagée, d'absence de représentant habilité, d'accès refusé ou d'annulation tardive, sont en outre facturés le déplacement inutile (120 € HTVA) et le temps d'attente ou de manutention (85 € HTVA par heure entamée et par personne présente sur chantier). Le report de chantier qui en résulte est fixé selon les disponibilités d'AWLEST, sans limitation de durée et sans indemnité à sa charge.",
    },

    { h3: "6. Sous-traitance" },
    {
      p: "6.1. AWLEST peut, à tout moment et sans information ni autorisation préalable du client, confier tout ou partie des prestations à un ou plusieurs sous-traitants de son choix, ou substituer un sous-traitant à un autre. AWLEST conserve la direction technique et demeure l'interlocuteur unique du client. Le client accorde aux sous-traitants le même accès et la même coopération qu'à AWLEST.",
    },
    {
      p: "6.2. Le client s'interdit de traiter directement avec les sous-traitants d'AWLEST, de leur confier des travaux et de solliciter leurs services, pendant la durée du contrat et 24 mois après son terme, sous peine d'une indemnité forfaitaire de 5 000 € par infraction, que les parties conviennent de tenir pour une estimation raisonnable du dommage. Toute réclamation transite exclusivement par AWLEST. L'action en responsabilité extracontractuelle du client contre un sous-traitant (article 6.3 du Code civil) demeure réservée dans les limites impératives de la loi ; le sous-traitant peut opposer au client toutes les exceptions et limitations issues des présentes conditions.",
    },

    { h3: "7. Exécution, délais, force majeure et imprévision" },
    {
      p: "7.1. Sauf stipulation expresse contraire, les délais sont indicatifs. Lorsqu'un délai ferme est convenu, la pénalité de retard éventuellement due par AWLEST est plafonnée à 0,5 % du montant HTVA des prestations concernées par jour, avec un maximum de 5 % ; elle est libératoire et exclut toute autre indemnisation. Réciproquement, tout retard imputable au client est indemnisé à 200 € HTVA par jour, avec un maximum de 10 % du montant HTVA du contrat, montant que les parties tiennent pour une estimation raisonnable du dommage lié à l'immobilisation des équipes et du matériel.",
    },
    {
      p: "7.2. Suspendent les délais et exonèrent AWLEST de toute responsabilité : les intempéries rendant les travaux impossibles ou dangereux (pluie, gel, neige, vent supérieur à 40 km/h pour les travaux en hauteur), les ruptures, retards ou hausses d'approvisionnement supérieures à 10 %, les grèves même partielles, les défaillances de fournisseurs, transporteurs ou sous-traitants, les délais des gestionnaires de réseau, organismes de contrôle et administrations, les modifications réglementaires ou normatives, les pannes de réseau, cyberattaques, épidémies et indisponibilités de personnel. Le client conserve ses obligations de paiement pour les prestations réalisées.",
    },
    {
      p: "7.3. Par dérogation expresse à l'article 5.74 du Code civil, dont le caractère supplétif est admis entre entreprises, le client renonce à demander la renégociation du contrat pour cause de circonstances imprévisibles rendant son exécution plus onéreuse. AWLEST conserve sa faculté de révision de prix prévue à l'article 3.3.",
    },

    { h3: "8. Réception, signalement dans les 24 heures et réserves" },
    {
      p: "8.1. À la fin de chaque intervention, les techniciens réalisent des photographies de l'installation et des lieux. Ces photographies, horodatées, font foi de l'état des lieux et de l'installation à la fin de l'intervention, sauf preuve contraire. Le client ou son représentant est invité à y assister et à signer la fiche d'intervention ou le procès-verbal de réception.",
    },
    {
      p: "8.2. Tout dégât apparent au bâtiment, au mobilier, aux abords ou au matériel, et tout défaut visible de l'installation ou de la pose, doit être signalé à AWLEST par e-mail, à l'adresse de la marque avec laquelle le client a contracté ou à contact@awlest.com, avec photographies, dans les 24 heures suivant la fin de l'intervention. Ce délai est justifié par le fait que, passé ce temps, il n'est plus possible d'établir de manière fiable le lien entre l'intervention et le dommage allégué, les lieux restant sous la seule garde du client. À défaut de signalement conforme dans ce délai, les dégâts et défauts apparents sont réputés inexistants au moment de la fin de l'intervention, l'installation est réputée réceptionnée sans réserve sur ces points et aucune réclamation relative à des dégâts ou défauts apparents n'est recevable. Ce délai ne s'applique ni aux vices cachés ni aux défauts de fonctionnement qui ne pouvaient être décelés lors d'un examen attentif, qui restent régis par l'article 9.",
    },
    {
      p: "8.3. La réception a lieu lors d'une visite contradictoire sur convocation avec préavis de 48 heures ouvrables ou, à défaut de visite, par la signature de la fiche d'intervention. Les réserves motivées se formulent par écrit dans les 5 jours ouvrables. Passé ce délai, l'ouvrage est réputé accepté sans réserve. La mise en service, l'utilisation de l'installation, le raccordement au réseau ou le paiement du solde emportent également réception. Seules sont recevables les réserves portant sur une non-conformité manifeste aux spécifications, un défaut de fonctionnement constaté lors des essais ou un désordre de sécurité ; les réserves esthétiques hors cahier des charges et celles portant sur des performances non contractuellement garanties sont exclues. Toute réserve non formulée dans le délai est forclose.",
    },
    {
      p: "8.4. AWLEST dispose de 30 jours ouvrables, prorogeables de 15 jours en cas de nécessité technique ou d'attente de pièces, pour lever les réserves fondées, aux heures ouvrables et sous réserve d'accès. À défaut d'accès ou de coopération du client, les réserves sont réputées levées. Le refus injustifié de réceptionner après levée entraîne une indemnité de 200 € HTVA par jour au profit d'AWLEST.",
    },

    { h3: "9. Garanties, responsabilité et exclusions" },
    {
      p: "9.1. Les équipements bénéficient de la garantie du fabricant, selon ses conditions, sa durée et ses modalités propres, qu'AWLEST transmet au client sans y ajouter ni s'y substituer. AWLEST assiste le client dans la mise en œuvre de cette garantie ; les prestations de diagnostic, de dépose, de repose, de transport et de déplacement non couvertes par le fabricant sont facturées au tarif horaire de 85 € HTVA et au tarif de déplacement en vigueur.",
    },
    {
      p: "9.2. Les travaux d'installation sont garantis contre les vices d'exécution pendant 2 ans à compter de la réception, ou pendant la durée plus longue prévue par les conditions particulières de la marque (Partie III), sous réserve d'un usage normal, d'un entretien conforme aux prescriptions des fabricants et, pour les appareils de combustion, d'un entretien et d'un ramonage annuels par un professionnel. La garantie d'installation est suspendue tant qu'une facture reste impayée.",
    },
    {
      p: "9.3. Sont exclus de toute garantie et de toute responsabilité : l'usure normale ; le défaut ou l'insuffisance d'entretien ; l'usage non conforme aux notices ; les réglages, modifications, réparations ou interventions par le client ou un tiers ; les défauts du bâtiment, de la toiture, des conduits et des installations préexistantes ; les événements climatiques (grêle, tempête, gel, neige, canicule), la foudre, les surtensions, les variations et coupures du réseau ; les défaillances des réseaux tiers (électricité, eau, internet, télécom) et des services en ligne des fabricants ; les nuisibles ; les évolutions réglementaires postérieures ; les pertes de production, de données de monitoring ou de connectivité ; les décolorations, salissures, dépôts et micro-fissures sans incidence fonctionnelle.",
    },
    {
      p: "9.4. Hors faute intentionnelle et hors atteinte à la vie ou à l'intégrité physique, et dans les limites de l'article 5.89 du Code civil, la responsabilité totale d'AWLEST, tous chefs de préjudice confondus et quel que soit le fondement invoqué, est limitée au montant HTVA effectivement payé pour la prestation en cause. Sont exclus tous dommages indirects ou immatériels : pertes d'exploitation, manque à gagner, perte de production ou de rendement, perte de primes ou d'avantages fiscaux, perte de clientèle, atteinte à l'image, coûts de substitution, frais de relogement, majorations de consommation.",
    },
    {
      p: "9.5. Pour les seuls ouvrages qui s'incorporent au bâtiment et sont susceptibles d'en affecter la solidité, la stabilité ou l'étanchéité, AWLEST répond de la responsabilité décennale (articles 1792 et 2270 de l'ancien Code civil et, pour les contrats conclus à partir du 1er septembre 2027, article 7.4.57 du Code civil) et, lorsque la loi du 31 mai 2017 l'impose, justifie de l'assurance obligatoire correspondante. Les installations techniques dissociables ne relèvent pas de ce régime. AWLEST justifie en outre d'une assurance responsabilité civile professionnelle ; le client renonce à tout recours excédant les plafonds assurés, sauf faute intentionnelle.",
    },
    {
      p: "9.6. Toute intervention, réglage ou modification par le client ou un tiers non mandaté par AWLEST, toute rupture de scellé, toute modification des paramètres réseau de l'onduleur ou des protections, entraîne la déchéance des garanties d'AWLEST et la perte du bénéfice de son assistance auprès du fabricant.",
    },

    { h3: "10. Annulation, report et indisponibilité du client" },
    {
      p: "10.1. Toute annulation par le client, pour un motif autre qu'une faute grave prouvée d'AWLEST, rend exigibles : l'intégralité des acomptes versés, à titre d'indemnité ; une indemnité complémentaire de 20 % du montant total HTVA du contrat, avec un minimum de 500 € ; et le remboursement, au coût réel majoré de 25 %, de tous les frais engagés (études, commandes, déplacements, démarches). Le matériel commandé ou confectionné spécifiquement reste acquis au client à son prix et lui est livré ou tenu à disposition.",
    },
    {
      p: "10.2. Toute demande de report ou de modification doit être écrite et parvenir au moins 5 jours ouvrables avant la date convenue ; dans ce cas, le report est gratuit. À défaut, un forfait d'adaptation d'agenda de 150 € HTVA par rendez-vous reporté est dû, outre les frais de réorganisation réellement supportés (replanification, immobilisation de matériel et de personnel, créneaux perdus, stockage), sans plafond ; en cas de report notifié moins de 24 heures avant l'intervention, l'article 10.3 s'applique. Le report décale l'intervention selon les disponibilités d'AWLEST, sans limitation de durée ni indemnité à sa charge. Après deux reports ou annulations imputables au client, AWLEST peut résilier le contrat aux torts du client avec application de l'article 10.1.",
    },
    {
      p: "10.3. Si, à l'arrivée des techniciens, aucun représentant habilité n'est présent pour confirmer la faisabilité et valider le plan d'action, ou si la zone n'est pas préparée, l'intervention est reportée. Sont facturés le déplacement inutile (120 € HTVA), le temps d'attente et de manutention (85 € HTVA par heure entamée et par personne présente sur chantier) et les frais de réorganisation. Le report est fixé selon les disponibilités d'AWLEST, sans limitation de durée, et n'ouvre droit à aucune indemnité ni pénalité de retard à charge d'AWLEST.",
    },

    { h3: "11. Réserve de propriété et transfert des risques" },
    {
      p: "11.1. AWLEST conserve la propriété du matériel et des équipements jusqu'au paiement intégral de toutes ses créances envers le client, en principal, intérêts, indemnités et frais, au titre de tous les contrats en cours (clause de compte courant), conformément à la loi du 11 juillet 2013 relative aux sûretés réelles mobilières. Cette réserve est opposable aux tiers, créanciers et curateurs. En cas de non-paiement, AWLEST peut reprendre le matériel après mise en demeure restée sans effet 8 jours, aux frais du client, les acomptes restant acquis à titre d'indemnité d'utilisation.",
    },
    {
      p: "11.2. Les risques de perte, de vol et de détérioration du matériel sont transférés au client dès sa livraison sur le lieu du chantier, même avant pose et avant paiement. Le client assure le matériel livré et en assume la garde.",
    },

    { h3: "12. Propriété intellectuelle, confidentialité, données et images" },
    {
      p: "12.1. Les études, plans, schémas, calculs, dimensionnements, paramétrages et savoir-faire d'AWLEST restent sa propriété exclusive. Toute reproduction, communication à un tiers ou utilisation à d'autres fins que l'exécution du contrat est interdite et sanctionnée par une indemnité forfaitaire de 1 000 € par document et par infraction, sans préjudice de la réparation du dommage réel.",
    },
    {
      p: "12.2. Les échanges techniques et commerciaux, les prix et les conditions consenties sont confidentiels pendant la durée du contrat et 5 ans après son terme.",
    },
    {
      p: `12.3. Les données à caractère personnel sont traitées conformément au RGPD pour l'exécution du contrat, la facturation, les obligations légales, la maintenance, le monitoring et le recouvrement. Les droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité s'exercent auprès de ${C.email} ou de l'adresse de la marque ; le détail figure dans la [politique de confidentialité](${site.paths.privacy}) de chacun de nos sites.`,
    },
    {
      p: "12.4. Sauf opposition écrite du client avant la réception, AWLEST peut photographier l'installation réalisée et utiliser ces images, sans mention de l'identité ni de l'adresse du client et sans personne identifiable, à des fins de références et de communication commerciale.",
    },

    { h3: "13. Résolution et sanctions" },
    {
      p: "13.1. En cas de manquement grave, la partie lésée peut résoudre le contrat par notification écrite après mise en demeure restée sans effet pendant 10 jours ouvrables, la résolution prenant effet de plein droit à l'expiration de ce délai (articles 5.90 et suivants du Code civil). Constituent notamment des manquements graves du client : le non-paiement d'une échéance, le refus d'accès, la fourniture d'informations inexactes, l'intervention d'un tiers non autorisé, la violation de l'article 6.2.",
    },
    {
      p: "13.2. Lorsqu'il est manifeste que le client ne s'exécutera pas à l'échéance malgré mise en demeure, AWLEST peut résoudre le contrat par anticipation. Elle facture alors les prestations réalisées, les frais engagés non amortissables et une indemnité de rupture de 15 % de la partie non exécutée. AWLEST peut également suspendre l'exécution de ses propres obligations par simple notification écrite (exception d'inexécution).",
    },

    { h3: "14. Dispositions diverses" },
    {
      p: "14.1. La nullité ou l'inopposabilité d'une clause n'affecte pas les autres. Une clause qui excéderait une limite légale est réputée réduite à cette limite ; les parties la remplacent de bonne foi par une clause d'effet économique équivalent.",
    },
    {
      p: "14.2. AWLEST peut céder le contrat ou ses créances à toute société liée ou à tout tiers, sans diminution des garanties du client. Le client ne peut céder le contrat sans l'accord écrit d'AWLEST.",
    },
    {
      p: "14.3. Les références aux dispositions du Code civil s'entendent de celles en vigueur à la date de conclusion du contrat. Pour les contrats conclus à partir du 1er septembre 2027, date d'application du Livre 7 du Code civil (contrats spéciaux, loi du 22 juillet 2026), les références aux articles de l'ancien Code civil sont réputées faites aux dispositions correspondantes de ce Livre, sans que l'équilibre des présentes en soit modifié.",
    },
    {
      p: "14.4. Les communications électroniques (e-mail, messagerie, plateforme de signature) constituent des preuves valables entre les parties. Le client accepte de recevoir les factures par voie électronique. Les fiches d'intervention, photographies horodatées et rapports de mise en service d'AWLEST font foi jusqu'à preuve contraire.",
    },
    {
      p: "14.5. Le fait pour AWLEST de ne pas se prévaloir d'une clause à un moment donné ne vaut jamais renonciation à s'en prévaloir ultérieurement.",
    },

    { h3: "15. Droit applicable et juridiction" },
    {
      p: "15.1. Le contrat est soumis au droit belge. Sont seuls compétents les tribunaux de l'arrondissement judiciaire de Liège, division Huy, y compris en référé et pour les mesures conservatoires. Les parties peuvent recourir préalablement à une médiation, les frais étant supportés par la partie succombante. La langue de la procédure est le français.",
    },

    { h2: "Partie III. Conditions particulières des marques" },
    {
      p: "Les conditions ci-dessous complètent la Partie I ou la Partie II pour les commandes passées sous la marque concernée, quelle que soit la qualité du client, sauf mention contraire. En cas de contradiction, elles prévalent sur ces deux parties. Les commandes passées sous les marques Awlest et Mister Bois ne sont soumises à aucune condition particulière.",
    },

    { h3: "A. Mister Pellets (mister-pellets.be)" },
    {
      p: "A.1. Paiement. Aucun paiement ne se fait en ligne. Après la visite technique et l'acceptation du devis, une facture d'acompte de 30 % du prix est émise ; le solde est facturé à la fin de la pose. Acompte et solde se règlent par virement, carte ou Bancontact.",
    },
    {
      p: "A.2. Livraison. La livraison d'un poêle est gratuite dans un rayon de 20 km autour de notre showroom de Fernelmont. Au-delà, un forfait indiqué au devis s'applique : 50 € en Wallonie, 100 € à Bruxelles et en Flandre. Les délais de livraison sont indicatifs, de 48 heures à 4 à 6 semaines selon la disponibilité du modèle ; nous vous informons de tout retard significatif.",
    },
    {
      p: "A.3. Garantie commerciale de cinq ans. Les poêles à pellets vendus et installés par notre équipe sous la marque Mister Pellets bénéficient d'une garantie commerciale de cinq ans, pièces et main-d'œuvre, à compter de la réception de l'installation. Elle couvre les défauts de l'appareil et de sa pose, à condition que l'entretien annuel ait été réalisé par un professionnel et que l'appareil ait été utilisé conformément à sa notice ; les exclusions des articles 12.4 de la Partie I et 9.3 de la Partie II s'appliquent. Le garant est AWLEST SRL ; pour faire jouer la garantie, appelez le 081 13 83 09 ou écrivez à info@awlest.com. Pour le consommateur, cette garantie s'ajoute à la garantie légale de conformité de deux ans, qui reste due sans condition d'entretien.",
    },
    {
      p: "A.4. Service après-vente. Pour un poêle installé par notre équipe, nous intervenons nous-mêmes, en général dans un délai de 48 heures à 5 jours selon la nature de la panne. Pour un poêle que nous n'avons pas installé, nous vous orientons vers le service après-vente de la marque.",
    },

    { h3: "B. Mister Clim (mister-clim.be)" },
    {
      p: "B.1. Contenu du devis. Le devis détaille le matériel, la longueur de liaison frigorifique comprise, la pose, la mise en service et l'attestation. Les suppléments éventuels y sont chiffrés séparément : mètres de liaison au-delà du forfait, carottage spécial, ligne électrique dédiée, pompe de relevage, dépose de l'ancien matériel, accès en hauteur.",
    },
    {
      p: "B.2. Fluides frigorigènes. La manipulation du fluide frigorigène est réalisée par un technicien frigoriste certifié, au sein d'une entreprise agréée en technique du froid, conformément au règlement (UE) 2024/573 relatif aux gaz à effet de serre fluorés et à la réglementation wallonne.",
    },
    {
      p: "B.3. Garanties et entretien. La garantie Mister Clim sur la pose est la garantie commerciale d'installation de l'article 12.3 de la Partie I ; sa durée figure au devis. Une garantie commerciale étendue peut être liée à un contrat d'entretien actif : elle fait l'objet d'une déclaration de garantie écrite, remise à la souscription, qui en précise la durée et les conditions. L'entretien annuel par un frigoriste conditionne les garanties des constructeurs et la garantie étendue, jamais la garantie légale de conformité.",
    },

    { h2: "Acceptation des conditions générales" },
    {
      p: "Le client déclare avoir reçu et lu l'intégralité des présentes conditions générales, avoir identifié la partie qui lui est applicable conformément au préambule, et l'accepter sans réserve. Il coche sa qualité ci-dessous.",
    },
    {
      ul: [
        "☐ Client consommateur (Partie I applicable)",
        "☐ Client professionnel (Partie II applicable)",
        "Fait à :",
        "Le :",
        "Le client. Nom et prénom, ou raison sociale :",
        "Numéro d'entreprise (professionnels) :",
        "Nom et qualité du signataire (professionnels) :",
        "Signature précédée de la mention manuscrite « Lu et approuvé » (et cachet pour les professionnels) :",
        "Pour AWLEST SRL. Représentée par (nom et qualité) :",
        "Signature et cachet :",
      ],
    },
  ];
}
