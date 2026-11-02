import type { Classificacao, PessoaLista } from "@/lib/clientes-lista";

/**
 * Projeção pura e tipada da leitura GET `listarPessoasCliente`.
 * Sem efeitos: recebe as linhas já lidas (escopadas à organização pelo
 * chamador) e devolve exatamente o mesmo `PessoaLista[]` de antes.
 */
export type LinhaCliente = {
  id: string;
  nome: string;
  nome_social?: string | null;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  status_comercial?: string | null;
  pais_interesse?: string | null;
  status?: string | null;
  classificacao?: string | null;
  is_demo?: boolean | null;
  demo?: boolean | null;
  archived_at?: string | null;
  archive_motivo?: string | null;
  ativacao_decidida_em?: string | null;
  ativacao_justificativa?: string | null;
};
export type LinhaCaso = {
  cliente_id?: string | null;
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
};
export type LinhaMembro = {
  cliente_id?: string | null;
  nucleo_id?: string | null;
  papel?: string | null;
  vinculo?: string | null;
};
export type LinhaNucleo = { id: string; nome?: string | null };

export type BasePessoasCliente = {
  pessoas: LinhaCliente[];
  casos: LinhaCaso[];
  membros: LinhaMembro[];
  nucleos: LinhaNucleo[];
};

/** Leitor que lança em erro (contrato de `seguro`) — nunca devolve [] fabricado. */
export type LeitorSeguro = (consulta: unknown) => Promise<unknown[]>;

/** Mesmas quatro consultas, filtros e ordenação de antes, sempre por organização. */
export async function lerBasePessoasCliente(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  organizationId: string,
  ler: LeitorSeguro,
): Promise<BasePessoasCliente> {
  const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
  const [pessoas, casos, membros, nucleos] = await Promise.all([
    ler(eq("clientes").order("nome")),
    ler(eq("crm_casos").is("archived_at", null)),
    ler(eq("nucleo_membros")),
    ler(eq("nucleos_familiares").is("archived_at", null)),
  ]);
  return {
    pessoas: pessoas as LinhaCliente[],
    casos: casos as LinhaCaso[],
    membros: membros as LinhaMembro[],
    nucleos: nucleos as LinhaNucleo[],
  };
}

export function projetarPessoasCliente({ pessoas, casos, membros, nucleos }: BasePessoasCliente): PessoaLista[] {
  const nomeNucleo = new Map<string, string>(nucleos.map((n) => [n.id, n.nome ?? "Núcleo familiar"]));
  return pessoas.map((p) => {
    const meus = casos.filter((c) => c.cliente_id === p.id);
    return {
      id: p.id,
      nome: p.nome,
      nome_social: p.nome_social ?? null,
      email: p.email ?? null,
      telefone: p.telefone ?? null,
      origem: p.origem ?? null,
      status_comercial: p.status_comercial ?? null,
      pais_interesse: p.pais_interesse ?? null,
      status: p.status ?? "pre_onboarding",
      classificacao: (p.classificacao ?? "pre_cliente") as Classificacao,
      is_demo: Boolean(p.is_demo ?? p.demo),
      archived_at: p.archived_at ?? null,
      archive_motivo: p.archive_motivo ?? null,
      ativacao_decidida_em: p.ativacao_decidida_em ?? null,
      ativacao_justificativa: p.ativacao_justificativa ?? null,
      contratoAssinado: meus.some((c) => Boolean(c.contrato_assinado)),
      pagamentoConfirmado: meus.some((c) => Boolean(c.pagamento_confirmado)),
      casosVinculados: meus.length,
      participacoes: membros
        .filter((m) => m.cliente_id === p.id)
        .map((m) => ({ nucleo: nomeNucleo.get(m.nucleo_id as string) ?? null, papel: m.papel ?? m.vinculo ?? null })),
    } satisfies PessoaLista;
  });
}
