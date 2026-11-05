export const ROTULO_TIPO_INSTRUMENTO: Record<string, string> = {
  contract_base: "Contrato de Estudo Genealógico v2",
  contract_complement: "Contrato complementar",
  amendment: "Aditivo",
};

export const ROTULO_STATUS_CONTRATO: Record<string, string> = {
  draft: "Rascunho",
  pending_data: "Dados pendentes",
  ready_for_review: "Pronto para revisão",
  under_human_review: "Em revisão humana",
  approved_for_send: "Aprovado para envio (envio desabilitado)",
  sent: "Enviado",
  signed: "Assinado",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  archived: "Arquivado",
};

export const ROTULO_GATE_FINANCEIRO: Record<string, string> = {
  not_applicable: "Não aplicável",
  pending_contract: "Aguardando contrato",
  pending_confirmation: "Aguardando confirmação",
  confirmed: "Confirmado",
  blocked: "Bloqueado",
  exception_authorized: "Exceção autorizada",
};

export const ROTULO_GATE_PESQUISA: Record<string, string> = {
  blocked_by_contract: "Bloqueado até o contrato",
  blocked_by_financial_gate: "Bloqueado até o financeiro",
  eligible_for_human_release: "Pronto para liberação humana",
  released_by_authorized_user: "Liberado",
};

const TOM_GATE_FINANCEIRO: Record<string, "neutro" | "alerta" | "ok"> = {
  confirmed: "ok",
  exception_authorized: "ok",
  blocked: "alerta",
};

const TOM_GATE_PESQUISA: Record<string, "neutro" | "alerta" | "ok"> = {
  released_by_authorized_user: "ok",
  eligible_for_human_release: "ok",
  blocked_by_contract: "alerta",
  blocked_by_financial_gate: "alerta",
};

export function tomGateFinanceiro(v: string): "neutro" | "alerta" | "ok" {
  return TOM_GATE_FINANCEIRO[v] ?? "neutro";
}

export function tomGatePesquisa(v: string): "neutro" | "alerta" | "ok" {
  return TOM_GATE_PESQUISA[v] ?? "neutro";
}

export const ROTULO_STATUS_VERSAO: Record<string, string> = {
  working: "Versão de trabalho",
  validation_failed: "Falha de validação",
  ready_for_review: "Pronta para revisão",
  under_review: "Em revisão",
  approved_for_send: "Congelada e aprovada",
  superseded: "Superada",
  signed_snapshot: "Registro de assinatura",
  archived: "Arquivada",
};

/** B07 (05/11/2026): valores do CHECK de `contract_parties.legal_capacity_status`, em português. */
export const ROTULO_CAPACIDADE_PARTE: Record<string, string> = {
  adult: "Maior de idade",
  minor: "Menor de idade",
  legal_representative_required: "Exige representante legal",
  unknown: "Não registrado",
};

export const ROTULO_PAPEL_PARTE: Record<string, string> = {
  provider: "Prestador",
  contracting_client: "Contratante",
  co_contractor: "Cocontratante",
  legal_representative: "Representante legal",
  dependent: "Dependente",
  witness: "Testemunha",
  authorized_payer: "Pagador autorizado",
  third_party_reference: "Terceiro referenciado",
};

export const ROTULO_CATEGORIA_ESCOPO: Record<string, string> = {
  contracted_scope: "Escopo contratado",
  deliverable: "Entrega",
  operational_condition: "Condição operacional",
  customer_obligation: "Obrigação do contratante",
  club_obligation: "Obrigação do Clube",
  exclusion: "Exclusão",
  dependency: "Dependência",
  external_expense: "Despesa de terceiros",
};

/*
 * 26/10/2026 — os valores destas quatro colunas chegavam crus à tela do
 * instrumento (`included`, `annex`, `blocking`, `open`, `financial_gate`),
 * em inglês, para a operadora ler. O dicionário já existia para a coluna
 * "Categoria", ao lado, na mesma linha de tabela; faltava para estas.
 *
 * Cada mapa cobre TODOS os valores do CHECK vigente, lidos do banco em
 * 26/10/2026 — nenhum valor novo é inventado aqui:
 *  - contract_scope_items.status .......... included, excluded, pending, conditional, not_applicable
 *  - contract_scope_items.source_type ..... proposal, case, manual_review, template, annex
 *  - contract_validation_results.severity . blocking, high, medium, low
 *  - contract_validation_results.status ... open, passed, waived, resolved
 *  - contract_exceptions.scope ............ financial_gate, activation_gate, validation_waiver, other
 */
export const ROTULO_STATUS_ESCOPO: Record<string, string> = {
  included: "Incluído",
  excluded: "Excluído",
  pending: "Pendente",
  conditional: "Condicional",
  not_applicable: "Não aplicável",
};

export const ROTULO_ORIGEM_ESCOPO: Record<string, string> = {
  proposal: "Proposta",
  case: "Caso",
  manual_review: "Revisão manual",
  template: "Modelo",
  annex: "Anexo",
};

export const ROTULO_SEVERIDADE_VALIDACAO: Record<string, string> = {
  blocking: "Bloqueante",
  high: "Alta",
  medium: "Revisar",
  low: "Baixa",
};

export const ROTULO_SITUACAO_VALIDACAO: Record<string, string> = {
  open: "Aberta",
  passed: "Aprovada",
  waived: "Dispensada",
  resolved: "Resolvida",
};

export const ROTULO_ESCOPO_EXCECAO: Record<string, string> = {
  financial_gate: "Gate financeiro",
  activation_gate: "Gate de ativação",
  validation_waiver: "Dispensa de validação",
  other: "Outro",
};

export const ROTULO_TIPO_ANEXO: Record<string, string> = {
  scope: "Escopo e entregas",
  service_order: "Ordem de serviço",
  financial_schedule: "Condições financeiras",
  external_expenses: "Despesas de terceiros",
  privacy_data: "Privacidade e dados",
  family_structure: "Estrutura familiar",
  document_list: "Lista documental",
  authorization: "Autorização de pesquisa",
  other: "Outro anexo controlado",
};

export const ROTULO_STATUS_ANEXO: Record<string, string> = {
  missing: "Ausente",
  drafting: "Em preparação",
  ready_for_review: "Pronto para revisão",
  approved: "Aprovado",
  attached: "Anexado",
  signed_with_contract: "Assinado com o contrato",
  not_applicable: "Não aplicável",
  archived: "Arquivado",
};

export function Selo({ texto, tom = "neutro" }: { texto: string; tom?: "neutro" | "alerta" | "ok" }) {
  const cores =
    tom === "alerta"
      ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
      : tom === "ok"
        ? "border-gold/50 bg-gold/15 text-navy"
        : "border-navy/15 bg-navy/5 text-navy/80";
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${cores}`}>{texto}</span>;
}

export function AvisoInstrumento({ tipo, status }: { tipo: string; status: string }) {
  const avisos = ["RASCUNHO INTERNO — NÃO ENVIAR / NÃO ASSINAR"];
  if (tipo === "contract_complement") avisos.push("INSTRUMENTO COMPLEMENTAR — NÃO SUBSTITUI O CONTRATO-BASE");
  if (tipo === "amendment") avisos.push("ADITIVO — ALTERA SOMENTE AS CLÁUSULAS EXPRESSAMENTE INDICADAS");
  if (status === "signed") return null;
  return (
    <div className="space-y-1">
      {avisos.map((a) => (
        <p
          key={a}
          className="rounded-md border-2 border-terracotta/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-terracotta"
        >
          {a}
        </p>
      ))}
    </div>
  );
}
