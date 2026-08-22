import { derivarJornada } from "@/lib/derivacao-jornada";
import type { LeadDesk } from "@/lib/crm-desk";

/**
 * Leitura INTERNA derivada da ficha: organiza entradas de triagem em plano de
 * jornada. Não decide direito, prazo, produto, contrato, cobrança nem pesquisa
 * externa, e nada aqui é exibido ao cliente.
 */
export function DerivacaoJornada({ lead }: { lead: LeadDesk }) {
  const d = derivarJornada(lead);

  const bloco = (titulo: string, itens: string[], vazio: string) => (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-navy/45">{titulo}</p>
      {itens.length ? (
        <ul className="mt-1 space-y-1 text-sm text-navy/80">
          {itens.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-navy/50">{vazio}</p>
      )}
    </div>
  );

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Derivação operacional da jornada</h3>
        <span className="text-xs text-navy/55">{d.versao}</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-gold/50 bg-gold/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy/45">Fase da jornada</p>
          <p className="text-sm font-medium text-navy">{d.fase_rotulo}</p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy/45">Responsável</p>
          <p className="text-sm text-navy">{d.responsavel}</p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy/45">Próxima ação datada</p>
          <p className="text-sm text-navy">{d.proxima_acao_datada.acao}</p>
          <p className="text-xs text-navy/55">
            {d.proxima_acao_datada.data
              ? new Date(d.proxima_acao_datada.data).toLocaleDateString("pt-BR")
              : d.proxima_acao_datada.estado === "sem_data"
                ? "Sem data definida"
                : "Ação ainda não registrada"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-navy/10 bg-cream/40 p-3">
        <p className="text-[11px] uppercase tracking-wide text-navy/45">Checklist inicial (entradas da ficha)</p>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {d.checklist_inicial.map((c) => (
            <div key={c.chave} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-navy/80">{c.rotulo}</span>
              <span
                className={
                  c.estado === "registrado"
                    ? "rounded border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] text-navy"
                    : "rounded border border-terracotta/40 bg-terracotta/5 px-2 py-0.5 text-[11px] text-terracotta"
                }
              >
                {c.estado === "registrado" ? "Registrado" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {bloco("Perguntas prioritárias", d.perguntas_prioritarias, "Entradas completas nesta rodada.")}
        {bloco("Dependências do cliente", d.dependencias_cliente, "Nenhuma dependência registrada.")}
        {bloco("Pendências internas", d.pendencias_internas, "Nenhuma pendência interna aberta.")}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-navy/10 bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy/45">Próximo marco verificável</p>
          <p className="text-sm text-navy/80">{d.proximo_marco_verificavel}</p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy/45">Entrega robusta prevista</p>
          <p className="text-sm text-navy/80">{d.entrega_robusta_prevista}</p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy/45">Próxima micro-entrega possível</p>
          <p className="text-sm text-navy/80">{d.proxima_microentrega_possivel}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-navy/10 bg-white p-3">
        <p className="text-[11px] uppercase tracking-wide text-navy/45">Revisão humana/jurídica</p>
        <p className="text-sm text-navy">
          {d.revisao_humana_juridica.necessaria ? "Necessária antes de avançar" : "Não sinalizada nesta rodada"}
        </p>
        {d.revisao_humana_juridica.motivos.length ? (
          <ul className="mt-1 space-y-1 text-sm text-navy/70">
            {d.revisao_humana_juridica.motivos.map((m) => (
              <li key={m}>• {m}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-3 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3">
        <p className="text-[11px] uppercase tracking-wide text-navy/45">Bloqueios sempre ativos</p>
        <ul className="mt-1 space-y-1 text-sm text-navy/80">
          {d.bloqueios.map((b) => (
            <li key={b.codigo}>
              <span className="font-medium">
                {b.codigo} — {b.regra}.
              </span>{" "}
              <span className="text-navy/65">{b.motivo}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
