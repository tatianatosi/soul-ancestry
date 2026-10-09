/**
 * Formalização em cinco cartões (09/10/2026) — a MESMA vista nas duas
 * superfícies (`/golive/formalizacao` e a Formalização do caso). Estrutura
 * operacional: o conteúdo jurídico do Contrato de Estudo Genealógico v2 não é
 * reaberto aqui. Itens derivados vêm dos fatos do caso; só a conferência humana
 * é marcável, e cada marcação é gravada, relida e auditada pelo servidor.
 */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { entradaCartoesDePreparacao } from "@/lib/formalizacao-cartoes-adapter";
import {
  ROTULO_ESTADO_ITEM,
  montarCartoesFormalizacao,
  resumoCartoes,
  type EstadoItem,
  type ItemCartao,
} from "@/lib/formalizacao-cartoes";
import { abrirPreparacaoContrato } from "@/lib/contrato-preparar.functions";
import { lerEstadoFormalizacao, marcarItemFormalizacao } from "@/lib/formalizacao-cartoes.functions";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

const ESTILO: Record<EstadoItem, string> = {
  pendente: "border-navy/20 bg-cream/40 text-navy/70",
  em_andamento: "border-gold/60 bg-gold/15 text-navy",
  concluido: "border-navy/30 bg-navy/5 text-navy",
  nao_aplicavel: "border-navy/10 bg-cream/30 text-navy/55",
  bloqueado_externo: "border-terracotta/40 bg-terracotta/10 text-terracotta",
};

