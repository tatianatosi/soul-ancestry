/**
 * Ancestral Canvas — Relatório Visual (Projeto Essencial).
 *
 * Camada de conteúdo do relatório de página única mostrado no App Cliente.
 * Estrutura preparada para conexão futura com dados reais: cada bloco
 * (cliente, linha familiar, documentos, lacunas, próxima etapa e metadados)
 * é separado e pode ser alimentado por fonte distinta (planilhas, Supabase,
 * Ancestral Blueprint) sem alterar o componente visual.
 *
 * Os valores {{...}} são PLACEHOLDERS estruturados do briefing.
 */

import type { Caso } from "./casos";

/** Metadados do relatório — controlam o microbloco "ativo vivo" no topo. */
export type RelatorioMeta = {
  etapaAtual: string; // {{ETAPA_ATUAL}}
  ultimaAtualizacao: string; // {{DATA_ULTIMA_ATUALIZACAO}}
  status: "em_elaboracao" | "em_revisao" | "entregue" | "arquivado"; // {{STATUS_RELATORIO}}
  versao: string; // {{VERSAO_RELATORIO}}
  responsavel: string; // {{CONSULTORA_RESPONSAVEL}}
  proximaRevisao: string; // {{PROXIMA_REVISAO}}
};

export const STATUS_LABEL: Record<RelatorioMeta["status"], string> = {
  em_elaboracao: "Em elaboração",
  em_revisao: "Em revisão",
  entregue: "Entregue",
  arquivado: "Arquivado",
};

/** Item arquivado na aba Legado ("Relatórios da sua família"). */
export type EntregaJornada = {
  id: string;
  titulo: string;
  data: string;
  etapa: string;
  status: RelatorioMeta["status"];
  descricao: string;
  /** true = abre o Relatório Visual ativo; false = entrega histórica. */
  abreRelatorio?: boolean;
};

export type RelatorioVisual = {
  casoId: string;
  /* --- cliente --- */
  sobrenomeFamilia: string; // {{SOBRENOME_FAMILIA}}
  pessoaFoco: string; // {{PESSOA_FOCO}}
  ancestralMaisAntigo: string; // {{ANCESTRAL_MAIS_ANTIGO}}
  numeroGeracoes: string; // {{NUMERO_GERACOES}}
  localidadesPrincipais: string; // {{LOCALIDADES_PRINCIPAIS}}
  /* --- linha familiar --- */
  linhaPrincipal: { nome: string; eventos: string }[]; // {{GERACAO_N_*}}
  /* --- documentos --- */
  documentos: { pessoa: string; tipo: string; local: string; observacao: string }[];
  quantidadeRegistros: string; // {{QUANTIDADE_REGISTROS}}
  /* --- lacunas --- */
  lacunas: string[]; // {{LACUNA_N}}
  pontosConfirmar: string[]; // {{PONTO_CONFIRMAR_N}}
  /* --- próxima etapa --- */
  proximaEtapa: { titulo: string; resumo: string; possibilidades: string[] };
  /* --- metadados --- */
  meta: RelatorioMeta;
  /* --- entregas da jornada (Legado) --- */
  entregas: EntregaJornada[];
};

export const POSSIBILIDADES_APROFUNDAMENTO = [
  "Novas gerações e documentos",
  "Ramos complementares",
  "Leitura histórica mais ampla",
  "Investigação de lacunas específicas",
];

