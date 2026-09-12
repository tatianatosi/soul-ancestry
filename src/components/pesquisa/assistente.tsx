import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Painel } from "@/components/comercial/base";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Lacuna = { campo: string; motivo: string };
type Verificacao = {
  case_id: string;
  codigo: string;
  titulo: string;
  cliente: string;
  demo: boolean;
  lacunas: Lacuna[];
  suficiente: boolean;
  mensagem?: string;
  orientacao?: string;
};

const SELO_DEMO = "DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO";
const MENSAGEM_BLOQUEIO = "Não há dados suficientes para analisar este caso.";
const ORIENTACAO_BLOQUEIO =
  "Este caso ainda não possui dados suficientes para uma análise responsável. " +
  "Preencha ou vincule informações verificáveis a este mesmo caso antes de solicitar uma análise. " +
  "Nenhum outro caso será usado como substituto.";

/**
 * Assistente de Pesquisa Genealógica: aplica o prompt mestre ao dossiê DESTE caso.
 * Nunca troca de caso, nunca usa o caso de demonstração como substituto e nunca
 * preenche campo faltante por inferência.
 */
export function AssistentePesquisa({ casoId }: { casoId: string }) {
  const [complemento, setComplemento] = useState("");
  const [saida, setSaida] = useState("");
  const [rodando, setRodando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [verificacao, setVerificacao] = useState<Verificacao | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [demoConfirmada, setDemoConfirmada] = useState(false);
  const [bloqueio, setBloqueio] = useState<{ mensagem: string; lacunas: Lacuna[] } | null>(null);
  const [rascunho, setRascunho] = useState(false);
  const abortar = useRef<AbortController | null>(null);

  const token = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token;
    if (!t) throw new Error("Sessão expirada. Entre novamente.");
    return t;
  }, []);

  const verificar = useCallback(async () => {
    setErro(null);
    try {
      const t = await token();
      const r = await fetch("/api/pesquisa-assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ casoId, complemento, verificar: true }),
      });
      if (!r.ok) throw new Error((await r.text()) || "Não foi possível verificar o caso.");
      setVerificacao((await r.json()) as Verificacao);
    } catch (e) {
      setErro((e as Error).message);
    }
  }, [casoId, complemento, token]);

  useEffect(() => {
    setVerificacao(null);
    setConfirmado(false);
    setDemoConfirmada(false);
    setBloqueio(null);
    setSaida("");
    void verificar();
    // Reverifica somente quando o caso muda; o complemento é reavaliado ao executar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casoId]);

  async function gerar() {
    setErro(null);
    setBloqueio(null);
    setSaida("");
    setRodando(true);
    const controller = new AbortController();
    abortar.current = controller;
    try {
      const t = await token();
      const resposta = await fetch("/api/pesquisa-assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({
          casoId,
          casoIdConfirmado: verificacao?.case_id === casoId ? casoId : null,
          complemento,
          executarDemonstracao: verificacao?.demo ? demoConfirmada : false,
        }),
        signal: controller.signal,
      });

      if (resposta.status === 422 || resposta.status === 409) {
        const corpo = (await resposta.json().catch(() => null)) as
          | { mensagem?: string; lacunas?: Lacuna[] }
          | null;
        setBloqueio({
          mensagem: corpo?.mensagem ?? "Não há dados suficientes para análise deste caso.",
          lacunas: corpo?.lacunas ?? [],
        });
        void verificar();
        return;
      }

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

  const suficiente = verificacao?.suficiente ?? false;
  // Autoridade operacional: as pré-condições de dado (verificação feita,
  // confirmação, suficiência, confirmação de demo) deixam de travar o botão.
  // Continuam visíveis como pendência e o servidor revalida a execução.
  const pendenciaExecucao =
    [
      !verificacao ? "Verificação do caso ainda não executada." : null,
      verificacao && verificacao.case_id !== casoId ? "A verificação carregada é de outro caso." : null,
      !confirmado ? "Conferência dos dados do caso não confirmada." : null,
      verificacao && !suficiente ? "Dados do caso considerados insuficientes pela verificação." : null,
      verificacao?.demo && !demoConfirmada ? "Caso de demonstração sem confirmação explícita." : null,
    ]
      .filter(Boolean)
      .join(" ") || null;

  return (
    <Painel titulo="Assistente de pesquisa genealógica">
      <p className="mb-3 text-xs text-navy/60">
        Analisa exclusivamente o dossiê registrado neste caso. Se faltarem dados obrigatórios, a análise é bloqueada —
        nenhum outro caso é usado como substituto e nenhum campo é preenchido por inferência.
      </p>

      {verificacao && (
        <div className="rounded-lg border border-navy/15 bg-cream/60 p-3 text-xs text-navy/80">
          <p className="rounded-md border-2 border-gold bg-navy px-3 py-2 text-sm font-semibold text-cream">
            Caso em análise: {verificacao.case_id} — {verificacao.cliente}
          </p>
          <p className="mt-1">
            <strong>{verificacao.codigo}</strong> — {verificacao.titulo}
          </p>
          {verificacao.demo && (
            <p className="mt-2 inline-flex rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-cream">
              {SELO_DEMO}
            </p>
          )}
          <label className="mt-2 flex items-start gap-2">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => setConfirmado(e.target.checked)}
              className="mt-0.5"
            />
            <span>Confirmo que o case_id acima é o caso correto para esta análise.</span>
          </label>
          {verificacao.demo && (
            <label className="mt-1 flex items-start gap-2">
              <input
                type="checkbox"
                checked={demoConfirmada}
                onChange={(e) => setDemoConfirmada(e.target.checked)}
                className="mt-0.5"
              />
              <span>Executar demonstração com dados fictícios.</span>
            </label>
          )}
        </div>
      )}

      {verificacao && !suficiente && (
        <div className="mt-3 rounded-lg border border-terracotta/40 bg-terracotta/10 p-3 text-xs text-terracotta">
          <p className="font-semibold">{verificacao.mensagem ?? MENSAGEM_BLOQUEIO}</p>
          <p className="mt-1">{verificacao.orientacao ?? ORIENTACAO_BLOQUEIO}</p>
          <p className="mt-2 font-medium">Campos faltantes:</p>
          <ul className="mt-1 list-disc pl-4">
            {verificacao.lacunas.map((l) => (
              <li key={l.campo}>
                {l.campo} — {l.motivo}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setRascunho(true);
                toast.success("Rascunho do complemento mantido nesta tela.");
              }}
              className="rounded-lg border border-terracotta/40 px-3 py-1"
            >
              Salvar rascunho
            </button>
            <button onClick={() => void verificar()} className="rounded-lg border border-terracotta/40 px-3 py-1">
              Preencher dados
            </button>
          </div>
          {rascunho && <p className="mt-2">Rascunho mantido. Nenhuma análise foi executada.</p>}
        </div>
      )}


      <label className="mt-3 block text-xs text-navy/70">
        Complemento para esta análise (opcional): dados trazidos pela família, restrições de acervo, dúvidas
        específicas.
        <textarea
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          className="mt-1 h-24 w-full rounded-lg border border-navy/15 bg-cream/40 p-2 text-sm text-navy"
          placeholder="Descreva apenas informações reais deste caso. Textos de exemplo bloqueiam a análise."
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={gerar}
          disabled={rodando}
          title={pendenciaExecucao ?? undefined}
          className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
        >
          {rodando ? "Analisando dossiê…" : "Gerar análise de pesquisa"}
        </button>
        {pendenciaExecucao ? (
          <p className="w-full text-xs text-navy/70">Pendência registrada: {pendenciaExecucao}</p>
        ) : null}
        {!rodando && (
          <button
            onClick={() => void verificar()}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy/70"
          >
            Reverificar dados do caso
          </button>
        )}
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

      {bloqueio && (
        <div className="mt-3 rounded-lg border border-terracotta/40 bg-terracotta/10 p-3 text-xs text-terracotta">
          <p className="font-semibold">{bloqueio.mensagem}</p>
          <p className="mt-1">{ORIENTACAO_BLOQUEIO}</p>
          {bloqueio.lacunas.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {bloqueio.lacunas.map((l) => (
                <li key={l.campo}>
                  {l.campo} — {l.motivo}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1">Ações disponíveis: salvar rascunho ou preencher dados.</p>
        </div>
      )}

      {erro && <p className="mt-3 text-sm text-terracotta">{erro}</p>}

      {(saida || rodando) && (
        <>
          {verificacao?.demo && (
            <p className="mt-4 inline-flex rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-cream">
              {SELO_DEMO}
            </p>
          )}
          <pre
            className={cn(
              "mt-2 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg border border-navy/15 bg-cream/40 p-3 font-mono text-xs text-navy",
              rodando && "border-gold",
            )}
          >
            {verificacao?.demo && saida ? `${SELO_DEMO}\n\n` : ""}
            {saida || "Lendo o dossiê e organizando a triagem…"}
          </pre>
        </>
      )}
    </Painel>
  );
}
