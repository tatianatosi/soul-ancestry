import { configPublicaDoNavegador } from "@/lib/config-publica";

/**
 * Aviso na tela quando a configuração do Supabase não chegou ao navegador.
 *
 * 26/08/2026 — a Proprietária ficou horas sem conseguir entrar, e a tela não
 * dizia nada: o botão só falhava. A causa real (variáveis ausentes no ambiente
 * de deploy) só aparecia no console do navegador, onde ela não ia olhar.
 *
 * Este bloco troca o silêncio por uma frase que diz exatamente o que falta e
 * onde. Não expõe valor nenhum — só informa se a configuração chegou.
 */
export function AvisoConfiguracao() {
  // Em build com `VITE_*` embutida, o cliente funciona mesmo sem injeção.
  const temBuildTime = !!import.meta.env.VITE_SUPABASE_URL;
  const temRuntime = !!configPublicaDoNavegador();
  if (temBuildTime || temRuntime) return null;

  return (
    <div
      role="alert"
      className="mt-5 rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-left"
    >
      <p className="text-sm font-medium text-terracotta">
        O login não vai funcionar neste endereço ainda.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-navy/70">
        Este site não recebeu a configuração de acesso ao banco. Não é senha errada — o aplicativo
        nem chega a tentar entrar.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-navy/70">
        Para resolver: no painel da Vercel, em Settings → Environment Variables, as variáveis{" "}
        <code className="rounded bg-navy/5 px-1">SUPABASE_URL</code> e{" "}
        <code className="rounded bg-navy/5 px-1">SUPABASE_PUBLISHABLE_KEY</code> precisam estar
        marcadas para este ambiente. Depois, use Redeploy — mudar a variável sozinha não altera um
        site já publicado.
      </p>
    </div>
  );
}
