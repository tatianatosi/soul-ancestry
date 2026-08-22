/**
 * Renderização documental somente-leitura das instâncias dos Anexos I–V.
 *
 * Regras:
 *  - campo sem fonte rastreável é exibido como pendência, nunca preenchido por inferência;
 *  - texto institucional (política de despesas, observações) é fixo e versionado;
 *  - a instância é sempre marcada como rascunho interno enquanto houver pendência;
 *  - nada aqui cria despesa, cobrança, pesquisa externa, procuração ou assinatura.
 */

import {
  CLAUSULA_DESPESAS_TERCEIROS,
  MARCA_RASCUNHO,
  POLITICAS_DESPESA,
  ROTULO_POLITICA_DESPESA,
  ROTULO_ESTADO_DESPESA,
  type AnexoGovernado,
  type EntradaAnexosIaV,
} from "@/lib/anexos-i-v";

export type LinhaDocumento = { rotulo: string; valor: string | null; pendente?: string };

export type SecaoDocumento =
  | { tipo: "campos"; titulo?: string; linhas: LinhaDocumento[] }
  | { tipo: "texto"; titulo?: string; texto: string }
  | { tipo: "lista"; titulo?: string; itens: string[]; vazio?: string }
  | { tipo: "opcoes"; titulo?: string; opcoes: { rotulo: string; marcada: boolean }[] }
  | { tipo: "tabela"; titulo?: string; colunas: string[]; linhas: (string | null)[][]; vazio?: string };

export type DocumentoAnexo = {
  codigo: string;
  titulo: string;
  aplicavel: boolean;
  marca: string | null;
  secoes: SecaoDocumento[];
};

const PENDENTE = "Pendente — sem fonte rastreável.";

function campo(rotulo: string, valor: string | null | undefined, pendente = PENDENTE): LinhaDocumento {
  return { rotulo, valor: valor ?? null, pendente };
}

function docBase(anexo: AnexoGovernado, secoes: SecaoDocumento[]): DocumentoAnexo {
  return {
    codigo: anexo.codigo,
    titulo: anexo.titulo,
    aplicavel: anexo.aplicavel,
    marca: anexo.pendencias.length || !anexo.aplicavel ? MARCA_RASCUNHO : MARCA_RASCUNHO,
    secoes,
  };
}

function documentoAnexoI(anexo: AnexoGovernado, e: EntradaAnexosIaV): DocumentoAnexo {
  const p = anexo.pendencias.length === 0 || anexo.aplicavel ? e.proposta : null;
  const propostaValida = p && p.caseId === e.caseId ? p : null;
  const precoRenderizavel = anexo.campos.find((c) => c.rotulo.toLowerCase().includes("valor contratado"))?.valor ?? null;

  return docBase(anexo, [
    {
      tipo: "campos",
      linhas: [
        campo("Contrato-Base (versão/data)", e.contratoBaseVersao),
        campo("Código do caso", e.caseId),
        campo("Cliente", e.clienteNome),
        campo("CPF", null, "Renderizado somente quando exigido e autorizado."),
        campo("Produto/SKU", propostaValida?.produtoSku),
        campo("Produto contratado", propostaValida?.produtoNome),
        campo("Data de contratação", e.dataContratacao),
        campo("Responsável Clube Ancestral", e.responsavel),
      ],
    },
    {
      tipo: "lista",
      titulo: "1. Escopo contratado",
      itens: [
        ...(propostaValida?.servicosIncluidos ?? []).map((s) => `Incluído: ${s}`),
        ...(propostaValida?.servicosExcluidos ?? []).map((s) => `Excluído: ${s}`),
      ],
      vazio:
        propostaValida?.servicosExcluidos === null
          ? "Exclusões não especificadas na proposta/OS — revisão humana necessária. Nenhuma redação foi criada."
          : "Escopo não derivado de proposta/OS aprovada do mesmo caso.",
    },
    {
      tipo: "campos",
      titulo: "2. Objetivo da etapa inicial",
      linhas: [campo("Objetivo formal da fase contratada", propostaValida?.objetivoEtapa ?? null)],
    },
    {
      tipo: "lista",
      titulo: "3. Entregáveis",
      itens: propostaValida?.entregaveis ?? [],
      vazio: "Entregáveis não derivados da proposta/OS.",
    },
    {
      tipo: "campos",
      titulo: "4. Investimento e pagamento",
      linhas: [
        campo("Modalidade escolhida", propostaValida?.modalidade),
        campo("Valor contratado", precoRenderizavel, "Preço só de fonte comercial homologada — nunca de template, WhatsApp ou valor livre."),
        campo("Forma de pagamento", propostaValida?.formaPagamento),
        campo("Parcelas/recorrência", propostaValida?.parcelas),
        campo("Primeiro vencimento", propostaValida?.primeiroVencimento, "Vencimento não é inferido pelo número de parcelas."),
        campo("Próximo vencimento", propostaValida?.proximoVencimento, "Vencimento não é inferido pelo número de parcelas."),
      ],
    },
    {
      tipo: "lista",
      titulo: "5. Condições específicas",
      itens: propostaValida?.condicoesEspecificas ?? [],
      vazio: "Condições específicas não declaradas em fonte válida.",
    },
    {
      tipo: "texto",
      titulo: "6. Aceite",
      texto: "A Cliente declara ter lido e aceitado o Contrato-Base e esta Ordem de Serviço.",
    },
    {
      tipo: "campos",
      linhas: [
        campo("Cliente", e.clienteNome),
        campo("Data", null, "Registrada apenas no aceite."),
        campo("Assinatura eletrônica", null, "Nenhuma assinatura registrada — envio para assinatura não executado."),
      ],
    },
  ]);
}

