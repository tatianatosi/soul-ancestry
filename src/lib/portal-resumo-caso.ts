import { calcularEtapas, type CheckLido, type EstadoEtapa } from "@/lib/etapas-caso";
import { humano } from "@/lib/rotulos-golive";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Resumo do caso para a Home e a Conta do App (13/10/2026): régua das 5 etapas,
 * estado do caso e perfil da titular. Só leitura; sem CPF/RG/endereço, sem
 * nota interna. As etapas vêm exclusivamente de `calcularEtapas`
 * (src/lib/etapas-caso.ts) — mesma regra do Caso 360.
 */
export type ResumoCasoCliente = {
  statusCaso: string | null;
  statusRotulo: string | null;
  ativo: boolean;
  /** Data de entrada do caso (ISO), ou nula quando não registrada. */
  membroDesde: string | null;
  etapas: { id: string; rotulo: string; estado: EstadoEtapa }[];
  perfil: { nome: string | null; email: string | null; telefone: string | null };
};

export async function lerResumoCaso(db: any, casoId: string): Promise<ResumoCasoCliente | null> {
  const [casoR, checksR] = await Promise.all([
    db
      .from("crm_casos")
      .select("status, ativo, contrato_assinado, data_entrada_caso, data_entrada, cliente_id")
      .eq("id", casoId)
      .maybeSingle(),
    db.from("case_activation_checks").select("check_key, status, isencao_expira_em").eq("case_id", casoId),
  ]);
  const caso = casoR?.data as any;
  if (!caso) return null;
  let perfil: ResumoCasoCliente["perfil"] = { nome: null, email: null, telefone: null };
  if (caso.cliente_id) {
    const cli = await db.from("clientes").select("nome, email, telefone").eq("id", caso.cliente_id).maybeSingle();
    const c = cli?.data as any;
    if (c) {
      perfil = {
        nome: (c.nome as string | null)?.trim() || null,
        email: (c.email as string | null)?.trim() || null,
        telefone: (c.telefone as string | null)?.trim() || null,
      };
    }
  }
  const etapas = calcularEtapas((checksR?.data ?? []) as CheckLido[], Date.now(), {
    contratoAssinado: caso.contrato_assinado ?? null,
  }).map((e) => ({ id: e.id, rotulo: e.rotulo, estado: e.estado }));
  const status = (caso.status as string | null) ?? null;
  return {
    statusCaso: status,
    statusRotulo: status ? humano(status, "Não registrado") : null,
    ativo: status === "ativo",
    membroDesde: (caso.data_entrada_caso as string | null) ?? (caso.data_entrada as string | null) ?? null,
    etapas,
    perfil,
  };
}
