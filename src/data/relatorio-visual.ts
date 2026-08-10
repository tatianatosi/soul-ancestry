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
import { limparCopy, limparLista, primeiroOuMensagem } from "@/lib/client-copy";

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
  proximaEtapa: {
    titulo: string;
    resumo: string;
    possibilidades: string[];
    /** Rótulo da CTA primária — varia conforme a via provável do caso. */
    ctaPrimaria?: string;
  };
  /* --- metadados --- */
  meta: RelatorioMeta;
  /* --- entregas da jornada (Legado) --- */
  entregas: EntregaJornada[];
};

export const POSSIBILIDADES_VIA_JUDICIAL = [
  "Organização e auditoria da documentação da linha",
  "Coordenação de retificações, traduções e apostilamentos",
  "Intermediação com advogado parceiro na Itália",
  "Protocolo e acompanhamento do processo judicial até a sentença",
];

export const POSSIBILIDADES_APROFUNDAMENTO = [
  "Novas gerações e documentos",
  "Ramos complementares",
  "Leitura histórica mais ampla",
  "Investigação de lacunas específicas",
];

/** Rótulo cliente-facing do estágio da Fase 1. */
export const FASE1_STATUS_LABEL: Record<RelatorioMeta["status"], string> = {
  em_elaboracao: "Em diagnóstico",
  em_revisao: "Em diagnóstico",
  entregue: "Primeira leitura concluída",
  arquivado: "Primeira leitura concluída",
};

const OBS_DOC: Record<string, string> = {
  ok: "Registro localizado e conferido pela consultoria.",
  parcial: "Registro localizado, em conferência de dados.",
  pendente: "Ainda em busca — sem confirmação até o momento.",
};

/** Modelo base — derivado dos dados reais do caso, sem placeholders técnicos. */
function modelo(caso: Caso): RelatorioVisual {
  const sobrenome = limparCopy(caso.cliente.split(" ").slice(-1)[0]) || "da família";
  const linha = caso.linhaAncestral ?? [];
  const docs = caso.checklistDocs ?? [];
  const confirmados = docs.filter((d) => d.status === "ok" || d.status === "parcial");
  const pendentes = docs.filter((d) => d.status === "pendente");
  const emConferencia = docs.filter((d) => d.status === "parcial");
  const ultimoRegistro = caso.historico?.[0]?.d;

  return {
    casoId: caso.id,
    sobrenomeFamilia: sobrenome,
    pessoaFoco: limparCopy(caso.cliente),
    ancestralMaisAntigo: primeiroOuMensagem(
      [linha[0] ? `${linha[0].texto} · ${linha[0].ano}` : ""],
      "Em identificação nesta primeira leitura",
    ),
    numeroGeracoes: linha.length ? String(linha.length) : "",
    localidadesPrincipais: limparLista([caso.pais, "Brasil"]).join(" · "),
    linhaPrincipal: limparLista(linha.map((g) => g.texto)).map((texto, i) => ({
      nome: texto,
      eventos: limparCopy(linha[i]?.ano),
    })),
    documentos: confirmados.map((d) => ({
      pessoa: `Linha ${sobrenome}`,
      tipo: limparCopy(d.item),
      local: limparLista([caso.pais, "Brasil"]).join(" · "),
      observacao: OBS_DOC[d.status] ?? OBS_DOC.parcial,
    })),
    quantidadeRegistros: confirmados.length ? String(confirmados.length) : "",
    lacunas: limparLista(pendentes.map((d) => d.item)),
    pontosConfirmar: limparLista(emConferencia.map((d) => d.item)),
    proximaEtapa:
      caso.viaSugerida === "judicial"
        ? {
            titulo: "Próximo passo recomendado",
            resumo:
              `Com a primeira leitura organizada, a família ${sobrenome} já tem um ponto de partida seguro. ` +
              "Pela distância geracional até o ascendente italiano, a hipótese mais provável é a via judicial: o passo seguinte é a assessoria completa de cidadania italiana, começando pela organização documental, com coordenação de retificações, traduções e apostilamentos, intermediação com advogado parceiro na Itália e acompanhamento do processo até a sentença.",
            possibilidades: POSSIBILIDADES_VIA_JUDICIAL,
            ctaPrimaria: "Quero saber mais sobre a assessoria completa",
          }
        : {
            titulo: "Próximo passo recomendado",
            resumo:
              `Com a primeira leitura organizada, a família ${sobrenome} já tem um ponto de partida seguro. ` +
              "O passo seguinte é uma análise de estratégia e documentação: aprofundar as gerações, esclarecer os pontos em aberto e definir, com calma, o melhor caminho a percorrer.",
            possibilidades: POSSIBILIDADES_APROFUNDAMENTO,
          },
    meta: {
      etapaAtual: "Diagnóstico inicial · primeira leitura da história familiar",
      ultimaAtualizacao: primeiroOuMensagem(
        [ultimoRegistro, caso.dataInicio],
        "Atualizado nesta semana",
      ),
      status: "em_elaboracao",
      versao: "v1",
      responsavel: "Consultoria Clube Ancestral",
      proximaRevisao: "A combinar com a sua consultoria",
    },
    entregas: [
      {
        id: `${caso.id}-rel-essencial`,
        titulo: "Diagnóstico inicial da sua família",
        data: primeiroOuMensagem([ultimoRegistro, caso.dataInicio], "Em andamento"),
        etapa: "Diagnóstico inicial",
        status: "em_elaboracao",
        descricao:
          "Primeira leitura da história familiar: linha principal, registros e pontos em aberto.",
        abreRelatorio: true,
      },
    ],
  };
}

