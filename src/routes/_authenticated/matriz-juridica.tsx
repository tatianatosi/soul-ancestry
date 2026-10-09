import { createFileRoute } from "@tanstack/react-router";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { consolidarMatrizJuridica, listarMatrizJuridica, registrarDecisaoTema } from "@/lib/crm-desk.functions";
import { STATUS_TEMA, rotuloStatusTema, temasBloqueantesPendentes, type LinhaMatriz } from "@/lib/matriz-juridica";
import { separarNotaTecnica } from "@/lib/rotulo-negocio";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

export const Route = createFileRoute("/_authenticated/matriz-juridica")({
  head: () => ({
    meta: [
      { title: "Validação Jurídica — Clube Ancestral" },
      { name: "description", content: "Temas contratuais pendentes de revisão jurídica, sem redação de cláusula." },
      { property: "og:title", content: "Validação Jurídica — Clube Ancestral" },
      { property: "og:description", content: "Decisões jurídicas normativas do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MatrizPage,
});

function MatrizPage() {
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "resolver_divergencia" });
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca campo ou botão desabilitado. A decisão fica em <AcaoOperacional>.
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — o registro de decisão segue disponível por decisão sua.";
  const carregar = useServerFn(listarMatrizJuridica);
  const registrar = useServerFn(registrarDecisaoTema);
  const consolidar = useServerFn(consolidarMatrizJuridica);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["matriz-juridica"], queryFn: () => carregar(), retry: false });
  const [edicao, setEdicao] = useState<Record<string, Record<string, string>>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(edicao).length > 0);

  const mutConsolidar = useMutation({
    mutationFn: () => consolidar(),
    onSuccess: () => {
      toast.success("Matriz jurídica consolidada.");
      void qc.invalidateQueries({ queryKey: ["matriz-juridica"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível consolidar a matriz."),
  });

  const mut = useMutation({
    mutationFn: (p: Parameters<typeof registrarDecisaoTema>[0]["data"]) => registrar({ data: p }),
    onSuccess: () => {
      toast.success("Decisão do tema registrada.");
      void qc.invalidateQueries({ queryKey: ["matriz-juridica"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível registrar a decisão."),
  });

  const linhas = q.data as LinhaMatriz[] | undefined;
  const pendentes = linhas ? temasBloqueantesPendentes(linhas) : [];

  return (
    <SaasShell
      titulo="Validação Jurídica"
      descricao="Registro de decisão por tema. Esta tela não guarda redação de cláusula e nenhum conteúdo público é versão vigente."
    >
      <div className="mb-4 rounded-xl border border-navy/10 bg-cream/50 p-4 text-sm text-navy">
        {pendentes.length
          ? `${pendentes.length} tema(s) bloqueante(s) sem decisão: assinatura fica como pendência.`
          : "Nenhum tema bloqueante pendente."}
      </div>

      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="mb-4">
        <AcaoOperacional
          rotulo="Consolidar duplicatas (arquivamento auditado, sem exclusão)"
          capacidade="resolver_divergencia"
          pendenciaGate={pendenciaVinculo}
          efeito="Arquiva temas duplicados da matriz com registro auditado. Nenhum tema é excluído."
          variant="outline"
          onConfirmar={async () => {
            await mutConsolidar.mutateAsync();
          }}
        />
      </div>

      <EstadoDados<LinhaMatriz>
        carregando={q.isLoading}
        erro={q.error}
        dados={linhas}
        aoTentarNovamente={() => void q.refetch()}
        recurso="a matriz jurídica"
        vazio="Nenhum tema jurídico cadastrado ainda."
      >
        {(itens) => (
      <div className="space-y-3">
        {itens.map((l) => {
          const e = edicao[l.tema_codigo] ?? {};
          const v = (k: keyof LinhaMatriz | string) => e[k] ?? String((l as Record<string, unknown>)[k] ?? "");
          const set = (k: string) => (val: string) => setEdicao((s) => ({ ...s, [l.tema_codigo]: { ...s[l.tema_codigo], [k]: val } }));
          const notaJustificativa = separarNotaTecnica(String(l.justificativa ?? ""));
          const justificativaHumana = e.justificativa !== undefined ? e.justificativa : notaJustificativa.humana;
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
                />
                <Texto
                  label="Versão jurídica aplicável"
                  valor={v("versao_juridica_aplicavel")}
                  onChange={set("versao_juridica_aplicavel")}
                  ajuda="Sem versão aplicável, nenhuma cláusula pode ser gerada para este tema."
                />
                <Texto
                  label="Responsável pela revisão"
                  valor={v("responsavel_revisao")}
                  onChange={set("responsavel_revisao")}
                />
                <Texto
                  label="Referência da versão"
                  valor={v("referencia_versao")}
                  onChange={set("referencia_versao")}
                />
                <div className="md:col-span-2">
                  <Texto label="Decisão (sem redação de cláusula)" area valor={v("decisao")} onChange={set("decisao")} />
                </div>
                <div className="md:col-span-2">
                  <Texto
                    label="Justificativa interna"
                    area
                    valor={justificativaHumana}
                    onChange={set("justificativa")}
                  />
                  {notaJustificativa.tecnica ? (
                    <details className="mt-2 rounded-lg border border-navy/10 bg-navy/5 px-3 py-2 text-xs text-navy/60">
                      <summary className="cursor-pointer font-medium text-navy/70">Detalhes técnicos</summary>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px]">{notaJustificativa.tecnica}</pre>
                    </details>
                  ) : null}
                </div>
              </div>
              <div className="mt-3">
                <AcaoOperacional
                  rotulo="Registrar decisão"
                  capacidade="resolver_divergencia"
                  pendenciaGate={pendenciaVinculo}
                  efeito={`Grava a decisão interna do tema “${l.tema}”. Não gera nem publica cláusula.`}
                  onConfirmar={async () => {
                    await mut.mutateAsync({
                      tema_codigo: l.tema_codigo,
                      status: v("status"),
                      decisao: v("decisao") || null,
                      justificativa:
                        [justificativaHumana.trim(), notaJustificativa.tecnica].filter(Boolean).join("\n") || null,
                      responsavel_revisao: v("responsavel_revisao") || null,
                      versao_juridica_aplicavel: v("versao_juridica_aplicavel") || null,
                      referencia_versao: v("referencia_versao") || null,
                    });
                  }}
                />
              </div>
            </Secao>
          );
        })}
      </div>
        )}
      </EstadoDados>
    </SaasShell>
  );
}