/** Modelo base — usado quando o caso ainda não tem relatório dedicado. */
function modelo(caso: Caso): RelatorioVisual {
  const sobrenome = caso.cliente.split(" ").slice(-1)[0];
  return {
    casoId: caso.id,
    sobrenomeFamilia: sobrenome,
    pessoaFoco: caso.cliente,
    ancestralMaisAntigo: caso.linhaAncestral[0]
      ? `${caso.linhaAncestral[0].texto} (${caso.linhaAncestral[0].ano})`
      : "{{ANCESTRAL_MAIS_ANTIGO}}",
    numeroGeracoes: String(Math.max(4, caso.linhaAncestral.length)),
    localidadesPrincipais: `${caso.pais} · Brasil`,
    linhaPrincipal: [
      { nome: "{{GERACAO_1_NOME}}", eventos: "{{GERACAO_1_EVENTOS}}" },
      { nome: "{{GERACAO_2_NOME}}", eventos: "{{GERACAO_2_EVENTOS}}" },
      { nome: "{{GERACAO_3_NOME}}", eventos: "{{GERACAO_3_EVENTOS}}" },
      { nome: "{{GERACAO_4_NOME}}", eventos: "{{GERACAO_4_EVENTOS}}" },
    ],
    documentos: [
      { pessoa: "{{DOC1_PESSOA}}", tipo: "{{DOC1_TIPO}}", local: "{{DOC1_LOCAL}}", observacao: "{{DOC1_OBSERVACAO}}" },
      { pessoa: "{{DOC2_PESSOA}}", tipo: "{{DOC2_TIPO}}", local: "{{DOC2_LOCAL}}", observacao: "{{DOC2_OBSERVACAO}}" },
      { pessoa: "{{DOC3_PESSOA}}", tipo: "{{DOC3_TIPO}}", local: "{{DOC3_LOCAL}}", observacao: "{{DOC3_OBSERVACAO}}" },
    ],
    quantidadeRegistros: "{{QUANTIDADE_REGISTROS}}",
    lacunas: ["{{LACUNA_1}}", "{{LACUNA_2}}", "{{LACUNA_3}}"],
    pontosConfirmar: ["{{PONTO_CONFIRMAR_1}}", "{{PONTO_CONFIRMAR_2}}"],
    proximaEtapa: {
      titulo: "Próxima etapa recomendada",
      resumo:
        `Com a base agora estruturada, a família ${sobrenome} já tem um ponto de partida seguro para um estudo mais profundo. ` +
        "Em uma etapa de aprofundamento, é possível ampliar gerações, esclarecer lacunas, investigar novos ramos e reconstruir com mais riqueza a trajetória da família ao longo do tempo.",
      possibilidades: POSSIBILIDADES_APROFUNDAMENTO,
    },
    meta: {
      etapaAtual: "Projeto Essencial · pesquisa base",
      ultimaAtualizacao: "{{DATA_ULTIMA_ATUALIZACAO}}",
      status: "em_elaboracao",
      versao: "v1",
      responsavel: "Consultoria Clube Ancestral",
      proximaRevisao: "{{PROXIMA_REVISAO}}",
    },
    entregas: [
      {
        id: `${caso.id}-rel-essencial`,
        titulo: "Relatório Visual · Projeto Essencial",
        data: "{{DATA_ULTIMA_ATUALIZACAO}}",
        etapa: "Projeto Essencial",
        status: "em_elaboracao",
        descricao: "Síntese da pesquisa base: linha principal, documentos e pontos em aberto.",
        abreRelatorio: true,
      },
    ],
  };
}

/** Relatórios já preenchidos (exemplo estruturado — substituir por dados reais). */
export const RELATORIOS: Record<string, Partial<RelatorioVisual>> = {
  "CA-CID-IT-2026-001": {
    sobrenomeFamilia: "Prade",
    pessoaFoco: "Giovanna Prade",
    ancestralMaisAntigo: "Antonio Prade (n. 1868, Vêneto)",
    numeroGeracoes: "4",
    localidadesPrincipais: "Vêneto (IT) · Caxias do Sul (RS)",
    linhaPrincipal: [
      { nome: "Antonio Prade", eventos: "n. 1868 · casamento 1892 · emigração 1895" },
      { nome: "Luigi Prade", eventos: "n. 1897 (RS) · casamento 1921 · óbito 1974" },
      { nome: "Vitorio Prade", eventos: "n. 1930 · casamento 1955" },
      { nome: "Giovanna Prade", eventos: "n. 1994 · pessoa-foco do processo" },
    ],
    documentos: [
      { pessoa: "Antonio Prade", tipo: "Certidão de nascimento", local: "Comune (IT)", observacao: "Confirma origem italiana" },
      { pessoa: "Luigi Prade", tipo: "Certidão de casamento", local: "Cartório · Caxias do Sul", observacao: "Liga geração 1 e 2" },
      { pessoa: "Vitorio Prade", tipo: "Certidão de nascimento", local: "Cartório · RS", observacao: "Confirma continuidade da linha" },
    ],
    quantidadeRegistros: "11",
    lacunas: [
      "Registro de óbito de Antonio Prade ainda não localizado",
      "Documento de desembarque no porto de entrada",
      "Certidão de casamento italiana em cópia integral",
    ],
    pontosConfirmar: ["Grafia do sobrenome nos registros brasileiros", "Data exata de emigração"],
    meta: {
      etapaAtual: "Projeto Essencial · pesquisa base concluída",
      ultimaAtualizacao: "12 de março de 2026",
      status: "entregue",
      versao: "v2",
      responsavel: "Consultoria Clube Ancestral",
      proximaRevisao: "Abril de 2026",
    },
    entregas: [
      {
        id: "CA-CID-IT-2026-001-rel-essencial",
        titulo: "Relatório Visual · Projeto Essencial",
        data: "12 de março de 2026",
        etapa: "Projeto Essencial",
        status: "entregue",
        descricao: "Síntese da pesquisa base da família Prade: 4 gerações, 11 registros localizados.",
        abreRelatorio: true,
      },
      {
        id: "CA-CID-IT-2026-001-dossie-inicial",
        titulo: "Dossiê inicial de documentos",
        data: "28 de janeiro de 2026",
        etapa: "Diagnóstico",
        status: "arquivado",
        descricao: "Primeira triagem documental e definição da linha a ser pesquisada.",
      },
    ],
  },
};

export function relatorioByCaso(caso: Caso): RelatorioVisual {
  return { ...modelo(caso), ...(RELATORIOS[caso.id] ?? {}) };
}

/** Entregas da jornada exibidas na aba Legado. */
export function entregasByCaso(caso: Caso): EntregaJornada[] {
  return relatorioByCaso(caso).entregas;
}
