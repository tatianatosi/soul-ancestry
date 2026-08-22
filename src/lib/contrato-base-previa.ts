/**
 * Prévia TESTE do contrato-base consolidado v1.0.
 *
 * Dados fictícios, marcados como TESTE, sem qualquer vínculo com caso real,
 * cliente, proposta, cobrança ou assinatura. Serve exclusivamente para
 * comprovar renderização das cláusulas fixas, das variáveis com origem e
 * estado, dos anexos derivados e dos bloqueios explicáveis.
 */

import { dicionarioAnexos, type RegraAnexo } from "@/lib/anexos-dicionario";
import { CLAUSULA_DESPESAS_TERCEIROS } from "@/lib/despesas-terceiros";
import {
  avaliarMatrizClausulas,
  estruturaContratoFamiliar,
  previaFinalLiberada,
  type MembroFamiliar,
} from "@/lib/matriz-clausulas";
import { CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import { avaliarCriteriosAceite, blocosRenderizados, type BlocoRenderizado } from "@/lib/matriz-aceite";
import {
  anexosIaV,
  conflitoDeFonte,
  gatesBloqueados,
  pendenciasDosAnexos,
  type ConflitoFonte,
  type EntradaAnexosIaV,
} from "@/lib/anexos-i-v";


export const MARCA_PREVIA_TESTE = "RASCUNHO INCOMPLETO — PRÉVIA TESTE, SEM DADOS REAIS";

export type OrigemParametro =
  | "planejador"
  | "proposta_os"
  | "crm_confirmado"
  | "documento_conferido"
  | "importado_a_confirmar"
  | "ausente";

export const ROTULO_ORIGEM: Record<OrigemParametro, string> = {
  planejador: "Planejador homologado",
  proposta_os: "Proposta/OS aprovada",
  crm_confirmado: "CRM/cadastro confirmado",
  documento_conferido: "Documento conferido",
  importado_a_confirmar: "Importado a confirmar",
  ausente: "Sem fonte válida",
};

export type EstadoParametro = "confirmado" | "a_confirmar" | "pendente" | "conflito";

export const ROTULO_ESTADO_PARAMETRO: Record<EstadoParametro, string> = {
  confirmado: "Confirmado",
  a_confirmar: "A confirmar",
  pendente: "Pendente",
  conflito: "Conflito de fonte",
};

export type VariavelPrevia = {
  campo: string;
  rotulo: string;
  grupo: string;
  valor: string | null;
  origem: OrigemParametro;
  estado: EstadoParametro;
  versaoFonte: string | null;
};

/** Núcleo fictício: dois adultos e um dependente menor, para exercitar as regras familiares. */
export const VARIAVEIS_TESTE: VariavelPrevia[] = [
  { campo: "perfil_institucional", rotulo: "Perfil institucional", grupo: "Contratada", valor: "PERFIL-INST-v1.0", origem: "planejador", estado: "confirmado", versaoFonte: "v1.0" },
  { campo: "partes_signatarias", rotulo: "Partes signatárias", grupo: "Partes", valor: "TESTE Requerente Um || TESTE Requerente Dois", origem: "crm_confirmado", estado: "confirmado", versaoFonte: null },
  { campo: "beneficiarios", rotulo: "Beneficiários", grupo: "Estrutura familiar", valor: "TESTE Requerente Um || TESTE Requerente Dois", origem: "planejador", estado: "confirmado", versaoFonte: null },
  { campo: "dependentes", rotulo: "Dependentes", grupo: "Estrutura familiar", valor: "TESTE Dependente Menor (TESTE Requerente Um)", origem: "planejador", estado: "confirmado", versaoFonte: null },
  { campo: "representacao_legal", rotulo: "Representação legal", grupo: "Estrutura familiar", valor: "TESTE Dependente Menor, menor, representado por TESTE Requerente Um para atos documentais.", origem: "documento_conferido", estado: "a_confirmar", versaoFonte: null },
  { campo: "produto_sku", rotulo: "Produto/SKU", grupo: "Objeto", valor: "SKU-TESTE-000 — modalidade de teste", origem: "proposta_os", estado: "a_confirmar", versaoFonte: null },
  { campo: "pais_rota", rotulo: "País/rota", grupo: "Objeto", valor: "País de teste", origem: "planejador", estado: "confirmado", versaoFonte: null },
  { campo: "escopo_resumo", rotulo: "Resumo de escopo", grupo: "Escopo", valor: "Escopo fictício de demonstração técnica da prévia.", origem: "proposta_os", estado: "a_confirmar", versaoFonte: null },
  { campo: "servicos_excluidos", rotulo: "Exclusões formais", grupo: "Escopo", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "valor_total", rotulo: "Valor total", grupo: "Comercial", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "forma_pagamento", rotulo: "Forma de pagamento", grupo: "Comercial", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "parcelas", rotulo: "Parcelas e vencimentos", grupo: "Comercial", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "despesas_externas", rotulo: "Despesas de terceiros", grupo: "Terceiros", valor: "Estimativa pendente", origem: "planejador", estado: "pendente", versaoFonte: null },
  { campo: "prazo_referencia", rotulo: "Prazo de referência", grupo: "Prazo", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "politica_privacidade", rotulo: "Política de dados", grupo: "Dados e consentimentos", valor: "Política vigente aplicável", origem: "planejador", estado: "a_confirmar", versaoFonte: null },
  { campo: "metodo_assinatura", rotulo: "Método de assinatura", grupo: "Assinatura", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
];

export type BloqueioPrevia = { titulo: string; motivo: string; rotaResolucao: string };

export function anexosDaPreviaTeste(): RegraAnexo[] {
  const v = (campo: string) => VARIAVEIS_TESTE.find((x) => x.campo === campo)?.valor ?? "";
  return dicionarioAnexos({
    produto: v("produto_sku"),
    paisRota: v("pais_rota"),
    beneficiarios: v("beneficiarios"),
    dependentes: v("dependentes"),
    representacaoLegal: v("representacao_legal"),
    valorTotal: v("valor_total"),
    formaPagamento: v("forma_pagamento"),
    parcelas: v("parcelas"),
    escopoResumo: v("escopo_resumo"),
  });
}

/** Bloqueios derivados dos parâmetros e anexos — cada um com rota de resolução. */
export function bloqueiosDaPreviaTeste(anexos = anexosDaPreviaTeste()): BloqueioPrevia[] {
  const bloqueios: BloqueioPrevia[] = [];

  for (const p of VARIAVEIS_TESTE.filter((x) => x.estado === "pendente")) {
    bloqueios.push({
      titulo: `Parâmetro pendente: ${p.rotulo}`,
      motivo: "Campo sem fonte válida. Regra do motor: campo ausente permanece pendente e nunca é preenchido por inferência.",
      rotaResolucao: "Ficha parametrizável do caso → grupo " + p.grupo,
    });
  }

  for (const a of anexos.filter((x) => x.obrigatorio && x.pendencias.length)) {
    bloqueios.push({
      titulo: `Anexo obrigatório pendente: ${a.codigo}`,
      motivo: a.pendencias.join(" "),
      rotaResolucao: "Ficha parametrizável do caso → anexos aplicáveis",
    });
  }

  bloqueios.push({
    titulo: "Revisão humana/jurídica pendente",
    motivo: "Contrato-base v1.0 está em under_legal_review: não é vigente e não pode ser assinado.",
    rotaResolucao: "Governança → Contrato-base consolidado → itens a validar juridicamente",
  });

  return bloqueios;
}

export function previaTesteAssinavel() {
  return false;
}

export const OBSERVACAO_TERCEIROS_PREVIA = CLAUSULA_DESPESAS_TERCEIROS;

/** Situação de cada linha da matriz de renderização nesta prévia TESTE. */
export type SituacaoRenderizacao = BlocoRenderizado;

export function matrizRenderizacaoPreviaTeste(anexos = anexosDaPreviaTeste()): SituacaoRenderizacao[] {
  const pendComercial = anexos.find((a) => a.codigo === "ANX-COMERCIAL");
  const pendentes: Record<string, string> = {};
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "valor_total")?.valor)
    pendentes["Comercial"] = "Condição comercial sem valor confirmado por fonte homologada.";
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "prazo_referencia")?.valor)
    pendentes["Prazo"] = "Prazo não formalizado — não pode ser inferido.";
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "metodo_assinatura")?.valor)
    pendentes["Assinatura"] = "Método de assinatura institucional ausente.";
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "servicos_excluidos")?.valor)
    pendentes["Inclusões e exclusões"] = "Exclusões não derivadas da proposta/OS aprovada.";
  if (pendComercial && !pendComercial.aplicavel)
    pendentes["Terceiros"] = "Exceção de despesa de terceiro exige aprovação registrada.";

  return blocosRenderizados(anexosIaVTeste(), pendentes);
}

