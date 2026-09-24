/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selo, inputCls } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { LinhaParametro } from "@/components/contrato/linha-parametro";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { GRUPOS } from "@/lib/contrato-parametros.server";
import {
  aprovarParametros,
  congelarPrevia,
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

/**
 * Coluna de lista da própria linha já carregada (JSONB anulável), não resultado
 * de consulta. Deixa explícito que a lista vazia aqui é ausência de conteúdo na
 * linha — nunca falha de leitura mascarada por coalescimento silencioso.
 */
function colunaLista<T>(valor: T[] | null | undefined): T[] {
  return Array.isArray(valor) ? valor : [];
}

function Pagina() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_condicao_comercial" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ["contrato-parametros", id] });

  const carregar = useServerFn(painelParametros);
  const carregarDestinos = useServerFn(destinosParametros);
  const importar = useServerFn(preencherDeOrigens);
  const gerar = useServerFn(gerarPrevia);
  const congelar = useServerFn(congelarPrevia);
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
      const conflitosProposta = r.proposta?.conflitos?.length ?? 0;
      toast.success(
        `${r.importados} parâmetro(s) importados como “a confirmar”${
          r.conflitos.length ? ` · ${r.conflitos.length} conflito(s) sinalizado(s)` : ""
        }${conflitosProposta ? ` · ${conflitosProposta} divergência(s) proposta × Planejador (ver campo abaixo)` : ""}.`,
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mGerar = useMutation({
    mutationFn: () => gerar({ data: { id, tipo: "rascunho" } }),
    onSuccess: (r: any) => {
      toast.success(`Rascunho v${r.versao} salvo.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mCongelar = useMutation({
    mutationFn: (v: { evento: "aprovacao"; motivo: string }) => congelar({ data: { id, ...v } }),
    onSuccess: (r: any) => {
      toast.success(r.duplicada ? `Conteúdo idêntico à v${r.versao}: versão reaproveitada.` : `Versão v${r.versao} congelada.`);
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
    mutationFn: (motivo: string) => assinar({ data: { id, ...assinatura, motivo } }),
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
        <p className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          {(q.error as Error)?.message ?? "Registro indisponível."}
          {q.error ? (
            <button
              type="button"
              onClick={() => void q.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
            >
              Tentar novamente
            </button>
          ) : null}
        </p>
      </SaasShell>
    );
  }

  const { registro, caso, cliente, template, contrato, valores, previas, completude, pendencias } = q.data as any;
  const ultimaFinal = colunaLista<any>(previas).find((p: any) => p.tipo === "final");

  return (
    <SaasShell titulo={`Contrato — ${caso?.codigo ?? "caso"}`}>
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="space-y-4">
        <CaCard variante="compacto" titulo="Fluxo: Caso → Contrato → Dados → Validar → Prévia → Aprovar → Assinatura → Financeiro">
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
              Pré-carregar do Planejador homologado
            </button>
            <button
              onClick={() => mGerar.mutate()}
              disabled={mGerar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            >
              Gerar prévia de rascunho
            </button>
            <AcaoOperacional
              rotulo="Gerar versão final"
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
              acaoExterna="congelar_versao_final_parametros"
              efeito={
                pendencias.length > 0
                  ? `Há ${pendencias.length} pendência(s) no checklist abaixo — é possível prosseguir; a pendência fica registrada.`
                  : "Congela a versão final do contrato — vira versão imutável no histórico."
              }
              onConfirmar={(motivo) => mCongelar.mutate({ evento: "aprovacao", motivo })}
            />
          </div>
        </CaCard>

        <CaCard variante="compacto" titulo={`Checklist de pendências (${pendencias.length})`}>
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
        </CaCard>

        {GRUPOS.map((g) => {
          const itens = (valores as any[]).filter((v) => v.grupo === g.chave);
          const grupoInfo = completude?.por_grupo?.[g.chave];
          return (
            <CaCard variante="compacto"
              key={g.chave}
              titulo={`${g.titulo} — ${grupoInfo?.validados ?? 0}/${grupoInfo?.total ?? itens.length} confirmados`}
            >
              <div className="space-y-3">
                {itens.map((v) => (
                  <LinhaParametro key={v.id} valor={v} aoMudar={invalidar} />
                ))}
              </div>
            </CaCard>
          );
        })}

        <CaCard variante="compacto" titulo="Prévias versionadas e anexos aplicáveis">
          <div className="space-y-2">
            {(previas as any[]).map((p) => (
              <div key={p.id} className="rounded-lg border border-navy/15 bg-cream/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-navy">
                    v{p.versao} · {p.tipo} · {p.template_code} {p.template_version ? `v${p.template_version}` : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Selo
                      texto={
                        colunaLista(p.placeholders_pendentes).length
                          ? `${p.placeholders_pendentes.length} placeholder(s) pendente(s)`
                          : "Sem placeholders pendentes"
                      }
                      tom={colunaLista(p.placeholders_pendentes).length ? "erro" : "ok"}
                    />
                    <button onClick={() => mVer.mutate(p.id)} className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80">
                      Ver prévia
                    </button>
                    {p.tipo === "final" && !p.aprovado_em && (
                      <AcaoOperacional
                        rotulo="Aprovar com revisão humana"
                        size="sm"
                        capacidade="aprovar_proposta_os_anexo_previa"
                        pendenciaGate={
                          colunaLista(p.placeholders_pendentes).length
                            ? `${p.placeholders_pendentes.length} placeholder(s) pendente(s) nesta prévia.`
                            : null
                        }
                        efeito={`Aprova a prévia v${p.versao} com revisão humana registrada.`}
                        onConfirmar={async () => {
                          await mAprovar.mutateAsync(p.id);
                        }}
                      />
                    )}
                    {p.aprovado_em && <Selo texto="Aprovada" tom="ok" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  Anexos por regra: {colunaLista<any>(p.anexos).map((a) => a.codigo).join(", ") || "—"}
                </p>
              </div>
            ))}
            {previas.length === 0 && <p className="text-sm text-navy/60">Nenhuma prévia gerada ainda.</p>}
          </div>
          {html && (
            <iframe title="Prévia do instrumento" srcDoc={html} sandbox="" className="mt-3 h-[520px] w-full rounded-lg border border-navy/15 bg-cream/40" />
          )}
        </CaCard>

        <CaCard variante="compacto" titulo="Destinos que reutilizam os parâmetros aprovados">
          <EstadoDados
            carregando={qd.isLoading}
            erro={qd.error}
            dados={qd.data?.destinos as any[] | undefined}
            aoTentarNovamente={() => void qd.refetch()}
            recurso="os destinos dos parâmetros"
            vazio="Nenhum destino registrado para estes parâmetros."
          >
            {(destinos) => (
              <ul className="space-y-1 text-sm text-navy/80">
                {destinos.map((d: any) => (
                  <li key={d.nome}>
                    <strong>{d.nome}</strong> — {d.recebe}{" "}
                    {d.liberado ? <Selo texto="liberado" tom="ok" /> : <Selo texto={d.bloqueio} tom="erro" />}
                  </li>
                ))}
              </ul>
            )}
          </EstadoDados>
          <div className="mt-3 flex flex-wrap gap-2">
            <AcaoOperacional
              rotulo="Enviar para assinatura"
              size="sm"
              acaoExterna="solicitar_assinatura"
              capacidade="aprovar_proposta_os_anexo_previa"
              pendenciaGate={
                registro.status !== "aprovado"
                  ? `Registro em situação “${registro.status}”: os parâmetros ainda não foram aprovados.`
                  : null
              }
              efeito="Gera contrato, partes e escopo a partir dos parâmetros e encaminha para assinatura."
              onConfirmar={async () => {
                await mEnviar.mutateAsync();
              }}
            />
          </div>
          {
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
              <AcaoOperacional
                rotulo="Registrar assinatura"
                variant="outline"
                size="sm"
                capacidade="aprovar_proposta_os_anexo_previa"
                acaoExterna="registrar_assinatura_externa"
                pendenciaGate={
                  ultimaFinal?.aprovado_em
                    ? null
                    : "Nenhuma prévia final aprovada ainda. A assinatura será registrada sobre parâmetros não aprovados."
                }
                validacaoFormulario={
                  !assinatura.dataAssinatura || !assinatura.origemExterna || !assinatura.referencia
                    ? "Preencha data, origem externa e referência da assinatura antes de confirmar."
                    : null
                }
                efeito="Registra a assinatura do contrato e libera o gate de cobrança."
                onConfirmar={(motivo) => {
                  if (mAssinar.isPending) return;
                  mAssinar.mutate(motivo);
                }}
              />
            </div>
          }
        </CaCard>
      </div>
    </SaasShell>
  );
}
