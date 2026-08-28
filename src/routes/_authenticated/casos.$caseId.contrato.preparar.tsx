/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo, inputCls, moeda } from "@/components/comercial/base";
import { AnexosAplicaveis } from "@/components/contrato/anexos-aplicaveis";
import { CadeiaFormalizacao } from "@/components/contrato/cadeia-formalizacao";
import { CadeiaOperacional } from "@/components/contrato/cadeia-operacional";
import { AnexosIaV, PainelPendenciasContratuais } from "@/components/contrato/anexos-i-v";
import { ConflitoCoerencia } from "@/components/contrato/conflito-coerencia";
import { EscopoProposta } from "@/components/contrato/escopo-proposta";
import { CompletudeCanva } from "@/components/contrato/completude-canva";
import { EstruturaFamiliar } from "@/components/contrato/estrutura-familiar";
import { PainelDependentes } from "@/components/contrato/painel-dependentes";
import { LinhaParametro } from "@/components/contrato/linha-parametro";
import { PainelPreparacao } from "@/components/contrato/painel-preparacao";
import { MatrizJuridicaPreparacao } from "@/components/contrato/matriz-juridica-preparacao";
import { PainelInstrumentos } from "@/components/contrato/painel-instrumentos";
import { PainelBloqueios } from "@/components/contrato/painel-bloqueios";
import { RegraComercial } from "@/components/contrato/regra-comercial";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { CabecalhoBloco, GovernancaFicha } from "@/components/contrato/ficha-governanca";
import { agruparAuditoria, bloqueiosResolutivos, temBloqueioImpeditivo } from "@/lib/bloqueios-dicionario";
import { GRUPOS, ROTULO_EVENTO_PREVIA } from "@/lib/contrato-parametros.server";
import { BLOCOS_FICHA, estadoDoBloco } from "@/lib/ficha-familiar";
import { anexosIaV, entradaDeValores, gatesBloqueados } from "@/lib/anexos-i-v";
import { conferirInstancias, statusTelaDeAnexo } from "@/lib/anexos-instancia";
import { instanciasDocumentaisDoCaso } from "@/lib/anexos-instancia.functions";
import { InstanciaDocumental } from "@/components/contrato/instancia-documental";
import { avaliarMatrizClausulas, previaFinalLiberada } from "@/lib/matriz-clausulas";
import {
  GATES_BLOQUEANTES,
  MATRIZ_ACEITE_VERSAO,
  blocosRenderizados,
  ORDEM_FONTES,
  FONTES_APENAS_APOIO,
} from "@/lib/matriz-aceite";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";
import { MatrizClausulas, PerfilInstitucionalBloco } from "@/components/contrato/matriz-clausulas";
import { CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";

import {
  aprovarParametros,
  congelarPrevia,
  enviarParaAssinatura,
  gerarPrevia,
  lerPrevia,
  materializarAnexosRevisados,
  ressincronizarAnexosDoCaso,
  preencherDeOrigens,
  registrarAssinatura,
} from "@/lib/contrato-parametros.functions";
import { MaterializarRevisados } from "@/components/contrato/materializar-revisados";
import { RessincronizarAnexos } from "@/components/contrato/ressincronizar-anexos";
import type { ItemPlanoMaterializacao } from "@/lib/anexos-materializacao";

import { abrirPreparacaoContrato, auditoriaPreparacao, solicitarRevisaoHumana } from "@/lib/contrato-preparar.functions";

const TITULO = "Preparar contrato do caso | Clube Ancestral";
const DESCRICAO = "Ficha única parametrizável e prévia contratual do caso, reaproveitando proposta, modelo ativo e anexos existentes.";




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
  const { podeEscrever } = useSaas();
  const qc = useQueryClient();
  const chave = ["contrato-preparar", caseId];
  const invalidar = () => qc.invalidateQueries({ queryKey: chave });

  const abrir = useServerFn(abrirPreparacaoContrato);
  const importar = useServerFn(preencherDeOrigens);
  const gerar = useServerFn(gerarPrevia);
  const congelar = useServerFn(congelarPrevia);
  const aprovar = useServerFn(aprovarParametros);
  const enviar = useServerFn(enviarParaAssinatura);
  const assinar = useServerFn(registrarAssinatura);
  const ver = useServerFn(lerPrevia);
  const revisar = useServerFn(solicitarRevisaoHumana);
  const auditoria = useServerFn(auditoriaPreparacao);
  const lerInstancias = useServerFn(instanciasDocumentaisDoCaso);

  const q = useQuery({ queryKey: chave, queryFn: () => abrir({ data: { caseId } }), retry: false });
  const registroId = (q.data as any)?.registro?.id as string | undefined;
  const qa = useQuery({
    queryKey: [...chave, "auditoria", registroId],
    queryFn: () => auditoria({ data: { id: registroId as string } }),
    enabled: Boolean(registroId),
  });

  const casoUuid = (q.data as any)?.caso?.id as string | undefined;
  const qi = useQuery({
    queryKey: [...chave, "instancias-anexos", casoUuid],
    queryFn: () => lerInstancias({ data: { caseId: casoUuid as string } }),
    enabled: Boolean(casoUuid),
  });

  const materializar = useServerFn(materializarAnexosRevisados);
  const [planoRevisados, setPlanoRevisados] = useState<ItemPlanoMaterializacao[] | null>(null);
  const mMaterializar = useMutation({
    mutationFn: (confirmar: boolean) => materializar({ data: { id: registroId as string, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoRevisados((r.plano ?? []) as ItemPlanoMaterializacao[]);
      if (r.simulado) {
        toast.info("Prévia do lote: nada foi gravado ainda.");
        return;
      }
      toast.success(
        r.materializados
          ? `${r.materializados} anexo(s) revisado(s) materializado(s) como documento oficial do caso. Conteúdo aprovado preservado.`
          : "Nada a materializar: os anexos revisados já estão salvos ou preservados.",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ressincronizar = useServerFn(ressincronizarAnexosDoCaso);
  const [planoRessincronizacao, setPlanoRessincronizacao] = useState<
    { codigo: string; titulo: string; acao: "materializar" | "ja_canonica"; versaoAtual: number | null }[] | null
  >(null);
  const mRessincronizar = useMutation({
    mutationFn: (confirmar: boolean) => ressincronizar({ data: { id: registroId as string, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoRessincronizacao((r.plano ?? []) as any);
      if (r.simulado) {
        toast.info("Prévia da sincronização: nada foi gravado ainda.");
        return;
      }
      toast.success(
        r.materializados
          ? `${r.materializados} anexo(s) sincronizado(s) a partir da ficha atual.`
          : "Nada a sincronizar: os anexos já refletem a ficha atual.",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
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
        }${
          r.proposta?.campos?.length
            ? ` · ${r.proposta.campos.length} campo(s) comercial(is) da proposta aprovada v${r.proposta.versao}`
            : ""
        }${r.proposta?.conflitos?.length ? ` · ${r.proposta.conflitos.length} divergência(s) proposta × Planejador` : ""}.`,
      );

      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mGerar = useMutation({
    mutationFn: (tipo: "rascunho" | "final") => gerar({ data: { id: registroId as string, tipo } }),
    onSuccess: (r: any) => {
      toast.success(
        r.identico
          ? "Rascunho já estava idêntico: nada mudou, nenhuma versão nova foi criada."
          : "Rascunho de trabalho atualizado (versão nova só em evento de governança).",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mCongelar = useMutation({
    mutationFn: (v: { evento: any; motivo: string }) => congelar({ data: { id: registroId as string, ...v } }),
    onSuccess: (r: any) => {
      toast.success(r.duplicada ? `Conteúdo idêntico à v${r.versao}: versão reaproveitada.` : `Versão v${r.versao} congelada.`);
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
    mutationFn: async () => {
      const r = await revisar({ data: { id: registroId as string, nota } });
      await congelar({ data: { id: registroId as string, evento: "revisao_solicitada", motivo: nota } });
      return r;
    },
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
  const rascunhoAtual = (d.previas ?? []).find((p: any) => p.estado === "rascunho_editavel");
  const ultimaFinal = (d.previas ?? []).find((p: any) => p.tipo === "final" && p.estado === "congelado");
  const finalAprovada = (d.previas ?? []).find((p: any) => p.tipo === "final" && p.aprovado_em);

  // Anexos I–V: derivação somente-leitura da ficha, sem escrever nada.
  const entradaAnexos = entradaDeValores({
    caseId: d.caso.codigo,
    clienteNome: null,
    responsavel: null,
    contratoBaseVersao: CONTRATO_BASE_VERSAO,
    modelo: "MODELO-ESTUDO",
    valores: (d.valores ?? []) as any[],
  });
  const anexosGovernados = anexosIaV(entradaAnexos);
  const perfilInstitucional = perfilInstitucionalRenderizado();
  const gatesContratuais = gatesBloqueados({
    anexos: anexosGovernados,
    modelo: "MODELO-ESTUDO",
    perfilInstitucionalAtivo: false,
    metodoAssinaturaConfigurado: Boolean((d.valores ?? []).find((v: any) => v.campo === "forma_assinatura")?.valor),
    revisorHumanoAprovado: Boolean(finalAprovada),
    conflitos: [],
  });
  const clausulasAvaliadas = avaliarMatrizClausulas({
    modelo: "MODELO-ESTUDO",
    entradaAnexos,
    anexos: anexosGovernados,
    conflitos: [],
    politicaPrivacidadeVigente: false,
    foroConfigurado: false,
    metodoAssinaturaConfigurado: Boolean((d.valores ?? []).find((v: any) => v.campo === "forma_assinatura")?.valor),
    revisaoJuridicaAprovada: Boolean(finalAprovada),
  });
  const blocosCaso = blocosRenderizados(anexosGovernados);
  const linhasInstancia = conferirInstancias(
    anexosGovernados.map((a: any) => ({
      codigo: a.codigo,
      titulo: a.titulo,
      status: statusTelaDeAnexo(a),
      modelo: null,
    })),
    (qi.data ?? []) as any,
  );
  const previaFinalCaso = previaFinalLiberada({
    modelo: "MODELO-ESTUDO",
    linhas: clausulasAvaliadas,
    bloqueiosGates: gatesContratuais,
  });



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

        <CadeiaOperacional caseId={caseId} podeEscrever={podeEscrever} />
        <CadeiaFormalizacao caseId={caseId} podeEscrever={podeEscrever} />

        <PainelPreparacao caseId={caseId} />
        <PainelInstrumentos caseId={caseId} />
        <MatrizJuridicaPreparacao caseId={caseId} />

        <EstruturaFamiliar codigoCaso={d.caso?.codigo} caseId={caseId} />

        <CompletudeCanva caseId={caseId} proposalId={(d.proposta as any)?.id ?? null} podeEscrever={podeEscrever} />

        <EscopoProposta dados={(d as any).escopo} proposta={d.proposta as any} />

        <PainelDependentes caseId={caseId} podeEscrever={podeEscrever} />

        <RegraComercial caseId={caseId} />

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
              Pré-carregar do Planejador homologado (sem redigitação)
            </button>
            <p className="mt-2 text-xs text-navy/60">
              O Planejador continua sendo a fonte de maior precedência. Quando não há parâmetro financeiro homologado para a rota, os
              campos comerciais (valor total, forma de pagamento, parcelas e despesas externas) vêm da proposta aprovada vinculada,
              sempre como “importado — a confirmar”. Datas de vencimento nunca são inferidas: dependem de condição formal registrada.
            </p>
          </div>

        </Painel>

        <div id="coerencia">
        <ConflitoCoerencia
          coerencia={d.coerencia}
          valorPaisRota={(d.valores ?? []).find((v: any) => v.campo === "pais_rota") ?? null}
          aoCorrigir={invalidar}
        />
        </div>

        <div id="bloqueios">
          <PainelBloqueios bloqueios={bloqueios} valores={d.valores ?? []} pendencias={d.pendencias ?? []} />
        </div>

        <div id="anexos" className="space-y-4">
          <AnexosAplicaveis
            valores={d.valores ?? []}
            anexosGerados={d.anexos ?? []}
            aoVerPrevia={(codigo) => {
              const alvo = rascunhoAtual ?? (d.previas ?? [])[0];
              if (alvo) mVer.mutate(alvo.id);
              else toast.info(`Gere o rascunho de trabalho para visualizar a instância de ${codigo}.`);
              document.getElementById("previas")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />

          <Painel titulo="Perfil institucional e matriz de cláusulas A–P">
            <p className="mb-2 text-[11px] text-navy/60">
              Texto jurídico fixo não é editável por caso.{" "}
              <Link to="/governanca/contrato-base" className="text-terracotta underline">
                Ver contrato-base
              </Link>
            </p>
            <PerfilInstitucionalBloco
              campos={perfilInstitucional.campos}
              versao={perfilInstitucional.versao}
              status={perfilInstitucional.status}
              pendencias={perfilInstitucional.pendencias}
            />

            <div className="mt-3">
              <MatrizClausulas linhas={clausulasAvaliadas} />

              <div className="mt-3 rounded-lg border border-navy/10 bg-white p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                    Matriz de renderização por bloco
                  </p>
                  <p className="text-[11px] text-navy/50">{MATRIZ_ACEITE_VERSAO}</p>
                </div>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-[900px] w-full text-left text-[11px]">
                    <thead className="text-[10px] uppercase tracking-wide text-navy/45">
                      <tr>
                        <th className="py-1 pr-2">Bloco</th>
                        <th className="py-1 pr-2">Fonte exigida</th>
                        <th className="py-1 pr-2">Renderiza</th>
                        <th className="py-1 pr-2">Gate</th>
                        <th className="py-1">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy/75">
                      {blocosCaso.map((b) => (
                        <tr key={b.bloco} className="border-t border-navy/10 align-top">
                          <td className="py-1.5 pr-2 font-medium text-navy">{b.bloco}</td>
                          <td className="py-1.5 pr-2">{b.fonteExigida}</td>
                          <td className="py-1.5 pr-2">{b.renderiza === "sempre" ? "Sim" : "Quando aplicável"}</td>
                          <td className="py-1.5 pr-2">{b.gate}</td>
                          <td className={`py-1.5 ${b.situacao === "renderizado" ? "text-navy/70" : "text-terracotta"}`}>
                            {b.situacao === "renderizado"
                              ? "Renderizado"
                              : b.situacao === "nao_aplicavel"
                                ? "Não aplicável"
                                : "Renderizado com pendência"}
                            <span className="block text-[10px] text-navy/50">{b.motivo}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded border border-navy/10 bg-cream/40 p-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-navy/60">Ordem de fontes</p>
                    <ol className="mt-1 space-y-0.5 text-[11px] text-navy/70">
                      {ORDEM_FONTES.map((f) => (
                        <li key={f.ordem}>
                          {f.ordem}. {f.fonte}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-1 text-[10px] text-terracotta">{FONTES_APENAS_APOIO}</p>
                  </div>
                  <div className="rounded border border-navy/10 bg-cream/40 p-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-navy/60">Gates bloqueantes</p>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70">
                      {GATES_BLOQUEANTES.map((g) => (
                        <li key={g}>• {g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-navy/10 bg-cream/40 p-3 text-xs text-navy/70">
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                Prévia final — {previaFinalCaso.liberada ? "liberada" : "bloqueada"}
              </p>
              <ul className="mt-1 space-y-1">
                {previaFinalCaso.motivos.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            </div>
          </Painel>

          <Painel titulo="Anexos I–V governados">
            <p className="mb-2 text-xs text-navy/60">
              Derivados da ficha parametrizável e da proposta/OS vinculada. Somente leitura: o template-base não é editável pelo caso e
              nenhum campo é preenchido por inferência.
            </p>
            <div className="mb-3">
              <InstanciaDocumental linhas={linhasInstancia} carregando={qi.isLoading} />
              <div className="mt-2">
                <MaterializarRevisados
                  plano={planoRevisados}
                  ocupado={mMaterializar.isPending || !registroId}
                  onVerificar={() => mMaterializar.mutate(false)}
                  onMaterializar={() => mMaterializar.mutate(true)}
                />
              </div>
              <div className="mt-2">
                <RessincronizarAnexos
                  plano={planoRessincronizacao}
                  ocupado={mRessincronizar.isPending || !registroId}
                  onVerificar={() => mRessincronizar.mutate(false)}
                  onSincronizar={() => mRessincronizar.mutate(true)}
                />
              </div>
            </div>

            <AnexosIaV anexos={anexosGovernados} entrada={entradaAnexos} />
            <div className="mt-3">
              <PainelPendenciasContratuais anexos={anexosGovernados} gates={gatesContratuais} />
            </div>
          </Painel>

        </div>

        <div id="ficha" className="space-y-4">
          <GovernancaFicha />
          {BLOCOS_FICHA.map((s) => (
            <Painel key={s.chave} titulo={s.titulo}>
              <CabecalhoBloco bloco={s} estado={estadoDoBloco((d.valores ?? []) as any[], s.grupos)} />
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
          <div id="previas" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => mGerar.mutate("rascunho")}
              disabled={mGerar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            >
              Salvar rascunho de trabalho
            </button>
            <button
              onClick={() => mGerar.mutate("rascunho")}
              disabled={mGerar.isPending}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50"
            >
              Salvar e continuar depois
            </button>
            <span className="self-center text-[11px] text-navy/60">
              {mGerar.isPending
                ? "Salvando rascunho…"
                : rascunhoAtual
                  ? bloqueado
                    ? "Rascunho salvo. A formalização permanece bloqueada — veja “Bloqueios acionáveis”."
                    : "Rascunho salvo."
                  : "Nenhum rascunho salvo ainda."}
            </span>
            <button
              onClick={() => {
                const motivo = window.prompt("Motivo do retorno para ajuste (mínimo 5 caracteres)") ?? "";
                if (motivo.trim().length >= 5) mCongelar.mutate({ evento: "retorno_ajuste", motivo });
              }}
              disabled={mCongelar.isPending || !rascunhoAtual}
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50"
            >
              Congelar retorno para ajuste
            </button>
            <button
              onClick={() => {
                const motivo = window.prompt("Motivo da versão final (mínimo 5 caracteres)") ?? "";
                if (motivo.trim().length >= 5) mCongelar.mutate({ evento: "aprovacao", motivo });
              }}
              disabled={mCongelar.isPending || bloqueios.some((b) => b.chave !== "revisao_humana")}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
            >
              Congelar versão final
            </button>
          </div>
          <p className="mt-2 text-xs text-navy/60">
            Um único rascunho editável por caso + modelo ativo: salvar atualiza esse rascunho e conteúdo idêntico não vira versão nova.
            Versão imutável só nasce em evento de governança — pedido de revisão, retorno para ajuste, aprovação, envio para assinatura e
            assinatura registrada. Nada é excluído: todo o histórico permanece.
          </p>
          <div className="mt-3 space-y-2">
            {(d.previas as any[]).map((p) => (
              <div key={p.id} className="rounded-lg border border-navy/15 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-navy">
                      {p.estado === "rascunho_editavel" ? "Rascunho de trabalho (editável)" : `Versão v${p.versao} (congelada)`} ·{" "}
                      {p.template_code} v{p.template_version} · caso {d.caso.codigo} · proposta{" "}
                      {d.registro.proposal_id ? "vinculada" : "ausente"}
                    </p>
                    <p className="text-xs text-navy/60">
                      {ROTULO_EVENTO_PREVIA[p.evento ?? ""] ?? "Evento não registrado"} ·{" "}
                      {new Date(p.congelado_em ?? p.created_at).toLocaleString("pt-BR")} · autor {p.gerado_por ? "registrado" : "—"} ·{" "}
                      {(p.anexos ?? []).length} anexo(s) · {(p.conteudo?.valores ?? []).length} parâmetro(s)
                    </p>
                    {p.motivo && <p className="text-xs text-navy/60">Motivo: {p.motivo}</p>}
                  </div>
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
                  disabled={mRevisar.isPending || !nota.trim() || revisaoTravada}
                  title={
                    revisaoTravada
                      ? `Indisponível: ${impeditivos.length} bloqueio(s) impeditivo(s) — ${impeditivos
                          .map((b) => b.titulo)
                          .join("; ")}`
                      : "Registra o pedido de revisão humana em auditoria."
                  }
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
            {eventos.map((e) => (
              <li key={e.id}>
                {new Date(e.created_at).toLocaleString("pt-BR")} — <strong>{e.acao}</strong>
                {e.ocorrencias > 1
                  ? ` · ${e.ocorrencias}x em até 30 min (último às ${new Date(e.ultimo_em).toLocaleTimeString("pt-BR")})`
                  : ""}
                {e.metadados?.bloqueios?.length ? ` · bloqueios: ${e.metadados.bloqueios.join(", ")}` : ""}
              </li>
            ))}
            {eventos.length === 0 && <li>Sem eventos registrados ainda.</li>}
          </ul>
        </Painel>
      </div>
    </SaasShell>
  );
}
