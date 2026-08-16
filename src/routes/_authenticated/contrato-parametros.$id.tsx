/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo, inputCls } from "@/components/comercial/base";
import { LinhaParametro } from "@/components/contrato/linha-parametro";
import { SaasShell } from "@/components/saas/shell";
import { GRUPOS } from "@/lib/contrato-parametros.server";
import {
  aprovarParametros,
  destinosParametros,
  enviarParaAssinatura,
  gerarPrevia,
  lerPrevia,
  painelParametros,
  preencherDeOrigens,
  registrarAssinatura,
} from "@/lib/contrato-parametros.functions";

const TITULO = "Registro mestre do contrato | Clube Ancestral";
const DESCRICAO = "Parâmetros contratuais do caso com origem, validação, prévia versionada e destinos de reuso.";

export const Route = createFileRoute("/_authenticated/contrato-parametros/$id")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ["contrato-parametros", id] });

  const carregar = useServerFn(painelParametros);
  const carregarDestinos = useServerFn(destinosParametros);
  const importar = useServerFn(preencherDeOrigens);
  const gerar = useServerFn(gerarPrevia);
  const aprovar = useServerFn(aprovarParametros);
  const enviar = useServerFn(enviarParaAssinatura);
  const assinar = useServerFn(registrarAssinatura);
  const ver = useServerFn(lerPrevia);

  const q = useQuery({ queryKey: ["contrato-parametros", id], queryFn: () => carregar({ data: { id } }) });
  const qd = useQuery({ queryKey: ["contrato-parametros", id, "destinos"], queryFn: () => carregarDestinos({ data: { id } }) });

  const [html, setHtml] = useState<string | null>(null);
  const [assinatura, setAssinatura] = useState({ dataAssinatura: "", origemExterna: "", referencia: "" });

  const mImportar = useMutation({
    mutationFn: () => importar({ data: { id } }),
    onSuccess: (r: any) => {
      toast.success(
        `${r.importados} parâmetro(s) importados como “a confirmar”${
          r.conflitos.length ? ` · ${r.conflitos.length} conflito(s) sinalizado(s)` : ""
        }.`,
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mGerar = useMutation({
    mutationFn: (tipo: "rascunho" | "final") => gerar({ data: { id, tipo } }),
    onSuccess: (r: any) => {
      toast.success(`Prévia v${r.versao} congelada.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mAprovar = useMutation({
    mutationFn: (previaId: string) => aprovar({ data: { id, previaId } }),
    onSuccess: () => {
      toast.success("Parâmetros aprovados com revisão humana registrada.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mEnviar = useMutation({
    mutationFn: () => enviar({ data: { id } }),
    onSuccess: () => {
      toast.success("Contrato, partes e escopo gerados a partir dos parâmetros.");
      invalidar();
      qc.invalidateQueries({ queryKey: ["contrato-parametros", id, "destinos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mAssinar = useMutation({
    mutationFn: () => assinar({ data: { id, ...assinatura } }),
    onSuccess: () => {
      toast.success("Assinatura registrada. Cobrança liberada pelo gate.");
      invalidar();
      qc.invalidateQueries({ queryKey: ["contrato-parametros", id, "destinos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mVer = useMutation({
    mutationFn: (previaId: string) => ver({ data: { previaId } }),
    onSuccess: (r: any) => setHtml(r.html),
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <SaasShell titulo="Registro mestre do contrato">
        <p className="text-sm text-navy/60">Carregando parâmetros…</p>
      </SaasShell>
    );
  }
  if (q.error || !q.data) {
    return (
      <SaasShell titulo="Registro mestre do contrato">
        <p className="text-sm text-terracotta">{(q.error as Error)?.message ?? "Registro indisponível."}</p>
      </SaasShell>
    );
  }

  const { registro, caso, cliente, template, contrato, valores, previas, completude, pendencias } = q.data as any;
  const ultimaFinal = (previas ?? []).find((p: any) => p.tipo === "final");

  return (
    <SaasShell titulo={`Contrato — ${caso?.codigo ?? "caso"}`}>
      <div className="space-y-4">
        <Painel titulo="Fluxo: Caso → Contrato → Dados → Validar → Prévia → Aprovar → Assinatura → Financeiro">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Selo texto={`Caso ${caso?.codigo}`} tom="neutro" />
            <Selo texto={`Cliente: ${cliente?.nome ?? "não vinculado"}`} tom="neutro" />
            <Selo texto={`Modelo: ${template?.code ?? "não selecionado"}`} tom={template ? "ok" : "erro"} />
            <Selo texto={`Situação: ${registro.status}`} tom={registro.status === "assinado" ? "ok" : "alerta"} />
            <Selo
              texto={`Completude: ${completude?.pct ?? 0}%`}
              tom={(completude?.pct ?? 0) === 100 ? "ok" : "alerta"}
            />
            {contrato && <Selo texto={`Contrato ${contrato.contract_number} · ${contrato.status}`} tom="neutro" />}
          </div>
          <p className="mt-2 text-xs text-navy/60">
            MODELO ESTUDO é o template ativo, combinado com a base contratual genérica v2. MODELO SIMPLES e Modelo 2024
            permanecem apenas como referência histórica e não podem ser selecionados.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => mImportar.mutate()}
              disabled={mImportar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            >
              Pré-carregar de CRM e proposta aprovada
            </button>
            <button
              onClick={() => mGerar.mutate("rascunho")}
              disabled={mGerar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            >
              Gerar prévia de rascunho
            </button>
            <button
              onClick={() => mGerar.mutate("final")}
              disabled={mGerar.isPending}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
            >
              Gerar versão final
            </button>
          </div>
        </Painel>

        <Painel titulo={`Checklist de pendências (${pendencias.length})`}>
          {pendencias.length === 0 ? (
            <p className="text-sm text-navy/70">Todos os parâmetros obrigatórios estão validados.</p>
          ) : (
            <ul className="space-y-1 text-sm text-navy/80">
              {pendencias.map((p: any) => (
                <li key={p.campo}>
                  <strong>{p.label}</strong> <span className="text-xs text-navy/55">({p.grupo})</span> — {p.motivo}
                </li>
              ))}
            </ul>
          )}
        </Painel>

        {GRUPOS.map((g) => {
          const itens = (valores as any[]).filter((v) => v.grupo === g.chave);
          const grupoInfo = completude?.por_grupo?.[g.chave];
          return (
            <Painel
              key={g.chave}
              titulo={`${g.titulo} — ${grupoInfo?.validados ?? 0}/${grupoInfo?.total ?? itens.length} confirmados`}
            >
              <div className="space-y-3">
                {itens.map((v) => (
                  <LinhaParametro key={v.id} valor={v} aoMudar={invalidar} />
                ))}
              </div>
            </Painel>
          );
        })}

        <Painel titulo="Prévias versionadas e anexos aplicáveis">
          <div className="space-y-2">
            {(previas as any[]).map((p) => (
              <div key={p.id} className="rounded-lg border border-navy/15 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-navy">
                    v{p.versao} · {p.tipo} · {p.template_code} {p.template_version ? `v${p.template_version}` : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Selo
                      texto={
                        (p.placeholders_pendentes ?? []).length
                          ? `${p.placeholders_pendentes.length} placeholder(s) pendente(s)`
                          : "Sem placeholders pendentes"
                      }
                      tom={(p.placeholders_pendentes ?? []).length ? "erro" : "ok"}
                    />
                    <button onClick={() => mVer.mutate(p.id)} className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80">
                      Ver prévia
                    </button>
                    {p.tipo === "final" && !p.aprovado_em && (
                      <button onClick={() => mAprovar.mutate(p.id)} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
                        Aprovar com revisão humana
                      </button>
                    )}
                    {p.aprovado_em && <Selo texto="Aprovada" tom="ok" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  Anexos por regra: {(p.anexos ?? []).map((a: any) => a.codigo).join(", ") || "—"}
                </p>
              </div>
            ))}
            {previas.length === 0 && <p className="text-sm text-navy/60">Nenhuma prévia gerada ainda.</p>}
          </div>
          {html && (
            <iframe title="Prévia do instrumento" srcDoc={html} sandbox="" className="mt-3 h-[520px] w-full rounded-lg border border-navy/15 bg-white" />
          )}
        </Painel>

        <Painel titulo="Destinos que reutilizam os parâmetros aprovados">
          <ul className="space-y-1 text-sm text-navy/80">
            {(qd.data?.destinos ?? []).map((d: any) => (
              <li key={d.nome}>
                <strong>{d.nome}</strong> — {d.recebe}{" "}
                {d.liberado ? <Selo texto="liberado" tom="ok" /> : <Selo texto={d.bloqueio} tom="erro" />}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => mEnviar.mutate()}
              disabled={mEnviar.isPending || registro.status !== "aprovado"}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
            >
              Enviar para assinatura
            </button>
          </div>
          {ultimaFinal?.aprovado_em && (
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <input
                className={inputCls}
                type="date"
                value={assinatura.dataAssinatura}
                onChange={(e) => setAssinatura({ ...assinatura, dataAssinatura: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Origem externa da assinatura"
                maxLength={200}
                value={assinatura.origemExterna}
                onChange={(e) => setAssinatura({ ...assinatura, origemExterna: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Referência / comprovante"
                maxLength={200}
                value={assinatura.referencia}
                onChange={(e) => setAssinatura({ ...assinatura, referencia: e.target.value })}
              />
              <button
                onClick={() => mAssinar.mutate()}
                disabled={mAssinar.isPending}
                className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
              >
                Registrar assinatura
              </button>
            </div>
          )}
        </Painel>
      </div>
    </SaasShell>
  );
}
