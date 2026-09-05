import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { useSaas } from "@/components/saas/shell";
import {
  DIRECOES_INTERACAO,
  ETAPAS_COMERCIAIS,
  ETAPAS_ENCERRADAS,
  ORIGENS_CONTATO,
  TIPOS_INTERACAO,
  acaoVencida,
  rotuloDe,
} from "@/lib/crm-fluxo";
import {
  arquivarOportunidade,
  painelCrmFluxo,
  registrarAceiteVerbal,
  registrarConfirmacaoFormal,
  registrarContato,
  registrarDiscovery,
  registrarInteracao,
  salvarOportunidade,
} from "@/lib/crm-fluxo.functions";

const op = (lista: readonly { id: string; rotulo: string }[]) => lista.map((x) => ({ valor: x.id, rotulo: x.rotulo }));

type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function FluxoComercialCanonico() {
  const { podeEscrever } = useSaas();
  const qc = useQueryClient();
  const carregar = useServerFn(painelCrmFluxo);
  const novoContato = useServerFn(registrarContato);
  const salvarOp = useServerFn(salvarOportunidade);
  const novaInteracao = useServerFn(registrarInteracao);
  const novaDiscovery = useServerFn(registrarDiscovery);
  const aceiteVerbal = useServerFn(registrarAceiteVerbal);
  const confirmacaoFormal = useServerFn(registrarConfirmacaoFormal);
  const arquivar = useServerFn(arquivarOportunidade);

  const q = useQuery({ queryKey: ["crm-fluxo"], queryFn: () => carregar(), retry: false });
  const [msg, setMsg] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  const [contato, setContato] = useState<Record<string, string>>({ nome: "", email: "", telefone: "", origem: "" });
  const [inter, setInter] = useState<Record<string, string>>({ tipo: "", direcao: "", resumo_interno: "", proxima_acao: "", prazo_proxima_acao: "" });
  const [disc, setDisc] = useState<Record<string, string>>({ objetivo_principal: "", estrutura_familiar: "", linha_transmissao: "", estado_documental_inicial: "" });
  const [referencia, setReferencia] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [soPendentes, setSoPendentes] = useState(false);

  const dados = q.data;
  const contatos = (dados?.contatos ?? []) as Linha[];
  const oportunidades = (dados?.oportunidades ?? []) as Linha[];
  const interacoes = (dados?.interacoes ?? []) as Linha[];
  const eventos = (dados?.eventos ?? []) as Linha[];
  const discoveries = (dados?.discovery ?? []) as Linha[];

  const atual = useMemo(() => oportunidades.find((o) => o.id === selecionada) ?? null, [oportunidades, selecionada]);
  const editado = { ...(atual ?? {}), ...rascunho } as Linha;

  const invalidar = () => qc.invalidateQueries({ queryKey: ["crm-fluxo"] });
  const erro = (e: unknown) => setMsg(e instanceof Error ? e.message : "Falha ao registrar.");

  const mutContato = useMutation({
    mutationFn: () => novoContato({ data: contato }),
    onSuccess: () => {
      setContato({ nome: "", email: "", telefone: "", origem: "" });
      setMsg("Contato registrado.");
      invalidar();
    },
    onError: erro,
  });

  const mutOp = useMutation({
    mutationFn: () => salvarOp({ data: { id: atual?.id ?? null, valores: rascunho } }),
    onSuccess: (r) => {
      if (!r.ok) {
        setMsg(r.pendencias.map((p) => p.mensagem).join(" "));
        return;
      }
      setRascunho({});
      setSelecionada(r.oportunidade?.id ?? null);
      setMsg("Oportunidade salva.");
      invalidar();
    },
    onError: erro,
  });

  const mutInteracao = useMutation({
    mutationFn: () =>
      novaInteracao({ data: { ...inter, opportunity_id: atual?.id ?? null, contact_id: atual?.contact_id ?? null, case_id: atual?.case_id ?? null } }),
    onSuccess: () => {
      setInter({ tipo: "", direcao: "", resumo_interno: "", proxima_acao: "", prazo_proxima_acao: "" });
      setMsg("Interação registrada (registro imutável).");
      invalidar();
    },
    onError: erro,
  });

  const mutDiscovery = useMutation({
    mutationFn: () => novaDiscovery({ data: { ...disc, opportunity_id: atual?.id } }),
    onSuccess: () => {
      setMsg("Triagem de Discovery registrada.");
      invalidar();
    },
    onError: erro,
  });

  const mutAceite = useMutation({
    mutationFn: () => aceiteVerbal({ data: { opportunityId: String(atual?.id) } }),
    onSuccess: (r) => {
      setMsg(r.nota);
      invalidar();
    },
    onError: erro,
  });

  const mutConfirmacao = useMutation({
    mutationFn: () => confirmacaoFormal({ data: { opportunityId: String(atual?.id), referenciaInterna: referencia } }),
    onSuccess: (r) => {
      setReferencia("");
      setMsg(r.nota);
      invalidar();
    },
    onError: erro,
  });

  const mutArquivar = useMutation({
    mutationFn: (motivo: string) => arquivar({ data: { id: String(atual?.id), motivo } }),
    onSuccess: () => {
      setSelecionada(null);
      setMsg("Oportunidade arquivada. Não há exclusão física.");
      invalidar();
    },
    onError: erro,
  });

  const lista = oportunidades.filter((o) => {
    if (filtroEtapa && o.etapa_comercial !== filtroEtapa) return false;
    if (soPendentes && !(o.pendencias?.length || acaoVencida(o.prazo_proxima_acao))) return false;
    return true;
  });

  const semAcao = oportunidades.filter(
    (o) => !ETAPAS_ENCERRADAS.includes(String(o.etapa_comercial)) && !o.archived_at && !o.proxima_acao,
  ).length;
  const vencidas = oportunidades.filter((o) => acaoVencida(o.prazo_proxima_acao) && !o.archived_at).length;
  const semResposta = oportunidades.filter((o) => o.etapa_comercial === "proposta_enviada" && acaoVencida(o.prazo_proxima_acao)).length;

  const nomeContato = (id?: string | null) => contatos.find((c) => c.id === id)?.nome ?? "—";
  const set = (k: string) => (v: unknown) => setRascunho((r) => ({ ...r, [k]: v }));
  const val = (k: string) => String(editado[k] ?? "");

  return (
    <div className="space-y-4">
      {msg ? <p className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-navy">{msg}</p> : null}
      {q.isError ? (
        <p className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/5 px-4 py-2 text-sm text-terracotta">
          Não foi possível carregar o fluxo comercial.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      <Secao titulo="Saúde comercial" descricao="Disciplina de responsável, próxima ação e prazo.">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { r: "Oportunidades ativas sem próxima ação", v: semAcao },
            { r: "Follow-ups vencidos", v: vencidas },
            { r: "Propostas enviadas sem resposta", v: semResposta },
          ].map((m) => (
            <div key={m.r} className="rounded-xl border border-navy/10 bg-cream/50 p-4">
              <p className="font-serif text-2xl text-navy">{m.v}</p>
              <p className="text-xs text-navy/60">{m.r}</p>
            </div>
          ))}
        </div>
      </Secao>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="space-y-3">
          <Secao titulo="Contatos" descricao="Origem sempre declarada. Nada é inferido.">
            <div className="grid gap-3">
              <Texto label="Nome" valor={contato.nome} onChange={(v) => setContato((c) => ({ ...c, nome: v }))} />
              <Texto label="E-mail" valor={contato.email} onChange={(v) => setContato((c) => ({ ...c, email: v }))} />
              <Texto label="Telefone" valor={contato.telefone} onChange={(v) => setContato((c) => ({ ...c, telefone: v }))} />
              <Selecao label="Origem" valor={contato.origem} opcoes={op(ORIGENS_CONTATO)} onChange={(v) => setContato((c) => ({ ...c, origem: v }))} />
              <button
                type="button"
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
                disabled={!podeEscrever || !contato.nome.trim() || mutContato.isPending}
                onClick={() => mutContato.mutate()}
              >
                Registrar contato
              </button>
            </div>
          </Secao>

          <Secao titulo="Oportunidades" descricao="Filtros operacionais do dia.">
            <div className="grid gap-3">
              <Selecao label="Etapa comercial" valor={filtroEtapa} opcoes={op(ETAPAS_COMERCIAIS)} onChange={setFiltroEtapa} />
              <label className="flex items-center gap-2 text-xs text-navy/70">
                <input type="checkbox" checked={soPendentes} onChange={(e) => setSoPendentes(e.target.checked)} />
                Somente com pendência ou prazo vencido
              </label>
              <button
                type="button"
                className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy"
                onClick={() => {
                  setSelecionada(null);
                  setRascunho({ etapa_comercial: "contato_inicial" });
                }}
              >
                Nova oportunidade
              </button>
              <ul className="max-h-96 space-y-2 overflow-auto">
                {lista.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelecionada(o.id);
                        setRascunho({});
                      }}
                      className={`w-full rounded-lg border p-3 text-left text-sm ${selecionada === o.id ? "border-gold bg-gold/10" : "border-navy/10 bg-white"}`}
                    >
                      <span className="block font-medium text-navy">{nomeContato(o.contact_id)}</span>
                      <span className="block text-xs text-navy/60">{rotuloDe(ETAPAS_COMERCIAIS, o.etapa_comercial)}</span>
                      {o.pendencias?.length ? <span className="mt-1 block text-[11px] text-terracotta">{o.pendencias.length} pendência(s)</span> : null}
                      {acaoVencida(o.prazo_proxima_acao) ? <span className="block text-[11px] text-terracotta">Prazo vencido</span> : null}
                    </button>
                  </li>
                ))}
                {!lista.length ? <li className="text-xs text-navy/50">Nenhuma oportunidade neste filtro.</li> : null}
              </ul>
            </div>
          </Secao>
        </div>

        <div className="space-y-3">
          <Secao titulo="Ficha da oportunidade" descricao="Responsável, próxima ação e prazo são obrigatórios enquanto ativa.">
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="Contato"
                valor={val("contact_id")}
                opcoes={contatos.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                onChange={set("contact_id")}
              />
              <Selecao label="Etapa comercial" valor={val("etapa_comercial")} opcoes={op(ETAPAS_COMERCIAIS)} onChange={set("etapa_comercial")} />
              <div className="md:col-span-2">
                <Texto label="Objetivo declarado pelo cliente" valor={val("objetivo_declarado")} onChange={set("objetivo_declarado")} area />
              </div>
              <Texto label="Responsável nominal" valor={val("responsavel_nome")} onChange={set("responsavel_nome")} />
              <Texto label="País / linha prioritária" valor={val("pais_linha_prioritaria")} onChange={set("pais_linha_prioritaria")} />
              <Texto label="Próxima ação" valor={val("proxima_acao")} onChange={set("proxima_acao")} />
              <Texto label="Prazo da próxima ação" tipo="date" valor={val("prazo_proxima_acao").slice(0, 10)} onChange={set("prazo_proxima_acao")} />
              <div className="md:col-span-2">
                <Texto label="Resumo interno" valor={val("resumo_interno")} onChange={set("resumo_interno")} area />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
                disabled={!podeEscrever || mutOp.isPending}
                onClick={() => mutOp.mutate()}
              >
                Salvar oportunidade
              </button>
              {atual ? (
                <button
                  type="button"
                  className="rounded-lg border border-terracotta/40 px-4 py-2 text-sm text-terracotta disabled:opacity-50"
                  disabled={!podeEscrever || mutArquivar.isPending}
                  onClick={() => {
                    const motivo = window.prompt("Motivo do arquivamento");
                    if (motivo?.trim()) mutArquivar.mutate(motivo.trim());
                  }}
                >
                  Arquivar
                </button>
              ) : null}
            </div>
          </Secao>

          {atual ? (
            <>
              <Secao titulo="Triagem de Discovery" descricao="Sinal preliminar interno. Não é promessa nem diagnóstico jurídico.">
                <div className="grid gap-3 md:grid-cols-2">
                  <Texto label="Objetivo principal" valor={disc.objetivo_principal} onChange={(v) => setDisc((d) => ({ ...d, objetivo_principal: v }))} />
                  <Texto label="Estrutura familiar informada" valor={disc.estrutura_familiar} onChange={(v) => setDisc((d) => ({ ...d, estrutura_familiar: v }))} />
                  <Texto label="Linha de transmissão indicada" valor={disc.linha_transmissao} onChange={(v) => setDisc((d) => ({ ...d, linha_transmissao: v }))} />
                  <Texto label="Estado documental inicial" valor={disc.estado_documental_inicial} onChange={(v) => setDisc((d) => ({ ...d, estado_documental_inicial: v }))} />
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
                  disabled={!podeEscrever || !disc.objetivo_principal.trim() || mutDiscovery.isPending}
                  onClick={() => mutDiscovery.mutate()}
                >
                  Registrar triagem
                </button>
                <p className="mt-2 text-xs text-navy/55">
                  Triagens registradas nesta oportunidade: {discoveries.filter((d) => d.opportunity_id === atual.id).length}
                </p>
              </Secao>

              <Secao
                titulo="Aceite verbal e confirmação formal"
                descricao="São dois momentos distintos. Nenhum deles cria contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy disabled:opacity-50"
                    disabled={!podeEscrever || mutAceite.isPending}
                    onClick={() => mutAceite.mutate()}
                  >
                    Registrar aceite verbal
                  </button>
                  <div className="grid gap-2">
                    <Texto label="Referência interna verificável" valor={referencia} onChange={setReferencia} />
                    <button
                      type="button"
                      className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
                      disabled={!podeEscrever || mutConfirmacao.isPending}
                      onClick={() => mutConfirmacao.mutate()}
                    >
                      Registrar confirmação formal
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-navy/55">
                  A confirmação formal libera apenas a preparação interna dos instrumentos.
                </p>
              </Secao>

              <Secao titulo="Interações" descricao="Registros imutáveis: correções entram como novo registro.">
                <div className="grid gap-3 md:grid-cols-2">
                  <Selecao label="Tipo" valor={inter.tipo} opcoes={op(TIPOS_INTERACAO)} onChange={(v) => setInter((i) => ({ ...i, tipo: v }))} />
                  <Selecao label="Direção" valor={inter.direcao} opcoes={op(DIRECOES_INTERACAO)} onChange={(v) => setInter((i) => ({ ...i, direcao: v }))} />
                  <div className="md:col-span-2">
                    <Texto label="Resumo validado" valor={inter.resumo_interno} onChange={(v) => setInter((i) => ({ ...i, resumo_interno: v }))} area />
                  </div>
                  <Texto label="Próxima ação" valor={inter.proxima_acao} onChange={(v) => setInter((i) => ({ ...i, proxima_acao: v }))} />
                  <Texto label="Prazo" tipo="date" valor={inter.prazo_proxima_acao} onChange={(v) => setInter((i) => ({ ...i, prazo_proxima_acao: v }))} />
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
                  disabled={!podeEscrever || !inter.tipo || !inter.resumo_interno.trim() || mutInteracao.isPending}
                  onClick={() => mutInteracao.mutate()}
                >
                  Registrar interação
                </button>
                <ul className="mt-4 space-y-2">
                  {interacoes
                    .filter((i) => i.opportunity_id === atual.id)
                    .slice(0, 12)
                    .map((i) => (
                      <li key={i.id} className="rounded-lg border border-navy/10 bg-white p-3 text-xs text-navy/70">
                        <span className="font-medium text-navy">{rotuloDe(TIPOS_INTERACAO, i.tipo)}</span> ·{" "}
                        {String(i.ocorrido_em ?? i.created_at ?? "").slice(0, 10)}
                        <p className="mt-1">{i.resumo_interno}</p>
                      </li>
                    ))}
                </ul>
              </Secao>

              <Secao titulo="Histórico comercial" descricao="Eventos auditáveis desta oportunidade.">
                <ul className="space-y-2">
                  {eventos
                    .filter((e) => e.opportunity_id === atual.id)
                    .slice(0, 20)
                    .map((e) => (
                      <li key={e.id} className="flex justify-between rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/70">
                        <span>{e.event_type}</span>
                        <span>{String(e.occurred_at ?? "").slice(0, 10)}</span>
                      </li>
                    ))}
                  {!eventos.filter((e) => e.opportunity_id === atual.id).length ? (
                    <li className="text-xs text-navy/50">Nenhum evento registrado.</li>
                  ) : null}
                </ul>
              </Secao>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
