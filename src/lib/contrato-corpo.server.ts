/**
 * Renderização server-only do CORPO CONTRATUAL persistido.
 *
 * A prévia deixa de ser uma lista de parâmetros: passa a conter perfil
 * institucional versionado, preâmbulo, as 14 cláusulas fixas do contrato-base,
 * os anexos aplicáveis (I–V e ANX internos) e a matriz de 16 blocos com fonte,
 * estado e gate. Nada aqui envia, assina, cobra ou pesquisa: é só texto.
 */

import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_AVISO,
  CONTRATO_BASE_ID,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
  PERFIL_INSTITUCIONAL,
  PERFIL_INSTITUCIONAL_VERSAO,
  PREAMBULO_CONTRATO_BASE,
} from "@/lib/contrato-base-consolidado";
import { blocosRenderizados, type BlocoRenderizado } from "@/lib/matriz-aceite";
import { definicaoCampo } from "@/lib/parametros-dicionario";
import {
  anexoIIncorporadoNoCorpo,
  BLOCOS_QUE_INCORPORAM_ANEXO_I,
  coberturaContratual,
  montarBlocosIncorporados,
  montarPessoasContratuais,
  TITULO_SECAO_ANEXO_I_INCORPORADO,
  type BlocoIncorporado,
  type CoberturaContratual,
  type EntradaPessoas,
  type PessoaContratual,
} from "@/lib/contrato-blocos-incorporados";
import { CLAUSULA_DESPESAS_TERCEIROS } from "@/lib/despesas-terceiros";
import {
  ANEXO_I_MODELO_VERSAO,
  ANEXO_III_MODELO_VERSAO,
  ANEXO_IV_MODELO_VERSAO,
  ANEXO_V_MODELO_VERSAO,
  entradaDeValores,
  anexosIaV,
  type AnexoGovernado,
  type ValorFicha,
} from "@/lib/anexos-i-v";

export const CORPO_CONTRATUAL_VERSAO = "CORPO-CONTRATUAL-v1.0";

export const MODELO_VERSAO_ANEXO: Record<string, string> = {
  ANEXO_I_ORDEM_SERVICO: ANEXO_I_MODELO_VERSAO,
  ANEXO_II_DESPESAS_EXTERNAS: "ANEXO-II-DESPESAS-EXTERNAS-v1.0",
  ANEXO_III_AUTORIZACAO_PESQUISA: ANEXO_III_MODELO_VERSAO,
  ANEXO_IV_PROCURACAO: ANEXO_IV_MODELO_VERSAO,
  ANEXO_V_ALTERACAO_ESCOPO: ANEXO_V_MODELO_VERSAO,
};

export function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type AnexoInterno = { codigo: string; titulo: string; motivo: string };

export type EntradaCorpo = {
  caseId: string;
  casoCodigo: string | null;
  clienteNome: string | null;
  responsavel: string | null;
  valores: ValorFicha[];
  anexosInternos: AnexoInterno[];
  /**
   * Composição do caso e condição comercial aprovada. Sem isso o corpo volta a
   * ser só texto institucional e o conteúdo do caso fica preso ao Anexo I —
   * exatamente o defeito corrigido em 04/10/2026.
   */
  pessoas?: EntradaPessoas;
  condicao?: {
    total: number | null;
    moeda: string;
    propostaReferencia: string | null;
  } | null;
};

export type CorpoContratual = {
  html: string;
  anexos: AnexoGovernado[];
  blocos: BlocoRenderizado[];
  /** Blocos do caso incorporados ao corpo, com pendência nomeada por linha. */
  blocosIncorporados: BlocoIncorporado[];
  pessoasContratuais: PessoaContratual[];
  cobertura: CoberturaContratual;
  estrutura: {
    contratoBaseId: string;
    contratoBaseVersao: string;
    contratoBaseStatus: string;
    modelo: string;
    perfilVersao: string;
    corpoVersao: string;
    clausulas: number;
    anexosCondicionais: { codigo: string; versaoModelo: string; aplicavel: boolean; estado: string; pendencias: string[] }[];
    anexosInternos: AnexoInterno[];
    anexoIIncorporadoNoCorpo: boolean;
  };
};