function documentoAnexoII(anexo: AnexoGovernado, e: EntradaAnexosIaV): DocumentoAnexo {
  return docBase(anexo, [
    {
      tipo: "campos",
      linhas: [campo("Caso", e.caseId), campo("Cliente", e.clienteNome), campo("Data de emissão", null, "Emitida apenas por evento de governança.")],
    },
    {
      tipo: "opcoes",
      titulo: "Política aplicável",
      opcoes: POLITICAS_DESPESA.map((p) => ({ rotulo: ROTULO_POLITICA_DESPESA[p], marcada: e.politicaDespesas === p })),
    },
    {
      tipo: "tabela",
      colunas: ["Item", "Finalidade", "Estimativa", "Valor real", "Situação", "Aprovação"],
      linhas: e.despesas.map((d) => [
        d.item,
        d.finalidade ?? null,
        d.estimativa ?? null,
        d.valorReal ?? null,
        ROTULO_ESTADO_DESPESA[d.estado] ?? d.estado,
        d.aprovacaoRegistrada ? "Aprovação registrada" : null,
      ]),
      vazio: "Nenhuma despesa externa registrada. Nada foi cobrado, pago ou antecipado.",
    },
    {
      tipo: "texto",
      titulo: "Regra de ajuste",
      texto:
        "Caso o valor real supere materialmente a estimativa, surja uma despesa não prevista ou seja necessário serviço adicional, o Clube Ancestral solicitará aprovação da Cliente antes de assumir o novo custo, salvo urgência previamente autorizada.",
    },
    {
      tipo: "lista",
      titulo: "Adiantamento excepcional",
      itens: ["fornecedor ou órgão", "finalidade", "teto de valor", "comprovante", "prazo e forma de reembolso", "aceite específico da Cliente"],
    },
    { tipo: "texto", titulo: "Política institucional padrão", texto: CLAUSULA_DESPESAS_TERCEIROS },
    {
      tipo: "texto",
      titulo: "Classificação financeira",
      texto: "Despesa de terceiro não é receita, custo próprio, desembolso, reembolso, caixa nem cobrança padrão do Clube Ancestral.",
    },
  ]);
}

function documentoAnexoIII(anexo: AnexoGovernado, e: EntradaAnexosIaV): DocumentoAnexo {
  const a = e.autorizacaoPesquisa;
  return docBase(anexo, [
    {
      tipo: "campos",
      linhas: [
        campo("Caso", e.caseId),
        campo("Cliente", e.clienteNome),
        campo("Finalidade", a?.finalidade),
        campo("Órgão/entidade", a?.orgao),
        campo("Pessoa(s) relacionada(s)", a?.pessoas.join(", ") || null),
        campo("Documento(s) ou informação solicitada", a?.documentos.join(", ") || null),
        campo("Há custo externo estimado?", a?.temCustoExterno == null ? null : a.temCustoExterno ? "SIM" : "NÃO"),
        campo("Valor/teto autorizado", a?.tetoValor),
        campo("Prazo de uso da autorização", a?.prazoUso),
      ],
    },
    {
      tipo: "texto",
      texto:
        "A Cliente autoriza exclusivamente a realização da pesquisa acima descrita. Esta autorização não substitui procuração quando o órgão exigir instrumento próprio.",
    },
    {
      tipo: "campos",
      linhas: [
        campo("Cliente", e.clienteNome),
        campo("Data", null, "Registrada apenas no aceite específico."),
        campo("Assinatura/aceite", a?.aceiteRegistrado ? (a.aceiteEvidencia ?? null) : null, "Sem aceite específico rastreável — pesquisa externa bloqueada."),
      ],
    },
  ]);
}