/** Critérios de aceite demonstrados pela prévia interna de TESTE. */
export function criteriosAceiteTeste() {
  const blocos = matrizRenderizacaoPreviaTeste();
  const anexosGov = anexosIaVTeste();
  const familia = estruturaFamiliarTeste();
  const bloqueios = bloqueiosDaPreviaTeste();
  return avaliarCriteriosAceite({
    clausulasFixasRenderizadas: blocos.filter((b) => b.tipo === "fixo").every((b) => b.situacao !== "nao_aplicavel"),
    variaveisComFonteEstadoVersao: VARIAVEIS_TESTE.every((v) => Boolean(v.origem && v.estado)),
    anexosIaVAvaliados: anexosGov.length === 5,
    anexosFamiliaresConformes: familia.contratosParalelos === 0 && familia.signatarios.length > 0,
    rascunhosDoCaso: 1,
    snapshotsSomentePorEvento: true,
    bloqueiosComMotivoResponsavelRota: bloqueios.every((b) => Boolean(b.motivo && b.rotaResolucao)),
    nenhumaAcaoExternaExecutada: true,
  });
}

/* ---------------- Anexos I–V na prévia TESTE ---------------- */


/**
 * Entrada fictícia: proposta aprovada sem exclusões declaradas, despesa externa
 * estimada, autorização de pesquisa sem aceite, órgão que exige procuração e
 * alteração de escopo sem aceite. Exercita todos os bloqueios do motor.
 */
