import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { carregarPessoa } from "@/lib/pessoa.functions";
import {
  evidenciaDeMesmaPessoa,
  montarLinhaDoTempoDaPessoa,
  type EvidenciaDeElo,
} from "@/lib/pessoa-identidade";

/**
 * A página de uma pessoa.
 *
 * A Proprietária vem dizendo há dois anos que "a Ana Luiza um dia foi lead e
 * depois virou cliente, mas Ana Luiza continua sendo Ana Luiza". O Desk tinha
 * casos e não tinha gente: dava para abrir um caso, nunca uma pessoa.
 *
 * Aqui a história é uma só, mesmo quando os casos são vários — e cada fato
 * continua dizendo de qual caso veio.
 */
export const Route = createFileRoute("/_authenticated/pessoas/$clienteId")({
  head: () => ({
    meta: [
      { title: "Pessoa — Clube Ancestral" },
      { name: "description", content: "A história de uma pessoa, reunida de todos os casos dela." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pessoa,
});

const FORCA_ROTULO: Record<EvidenciaDeElo["forca"], string> = {
  confirmado: "Mesma pessoa",
  provavel: "Provavelmente a mesma pessoa",
  apenas_indicio: "Só um indício",
};

function Pessoa() {
  const { clienteId } = Route.useParams();
  const { ehAdmin } = useSaas();
  const carregar = useServerFn(carregarPessoa);
  const q = useQuery({
    queryKey: ["pessoa", clienteId],
    queryFn: () => carregar({ data: { clienteId } }),
  });

  if (q.isLoading) {
    return (
      <SaasShell titulo="Pessoa" descricao="Carregando…">
        <p className="text-sm text-navy/55">Lendo a história desta pessoa.</p>
      </SaasShell>
    );
  }

  if (q.isError || !q.data?.encontrada) {
    return (
      <SaasShell titulo="Pessoa" descricao="Não encontrada">
        <p className="text-sm text-navy/70">
          Não encontrei esta pessoa na carteira desta organização.
        </p>
        <Link
          to="/clientes"
          className="mt-3 inline-block text-sm text-navy underline underline-offset-4"
        >
          Voltar para clientes
        </Link>
      </SaasShell>
    );
  }

  const { cliente, casos, eventos, leads } = q.data;

  const linha = montarLinhaDoTempoDaPessoa(
    casos.map((c) => ({
      casoCodigo: c.codigo ?? null,
      casoTitulo: c.titulo ?? null,
      eventos: eventos.filter((e) => e.case_id === c.id),
    })),
  );

  // Leads que podem ser esta mesma pessoa, com a evidência à vista.
  const candidatos = leads
    .map((l) => ({ lead: l, evidencia: evidenciaDeMesmaPessoa(l, cliente) }))
    .filter((x): x is { lead: typeof x.lead; evidencia: EvidenciaDeElo } => x.evidencia !== null)
    .sort((a, b) => ordemDaForca(a.evidencia.forca) - ordemDaForca(b.evidencia.forca));

  const nome = (cliente.nome_social || cliente.nome || "Sem nome").trim();

  return (
    <SaasShell titulo={nome} descricao="A história desta pessoa, reunida de todos os casos dela.">
      <div className="space-y-6">
        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <h2 className="font-serif text-lg text-navy">Quem é</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Campo rotulo="E-mail" valor={cliente.email?.trim()} />
            <Campo rotulo="Telefone" valor={cliente.telefone} />
            <Campo rotulo="Como entrou" valor={cliente.origem} />
            <Campo rotulo="Na carteira desde" valor={formatarDia(cliente.created_at)} />
          </dl>
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Casos</h2>
            <p className="text-xs text-navy/55">{casos.length} caso(s)</p>
          </div>
          {casos.length === 0 ? (
            <p className="mt-2 text-sm text-navy/60">Nenhum caso aberto para esta pessoa.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {casos.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-navy/12 bg-cream/25 p-3 transition-colors hover:bg-cream/50"
                >
                  <Link to="/casos/$caseId" params={{ caseId: c.id }} className="block">
                    <p className="font-mono text-[11px] text-navy/60">{c.codigo}</p>
                    <p className="text-sm font-medium text-navy">{c.titulo}</p>
                    <p className="mt-1 text-xs text-navy/55">
                      {[
                        c.fase,
                        c.pais,
                        c.data_entrada ? `desde ${formatarDia(c.data_entrada)}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </Link>
                  {ehAdmin ? (
                    <Link
                      to="/app-cliente-como-pessoa"
                      search={{ casoId: c.id }}
                      className="mt-2 inline-block text-xs font-medium text-navy underline underline-offset-4"
                    >
                      Abrir visão do cliente
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/*
          O elo com o lead. `leads.case_id` está nulo em todo o banco, então
          não há caminho oficial a percorrer — só evidência a mostrar. A tela
          nunca funde registro: diz o que encontrou e por quê, e a decisão
          continua sendo de quem lê.
        */}
        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <h2 className="font-serif text-lg text-navy">Antes de virar cliente</h2>
          {candidatos.length === 0 ? (
            <p className="mt-2 text-sm text-navy/65">
              Nenhum lead desta organização tem e-mail, telefone ou nome que bata com esta pessoa.
              Ela não entrou por lead — a origem registrada é{" "}
              <span className="font-medium">{cliente.origem || "não informada"}</span>.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {candidatos.map(({ lead, evidencia }) => (
                <li
                  key={lead.id}
                  className={`rounded-lg border p-3 ${
                    evidencia.forca === "confirmado"
                      ? "border-navy/15 bg-cream/25"
                      : "border-gold/40 bg-gold/5"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-navy">{lead.nome}</p>
                    <span className="rounded bg-navy/8 px-1.5 py-0.5 text-[11px] text-navy/70">
                      {FORCA_ROTULO[evidencia.forca]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy/60">{evidencia.motivo}</p>
                  <p className="mt-1 text-[11px] text-navy/45">
                    {[
                      lead.estagio ? `estágio ${lead.estagio}` : null,
                      lead.origem,
                      lead.created_at ? `registrado em ${formatarDia(lead.created_at)}` : null,
                      lead.case_id ? "ligado a um caso" : "sem caso ligado",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Linha do tempo</h2>
            <p className="text-xs text-navy/55">
              {linha.eventos.length} fato(s)
              {linha.de ? ` · de ${formatarDia(linha.de)} a ${formatarDia(linha.ate!)}` : ""}
              {linha.casos > 1 ? ` · ${linha.casos} casos` : ""}
            </p>
          </div>

          {linha.semData > 0 ? (
            <p className="mt-2 text-xs text-navy/50">
              {linha.semData} registro(s) sem data utilizável ficaram fora da ordem cronológica.
            </p>
          ) : null}

          {linha.eventos.length === 0 ? (
            <p className="mt-2 text-sm text-navy/60">
              Ainda não há fatos registrados na linha do tempo dos casos desta pessoa.
            </p>
          ) : (
            <ol className="mt-4 space-y-0 border-l border-navy/15 pl-5">
              {linha.eventos.map((e, i) => (
                <li key={`${e.quando}-${i}`} className="relative py-2.5">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.4rem] top-4 block h-2.5 w-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: e.bloqueio ? "#5E1F18" : "#2F4B6E" }}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-mono text-[11px] tabular-nums text-navy/60">
                      {formatarDia(e.quando)}
                    </span>
                    <p className="text-sm text-navy/85">{e.titulo}</p>
                    {e.bloqueio ? (
                      <span className="rounded bg-[#5E1F18]/10 px-1.5 py-0.5 text-[11px] text-[#5E1F18]">
                        <span aria-hidden="true">!</span> bloqueia
                      </span>
                    ) : null}
                  </div>
                  {e.resumoInterno ? (
                    <p className="mt-0.5 text-xs text-navy/60">{e.resumoInterno}</p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-navy/45">
                    {e.fase ? <span>{e.fase}</span> : null}
                    {e.status ? <span>{e.status}</span> : null}
                    {e.responsavel ? <span>{e.responsavel}</span> : null}
                    {linha.casos > 1 && e.casoCodigo ? (
                      <span className="font-mono">{e.casoCodigo}</span>
                    ) : null}
                    {e.alerta ? <span className="text-terracotta">{e.alerta}</span> : null}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </SaasShell>
  );
}

function ordemDaForca(f: EvidenciaDeElo["forca"]): number {
  return f === "confirmado" ? 0 : f === "provavel" ? 1 : 2;
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-navy/80">{valor || "—"}</dd>
    </div>
  );
}

function formatarDia(valor?: string | null): string {
  if (!valor) return "—";
  const d = new Date(valor.length <= 10 ? `${valor}T12:00:00Z` : valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