/** Constrói os anexos governados I–V a partir da ficha do caso (somente leitura). */
export function anexosDoCaso(e: EntradaCorpo, anexoIIncorporado = false): AnexoGovernado[] {
  const entrada = entradaDeValores({
    caseId: e.caseId,
    clienteNome: e.clienteNome,
    responsavel: e.responsavel,
    contratoBaseVersao: CONTRATO_BASE_VERSAO,
    modelo: CONTRATO_BASE_MODELO,
    valores: e.valores,
  });
  return anexosIaV({ ...entrada, anexoIIncorporadoNoCorpo: anexoIIncorporado });
}

/**
 * Blocos do caso que o corpo do contrato passa a carregar (04/10/2026).
 *
 * Cada bloco se ancora numa cláusula fixa já aprovada e traz o dado do caso que
 * ela pressupõe. Nenhuma cláusula nova, nenhum texto jurídico reescrito.
 */
export function blocosDoCaso(e: EntradaCorpo): {
  pessoas: PessoaContratual[];
  blocos: BlocoIncorporado[];
  cobertura: CoberturaContratual;
} {
  /*
   * 09/10/2026 — defeito medido no corpo guardado da prévia da Ana: o
   * contrato imprimia o CÓDIGO interno em vez do rótulo. Saía
   * "eletronica_govbr" no lugar de "Eletrônica via gov.br", e "Austria" no
   * lugar de "Áustria — administrativa (§ 58c StbG)". Campo classificatório
   * guarda código por desenho; quem lê o contrato precisa do rótulo.
   *
   * Valor fora da lista controlada continua aparecendo como está — some
   * seria pior que mostrar o código.
   */
  const val = (campo: string) => {
    const v = e.valores.find((x) => x.campo === campo)?.valor;
    if (!v || !String(v).trim()) return null;
    const bruto = String(v);
    const def = definicaoCampo(campo);
    if (def.tipo !== "dropdown" && def.tipo !== "multiselect") return bruto;
    return (def.opcoes ?? []).find((o) => o.valor === bruto)?.rotulo ?? bruto;
  };
  const pessoas = montarPessoasContratuais(
    e.pessoas ?? { membros: [], dependentes: [], itensCondicao: [], responsaveisFinanceiros: [] },
  );
  const blocos = montarBlocosIncorporados({
    pessoas,
    contratadaQualificacao: val("contratada_qualificacao"),
    objeto: val("objeto_contrato"),
    paisRota: val("pais_rota"),
    escopoResumo: val("escopo_resumo"),
    servicosIncluidos: val("servicos_incluidos"),
    servicosExcluidos: val("servicos_excluidos"),
    fasesEntregas: val("fases_entregas"),
    prazosReferencia: val("prazos_referencia"),
    despesasExternas: val("despesas_externas"),
    total: e.condicao?.total ?? (val("valor_total") ? Number(val("valor_total")) : null),
    moeda: e.condicao?.moeda ?? "BRL",
    formaPagamento: val("forma_pagamento"),
    parcelas: val("parcelas"),
    vencimentos: val("vencimentos"),
    propostaReferencia: e.condicao?.propostaReferencia ?? null,
    regraDespesasInstitucional: CLAUSULA_DESPESAS_TERCEIROS,
    /* A procedência que o documento declara vem do próprio parâmetro. */
    origens: Object.fromEntries(
      e.valores.map((v) => [
        v.campo,
        { origem: v.origem ?? null, detalhe: (v as { origem_detalhe?: string | null }).origem_detalhe ?? null },
      ]),
    ),
  });
  return { pessoas, blocos, cobertura: coberturaContratual(pessoas, blocos) };
}

