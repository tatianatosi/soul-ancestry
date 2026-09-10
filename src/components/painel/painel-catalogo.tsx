import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelCatalogoHomologacao } from "@/lib/catalogo-homologacao.functions";
import {
  CRITERIOS_LIBERACAO,
  ROTULO_HOMOLOGACAO,
  ROTULO_LINK,
  ROTULO_STATUS_PRODUTO,
} from "@/lib/catalogo-homologacao";

/**
 * Painel Hoje — catálogo e homologação comercial.
 * Somente leitura: preço, condição, escopo e link vêm do catálogo homologado
 * (product_catalog) — a Planilha Mestre é legado de auditoria, não fonte viva.
 * Nada é criado ou alterado no Asaas a partir daqui.
 */
export function PainelCatalogo() {
  const carregar = useServerFn(painelCatalogoHomologacao);
  const q = useQuery({
    queryKey: ["painel-catalogo-homologacao"],
    queryFn: () => carregar(),
    retry: false,
  });

  if (q.isLoading)
    return <p className="mt-6 text-sm text-navy/50">Carregando catálogo homologado…</p>;
  if (q.isError)
    return (
      <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-terracotta">
        Não foi possível carregar o catálogo homologado.
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </p>
    );
  if (!q.data) return null;

  const { filas, resumo } = q.data;
  type Item = (typeof filas.bloqueados)[number];
  type Caso = (typeof filas.casosBloqueados)[number];

  const blocos = [
    {
      chave: "sem-homologacao",
      rotulo: "SKUs ativos sem homologação",
      itens: filas.ativosSemHomologacao,
    },
    { chave: "link", rotulo: "Link Asaas pendente ou desatualizado", itens: filas.linkPendente },
    {
      chave: "bloqueados",
      rotulo: "SKUs bloqueados por validação comercial",
      itens: filas.bloqueados,
    },
  ];

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl text-navy">Catálogo e homologação comercial</h2>
        <p className="text-xs text-navy/55">
          {resumo.liberados} liberados · {resumo.emRevisao} em revisão · {resumo.bloqueados}{" "}
          bloqueados · {resumo.total} no catálogo
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {blocos.map((b) => (
          <div key={b.chave} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">{b.rotulo}</p>
              <span className="font-serif text-2xl text-navy">{b.itens.length}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/60">
              {b.itens.slice(0, 6).map((i: Item) => (
                <li key={`${b.chave}-${i.sku}`}>
                  <span className="font-medium text-navy/80">{i.sku}</span> — {i.nome_produto} ·{" "}
                  {ROTULO_STATUS_PRODUTO[i.status_produto as keyof typeof ROTULO_STATUS_PRODUTO] ??
                    i.status_produto}{" "}
                  ·{" "}
                  {ROTULO_HOMOLOGACAO[i.status_homologacao as keyof typeof ROTULO_HOMOLOGACAO] ??
                    i.status_homologacao}{" "}
                  ·{" "}
                  {ROTULO_LINK[i.status_link_asaas as keyof typeof ROTULO_LINK] ??
                    i.status_link_asaas}
                </li>
              ))}
              {!b.itens.length ? <li>Fila vazia.</li> : null}
            </ul>
          </div>
        ))}

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-navy/50">
              Casos bloqueados por SKU não homologado
            </p>
            <span className="font-serif text-2xl text-navy">{filas.casosBloqueados.length}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {filas.casosBloqueados.slice(0, 6).map((c: Caso) => (
              <li key={c.id}>
                {c.codigo || c.nome} — SKU {c.sku} não liberado ({c.estagio || "sem estágio"})
              </li>
            ))}
            {!filas.casosBloqueados.length ? <li>Fila vazia.</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-navy/50">Alerta — caso Ana Luiza</p>
          <p className="mt-2 text-xs text-navy/70">
            Não liberar contrato, Anexo I ou cobrança enquanto SKU, preço comercial vigente, escopo
            aprovado, parcelamento e vencimento não estiverem reconciliados com o catálogo homologado.
            Preço, condição e link são somente leitura; o Desk registra apenas referência de SKU,
            versão e data de última validação.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-navy/10 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">
          Critérios para liberar um SKU
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-navy/65">
          {CRITERIOS_LIBERACAO.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-navy/45">
          Asaas é consultado apenas como status de cobrança e pagamento. Nenhuma cobrança, produto,
          link, assinatura ou cliente é criado ou alterado por esta tela.
        </p>
      </div>
    </section>
  );
}