function documentoAnexoIV(anexo: AnexoGovernado, e: EntradaAnexosIaV): DocumentoAnexo {
  const p = e.procuracao;
  return docBase(anexo, [
    {
      tipo: "campos",
      linhas: [
        campo("Caso", e.caseId),
        campo("Tipo", p?.tipo ? p.tipo.toUpperCase() : null),
        campo("Finalidade", p?.finalidade),
        campo("Órgão destinatário", p?.orgaoDestinatario),
        campo("Pessoas vinculadas", p?.pessoas.join(", ") || null),
        campo("Poderes necessários", p?.poderes.join(", ") || null, "Poderes nunca são inferidos."),
        campo("Status", (p?.status ?? "nao_iniciada").replaceAll("_", " ").toUpperCase()),
      ],
    },
    {
      tipo: "texto",
      titulo: "Observação",
      texto:
        "Esta procuração será preparada e assinada apenas quando a finalidade, o destinatário e os poderes necessários estiverem definidos e aprovados.",
    },
    {
      tipo: "texto",
      titulo: "Estado da execução",
      texto: "Nenhuma procuração real foi criada, enviada ou assinada por este motor.",
    },
  ]);
}

function documentoAnexoV(anexo: AnexoGovernado, e: EntradaAnexosIaV): DocumentoAnexo {
  const a = e.alteracaoEscopo;
  const rotuloImpacto: Record<string, string> = {
    sem_alteracao: "SEM ALTERAÇÃO",
    novo_prazo_estimado: "NOVO PRAZO ESTIMADO",
    novo_valor: "NOVO VALOR",
    despesa_externa_a_aprovar: "DESPESA EXTERNA A APROVAR",
  };
  return docBase(anexo, [
    {
      tipo: "campos",
      linhas: [campo("Caso", e.caseId), campo("Cliente", e.clienteNome), campo("Data", null, "Registrada apenas no aceite.")],
    },
    { tipo: "campos", titulo: "Escopo original", linhas: [campo("Snapshot da proposta/OS/Anexo I vigente", a?.escopoOriginalSnapshot)] },
    { tipo: "campos", titulo: "Alteração solicitada ou identificada", linhas: [campo("Descrição", a?.alteracao)] },
    { tipo: "campos", titulo: "Motivo", linhas: [campo("Motivo", a?.motivo)] },
    {
      tipo: "campos",
      titulo: "Impactos",
      linhas: [
        campo("Impacto em prazo", a?.impactoPrazo ? (rotuloImpacto[a.impactoPrazo] ?? a.impactoPrazo) : null, "Valor controlado — não é texto livre."),
        campo(
          "Impacto financeiro",
          a?.impactoFinanceiro ? (rotuloImpacto[a.impactoFinanceiro] ?? a.impactoFinanceiro) : null,
          "Valor controlado — novo valor só de SKU/preço homologado ou exceção autorizada.",
        ),
      ],
    },
    { tipo: "texto", texto: "A alteração só terá efeito após aceite da Cliente." },
    {
      tipo: "campos",
      linhas: [
        campo("Cliente", e.clienteNome),
        campo("Data", null, "Registrada apenas no aceite."),
        campo("Assinatura/aceite", a?.aceiteRegistrado ? "Aceite registrado" : null, "Sem aceite, a alteração não entra no escopo vigente."),
      ],
    },
  ]);
}

const RENDERIZADORES: Record<string, (a: AnexoGovernado, e: EntradaAnexosIaV) => DocumentoAnexo> = {
  ANEXO_I_ORDEM_SERVICO: documentoAnexoI,
  ANEXO_II_DESPESAS_EXTERNAS: documentoAnexoII,
  ANEXO_III_AUTORIZACAO_PESQUISA: documentoAnexoIII,
  ANEXO_IV_PROCURACAO: documentoAnexoIV,
  ANEXO_V_ALTERACAO_ESCOPO: documentoAnexoV,
};

export function documentoDoAnexo(anexo: AnexoGovernado, entrada: EntradaAnexosIaV): DocumentoAnexo | null {
  const fn = RENDERIZADORES[anexo.codigo];
  return fn ? fn(anexo, entrada) : null;
}

export function documentosDosAnexos(anexos: AnexoGovernado[], entrada: EntradaAnexosIaV): DocumentoAnexo[] {
  return anexos.map((a) => documentoDoAnexo(a, entrada)).filter((d): d is DocumentoAnexo => Boolean(d));
}

/** Nenhuma renderização documental pode acionar efeito externo. */
export function efeitosExternosDoDocumento(): [] {
  return [];
}
