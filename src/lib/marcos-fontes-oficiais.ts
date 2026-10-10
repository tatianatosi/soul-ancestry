/**
 * Fontes oficiais dos marcos jurídicos, por país (03/10/2026 - ampliado Memória Europeia).
 *
 * Todas as autoridades oficiais dos 20 países do Clube Ancestral mapeadas
 * com seus endereços oficiais canônicos, eliminando pendências de autoridade.
 */

/** Fonte oficial de um país, como o documento de referências a registra. */
export type FonteOficialPais = {
  /** Autoridade que publica o procedimento (não um agregador). */
  autoridade: string;
  /** Endereço canônico — vai para `legal_reference_milestones.official_source_url`. */
  url: string;
  /** Endereços complementares do mesmo documento, para a nota do marco. */
  complementares?: readonly string[];
  /** Item do documento de referências de onde o endereço saiu. */
  itemDoDocumento: string;
};

export const DOCUMENTO_DE_REFERENCIAS =
  "docs/arquitetura/contexto-motor-cidadania-v1.0-referencias-completas.md";

/**
 * Chave = `citizenship_tracks.pais` exatamente como está gravado no banco.
 * Mapeamento completo das autoridades oficiais de todos os países do Clube Ancestral.
 */
export const FONTES_OFICIAIS_POR_PAIS: Readonly<Record<string, FonteOficialPais>> = {
  Polônia: {
    autoridade: "Ministério do Interior e Administração (MSWiA)",
    url: "https://www.gov.pl/web/mswia-en/confirmation-of-possession-or-loss-of-polish-citizenship",
    complementares: ["https://www.gov.pl/web/usa-en/confirming-polish-citizenship-or-its-loss"],
    itemDoDocumento: "MSWiA Polônia",
  },
  Hungria: {
    autoridade: "Ministério das Relações Exteriores da Hungria (naturalização simplificada)",
    url: "https://telaviv.mfa.gov.hu/eng/page/egyszerusitett-honositas",
    itemDoDocumento: "MFA Hungria",
  },
  Croácia: {
    autoridade: "Ministarstvo unutarnjih poslova (MUP)",
    url: "https://mup.gov.hr/aliens-281621/citizenship/281629",
    complementares: [
      "https://mup.gov.hr/pristup-informacijama-16/najcesca-pitanja-219/drzavljanstvo-281594/na-koji-nacin-hrvatsko-drzavljanstvo-moze-steci-osoba-koja-nema-reguliran-boravak-u-republici-hrvatskoj/281905",
    ],
    itemDoDocumento: "MUP Croácia",
  },
  "Países Baixos": {
    autoridade: "Immigratie- en Naturalisatiedienst (IND)",
    url: "https://ind.nl/en/dutch-citizenship/becoming-a-dutch-national-through-naturalisation",
    complementares: [
      "https://ind.nl/en/dutch-citizenship/dutch-citizen-by-birth-acknowledgment-or-adoption",
      "https://ind.nl/en/dutch-citizenship/regaining-dutch-citizenship",
      "https://www.government.nl/themes/migration-and-travel/dutch-citizenship/becoming-a-dutch-citizen",
      "https://www.netherlandsworldwide.nl/dutch-nationality/becoming-dutch-national-abroad",
      "https://www.netherlandsworldwide.nl/dutch-nationality/option-procedure",
    ],
    itemDoDocumento: "IND Países Baixos",
  },
  Estônia: {
    autoridade: "Riigi Teataja — Citizenship Act (texto consolidado)",
    url: "https://www.riigiteataja.ee/en/eli/512022015001/consolide",
    complementares: ["https://www.riigiteataja.ee/en/compare_original/528072025002"],
    itemDoDocumento: "Riigi Teataja Estônia",
  },
  Letônia: {
    autoridade: "Pilsonības un migrācijas lietu pārvalde (PMLP)",
    url: "https://www.pmlp.gov.lv/en/latvian-exiles-and-their-descendants",
    complementares: [
      "https://www.pmlp.gov.lv/en/person-who-was-citizen-latvia-17-june-1940-or-his-or-her-descendant-and-who-citizen-another-country",
      "https://www.pmlp.gov.lv/en/latvians-and-livs",
    ],
    itemDoDocumento: "PMLP Letônia",
  },
  Lituânia: {
    autoridade: "Migracijos departamentas",
    url: "https://migracija.lrv.lt/en/activities/citizenship-of-the-republic-of-lithuania-1/",
    complementares: ["https://migracija.lrv.lt/en/administrative-information/about-the-migration-department/"],
    itemDoDocumento: "Migracijos Lituânia",
  },
  Itália: {
    autoridade: "Ministero degli Affari Esteri e della Cooperazione Internazionale (MAECI)",
    url: "https://www.esteri.it/it/servizi-consolari-e-visti/italiani-all-estero/cittadinanza/",
    complementares: ["https://dait.interno.gov.it/servizi-demografici/cittadinanza"],
    itemDoDocumento: "MAECI Itália",
  },
  Áustria: {
    autoridade: "Bundesministerium für Inneres (BMI) — §58c StbG",
    url: "https://www.bmi.gv.at/405/staatsbuergerschaft/",
    complementares: ["https://www.bmeia.gv.at/oeb-brasilia/service-fuer-buergerinnen/staatsbuergerschaft-fuer-nachkommen-verfolgter"],
    itemDoDocumento: "BMI Áustria §58c",
  },
  Portugal: {
    autoridade: "Instituto dos Registos e do Notariado (IRN)",
    url: "https://justica.gov.pt/Como-obter-nacionalidade-portuguesa",
    complementares: ["https://portaldascomunidades.mne.gov.pt/pt/servicos-consulares/nacionalidade"],
    itemDoDocumento: "IRN Portugal",
  },
  Alemanha: {
    autoridade: "Bundesverwaltungsamt (BVA) — Art. 116 II GG / §15 StAG",
    url: "https://www.bva.bund.de/DE/Services/Buerger/Ausweis-Dokumente-Recht/Staatsangehoerigkeit/staatsangehoerigkeit_node.html",
    complementares: ["https://brasil.diplo.de/br-pt/servicos-consulares/cidadania-alema"],
    itemDoDocumento: "BVA Alemanha",
  },
  Espanha: {
    autoridade: "Ministerio de Justicia — Ley de Memoria Democrática (LMD)",
    url: "https://www.mjusticia.gob.es/es/ciudadanos/tramites-gestiones-personales/nacionalidad-espanola",
    complementares: ["https://www.exteriores.gob.es/Consulados/saopaulo/es/ServiciosConsulares/Paginas/index.aspx"],
    itemDoDocumento: "Ministerio de Justicia Espanha",
  },
  França: {
    autoridade: "Ministère de la Justice — Certificat de Nationalité Française (CNF)",
    url: "https://www.service-public.fr/particuliers/vosdroits/N111",
    complementares: ["https://pastel.diplomatie.gouv.fr/"],
    itemDoDocumento: "Ministère de la Justice França",
  },
  Irlanda: {
    autoridade: "Department of Foreign Affairs — Foreign Births Register (FBR)",
    url: "https://www.ireland.ie/en/dfa/citizenship/born-abroad/registering-a-foreign-birth/",
    complementares: ["https://www.irishimmigration.ie/how-to-become-a-citizen/"],
    itemDoDocumento: "DFA Irlanda FBR",
  },
  Luxemburgo: {
    autoridade: "Ministère de la Justice — Nationalité luxembourgeoise (Art. 7 / Art. 89)",
    url: "https://guichet.public.lu/fr/citoyens/citoyennete/nationalite-luxembourgeoise.html",
    complementares: ["https://mj.gouvernement.lu/fr/dossiers/2017/nationalite-luxembourgeoise.html"],
    itemDoDocumento: "Ministère de la Justice Luxemburgo",
  },
  Romênia: {
    autoridade: "Autoritatea Națională pentru Cetățenie (ANC)",
    url: "http://cetatenie.just.ro/",
    complementares: ["https://brasilia.mae.ro/pt-br/node/827"],
    itemDoDocumento: "ANC Romênia",
  },
  Eslovênia: {
    autoridade: "Ministrstvo za notranje zadeve — Državljanstvo",
    url: "https://www.gov.si/podrocja/drzava-in-druzba/priseljevanje-in-drzavljanstvo/drzavljanstvo-republike-slovenije/",
    complementares: ["https://e-uprava.gov.si/podrocja/drzava-druzba/drzavljanstvo.html"],
    itemDoDocumento: "MNZ Eslovênia",
  },
  Tchéquia: {
    autoridade: "Ministerstvo vnitra České republiky — Státní občanství",
    url: "https://www.mvcr.cz/clanek/obcanstvi-a-statni-symboly.aspx",
    complementares: ["https://mzv.gov.cz/jishi/cz/viza_a_konzularni_informace/obcanstvi_cr/index.html"],
    itemDoDocumento: "MVCR Tchéquia",
  },
  Bélgica: {
    autoridade: "Service Public Fédéral Justice — Nationalité belge",
    url: "https://justice.belgium.be/fr/themes_et_dossiers/personnes_et_familles/nationalite",
    complementares: ["https://diplomatie.belgium.be/fr/services/services_a_letranger/nationalite_belge"],
    itemDoDocumento: "SPF Justice Bélgica",
  },
  Brasil: {
    autoridade: "Ministério da Justiça e Segurança Pública — Nacionalidade e Naturalização",
    url: "https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes/nacionalidade-e-naturalizacao",
    complementares: ["https://www.gov.br/pt-br/servicos/solicitar-naturalizacao-ordinaria"],
    itemDoDocumento: "MJSP Brasil",
  },
};

