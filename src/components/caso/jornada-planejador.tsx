import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { CaCard } from "@/components/ui/ca-card";
import { lerJornadaPlanejador, atualizarJornadaPlanejador } from "@/lib/jornada-planejador.functions";
import { camposAlterados, origemJornada } from "@/lib/jornada-planejador";
import { listarUsuarios } from "@/lib/saas.functions";
import { PRODUTOS_PAI_CANONICOS } from "@/lib/planejador-produtos-pai";

type Rascunho = {
  etapa: string;
  rotaConfirmada: string;
  produtoPaiId: string;
  marcoAtual: string;
  responsavelUserId: string;
  proximaAcao: string;
  prazoProximaAcao: string;
};

const VAZIO: Rascunho = {
  etapa: "",
  rotaConfirmada: "",
  produtoPaiId: "",
  marcoAtual: "",
  responsavelUserId: "",
  proximaAcao: "",
  prazoProximaAcao: "",
};

/**
 * P4 (25/09/2026) — Jornada persistente do planejador em Caso 360.
 *
 * `case_plans` já tem Produto-Pai, país/via, etapa, marco, responsável,
 * bloqueio, próxima ação e micro-entrega — o que faltava era mostrar o que
 * já está persistido e deixar editar ponto a ponto, sem entrar na máquina
 * de versionamento do formulário grande (`PlanejadorOperacional`, abaixo).
 * Editar aqui NUNCA cria versão nova nem toca o hash do plano.
 */
