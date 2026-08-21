import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelTop30Planejador } from "@/lib/catalogo-top30.functions";

const ROTULO_HOMOLOGACAO: Record<string, string> = {
  homologado: "Homologado",
  em_revisao: "Em revisão",
  sob_demanda: "Sob demanda",
  bloqueado: "Bloqueado",
  arquivado: "Arquivado",
};

/**
 * Base comercial Top 30 e planejador nativo de casos.
 * Leitura apenas: preço vigente e condição vêm da homologação no Desk; nada é criado no Asaas.
 */
export function PainelTop30() {
  const carregar = useServerFn(painelTop30Planejador);
  const q = useQuery({ queryKey: ["painel-top30-planejador"], queryFn: () => carregar(), retry: false });

  if (q.isLoading) return <p className="mt-6 text-sm text-navy/50">Carregando base comercial Top 30…</p>;
  if (q.isError || !q.data) return null;

  const { resumo, top10, top30, filas, fases } = q.data;
  type Produto = (typeof top10)[number];
  type Caso = (typeof filas.semPlano)[number];

  const filasCasos = [
    { chave: "sem-produto", rotulo: "Casos sem produto vinculado", itens: filas.semProduto },
    { chave: "sem-plano", rotulo: "Casos sem plano operacional", itens: filas.semPlano },
    { chave: "sem-micro", rotulo: "Casos sem próxima micro-entrega", itens: filas.semMicroentrega },
    { chave: "d10", rotulo: "10+ dias sem touchpoint (atenção)", itens: filas.atencao10 },
    { chave: "d14", rotulo: "14+ dias sem atualização (crítico)", itens: filas.critico14 },
  ];

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl text-navy">Base comercial Top 30 e planejador de casos</h2>
        <p className="text-xs text-navy/55">
          {resumo.top10} no núcleo · {resumo.top30} complementares · {resumo.emRevisao} em revisão ·{" "}
          {resumo.homologados} homologados para proposta · {resumo.historico} em histórico
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ListaProdutos titulo="Núcleo Top 10" itens={top10} />
        <ListaProdutos titulo="Complementares Top 30" itens={top30} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-navy/50">Homologados para proposta</p>
            <span className="font-serif text-2xl text-navy">{filas.homologadosParaProposta.length}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {filas.homologadosParaProposta.slice(0, 6).map((p: Produto) => (
              <li key={`hom-${p.sku}`}>
                <span className="font-medium text-navy/80">{p.sku}</span> — {p.nome}
              </li>
            ))}
            {!filas.homologadosParaProposta.length ? <li>Nenhum SKU liberado para o seletor comercial.</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-navy/50">Top 30 em revisão</p>
            <span className="font-serif text-2xl text-navy">{filas.top30EmRevisao.length}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {filas.top30EmRevisao.slice(0, 6).map((p: Produto) => (
              <li key={`rev-${p.sku}`}>
                <span className="font-medium text-navy/80">{p.sku}</span> — {p.nome} ·{" "}
                {ROTULO_HOMOLOGACAO[p.status_homologacao] ?? p.status_homologacao}
              </li>
            ))}
            {!filas.top30EmRevisao.length ? <li>Fila vazia.</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-navy/50">Entregas pendentes de aprovação</p>
            <span className="font-serif text-2xl text-navy">{filas.entregasPendentes.length}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {filas.entregasPendentes.slice(0, 6).map((d: { id: string; titulo: string; status: string }) => (
              <li key={d.id}>
                {d.titulo} · {d.status}
              </li>
            ))}
            {!filas.entregasPendentes.length ? <li>Fila vazia.</li> : null}
          </ul>
        </div>

        {filasCasos.map((f) => (
          <div key={f.chave} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">{f.rotulo}</p>
              <span className="font-serif text-2xl text-navy">{f.itens.length}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/60">
              {f.itens.slice(0, 6).map((c: Caso) => (
                <li key={`${f.chave}-${c.id}`}>
                  {c.codigo || c.titulo} · {c.fase ?? "sem fase"} · {c.dias_sem_touchpoint} dias
                </li>
              ))}
              {!f.itens.length ? <li>Fila vazia.</li> : null}
            </ul>
          </div>
        ))}

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Pendências por responsável</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {pendenciasPorResponsavel.slice(0, 8).map((r) => (
              <li key={r.responsavel}>
                {r.responsavel === "sem-responsavel" ? "Sem responsável definido" : `Responsável ${r.responsavel.slice(0, 8)}`} —{" "}
                {r.pendencias} pendência(s) em {r.casos} caso(s)
              </li>
            ))}
            {!pendenciasPorResponsavel.length ? <li>Nenhum caso com plano registrado.</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">

          <p className="text-xs uppercase tracking-wide text-navy/50">Casos por fase da jornada</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {fases.map((f) => (
              <li key={f.fase}>
                {f.fase} — {f.total}
              </li>
            ))}
            {!fases.length ? <li>Nenhum plano de caso com fase registrada.</li> : null}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">Regra final de preço</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-navy/70">
          <li>O preço sugerido homologado é o preço comercial vigente de referência do Desk.</li>
          <li>O antigo Preço (R$) fica apenas como preço legado/histórico, para análise de transição.</li>
          <li>Não há preço livre em oportunidade, proposta, contrato ou caso.</li>
          <li>Exceção comercial exige motivo, responsável, prazo de validade e aprovação explícita registrada.</li>
          <li>O valor só segue para cobrança depois que SKU e condição estiverem homologados no Desk.</li>
          <li>O App Cliente não exibe SKU, preço, ranking, link técnico ou catálogo.</li>
        </ul>
      </div>
    </section>
  );
}

function ListaProdutos({ titulo, itens }: { titulo: string; itens: { sku: string; nome: string; papel: string; status_homologacao: string; elegivel: boolean }[] }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wide text-navy/50">{titulo}</p>
        <span className="font-serif text-2xl text-navy">{itens.length}</span>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-navy/65">
        {itens.map((p) => (
          <li key={p.sku} className="flex flex-wrap gap-x-2">
            <span className="font-medium text-navy/85">{p.sku}</span>
            <span>{p.nome}</span>
            {p.papel ? <span className="text-navy/45">· {p.papel}</span> : null}
            <span className={p.elegivel ? "text-navy/60" : "text-terracotta"}>
              · {p.elegivel ? "Liberado" : (ROTULO_HOMOLOGACAO[p.status_homologacao] ?? p.status_homologacao)}
            </span>
          </li>
        ))}
        {!itens.length ? <li>Nenhum item cadastrado nesta faixa.</li> : null}
      </ul>
    </div>
  );
}
