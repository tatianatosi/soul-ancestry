/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo, inputCls, moeda } from "@/components/comercial/base";
import { AnexosAplicaveis } from "@/components/contrato/anexos-aplicaveis";
import { ConflitoCoerencia } from "@/components/contrato/conflito-coerencia";
import { LinhaParametro } from "@/components/contrato/linha-parametro";
import { PainelBloqueios } from "@/components/contrato/painel-bloqueios";
import { SaasShell } from "@/components/saas/shell";
import { agruparAuditoria, bloqueiosResolutivos, temBloqueioImpeditivo } from "@/lib/bloqueios-dicionario";
import { GRUPOS } from "@/lib/contrato-parametros.server";

import {
  aprovarParametros,
  enviarParaAssinatura,
  gerarPrevia,
  lerPrevia,
  preencherDeOrigens,
  registrarAssinatura,
} from "@/lib/contrato-parametros.functions";
import { abrirPreparacaoContrato, auditoriaPreparacao, solicitarRevisaoHumana } from "@/lib/contrato-preparar.functions";

const TITULO = "Preparar contrato do caso | Clube Ancestral";
const DESCRICAO = "Ficha única parametrizável e prévia contratual do caso, reaproveitando proposta, modelo ativo e anexos existentes.";

const SECOES: { chave: string; titulo: string; grupos: string[] }[] = [
  { chave: "A", titulo: "A. Partes e assinaturas", grupos: ["partes", "membros"] },
  { chave: "B", titulo: "B. Escopo", grupos: ["objeto", "servicos"] },
  { chave: "C", titulo: "C. Comercial", grupos: ["comerciais"] },
  { chave: "D", titulo: "D. Controle", grupos: ["assinatura"] },
];

