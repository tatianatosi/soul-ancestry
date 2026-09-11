/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel } from "@/components/comercial/base";
import {
  COMPOSICOES,
  FASES_JORNADA,
  FASE_JORNADA_PADRAO,
  ROTULO_FASE_JORNADA,
  type Composicao,
  type EntradaPlanejador,
  type FaseJornada,
} from "@/lib/cadeia-operacional";
import {
  carregarPlanejadorOperacional,
  listarSkusPlanejador,
  salvarPlanejadorOperacional,
} from "@/lib/cadeia-operacional.functions";

const ROTULO_COMPOSICAO: Record<Composicao, string> = {
  individual: "Individual",
  casal: "Casal",
  nucleo_familiar: "Núcleo familiar",
};

const linhas = (texto: string): string[] =>
  texto
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

const juntar = (itens: string[] | null | undefined): string => (itens ?? []).join("\n");

type Estado = {
  objetivo: string;
  etapa: string;
  composicao: Composicao | "";
  rotaConfirmada: string;
  produtoSkuCodigo: string;
  faseJornada: FaseJornada;
  proximaAcao: string;
  prazoProximaAcao: string;
  entregas: string;
  microentregas: string;
  marcos: string;
  checklist: string;
  perguntas: string;
  dependenciasCliente: string;
  dependenciasTerceiros: string;
};

const VAZIO: Estado = {
  objetivo: "",
  etapa: "",
  composicao: "",
  rotaConfirmada: "",
  produtoSkuCodigo: "",
  faseJornada: FASE_JORNADA_PADRAO,
  proximaAcao: "",
  prazoProximaAcao: "",
  entregas: "",
  microentregas: "",
  marcos: "",
  checklist: "",
  perguntas: "",
  dependenciasCliente: "",
  dependenciasTerceiros: "",
};

function estadoDaEntrada(entrada: EntradaPlanejador): Estado {
  const fase = (FASES_JORNADA as readonly string[]).includes(entrada.faseJornada ?? "")
    ? (entrada.faseJornada as FaseJornada)
    : FASE_JORNADA_PADRAO;
  return {
    objetivo: entrada.objetivo ?? "",
    etapa: entrada.etapa ?? "",
    composicao: (entrada.composicao as Composicao | null) ?? "",
    rotaConfirmada: entrada.rotaConfirmada ?? "",
    produtoSkuCodigo: entrada.produtoSkuCodigo ?? "",
    faseJornada: fase,
    proximaAcao: entrada.proximaAcao ?? "",
    prazoProximaAcao: entrada.prazoProximaAcao ?? "",
    entregas: juntar(entrada.entregas),
    microentregas: juntar(entrada.microentregas),
    marcos: juntar(entrada.marcos),
    checklist: juntar(entrada.checklist),
    perguntas: juntar(entrada.perguntas),
    dependenciasCliente: juntar(entrada.dependenciasCliente),
    dependenciasTerceiros: juntar(entrada.dependenciasTerceiros),
  };
}

/**
 * 28/08/2026 — a Cadeia operacional (`CadeiaOperacional`) só tinha ações para
 * os elos 2–4 (Proposta, Aprovação, OS). O elo 1, Planejador, já tinha motor
 * pronto e testado (`salvarPlanejadorOperacional`) mas nenhuma tela o chamava
 * — por isso todo caso novo nascia com "Planejador não persistido" e a
 * cadeia inteira ficava bloqueada em cascata, mesmo sem nenhum bug de dado.
 * Este formulário é a entrada que faltava.
 *
 * 11/09/2026 — hidrata de `case_plans` ao reabrir; grava fase CHECK válida;
 * espelho da próxima ação no caso fica no servidor (`sincronizarPlanejador`).
 */
