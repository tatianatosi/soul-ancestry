/**
 * Modo Proprietária Administradora — superfície de UI.
 *
 * Exibe capacidades, permite "Assumir decisão e avançar" com motivo
 * obrigatório e apresenta a janela final de confirmação para ações externas.
 * Nenhuma ação externa é disparada aqui.
 */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { CoberturaModulos } from "@/components/governanca/cobertura-modulos";
import {
  ACOES_EXTERNAS,
  AVISO_IRREVERSIVEL,
  MOTIVO_MINIMO,
  ROTULO_ACAO_EXTERNA,
  ROTULO_CAPACIDADE,
  montarConfirmacao,
  type AcaoExterna,
  type Capacidade,
  type PedidoConfirmacao,
} from "@/lib/modo-proprietaria";
import {
  confirmarAcaoExterna,
  estadoModoProprietaria,
  registrarDecisaoProprietaria,
} from "@/lib/modo-proprietaria.functions";

export function SeloModoProprietaria({ ativo }: { ativo: boolean }) {
  if (!ativo) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
      Modo Proprietária Administradora
    </span>
  );
}

/** Bloco reutilizável: pendência visível + "Assumir decisão e avançar". */
export function AssumirDecisao({
  acao,
  entidade,
  entidadeId,
  campo,
  valorAnterior,
  valorNovo,
  pendencias = [],
  onRegistrado,
}: {
  acao: string;
  entidade: string;
  entidadeId?: string;
  campo?: string;
  valorAnterior?: unknown;
  valorNovo?: unknown;
  pendencias?: { chave: string; rotulo: string }[];
  onRegistrado?: () => void;
}) {
  const registrar = useServerFn(registrarDecisaoProprietaria);
  const cliente = useQueryClient();
  const [motivo, setMotivo] = useState("");
  const [fonte, setFonte] = useState("");

  const m = useMutation({
    mutationFn: () =>
      registrar({
        data: {
          acao,
          entidade,
          entidade_id: entidadeId ?? null,
          campo: campo ?? null,
          valor_anterior: campo ? (valorAnterior ?? null) : undefined,
          valor_novo: campo ? (valorNovo ?? null) : undefined,
          motivo,
          fonte: fonte || null,
          pendencias_assumidas: pendencias.map((p) => p.chave),
        },
      }),
    onSuccess: () => {
      setMotivo("");
      setFonte("");
      void cliente.invalidateQueries({ queryKey: ["modo-proprietaria"] });
      onRegistrado?.();
    },
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">Assumir decisão e avançar</p>
      {pendencias.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {pendencias.map((p) => (
            <li key={p.chave}>
              Pendência mantida: {p.rotulo} — permanece visível após a decisão.
            </li>
          ))}
        </ul>
      )}
      <label className="mt-3 block text-xs font-medium text-muted-foreground" htmlFor={`motivo-${acao}`}>
        Motivo obrigatório (mínimo {MOTIVO_MINIMO} caracteres)
      </label>
      <textarea
        id={`motivo-${acao}`}
        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
        rows={2}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />
      <label className="mt-2 block text-xs font-medium text-muted-foreground" htmlFor={`fonte-${acao}`}>
        Fonte ou justificativa documental
      </label>
      <input
        id={`fonte-${acao}`}
        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={fonte}
        onChange={(e) => setFonte(e.target.value)}
      />
      <button
        type="button"
        disabled={motivo.trim().length < MOTIVO_MINIMO || m.isPending}
        onClick={() => m.mutate()}
        className="mt-3 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        Registrar decisão auditada
      </button>
      {m.isError && <p className="mt-2 text-xs text-destructive">{(m.error as Error).message}</p>}
      {m.isSuccess && <p className="mt-2 text-xs text-primary">Decisão registrada na auditoria.</p>}
    </div>
  );
}

