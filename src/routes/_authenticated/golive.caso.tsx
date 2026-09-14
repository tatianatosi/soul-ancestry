import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { useGoLive } from "@/components/golive/dados";
import { publicarProjecaoApp } from "@/lib/portal-atendimento.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/caso")({
  head: () => ({
    meta: [
      { title: "Caso Ana — Go-live Clube Ancestral" },
      { name: "description", content: "Pessoas, jornada, documentos e microentregas do caso canônico, com publicação manual." },
      { property: "og:title", content: "Caso Ana — Go-live Clube Ancestral" },
      { property: "og:description", content: "Pessoas, jornada, documentos e microentregas do caso canônico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasoGoLive,
});

const JORNADA = ["D0 — Aceite", "D30 — Onboarding", "D90 — Pesquisa", "D180 — Preparação", "D365 — Protocolo"];

function CasoGoLive() {
  const { data, isPending, refetch } = useGoLive();
  const publicar = useServerFn(publicarProjecaoApp);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const caso = data?.encontrado ? data : null;

  async function publicarMicroentrega() {
    if (!caso) return;
    setEnviando(true);
    try {
      await publicar({ data: { caseId: caso.caso.id, tipo: "marco", conteudo: texto } });
      setTexto("");
      toast.success("Publicado para o App Cliente.");
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível publicar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GoLiveShell titulo="Caso Ana" descricao="Pessoas, jornada, documentos e microentregas.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {!caso && !isPending ? <Vazio cta={<Link to="/golive"><Button size="sm">Voltar para Hoje</Button></Link>} /> : null}

      {caso ? (
        <>
          <Bloco titulo="Pessoas">
            {caso.pessoas.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.pessoas.map((p) => (
                  <li key={p.id} className="break-words">
                    {p.nome} {p.papel ? <span className="text-navy/55">— {p.papel}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/golive/pesquisa"><Button size="sm">Registrar pessoas na pesquisa</Button></Link>} />
            )}
          </Bloco>

          <Bloco titulo="Jornada D0–D365">
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {JORNADA.map((etapa) => (
                <li key={etapa} className="min-w-0 rounded-xl border border-navy/10 bg-cream px-3 py-2 text-xs text-navy">
                  {etapa}
                </li>
              ))}
            </ol>
            <p className="text-xs text-navy/55">Etapa atual: {caso.plano?.fase ?? caso.caso.fase ?? "Sem itens nesta etapa"}</p>
          </Bloco>

          <Bloco titulo="Documentos">
            {caso.documentos.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.documentos.map((d) => (
                  <li key={d.id} className="break-words">
                    {d.titulo} {d.status ? <span className="text-navy/55">— {d.status}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Button size="sm" variant="outline" disabled>Anexar documento no caso</Button>} />
            )}
          </Bloco>

          <Bloco titulo="Microentregas">
            {caso.microentregas.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.microentregas.map((m) => (
                  <li key={m.id} className="break-words">
                    {m.titulo} {m.status ? <span className="text-navy/55">— {m.status}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<span className="text-sm text-navy/60">Publique uma atualização abaixo.</span>} />
            )}
          </Bloco>

          <Bloco titulo="Publicar microentrega no App Cliente">
            <label className="block text-xs uppercase tracking-wide text-navy/50" htmlFor="texto-publicacao">
              Texto para a cliente
            </label>
            <textarea
              id="texto-publicacao"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              className="w-full max-w-full rounded-xl border border-navy/15 bg-white p-3 text-sm text-navy"
              placeholder="Ex.: Concluímos a leitura do registro de nascimento do bisavô."
            />
            <Button onClick={() => void publicarMicroentrega()} disabled={enviando || texto.trim().length < 5}>
              {enviando ? "Publicando…" : "Publicar para a cliente"}
            </Button>
            <p className="text-xs text-navy/55">
              Publicados até agora: {caso.publicados.length}. <Link to="/golive/app" className="underline">Ver no App Cliente</Link>
            </p>
          </Bloco>
        </>
      ) : null}
    </GoLiveShell>
  );
}
