/**
 * Dados civis coletados na call → Pessoa 360 do lead (10/10/2026).
 *
 * Depois do handoff, a pessoa (`clientes.lead_id`) já existe. Nome, telefone e
 * país de interesse anotados no lead não precisam ser digitados de novo: este
 * módulo calcula o que da Pessoa 360 está vazio e pode ser preenchido pelo lead.
 *
 * Função pura. Só preenche campo VAZIO da pessoa — nunca sobrescreve valor já
 * gravado (divergência fica como sinal, mesma regra de `pessoa-vinculo`).
 */

type Texto = string | null | undefined;

const vazio = (v: Texto): boolean => !String(v ?? "").trim();

export type CamposCivisLead = {
  nome?: Texto;
  telefone?: Texto;
  pais_interesse?: Texto;
};

export type PessoaDoLead = {
  nome?: Texto;
  telefone?: Texto;
  pais_interesse?: Texto;
};

export const CAMPOS_CIVIS_DO_LEAD = ["nome", "telefone", "pais_interesse"] as const;

export function camposParaPreencherNaPessoa(
  lead: CamposCivisLead,
  pessoa: PessoaDoLead,
): Partial<Record<(typeof CAMPOS_CIVIS_DO_LEAD)[number], string>> {
  const saida: Partial<Record<(typeof CAMPOS_CIVIS_DO_LEAD)[number], string>> = {};
  for (const campo of CAMPOS_CIVIS_DO_LEAD) {
    const doLead = String(lead[campo] ?? "").trim();
    if (doLead && vazio(pessoa[campo])) saida[campo] = doLead;
  }
  return saida;
}
