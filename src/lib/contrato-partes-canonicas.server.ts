/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte U2 (28/09/2026): lê as pessoas reais do caso (Pessoa 360) para
 * pré-carregar a ficha contratual. Contratante = `crm_casos.cliente_id`;
 * beneficiários = membros do núcleo do caso com pessoa vinculada.
 */
import { parametrosDasPartesCanonicas, type ParametroCanonico, type PessoaCanonicaContrato } from "@/lib/contrato-partes-canonicas";

const COLUNAS_PESSOA =
  "id,nome,cpf,rg_numero,rg_orgao_uf,estado_civil,data_nascimento,email,telefone,endereco_logradouro,endereco_numero,endereco_complemento,endereco_bairro,endereco_cidade,endereco_uf,endereco_cep";

const ROTULO_PAPEL: Record<string, string> = {
  contratante: "Contratante",
  titular: "Titular",
  dependente: "Dependente",
  representante: "Representante",
  interlocutor_externo: "Interlocutor externo",
};

export async function parametrosCanonicosDoCaso(
  supabase: any,
  organizationId: string | null | undefined,
  caso: { id: string; cliente_id?: string | null },
): Promise<ParametroCanonico[]> {
  if (!organizationId || !caso?.cliente_id) return [];
  const { montarEnderecoCanonico } = await import("@/lib/contratos.functions");

  const { data: nucleos } = await supabase
    .from("nucleos_familiares")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", caso.id)
    .is("archived_at", null);
  const idsNucleo = ((nucleos ?? []) as { id: string }[]).map((n) => n.id);
  const membros = idsNucleo.length
    ? (
        (
          await supabase
            .from("nucleo_membros")
            .select("cliente_id,papel,papel_no_caso,ordem")
            .eq("organization_id", organizationId)
            .in("nucleo_id", idsNucleo)
            .is("archived_at", null)
            .not("cliente_id", "is", null)
            .order("ordem", { ascending: true })
        ).data ?? []
      ) as { cliente_id: string; papel: string | null; papel_no_caso: string | null }[]
    : [];

  const ids = Array.from(new Set([caso.cliente_id, ...membros.map((m) => m.cliente_id)]));
  const { data: pessoas } = await supabase
    .from("clientes")
    .select(COLUNAS_PESSOA)
    .eq("organization_id", organizationId)
    .in("id", ids);
  const porId = new Map(((pessoas ?? []) as any[]).map((p) => [p.id as string, p]));

  const paraContrato = (p: any, papel: string): PessoaCanonicaContrato => ({
    nome: String(p.nome ?? "").trim(),
    papel,
    cpf: p.cpf,
    rg_numero: p.rg_numero,
    rg_orgao_uf: p.rg_orgao_uf,
    estado_civil: p.estado_civil,
    data_nascimento: p.data_nascimento,
    endereco: montarEnderecoCanonico(p),
    email: p.email,
    telefone: p.telefone,
  });

  const contratanteRow = porId.get(caso.cliente_id);
  if (!contratanteRow) return [];
  const contratante = paraContrato(contratanteRow, "Contratante");
  const beneficiarios = membros
    .filter((m) => m.cliente_id !== caso.cliente_id && porId.has(m.cliente_id))
    .map((m) => paraContrato(porId.get(m.cliente_id), ROTULO_PAPEL[m.papel_no_caso ?? ""] ?? "Beneficiário(a) do núcleo familiar"));
  return parametrosDasPartesCanonicas(contratante, beneficiarios);
}

/**
 * A Pessoa 360 prevalece sobre o cadastro legado do Planejador para os
 * mesmos campos; o que a Pessoa 360 não tem continua vindo do Planejador.
 */
export function mesclarComPessoaCanonica<T extends { campo: string }>(
  planejador: T[],
  canonicos: ParametroCanonico[],
): (T | ParametroCanonico)[] {
  const campos = new Set(canonicos.map((c) => c.campo));
  return [...planejador.filter((p) => !campos.has(p.campo)), ...canonicos];
}