function Selo({ estado }: { estado: EstadoItem }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ESTILO[estado]}`}>
      {ROTULO_ESTADO_ITEM[estado]}
    </span>
  );
}

function LinhaItem({
  item,
  ocupado,
  onMarcar,
}: {
  item: ItemCartao;
  ocupado: boolean;
  onMarcar: (item: ItemCartao, status: "pendente" | "cumprido" | "nao_aplicavel", observacao: string | null) => void;
}) {
  const [justificando, setJustificando] = useState(false);
  const [nota, setNota] = useState("");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(justificando && nota.trim() !== "");
  return (
    <li className="flex flex-col gap-1 border-t border-navy/10 py-2 first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-navy">{item.rotulo}</span>
        <Selo estado={item.estado} />
      </div>
      <p className="text-xs text-navy/65">{item.detalhe}</p>
      {item.manual ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {item.estado !== "concluido" ? (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onMarcar(item, "cumprido", null)}
              className="rounded border border-navy/30 px-2 py-1 text-xs text-navy hover:bg-navy/5 disabled:opacity-50"
            >
              Marcar como conferido
            </button>
          ) : (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onMarcar(item, "pendente", null)}
              className="rounded border border-navy/20 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5 disabled:opacity-50"
            >
              Reabrir conferência
            </button>
          )}
          {item.estado !== "nao_aplicavel" ? (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => setJustificando((v) => !v)}
              className="rounded border border-navy/20 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
            >
              Não se aplica
            </button>
          ) : null}
        </div>
      ) : null}
      {justificando ? (
        <div className="flex flex-col gap-1 pt-1">
          <label className="text-xs text-navy/70" htmlFor={`na-${item.chave}`}>
            Justificativa (mínimo 10 caracteres)
          </label>
          <textarea
            id={`na-${item.chave}`}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            className="rounded border border-navy/20 bg-white p-2 text-xs"
          />
          <button
            type="button"
            disabled={ocupado || nota.trim().length < 10}
            onClick={() => {
              onMarcar(item, "nao_aplicavel", nota.trim());
              setJustificando(false);
              setNota("");
            }}
            className="self-start rounded border border-navy/30 px-2 py-1 text-xs text-navy disabled:opacity-50"
          >
            Confirmar não aplicável
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function CartoesFormalizacao({
  caseId,
  preparacao,
  bloqueiosImpeditivos,
  responsavelNome,
}: {
  caseId: string;
  /** Payload de `abrirPreparacaoContrato` — a única leitura dos fatos. */
  preparacao: any;
  bloqueiosImpeditivos?: string[];
  responsavelNome?: string | null;
}) {
  const qc = useQueryClient();
  const ler = useServerFn(lerEstadoFormalizacao);
  const marcar = useServerFn(marcarItemFormalizacao);
  const contractId = (preparacao?.contrato?.id as string | undefined) ?? null;

  const estado = useQuery({
    queryKey: ["formalizacao-estado", caseId, contractId],
    queryFn: () => ler({ data: { caseId, contractId } }),
    retry: false,
  });

  const cartoes = useMemo(
    () =>
      montarCartoesFormalizacao(
        entradaCartoesDePreparacao(preparacao, {
          persistidos: estado.data?.persistidos ?? {},
          clausulasAlteradas: (estado.data?.clausulasAlteradas ?? []) as any[],
          templateCode: preparacao?.modelo?.code ?? null,
          responsavelNome: responsavelNome ?? null,
          bloqueiosImpeditivos: bloqueiosImpeditivos ?? [],
        }),
      ),
    [preparacao, estado.data, responsavelNome, bloqueiosImpeditivos],
  );

  const m = useMutation({
    mutationFn: (v: { item: ItemCartao; status: "pendente" | "cumprido" | "nao_aplicavel"; observacao: string | null }) =>
      marcar({
        data: {
          caseId,
          chave: v.item.chave,
          status: v.status,
          observacao: v.observacao,
          rotulo: v.item.rotulo,
          contractId,
        },
      }),
    onSuccess: () => {
      toast.success("Conferência registrada.");
      qc.invalidateQueries({ queryKey: ["formalizacao-estado", caseId, contractId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (estado.isLoading) return <p className="text-sm text-navy/60">Carregando conferência registrada…</p>;
  if (estado.isError) {
    return (
      <p className="text-sm text-terracotta">
        Não foi possível ler a conferência registrada ({(estado.error as Error).message}). Os itens derivados dos dados do
        caso continuam abaixo; a marcação manual fica indisponível até a leitura funcionar.
      </p>
    );
  }

  return (
    <section aria-label="Formalização em cinco cartões" className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-lg text-navy">Formalização do Contrato de Estudo Genealógico v2</h2>
        <p className="text-sm text-navy/70">{resumoCartoes(cartoes)}</p>
      </header>
      <ol className="flex flex-col gap-3">
        {cartoes.map((c) => (
          <li key={c.id} className="rounded-lg border border-navy/15 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-navy">
                {c.ordem}. {c.titulo} <span className="font-normal text-navy/50">· meta {c.minutosAlvo} min</span>
              </h3>
              <Selo estado={c.estado} />
            </div>
            <p className="mt-1 text-xs text-navy/70">{c.objetivo}</p>
            <p className="text-xs text-navy/55">
              Responsável: {c.responsavel} · Ação principal: {c.acaoPrincipal}
            </p>
            <ul className="mt-2">
              {c.itens.map((i) => (
                <LinhaItem
                  key={i.chave}
                  item={i}
                  ocupado={m.isPending}
                  onMarcar={(item, status, observacao) => m.mutate({ item, status, observacao })}
                />
              ))}
            </ul>
            {c.pendencias.length ? (
              <p className="mt-2 text-xs text-terracotta">Pendências: {c.pendencias.join(" · ")}</p>
            ) : (
              <p className="mt-2 text-xs text-navy/55">{c.estado === "concluido" ? c.conclusao : "Sem pendência específica registrada."}</p>
            )}
            {c.evidencia ? <p className="text-[11px] text-navy/45">Evidência: {c.evidencia}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Entrada da superfície de go-live: abre a MESMA preparação contratual que a
 * Formalização do caso usa (`abrirPreparacaoContrato`) e renderiza os mesmos
 * cartões. Só carrega depois do clique, porque abrir a preparação é uma ação
 * do caso (cria a ficha se faltar e audita) — não uma leitura passiva.
 */
export function CartoesFormalizacaoDoCaso({ caseId, responsavelNome }: { caseId: string; responsavelNome?: string | null }) {
  const [aberto, setAberto] = useState(false);
  const abrir = useServerFn(abrirPreparacaoContrato);
  const q = useQuery({
    queryKey: ["formalizacao-preparacao", caseId],
    queryFn: () => abrir({ data: { caseId } }),
    enabled: aberto,
    retry: false,
  });

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="self-start rounded border border-navy/30 px-3 py-1.5 text-sm text-navy hover:bg-navy/5"
      >
        Abrir os cinco cartões da formalização
      </button>
    );
  }
  if (q.isLoading) return <p className="text-sm text-navy/60">Abrindo a preparação do contrato…</p>;
  if (q.isError || !q.data) {
    return <p className="text-sm text-terracotta">Não foi possível abrir a preparação ({(q.error as Error)?.message ?? "sem dados"}).</p>;
  }
  return <CartoesFormalizacao caseId={caseId} preparacao={q.data} responsavelNome={responsavelNome} />;
}
