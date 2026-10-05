/**
 * Pessoa Unificada — o fio permanente, medido elo por elo (05/10/2026).
 *
 * Diretriz da Proprietária: "Pesquisa é o centro de inteligência operacional
 * do Clube Ancestral. Pessoa Unificada é o fio permanente que atravessa:
 * Lead → Contact/Call → Cliente → Caso → Núcleo → Ficha Piloto → Ficha
 * Genealógica → Pessoas/Relações → Fontes/Evidências → Hipóteses/Lacunas/
 * Achados → Contrato → Portal/App Cliente."
 *
 * Este módulo não é um motor novo nem uma tabela nova: é a definição única de
 * QUAL coluna carrega a identidade em cada etapa, e a conta de quais elos
 * seguram e quais arrebentam. Função pura — não lê banco, não grava, não
 * decide identidade de ninguém.
 *
 * O que a medição do caso-piloto mostrou em 05/10, e que motivou escrever
 * isto (números no banco, não relato):
 *
 * | elo | medido |
 * |---|---|
 * | `research_people.family_member_id` | 0 de 10 — e **nenhuma linha de código** em todo o `src/lib` escreve essa coluna |
 * | `research_people.genealogical_person_profile_id` | 0 de 10 — lida em `pesquisa-cadeia.functions.ts` e **nunca escrita** |
 * | `genealogical_person_profiles.client_id` | 0 de 10 |
 * | `research_evidence_items.person_id` | 0 de 1 |
 * | `genealogical_findings.primary_research_person_id` | 0 de 2 |
 *
 * A consequência não é estética. A Fase D (27/09) corrigiu certo a Pessoa 360:
 * parou de casar `research_people.canonical_name` com o nome da pessoa
 * canônica — fusão por nome é proibida — e passou a usar o vínculo real e
 * auditado, `genealogical_person_profiles.client_id`. Mas esse vínculo nunca
 * foi preenchido por ninguém. Logo, hoje a Pessoa 360 da requerente encontra
 * **zero** pessoas de pesquisa, e os achados, as evidências e o registro
 * genealógico dela não aparecem na ficha dela. Recusar a fusão por nome estava
 * certo; o que faltou foi alguém preencher o vínculo que substituiu o nome.
 *
 * Por isso há **duas** naturezas de elo, e a distinção é a regra central deste
 * módulo:
 *
 *  - **mecânico**: o vínculo já existe, registrado por decisão humana, e só
 *    falta escrevê-lo no sentido que falta — ou derivá-lo compondo duas
 *    decisões humanas já registradas. Religar é copiar ou compor o que já
 *    está lá; nunca adivinhar. Seguro.
 *  - **decisão de identidade**: dizer que a pessoa de pesquisa X é a pessoa
 *    canônica Y. Nunca inferido por nome, endereço, profissão ou filiação
 *    (AGENTS.md). Fica como pendência nomeada, com a rota de resolução.
 */

/** As doze etapas do fio, na ordem que a Proprietária escreveu. */
export const ETAPAS_FIO = [
  "lead",
  "contato_call",
  "cliente",
  "caso",
  "nucleo",
  "ficha_piloto",
  "ficha_genealogica",
  "pessoas_relacoes",
  "fontes_evidencias",
  "hipoteses_lacunas_achados",
  "contrato",
  "portal_app",
] as const;

export type EtapaFio = (typeof ETAPAS_FIO)[number];

export const ROTULO_ETAPA: Record<EtapaFio, string> = {
  lead: "Lead",
  contato_call: "Contato e Discovery",
  cliente: "Cliente",
  caso: "Caso",
  nucleo: "Núcleo",
  ficha_piloto: "Ficha Piloto",
  ficha_genealogica: "Ficha Genealógica",
  pessoas_relacoes: "Pessoas e Relações",
  fontes_evidencias: "Fontes e Evidências",
  hipoteses_lacunas_achados: "Hipóteses, Lacunas e Achados",
  contrato: "Contrato",
  portal_app: "Portal / App Cliente",
};

export type NaturezaElo = "mecanico" | "decisao_de_identidade";

export type DefinicaoElo = {
  chave: string;
  de: EtapaFio;
  para: EtapaFio;
  /** A coluna que carrega a identidade. Sem isto o elo é conversa. */
  coluna: string;
  natureza: NaturezaElo;
  /** O que fazer quando o elo está aberto. Rota real, não "verificar". */
  ondeResolver: string;
  /**
   * Quando `mecanico`, de onde vem o valor — o vínculo que já existe no outro
   * sentido. Religar é copiar, nunca inferir.
   */
  inversoDe?: string;
};