export const Route = createFileRoute("/_authenticated/casos/$caseId/contrato/preparar")({
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
  const { caseId } = Route.useParams();
  const qc = useQueryClient();
  const chave = ["contrato-preparar", caseId];
  const invalidar = () => qc.invalidateQueries({ queryKey: chave });

  const abrir = useServerFn(abrirPreparacaoContrato);
  const importar = useServerFn(preencherDeOrigens);
  const gerar = useServerFn(gerarPrevia);
  const aprovar = useServerFn(aprovarParametros);
  const enviar = useServerFn(enviarParaAssinatura);
  const assinar = useServerFn(registrarAssinatura);
  const ver = useServerFn(lerPrevia);
  const revisar = useServerFn(solicitarRevisaoHumana);
  const auditoria = useServerFn(auditoriaPreparacao);

  const q = useQuery({ queryKey: chave, queryFn: () => abrir({ data: { caseId } }), retry: false });
  const registroId = (q.data as any)?.registro?.id as string | undefined;
  const qa = useQuery({
    queryKey: [...chave, "auditoria", registroId],
    queryFn: () => auditoria({ data: { id: registroId as string } }),
    enabled: Boolean(registroId),
  });

  const [html, setHtml] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [assinatura, setAssinatura] = useState({ dataAssinatura: "", origemExterna: "", referencia: "" });

  const mImportar = useMutation({
    mutationFn: () => importar({ data: { id: registroId as string } }),
    onSuccess: (r: any) => {
      toast.success(
        `${r.importados} campo(s) carregados como “a confirmar”${r.conflitos.length ? ` · ${r.conflitos.length} conflito(s)` : ""}${
          r.limpos?.length ? ` · ${r.limpos.length} valor(es) fora da convenção homologada devolvidos a pendência` : ""
        }.`,
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mGerar = useMutation({
    mutationFn: (tipo: "rascunho" | "final") => gerar({ data: { id: registroId as string, tipo } }),
    onSuccess: (r: any) => {
      toast.success(`Prévia v${r.versao} gerada pelo MODELO ESTUDO.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mAprovar = useMutation({
    mutationFn: (previaId: string) => aprovar({ data: { id: registroId as string, previaId } }),
    onSuccess: () => {
      toast.success("Revisão humana aprovada e registrada.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mRevisar = useMutation({
    mutationFn: () => revisar({ data: { id: registroId as string, nota } }),
    onSuccess: () => {
      toast.success("Revisão humana solicitada e registrada em auditoria.");
      setNota("");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mEnviar = useMutation({
    mutationFn: () => enviar({ data: { id: registroId as string } }),
    onSuccess: () => {
      toast.success("Solicitação de assinatura criada a partir dos parâmetros aprovados.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mAssinar = useMutation({
    mutationFn: () => assinar({ data: { id: registroId as string, ...assinatura } }),
    onSuccess: () => {
      toast.success("Assinatura externa registrada. Gates de financeiro e ativação seguem próprios.");
      invalidar();
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
      <SaasShell titulo="Preparar contrato">
        <p className="text-sm text-navy/60">Carregando o caso…</p>
      </SaasShell>
    );
  }
  if (q.error || !q.data) {
    return (
      <SaasShell titulo="Preparar contrato">
        <Painel titulo="Preparação bloqueada">
          <p className="text-sm text-terracotta">{(q.error as Error)?.message ?? "Caso indisponível para esta organização."}</p>
        </Painel>
      </SaasShell>
    );
  }

  const d = q.data as any;
  const bloqueios = d.bloqueios as { chave: string; motivo: string }[];
  const bloqueado = bloqueios.length > 0;
  const resolutivos = bloqueiosResolutivos(bloqueios, (d.valores ?? []) as any);
  const impeditivos = resolutivos.filter((b) => b.impeditivo);
  const revisaoTravada = temBloqueioImpeditivo(resolutivos);
  const eventos = agruparAuditoria((qa.data?.eventos ?? []) as any[]);
  const ultimaFinal = (d.previas ?? []).find((p: any) => p.tipo === "final");
  const finalAprovada = (d.previas ?? []).find((p: any) => p.tipo === "final" && p.aprovado_em);


  return (
    <SaasShell titulo={`Preparar contrato — ${d.caso.codigo}`}>
      <div className="space-y-4">
        <Painel titulo={`Caso em preparação: ${d.caso.codigo} — ${d.cliente?.nome ?? "cliente não vinculado"}`}>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Selo texto={`Situação da ficha: ${d.registro.status}`} tom={d.registro.status === "assinado" ? "ok" : "alerta"} />
            <Selo texto={`Completude ${d.completude?.pct ?? 0}%`} tom={(d.completude?.pct ?? 0) === 100 ? "ok" : "alerta"} />
            <Selo texto={`Modelo: ${d.modelo?.code ?? "não localizado"}`} tom={d.modelo ? "ok" : "erro"} />
            <Selo texto={`Base: ${d.base?.code ?? "não localizada"}`} tom={d.base ? "ok" : "erro"} />
            {d.contrato && <Selo texto={`Contrato ${d.contrato.contract_number} · ${d.contrato.status}`} tom="neutro" />}
          </div>
          {d.aliasDe && (
            <p className="mt-2 rounded border border-gold/50 bg-gold/10 p-2 text-xs text-navy">
              Referência legada/interna corrigida. Este fluxo opera no caso <strong>{d.caso.codigo}</strong>. A referência{" "}
              <strong>{d.aliasDe}</strong> é interna incorreta: preservada apenas como histórico, sem criar, contratar, assinar,
              cobrar, pesquisar ou operar por ela — nada foi copiado nem duplicado.
            </p>
          )}

          {d.caso.codigos_legados?.length > 0 && (
            <p className="mt-2 text-xs text-navy/60">
              Códigos legados registrados (somente referência): {d.caso.codigos_legados.join(", ")}
            </p>
          )}
          <p className="mt-2 text-xs text-navy/60">
            Somente dados deste caseId. Nenhum dado DEMO, de outro caso, placeholder automático ou inferência é utilizado; campo sem
            informação real permanece vazio.
          </p>
        </Painel>

        <Painel titulo="Entidades reaproveitadas (nada é duplicado)">
          <ul className="space-y-1 text-sm text-navy/80">
            <li>
              <strong>Proposta:</strong>{" "}
              {d.proposta ? (
                <>
                  v{d.proposta.versao} · {d.proposta.status} · {moeda(d.proposta.valor, d.proposta.moeda)} ·{" "}
                  {d.proposta.forma_pagamento ?? "condição não informada"}
                </>
              ) : (
                <span className="text-terracotta">não localizada</span>
              )}
            </li>
            <li>
              <strong>Ficha de parâmetros:</strong> única por caso (reaproveitada quando já existe)
            </li>
            <li>
              <strong>Template ativo:</strong> {d.modelo ? `${d.modelo.name} v${d.modelo.template_version}` : "—"} +{" "}
              {d.base ? `${d.base.name} v${d.base.template_version}` : "—"}
            </li>
            <li>
              <strong>Membros/beneficiários do caso ({d.membros.length}):</strong>{" "}
              {d.membros.length
                ? d.membros.map((m: any) => `${m.nome}${m.requerente ? " (requerente)" : ""} — ${m.parentesco ?? "—"}`).join(" · ")
                : "nenhum vinculado"}
            </li>
            <li>
              <strong>Anexos pelas regras existentes:</strong> {d.anexos.map((a: any) => a.codigo).join(", ") || "—"}
            </li>
            <li>
              <strong>Cadastro CRM:</strong> {d.cliente ? [d.cliente.email, d.cliente.telefone].filter(Boolean).join(" · ") || "sem contato" : "—"}
            </li>
          </ul>
          <div className="mt-3">
            <button
              onClick={() => mImportar.mutate()}
              disabled={mImportar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            >
              Pré-carregar do Planejador homologado (fonte única, sem redigitação)
            </button>
          </div>
        </Painel>

        <ConflitoCoerencia
          coerencia={d.coerencia}
          valorPaisRota={(d.valores ?? []).find((v: any) => v.campo === "pais_rota") ?? null}
          aoCorrigir={invalidar}
        />

        <div id="bloqueios">
          <PainelBloqueios bloqueios={bloqueios} valores={d.valores ?? []} pendencias={d.pendencias ?? []} />
        </div>

        <div id="anexos">
          <AnexosAplicaveis valores={d.valores ?? []} anexosGerados={d.anexos ?? []} />
        </div>

        <div id="ficha" className="space-y-4">
          {SECOES.map((s) => (
            <Painel key={s.chave} titulo={s.titulo}>
              <div className="space-y-3">
                {s.grupos.flatMap((g) => {
                  const itens = (d.valores as any[]).filter((v) => v.grupo === g);
                  const titulo = GRUPOS.find((x) => x.chave === g)?.titulo ?? g;
                  return [
                    <p key={`t-${g}`} className="text-xs uppercase tracking-wide text-navy/50">
                      {titulo}
                    </p>,
                    ...itens.map((v) => <LinhaParametro key={v.id} valor={v} aoMudar={invalidar} />),
                  ];
                })}
              </div>
            </Painel>
          ))}
        </div>


        <Painel titulo="Prévia contratual versionada">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => mGerar.mutate("rascunho")}
              disabled={mGerar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            >
              Gerar prévia de rascunho
            </button>
            <button
              onClick={() => mGerar.mutate("final")}
              disabled={mGerar.isPending || bloqueios.some((b) => b.chave !== "revisao_humana")}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
            >
              Gerar versão final
            </button>
          </div>
          <p className="mt-2 text-xs text-navy/60">
            A prévia é montada exclusivamente pelo MODELO ESTUDO + base v2 + anexos aplicáveis, vinculada a este caseId, à proposta e à
            versão do template. Cláusulas e anexos não podem ser colados manualmente.
          </p>
          <div className="mt-3 space-y-2">
            {(d.previas as any[]).map((p) => (
              <div key={p.id} className="rounded-lg border border-navy/15 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-navy">
                    v{p.versao} · {p.tipo} · {p.template_code} v{p.template_version} · caso {d.caso.codigo} · proposta{" "}
                    {d.registro.proposal_id ? "vinculada" : "ausente"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Selo
                      texto={
                        (p.placeholders_pendentes ?? []).length
                          ? `${p.placeholders_pendentes.length} pendência(s)`
                          : "Sem placeholders"
                      }
                      tom={(p.placeholders_pendentes ?? []).length ? "erro" : "ok"}
                    />
                    <button onClick={() => mVer.mutate(p.id)} className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80">
                      Ver prévia
                    </button>
                    {p.tipo === "final" && !p.aprovado_em && (
                      <button onClick={() => mAprovar.mutate(p.id)} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
                        Aprovar revisão humana
                      </button>
                    )}
                    {p.aprovado_em && <Selo texto="Revisão aprovada" tom="ok" />}
                  </div>
                </div>
              </div>
            ))}
            {d.previas.length === 0 && <p className="text-sm text-navy/60">Nenhuma prévia gerada ainda.</p>}
          </div>
          {html && (
            <iframe
              title="Prévia do instrumento"
              srcDoc={html}
              sandbox=""
              className="mt-3 h-[520px] w-full rounded-lg border border-navy/15 bg-white"
            />
          )}
        </Painel>

        <Painel titulo="Revisão humana e assinatura">
          {bloqueado ? (
            <div className="space-y-2">
              <p className="text-sm text-navy/70">
                Enquanto houver bloqueios, o envio para assinatura permanece indisponível. Registre o pedido de revisão humana.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className={`${inputCls} md:w-1/2`}
                  value={nota}
                  maxLength={500}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="O que precisa de revisão humana"
                />
                <button
                  onClick={() => mRevisar.mutate()}
                  disabled={mRevisar.isPending || !nota.trim()}
                  className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
                >
                  Solicitar revisão humana
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-navy/70">
                Revisão humana aprovada em {new Date(d.revisaoAprovadaEm).toLocaleString("pt-BR")} — criação da solicitação de assinatura
                liberada, com registro de template, versão e aprovador.
              </p>
              <button
                onClick={() => mEnviar.mutate()}
                disabled={mEnviar.isPending || !["aprovado", "validado"].includes(d.registro.status)}
                className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
              >
                Criar solicitação de assinatura
              </button>
              {finalAprovada && d.registro.contract_id && (
                <div className="grid gap-2 md:grid-cols-4">
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
                    Registrar assinatura externa
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-navy/60">
            Assinatura registrada não cria cobrança, não libera portal e não inicia pesquisa externa: financeiro e ativação continuam
            sujeitos aos gates próprios.
          </p>
          {ultimaFinal && !ultimaFinal.aprovado_em && (
            <p className="mt-1 text-xs text-terracotta">Versão final gerada aguardando aprovação de revisão humana.</p>
          )}
        </Painel>

        <Painel titulo="Auditoria da preparação (sem dados sensíveis completos)">
          <ul className="space-y-1 text-xs text-navy/70">
            {(qa.data?.eventos ?? []).map((e: any) => (
              <li key={e.id}>
                {new Date(e.created_at).toLocaleString("pt-BR")} — <strong>{e.acao}</strong>
                {e.metadados?.bloqueios?.length ? ` · bloqueios: ${e.metadados.bloqueios.join(", ")}` : ""}
              </li>
            ))}
            {(qa.data?.eventos ?? []).length === 0 && <li>Sem eventos registrados ainda.</li>}
          </ul>
        </Painel>
      </div>
    </SaasShell>
  );
}
