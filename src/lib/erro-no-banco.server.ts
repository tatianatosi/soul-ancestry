/**
 * Erros de produção guardados no PRÓPRIO banco (02/11/2026).
 *
 * Até hoje o único destino era o Sentry, que não está configurado: as falhas do dia a dia (salvar, publicar,
 * carregar) viravam uma mensagem rápida na tela e sumiam sem que ninguém, nem a equipe técnica, pudesse ler
 * o erro exato. Agora cada erro vai também para `audit_logs` (`acao = 'erro_app'`), que já existe, aceita
 * texto livre e só o admin lê. Nenhum serviço externo, nenhuma conta nova, nenhuma migration.
 *
 * Nunca lança e nunca bloqueia quem chamou. Limita o volume (30 por minuto por instância, e o mesmo erro
 * só uma vez por minuto) para um laço de falhas não encher a tabela.
 */

export const ACAO_ERRO_APP = "erro_app";

const JANELA_MS = 60_000;
const LIMITE_POR_JANELA = 30;
const MAX_MENSAGEM = 500;
const MAX_PILHA = 800;

type Estado = { inicio: number; usados: number; vistos: Map<string, number> };
const estado: Estado = { inicio: 0, usados: 0, vistos: new Map() };

/** Tira da mensagem o que não deve ficar gravado: e-mail, token de sessão e números longos (CPF, telefone). */
export function higienizarTextoDeErro(texto: string, limite = MAX_MENSAGEM): string {
  return String(texto ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "«e-mail»")
    .replace(/eyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/g, "«token»")
    .replace(/\b(?:sb_(?:secret|publishable)_[\w-]+)\b/g, "«chave»")
    .replace(/\d[\d.\-/ ]{9,}\d/g, "«número»")
    .slice(0, limite);
}

/** Decide se este erro entra agora. Pura em relação ao relógio recebido, para poder ser testada. */
export function devoRegistrar(chave: string, agora: number, s: Estado = estado): boolean {
  if (agora - s.inicio > JANELA_MS) {
    s.inicio = agora;
    s.usados = 0;
  }
  if (s.usados >= LIMITE_POR_JANELA) return false;
  const ultimo = s.vistos.get(chave);
  if (ultimo !== undefined && agora - ultimo < JANELA_MS) return false;
  if (s.vistos.size > 200) s.vistos.clear();
  s.vistos.set(chave, agora);
  s.usados += 1;
  return true;
}

export type RegistroErro = {
  acao: typeof ACAO_ERRO_APP;
  entidade: string;
  metadados: Record<string, unknown>;
};

export function montarRegistroErro(erro: Error, contexto: Record<string, unknown>): RegistroErro {
  const rota = typeof contexto.rota === "string" ? contexto.rota : "app";
  return {
    acao: ACAO_ERRO_APP,
    entidade: higienizarTextoDeErro(rota, 120) || "app",
    metadados: {
      origem: typeof contexto.origem === "string" ? contexto.origem : "servidor",
      mecanismo: typeof contexto.mecanismo === "string" ? contexto.mecanismo : "manual",
      mensagem: higienizarTextoDeErro(erro.message),
      pilha: higienizarTextoDeErro(erro.stack ?? "", MAX_PILHA),
      em: new Date().toISOString(),
    },
  };
}

export async function gravarErroNoBanco(
  erro: Error,
  contexto: Record<string, unknown> = {},
): Promise<void> {
  try {
    const registro = montarRegistroErro(erro, contexto);
    const chave = `${registro.entidade}|${String(registro.metadados.mensagem)}`;
    if (!devoRegistrar(chave, Date.now())) return;

    const cfg = await import("@/lib/config-servidor");
    const credencial = cfg.chaveSecretaDoServidor();
    if (!credencial) return;
    const { createClient } = await import("@supabase/supabase-js");
    const servidor = createClient(cfg.urlDoServidor(), credencial, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { apikey: credencial } },
    });
    // A organização do erro é a da equipe ativa (este app tem uma só equipe em produção).
    const { data: equipe } = await servidor
      .from("staff_access")
      .select("organization_id")
      .eq("status", "active")
      .eq("role", "admin")
      .is("archived_at", null)
      .limit(1)
      .maybeSingle();
    if (!equipe?.organization_id) return;
    await servidor.from("audit_logs").insert({
      organization_id: equipe.organization_id,
      acao: registro.acao,
      entidade: registro.entidade,
      metadados: registro.metadados,
    });
  } catch {
    /* gravar o erro nunca pode virar um segundo erro */
  }
}
