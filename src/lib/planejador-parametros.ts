/**
 * LEGADO — dump homologado do Planejador Universal (cadastro de partes e
 * convenção de ID — planilha / src/data/casos.ts).
 *
 * NÃO é a fonte da operação ativa. O planejador operacional vivo é `case_plans`
 * via `salvarPlanejadorOperacional`. Este módulo só preenche parâmetro contratual
 * VAZIO (nunca sobrescreve valor já persistido) e não dirige status, prioridade,
 * próxima ação, tarefa ou dashboard.
 *
 * O parâmetro FINANCEIRO (parcelas/despesas externas) não lê mais o lookup
 * estático `PARAMETROS` de `src/data/casos.ts` (2026-09-26, P22 — decisão
 * explícita da Proprietária: "o ideal é deixar tudo remetendo aos dados
 * atuais"). Quem chama esta função resolve a referência financeira contra
 * dado vivo (`referenciaFinanceiraDoCaso`, `financeiro-referencia.server.ts`
 * — condição comercial do caso ou referência resgatada do país) e passa o
 * resultado já pronto — este módulo permanece puro, sem acesso a banco.
 */

import { paramsDaReferenciaFinanceira, type ReferenciaFinanceira } from "@/lib/financeiro-referencia";

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
      documentos: "",
      estadoCivil: "Casada",
      endereco: "",
      contato: "",
    },
    beneficiarios: [
      {
        nome: "Adair Pinto Silveira Júnior",
        papel: "Beneficiário do mesmo núcleo familiar",
        documentos: "",
        estadoCivil: "Casado",
        endereco: "",
        contato: "",
      },
      {
        nome: "Alice Gomes Silveira",
        papel: "Beneficiária do mesmo núcleo familiar",
        documentos: "",
        estadoCivil: "Solteira",
                endereco: "",
        contato: "",
      },
    ],
    observacoes: [
      "Sem alteração de nome de qualquer titular: os nomes seguem exatamente como registrados no Planejador.",
      "Todos os beneficiários são maiores de idade — não há representação legal de menores.",
      "Documento de identificação de Alice Gomes Silveira ainda não informado: pendência de coleta, nada inventado.",
      "03/10/2026 — PII migrada para a Pessoa 360 (`clientes`) com autorização da Proprietária e auditoria (`pii_migrada_do_planejador_para_pessoa_360`). CPF, RG, endereço, contato e nascimento saíram deste arquivo: a fonte agora é a Pessoa 360, e este cadastro guarda só nome, papel e as decisões do Planejador.",
      "Divergência declarada, não resolvida por mim: o telefone da contratante estava gravado na Pessoa 360 com um dígito a menos que o deste arquivo (celular sem o 9). A regra é preencher vazio e nunca sobrescrever divergente — o valor da Pessoa 360 foi mantido e a escolha é humana. O número não se repete aqui: a fonte é a Pessoa 360.",
      "Número do logradouro não consta no Planejador (endereço por quadra/lote). Ficou nulo na Pessoa 360 em vez de ser inventado como S/N.",
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

export type LinhaCatalogoSku = {
  code?: string | null;
  nome_comercial?: string | null;
  ativo?: boolean | null;
  archived_at?: string | null;
  status_homologacao?: string | null;
};

/**
 * Confirma o SKU da convenção contra linhas já lidas de `product_catalog`.
 * Sem linha ativa e homologada, devolve null — nunca inventa SKU.
 */
export function skuVivoDoCatalogo(
  linhas: LinhaCatalogoSku[] | null | undefined,
  skuEsperado?: string | null,
): SkuHomologadoAtivo | null {
  if (!skuEsperado) return null;
  const hit = (linhas ?? []).find(
    (l) =>
      l.code === skuEsperado &&
      l.ativo === true &&
      !l.archived_at &&
      l.status_homologacao === "homologado" &&
      Boolean(String(l.nome_comercial ?? "").trim()),
  );
  if (!hit?.code || !hit.nome_comercial) return null;
  return { code: hit.code, nome_comercial: hit.nome_comercial };
}

/**
 * Parâmetros homologados do Planejador para o caso, derivados da convenção
 * de ID. SKU só entra quando `skuHomologado` confirma o código no catálogo.
 */
export function parametrosDoPlanejador(
  codigoCaso?: string | null,
  skuHomologado?: SkuHomologadoAtivo | null,
  referenciaFinanceira?: ReferenciaFinanceira,
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

  // Parâmetro financeiro: dado vivo (condição do caso ou referência do
  // país), resolvido pelo chamador. Sem nenhuma das duas fontes, não
  // fabrica nada — fica pendência, como sempre foi.
  parametros.push(...paramsDaReferenciaFinanceira(referenciaFinanceira ?? null, detalhe));


  return { convencao, versao: PLANEJADOR_VERSAO, homologadoEm: PLANEJADOR_HOMOLOGADO_EM, parametros };
}
