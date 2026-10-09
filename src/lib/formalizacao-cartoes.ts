/**
 * Formalização em cinco cartões (09/10/2026).
 *
 * Estrutura OPERACIONAL — não jurídica. O conteúdo contratual (Contrato de
 * Estudo Genealógico v2, cláusulas, anexos I–V) já foi revisado juridicamente
 * e não é reescrito aqui. Os cartões só ordenam o trabalho de preparar um
 * contrato concreto, com objetivo, checklist, responsável, estado, pendências
 * e evidência por cartão.
 *
 * Fonte única para as duas superfícies (`/golive/formalizacao` e a Formalização
 * do caso): ambas chamam `montarCartoesFormalizacao` com os mesmos fatos, então
 * não há segundo modelo, segundo checklist nem segunda regra de conferência.
 *
 * Estados do checklist: pendente · em andamento · concluído · não aplicável ·
 * bloqueado por pendência externa. Só `pendente`, `cumprido` e `nao_aplicavel`
 * são PERSISTIDOS (vocabulário já existente em `case_checklist_items`); "em
 * andamento" e "bloqueado por pendência externa" são derivados dos fatos e
 * nunca gravados — nenhum valor novo de CHECK.
 *
 * Regra de honestidade: fato ausente nunca vira "concluído" por marcação
 * manual. A marcação manual só existe para itens de conferência humana
 * (`manual: true`), e um item derivado de fato real ignora a persistência.
 */

import type { CoberturaDoModelo } from "@/lib/aprovacao-modelo";

export type EstadoItem = "pendente" | "em_andamento" | "concluido" | "nao_aplicavel" | "bloqueado_externo";

export const ROTULO_ESTADO_ITEM: Record<EstadoItem, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  nao_aplicavel: "Não aplicável",
  bloqueado_externo: "Bloqueado por pendência externa",
};

/** Subconjunto persistível (CHECK real de `case_checklist_items.status`). */
export type EstadoPersistido = "pendente" | "cumprido" | "nao_aplicavel";

export type RegistroPersistido = {
  status: EstadoPersistido;
  observacao: string | null;
  por: string | null;
  em: string | null;
};

export type CartaoId = "dados_partes" | "escopo_condicao" | "estudo_v2_anexos" | "conferencia" | "formalizacao";

export type ItemCartao = {
  /** Chave estável; é o `item_key` persistido (prefixo `form.`). */
  chave: string;
  rotulo: string;
  estado: EstadoItem;
  /** Por que está neste estado — texto específico, nunca genérico. */
  detalhe: string;
  /** Item de conferência humana, marcável e persistido. */
  manual: boolean;
  /** Pendência real (dado, representação, assinatura ou alteração fora do modelo). */
  pendencia: string | null;
  /** Referência de evidência persistida (rota, id, snapshot). */
  evidencia: string | null;
  persistido: RegistroPersistido | null;
};

export type Cartao = {
  id: CartaoId;
  ordem: number;
  titulo: string;
  objetivo: string;
  acaoPrincipal: string;
  /** Orçamento de tempo do cartão, em minutos (meta de desenho, não cronômetro). */
  minutosAlvo: number;
  responsavel: string;
  estado: EstadoItem;
  itens: ItemCartao[];
  pendencias: string[];
  evidencia: string | null;
  conclusao: string;
};

export type AnexoCartao = {
  codigo: string;
  rotulo: string;
  aplicavel: boolean;
  /** Justificativa de não aplicabilidade (do dicionário de regras). */
  justificativa: string;
  /** Pendência concreta quando aplicável e incompleto. */
  pendencia: string | null;
};

export type EntradaCartoes = {
  caseId: string;
  responsavelNome: string | null;
  partes: {
    pendencias: string[];
    papeisDefinidos: boolean;
    possuiMenor: boolean;
    representacaoRegistrada: boolean;
    contratadaQualificada: boolean;
  };
  escopo: {
    propostaAprovada: boolean;
    propostaReferencia: string | null;
    escopoPreenchido: boolean;
    servicosDefinidos: boolean;
    entregasDefinidas: boolean;
    valorTotal: number | null;
    pagamentoDefinido: boolean;
    prazoDefinido: boolean;
    pendenciasImpeditivas: string[];
    pendenciasPosteriores: string[];
  };
  contrato: {
    cobertura: CoberturaDoModelo;
    coberturaCompleta: boolean;
    anexoIIncorporado: boolean;
    anexos: AnexoCartao[];
    previaGerada: boolean;
    previaAtual: boolean;
    previaReferencia: string | null;
  };
  formalizacao: {
    prontoParaAssinatura: boolean;
    assinaturaRegistradaEm: string | null;
    bloqueiosImpeditivos: string[];
    proximoPasso: string | null;
  };
  persistidos: Record<string, RegistroPersistido>;
};

