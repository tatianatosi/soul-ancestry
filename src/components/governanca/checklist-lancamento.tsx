/**
 * P0.3 — Checklist interno de lançamento controlado.
 *
 * Módulo contextual dentro do Modo Proprietária (superfície interna). Somente
 * síntese de evidência e links para objetos canônicos: não altera status
 * operacional, não aciona contrato, assinatura, cobrança, mensagem,
 * integração ou publicação, e não conclui "pronto" automaticamente.
 */
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { DetalhesTecnicos } from "@/components/ui/detalhes-tecnicos";
import { registrarDecisaoProprietaria } from "@/lib/modo-proprietaria.functions";
import {
  ITENS_CHECKLIST,
  ORDEM_SECOES,
  ROTULO_DECISAO,
  ROTULO_ESTADO,
  ROTULO_SECAO,
  bloqueiosRemanescentes,
  calcularResumo,
  estadoEfetivo,
  itensPorSecao,
  montarRegistroDecisao,
  validarDecisaoLancamento,
  type DecisaoLancamento,
  type EstadoItem,
} from "@/lib/checklist-lancamento";

const CLASSE_ESTADO: Record<EstadoItem, string> = {
  APROVADO_COM_EVIDENCIA: "border-primary/50 bg-primary/10 text-foreground",
  PENDENTE: "border-accent/60 bg-accent/10 text-foreground",
  BLOQUEADO: "border-destructive/50 bg-destructive/10 text-foreground",
};

export function ChecklistLancamentoControlado() {
  const resumo = useMemo(() => calcularResumo(), []);
  const pendentes = useMemo(() => bloqueiosRemanescentes(), []);

  const [decisao, setDecisao] = useState<DecisaoLancamento | null>(null);
  const [responsavel, setResponsavel] = useState("");
  const [motivo, setMotivo] = useState("");
  const [ciente, setCiente] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  const registrar = useServerFn(registrarDecisaoProprietaria);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (payload: ReturnType<typeof montarRegistroDecisao>) =>
      registrar({ data: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["modo-proprietaria"] }),
  });

  function enviar() {
    const pedido = { decisao, responsavel, motivo, cienteDosPendentes: ciente };
    const e = validarDecisaoLancamento(pedido);
    setErros(e);
    if (e.length) return;
    mut.mutate(montarRegistroDecisao(pedido));
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-serif text-lg text-foreground">Checklist do lançamento controlado</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Esta tela apenas reúne as evidências já existentes. Ela não libera nada, não declara
        prontidão e não aciona contrato, assinatura, cobrança, mensagem, integração ou publicação.
      </p>

      <dl className="mt-3 grid gap-3 sm:grid-cols-4">
        {[
          ["Itens", resumo.total],
          ["Com evidência", resumo.aprovados],
          ["Pendentes", resumo.pendentes],
          ["Bloqueados", resumo.bloqueados],
        ].map(([rotulo, valor]) => (
          <div key={String(rotulo)} className="rounded-md border border-border bg-background p-3">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{rotulo}</dt>
            <dd className="text-sm font-semibold text-foreground">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 space-y-5">
        {ORDEM_SECOES.map((secao) => (
          <div key={secao}>
            <h3 className="text-sm font-semibold text-foreground">{ROTULO_SECAO[secao]}</h3>
            <ul className="mt-2 space-y-2">
              {itensPorSecao(secao).map((item) => {
                const estado = estadoEfetivo(item);
                return (
                  <li
                    key={item.id}
                    className={`rounded-md border p-3 text-sm ${CLASSE_ESTADO[estado]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{item.titulo}</span>
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-[11px] uppercase tracking-wide">
                        {ROTULO_ESTADO[estado]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.evidencia}</p>
                    {item.link ? (
                      <Link
                        to={item.link as "/painel"}
                        className="mt-1 inline-block text-xs underline underline-offset-2"
                      >
                        Abrir objeto canônico
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-border bg-background p-4">
        <h3 className="text-sm font-semibold text-foreground">Decisão da proprietária</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Nenhuma liberação acontece sem esta ação explícita. O registro guarda data, responsável e
          motivo em auditoria e não altera nenhum status operacional.
        </p>
        {pendentes.length > 0 ? (
          <p className="mt-2 text-xs text-foreground">
            Itens sem evidência hoje: {pendentes.map((p) => p.titulo).join("; ")}.
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(ROTULO_DECISAO) as DecisaoLancamento[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDecisao(d)}
              aria-pressed={decisao === d}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                decisao === d ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
              }`}
            >
              {ROTULO_DECISAO[d]}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-xs text-muted-foreground">
          Responsável
          <input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="mt-3 block text-xs text-muted-foreground">
          Motivo da decisão
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="mt-3 flex items-start gap-2 text-xs text-foreground">
          <input type="checkbox" checked={ciente} onChange={(e) => setCiente(e.target.checked)} />
          Assumo explicitamente as pendências listadas acima.
        </label>

        {erros.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-destructive">
            {erros.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        ) : null}
        {mut.isError ? (
          <p className="mt-3 text-xs text-destructive">{(mut.error as Error).message}</p>
        ) : null}
        {mut.isSuccess ? (
          <p className="mt-3 text-xs text-foreground">
            Decisão registrada em auditoria. Nenhuma ação externa foi executada.
          </p>
        ) : null}

        <button
          type="button"
          onClick={enviar}
          disabled={mut.isPending}
          className="mt-4 rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          Registrar decisão
        </button>
      </div>

      <DetalhesTecnicos titulo="Detalhes técnicos (origem das evidências)">
        <ul className="space-y-1">
          {ITENS_CHECKLIST.map((i) => (
            <li key={i.id} className="text-xs text-muted-foreground">
              • {i.id} — {estadoEfetivo(i)}
            </li>
          ))}
        </ul>
      </DetalhesTecnicos>
    </section>
  );
}