/**
 * Definição única dos elos. Toda coluna aqui foi conferida contra
 * `information_schema` em 05/10/2026: nenhuma é hipotética.
 */
export const ELOS_DO_FIO: DefinicaoElo[] = [
  {
    chave: "lead_para_cliente",
    de: "lead",
    para: "cliente",
    coluna: "clientes.lead_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "Mesa Discovery (/calls) — o handoff grava o lead de origem ao criar a pessoa",
  },
  {
    chave: "lead_para_caso",
    de: "lead",
    para: "caso",
    coluna: "crm_casos.lead_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "Mesa Discovery (/calls) — repasse do lead para o caso",
  },
  {
    chave: "cliente_para_caso",
    de: "cliente",
    para: "caso",
    coluna: "crm_casos.cliente_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "Caso 360 › Visão — titular do caso",
  },
  {
    chave: "caso_para_membro",
    de: "caso",
    para: "ficha_piloto",
    coluna: "case_members.cliente_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "Caso 360 › Pessoas e família — escolher a pessoa canônica do membro",
  },
  {
    chave: "caso_para_nucleo",
    de: "caso",
    para: "nucleo",
    coluna: "nucleo_membros.cliente_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "/nucleos — escolher a pessoa canônica do membro do núcleo",
  },
  {
    chave: "perfil_para_cliente",
    de: "ficha_genealogica",
    para: "cliente",
    coluna: "genealogical_person_profiles.client_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "/pessoas-linhagens/$caseId › Perfil 360° — vincular à pessoa do caso",
  },
  {
    chave: "pesquisa_para_perfil",
    de: "pessoas_relacoes",
    para: "ficha_genealogica",
    coluna: "research_people.genealogical_person_profile_id",
    natureza: "mecanico",
    inversoDe: "genealogical_person_profiles.research_person_id",
    ondeResolver: "Hub de Pesquisa — religar os elos mecânicos do fio",
  },
  {
    chave: "pesquisa_para_membro",
    de: "pessoas_relacoes",
    para: "ficha_piloto",
    coluna: "research_people.family_member_id",
    /*
     * Corrigido em 05/10/2026, depois de medir: eu havia classificado como
     * decisão de identidade, e não é. Dado que o perfil genealógico diz
     * "esta pessoa de pesquisa é a pessoa canônica X" (decisão humana,
     * auditada) e que `case_members` diz "X é membro deste caso" (outra
     * decisão humana), o membro desta pessoa de pesquisa é **derivável** —
     * é a composição de duas decisões já registradas, não um palpite por
     * nome. Só vale quando a composição é única: com zero ou mais de um
     * membro para a mesma pessoa canônica no caso, não se grava nada.
     */
    natureza: "mecanico",
    inversoDe: "genealogical_person_profiles.client_id ∘ case_members.cliente_id",
    ondeResolver: "Hub de Pesquisa — religar os elos mecânicos do fio (depois do vínculo do perfil)",
  },
  {
    chave: "evidencia_para_pessoa",
    de: "fontes_evidencias",
    para: "pessoas_relacoes",
    coluna: "research_evidence_items.person_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "/pesquisa-modulo/$id › Evidências — pessoa da evidência, ou o vínculo em research_evidence_links",
  },
  {
    chave: "achado_para_pessoa",
    de: "hipoteses_lacunas_achados",
    para: "pessoas_relacoes",
    coluna: "genealogical_findings.primary_research_person_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "/achados/$caseId — pessoa principal do achado",
  },
  {
    chave: "cliente_para_contrato",
    de: "cliente",
    para: "contrato",
    coluna: "contract_parties.client_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "Caso 360 › Formalização — partes do instrumento",
  },
  {
    chave: "pessoa_para_app",
    de: "portal_app",
    para: "pessoas_relacoes",
    coluna: "app_projections.pessoa_id",
    natureza: "decisao_de_identidade",
    ondeResolver: "/pessoas-linhagens/$caseId — publicar pessoa na árvore do App",
  },
];

export function eloPor(chave: string): DefinicaoElo | null {
  return ELOS_DO_FIO.find((e) => e.chave === chave) ?? null;
}

export function elosMecanicos(): DefinicaoElo[] {
  return ELOS_DO_FIO.filter((e) => e.natureza === "mecanico");
}

/** Um elo medido: existe, está aberto, ou não se aplica a esta pessoa. */
export type EstadoElo = "segura" | "aberto" | "nao_se_aplica";

export type EloMedido = {
  chave: string;
  estado: EstadoElo;
  /** Por que não se aplica — nunca "n/a" seco. */
  motivo?: string;
};

