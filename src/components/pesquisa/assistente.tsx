import { useRef, useState } from "react";
import { toast } from "sonner";

import { Painel } from "@/components/comercial/base";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Assistente de Pesquisa Genealógica: aplica o prompt mestre ao dossiê do caso
 * e devolve o relatório auditável em streaming. Uso interno; não é parecer.
 */
export function AssistentePesquisa({ casoId }: { casoId: string }) {
  const [complemento, setComplemento] = useState("");
  const [saida, setSaida] = useState("");
  const [rodando, setRodando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const abortar = useRef<AbortController | null>(null);

  async function gerar() {
    setErro(null);
    setSaida("");
    setRodando(true);
    const controller = new AbortController();
    abortar.current = controller;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Entre novamente.");

      const resposta = await fetch("/api/pesquisa-assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ casoId, complemento }),
        signal: controller.signal,
      });

      if (!resposta.ok || !resposta.body) {
        const detalhe = await resposta.text().catch(() => "");
        throw new Error(
          resposta.status === 429
            ? "Muitas solicitações ao assistente. Aguarde um instante."
            : resposta.status === 402
              ? "Créditos de IA esgotados no espaço de trabalho."
              : detalhe || "Não foi possível gerar a análise.",
        );
      }

      const reader = resposta.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setSaida((s) => s + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setErro((e as Error).message);
    } finally {
      setRodando(false);
      abortar.current = null;
    }
  }

  return (
    <Painel titulo="Assistente de pesquisa genealógica">
      <p className="mb-3 text-xs text-navy/60">
        Analisa apenas o dossiê registrado neste caso (pessoas, hipóteses, evidências, linha do tempo e pendências) e
        devolve triagem, linha do tempo, matriz de evidências, conflitos e plano de pesquisa. Não confirma vínculo sem
        evidência, não emite parecer jurídico e não substitui a conferência documental.
      </p>

      <label className="block text-xs text-navy/70">
        Complemento para esta análise (opcional): dados trazidos pela família, restrições de acervo, dúvidas
        específicas.
        <textarea
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          className="mt-1 h-24 w-full rounded-lg border border-navy/15 bg-white p-2 text-sm text-navy"
          placeholder="Ex.: a família cita nascimento em Vêneto por volta de 1878; não há certidão localizada."
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={gerar}
          disabled={rodando}
          className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
        >
          {rodando ? "Analisando dossiê…" : "Gerar análise de pesquisa"}
        </button>
        {rodando && (
          <button
            onClick={() => abortar.current?.abort()}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy/70"
          >
            Interromper
          </button>
        )}
        {saida && !rodando && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(saida);
              toast.success("Análise copiada.");
            }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy/70"
          >
            Copiar texto
          </button>
        )}
      </div>

      {erro && <p className="mt-3 text-sm text-terracotta">{erro}</p>}

      {(saida || rodando) && (
        <pre
          className={cn(
            "mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg border border-navy/15 bg-white p-3 font-mono text-xs text-navy",
            rodando && "border-gold",
          )}
        >
          {saida || "Lendo o dossiê e organizando a triagem…"}
        </pre>
      )}
    </Painel>
  );
}