const PREFIXO = "form.";

/** Únicos itens que a equipe marca à mão (conferência humana). Whitelist do servidor. */
export const CHAVES_CONFERENCIA_MANUAL = [
  `${PREFIXO}conf.dados_instancia`,
  `${PREFIXO}conf.escopo_proposta`,
  `${PREFIXO}conf.representacao_assinatura`,
  `${PREFIXO}proximo_passo`,
] as const;

function item(p: Omit<ItemCartao, "persistido" | "manual" | "evidencia" | "pendencia"> & Partial<ItemCartao>): ItemCartao {
  return { manual: false, evidencia: null, pendencia: null, persistido: null, ...p };
}

function concluidoSe(ok: boolean, naoPendente = "pendente" as EstadoItem): EstadoItem {
  return ok ? "concluido" : naoPendente;
}

/** Item de conferência humana: o estado vem do registro persistido. */
function itemManual(
  chave: string,
  rotulo: string,
  detalheVazio: string,
  persistidos: Record<string, RegistroPersistido>,
  prerequisitoOk = true,
  detalheBloqueio = "",
): ItemCartao {
  const p = persistidos[chave] ?? null;
  let estado: EstadoItem = "pendente";
  let detalhe = detalheVazio;
  if (p?.status === "cumprido") {
    estado = "concluido";
    detalhe = p.observacao ? `Conferido: ${p.observacao}` : "Conferido pela equipe.";
  } else if (p?.status === "nao_aplicavel") {
    estado = "nao_aplicavel";
    detalhe = p.observacao ? `Não aplicável: ${p.observacao}` : "Não aplicável.";
  } else if (!prerequisitoOk) {
    estado = "bloqueado_externo";
    detalhe = detalheBloqueio || detalheVazio;
  }
  return item({
    chave,
    rotulo,
    estado,
    detalhe,
    manual: true,
    persistido: p,
    pendencia: estado === "bloqueado_externo" ? detalhe : null,
  });
}

export function estadoDoCartao(itens: readonly ItemCartao[]): EstadoItem {
  const ativos = itens.filter((i) => i.estado !== "nao_aplicavel");
  if (ativos.length === 0) return "nao_aplicavel";
  if (ativos.some((i) => i.estado === "bloqueado_externo")) return "bloqueado_externo";
  if (ativos.every((i) => i.estado === "concluido")) return "concluido";
  if (ativos.some((i) => i.estado === "concluido" || i.estado === "em_andamento")) return "em_andamento";
  return "pendente";
}

function fechar(c: Omit<Cartao, "estado" | "pendencias">): Cartao {
  return {
    ...c,
    estado: estadoDoCartao(c.itens),
    pendencias: c.itens.filter((i) => i.pendencia).map((i) => i.pendencia as string),
  };
}