export type PessoaDoFio = {
  id: string;
  nome: string;
  /** subject · family_member · descendant · ancestor · related_person · unknown_person */
  personStatus: string;
  /** Ascendente não é cliente nem membro do contrato: o elo não se aplica. */
  elos: EloMedido[];
};

/**
 * Ascendente histórico não tem pessoa canônica, nem membro de caso, nem parte
 * no contrato — e isso não é lacuna. Confundir as duas coisas é o que fazia a
 * conta de "fio rompido" soar pior do que é.
 */
export const STATUS_SEM_PESSOA_CANONICA = ["ancestor", "related_person", "unknown_person"];

export function eloSeAplica(elo: DefinicaoElo, personStatus: string): boolean {
  const historico = STATUS_SEM_PESSOA_CANONICA.includes(personStatus);
  if (!historico) return true;
  // Para pessoa histórica, só valem os elos internos da pesquisa e o do App.
  return ["pesquisa_para_perfil", "evidencia_para_pessoa", "achado_para_pessoa", "pessoa_para_app"].includes(
    elo.chave,
  );
}

export type SaudeDoFio = {
  pessoas: number;
  /** Elos que seguram sobre elos aplicáveis. */
  segurando: number;
  aplicaveis: number;
  /** Aberto e mecânico: religável sem decisão humana. */
  abertosMecanicos: number;
  /** Aberto e de identidade: só a Proprietária ou a equipe decide. */
  abertosDeIdentidade: number;
  /** O fio atravessa quando nenhum elo aplicável está aberto. */
  atravessa: boolean;
};

export function saudeDoFio(pessoas: readonly PessoaDoFio[]): SaudeDoFio {
  let segurando = 0;
  let aplicaveis = 0;
  let mec = 0;
  let ident = 0;
  for (const p of pessoas) {
    for (const e of p.elos) {
      if (e.estado === "nao_se_aplica") continue;
      aplicaveis += 1;
      if (e.estado === "segura") {
        segurando += 1;
        continue;
      }
      const def = eloPor(e.chave);
      if (def?.natureza === "mecanico") mec += 1;
      else ident += 1;
    }
  }
  return {
    pessoas: pessoas.length,
    segurando,
    aplicaveis,
    abertosMecanicos: mec,
    abertosDeIdentidade: ident,
    atravessa: aplicaveis > 0 && segurando === aplicaveis,
  };
}

/** Agrupa os elos abertos por rota de resolução — a fila de trabalho real. */
export function filaDeResolucao(
  pessoas: readonly PessoaDoFio[],
): { ondeResolver: string; coluna: string; natureza: NaturezaElo; pessoas: string[] }[] {
  const porRota = new Map<string, { ondeResolver: string; coluna: string; natureza: NaturezaElo; pessoas: string[] }>();
  for (const p of pessoas) {
    for (const e of p.elos) {
      if (e.estado !== "aberto") continue;
      const def = eloPor(e.chave);
      if (!def) continue;
      const atual = porRota.get(def.chave);
      if (atual) {
        atual.pessoas.push(p.nome);
        continue;
      }
      porRota.set(def.chave, {
        ondeResolver: def.ondeResolver,
        coluna: def.coluna,
        natureza: def.natureza,
        pessoas: [p.nome],
      });
    }
  }
  // Mecânico primeiro: é o que se resolve sem esperar decisão de ninguém.
  return [...porRota.values()].sort((a, b) => {
    if (a.natureza !== b.natureza) return a.natureza === "mecanico" ? -1 : 1;
    return b.pessoas.length - a.pessoas.length;
  });
}

/**
 * Frase honesta do estado do fio. Nunca diz "completo" com elo aberto, e nunca
 * diz "rompido" quando o que falta é decisão humana nomeada.
 */
export function resumoDoFio(s: SaudeDoFio): string {
  if (s.aplicaveis === 0) return "Nenhuma pessoa de pesquisa neste caso: o fio ainda não tem por onde passar.";
  if (s.atravessa) return `O fio atravessa: ${s.segurando} de ${s.aplicaveis} elos aplicáveis seguram.`;
  const partes = [`${s.segurando} de ${s.aplicaveis} elos aplicáveis seguram`];
  if (s.abertosMecanicos > 0) partes.push(`${s.abertosMecanicos} religável sem decisão`);
  if (s.abertosDeIdentidade > 0) partes.push(`${s.abertosDeIdentidade} dependendo de decisão de identidade`);
  return `O fio NÃO atravessa — ${partes.join(" · ")}.`;
}