/** Janela final de confirmação para ação externa/irreversível. */
export function ConfirmacaoAcaoExterna({ pedido }: { pedido: PedidoConfirmacao & { entidade: string } }) {
  const confirmar = useServerFn(confirmarAcaoExterna);
  const [motivo, setMotivo] = useState("");
  const [ciente, setCiente] = useState(false);
  const confirmacao = useMemo(
    () => montarConfirmacao({ ...pedido, motivo, confirmacao_manual: ciente }),
    [pedido, motivo, ciente],
  );


  const m = useMutation({
    mutationFn: () =>
      confirmar({
        data: {
          acao: pedido.acao,
          entidade: pedido.entidade,
          destinatario: pedido.destinatario ?? null,
          conteudo: pedido.conteudo ?? null,
          valor: pedido.valor ?? null,
          caso: pedido.caso ?? null,
          moeda: pedido.moeda ?? null,
          anexos: pedido.anexos ?? [],
          impacto: pedido.impacto ?? null,
          dados_enviados: pedido.dados_enviados ?? null,
          motivo,
          confirmacao_manual: true,
        },
      }),
  });

  return (
    <div className="rounded-lg border-2 border-destructive/60 bg-destructive/5 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden /> Confirmação final — ação externa e irreversível
      </p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {confirmacao.campos.map((c) => (
          <div key={c.campo} className="rounded-md border border-border bg-background p-2">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.rotulo}</dt>
            <dd className="break-words text-xs text-foreground">{c.valor}</dd>
          </div>
        ))}
      </dl>
      {confirmacao.faltantes.length > 0 && (
        <p className="mt-2 text-xs text-destructive">
          Dados obrigatórios ausentes: {confirmacao.faltantes.join(", ")}.
        </p>
      )}
      <textarea
        aria-label="Motivo da confirmação"
        className="mt-3 w-full rounded-md border border-input bg-background p-2 text-sm"
        rows={2}
        placeholder="Motivo da confirmação (obrigatório)"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />
      <label className="mt-2 flex items-start gap-2 text-xs text-foreground">
        <input type="checkbox" checked={ciente} onChange={(e) => setCiente(e.target.checked)} />
        <span>{AVISO_IRREVERSIVEL}</span>
      </label>
      <button
        type="button"
        disabled={!ciente || !confirmacao.pronta || motivo.trim().length < MOTIVO_MINIMO || m.isPending}
        onClick={() => m.mutate()}
        className="mt-3 rounded-md bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"
      >
        Confirmar manualmente
      </button>
      {m.isError && <p className="mt-2 text-xs text-destructive">{(m.error as Error).message}</p>}
      {m.isSuccess && (
        <p className="mt-2 text-xs text-primary">
          Confirmação registrada e auditada. Nenhum envio, cobrança ou integração foi executado por este
          registro.
        </p>
      )}
    </div>
  );
}

/** Painel do modo: capacidades, simulador de confirmação e log de decisões. */
export function PainelModoProprietaria() {
  const carregar = useServerFn(estadoModoProprietaria);
  const q = useQuery({ queryKey: ["modo-proprietaria"], queryFn: () => carregar(), retry: false });
  const [acao, setAcao] = useState<AcaoExterna>("enviar_contrato");

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Carregando modo…</p>;
  if (q.isError) return <p className="text-sm text-destructive">{(q.error as Error).message}</p>;

  const estado = q.data;
  if (!estado?.ativo) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Modo Proprietária Administradora indisponível para o papel <strong>{estado?.papel ?? "—"}</strong>.
        Os poderes de override, homologação e confirmação externa são exclusivos da administradora da
        própria organização.
      </div>
    );
  }

  const eventos = estado.eventos;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
        <SeloModoProprietaria ativo />
        <p className="mt-2 text-sm text-foreground">
          Operação interna total com versionamento e auditoria. Pendências continuam visíveis; nenhuma é
          apagada. Ações externas exigem janela final de confirmação manual.
        </p>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {(estado.capacidades as Capacidade[]).map((c) => (
            <li key={c} className="text-xs text-muted-foreground">
              • {ROTULO_CAPACIDADE[c]}
            </li>
          ))}
        </ul>
      </div>

      <CoberturaModulos />



      <section>
        <h2 className="text-sm font-semibold text-foreground">Decisão administrativa auditada</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Registra autora, data/hora, valor anterior, valor novo, fonte, entidade e evento de auditoria.
        </p>
        <AssumirDecisao
          acao="assumir_pendencia_interna"
          entidade="cadeia_operacional"
          pendencias={[{ chave: "sku_em_revisao", rotulo: "SKU em revisão de homologação" }]}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Ações externas e irreversíveis</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Nunca disparadas automaticamente: exigem confirmação manual com todos os dados à vista.
        </p>
        <label className="text-xs text-muted-foreground" htmlFor="acao-externa">
          Ação
        </label>
        <select
          id="acao-externa"
          className="mb-3 ml-2 rounded-md border border-input bg-background p-1 text-sm"
          value={acao}
          onChange={(e) => setAcao(e.target.value as AcaoExterna)}
        >
          {ACOES_EXTERNAS.map((a) => (
            <option key={a} value={a}>
              {ROTULO_ACAO_EXTERNA[a]}
            </option>
          ))}
        </select>
        <ConfirmacaoAcaoExterna
          pedido={{
            acao,
            entidade: "acao_externa",
            organizacao: estado.organizationId,
            destinatario: "",
            conteudo: "",
            valor: null,
            caso: "",
            anexos: [],
            impacto: "",
            dados_enviados: null,
          }}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Log de decisões e confirmações</h2>
        {eventos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem dados suficientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="mt-2 w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1">Data</th>
                  <th>Categoria</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Motivo</th>
                  <th>Executada</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="py-1">{new Date(e.created_at).toLocaleString("pt-BR")}</td>
                    <td>{e.categoria}</td>
                    <td>{e.acao}</td>
                    <td>{e.entidade}</td>
                    <td className="max-w-[24ch] truncate">{e.motivo}</td>
                    <td>{e.executado ? "sim" : "não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
