/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Jurídico & Contrato — composição da prancha visual V4 (Proprietária,
 * 19/10/2026): "casca que dure pra sempre". Os seis blocos da prancha
 * existem sempre — Escopo e assinatura, Assinatura, Validação jurídica,
 * Conflitos e conferências, Alertas do contrato e atos formais, Completude
 * formal. Sem dado, o bloco aparece no mesmo formato em estado vazio
 * honesto ("Sem registro"), nunca com nome, data ou percentual inventado.
 *
 * Somente leitura. Nenhum botão de aprovar, enviar ou assinar vive aqui —
 * essas ações continuam nas abas do instrumento, sob `useAutoridade`.
 * Fontes já existentes, sem query nova no servidor:
 *  - `obterContrato` (partes, anexos, versões, validações) — mesma chave de
 *    cache da ficha /contratos/$id;
 *  - `carregarCadeiaFormalizacao` (CADEIA-FORMALIZACAO-v1.0, 9 elos) —
 *    mesma chave do componente CadeiaFormalizacao;
 *  - `painelPesquisaEvidencias` (document_requests + evidências canônicas
 *    do caso) para retificação, tradução juramentada e apostilamento.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { dataBr } from "@/components/comercial/base";
import { BarrasHorizontais, Cartao, Etiqueta, Linha, type Tom } from "@/components/prancha-v4/kit";
import { ROTULO_STATUS_ANEXO, ROTULO_STATUS_CONTRATO } from "@/components/contratos/rotulos";
import { listarContratos, obterContrato } from "@/lib/contratos.functions";
import { carregarCadeiaFormalizacao } from "@/lib/cadeia-formalizacao.functions";
import { ELOS_CADEIA } from "@/lib/cadeia-formalizacao";
import { painelPesquisaEvidencias } from "@/lib/documentos-solicitacoes.functions";

const SEM_REGISTRO = "Sem registro";

const TOM_STATUS_CONTRATO: Record<string, Tom> = {
  signed: "sucesso",
  approved_for_send: "sucesso",
  sent: "atencao",
  ready_for_review: "atencao",
  under_human_review: "atencao",
  pending_data: "critico",
  rejected: "critico",
};

const TOM_STATUS_ANEXO: Record<string, Tom> = {
  signed_with_contract: "sucesso",
  approved: "sucesso",
  attached: "sucesso",
  ready_for_review: "atencao",
  drafting: "atencao",
  missing: "critico",
};

const ANEXO_CONCLUIDO = new Set(["approved", "attached", "signed_with_contract"]);

const ROTULO_SEVERIDADE: Record<string, { texto: string; tom: Tom }> = {
  blocking: { texto: "Bloqueante", tom: "critico" },
  high: { texto: "Alta", tom: "critico" },
  medium: { texto: "Revisar", tom: "atencao" },
  low: { texto: "Baixa", tom: "neutro" },
};

const ativos = <T extends Record<string, any>>(l: T[] | undefined) => (l ?? []).filter((r) => !r["archived_at"]);

/** Estado de um ato formal (retificação, tradução, apostilamento) a partir das solicitações documentais reais. */
function estadoAtoFormal(
  solicitacoes: any[],
  tipo: "retificacao" | "traducao" | "apostilamento",
  evidenciasSinalizadas: number,
): { texto: string; tom: Tom } {
  const reqs = solicitacoes.filter(
    (s) => s.request_type === tipo && !s.archived_at && s.status !== "cancelado" && s.status !== "nao_aplicavel",
  );
  if (!reqs.length) {
    return evidenciasSinalizadas > 0
      ? { texto: `Apontada em ${evidenciasSinalizadas} evidência${evidenciasSinalizadas === 1 ? "" : "s"}`, tom: "atencao" }
      : { texto: "Não solicitada", tom: "neutro" };
  }
  if (reqs.every((s) => s.status === "validado_internamente")) return { texto: "Validado", tom: "sucesso" };
  if (reqs.some((s) => s.status === "recebido" || s.status === "em_revisao")) return { texto: "Em análise", tom: "atencao" };
  return { texto: "Pendente", tom: "critico" };
}