export function PainelJornadaPlanejador({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const carregar = useServerFn(lerJornadaPlanejador);
  const salvar = useServerFn(atualizarJornadaPlanejador);
  const carregarUsuarios = useServerFn(listarUsuarios);

  const q = useQuery({
    queryKey: ["jornada-planejador", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });
  const qUsuarios = useQuery({ queryKey: ["usuarios-org"], queryFn: () => carregarUsuarios() });

  const [rascunho, setRascunho] = useState<Rascunho>(VAZIO);
  const [aviso, setAviso] = useState<string | null>(null);
  // Corte 1 (27/09/2026): enquanto houver edição local, uma releitura vinda de
  // outro painel não apaga o que a pessoa digitou.
  const [editado, setEditado] = useState(false);
  const editarRascunho = (fn: (r: Rascunho) => Rascunho) => {
    setEditado(true);
    setRascunho(fn);
  };

  const plano = q.data?.existe ? q.data : null;

  // Rascunho reflete o dado relido sempre que ele muda (inclui após salvar).
  useEffect(() => {
    if (!plano || editado) return;
    setRascunho({
      etapa: plano.etapa ?? "",
      rotaConfirmada: plano.rotaConfirmada ?? "",
      produtoPaiId: plano.produtoPaiId ?? "",
      marcoAtual: plano.marcoAtual ?? "",
      responsavelUserId: plano.responsavelUserId ?? "",
      proximaAcao: plano.proximaAcao ?? "",
      prazoProximaAcao: plano.prazoProximaAcao ?? "",
    });
  }, [plano?.id, plano?.versao, plano?.etapa, plano?.rotaConfirmada, plano?.produtoPaiId, plano?.marcoAtual, plano?.responsavelUserId, plano?.proximaAcao, plano?.prazoProximaAcao]); // eslint-disable-line react-hooks/exhaustive-deps

  const sujo = useMemo(() => {
    if (!plano) return false;
    return (
      rascunho.etapa !== (plano.etapa ?? "") ||
      rascunho.rotaConfirmada !== (plano.rotaConfirmada ?? "") ||
      rascunho.produtoPaiId !== (plano.produtoPaiId ?? "") ||
      rascunho.marcoAtual !== (plano.marcoAtual ?? "") ||
      rascunho.responsavelUserId !== (plano.responsavelUserId ?? "") ||
      rascunho.proximaAcao !== (plano.proximaAcao ?? "") ||
      rascunho.prazoProximaAcao !== (plano.prazoProximaAcao ?? "")
    );
  }, [rascunho, plano]);

  const m = useMutation({
    mutationFn: () =>
      salvar({
        data: {
          caseId,
          // Só os campos que mudaram — um campo não tocado nunca é regravado
          // com o valor antigo por cima de uma escrita feita em outro painel.
          campos: camposAlterados(rascunho, plano),
        },
      }),
    onSuccess: (r) => {
      if (!r.ok) {
        setAviso(r.erro);
        return;
      }
      setAviso(r.mudou ? "Jornada atualizada." : "Nenhuma mudança para gravar.");
      setEditado(false);
      for (const chave of ["jornada-planejador", "planejador-salvo", "ficha-caso-cadeia-operacional", "ficha-caso", "caso-canonico"])
        void qc.invalidateQueries({ queryKey: [chave, caseId] });
      void q.refetch();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  if (q.isLoading) return <p className={CARTAO}>Carregando a jornada do planejador…</p>;
  if (q.isError) {
    return (
      <p role="alert" className={`${CARTAO} flex flex-wrap items-center gap-3 border-terracotta/40 bg-terracotta/10 text-terracotta`}>
        Não foi possível carregar a jornada do planejador.
        <button type="button" onClick={() => void q.refetch()} className="rounded-md border border-terracotta/50 px-2 py-1 text-xs">
          Tentar novamente
        </button>
      </p>
    );
  }

  if (!plano) {
    return (
      <CaCard titulo="Jornada do planejador" eyebrow="Produto-Pai · país/via · etapa · marco">
        <p className="text-sm text-navy/65">
          Este caso ainda não tem planejador preenchido. Use "Preencher planejador" abaixo — depois deste
          primeiro preenchimento, a jornada aparece aqui, editável ponto a ponto.
        </p>
      </CaCard>
    );
  }

  const origem = origemJornada({
    versao: plano.versao,
    atualizadoEm: plano.atualizadoEm,
    atualizadoPorNome: (qUsuarios.data ?? []).find((u) => u.userId === plano.atualizadoPorId)?.nome ?? null,
  });

  const opcoesResponsavel = (qUsuarios.data ?? [])
    .filter((u) => !u.arquivado)
    .map((u) => ({ valor: u.userId, rotulo: u.nome ?? u.email ?? u.userId }));
  const opcoesMarco = [...new Set([plano.marcoAtual, ...(plano.marcos ?? [])].filter(Boolean) as string[])];

  return (
    <CaCard variante="compacto" titulo="Jornada do planejador" eyebrow="Produto-Pai · país/via · etapa · marco">
      <p className="text-xs text-navy/60">
        O mesmo plano que a cadeia comercial usa (elo 1). Editar aqui grava só o campo mudado — não cria
        versão nova nem mexe no formulário grande abaixo.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2" data-jornada-planejador>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">Produto-Pai</span>
          <select
            className="w-full rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 text-sm text-navy outline-none focus:border-gold"
            value={rascunho.produtoPaiId}
            onChange={(e) => editarRascunho((r) => ({ ...r, produtoPaiId: e.target.value }))}
          >
            <option value="">Ainda não definido</option>
            {PRODUTOS_PAI_CANONICOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.nome}
              </option>
            ))}
          </select>
        </label>

        <Texto label="País/via confirmado" valor={rascunho.rotaConfirmada} onChange={(v) => editarRascunho((r) => ({ ...r, rotaConfirmada: v }))} />
        <Texto label="Etapa atual" valor={rascunho.etapa} onChange={(v) => editarRascunho((r) => ({ ...r, etapa: v }))} />

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">Marco atual</span>
          <input
            list="marcos-do-plano"
            className="w-full rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 text-sm text-navy outline-none focus:border-gold"
            value={rascunho.marcoAtual}
            onChange={(e) => editarRascunho((r) => ({ ...r, marcoAtual: e.target.value }))}
            placeholder="Ex.: Assinatura do contrato"
          />
          <datalist id="marcos-do-plano">
            {opcoesMarco.map((mo) => (
              <option key={mo} value={mo} />
            ))}
          </datalist>
          <span className="mt-1 block text-[11px] text-navy/45">Sugestões vêm dos marcos já declarados no plano.</span>
        </label>

        <Selecao
          label="Responsável"
          valor={rascunho.responsavelUserId}
          opcoes={opcoesResponsavel}
          onChange={(v) => editarRascunho((r) => ({ ...r, responsavelUserId: v }))}
        />
        <Texto label="Próxima ação" valor={rascunho.proximaAcao} onChange={(v) => editarRascunho((r) => ({ ...r, proximaAcao: v }))} />
        <Texto
          label="Prazo da próxima ação"
          tipo="date"
          valor={rascunho.prazoProximaAcao}
          onChange={(v) => editarRascunho((r) => ({ ...r, prazoProximaAcao: v }))}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-navy/10 bg-cream/30 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Bloqueio (gate D7/onboarding)</p>
          {plano.bloqueios.length ? (
            <ul className="mt-1 space-y-0.5">
              {plano.bloqueios.map((b, i) => (
                <li key={i} className="text-xs text-terracotta">
                  {b}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-navy/55">Nenhum bloqueio registrado.</p>
          )}
        </div>
        <div className="rounded-lg border border-navy/10 bg-cream/30 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Próxima micro-entrega</p>
          <p className="mt-1 text-xs text-navy/80">{plano.proximaMicroentrega ?? "Nenhuma prevista pelo D7."}</p>
        </div>
      </div>

      {/*
        SKU (product_catalog_id do plano) é sempre informativo — nunca gate
        desta jornada. A edição do SKU técnico do caso mora na seção
        "Produto-pai e trilha técnica" (case_services), não aqui.
      */}
      <p className="mt-3 text-xs text-navy/55">
        SKU informativo do plano: {plano.skuCodigo ? `${plano.skuCodigo} — ${plano.skuNome ?? "sem nome"}` : "não selecionado"}.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!sujo || m.isPending}
          onClick={() => m.mutate()}
          className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          {m.isPending ? "Gravando…" : "Gravar jornada"}
        </button>
        {sujo ? (
          <button type="button" onClick={() => { setEditado(false); setRascunho({
            etapa: plano.etapa ?? "",
            rotaConfirmada: plano.rotaConfirmada ?? "",
            produtoPaiId: plano.produtoPaiId ?? "",
            marcoAtual: plano.marcoAtual ?? "",
            responsavelUserId: plano.responsavelUserId ?? "",
            proximaAcao: plano.proximaAcao ?? "",
            prazoProximaAcao: plano.prazoProximaAcao ?? "",
          }); }} className="text-xs text-navy/60 underline">
            Descartar alterações
          </button>
        ) : null}
        {aviso ? <span className="text-xs text-navy/70">{aviso}</span> : null}
      </div>

      <p className="mt-3 text-[11px] text-navy/45">{origem.texto}</p>
    </CaCard>
  );
}

const CARTAO = "rounded-xl border border-navy/10 bg-cream/40 p-3 text-sm text-navy/60";