export function PlanejadorOperacional({
  caseId,
  podeEscrever,
  inicialAberto = false,
}: {
  caseId: string;
  podeEscrever: boolean;
  inicialAberto?: boolean;
}) {
  const qc = useQueryClient();
  const [aberto, setAberto] = useState(inicialAberto);
  const [estado, setEstado] = useState<Estado>(VAZIO);
  const [hidratadoDe, setHidratadoDe] = useState<string | null>(null);

  const carregarSkus = useServerFn(listarSkusPlanejador);
  const skus = useQuery({ queryKey: ["skus-planejador"], queryFn: () => carregarSkus(), enabled: aberto });

  const carregarPlano = useServerFn(carregarPlanejadorOperacional);
  const plano = useQuery({
    queryKey: ["planejador-operacional", caseId],
    queryFn: () => carregarPlano({ data: { caseId } }),
    enabled: aberto || inicialAberto,
  });

  useEffect(() => {
    if (!aberto || !plano.data || hidratadoDe === caseId) return;
    if (plano.data.entrada) setEstado(estadoDaEntrada(plano.data.entrada));
    setHidratadoDe(caseId);
  }, [aberto, plano.data, caseId, hidratadoDe]);

  const salvar = useServerFn(salvarPlanejadorOperacional);
  const mSalvar = useMutation({
    mutationFn: (entrada: EntradaPlanejador) => salvar({ data: { entrada } }),
    onSuccess: (r: any) => {
      toast.success(
        r.idempotente
          ? "Planejador já refletia esses dados."
          : `Planejador salvo (v${r.versao}${r.status ? ` · ${r.status}` : ""}).${
              r.saida?.pendencias?.length
                ? ` ${r.saida.pendencias.length} pendência(s) restante(s) — a cadeia mostra quais.`
                : ""
            }`,
      );
      qc.invalidateQueries({ queryKey: ["planejador-operacional", caseId] });
      qc.invalidateQueries({ queryKey: ["cadeia-operacional", caseId] });
      qc.invalidateQueries({ queryKey: ["contrato-preparar", caseId] });
      qc.invalidateQueries({ queryKey: ["ficha-caso", caseId] });
      qc.invalidateQueries({ queryKey: ["caso-canonico", caseId] });
      setHidratadoDe(null);
      setAberto(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const entrada: EntradaPlanejador = useMemo(
    () => ({
      caseId,
      objetivo: estado.objetivo.trim() || null,
      etapa: estado.etapa.trim() || null,
      composicao: estado.composicao || null,
      rotaConfirmada: estado.rotaConfirmada.trim() || null,
      produtoSkuCodigo: estado.produtoSkuCodigo || null,
      dadosDisponiveis: [],
      dependenciasCliente: linhas(estado.dependenciasCliente),
      dependenciasTerceiros: linhas(estado.dependenciasTerceiros),
      fontes: [],
      // Resolvido no servidor a partir da sessão autenticada — nunca enviado pelo cliente.
      responsavelUserId: null,
      proximaAcao: estado.proximaAcao.trim() || null,
      prazoProximaAcao: estado.prazoProximaAcao || null,
      faseJornada: estado.faseJornada,
      checklist: linhas(estado.checklist),
      perguntas: linhas(estado.perguntas),
      marcos: linhas(estado.marcos),
      entregas: linhas(estado.entregas),
      microentregas: linhas(estado.microentregas),
      regrasAnexos: [],
    }),
    [caseId, estado],
  );

  if (!aberto) {
    return (
      <Painel titulo="Planejador do caso">
        <p className="text-xs text-navy/60">
          Elo 1 da cadeia operacional. Sem planejador persistido, proposta, condição comercial e OS ficam
          bloqueadas em cascata.
        </p>
        {plano.data?.status || plano.data?.versao ? (
          <p className="mt-2 text-[11px] text-navy/50">
            Último plano: {plano.data.status ?? "—"}
            {plano.data.versao != null ? ` · v${plano.data.versao}` : ""}
            {plano.data.entrada?.proximaAcao ? ` · ${plano.data.entrada.proximaAcao}` : ""}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setHidratadoDe(null);
            setAberto(true);
          }}
          className="mt-3 rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
        >
          {plano.data?.entrada ? "Revisar planejador" : "Preencher planejador"}
        </button>
      </Painel>
    );
  }

  const campo = (chave: keyof Estado, rotulo: string, placeholder?: string) => (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</span>
      <input
        type="text"
        value={String(estado[chave] ?? "")}
        onChange={(e) => setEstado((s) => ({ ...s, [chave]: e.target.value }))}
        placeholder={placeholder}
        disabled={mSalvar.isPending}
        className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
      />
    </label>
  );

  const lista = (chave: keyof Estado, rotulo: string, dica: string) => (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</span>
      <textarea
        value={String(estado[chave] ?? "")}
        onChange={(e) => setEstado((s) => ({ ...s, [chave]: e.target.value }))}
        placeholder={dica}
        rows={3}
        disabled={mSalvar.isPending}
        className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
      />
      <span className="text-[10px] text-navy/40">Um item por linha.</span>
    </label>
  );

  return (
    <Painel titulo="Planejador do caso">
      <p className="text-xs text-navy/60">
        O motor nunca infere: campo sem dado real fica pendente e aparece na cadeia. Preencha só o que já é
        confirmado para este caso.
      </p>
      {!podeEscrever ? (
        <p className="mt-2 text-[11px] text-navy/50">
          Sessão em modo leitura: a pendência informa; o salvamento continua disponível conforme a política de
          autoridade da proprietária.
        </p>
      ) : null}
      {plano.isLoading ? <p className="mt-2 text-[11px] text-navy/50">Carregando plano salvo…</p> : null}
      {plano.error ? (
        <p role="alert" className="mt-2 text-[11px] text-terracotta">
          Não foi possível reler o plano salvo: {(plano.error as Error).message}
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {campo("objetivo", "Objetivo do caso", "Ex.: Cidadania italiana por linha materna")}
        {campo("etapa", "Etapa atual", "Ex.: Discovery concluído")}
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Composição</span>
          <select
            value={estado.composicao}
            onChange={(e) => setEstado((s) => ({ ...s, composicao: e.target.value as Composicao | "" }))}
            disabled={mSalvar.isPending}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
          >
            <option value="">Selecione…</option>
            {COMPOSICOES.map((c) => (
              <option key={c} value={c}>
                {ROTULO_COMPOSICAO[c]}
              </option>
            ))}
          </select>
          {skus.error ? (
            <span role="alert" className="mt-1 block text-[11px] text-terracotta">
              Catálogo indisponível: a lista de SKUs está vazia por falha de leitura, não por ausência de
              cadastro.
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Fase da jornada</span>
          <select
            value={estado.faseJornada}
            onChange={(e) => setEstado((s) => ({ ...s, faseJornada: e.target.value as FaseJornada }))}
            disabled={mSalvar.isPending}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
          >
            {FASES_JORNADA.map((f) => (
              <option key={f} value={f}>
                {ROTULO_FASE_JORNADA[f]}
              </option>
            ))}
          </select>
        </label>
        {campo("rotaConfirmada", "País/rota confirmado", "Só se já confirmado — o motor não infere")}
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">SKU do catálogo</span>
          <select
            value={estado.produtoSkuCodigo}
            onChange={(e) => setEstado((s) => ({ ...s, produtoSkuCodigo: e.target.value }))}
            disabled={mSalvar.isPending}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
          >
            <option value="">Selecione…</option>
            {(skus.data?.skus ?? []).map((s) => (
              <option key={s.id} value={s.code}>
                {s.code} — {s.nome_comercial ?? "sem nome"}
              </option>
            ))}
          </select>
        </label>
        {campo("proximaAcao", "Próxima ação")}
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Prazo da próxima ação</span>
          <input
            type="date"
            value={estado.prazoProximaAcao}
            onChange={(e) => setEstado((s) => ({ ...s, prazoProximaAcao: e.target.value }))}
            disabled={mSalvar.isPending}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:opacity-60"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {lista("entregas", "Entregas", "Ex.: Dossiê documental completo")}
        {lista("microentregas", "Microentregas", "Ex.: Certidão de nascimento localizada")}
        {lista("marcos", "Marcos", "Ex.: Assinatura do contrato")}
        {lista("checklist", "Checklist aplicável", "Ex.: Documentos de identidade")}
        {lista("perguntas", "Perguntas em aberto", "Ex.: Confirmar grafia do sobrenome")}
        {lista("dependenciasCliente", "Dependências do cliente", "Ex.: Enviar certidão original")}
        {lista("dependenciasTerceiros", "Dependências de terceiros", "Ex.: Cartório emitir 2ª via")}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={mSalvar.isPending}
          onClick={() => mSalvar.mutate(entrada)}
          className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 disabled:opacity-50"
        >
          Salvar planejador
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-navy/60 hover:bg-navy/5"
        >
          Cancelar
        </button>
      </div>
    </Painel>
  );
}
