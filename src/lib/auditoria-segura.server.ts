/**
 * Auditoria que nunca falha calada.
 *
 * Auditoria 02/11/2026 (B8): cerca de 90 gravações em `audit_logs` não liam o `error` do supabase-js
 * (que não lança). Se a política ou o CHECK recusava, a trilha de auditoria simplesmente não existia e
 * ninguém sabia. Aqui o erro é lido, vai ao log e ao coletor de erros (`audit_logs`, `erro_app`), mas NÃO
 * derruba a ação que já foi gravada: auditar vem depois da escrita principal, e uma falha de auditoria
 * não pode virar "nada salvou" para a pessoa.
 */
import { capturarErroProducao } from "@/lib/producao-erros.server";

type ClienteComFrom = { from: (tabela: string) => { insert: (linhas: any) => PromiseLike<{ error: { message?: string } | null }> } };

export async function registrarAuditoria(cliente: ClienteComFrom, linhas: Record<string, unknown> | Record<string, unknown>[]): Promise<boolean> {
  try {
    const { error } = await cliente.from("audit_logs").insert(linhas);
    if (!error) return true;
    throw new Error(error.message ?? "audit_logs recusou a gravação");
  } catch (e) {
    const acao = Array.isArray(linhas) ? String(linhas[0]?.acao ?? "") : String(linhas?.acao ?? "");
    console.error("[auditoria] não gravou", acao, e);
    await capturarErroProducao(e, { origem: "servidor", mecanismo: "auditoria_nao_gravou", rota: acao || undefined });
    return false;
  }
}
