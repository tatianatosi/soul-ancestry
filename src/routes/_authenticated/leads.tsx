import { PainelDeskHoje } from "@/components/painel/painel-desk-hoje";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { FluxoComercialCanonico } from "@/components/crm/fluxo-canonico";
import { HandoffLead } from "@/components/crm/handoff-lead";
import { NovoLeadDialog } from "@/components/crm/novo-lead";
import { PainelCanonicoCrm } from "@/components/crm/painel-canonico";
import { TemplatesWhatsapp } from "@/components/crm/templates-whatsapp";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { arquivarLeadDesk, listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import {
  AREAS_RESPONSAVEIS,
  CATALOGOS,
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  MOTIVOS_PERDA,
  NACIONALIDADES,
  OBJETIVOS,
  ORIGENS_LEAD,
  PROXIMAS_ACOES,
  RESULTADOS_DISCOVERY,
  SERVICOS_INICIAIS,
  STATUS_CALL,
  STATUS_VIA,
  ELEGIBILIDADE_PRELIMINAR,
  CONFIANCA_TRIAGEM,
  GERACOES_ASCENDENTE,
  LINHAS_TRANSMISSAO,
  RISCOS_RUPTURA,
  COMPLEXIDADE_DOCUMENTAL,
  ESTADO_DOCUMENTAL_INICIAL,
  PENDENCIAS_DOCUMENTAIS,
  EXIGE_IDIOMA_ENTREVISTA,
  ESTRUTURAS_FAMILIARES,
  OBJECOES,
  NIVEIS_INTENCAO,
  PRODUTOS_RECOMENDADOS,
  DESPESAS_TERCEIROS_STATUS,
  DESPESAS_TERCEIROS_REGRA,
  DESPESAS_TERCEIROS_FAIXA,
  VIAS_JURIDICAS,
  resultadoComercialDerivado,
  rotulo,
  validarLead,
  type ErroValidacao,
  type LeadDesk,
} from "@/lib/crm-desk";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "CRM de leads — Clube Ancestral" },
      { name: "description", content: "Desk comercial diário: leads, Discovery, eixos comercial e de formalização." },
      { property: "og:title", content: "CRM de leads — Clube Ancestral" },
      { property: "og:description", content: "Desk comercial diário do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

type LeadComPendencias = LeadDesk & { pendencias?: ErroValidacao[] };

function LeadsPage() {
  const { podeEscrever } = useSaas();
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const arquivar = useServerFn(arquivarLeadDesk);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["leads-desk"], queryFn: () => carregar(), retry: false });
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  const [filtroEixo, setFiltroEixo] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [novoLeadAberto, setNovoLeadAberto] = useState(false);

  const leads = (q.data ?? []) as LeadComPendencias[];
  const atual = useMemo(() => leads.find((l) => l.id === selecionado) ?? null, [leads, selecionado]);
  const editado = useMemo(() => ({ ...(atual ?? { nome: "" }), ...rascunho }) as LeadDesk, [atual, rascunho]);
  const erros = useMemo(() => (atual || Object.keys(rascunho).length ? validarLead(editado) : []), [editado, atual, rascunho]);

  const mutSalvar = useMutation({
    mutationFn: () => salvar({ data: { id: atual?.id ?? null, valores: rascunho } }),
    onSuccess: (r) => {
      if (!r.ok) {
        setMsg("Gravação recusada: corrija as pendências listadas.");
        return;
      }
      setMsg("Registro gravado.");
      setRascunho({});
      setSelecionado(r.lead?.id ?? null);
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const mutArquivar = useMutation({
    mutationFn: (motivo: string) => arquivar({ data: { id: String(atual?.id), motivo } }),
    onSuccess: () => {
      setMsg("Lead arquivado (sem exclusão física).");
      setSelecionado(null);
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const visiveis = leads.filter((l) => {
    if (filtroEixo && l.eixo_comercial !== filtroEixo) return false;
    if (filtroArea && l.area_responsavel !== filtroArea) return false;
    if (busca && !`${l.nome} ${l.codigo ?? ""} ${l.email ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const campo = (k: string) => String((editado as Record<string, unknown>)[k] ?? "");
  const set = (k: string) => (v: unknown) => setRascunho((r) => ({ ...r, [k]: v }));
  const bool = (k: string) => Boolean((editado as Record<string, unknown>)[k]);
  const data = (k: string) => String((editado as Record<string, unknown>)[k] ?? "").slice(0, 10);

  return (
    <SaasShell titulo="CRM Vivo — Leads e triagem" descricao="Comercial → CRM Vivo: entrada, Discovery, contatos e conversas, proposta e handoff.">
      <NovoLeadDialog
        aberto={novoLeadAberto}
        onFechar={() => setNovoLeadAberto(false)}
        onCriado={(id) => {
          setNovoLeadAberto(false);
          setRascunho({});
          setSelecionado(id);
          setMsg("Lead criado em Triagem.");
        }}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="space-y-3">
          <Secao titulo="Filtros" descricao="Todos os campos classificatórios são listas fechadas.">
            <div className="grid gap-3">
              <Texto label="Buscar por nome, código ou e-mail" valor={busca} onChange={setBusca} />
              <Selecao label="Eixo comercial" valor={filtroEixo} opcoes={EIXO_COMERCIAL} onChange={setFiltroEixo} />
              <Selecao label="Área responsável" valor={filtroArea} opcoes={AREAS_RESPONSAVEIS} onChange={setFiltroArea} />
              {podeEscrever ? (
                <button
                  type="button"
                  className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
                  onClick={() => {
                    setNovoLeadAberto(true);
                    setMsg(null);
                  }}
                >
                  Novo lead
                </button>
              ) : null}
            </div>
          </Secao>

          <Secao titulo={`Leads (${visiveis.length})`} descricao="Código único gerado pelo sistema.">
            {q.isLoading ? <p className="text-sm text-navy/50">Carregando…</p> : null}
            <ul className="max-h-[520px] space-y-2 overflow-auto">
              {visiveis.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelecionado(l.id ?? null);
                      setRascunho({});
                      setMsg(null);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      selecionado === l.id ? "border-gold bg-cream/60" : "border-navy/10 bg-white"
                    }`}
                  >
                    <span className="block font-medium text-navy">
                      {l.codigo ?? "—"} · {l.nome}
                      {l.dados_teste ? (
                        <span className="ml-2 rounded border border-navy/20 bg-cream px-1.5 py-0.5 align-middle text-[10px] uppercase tracking-wide text-navy/60">
                          dado de teste
                        </span>
                      ) : null}
                    </span>

                    <span className="block text-[11px] text-navy/55">
                      {rotulo("eixo_comercial", l.eixo_comercial)} · {rotulo("eixo_formalizacao", l.eixo_formalizacao)} ·{" "}
                      {resultadoComercialDerivado(l)}
                    </span>
                    {l.pendencias?.length ? (
                      <span className="mt-1 block text-[11px] text-terracotta">{l.pendencias.length} pendência(s)</span>
                    ) : null}
                    {l.archived_at ? <span className="block text-[11px] text-navy/40">Arquivado</span> : null}
                  </button>
                </li>
              ))}
              {!visiveis.length && !q.isLoading ? <li className="text-sm text-navy/50">Nenhum lead nos filtros.</li> : null}
            </ul>
          </Secao>
        </div>

        <div className="space-y-3">
          {msg ? <p className="rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-sm text-navy">{msg}</p> : null}

          {atual ? <HandoffLead lead={editado} /> : null}


          {erros.length ? (
            <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
              <p className="text-sm font-medium text-terracotta">Pendências que impedem a gravação</p>
              <ul className="mt-2 space-y-1 text-xs text-navy/70">
                {erros.map((e) => (
                  <li key={`${e.campo}-${e.motivo}`}>
                    <strong>{e.campo}</strong>: {e.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Secao titulo="Identificação e responsabilidade" descricao="Lead ativo exige área, responsável e próxima ação datada.">
            <div className="grid gap-3 md:grid-cols-2">
              <Texto label="Nome" valor={campo("nome")} onChange={set("nome")} desabilitado={!podeEscrever} />
              <Texto label="Código" valor={String(editado.codigo ?? "gerado ao salvar")} onChange={() => {}} desabilitado />
              <Texto label="E-mail" valor={campo("email")} onChange={set("email")} desabilitado={!podeEscrever} />
              <Texto label="Telefone" valor={campo("telefone")} onChange={set("telefone")} desabilitado={!podeEscrever} />
              <Selecao label="Origem" valor={campo("origem")} opcoes={ORIGENS_LEAD} onChange={set("origem")} desabilitado={!podeEscrever} />
              <Selecao
                label="Área responsável"
                valor={campo("area_responsavel")}
                opcoes={AREAS_RESPONSAVEIS}
                onChange={set("area_responsavel")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Responsável nominal"
                valor={campo("responsavel_nome")}
                onChange={set("responsavel_nome")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Próxima ação"
                valor={campo("proxima_acao")}
                opcoes={PROXIMAS_ACOES}
                onChange={set("proxima_acao")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Data da próxima ação"
                tipo="date"
                valor={data("proxima_acao_em")}
                onChange={set("proxima_acao_em")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Último follow-up"
                tipo="date"
                valor={data("ultimo_followup_em")}
                onChange={set("ultimo_followup_em")}
                desabilitado={!podeEscrever}
              />
            </div>
          </Secao>

          <Secao titulo="Objetivo e linha preliminar" descricao="Leitura interna preliminar; não é parecer jurídico.">
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao label="Objetivo" valor={campo("objetivo")} opcoes={OBJETIVOS} onChange={set("objetivo")} desabilitado={!podeEscrever} />
              <Selecao
                label="Nacionalidade de interesse"
                valor={campo("nacionalidade")}
                opcoes={NACIONALIDADES}
                onChange={set("nacionalidade")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Via jurídica preliminar"
                valor={campo("via_juridica_preliminar")}
                opcoes={VIAS_JURIDICAS}
                onChange={set("via_juridica_preliminar")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Status da via"
                valor={campo("status_via")}
                opcoes={STATUS_VIA}
                onChange={set("status_via")}
                desabilitado={!podeEscrever}
              />
              <div className="md:col-span-2">
                <Texto
                  label="Narrativa familiar (texto livre)"
                  area
                  valor={campo("narrativa_familiar")}
                  onChange={set("narrativa_familiar")}
                  desabilitado={!podeEscrever}
                />
              </div>
            </div>
          </Secao>

          <Secao titulo="Discovery" descricao="Call realizada exige resultado, resumo validado e próxima ação datada.">
            <div className="grid gap-3 md:grid-cols-2">
              <Texto
                label="Call agendada em"
                tipo="datetime-local"
                valor={String(editado.call_agendada_em ?? "").slice(0, 16)}
                onChange={set("call_agendada_em")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Call realizada em"
                tipo="datetime-local"
                valor={String(editado.call_realizada_em ?? "").slice(0, 16)}
                onChange={set("call_realizada_em")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Resultado da Discovery"
                valor={campo("discovery_resultado")}
                opcoes={RESULTADOS_DISCOVERY}
                onChange={set("discovery_resultado")}
                desabilitado={!podeEscrever}
              />
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("resumo_validado")}
                  disabled={!podeEscrever}
                  onChange={(e) => set("resumo_validado")(e.target.checked)}
                />
                Resumo da call validado
              </label>
              <div className="md:col-span-2">
                <Texto
                  label="Resumo da call (texto livre)"
                  area
                  valor={campo("resumo_call")}
                  onChange={set("resumo_call")}
                  desabilitado={!podeEscrever}
                />
              </div>
            </div>
          </Secao>

          <Secao
            titulo="Triagem preliminar (Discovery)"
            descricao="Leitura comercial/técnica preliminar. Não é decisão jurídica final nem promessa de resultado."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao label="Status da call" valor={campo("status_call")} opcoes={STATUS_CALL} onChange={set("status_call")} desabilitado={!podeEscrever} />
              <Selecao label="Elegibilidade preliminar" valor={campo("elegibilidade_preliminar")} opcoes={ELEGIBILIDADE_PRELIMINAR} onChange={set("elegibilidade_preliminar")} desabilitado={!podeEscrever} />
              <Selecao label="Confiança da triagem" valor={campo("confianca_triagem")} opcoes={CONFIANCA_TRIAGEM} onChange={set("confianca_triagem")} desabilitado={!podeEscrever} />
              <Selecao label="Geração do ascendente" valor={campo("geracao_ascendente")} opcoes={GERACOES_ASCENDENTE} onChange={set("geracao_ascendente")} desabilitado={!podeEscrever} />
              <Selecao label="Linha de transmissão" valor={campo("linha_transmissao")} opcoes={LINHAS_TRANSMISSAO} onChange={set("linha_transmissao")} desabilitado={!podeEscrever} />
              <Selecao label="Risco de ruptura" valor={campo("risco_ruptura")} opcoes={RISCOS_RUPTURA} onChange={set("risco_ruptura")} desabilitado={!podeEscrever} />
              <Selecao label="Complexidade documental" valor={campo("complexidade_documental")} opcoes={COMPLEXIDADE_DOCUMENTAL} onChange={set("complexidade_documental")} desabilitado={!podeEscrever} />
              <Selecao label="Estado documental inicial" valor={campo("estado_documental_inicial")} opcoes={ESTADO_DOCUMENTAL_INICIAL} onChange={set("estado_documental_inicial")} desabilitado={!podeEscrever} />
              <Selecao label="Pendência documental prioritária" valor={campo("pendencia_documental_prioritaria")} opcoes={PENDENCIAS_DOCUMENTAIS} onChange={set("pendencia_documental_prioritaria")} desabilitado={!podeEscrever} />
              <Selecao label="Exige idioma/entrevista" valor={campo("exige_idioma_entrevista")} opcoes={EXIGE_IDIOMA_ENTREVISTA} onChange={set("exige_idioma_entrevista")} desabilitado={!podeEscrever} />
              <Texto label="Requerentes potenciais" tipo="number" valor={campo("requerentes_potenciais")} onChange={(v) => set("requerentes_potenciais")(v === "" ? null : Number(v))} desabilitado={!podeEscrever} />
              <Selecao label="Estrutura familiar" valor={campo("estrutura_familiar")} opcoes={ESTRUTURAS_FAMILIARES} onChange={set("estrutura_familiar")} desabilitado={!podeEscrever} />
              <Selecao label="Objeção predominante" valor={campo("objecao_predominante")} opcoes={OBJECOES} onChange={set("objecao_predominante")} desabilitado={!podeEscrever} />
              <Selecao label="Nível de intenção" valor={campo("nivel_intencao")} opcoes={NIVEIS_INTENCAO} onChange={set("nivel_intencao")} desabilitado={!podeEscrever} />
            </div>
          </Secao>

          <Secao titulo="SPIN e registro da conversa" descricao="Gravação e transcrição só com consentimento explícito registrado.">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["spin_situacao", "Situação mapeada"],
                ["spin_problema", "Problema explicitado"],
                ["spin_implicacao", "Implicação discutida"],
                ["spin_necessidade", "Necessidade de solução declarada"],
              ].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-navy">
                  <input type="checkbox" checked={bool(k)} disabled={!podeEscrever} onChange={(e) => set(k)(e.target.checked)} />
                  {label}
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm text-navy">
                <input type="checkbox" checked={bool("consentimento_gravacao")} disabled={!podeEscrever} onChange={(e) => set("consentimento_gravacao")(e.target.checked)} />
                Consentimento de gravação registrado
              </label>
              <Texto label="Gravação (referência interna)" valor={campo("gravacao_link_interno")} onChange={set("gravacao_link_interno")} desabilitado={!podeEscrever || !bool("consentimento_gravacao")} />
              <Texto label="Dossiê do cliente (referência interna)" valor={campo("dossie_link_interno")} onChange={set("dossie_link_interno")} desabilitado={!podeEscrever} />
            </div>
          </Secao>

          <Secao
            titulo="Recomendação comercial e despesas de terceiros"
            descricao="Preço, condição e link de cobrança vêm da Planilha Mestre de Produtos/SKUs. O CRM registra apenas a recomendação e a referência."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-navy">Produtos/serviços recomendados</p>
                <div className="grid gap-1 md:grid-cols-3">
                  {PRODUTOS_RECOMENDADOS.map((o) => {
                    const atuais = (editado.produtos_recomendados ?? []) as string[];
                    return (
                      <label key={o.valor} className="flex items-center gap-2 text-sm text-navy/80">
                        <input
                          type="checkbox"
                          disabled={!podeEscrever}
                          checked={atuais.includes(o.valor)}
                          onChange={(e) =>
                            set("produtos_recomendados")(
                              e.target.checked ? [...atuais, o.valor] : atuais.filter((v) => v !== o.valor),
                            )
                          }
                        />
                        {o.rotulo}
                      </label>
                    );
                  })}
                </div>
              </div>
              <Texto label="Referência de SKU (Planilha Mestre)" valor={campo("sku_referencia")} onChange={set("sku_referencia")} desabilitado={!podeEscrever} />
              <Selecao label="Status das despesas de terceiros" valor={campo("despesas_terceiros_status")} opcoes={DESPESAS_TERCEIROS_STATUS} onChange={set("despesas_terceiros_status")} desabilitado={!podeEscrever} />
              <Selecao label="Regra de pagamento das despesas" valor={campo("despesas_terceiros_regra")} opcoes={DESPESAS_TERCEIROS_REGRA} onChange={set("despesas_terceiros_regra")} desabilitado={!podeEscrever} />
              <Selecao label="Faixa estimada de despesas" valor={campo("despesas_terceiros_faixa")} opcoes={DESPESAS_TERCEIROS_FAIXA} onChange={set("despesas_terceiros_faixa")} desabilitado={!podeEscrever} />
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Despesas de terceiros são sempre do cliente: o Clube não antecipa nem reembolsa. Nenhum valor ou link de cobrança é editável aqui.
            </p>
          </Secao>

          <Secao
            titulo="Comercial e formalização"
            descricao="Preço, SKU e link de pagamento não são campo livre: registre apenas referência interna."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="Eixo comercial"
                valor={campo("eixo_comercial")}
                opcoes={EIXO_COMERCIAL}
                onChange={set("eixo_comercial")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Eixo de formalização"
                valor={campo("eixo_formalizacao")}
                opcoes={EIXO_FORMALIZACAO}
                onChange={set("eixo_formalizacao")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Serviço inicial aprovado"
                valor={campo("servico_inicial_aprovado")}
                opcoes={SERVICOS_INICIAIS}
                onChange={set("servico_inicial_aprovado")}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Motivo de perda"
                valor={campo("motivo_perda")}
                opcoes={MOTIVOS_PERDA}
                onChange={set("motivo_perda")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Link interno da proposta"
                valor={campo("proposta_link_interno")}
                onChange={set("proposta_link_interno")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Referência interna da proposta"
                valor={campo("proposta_referencia_interna")}
                onChange={set("proposta_referencia_interna")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Link interno do contrato"
                valor={campo("contrato_link_interno")}
                onChange={set("contrato_link_interno")}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Referência do evento Asaas"
                valor={campo("asaas_evento_referencia")}
                onChange={set("asaas_evento_referencia")}
                ajuda="Somente referência ao evento transacional; nenhum valor ou link é criado aqui."
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Pagamento previsto para"
                tipo="date"
                valor={data("pagamento_previsto_em")}
                onChange={set("pagamento_previsto_em")}
                desabilitado={!podeEscrever}
              />
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("dados_teste")}
                  disabled={!podeEscrever}
                  onChange={(e) => set("dados_teste")(e.target.checked)}
                />
                Registro de teste (excluído das métricas)
              </label>
            </div>
            <p className="mt-3 text-xs text-navy/55">
              Resultado comercial derivado: <strong>{resultadoComercialDerivado(editado)}</strong>
            </p>
          </Secao>

          {podeEscrever ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={mutSalvar.isPending || erros.length > 0 || !Object.keys(rascunho).length}
                onClick={() => mutSalvar.mutate()}
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
              >
                {mutSalvar.isPending ? "Gravando…" : "Gravar"}
              </button>
              {atual?.id && !atual.archived_at ? (
                <button
                  type="button"
                  onClick={() => {
                    const motivo = window.prompt("Motivo do arquivamento:");
                    if (motivo?.trim()) mutArquivar.mutate(motivo.trim());
                  }}
                  className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy"
                >
                  Arquivar
                </button>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs text-navy/45">
            Listas controladas em uso: {Object.keys(CATALOGOS).length} campos classificatórios. Entrada fora da lista é recusada no
            servidor e no banco.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="font-serif text-xl text-navy">Fluxo comercial canônico</h2>
        <p className="text-xs text-navy/55">
          Contatos, oportunidades, Discovery, aceite verbal e confirmação formal. Nenhum registro aqui cria contrato, cobrança,
          assinatura, onboarding, pesquisa externa ou App Cliente.
        </p>
        <FluxoComercialCanonico />
      </div>

      <div id="crm-contatos" className="mt-6 scroll-mt-24 space-y-3">
        <h2 className="font-serif text-xl text-navy">Contatos, conversas e eventos de funil</h2>
        <p className="text-xs text-navy/55">
          Núcleo operacional canônico do Desk. Conversas são imutáveis e eventos sensíveis exigem confirmação humana e evidência
          interna. Nada aqui envia mensagem nem gera ato externo.
        </p>
        <PainelCanonicoCrm podeEscrever={podeEscrever} />
      </div>

      <div id="crm-templates" className="mt-6 scroll-mt-24">
        <TemplatesWhatsapp />
      </div>
      <PainelDeskHoje />

    </SaasShell>
  );
}