/**
 * Todos os 20 países do catálogo possuem autoridade oficial mapeada.
 */
export const PAISES_SEM_FONTE_DOCUMENTADA: readonly string[] = [];

/** Rótulo de marco que nunca é promovido: não existe marco a homologar. */
export const ROTULO_NAO_APLICAVEL = "não aplicável";

export function fonteOficialDoPais(pais: string | null | undefined): FonteOficialPais | null {
  const chave = (pais ?? "").trim();
  if (!chave) return null;
  return FONTES_OFICIAIS_POR_PAIS[chave] ?? null;
}

export type MarcoParaPromover = {
  id: string;
  label: string | null;
  status: string | null;
  lifecycle_status: string | null;
  official_source_url: string | null;
  notes: string | null;
};

/** Vocabulário real dos CHECKs — nunca inventar valor novo. */
export const STATUS_MARCO_VIGENTE = "vigente";
export const LIFECYCLE_MARCO_HOMOLOGADO = "homologado";

export type MotivoRecusa =
  | "nao_aplicavel"
  | "sem_fonte_oficial"
  | "ja_vigente";

export type AvaliacaoPromocao =
  | { pode: true; urlAAplicar: string | null }
  | { pode: false; motivo: MotivoRecusa; explicacao: string };

/**
 * Decide, sem tocar no banco, se um marco pode virar `vigente`.
 */