export const ENTRADA_TESTE_ANEXOS: EntradaAnexosIaV = {
  caseId: "CA-TESTE-000",
  clienteNome: "TESTE Requerente Um",
  responsavel: "TESTE Operações",
  dataContratacao: null,
  contratoBaseVersao: CONTRATO_BASE_VERSAO,
  modelo: "MODELO-ESTUDO",
  proposta: {
    id: "PROP-TESTE-000",
    caseId: "CA-TESTE-000",
    estado: "aprovada",
    versao: "v1",
    produtoSku: "SKU-TESTE-000",
    produtoNome: "Produto de teste",
    fontePreco: "planilha_mestre",
    valorContratado: "R$ 0,00 (teste)",
    modalidade: "Por etapas",
    formaPagamento: "Pix",
    parcelas: "3 etapas",
    primeiroVencimento: null,
    proximoVencimento: null,
    servicosIncluidos: ["Diagnóstico documental de teste"],
    servicosExcluidos: null,
    entregaveis: ["Relatório de teste"],
    objetivoEtapa: "Demonstração técnica do motor",
    limitesDependencias: ["Depende de documentos fictícios"],
  },
  politicaDespesas: "pagas_diretamente_pela_cliente",
  despesas: [
    {
      item: "Certidão (teste)",
      finalidade: "Comprovação fictícia",
      estimativa: "R$ 0,00",
      valorReal: null,
      estado: "estimativa_pendente",
      pagador: "cliente",
      aprovacaoRegistrada: false,
      comprovante: false,
      fonte: "planejador_homologado",
    },
  ],
  autorizacaoPesquisa: {
    finalidade: "Pesquisa fictícia de demonstração",
    orgao: "Arquivo de teste",
    pessoas: ["TESTE Requerente Um"],
    documentos: ["Certidão de teste"],
    temCustoExterno: true,
    tetoValor: null,
    prazoUso: null,
    aceiteRegistrado: false,
    aceiteEvidencia: null,
    orgaoExigeProcuracao: true,
    despesaVinculadaId: null,
  },
  procuracao: {
    exigidaPorOrgao: true,
    tipo: null,
    finalidade: null,
    orgaoDestinatario: "Arquivo de teste",
    pessoas: [],
    poderes: [],
    status: "nao_iniciada",
    revisaoJuridicaAprovada: false,
  },
  alteracaoEscopo: {
    solicitada: true,
    escopoOriginalSnapshot: "Escopo fictício de demonstração técnica da prévia.",
    alteracao: "Inclusão de linha colateral fictícia",
    motivo: "Demonstração do termo de alteração",
    impactoPrazo: "sem_alteracao",
    impactoFinanceiro: "novo_valor",
    novoValor: "R$ 0,00 (teste)",
    fonteNovoValor: "manual",
    aceiteRegistrado: false,
    aceiteEvidencia: null,
  },
};

