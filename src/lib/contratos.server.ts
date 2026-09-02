/**
 * Helpers server-only do motor contratual.
 *
 * Regras invioláveis:
 * - arquivos de contrato vivem em bucket PRIVADO, isolados por organização;
 * - nunca gerar URL pública (nem temporária registrada em log);
 * - conteúdo integral do contrato nunca entra em audit_logs/metadados.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const BUCKET_CONTRATOS = "contracts";

export const SELO_RASCUNHO = "RASCUNHO INTERNO — NÃO ENVIAR / NÃO ASSINAR";
export const SELO_COMPLEMENTAR = "INSTRUMENTO COMPLEMENTAR — NÃO SUBSTITUI O CONTRATO-BASE";
export const SELO_ADITIVO = "ADITIVO — ALTERA SOMENTE AS CLÁUSULAS EXPRESSAMENTE INDICADAS";

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function selosDoInstrumento(tipo: string) {
  const selos = [SELO_RASCUNHO];
  if (tipo === "contract_complement") selos.push(SELO_COMPLEMENTAR);
  if (tipo === "amendment") selos.push(SELO_ADITIVO);
  return selos;
}

/**
 * Endereço da contratante formatado a partir dos campos estruturados do
 * cadastro em `clientes` (Pessoa Canônica), no mesmo padrão do endereço
 * institucional fixo em `PERFIL_INSTITUCIONAL`.
 */
export function enderecoDoCliente(cliente: Record<string, any> | null | undefined): string | null {
  if (!cliente) return null;
  const partes = [
    [cliente.endereco_logradouro, cliente.endereco_numero].filter((p) => String(p ?? "").trim()).join(", "),
    cliente.endereco_complemento,
    cliente.endereco_bairro,
    cliente.endereco_cep ? `CEP ${cliente.endereco_cep}` : null,
    [cliente.endereco_cidade, cliente.endereco_uf].filter((p) => String(p ?? "").trim()).join(" – "),
    cliente.endereco_pais,
  ].filter((p) => String(p ?? "").trim());
  return partes.length ? partes.join(", ") : null;
}

/**
 * Dados da contratante para o instrumento contratual.
 *
 * Decisão da proprietária (02/09/2026): o CRM (`clientes`, Pessoa Canônica)
 * é a fonte canônica de nome/documento/endereço da contratante — não o
 * preenchimento livre da matriz de Parâmetros. A matriz só complementa o
 * que o cadastro do cliente ainda não tem (ex.: caso de procurador com
 * dados próprios, ou cliente ainda incompleto no CRM).
 */
export function contratanteCanonica(
  cliente: Record<string, any> | null | undefined,
  matriz: { nome?: string | null; documento?: string | null; endereco?: string | null },
): { nome: string | null; documento: string | null; endereco: string | null } {
  return {
    nome: String(cliente?.nome ?? "").trim() || String(matriz.nome ?? "").trim() || null,
    documento: String(cliente?.cpf ?? "").trim() || String(matriz.documento ?? "").trim() || null,
    endereco: enderecoDoCliente(cliente) || String(matriz.endereco ?? "").trim() || null,
  };
}

export type ConteudoRascunho = {
  selos: string[];
  contrato: Record<string, any>;
  partes: any[];
  escopo: any[];
  clausulas: any[];
  anexos: any[];
  html: string;
  gerado_em: string;
};