export function PranchaJuridicoContrato({
  contratoId,
  instrumentos,
}: {
  contratoId: string;
  /** Lista já carregada de instrumentos da organização (para aditivos); opcional. */
  instrumentos?: { id: string; contract_type?: string; parent_contract_id?: string | null; title?: string; status?: string }[];
}) {
  const obter = useServerFn(obterContrato);
  const carregarCadeia = useServerFn(carregarCadeiaFormalizacao);
  const carregarPesquisa = useServerFn(painelPesquisaEvidencias);
  const listar = useServerFn(listarContratos);
  // Sem lista do chamador (ficha /contratos/$id), lê a mesma lista do seletor (mesma chave de cache).
  const qInstrumentos = useQuery({
    queryKey: ["contratos-prancha-seletor"],
    queryFn: () => listar({ data: {} }),
    enabled: instrumentos === undefined,
  });
  const listaInstrumentos = instrumentos ?? ((qInstrumentos.data?.contratos ?? undefined) as typeof instrumentos);

  const q = useQuery({ queryKey: ["contrato", contratoId], queryFn: () => obter({ data: { id: contratoId } }) });
  const caseId: string | null = (q.data?.contrato as any)?.case_id ?? null;
  const qCadeia = useQuery({
    queryKey: ["cadeia-formalizacao", caseId],
    queryFn: () => carregarCadeia({ data: { caseId: caseId as string } }),
    enabled: Boolean(caseId),
    retry: false,
  });
  const qPesquisa = useQuery({
    queryKey: ["prancha-juridico-pesquisa", caseId],
    queryFn: () => carregarPesquisa({ data: { caseId: caseId as string } }),
    enabled: Boolean(caseId),
    retry: false,
  });

  if (q.isLoading) {
    return <p className="text-sm text-navy/60" data-prancha-juridico-carregando>Carregando o instrumento…</p>;
  }
  if (q.isError || !q.data) {
    return (
      <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
        Não foi possível ler este instrumento — os blocos abaixo não refletem valor real.
      </p>
    );
  }

  const d = q.data as any;
  const c = d.contrato as any;
  const partes = ativos<any>(d.partes);
  const anexos = ativos<any>(d.anexos);
  const versoes = (d.versoes ?? []) as any[];
  const validacoesAbertas = ativos<any>(d.validacoes).filter((v) => v.status === "open");
  const versaoVigente = versoes.find((v) => v.id === c.current_version_id) ?? versoes[0] ?? null;

  /* ---------------- Escopo e assinatura ---------------- */
  const ehBase = c.contract_type === "contract_base";
  const base = ehBase ? c : (d.contratoBase as any);
  const aditivos = (listaInstrumentos ?? []).filter(
    (i) => i.contract_type === "amendment" && base && i.parent_contract_id === base.id,
  );

  /* ---------------- Assinatura ---------------- */
  const signatarios = partes.filter((p) => p.signature_status === "signed");
  const assinante =
    signatarios.find((p) => p.role === "contracting_client") ?? signatarios[0] ?? null;
  const exigidas = partes.filter((p) => p.signature_required);
  const pendentesAssinatura = exigidas.filter((p) => p.signature_status !== "signed");
  const integridade: { texto: string; tom: Tom } = !versaoVigente
    ? { texto: "Sem versão", tom: "neutro" }
    : versaoVigente.render_error
      ? { texto: "Falha de renderização", tom: "critico" }
      : versaoVigente.rendered_file_hash
        ? { texto: "Hash registrado", tom: "sucesso" }
        : { texto: "Sem hash registrado", tom: "neutro" };

  /* ---------------- Validação jurídica ---------------- */
  const cadeia = qCadeia.data as any;
  const elos = (cadeia?.elos ?? []) as { chave: string; estado: string }[];
  const elosOk = elos.filter((e) => e.estado === "ok").length;
  const estadoCadeia: { texto: string; tom: Tom } = !caseId
    ? { texto: "Sem caso vinculado", tom: "neutro" }
    : qCadeia.isLoading
      ? { texto: "Lendo…", tom: "neutro" }
      : !cadeia
        ? { texto: "Sem leitura", tom: "neutro" }
        : elosOk === ELOS_CADEIA.length
          ? { texto: "Validado", tom: "sucesso" }
          : { texto: `${elosOk} de ${ELOS_CADEIA.length} elos`, tom: "atencao" };

  const pesquisa = qPesquisa.data as any;
  const solicitacoes = (pesquisa?.solicitacoes ?? []) as any[];
  const evidencias = ((pesquisa?.evidencias ?? []) as any[]).filter((e) => !e.archived_at);
  const evRetificacao = evidencias.filter((e) => e.workflow_status === "requer_retificacao").length;
  const evTraducaoApostila = evidencias.filter((e) => e.workflow_status === "requer_traducao_apostila").length;
  const semPesquisa = !caseId || !pesquisa;
  const atoOuVazio = (tipo: "retificacao" | "traducao" | "apostilamento", ev: number) =>
    semPesquisa
      ? { texto: !caseId ? "Sem caso vinculado" : qPesquisa.isLoading ? "Lendo…" : "Sem leitura", tom: "neutro" as Tom }
      : estadoAtoFormal(solicitacoes, tipo, ev);
  const retificacao = atoOuVazio("retificacao", evRetificacao);
  const traducao = atoOuVazio("traducao", evTraducaoApostila);
  const apostilamento = atoOuVazio("apostilamento", evTraducaoApostila);

  /* ---------------- Conflitos e conferências ---------------- */
  const menores = partes.filter(
    (p) => p.legal_capacity_status === "minor" || p.legal_capacity_status === "legal_representative_required",
  );
  const menoresSemRepresentante = menores.filter((p) => !p.represented_by_party_id);
  const representantes = partes.filter((p) => p.role === "legal_representative");
  const representantesSemDocumento = representantes.filter((p) => !String(p.document_number ?? "").trim());
  const evDivergentes = evidencias.filter((e) => e.workflow_status === "divergente").length;

  /* ---------------- Alertas do contrato e atos formais ---------------- */
  type Alerta = { chave: string; rotulo: string; texto: string; tom: Tom };
  const alertas: Alerta[] = [
    ...(c.status !== "signed" && pendentesAssinatura.length
      ? [{ chave: "assinatura", rotulo: `${c.contract_number} · ${c.title}`, texto: "Assinatura pendente", tom: "atencao" as Tom }]
      : []),
    ...representantesSemDocumento.map((p) => ({
      chave: `proc-${p.id}`,
      rotulo: `Procuração · ${p.person_name}`,
      texto: "Conferir poderes",
      tom: "atencao" as Tom,
    })),
    ...anexos
      .filter((a) => a.status === "missing")
      .map((a) => ({ chave: `anexo-${a.id}`, rotulo: `Anexo ${a.annex_code} · ${a.title}`, texto: "Ausente", tom: "critico" as Tom })),
    ...validacoesAbertas
      .filter((v) => v.severity === "blocking" || v.severity === "high")
      .map((v) => ({
        chave: `val-${v.id}`,
        rotulo: String(v.label),
        texto: ROTULO_SEVERIDADE[v.severity]?.texto ?? v.severity,
        tom: ROTULO_SEVERIDADE[v.severity]?.tom ?? "neutro",
      })),
    ...(versaoVigente?.rendered_file_hash && !versaoVigente.render_error
      ? [{ chave: "integridade", rotulo: `v${versaoVigente.version_number} · integridade`, texto: "Hash registrado", tom: "sucesso" as Tom }]
      : []),
  ].slice(0, 9);

  /* ---------------- Completude formal ---------------- */
  const anexosAplicaveis = anexos.filter((a) => a.status !== "not_applicable");
  const anexosConcluidos = anexosAplicaveis.filter((a) => ANEXO_CONCLUIDO.has(a.status));
  const evValidadas = evidencias.filter(
    (e) => e.validated_at || e.workflow_status === "aprovada_para_entrega" || e.workflow_status === "publicada",
  ).length;
  const pct = (n: number, total: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className="space-y-4" data-prancha-juridico-contrato>
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Escopo e assinatura" data-prancha-juridico-escopo>
          {base ? (
            <Linha
              rotulo={`Contrato-base${ehBase && versaoVigente ? ` v${versaoVigente.version_number}` : ""} · ${base.title}`}
              valor={ROTULO_STATUS_CONTRATO[base.status] ?? base.status}
              tom={TOM_STATUS_CONTRATO[base.status] ?? "neutro"}
            />
          ) : (
            <Linha rotulo="Contrato-base" valor={SEM_REGISTRO} />
          )}
          {!ehBase ? (
            <Linha
              rotulo={`${c.title}${versaoVigente ? ` v${versaoVigente.version_number}` : ""}`}
              valor={ROTULO_STATUS_CONTRATO[c.status] ?? c.status}
              tom={TOM_STATUS_CONTRATO[c.status] ?? "neutro"}
            />
          ) : null}
          {anexos.length ? (
            anexos.map((a) => (
              <Linha
                key={a.id}
                rotulo={`Anexo ${a.annex_code} — ${a.title}`}
                valor={ROTULO_STATUS_ANEXO[a.status] ?? a.status}
                tom={TOM_STATUS_ANEXO[a.status] ?? "neutro"}
              />
            ))
          ) : (
            <Linha rotulo="Anexos" valor={SEM_REGISTRO} />
          )}
          {aditivos.length ? (
            aditivos.map((a) => (
              <Linha
                key={a.id}
                rotulo={`Aditivo · ${a.title ?? ""}`}
                valor={ROTULO_STATUS_CONTRATO[a.status ?? ""] ?? a.status ?? SEM_REGISTRO}
                tom={TOM_STATUS_CONTRATO[a.status ?? ""] ?? "neutro"}
              />
            ))
          ) : (
            <Linha rotulo="Aditivos" valor={listaInstrumentos ? "Nenhum" : SEM_REGISTRO} />
          )}
        </Cartao>

        <Cartao titulo="Assinatura" data-prancha-juridico-assinatura>
          <div className="rounded-xl border border-navy/10 bg-cream/50 p-4">
            <p className={assinante ? "font-serif text-lg italic text-navy" : "font-serif text-lg italic text-navy/40"}>
              {assinante ? assinante.person_name : "Sem assinatura registrada"}
            </p>
            <p className="mt-1 text-[11px] text-navy/55">
              {assinante && c.signed_at
                ? `Assinatura registrada · ${dataBr(c.signed_at)}`
                : assinante
                  ? "Assinatura registrada · data não gravada"
                  : exigidas.length
                    ? `Assinatura pendente · ${pendentesAssinatura.length} de ${exigidas.length} parte${exigidas.length === 1 ? "" : "s"}`
                    : "Nenhuma parte com assinatura exigida registrada"}
            </p>
          </div>
          <div className="mt-3">
            <Linha rotulo="Integridade do documento" valor={integridade.texto} tom={integridade.tom} />
          </div>
          <p className="mt-2 text-[11px] text-navy/50">Nenhuma assinatura é solicitada ou enviada a partir deste bloco.</p>
        </Cartao>

        <Cartao titulo="Validação jurídica" data-prancha-juridico-validacao>
          <Linha rotulo="Cadeia documental completa" valor={estadoCadeia.texto} tom={estadoCadeia.tom} />
          <Linha rotulo="Retificação necessária" valor={retificacao.texto} tom={retificacao.tom} />
          <Linha rotulo="Tradução juramentada" valor={traducao.texto} tom={traducao.tom} />
          <Linha rotulo="Apostilamento" valor={apostilamento.texto} tom={apostilamento.tom} />
        </Cartao>

        <Cartao titulo="Conflitos e conferências" data-prancha-juridico-conflitos>
          <Linha rotulo="Variação de sobrenome" valor={SEM_REGISTRO} />
          <Linha
            rotulo="Datas entre documentos"
            valor={semPesquisa ? SEM_REGISTRO : evDivergentes ? `${evDivergentes} divergência${evDivergentes === 1 ? "" : "s"}` : "Sem divergência"}
            tom={!semPesquisa && evDivergentes ? "atencao" : "neutro"}
          />
          <Linha
            rotulo="Representação de menor"
            valor={!menores.length ? "Não aplicável" : menoresSemRepresentante.length ? "Revisar" : "Conferido"}
            tom={!menores.length ? "neutro" : menoresSemRepresentante.length ? "atencao" : "sucesso"}
          />
          <Linha
            rotulo="Poderes da procuração"
            valor={!representantes.length ? "Sem procuração" : representantesSemDocumento.length ? "Revisar" : "Documento registrado"}
            tom={!representantes.length ? "neutro" : representantesSemDocumento.length ? "atencao" : "sucesso"}
          />
          {validacoesAbertas.slice(0, 4).map((v) => (
            <Linha
              key={v.id}
              rotulo={String(v.label)}
              valor={ROTULO_SEVERIDADE[v.severity]?.texto ?? v.severity}
              tom={ROTULO_SEVERIDADE[v.severity]?.tom ?? "neutro"}
            />
          ))}
        </Cartao>
      </div>

      <Cartao titulo="Alertas do contrato e atos formais" data-prancha-juridico-alertas>
        <ul className="grid gap-x-6 sm:grid-cols-3">
          {alertas.length ? (
            alertas.map((a) => (
              <li key={a.chave} className="flex min-w-0 items-center justify-between gap-3 border-b border-navy/5 py-1.5">
                <span className="min-w-0 truncate text-xs text-navy/80">{a.rotulo}</span>
                <Etiqueta texto={a.texto} tom={a.tom} />
              </li>
            ))
          ) : (
            <li className="flex items-center justify-between gap-3 border-b border-navy/5 py-1.5 text-xs text-navy/60 sm:col-span-3">
              <span>Nenhum alerta formal registrado para este instrumento.</span>
              <Etiqueta texto="Sem alerta" />
            </li>
          )}
        </ul>
      </Cartao>

      <Cartao titulo="Completude formal" data-prancha-juridico-completude>
        <BarrasHorizontais
          tituloAcessivel="Completude formal do instrumento: contrato-base, anexos, procurações e validação documental"
          itens={[
            {
              rotulo: "Contrato-base",
              valor: base?.status === "signed" ? 100 : 0,
              apoio: base ? (ROTULO_STATUS_CONTRATO[base.status] ?? base.status) : SEM_REGISTRO,
            },
            {
              rotulo: "Anexos",
              valor: pct(anexosConcluidos.length, anexosAplicaveis.length),
              apoio: anexosAplicaveis.length ? `${anexosConcluidos.length} de ${anexosAplicaveis.length}` : SEM_REGISTRO,
              tom: "gold",
            },
            {
              rotulo: "Procurações",
              valor: pct(representantes.length - representantesSemDocumento.length, representantes.length),
              apoio: representantes.length
                ? `${representantes.length - representantesSemDocumento.length} de ${representantes.length} com documento`
                : "Nenhuma registrada",
            },
            {
              rotulo: "Validação documental",
              valor: pct(evValidadas, evidencias.length),
              apoio: semPesquisa ? SEM_REGISTRO : evidencias.length ? `${evValidadas} de ${evidencias.length} evidências` : "Sem evidência",
            },
          ]}
        />
      </Cartao>
    </div>
  );
}

