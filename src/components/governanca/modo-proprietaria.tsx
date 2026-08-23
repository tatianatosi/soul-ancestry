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

/** Página operacional de primeira leitura: cinco blocos, sem jargão técnico. */
export function PainelModoProprietaria() {
  const carregar = useServerFn(estadoModoProprietaria);
  const q = useQuery({ queryKey: ["modo-proprietaria"], queryFn: () => carregar(), retry: false });

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (q.isError) return <p className="text-sm text-destructive">{(q.error as Error).message}</p>;

  const estado = q.data;
  if (!estado?.ativo) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Este modo é exclusivo da proprietária administradora da própria organização. Seu acesso atual não
        habilita as decisões de override.
      </div>
    );
  }

  const eventos = estado.eventos;
  const aguardando = eventos.filter((e) => e.acao_externa && !e.executado);
  const pendenciasAssumidas = eventos.filter((e) => e.categoria !== "confirmacao_externa").slice(0, 5);
  const recentes = eventos.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* 1. Resumo do seu acesso e da operação */}
      <section className="rounded-lg border border-primary/40 bg-primary/5 p-4">
        <SeloModoProprietaria ativo />
        <h2 className="mt-2 font-serif text-lg text-foreground">Resumo do seu acesso e da operação</h2>
        <p className="mt-1 text-sm text-foreground">
          Você opera internamente toda a cadeia com decisão registrada. Pendências continuam visíveis e
          nada é apagado. Ações externas nunca acontecem sozinhas.
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Seu papel</dt>
            <dd className="text-sm font-semibold text-foreground">Proprietária administradora</dd>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Decisões registradas</dt>
            <dd className="text-sm font-semibold text-foreground">{eventos.length}</dd>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Aguardando sua confirmação
            </dt>
            <dd className="text-sm font-semibold text-foreground">{aguardando.length}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Atalhos por área */}
      <section>
        <h2 className="font-serif text-lg text-foreground">Atalhos por área</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {ATALHOS.map((a) => (
            <li key={a.para}>
              <Link
                to={a.para}
                className="block rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {a.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Pendências e exceções assumidas */}
      <section>
        <h2 className="font-serif text-lg text-foreground">Pendências e exceções assumidas</h2>
        {pendenciasAssumidas.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Nenhuma exceção assumida até agora. Quando você avançar algo com pendência, ela aparece aqui
            com motivo e responsável.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pendenciasAssumidas.map((e) => (
              <li key={e.id} className="rounded-md border border-border bg-card p-3 text-sm">
                <p className="font-medium text-foreground">{rotuloHumano(e.entidade)}</p>
                <p className="text-xs text-muted-foreground">
                  {rotuloHumano(e.acao)} — {e.motivo}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(e.created_at).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
        <details className="mt-3 rounded-lg border border-border bg-card/60">
          <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assumir uma pendência e avançar
          </summary>
          <div className="border-t border-border p-4">
            <AssumirDecisao
              acao="assumir_pendencia_interna"
              entidade="cadeia_operacional"
              pendencias={[{ chave: "sku_em_revisao", rotulo: "SKU em revisão de homologação" }]}
            />
          </div>
        </details>
      </section>

      {/* 4. Ações externas que aguardam confirmação */}
      <section>
        <h2 className="font-serif text-lg text-foreground">Ações externas que aguardam sua confirmação</h2>
        <p className="mt-1 rounded-md border border-gold/60 bg-gold/10 p-3 text-sm text-foreground">
          Envio de e-mail, mensagem, contrato, cobrança, pesquisa externa e publicação só acontecem quando
          você inicia a ação dentro do caso ou do documento e confirma manualmente. Esta página não abre
          formulário de envio.
        </p>
        {aguardando.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nada aguardando confirmação neste momento.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {aguardando.map((e) => (
              <li key={e.id} className="rounded-md border border-terracotta/50 bg-terracotta/5 p-3 text-sm">
                <p className="font-medium text-foreground">{rotuloHumano(e.acao)}</p>
                <p className="text-xs text-muted-foreground">
                  {rotuloHumano(e.entidade)} · {e.destinatario ?? "destinatário a definir"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5. Decisões recentes */}
      <section>
        <h2 className="font-serif text-lg text-foreground">Decisões recentes</h2>
        {recentes.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Ainda não há decisões registradas.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {recentes.map((e) => (
              <li key={e.id} className="rounded-md border border-border bg-card p-3 text-sm">
                <p className="text-foreground">
                  {rotuloHumano(e.acao)} — {rotuloHumano(e.entidade)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString("pt-BR")} · {e.motivo}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DetalhesTecnicos titulo="Detalhes técnicos (poderes, módulos e nomes de sistema)">
        <ul className="grid gap-1 sm:grid-cols-2">
          {(estado.capacidades as Capacidade[]).map((c) => (
            <li key={c} className="text-xs text-muted-foreground">
              • {ROTULO_CAPACIDADE[c]}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <CoberturaModulos />
        </div>
      </DetalhesTecnicos>
    </div>
  );
}