function blocoHtml(b: BlocoIncorporado) {
  const linhas = b.linhas
    .map(
      (l) =>
        `<li><strong>${esc(l.rotulo)}:</strong> ${
          l.valor ? esc(l.valor) : `<span class="pend">${esc(l.pendencia ?? "sem fonte rastreável")}</span>`
        } <span class="orig">[${esc(l.fonte)}]</span></li>`,
    )
    .join("");
  return `<section class="bloco-caso"><h3>${esc(b.titulo)} <span class="orig">(cláusula ${b.clausula})</span></h3>
<p class="orig">${esc(b.finalidade)}</p><ul>${linhas}</ul></section>`;
}

/*
 * Corte B / D1 (07/10/2026): os blocos que carregam a Ordem de Serviço saem
 * sob título próprio, para as cláusulas 3.1 e 10.1 — que citam o Anexo I —
 * continuarem apontando para algo que o leitor acha no documento.
 */
function secaoBlocosIncorporados(blocos: BlocoIncorporado[]) {
  const daOrdemDeServico = BLOCOS_QUE_INCORPORAM_ANEXO_I.map((chave) => blocos.find((b) => b.chave === chave)).filter(
    (b): b is BlocoIncorporado => Boolean(b),
  );
  const demais = blocos.filter((b) => !BLOCOS_QUE_INCORPORAM_ANEXO_I.some((c) => c === b.chave));

  const secaoOs = daOrdemDeServico.length
    ? `<section><h2>${esc(TITULO_SECAO_ANEXO_I_INCORPORADO)}</h2>
<p class="orig">Escopo por pessoa, serviços incluídos e excluídos, entregas, valores e pagamento. Este é o conteúdo do Anexo I, incorporado ao corpo: não há documento separado a emitir.</p>
${daOrdemDeServico.map(blocoHtml).join("")}</section>`
    : "";

  const secaoDemais = demais.length
    ? `<section><h2>Condições específicas deste caso</h2>
<p class="orig">Cada bloco abaixo integra a cláusula indicada do contrato-base. Nenhum texto jurídico novo: o bloco traz o dado do caso que a cláusula pressupõe.</p>
${demais.map(blocoHtml).join("")}</section>`
    : "";

  return `${secaoOs}
${secaoDemais}`;
}

/*
 * 09/10/2026 — achado ao LER o PDF gerado da prévia da Ana: a seção imprimia
 * todos os campos do perfil, inclusive
 *   "WhatsApp: Canal institucional homologado/configurado — não inferir nem
 *    usar número pessoal".
 * Isso é uma instrução interna de uso do perfil, não dado da contratada, e
 * estava dentro do texto do contrato. Campo de contato só entra quando o valor
 * é de fato um número de telefone.
 */
function valorImprimivelDoPerfil(c: { campo: string; valor: string }): boolean {
  if (c.campo !== "whatsapp") return true;
  return c.valor.replace(/\D/g, "").length >= 10;
}

function secaoPerfil() {
  return `<section><h2>Perfil institucional da contratada (${esc(PERFIL_INSTITUCIONAL_VERSAO)})</h2><ul>${PERFIL_INSTITUCIONAL.filter(
    valorImprimivelDoPerfil,
  )
    .map((c) => `<li><strong>${esc(c.rotulo)}:</strong> ${esc(c.valor)}</li>`)
    .join("")}</ul></section>`;
}

function secaoClausulas() {
  return CLAUSULAS_FIXAS.map(
    (c) =>
      `<section class="clausula"><h2>Cláusula ${c.numero} — ${esc(c.titulo)}</h2><ol>${c.itens
        .map((i) => `<li>${esc(i)}</li>`)
        .join("")}</ol></section>`,
  ).join("");
}

