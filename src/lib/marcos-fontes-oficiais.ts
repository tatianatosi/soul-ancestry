/**
 * Fontes oficiais dos marcos jurídicos, por país (03/10/2026).
 *
 * ## O que este módulo fecha
 *
 * A Proprietária autorizou: "promova os 43 marcos juridicos". A medição do
 * banco em 03/10 mostrava por que a promoção nunca aconteceu:
 *
 * | medida | número |
 * |---|---|
 * | marcos em `legal_reference_milestones` | 43 |
 * | com `official_source_url` | 15 (Itália, Áustria, Portugal, Alemanha, Espanha) |
 * | **sem** fonte oficial | **28** |
 * | `status = 'vigente'` | **0** |
 *
 * E a varredura pedida ("você vai encontrar uma base bem rica de material já
 * por países") achou o que faltava: as URLs das autoridades oficiais de 7
 * desses países estavam **documentadas no próprio repositório**, em
 * `docs/arquitetura/contexto-motor-cidadania-v1.0-referencias-completas.md`,
 * sem nunca chegar ao banco nem ao Desk. Material lido, documentado e não
 * executado — exatamente o padrão que ela mandou medir.
 *
 * Então: nada aqui é URL inventada. Cada endereço abaixo está no documento
 * citado, verbatim, com o número do item. País sem fonte no documento **não
 * recebe fonte** — vira pendência declarada (`PAISES_SEM_FONTE_DOCUMENTADA`),
 * nunca um placeholder.
 *
 * A regra da Proprietária de 02/10 continua valendo e é o que este módulo
 * mecaniza: promoção é **país a país, com responsável**, e só marco com
 * fonte oficial revisada vira `vigente`. País habilitado no Planejador não é
 * parecer jurídico.
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
 * Não normalizo acento aqui: o de-para tem de bater com o dado real.
 */
export const FONTES_OFICIAIS_POR_PAIS: Readonly<Record<string, FonteOficialPais>> = {
  Polônia: {
    autoridade: "Ministério do Interior e Administração (MSWiA)",
    url: "https://www.gov.pl/web/mswia-en/confirmation-of-possession-or-loss-of-polish-citizenship",
    complementares: ["https://www.gov.pl/web/usa-en/confirming-polish-citizenship-or-its-loss"],
    itemDoDocumento: "itens 7 e 8",
  },
  Hungria: {
    autoridade: "Ministério das Relações Exteriores da Hungria (naturalização simplificada)",
    url: "https://telaviv.mfa.gov.hu/eng/page/egyszerusitett-honositas",
    itemDoDocumento: "item 9",
  },
  Croácia: {
    autoridade: "Ministarstvo unutarnjih poslova (MUP)",
    url: "https://mup.gov.hr/aliens-281621/citizenship/281629",
    complementares: [
      "https://mup.gov.hr/pristup-informacijama-16/najcesca-pitanja-219/drzavljanstvo-281594/na-koji-nacin-hrvatsko-drzavljanstvo-moze-steci-osoba-koja-nema-reguliran-boravak-u-republici-hrvatskoj/281905",
    ],
    itemDoDocumento: "itens 10 e 11",
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
    itemDoDocumento: "itens 12 a 20",
  },
  Estônia: {
    autoridade: "Riigi Teataja — Citizenship Act (texto consolidado)",
    url: "https://www.riigiteataja.ee/en/eli/512022015001/consolide",
    complementares: ["https://www.riigiteataja.ee/en/compare_original/528072025002"],
    itemDoDocumento: "itens 21 e 22",
  },
  Letônia: {
    autoridade: "Pilsonības un migrācijas lietu pārvalde (PMLP)",
    url: "https://www.pmlp.gov.lv/en/latvian-exiles-and-their-descendants",
    complementares: [
      "https://www.pmlp.gov.lv/en/person-who-was-citizen-latvia-17-june-1940-or-his-or-her-descendant-and-who-citizen-another-country",
      "https://www.pmlp.gov.lv/en/latvians-and-livs",
    ],
    itemDoDocumento: "itens 23 a 25",
  },
  Lituânia: {
    autoridade: "Migracijos departamentas",
    url: "https://migracija.lrv.lt/en/activities/citizenship-of-the-republic-of-lithuania-1/",
    complementares: ["https://migracija.lrv.lt/en/administrative-information/about-the-migration-department/"],
    itemDoDocumento: "itens 26 e 27",
  },
};

/**
 * Países com marco no banco e **sem** fonte oficial em nenhum documento do
 * repositório. Declarados, não preenchidos — a Proprietária indica a fonte.
 */
export const PAISES_SEM_FONTE_DOCUMENTADA: readonly string[] = [
  "Bélgica",
  "Brasil",
  "Eslovênia",
  "França",
  "Irlanda",
  "Luxemburgo",
  "Romênia",
  "Tchéquia",
];

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
 *
 * Três recusas, todas explicadas em texto que a tela mostra:
 * - `nao_aplicavel`: o marco diz que não há marco (Multipaís). Promover isso
 *   seria declarar vigente um marco que não existe.
 * - `sem_fonte_oficial`: não há URL no marco **nem** fonte documentada para o
 *   país. É a pendência que a Proprietária precisa resolver indicando a fonte.
 * - `ja_vigente`: idempotência — promover de novo não faz nada.
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
    `Fonte oficial de ${pais}: ${fonte.autoridade}. Endereço aplicado a partir de ` +
    `${DOCUMENTO_DE_REFERENCIAS} (${fonte.itemDoDocumento}).${extras} ` +
    `Promovido a vigente por ${responsavel} em ${data}.`
  );
}
