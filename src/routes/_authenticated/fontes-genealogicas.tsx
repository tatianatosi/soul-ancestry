import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import {
  ACESSOS,
  agruparCatalogo,
  AVISO_CATALOGO,
  CRITERIOS_MATRIZ,
  ESTAGIOS,
  MODOS_USO,
  NIVEIS_FONTE,
  pendenciasGovernanca,
  permiteConsultaAutomatica,
  PRIORIDADES,
  rotuloDe,
  SCRAPING_STATUS,
  STATUS_BACKLOG,
  STATUS_DOCUMENTACAO,
  STATUS_INTEGRACAO,
  type Fonte,
} from "@/lib/fontes-genealogicas";
import {
  arquivarRegistroG08,
  painelFontes,
  salvarAvaliacaoFonte,
  salvarBacklogFonte,
  salvarFonte,
} from "@/lib/fontes-genealogicas.functions";
import { toast } from "sonner";
import { PAISES_LINHA_PRIORITARIA } from "@/lib/crm-desk";
import { resumoFontesPorPais, type FonteCatalogo } from "@/lib/fontes-por-pais";

import { motivoCampoInvalido } from "@/components/campos/aviso-campo";
import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta, Indicador } from "@/components/prancha-v4/kit";
import { filtrarPorBusca } from "@/lib/rotulo-negocio";
import { MarcosJuridicosPorPais } from "@/components/pesquisa/marcos-juridicos-paises";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Route = createFileRoute("/_authenticated/fontes-genealogicas")({
  head: () => ({
    meta: [
      { title: "Fontes e Integrações Genealógicas — Clube Ancestral" },
      {
        name: "description",
        content:
          "Catálogo interno de bases genealógicas, matriz de avaliação e backlog de ativação, sem qualquer consulta externa.",
      },
      { property: "og:title", content: "Fontes e Integrações Genealógicas — Clube Ancestral" },
      {
        property: "og:description",
        content:
          "Governança documental de fontes: maturidade, termos, risco e próximos passos internos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <SaasShell titulo="Fontes genealógicas" descricao="Falha ao carregar o catálogo.">
      <p role="alert" className="text-sm text-terracotta">
        Não foi possível abrir o catálogo: {(error as Error).message}
      </p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Fontes genealógicas" descricao="Catálogo não encontrado.">
      <p className="text-sm text-navy/70">Catálogo não encontrado.</p>
    </SaasShell>
  ),
  component: FontesGenealogicas,
});

function Campo({ r, v }: { r: string; v: React.ReactNode }) {
  return (
    <p className="text-[11px] text-navy/60">
      <span className="uppercase tracking-wide text-navy/40">{r}: </span>
      {v ?? "—"}
    </p>
  );
}

// V4-04: seção do catálogo = cartão canônico (CaCard) com eyebrow.
function Secao({
  titulo,
  subtitulo,
  eyebrow = "Fontes · catálogo",
  className,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <CaCard titulo={titulo} eyebrow={eyebrow} className={className}>
      {subtitulo && <p className="-mt-1 mb-3 text-[11px] text-navy/50">{subtitulo}</p>}
      <div className="mt-2 space-y-3">{children}</div>
    </CaCard>
  );
}

function EditarFonte({ fonte, onSalvo }: { fonte: Fonte; onSalvo: () => void }) {
  const [form, setForm] = useState({
    status_documentacao: fonte.status_documentacao ?? "",
    status_integracao: fonte.status_integracao ?? "",
    scraping_status: fonte.scraping_status ?? "",
    ultima_verificacao: fonte.ultima_verificacao ?? "",
    responsavel_revisao: fonte.responsavel_revisao ?? "",
    proxima_acao: fonte.proxima_acao ?? "",
    observacao_risco: fonte.observacao_risco ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const salvarFn = useServerFn(salvarFonte);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    Object.entries(form).some(
      ([k, v]) => String(v ?? "") !== String((fonte as Record<string, unknown>)[k] ?? ""),
    ),
  );
  const m = useMutation({
    mutationFn: () => salvarFn({ data: { id: fonte.id, valores: form } }),
    onSuccess: () => {
      setErro(null);
      onSalvo();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const cls = "w-full rounded border border-navy/15 px-2 py-1 text-[11px]";

  return (
    <div className="sm:col-span-2 space-y-2 rounded border border-gold/40 bg-gold/5 p-3">
      {erro ? <p className="text-[11px] text-terracotta">{erro}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Documentação
          <select
            className={cls}
            value={form.status_documentacao}
            onChange={(e) => set("status_documentacao", e.target.value)}
          >
            <option value="">—</option>
            {Object.entries(STATUS_DOCUMENTACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Integração
          <select
            className={cls}
            value={form.status_integracao}
            onChange={(e) => set("status_integracao", e.target.value)}
          >
            <option value="">—</option>
            {Object.entries(STATUS_INTEGRACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Scraping
          <select
            className={cls}
            value={form.scraping_status}
            onChange={(e) => set("scraping_status", e.target.value)}
          >
            <option value="">—</option>
            {Object.entries(SCRAPING_STATUS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Última verificação
          <input
            type="date"
            className={cls}
            value={form.ultima_verificacao}
            onChange={(e) => set("ultima_verificacao", e.target.value)}
          />
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Responsável pela revisão
          <input
            className={cls}
            value={form.responsavel_revisao}
            onChange={(e) => set("responsavel_revisao", e.target.value)}
          />
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Próxima ação
          <input
            className={cls}
            value={form.proxima_acao}
            onChange={(e) => set("proxima_acao", e.target.value)}
          />
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50 sm:col-span-2">
          Observação de risco
          <textarea
            className={cls}
            rows={2}
            value={form.observacao_risco}
            onChange={(e) => set("observacao_risco", e.target.value)}
          />
        </label>
      </div>
      <AcaoOperacional
        rotulo={m.isPending ? "Salvando…" : "Salvar"}
        capacidade="editar_rascunho"
        efeito="Atualiza o catálogo interno desta fonte. Nenhuma consulta externa é disparada."
        size="sm"
        onConfirmar={async () => {
          await m.mutateAsync();
        }}
      />
    </div>
  );
}

function CartaoFonte({
  fonte,
  matriz,
  backlog,
  onSalvo,
}: {
  fonte: Fonte;
  matriz: any[];
  backlog: any[];
  onSalvo: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const consulta = permiteConsultaAutomatica(fonte);
  const pendencias = pendenciasGovernanca(fonte);

  return (
    <article className="rounded-md border border-navy/10 bg-background p-3">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-sm font-medium text-navy">{fonte.nome}</span>
          <span className="block text-[11px] text-navy/50">
            {fonte.pais_eixo} · {rotuloDe(NIVEIS_FONTE as any, fonte.nivel_de_fonte)} ·{" "}
            {rotuloDe(ESTAGIOS as any, fonte.estagio_maturidade)}
          </span>
        </span>
        <Etiqueta texto={rotuloDe(PRIORIDADES as any, fonte.prioridade)} />
      </button>

      {aberto && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Campo r="Tipo de acervo" v={fonte.tipo_de_acervo} />
            <Campo r="Cobertura temporal" v={fonte.cobertura_temporal} />
            <Campo r="Cobertura geográfica" v={fonte.cobertura_geografica} />
            <Campo r="Acesso" v={rotuloDe(ACESSOS as any, fonte.acesso)} />
            <Campo r="Custo" v={fonte.custo} />
            <Campo r="Autenticação necessária" v={fonte.autenticacao_necessaria ? "Sim" : "Não"} />
            <Campo r="Trata dados pessoais" v={fonte.trata_dados_pessoais ? "Sim" : "Não"} />
            <Campo r="Licença / termos" v={fonte.licenca_termos} />
            <Campo r="Referência interna" v={fonte.url_referencia_interna} />
          </div>
          <div className="space-y-1">
            <Campo
              r="Modo de uso permitido"
              v={rotuloDe(MODOS_USO as any, fonte.modo_de_uso_permitido)}
            />
            <Campo r="Scraping" v={rotuloDe(SCRAPING_STATUS as any, fonte.scraping_status)} />
            <Campo
              r="Documentação"
              v={rotuloDe(STATUS_DOCUMENTACAO as any, fonte.status_documentacao)}
            />
            <Campo r="Integração" v={rotuloDe(STATUS_INTEGRACAO as any, fonte.status_integracao)} />
            <Campo r="Risco" v={fonte.risco} />
            <Campo r="Observação de risco" v={fonte.observacao_risco} />
            <Campo r="Uso recomendado" v={fonte.uso_recomendado} />
            <Campo r="Última verificação" v={fonte.ultima_verificacao} />
            <Campo r="Responsável pela revisão" v={fonte.responsavel_revisao} />
            <Campo r="Próxima ação" v={fonte.proxima_acao} />
          </div>

          <div className="sm:col-span-2 rounded border border-terracotta/30 bg-terracotta/5 p-2 text-[11px] text-navy/70">
            Consulta automática: indisponível. {consulta.motivo}
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setEditando((v) => !v)}
              className="rounded border border-navy/20 px-2 py-1 text-[11px] text-navy hover:border-gold"
            >
              {editando ? "Fechar edição" : "Editar"}
            </button>
          </div>
          {editando ? (
            <EditarFonte
              fonte={fonte}
              onSalvo={() => {
                setEditando(false);
                onSalvo();
              }}
            />
          ) : null}

          {pendencias.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-navy/40">
                Pendências de governança
              </p>
              <ul className="mt-1 list-disc pl-4 text-[11px] text-navy/70">
                {pendencias.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-navy/40">Matriz de avaliação</p>
            {matriz.length === 0 ? (
              <p className="text-[11px] text-navy/50">Sem avaliação registrada.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-[11px] text-navy/70">
                {matriz.map((m) => (
                  <li key={m.id}>
                    <strong>{rotuloDe(CRITERIOS_MATRIZ as any, m.criterio)}</strong> · nota{" "}
                    {m.nota ?? "—"}
                    {m.bloqueante ? " · bloqueante" : ""} — {m.parecer_interno ?? "sem parecer"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-navy/40">Backlog de ativação</p>
            {backlog.length === 0 ? (
              <p className="text-[11px] text-navy/50">Sem ações internas planejadas.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-[11px] text-navy/70">
                {backlog.map((b) => (
                  <li key={b.id}>
                    {b.acao_interna} · {rotuloDe(STATUS_BACKLOG as any, b.status)} · prazo{" "}
                    {b.prazo ?? "—"} · requer aprovação humana
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/*
            Corte ÓRFÃOS (03/10/2026): a rota importava só `painelFontes` e
            `salvarFonte`. `salvarAvaliacaoFonte`, `salvarBacklogFonte` e
            `arquivarRegistroG08` existiam, com releitura e autorização por
            papel, e tinham zero chamadores — a matriz e o backlog eram
            listas que ninguém conseguia preencher pela tela.
          */}
          <div className="sm:col-span-2">
            <EscreverGovernancaFonte fonteId={fonte.id} onSalvo={onSalvo} />
          </div>
        </div>
      )}
    </article>
  );
}

/** Avaliação, backlog e arquivamento de UMA fonte. Nenhuma consulta externa. */
function EscreverGovernancaFonte({ fonteId, onSalvo }: { fonteId: string; onSalvo: () => void }) {
  const salvarAval = useServerFn(salvarAvaliacaoFonte);
  const salvarBack = useServerFn(salvarBacklogFonte);
  const arquivar = useServerFn(arquivarRegistroG08);

  const [aval, setAval] = useState<Record<string, unknown>>({});
  const [back, setBack] = useState<Record<string, unknown>>({});
  const [motivo, setMotivo] = useState("");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    Object.keys(aval).length > 0 || Object.keys(back).length > 0 || motivo.trim() !== "",
  );
  const t = (v: unknown) => String(v ?? "");

  const mAval = useMutation({
    mutationFn: () => salvarAval({ data: { valores: { ...aval, source_id: fonteId } } }),
    onSuccess: () => {
      toast.success("Avaliação registrada.");
      setAval({});
      onSalvo();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mBack = useMutation({
    mutationFn: () => salvarBack({ data: { valores: { ...back, source_id: fonteId } } }),
    onSuccess: () => {
      toast.success("Ação interna registrada no backlog.");
      setBack({});
      onSalvo();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mArq = useMutation({
    mutationFn: () =>
      arquivar({ data: { tabela: "genealogical_sources_catalog", id: fonteId, motivo } }),
    onSuccess: () => {
      toast.success("Fonte arquivada com motivo.");
      setMotivo("");
      onSalvo();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-gold/40 bg-gold/5 p-2">
      <p className="text-[11px] uppercase tracking-wide text-navy/45">
        Registrar governança desta fonte
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <Selecao
          label="Critério avaliado"
          valor={t(aval.criterio)}
          opcoes={Object.entries(CRITERIOS_MATRIZ).map(([valor, rotulo]) => ({
            valor,
            rotulo: String(rotulo),
          }))}
          onChange={(v) => setAval({ ...aval, criterio: v })}
        />
        <Texto label="Nota" valor={t(aval.nota)} onChange={(v) => setAval({ ...aval, nota: v })} />
        <div className="sm:col-span-2">
          <Texto
            area
            label="Parecer interno"
            valor={t(aval.parecer_interno)}
            onChange={(v) => setAval({ ...aval, parecer_interno: v })}
          />
        </div>
        <Selecao
          label="Bloqueante?"
          valor={t(aval.bloqueante)}
          opcoes={[
            { valor: "true", rotulo: "Sim" },
            { valor: "false", rotulo: "Não" },
          ]}
          onChange={(v) => setAval({ ...aval, bloqueante: v === "true" })}
        />
        <div className="sm:col-span-2">
          <AcaoOperacional
            rotulo={mAval.isPending ? "Salvando…" : "Registrar avaliação"}
            capacidade="editar_rascunho"
            efeito="Grava a avaliação interna da fonte e relê o registro. Nenhuma consulta externa é disparada."
            size="sm"
            validacaoFormulario={t(aval.criterio) ? null : "Escolha o critério avaliado."}
            onConfirmar={async () => {
              await mAval.mutateAsync();
            }}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Texto
          label="Ação interna"
          valor={t(back.acao_interna)}
          onChange={(v) => setBack({ ...back, acao_interna: v })}
        />
        <Selecao
          label="Situação"
          valor={t(back.status)}
          opcoes={Object.entries(STATUS_BACKLOG).map(([valor, rotulo]) => ({
            valor,
            rotulo: String(rotulo),
          }))}
          onChange={(v) => setBack({ ...back, status: v })}
        />
        <Texto
          label="Prazo"
          tipo="date"
          valor={t(back.prazo)}
          onChange={(v) => setBack({ ...back, prazo: v })}
          erro={motivoCampoInvalido("Prazo", "data_futura", t(back.prazo))}
        />
        <Texto
          label="Responsável"
          valor={t(back.responsavel)}
          onChange={(v) => setBack({ ...back, responsavel: v })}
        />
        <div className="sm:col-span-2">
          <Texto
            area
            label="Motivo da ação"
            valor={t(back.motivo)}
            onChange={(v) => setBack({ ...back, motivo: v })}
          />
        </div>
        <div className="sm:col-span-2">
          <AcaoOperacional
            rotulo={mBack.isPending ? "Salvando…" : "Registrar ação interna"}
            capacidade="editar_rascunho"
            efeito="Grava a sugestão interna de ativação, que nasce exigindo aprovação humana. Nada é executado."
            size="sm"
            validacaoFormulario={t(back.acao_interna).trim() ? null : "Descreva a ação interna."}
            onConfirmar={async () => {
              await mBack.mutateAsync();
            }}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {/* Sem exclusão física: arquivar exige motivo e preserva o registro. */}
        <div className="sm:col-span-2">
          <Texto label="Motivo para arquivar esta fonte" valor={motivo} onChange={setMotivo} />
        </div>
        <div className="sm:col-span-2">
          <AcaoOperacional
            rotulo={mArq.isPending ? "Arquivando…" : "Arquivar fonte com motivo"}
            capacidade="editar_rascunho"
            efeito="Marca a fonte como arquivada com motivo. Nada é apagado fisicamente."
            size="sm"
            validacaoFormulario={
              motivo.trim().length >= 5 ? null : "Escreva o motivo (mínimo 5 letras)."
            }
            onConfirmar={async () => {
              await mArq.mutateAsync();
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Cobertura de fontes por país do Planejador (Corte PAÍSES, 03/10/2026).
 * Somente leitura: país habilitado sem base catalogada diz isso em voz alta,
 * em vez de a equipe procurar uma fonte que não existe e achar que é erro de
 * filtro. Não cria fonte, não consulta acervo externo.
 */
function CoberturaDeFontesPorPais({ fontes }: { fontes: Fonte[] }) {
  const resumo = useMemo(
    () => resumoFontesPorPais(PAISES_LINHA_PRIORITARIA, fontes as unknown as FonteCatalogo[]),
    [fontes],
  );
  return (
    <Secao
      titulo="Cobertura de fontes por país"
      subtitulo="Países habilitados no Planejador e quantas fontes vivas o catálogo tem para cada um."
      eyebrow="Fontes · países"
    >
      <ul className="space-y-2" data-fontes-cobertura-pais>
        {resumo.map((r) => (
          <li
            key={r.valor}
            data-fontes-pais={r.estado}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm"
          >
            <span className="font-medium text-navy">{r.rotulo}</span>
            {r.estado === "com_base" ? (
              <span className="text-xs text-navy/60">
                {r.fontes} {r.fontes === 1 ? "fonte" : "fontes"} · {r.comRota} com endereço
              </span>
            ) : (
              <span className="max-w-xl text-xs text-terracotta">{r.mensagem}</span>
            )}
          </li>
        ))}
      </ul>
    </Secao>
  );
}

function FontesGenealogicas() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({
    capacidade: "avancar_pesquisa_evidencia_microentrega",
  });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(painelFontes);
  const qc = useQueryClient();
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["g08-fontes"],
    queryFn: () => carregar({} as never),
  });
  const onSalvo = () => void qc.invalidateQueries({ queryKey: ["g08-fontes"] });
  const [busca, setBusca] = useState("");

  // 06/09/2026: salvarFonte() no servidor sempre aceitou criacao (insere
  // quando `id` vem ausente), mas a tela so chamava com `id` de uma fonte ja
  // existente — nao havia nenhum caminho para cadastrar fonte nova. Mesmo
  // padrao encontrado em Nucleos no mesmo dia.
  const criarFonteFn = useServerFn(salvarFonte);
  const [novaFonteAberta, setNovaFonteAberta] = useState(false);
  const [novaFonteNome, setNovaFonteNome] = useState("");
  const [erroNovaFonte, setErroNovaFonte] = useState<string | null>(null);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(novaFonteNome.trim() !== "");
  const mCriarFonte = useMutation({
    mutationFn: (nome: string) => criarFonteFn({ data: { valores: { nome } } }),
    onSuccess: () => {
      setNovaFonteAberta(false);
      setNovaFonteNome("");
      setErroNovaFonte(null);
      void qc.invalidateQueries({ queryKey: ["g08-fontes"] });
    },
    onError: (e: Error) => setErroNovaFonte(e.message),
  });

  const grupos = useMemo(() => {
    const fontes = filtrarPorBusca((data?.fontes ?? []) as Fonte[], busca, [
      "nome",
      "pais_eixo",
      "tipo_de_acervo",
      "uso_recomendado",
      "status_documentacao",
      "status_integracao",
    ]);
    return agruparCatalogo(fontes);
  }, [data, busca]);
  const matrizPor = (id: string) => (data?.matriz ?? []).filter((m: any) => m.source_id === id);
  const backlogPor = (id: string) => (data?.backlog ?? []).filter((b: any) => b.source_id === id);

  // Catálogo não lido nunca aparece como catálogo vazio.
  if (!data)
    return (
      <SaasShell
        titulo="Fontes, consultas e bases genealógicas"
        descricao="Catálogo interno de bases, sem consulta externa."
      >
        <EstadoDados
          carregando={isPending}
          erro={error}
          dados={undefined}
          aoTentarNovamente={() => void refetch()}
          recurso="o catálogo interno de fontes"
        >
          {() => null}
        </EstadoDados>
      </SaasShell>
    );

  const render = (lista: Fonte[]) =>
    lista.length === 0 ? (
      <EstadoVazio mensagem="Nenhuma fonte nesta lista." />
    ) : (
      lista.map((f) => (
        <CartaoFonte
          key={f.id}
          fonte={f}
          matriz={matrizPor(f.id)}
          backlog={backlogPor(f.id)}
          onSalvo={onSalvo}
        />
      ))
    );

  return (
    <SaasShell
      titulo="Fontes, consultas e bases genealógicas"
      descricao="Catálogo interno de bases genealógicas, matriz de avaliação e backlog de ativação."
    >
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="rounded border border-gold/40 bg-gold/10 p-2 text-[11px] text-navy/70">
            {AVISO_CATALOGO}
          </p>
          {/* V4-04: as mesmas quatro contagens da linha-resumo, agora como faixa de KPIs. */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-fontes-kpis>
            <Indicador
              rotulo="Fontes catalogadas"
              valor={String(grupos.total)}
              apoio={busca.trim() ? "Na busca atual" : "Catálogo interno"}
            />
            <Indicador
              rotulo="Recomendáveis"
              valor={String(grupos.recomendaveis.length)}
              apoio="Uso operacional"
            />
            <Indicador
              rotulo="Termos a confirmar"
              valor={String(grupos.termosAConfirmar.length)}
              apoio="Aguardam parecer"
            />
            <Indicador
              rotulo="Restritas ou descontinuadas"
              valor={String(grupos.bloqueadas.length)}
              apoio="Nunca recomendadas"
            />
          </div>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fonte por nome, país, tipo ou status"
            className="w-full rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 text-sm"
          />
        </header>

        {pendenciaVinculo || !podeEscrever ? (
          <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
            Pendência registrada:{" "}
            {pendenciaVinculo ??
              "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
          </p>
        ) : null}

        <div>
          {novaFonteAberta ? (
            <div className="flex flex-wrap items-end gap-2 rounded-lg border border-navy/15 bg-navy/5 p-3">
              <label className="min-w-[220px] flex-1 text-[10px] uppercase tracking-wide text-navy/50">
                Nome da nova fonte
                <input
                  className="mt-1 w-full rounded border border-navy/15 px-2 py-1 text-[11px]"
                  value={novaFonteNome}
                  onChange={(e) => setNovaFonteNome(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={mCriarFonte.isPending || !novaFonteNome.trim()}
                onClick={() => mCriarFonte.mutate(novaFonteNome.trim())}
                className="rounded-lg bg-navy px-4 py-2 text-[11px] text-white disabled:opacity-50"
              >
                {mCriarFonte.isPending ? "Criando…" : "Criar fonte"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNovaFonteAberta(false);
                  setErroNovaFonte(null);
                }}
                className="rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy"
              >
                Cancelar
              </button>
              {erroNovaFonte ? (
                <p className="w-full text-[11px] text-terracotta">{erroNovaFonte}</p>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNovaFonteAberta(true)}
              className="rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy hover:bg-navy/5"
            >
              + Nova fonte
            </button>
          )}
        </div>

        <MarcosJuridicosPorPais />

        <CoberturaDeFontesPorPais fontes={(data?.fontes ?? []) as Fonte[]} />

        <div className="grid gap-5 lg:grid-cols-2">
          <Secao
            titulo="Recomendáveis para uso operacional"
            subtitulo="Documentadas, sem termos pendentes e nunca restritas ou descontinuadas."
          >
            {render(grupos.recomendaveis)}
          </Secao>

          <Secao
            titulo="Termos a confirmar"
            subtitulo="Não avançam para piloto nem homologação até parecer jurídico registrado."
          >
            {render(grupos.termosAConfirmar)}
          </Secao>

          <Secao
            titulo="Risco alto ou crítico"
            subtitulo="Exigem observação de risco e revisão antes de qualquer uso."
          >
            {render(grupos.riscoAlto)}
          </Secao>

          <Secao
            titulo="Restritas e descontinuadas"
            subtitulo="Nunca aparecem como recomendação operacional nem em sugestão de pesquisa."
          >
            {render(grupos.bloqueadas)}
          </Secao>

          <Secao
            titulo="Sem verificação registrada"
            subtitulo="Fonte sem data de última verificação não sustenta decisão operacional."
          >
            {render(grupos.semVerificacao)}
          </Secao>
        </div>

        <Secao titulo="Catálogo por estágio de maturidade" eyebrow="Fontes · maturidade">
          {grupos.porEstagio.every((g) => g.fontes.length === 0) ? (
            <EstadoVazio mensagem="Nenhuma fonte nesta lista." />
          ) : null}
          {grupos.porEstagio
            .filter((g) => g.fontes.length > 0)
            .map((g) => (
              <div key={g.estagio} className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-navy/40">
                  {g.rotulo} ({g.fontes.length})
                </p>
                {render(g.fontes)}
              </div>
            ))}
        </Secao>

        <footer className="rounded border border-navy/10 bg-cream/40 p-3 text-[11px] text-navy/60">
          Registro de acesso a fontes existe apenas como estrutura futura: nenhum log é gerado neste
          corte e tokens, credenciais ou payloads brutos são recusados pelo banco. Fonte crua nunca
          aparece no App Cliente.
        </footer>
      </div>
    </SaasShell>
  );
}