export function montarRascunho(input: {
  contrato: any;
  partes: any[];
  escopo: any[];
  clausulas: any[];
  anexos: any[];
  contratoBase: any | null;
}): ConteudoRascunho {
  const { contrato, partes, escopo, clausulas, anexos, contratoBase } = input;
  const selos = selosDoInstrumento(contrato.contract_type);

  const secao = (titulo: string, corpo: string) =>
    `<section><h2>${esc(titulo)}</h2>${corpo || "<p class='pend'>Pendente de preenchimento.</p>"}</section>`;

  const listaPartes = partes.length
    ? `<ul>${partes
        .map(
          (p) =>
            `<li><strong>${esc(p.person_name)}</strong> — ${esc(p.role)}${
              p.signature_required ? " · assinatura requerida" : ""
            }${p.legal_capacity_status === "minor" ? " · menor representado" : ""}</li>`,
        )
        .join("")}</ul>`
    : "";

  const grupo = (cat: string) =>
    escopo.filter((s) => s.category === cat && !s.archived_at);
  const listaEscopo = (cat: string) => {
    const itens = grupo(cat);
    return itens.length
      ? `<ul>${itens
          .map((s) => `<li><strong>${esc(s.title)}</strong> (${esc(s.status)}) — ${esc(s.description ?? "")}</li>`)
          .join("")}</ul>`
      : "";
  };

  const listaClausulas = clausulas.length
    ? `<ol>${clausulas
        .map(
          (c) =>
            `<li><strong>${esc(c.clause_code)} — ${esc(c.clause_title)}</strong> · ação: ${esc(c.action)}${
              c.base_contract_clause_reference
                ? ` · cláusula-base: ${esc(c.base_contract_clause_reference)}`
                : ""
            }${c.precedence_statement ? `<br/><em>${esc(c.precedence_statement)}</em>` : ""}${
              c.clause_text ? `<p>${esc(c.clause_text)}</p>` : ""
            }</li>`,
        )
        .join("")}</ol>`
    : "";

  const listaAnexos = anexos.length
    ? `<ul>${anexos
        .map(
          (a) =>
            `<li>${esc(a.annex_code)} — ${esc(a.title)} · ${esc(a.status)}${
              a.required_for_contract ? " · obrigatório" : ""
            }</li>`,
        )
        .join("")}</ul>`
    : "";

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<meta name="robots" content="noindex,nofollow"/>
<title>${esc(contrato.contract_number)}</title>
<style>body{font-family:Georgia,serif;color:#2F4B6E;max-width:820px;margin:40px auto;padding:0 24px;line-height:1.6}
.selo{border:2px solid #9A3A2F;color:#9A3A2F;padding:8px 12px;margin:6px 0;font-family:system-ui;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
h1{font-size:22px}h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #FCB73A;padding-bottom:4px;margin-top:28px}
.pend{color:#9A3A2F;font-style:italic}</style></head><body>
${selos.map((s) => `<div class="selo">${esc(s)}</div>`).join("")}
<h1>${esc(contrato.title)}</h1>
<p><strong>Instrumento:</strong> ${esc(contrato.contract_number)} · ${esc(contrato.contract_type)}</p>
${
  contratoBase
    ? `<p><strong>Contrato-base referenciado:</strong> ${esc(contratoBase.contract_number)} — ${esc(
        contrato.base_contract_reference,
      )}. Este instrumento não substitui o contrato-base; altera somente o que estiver expressamente indicado.</p>`
    : ""
}
${secao("Finalidade", contrato.purpose_summary ? `<p>${esc(contrato.purpose_summary)}</p>` : "")}
${secao("Partes", listaPartes)}
${secao("Escopo contratado", listaEscopo("contracted_scope"))}
${secao("Entregas", listaEscopo("deliverable"))}
${secao("Obrigações do contratante", listaEscopo("customer_obligation"))}
${secao("Obrigações do Clube Ancestral", listaEscopo("club_obligation"))}
${secao("Exclusões", contrato.no_exclusions_confirmed ? "<p>Ausência de exclusões confirmada por revisão humana.</p>" : listaEscopo("exclusion"))}
${secao("Dependências e condições operacionais", listaEscopo("dependency") + listaEscopo("operational_condition"))}
${secao("Despesas de terceiros", `<p>Status declarado: ${esc(contrato.external_expense_status)}.</p>` + listaEscopo("external_expense"))}
${secao("Vigência", contrato.effective_start_date || contrato.effective_rule ? `<p>${esc(contrato.effective_rule ?? "")} ${esc(contrato.effective_start_date ?? "")} ${esc(contrato.effective_end_date ?? "")}</p>` : "")}
${secao("Condição financeira", `<p>Classificação: ${esc(contrato.financial_change_status)}. Valores, SKU e condições de pagamento somente por fonte autorizada e revisão humana.</p>`)}
${secao("Cláusulas indicadas", listaClausulas)}
${secao("Anexos", listaAnexos)}
<hr/><p class="pend">Documento de trabalho interno. Não constitui proposta, aceite, envio ou assinatura.</p>
</body></html>`;

  return {
    selos,
    contrato: {
      contract_number: contrato.contract_number,
      contract_type: contrato.contract_type,
      title: contrato.title,
    },
    partes: partes.map((p) => ({ role: p.role, person_name: p.person_name })),
    escopo: escopo.map((s) => ({ category: s.category, title: s.title, status: s.status })),
    clausulas: clausulas.map((c) => ({ clause_code: c.clause_code, action: c.action })),
    anexos: anexos.map((a) => ({ annex_code: a.annex_code, status: a.status })),
    html,
    gerado_em: new Date().toISOString(),
  };
}

export async function hashConteudo(texto: string) {
  const dados = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Caminho privado, versionado e isolado por organização. Nunca sobrescreve versão anterior. */
export function caminhoVersao(orgId: string, contractId: string, versao: number) {
  return `contracts/${orgId}/${contractId}/versions/${versao}/instrumento.html`;
}
