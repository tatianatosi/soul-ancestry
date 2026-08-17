/**
 * Planejador Universal como FONTE CANÔNICA de parâmetros.
 *
 * Não é lacuna nem fonte descartada: os parâmetros aqui registrados foram
 * homologados no Planejador Universal (planejador-universal-simulador-todas-cidadanias)
 * e entram na ficha contratual com origem `planejador`, a maior confiança do motor.
 *
 * Regras:
 * - Nada é inferido: só há parâmetro quando a convenção de ID do caso está
 *   explicitamente registrada abaixo.
 * - Origem, versão e data de homologação são preservadas e rastreáveis.
 * - Fonte menor (WhatsApp, transcrição, relato, DEMO) nunca sobrescreve.
 */

import { PARAMETROS } from "@/data/casos";

export const PLANEJADOR_VERSAO = "planejador-universal-v2026.08";
export const PLANEJADOR_HOMOLOGADO_EM = "2026-08-14";

export type ParamPlanejador = {
  campo: string;
  valor: string;
  detalhe: string;
};

type ConvencaoPlanejador = {
  prefixo: string;
  descricao: string;
  tipoProcesso: string;
  pais: string;
  rota: string;
  estruturaFamiliar: string;
  sku: string | null;
  skuNome: string | null;
  etapas: string[];
  gates: string[];
  responsavel: string;
  checklists: string[];
};

/** Convenções de ID homologadas no Planejador Universal. */
export const CONVENCOES_PLANEJADOR: ConvencaoPlanejador[] = [
  {
    prefixo: "CA-CID-AT-FAM",
    descricao: "Cidadania austríaca — atendimento familiar compartilhado",
    tipoProcesso: "Cidadania Austríaca",
    pais: "Áustria",
    rota: "Administrativa — reparação histórica (§ 58c StbG)",
    estruturaFamiliar: "Núcleo familiar compartilhado (requerente principal + beneficiários do mesmo ancestral)",
    sku: null,
    skuNome: null,
    etapas: [
      "1. Diagnóstico e checklist inicial",
      "2. Pesquisa genealógica e coleta documental",
      "3. Conferência e retificações",
      "4. Montagem do dossiê familiar",
      "5. Protocolo e acompanhamento",
    ],
    gates: [
      "Contrato assinado antes de cobrança e pesquisa externa",
      "Consentimento registrado por titular",
      "Conferência documental aprovada antes do protocolo",
    ],
    responsavel: "Desk de operações — responsável designado no Planejador",
    checklists: [
      "Checklist documental do requerente e beneficiários",
      "Checklist de certidões do ancestral de referência",
      "Checklist de conferência final do dossiê",
    ],
  },
];


export function convencaoDoCodigo(codigo?: string | null): ConvencaoPlanejador | null {
  const ref = String(codigo ?? "").toUpperCase();
  return CONVENCOES_PLANEJADOR.find((c) => ref.startsWith(c.prefixo)) ?? null;
}

/**
 * Parâmetros homologados do Planejador para o caso, derivados exclusivamente
 * da convenção de ID registrada. Sem convenção registrada, retorna lista vazia.
 */
export function parametrosDoPlanejador(codigoCaso?: string | null): {
  convencao: ConvencaoPlanejador | null;
  versao: string;
  homologadoEm: string;
  parametros: ParamPlanejador[];
} {
  const convencao = convencaoDoCodigo(codigoCaso);
  if (!convencao) {
    return { convencao: null, versao: PLANEJADOR_VERSAO, homologadoEm: PLANEJADOR_HOMOLOGADO_EM, parametros: [] };
  }

  const financeiro = PARAMETROS[convencao.tipoProcesso];
  const detalhe = `Planejador Universal ${PLANEJADOR_VERSAO} · homologado em ${PLANEJADOR_HOMOLOGADO_EM} · convenção ${convencao.prefixo}`;

  const parametros: ParamPlanejador[] = [
    { campo: "pais_rota", valor: `${convencao.pais} / ${convencao.rota}`, detalhe },
    { campo: "vinculo_familiar", valor: convencao.estruturaFamiliar, detalhe },
    { campo: "fases_entregas", valor: convencao.etapas.join(" · "), detalhe },
    { campo: "servicos_incluidos", valor: convencao.etapas.join(" · "), detalhe },
    { campo: "revisor_responsavel", valor: convencao.responsavel, detalhe },
  ];

  // SKU só entra quando há SKU homologado para a rota da convenção.
  // Sem SKU homologado, o campo permanece vazio (pendência), nunca herda SKU de outra cidadania.
  if (convencao.sku && convencao.skuNome) {
    parametros.unshift({ campo: "produto_sku", valor: `${convencao.sku} — ${convencao.skuNome}`, detalhe });
  }

  // Parâmetro financeiro zerado no Planejador = "preencher manualmente": não é valor homologado.
  if (financeiro && (financeiro.despesas > 0 || financeiro.taxas > 0 || financeiro.honorarios > 0)) {
    parametros.push({
      campo: "parcelas",
      valor: `${financeiro.parcelas}x`,
      detalhe: `${detalhe} · parâmetro financeiro homologado`,
    });
    parametros.push({
      campo: "despesas_externas",
      valor: `Despesas previstas BRL ${financeiro.despesas} · taxas previstas BRL ${financeiro.taxas} (reembolsáveis conforme comprovação)`,
      detalhe: `${detalhe} · parâmetro financeiro homologado`,
    });
  }


  return { convencao, versao: PLANEJADOR_VERSAO, homologadoEm: PLANEJADOR_HOMOLOGADO_EM, parametros };
}