function secaoAnexos(anexos: AnexoGovernado[], internos: AnexoInterno[]) {
  const linhas = anexos
    .map((a) => {
      const campos = a.campos
        .map(
          (c) =>
            `<li><strong>${esc(c.rotulo)}:</strong> ${
              c.valor ? esc(c.valor) : `<span class="pend">${esc(c.observacaoAusencia ?? "sem fonte rastreável")}</span>`
            } <span class="orig">[${esc(c.fonte)}]</span></li>`,
        )
        .join("");
      const pend = a.pendencias.length
        ? `<p class="pend">Pendências: ${a.pendencias.map(esc).join(" · ")}</p>`
        : "";
      return `<section class="anexo"><h3>${esc(a.codigo)} — ${esc(a.titulo)} <span class="orig">(${esc(
        MODELO_VERSAO_ANEXO[a.codigo] ?? "modelo versionado",
      )} · ${esc(a.estado)}${a.aplicavel ? "" : " · não aplicável"})</span></h3>
<p>${esc(a.finalidade)}</p><p class="orig">${esc(a.regra)}</p>${a.aplicavel ? `<ul>${campos}</ul>` : `<p class="orig">${esc(a.motivo)}</p>`}${pend}</section>`;
    })
    .join("");

  const anx = internos
    .map((a) => `<li><strong>${esc(a.codigo)}</strong> — ${esc(a.titulo)} <span class="orig">(${esc(a.motivo)})</span></li>`)
    .join("");

  return `<section><h2>Anexos aplicáveis</h2>${linhas}<h3>Anexos internos por regra de produto/escopo</h3><ul>${anx}</ul></section>`;
}

function secaoBlocos(blocos: BlocoRenderizado[]) {
  return `<section><h2>Matriz de renderização (16 blocos)</h2><table><thead><tr><th>Bloco</th><th>Fonte exigida</th><th>Tipo</th><th>Situação</th><th>Gate</th></tr></thead><tbody>${blocos
    .map(
      (b) =>
        `<tr><td>${esc(b.bloco)}</td><td>${esc(b.fonteExigida)}</td><td>${esc(b.tipo)}</td><td>${esc(b.situacao)} — ${esc(
          b.motivo,
        )}</td><td>${esc(b.gate)}</td></tr>`,
    )
    .join("")}</tbody></table></section>`;
}

/** Corpo contratual completo, pronto para ser persistido no snapshot. */
export function renderCorpoContratual(e: EntradaCorpo): CorpoContratual {
  const doCaso = blocosDoCaso(e);
  const incorporado = anexoIIncorporadoNoCorpo(doCaso.blocos);
  const anexos = anexosDoCaso(e, incorporado);
  const blocos = blocosRenderizados(anexos);

  const html = `<section class="base"><h2>Contrato de Estudo Genealógico v2</h2>
<p><strong>Identificador:</strong> ${esc(CONTRATO_BASE_ID)}</p>
<p><strong>Versão:</strong> ${esc(CONTRATO_BASE_VERSAO)} · <strong>Modelo:</strong> ${esc(CONTRATO_BASE_MODELO)} · <strong>Estado:</strong> ${esc(
    CONTRATO_BASE_STATUS,
  )}</p>
<p class="pend">${esc(CONTRATO_BASE_AVISO)}</p></section>
${secaoPerfil()}
<section><h2>Preâmbulo</h2><p>${esc(PREAMBULO_CONTRATO_BASE)}</p></section>
${secaoClausulas()}
${secaoBlocosIncorporados(doCaso.blocos)}
${secaoAnexos(anexos, e.anexosInternos)}
${secaoBlocos(blocos)}`;

  return {
    html,
    anexos,
    blocos,
    blocosIncorporados: doCaso.blocos,
    pessoasContratuais: doCaso.pessoas,
    cobertura: doCaso.cobertura,
    estrutura: {
      contratoBaseId: CONTRATO_BASE_ID,
      contratoBaseVersao: CONTRATO_BASE_VERSAO,
      contratoBaseStatus: CONTRATO_BASE_STATUS,
      modelo: CONTRATO_BASE_MODELO,
      perfilVersao: PERFIL_INSTITUCIONAL_VERSAO,
      corpoVersao: CORPO_CONTRATUAL_VERSAO,
      clausulas: CLAUSULAS_FIXAS.length,
      anexosCondicionais: anexos.map((a) => ({
        codigo: a.codigo,
        versaoModelo: MODELO_VERSAO_ANEXO[a.codigo] ?? "modelo versionado",
        aplicavel: a.aplicavel,
        estado: a.estado,
        pendencias: a.pendencias,
      })),
      anexosInternos: e.anexosInternos,
      anexoIIncorporadoNoCorpo: incorporado,
    },
  };
}
