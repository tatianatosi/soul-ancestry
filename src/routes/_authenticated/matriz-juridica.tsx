import { createFileRoute } from "@tanstack/react-router";
import { useAutoridade } from "@/components/saas/autoridade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { consolidarMatrizJuridica, listarMatrizJuridica, registrarDecisaoTema } from "@/lib/crm-desk.functions";
import { STATUS_TEMA, rotuloStatusTema, temasBloqueantesPendentes, type LinhaMatriz } from "@/lib/matriz-juridica";

export const Route = createFileRoute("/_authenticated/matriz-juridica")({
  head: () => ({
    meta: [
      { title: "Matriz jurídica interna — Clube Ancestral" },
      { name: "description", content: "Temas contratuais pendentes de revisão jurídica, sem redação de cláusula." },
      { property: "og:title", content: "Matriz jurídica interna — Clube Ancestral" },
      { property: "og:description", content: "Decisões jurídicas normativas do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MatrizPage,
});

function MatrizPage() {
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "resolver_divergencia" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — o registro de decisão segue disponível por decisão sua.";
  const carregar = useServerFn(listarMatrizJuridica);
  const registrar = useServerFn(registrarDecisaoTema);
  const consolidar = useServerFn(consolidarMatrizJuridica);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["matriz-juridica"], queryFn: () => carregar(), retry: false });
  const [edicao, setEdicao] = useState<Record<string, Record<string, string>>>({});

  const mutConsolidar = useMutation({
    mutationFn: () => consolidar(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["matriz-juridica"] }),
  });

  const mut = useMutation({
    mutationFn: (p: Parameters<typeof registrarDecisaoTema>[0]["data"]) => registrar({ data: p }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["matriz-juridica"] }),
  });

  const linhas = (q.data ?? []) as LinhaMatriz[];
  const pendentes = temasBloqueantesPendentes(linhas);

  return (
    <SaasShell
      titulo="Validação Jurídica"
      descricao="Registro de decisão por tema. Esta tela não guarda redação de cláusula e nenhum conteúdo público é versão vigente."
    >
      <div className="mb-4 rounded-xl border border-navy/10 bg-cream/50 p-4 text-sm text-navy">
        {pendentes.length
          ? `${pendentes.length} tema(s) bloqueante(s) sem decisão: assinatura permanece bloqueada.`
          : "Nenhum tema bloqueante pendente."}
      </div>

      {pendenciaVinculo ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}
      {q.isError ? (
        <p role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          Não foi possível carregar a matriz jurídica. A lista abaixo está vazia por falha de consulta, não por ausência de tema.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      {podeEscrever ? (
        <button
          type="button"
          className="mb-4 rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy"
          onClick={() => mutConsolidar.mutate()}
          disabled={mutConsolidar.isPending}
        >
          Consolidar duplicatas (arquivamento auditado, sem exclusão)
        </button>
      ) : null}

      <div className="space-y-3">
        {linhas.map((l) => {
          const e = edicao[l.tema_codigo] ?? {};
          const v = (k: keyof LinhaMatriz | string) => e[k] ?? String((l as Record<string, unknown>)[k] ?? "");
          const set = (k: string) => (val: string) => setEdicao((s) => ({ ...s, [l.tema_codigo]: { ...s[l.tema_codigo], [k]: val } }));
          return (
            <Secao
              key={l.tema_codigo}
              titulo={l.tema}
              descricao={`${l.bloqueia_assinatura ? "Bloqueia assinatura" : "Não bloqueia assinatura"} · impacto: ${l.impacto_templates.join(", ")} · status atual: ${rotuloStatusTema(l.status)}`}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Selecao
                  label="Status"
                  valor={v("status")}
                  opcoes={STATUS_TEMA.map((s) => ({ valor: s.valor, rotulo: s.rotulo }))}
                  onChange={set("status")}
                  desabilitado={!podeEscrever}
                />
                <Texto
                  label="Versão jurídica aplicável"
                  valor={v("versao_juridica_aplicavel")}
                  onChange={set("versao_juridica_aplicavel")}
                  ajuda="Sem versão aplicável, nenhuma cláusula pode ser gerada para este tema."
                  desabilitado={!podeEscrever}
                />
                <Texto
                  label="Responsável pela revisão"
                  valor={v("responsavel_revisao")}
                  onChange={set("responsavel_revisao")}
                  desabilitado={!podeEscrever}
                />
                <Texto
                  label="Referência da versão"
                  valor={v("referencia_versao")}
                  onChange={set("referencia_versao")}
                  desabilitado={!podeEscrever}
                />
                <div className="md:col-span-2">
                  <Texto label="Decisão (sem redação de cláusula)" area valor={v("decisao")} onChange={set("decisao")} desabilitado={!podeEscrever} />
                </div>
                <div className="md:col-span-2">
                  <Texto label="Justificativa interna" area valor={v("justificativa")} onChange={set("justificativa")} desabilitado={!podeEscrever} />
                </div>
              </div>
              {podeEscrever ? (
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm text-cream"
                  onClick={() =>
                    mut.mutate({
                      tema_codigo: l.tema_codigo,
                      status: v("status"),
                      decisao: v("decisao") || null,
                      justificativa: v("justificativa") || null,
                      responsavel_revisao: v("responsavel_revisao") || null,
                      versao_juridica_aplicavel: v("versao_juridica_aplicavel") || null,
                      referencia_versao: v("referencia_versao") || null,
                    })
                  }
                >
                  Registrar decisão
                </button>
              ) : null}
            </Secao>
          );
        })}
      </div>
    </SaasShell>
  );
}