/** Ajustes editoriais por caso — apenas dados confirmados pela consultoria. */
export const RELATORIOS: Record<string, Partial<RelatorioVisual>> = {
  "CA-CID-IT-2026-001": {
    sobrenomeFamilia: "Prade",
    pessoaFoco: "Giovanna da Veiga Prade",
    ancestralMaisAntigo: "Paolo Prade — em validação documental",
    numeroGeracoes: "5",
    localidadesPrincipais: "Rodeio e Timbó (SC) · Itália (origem em validação)",
    linhaPrincipal: [
      { nome: "Paolo Prade", eventos: "Geração anterior — em validação documental" },
      { nome: "Alessandro Prade", eventos: "1874 — 1926" },
      {
        nome: "Erwin Prade",
        eventos: "1917 — 1969 · também registrado como Ervino Prade e Erwin Prada",
      },
      { nome: "Péricles Luiz Medeiros Prade", eventos: "Em atualização documental" },
      { nome: "Giovanna da Veiga Prade", eventos: "Pessoa-foco do processo" },
    ],
    documentos: [
      {
        pessoa: "Erwin Prade",
        tipo: "Referência genealógica localizada",
        local: "Rodeio (SC)",
        observacao: "Referência de pesquisa — validação por documento oficial em andamento.",
      },
      {
        pessoa: "Alessandro Prade",
        tipo: "Referência genealógica localizada",
        local: "Em validação documental",
        observacao: "Referência de pesquisa — origem ainda não confirmada por documento.",
      },
      {
        pessoa: "Margherita Maiocchi",
        tipo: "Referência genealógica localizada",
        local: "Em validação documental",
        observacao: "Referência de pesquisa — validação por documento oficial em andamento.",
      },
    ],
    quantidadeRegistros: "3",
    lacunas: [
      "Certidões brasileiras da cadeia Alessandro → Erwin → Péricles → Giovanna",
      "Ato de nascimento italiano de Alessandro Prade",
      "Verificação de eventual registro na Comune ou no Consulado",
    ],
    pontosConfirmar: [
      "Grafias do nome do avô (Erwin, Ervino, Erwin Prada)",
      "Município de nascimento de Giovanna",
      "Geração anterior a Alessandro (Paolo Prade)",
    ],
    meta: {
      etapaAtual: "Diagnóstico inicial · leitura da linha paterna Prade",
      ultimaAtualizacao: "10 de agosto de 2026",
      status: "em_elaboracao",
      versao: "v1",
      responsavel: "Consultoria Clube Ancestral",
      proximaRevisao: "A combinar com a sua consultoria",
    },
    entregas: [
      {
        id: "CA-CID-IT-2026-001-rel-essencial",
        titulo: "Diagnóstico inicial da sua família",
        data: "10 de agosto de 2026",
        etapa: "Diagnóstico inicial",
        status: "em_elaboracao",
        descricao:
          "Primeira leitura da linha paterna Prade: pessoas conectadas, referências e pontos em aberto.",
        abreRelatorio: true,
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