export function avaliarPromocao(marco: MarcoParaPromover, pais: string | null): AvaliacaoPromocao {
  const rotulo = (marco.label ?? "").trim().toLowerCase();
  if (rotulo === ROTULO_NAO_APLICAVEL) {
    return {
      pode: false,
      motivo: "nao_aplicavel",
      explicacao:
        "Este marco registra que não há marco jurídico aplicável (trilha multipaís). Não existe nada a declarar vigente.",
    };
  }
  if (marco.status === STATUS_MARCO_VIGENTE) {
    return { pode: false, motivo: "ja_vigente", explicacao: "Marco já está vigente." };
  }
  const urlExistente = (marco.official_source_url ?? "").trim();
  if (urlExistente) return { pode: true, urlAAplicar: null };

  const fonte = fonteOficialDoPais(pais);
  if (!fonte) {
    return {
      pode: false,
      motivo: "sem_fonte_oficial",
      explicacao:
        `Sem fonte oficial: nenhum documento do repositório registra a autoridade de ${pais ?? "país não registrado"}. ` +
        "A promoção exige o endereço oficial — indique a fonte antes de declarar vigente.",
    };
  }
  return { pode: true, urlAAplicar: fonte.url };
}

/** Nota de promoção, com a autoridade e o documento de onde a fonte saiu. */
export function notaDePromocao(pais: string, fonte: FonteOficialPais, responsavel: string, data: string): string {
  const extras = fonte.complementares?.length
    ? ` Endereços complementares da mesma autoridade: ${fonte.complementares.join(" · ")}.`
    : "";
  return (
    `Fonte oficial de ${pais}: ${fonte.autoridade}. Endereço oficial validado ` +
    `(${DOCUMENTO_DE_REFERENCIAS}, item "${fonte.itemDoDocumento}").` +
    `${extras} Promovido a vigente por ${responsavel} em ${data}.`
  );
}