export function montarCartoesFormalizacao(e: EntradaCartoes): Cartao[] {
  const resp = e.responsavelNome ?? "Responsável do caso (a definir)";

  // ------------------------------------------------------------ 1. Dados e partes
  const dados = fechar({
    id: "dados_partes",
    ordem: 1,
    titulo: "Dados e partes",
    objetivo: "Partes qualificadas, papéis e representação definidos a partir da Pessoa 360 — sem redigitar.",
    acaoPrincipal: "Resolver as pendências de cadastro direto na Pessoa 360",
    minutosAlvo: 10,
    responsavel: resp,
    itens: [
      item({
        chave: `${PREFIXO}partes_qualificadas`,
        rotulo: "Partes qualificadas (nome, documento, endereço, contato)",
        estado: e.partes.pendencias.length === 0 ? "concluido" : "pendente",
        detalhe:
          e.partes.pendencias.length === 0
            ? "Todas as partes têm os dados exigidos."
            : `${e.partes.pendencias.length} pendência(s) de cadastro nas partes.`,
        pendencia: e.partes.pendencias.length ? e.partes.pendencias.join(" · ") : null,
      }),
      item({
        chave: `${PREFIXO}papeis_definidos`,
        rotulo: "Papéis: contratante, signatário, beneficiário, responsável financeiro",
        estado: concluidoSe(e.partes.papeisDefinidos),
        detalhe: e.partes.papeisDefinidos ? "Papéis definidos para cada parte." : "Há parte sem papel definido.",
        pendencia: e.partes.papeisDefinidos ? null : "Parte sem papel definido no contrato.",
      }),
      item({
        chave: `${PREFIXO}representacao_dependente`,
        rotulo: "Dependente e representação",
        estado: !e.partes.possuiMenor ? "nao_aplicavel" : e.partes.representacaoRegistrada ? "concluido" : "bloqueado_externo",
        detalhe: !e.partes.possuiMenor
          ? "Nenhum dependente menor no contrato."
          : e.partes.representacaoRegistrada
            ? "Representação registrada."
            : "Menor sem representação documentada — depende de documento do responsável.",
        pendencia:
          e.partes.possuiMenor && !e.partes.representacaoRegistrada
            ? "Representação de dependente menor não documentada."
            : null,
      }),
      item({
        chave: `${PREFIXO}contratada_qualificada`,
        rotulo: "Qualificação da contratada",
        estado: concluidoSe(e.partes.contratadaQualificada),
        detalhe: e.partes.contratadaQualificada
          ? "Qualificação vinda do perfil institucional."
          : "Qualificação da contratada incompleta.",
        pendencia: e.partes.contratadaQualificada ? null : "Qualificação da contratada incompleta.",
      }),
    ],
    evidencia: `/pessoas (Pessoa 360) · caso ${e.caseId}`,
    conclusao: "Partes e papéis fechados; nada a redigitar no contrato.",
  });

  // ------------------------------------------------------------ 2. Escopo e condição comercial
  const escopo = fechar({
    id: "escopo_condicao",
    ordem: 2,
    titulo: "Escopo e condição comercial",
    objetivo: "Escopo individual e familiar, serviços, entregas, valor, pagamento e prazo vindos da proposta aprovada.",
    acaoPrincipal: "Conferir o resumo do escopo contra a proposta aprovada",
    minutosAlvo: 10,
    responsavel: resp,
    itens: [
      item({
        chave: `${PREFIXO}proposta_referenciada`,
        rotulo: "Proposta aprovada referenciada (versão)",
        estado: concluidoSe(e.escopo.propostaAprovada),
        detalhe: e.escopo.propostaAprovada
          ? `Proposta ${e.escopo.propostaReferencia ?? "aprovada"} vinculada.`
          : "Sem proposta aprovada vinculada ao caso.",
        pendencia: e.escopo.propostaAprovada ? null : "Proposta aprovada ausente.",
        evidencia: e.escopo.propostaReferencia,
      }),
      item({
        chave: `${PREFIXO}escopo_individual_familiar`,
        rotulo: "Escopo individual e familiar",
        estado: concluidoSe(e.escopo.escopoPreenchido),
        detalhe: e.escopo.escopoPreenchido ? "Escopo preenchido." : "Escopo sem fonte rastreável.",
        pendencia: e.escopo.escopoPreenchido ? null : "Escopo contratado sem fonte rastreável.",
      }),
      item({
        chave: `${PREFIXO}servicos_entregas`,
        rotulo: "Serviços incluídos/excluídos e entregas por fase",
        estado: concluidoSe(e.escopo.servicosDefinidos && e.escopo.entregasDefinidas),
        detalhe:
          e.escopo.servicosDefinidos && e.escopo.entregasDefinidas
            ? "Serviços, exclusões e entregas definidos."
            : "Serviços excluídos ou entregas por fase sem definição.",
        pendencia:
          e.escopo.servicosDefinidos && e.escopo.entregasDefinidas ? null : "Serviços/entregas sem definição na proposta.",
      }),
      item({
        chave: `${PREFIXO}valor_pagamento_prazo`,
        rotulo: "Valor, parcelas, vencimentos e prazo",
        estado: concluidoSe(e.escopo.valorTotal != null && e.escopo.pagamentoDefinido && e.escopo.prazoDefinido),
        detalhe:
          e.escopo.valorTotal != null && e.escopo.pagamentoDefinido && e.escopo.prazoDefinido
            ? "Condição comercial completa."
            : "Valor, forma de pagamento ou prazo incompleto.",
        pendencia:
          e.escopo.valorTotal != null && e.escopo.pagamentoDefinido && e.escopo.prazoDefinido
            ? null
            : "Condição comercial incompleta (valor, pagamento ou prazo).",
      }),
    ],
    evidencia: e.escopo.propostaReferencia,
    conclusao: "Escopo e condição fechados a partir da proposta aprovada.",
  });

  // ------------------------------------------------------------ 3. Estudo v2 e anexos
  const cob = e.contrato.cobertura;
  const itensAnexos = e.contrato.anexos.map((a) => {
    const incorporado = a.codigo === "ANEXO_I_ORDEM_SERVICO" && e.contrato.anexoIIncorporado;
    return item({
      chave: `${PREFIXO}anexo.${a.codigo.toLowerCase()}`,
      rotulo: a.rotulo,
      estado: incorporado ? "concluido" : !a.aplicavel ? "nao_aplicavel" : a.pendencia ? "pendente" : "concluido",
      detalhe: incorporado
        ? "Conteúdo incorporado ao corpo do contrato; não há documento separado a emitir."
        : !a.aplicavel
          ? a.justificativa
          : (a.pendencia ?? "Anexo aplicável e completo."),
      pendencia: a.aplicavel && !incorporado ? a.pendencia : null,
    });
  });
  const estudo = fechar({
    id: "estudo_v2_anexos",
    ordem: 3,
    titulo: "Estudo Genealógico v2 e anexos",
    objetivo: "Contrato principal gerado com o conteúdo do caso incorporado; anexos só quando houver ato concreto.",
    acaoPrincipal: "Gerar/atualizar a prévia do Contrato de Estudo Genealógico v2",
    minutosAlvo: 20,
    responsavel: resp,
    itens: [
      item({
        chave: `${PREFIXO}modelo_aprovado`,
        rotulo: "Modelo aprovado (Estudo Genealógico v2) é o contrato principal",
        estado: cob.modelo ? "concluido" : "pendente",
        detalhe: cob.rotuloAprovacao,
        pendencia: cob.modelo ? null : (cob.motivoNaoCobre ?? "Modelo sem aprovação vigente."),
      }),
      item({
        chave: `${PREFIXO}excecao_juridica`,
        rotulo: "Alteração material fora do conteúdo aprovado",
        estado: cob.escalonamento.length === 0 ? "nao_aplicavel" : "bloqueado_externo",
        detalhe:
          cob.escalonamento.length === 0
            ? "Sem alteração fora do modelo aprovado — nenhuma nova revisão jurídica é exigida."
            : cob.escalonamento.map((a) => `${a.clausula}: ${a.motivo}${a.trecho ? ` — «${a.trecho}»` : ""}`).join(" | "),
        pendencia:
          cob.escalonamento.length === 0
            ? null
            : `Escalada jurídica excepcional: ${cob.escalonamento.length} alteração(ões) fora do conteúdo aprovado.`,
      }),
      item({
        chave: `${PREFIXO}cobertura_contratual`,
        rotulo: "Cobertura contratual completa",
        estado: concluidoSe(e.contrato.coberturaCompleta),
        detalhe: e.contrato.coberturaCompleta
          ? "Pessoas, papéis, escopo, entregas e condição comercial estão no corpo do contrato."
          : `${e.escopo.pendenciasImpeditivas.length} pendência(s) impedem a assinatura inicial.`,
        pendencia: e.contrato.coberturaCompleta ? null : e.escopo.pendenciasImpeditivas.join(" · "),
      }),
      item({
        chave: `${PREFIXO}previa_atual`,
        rotulo: "Prévia gerada e em dia com os dados",
        estado: !e.contrato.previaGerada ? "pendente" : e.contrato.previaAtual ? "concluido" : "em_andamento",
        detalhe: !e.contrato.previaGerada
          ? "Prévia ainda não gerada."
          : e.contrato.previaAtual
            ? "Prévia reflete os dados atuais."
            : "Prévia desatualizada — regenere antes de revisar ou exportar.",
        pendencia: !e.contrato.previaGerada ? "Prévia não gerada." : e.contrato.previaAtual ? null : "Prévia desatualizada.",
        evidencia: e.contrato.previaReferencia,
      }),
      ...itensAnexos,
    ],
    evidencia: e.contrato.previaReferencia,
    conclusao: "Contrato principal gerado; anexos aplicáveis completos e os demais justificados como não aplicáveis.",
  });

  // ------------------------------------------------------------ 4. Conferência operacional
  const conf = fechar({
    id: "conferencia",
    ordem: 4,
    titulo: "Conferência operacional",
    objetivo: "Conferir a INSTÂNCIA do contrato (dados do caso) — a aprovação jurídica do modelo não é refeita.",
    acaoPrincipal: "Conferir a prévia gerada contra a proposta e os cadastros",
    minutosAlvo: 15,
    responsavel: resp,
    itens: [
      itemManual(
        `${PREFIXO}conf.dados_instancia`,
        "Dados do caso conferem com a prévia (partes, valores, datas)",
        "Ainda não conferido pela equipe.",
        e.persistidos,
        e.contrato.previaGerada,
        "Gere a prévia antes de conferir.",
      ),
      itemManual(
        `${PREFIXO}conf.escopo_proposta`,
        "Escopo e entregas da prévia conferem com a proposta aprovada",
        "Ainda não conferido pela equipe.",
        e.persistidos,
        e.contrato.previaGerada,
        "Gere a prévia antes de conferir.",
      ),
      itemManual(
        `${PREFIXO}conf.representacao_assinatura`,
        "Representação e signatários conferidos para a assinatura",
        "Ainda não conferido pela equipe.",
        e.persistidos,
        !e.partes.possuiMenor || e.partes.representacaoRegistrada,
        "Representação do dependente pendente: documento externo.",
      ),
    ],
    evidencia: null,
    conclusao: "Instância conferida pela equipe; sem nova revisão jurídica genérica.",
  });

  // ------------------------------------------------------------ 5. Formalização e próximo passo
  const formal = fechar({
    id: "formalizacao",
    ordem: 5,
    titulo: "Formalização e próximo passo",
    objetivo: "Declarar o estado do instrumento e o próximo passo — sem enviar, assinar ou cobrar automaticamente.",
    acaoPrincipal: "Registrar o próximo passo (ex.: enviar para assinatura, por ação humana)",
    minutosAlvo: 5,
    responsavel: resp,
    itens: [
      item({
        chave: `${PREFIXO}pronto_assinatura`,
        rotulo: "Pronto para assinatura",
        estado: e.formalizacao.prontoParaAssinatura
          ? "concluido"
          : e.formalizacao.bloqueiosImpeditivos.length
            ? "bloqueado_externo"
            : "pendente",
        detalhe: e.formalizacao.prontoParaAssinatura
          ? "Todos os cartões anteriores fechados."
          : e.formalizacao.bloqueiosImpeditivos.length
            ? e.formalizacao.bloqueiosImpeditivos.join(" · ")
            : "Aguardando os cartões anteriores.",
        pendencia: e.formalizacao.prontoParaAssinatura ? null : e.formalizacao.bloqueiosImpeditivos.join(" · ") || null,
      }),
      item({
        chave: `${PREFIXO}assinatura_registrada`,
        rotulo: "Assinatura registrada (ato externo posterior)",
        estado: e.formalizacao.assinaturaRegistradaEm ? "concluido" : "pendente",
        detalhe: e.formalizacao.assinaturaRegistradaEm
          ? `Assinado em ${e.formalizacao.assinaturaRegistradaEm}.`
          : "Assinatura é ato externo; só é registrada quando acontece.",
        evidencia: e.formalizacao.assinaturaRegistradaEm,
      }),
      itemManual(
        `${PREFIXO}proximo_passo`,
        "Próximo passo definido",
        e.formalizacao.proximoPasso ?? "Próximo passo ainda não registrado.",
        e.persistidos,
      ),
    ],
    evidencia: null,
    conclusao: "Estado do instrumento declarado e próximo passo registrado.",
  });

  return [dados, escopo, estudo, conf, formal];
}

/** Resumo em uma linha, para as duas superfícies mostrarem a mesma frase. */
export function resumoCartoes(cartoes: readonly Cartao[]): string {
  const fechados = cartoes.filter((c) => c.estado === "concluido").length;
  const proximo = cartoes.find((c) => c.estado !== "concluido" && c.estado !== "nao_aplicavel");
  if (!proximo) return `${fechados}/${cartoes.length} cartões concluídos — formalização pronta.`;
  return `${fechados}/${cartoes.length} cartões concluídos — próximo: ${proximo.titulo}.`;
}

/** Chaves que a equipe pode marcar à mão (conferência humana). */
export function chavesManuais(cartoes: readonly Cartao[]): string[] {
  return cartoes.flatMap((c) => c.itens.filter((i) => i.manual).map((i) => i.chave));
}

export { PREFIXO as PREFIXO_CHAVE_FORMALIZACAO };