export const CONFLITOS_TESTE: ConflitoFonte[] = [
  conflitoDeFonte({
    campo: "escopo_resumo",
    valorAtual: "Escopo fictício de demonstração técnica da prévia.",
    origemAtual: "planejador_homologado",
    valorConcorrente: "Escopo fictício alternativo informado por preenchimento humano.",
    origemConcorrente: "preenchimento_humano_confirmado",
    transicaoBloqueada: "previa_final",
  })!,
];

export function anexosIaVTeste() {
  return anexosIaV(ENTRADA_TESTE_ANEXOS);
}

export function pendenciasAnexosTeste() {
  return pendenciasDosAnexos(anexosIaVTeste());
}

export function gatesTeste() {
  return gatesBloqueados({
    anexos: anexosIaVTeste(),
    modelo: ENTRADA_TESTE_ANEXOS.modelo,
    perfilInstitucionalAtivo: false,
    metodoAssinaturaConfigurado: false,
    revisorHumanoAprovado: false,
    conflitos: CONFLITOS_TESTE,
  });
}

/* ---------------- Matriz de cláusulas A–P na prévia TESTE ---------------- */

export const MEMBROS_FAMILIARES_TESTE: MembroFamiliar[] = [
  { nome: "TESTE Requerente Um", maiorIdade: true, requerente: true, aplicavel: true },
  { nome: "TESTE Requerente Dois", maiorIdade: true, requerente: true, aplicavel: true },
  { nome: "TESTE Dependente Menor", maiorIdade: false, requerente: true, aplicavel: true, representacaoNecessaria: true },
];

export function matrizClausulasTeste() {
  return avaliarMatrizClausulas({
    modelo: ENTRADA_TESTE_ANEXOS.modelo,
    entradaAnexos: ENTRADA_TESTE_ANEXOS,
    anexos: anexosIaVTeste(),
    conflitos: CONFLITOS_TESTE,
    politicaPrivacidadeVigente: false,
    foroConfigurado: false,
    metodoAssinaturaConfigurado: false,
    revisaoJuridicaAprovada: false,
  });
}

export function previaFinalTeste() {
  return previaFinalLiberada({
    modelo: ENTRADA_TESTE_ANEXOS.modelo,
    linhas: matrizClausulasTeste(),
    bloqueiosGates: gatesTeste(),
  });
}

export function estruturaFamiliarTeste() {
  return estruturaContratoFamiliar(MEMBROS_FAMILIARES_TESTE);
}