/** Sem nenhum instrumento (ou leitura falhou): os seis blocos no formato da prancha, todos em "Sem registro". */
export function PranchaJuridicoVazia({ erro = false }: { erro?: boolean }) {
  const valor = erro ? "Sem leitura" : SEM_REGISTRO;
  return (
    <div className="space-y-4" data-prancha-juridico-contrato data-prancha-juridico-vazia>
      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          Não foi possível carregar os instrumentos — os blocos abaixo estão vazios por falha de leitura, não por ausência.
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Escopo e assinatura">
          {["Contrato-base", "Anexos", "Aditivos"].map((r) => (
            <Linha key={r} rotulo={r} valor={valor} />
          ))}
        </Cartao>
        <Cartao titulo="Assinatura">
          <div className="rounded-xl border border-navy/10 bg-cream/50 p-4">
            <p className="font-serif text-lg italic text-navy/40">Sem assinatura registrada</p>
            <p className="mt-1 text-[11px] text-navy/55">Nenhum instrumento selecionado</p>
          </div>
          <div className="mt-3">
            <Linha rotulo="Integridade do documento" valor={valor} />
          </div>
        </Cartao>
        <Cartao titulo="Validação jurídica">
          {["Cadeia documental completa", "Retificação necessária", "Tradução juramentada", "Apostilamento"].map((r) => (
            <Linha key={r} rotulo={r} valor={valor} />
          ))}
        </Cartao>
        <Cartao titulo="Conflitos e conferências">
          {["Variação de sobrenome", "Datas entre documentos", "Representação de menor", "Poderes da procuração"].map((r) => (
            <Linha key={r} rotulo={r} valor={valor} />
          ))}
        </Cartao>
      </div>
      <Cartao titulo="Alertas do contrato e atos formais">
        <ul className="grid gap-x-6 sm:grid-cols-3">
          <li className="flex items-center justify-between gap-3 border-b border-navy/5 py-1.5 text-xs text-navy/60 sm:col-span-3">
            <span>Nenhum alerta formal registrado.</span>
            <Etiqueta texto="Sem alerta" />
          </li>
        </ul>
      </Cartao>
      <Cartao titulo="Completude formal">
        <BarrasHorizontais
          tituloAcessivel="Completude formal: sem instrumento registrado"
          itens={["Contrato-base", "Anexos", "Procurações", "Validação documental"].map((r) => ({ rotulo: r, valor: 0, apoio: valor }))}
        />
      </Cartao>
    </div>
  );
}
