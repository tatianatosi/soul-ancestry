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
    sku: "CA-CID-AT-001",
    skuNome: "Cidadania austríaca — atendimento familiar (§ 58c StbG)",
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

/**
 * Cadastro de partes homologado no Planejador Universal por caso.
 * Só entra na ficha contratual quando o código do caso está registrado aqui.
 * Nada é inferido: nomes, documentos, endereços e contatos são exatamente os
 * informados no Planejador, sem alteração de nome de qualquer titular.
 */
type PessoaPlanejador = {
  nome: string;
  papel: string;
  documentos: string;
  estadoCivil: string;
  nascimento?: string;
  endereco: string;
  contato: string;
};

type CadastroPlanejador = {
  codigos: string[];
  contratante: PessoaPlanejador;
  beneficiarios: PessoaPlanejador[];
  observacoes: string[];
};

export const CADASTRO_PLANEJADOR: CadastroPlanejador[] = [
  {
    codigos: ["CA-CID-AT-FAM-2026-001", "CA-2026-ANA-001"],
    contratante: {
      nome: "Ana Luiza Gomes Silveira Rodrigues",
      papel: "Requerente principal / contratante",
      documentos: "CPF 037.795.711-96 · RG 5163875 SSP/GO",
      estadoCivil: "Casada",
      endereco: "Rua N 24, Qd. 21, Lt. 21 — Anápolis City, Anápolis/GO, CEP 75094-290",
      contato: "analuizabox@gmail.com · (62) 98158-4015",
    },
    beneficiarios: [
      {
        nome: "Adair Pinto Silveira Júnior",
        papel: "Beneficiário do mesmo núcleo familiar",
        documentos: "CPF 774.227.321-72 · RG 3184582 SSP/GO",
        estadoCivil: "Casado",
        endereco: "Rua N 24, Qd. 21, Lt. 20 — Anápolis City, Anápolis/GO",
        contato: "adair@apsrepresentacoes.com.br · (62) 99134-5298",
      },
      {
        nome: "Alice Gomes Silveira",
        papel: "Beneficiária do mesmo núcleo familiar",
        documentos: "",
        estadoCivil: "Solteira",
        nascimento: "18/03/2006",
        endereco: "Rua N 24, Qd. 21, Lt. 20 — Anápolis City, Anápolis/GO",
        contato: "alicegomessilveira@gmail.com · (62) 99951-5298",
      },
    ],
    observacoes: [
      "Sem alteração de nome de qualquer titular: os nomes seguem exatamente como registrados no Planejador.",
      "Todos os beneficiários são maiores de idade — não há representação legal de menores.",
      "Documento de identificação de Alice Gomes Silveira ainda não informado no Planejador: pendência de coleta.",
    ],
  },
];

function pessoaTexto(p: PessoaPlanejador) {
  const partes = [
    p.nome,
    p.papel,
    p.documentos || null,
    `Estado civil: ${p.estadoCivil}`,
    p.nascimento ? `Nascimento: ${p.nascimento}` : null,
    p.endereco,
    p.contato,
  ].filter(Boolean);
  return partes.join(" · ");
}

export function cadastroDoCodigo(codigo?: string | null): CadastroPlanejador | null {
  const ref = String(codigo ?? "").trim().toUpperCase();
  if (!ref) return null;
  return CADASTRO_PLANEJADOR.find((c) => c.codigos.includes(ref)) ?? null;
}



export function convencaoDoCodigo(codigo?: string | null): ConvencaoPlanejador | null {
  const ref = String(codigo ?? "").toUpperCase();
  return CONVENCOES_PLANEJADOR.find((c) => ref.startsWith(c.prefixo)) ?? null;
}

/**
 * SKU homologado e ativo em `product_catalog`, resolvido pelo chamador.
 * Este módulo permanece puro: só decide COMO usar o resultado (PR #68 / P7).
 * Sem confirmação no catálogo, `produto_sku` fica pendente — nunca herda
 * o nome estático da convenção como se fosse catálogo vivo.
 */
export type SkuHomologadoAtivo = { code: string; nome_comercial: string };

/**
 * Parâmetros homologados do Planejador para o caso, derivados da convenção
 * de ID. SKU só entra quando `skuHomologado` confirma o código no catálogo.
 */
export function parametrosDoPlanejador(
  codigoCaso?: string | null,
  skuHomologado?: SkuHomologadoAtivo | null,
): {
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
    { campo: "objeto_contrato", valor: convencao.descricao, detalhe },
    {
      campo: "escopo_resumo",
      valor: `${convencao.descricao}. Percurso homologado: ${convencao.etapas.join(" · ")}.`,
      detalhe,
    },
    { campo: "fases_entregas", valor: convencao.etapas.join(" · "), detalhe },
    { campo: "servicos_incluidos", valor: convencao.etapas.join(" · "), detalhe },
    { campo: "revisor_responsavel", valor: convencao.responsavel, detalhe },
  ];

  // SKU: se o chamador confirmou `product_catalog`, usa o nome vivo.
  // `null` = consultou e não achou (pendência). `undefined` = ainda não
  // consultou — mantém o nome da convenção para não esvaziar a pré-carga
  // de contrato enquanto a fiação de #68 em contrato-parametros espera.
  if (convencao.sku && skuHomologado && skuHomologado.code === convencao.sku) {
    parametros.unshift({
      campo: "produto_sku",
      valor: `${skuHomologado.code} — ${skuHomologado.nome_comercial}`,
      detalhe: `${detalhe} · SKU confirmado ativo em product_catalog`,
    });
  } else if (convencao.sku && convencao.skuNome && skuHomologado === undefined) {
    parametros.unshift({ campo: "produto_sku", valor: `${convencao.sku} — ${convencao.skuNome}`, detalhe });
  }

  // Cadastro de partes homologado no Planejador para este caso específico.
  const cadastro = cadastroDoCodigo(codigoCaso);
  if (cadastro) {
    const detalheCadastro = `${detalhe} · cadastro de partes homologado no Planejador`;
    const c = cadastro.contratante;
    parametros.push(
      { campo: "contratante_nome", valor: c.nome, detalhe: detalheCadastro },
      { campo: "contratante_documento", valor: `${c.documentos} · Estado civil: ${c.estadoCivil}`, detalhe: detalheCadastro },
      { campo: "contratante_endereco", valor: c.endereco, detalhe: detalheCadastro },
      { campo: "contratante_contato", valor: c.contato, detalhe: detalheCadastro },
      {
        campo: "beneficiarios",
        valor: [pessoaTexto(c), ...cadastro.beneficiarios.map(pessoaTexto)].join(" || "),
        detalhe: detalheCadastro,
      },
      {
        campo: "partes_signatarias",
        valor: [c, ...cadastro.beneficiarios].map((p) => `${p.nome} (${p.papel})`).join(" · "),
        detalhe: detalheCadastro,
      },
      { campo: "representacao_legal", valor: cadastro.observacoes.join(" · "), detalhe: detalheCadastro },
    );
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
