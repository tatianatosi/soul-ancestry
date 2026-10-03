/**
 * De-para SKU → Produto-Pai como alimento (03/10/2026).
 *
 * "aprovado de para sku-pp para todos os produtos ser usado como alimento e
 * não tela estática": esta tela não é o de-para, é o painel de controle dele.
 * O de-para em si é regra (`sku-produto-pai.ts`), lida pelo Planejador e
 * gravada em `product_catalog.produto_pai_id`. Aqui a equipe vê o que a regra
 * classifica, aplica no dado e lê o que ficou pendente de decisão de catálogo.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { alimentoSkuProdutoPai } from "@/lib/sku-produto-pai.functions";

export function DeParaSkuProdutoPai() {
  const carregar = useServerFn(alimentoSkuProdutoPai);
  const q = useQuery({ queryKey: ["de-para-sku-pp"], queryFn: () => carregar(), retry: false });

  return (
    <section className="mt-8 rounded-xl border border-navy/10 bg-cream/40 p-5" data-de-para-sku-pp>
      <h3 className="font-serif text-lg text-navy">De-para SKU → Produto-Pai</h3>
      <p className="mt-1 text-[11px] text-navy/50">
        Regra, não planilha: cada SKU é classificado pelo código e pelo nome comercial reais, com o motivo. SKU que a
        regra não decide fica declarado — classificação comercial não se chuta.
      </p>
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="o de-para de produto-pai"
      >
        {([a]) => (
          <div className="mt-3 space-y-3">
            <p className="text-[11px] text-navy/60">
              {a.total} SKUs · {a.classificados} classificados pela regra · {a.aClassificar.length} pendente(s) de
              decisão de catálogo.
            </p>
            <p className="text-[11px] text-navy/45">
              Nada aqui é uma segunda cópia do catálogo: a classificação é derivada na leitura, com fonte única na
              regra. O Planejador consome o mesmo de-para — o SKU do plano diz qual Produto-Pai implica, e divergência
              com o escolhido à mão aparece como sinal.
            </p>

            {a.porProdutoPai.map((g) => (
              <div key={g.produtoPaiId} className="rounded border border-navy/10 bg-white/60 p-3">
                <p className="text-sm text-navy">
                  {g.produtoPaiId} — {g.nome}{" "}
                  <span className="text-[10px] uppercase tracking-wide text-navy/40">({g.skus.length} SKU)</span>
                </p>
                <ul className="mt-1 space-y-0.5">
                  {g.skus.map((s) => (
                    <li key={s.id} className="text-[11px] text-navy/65">
                      {s.code} · {s.nome}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {a.aClassificar.length > 0 ? (
              <div className="rounded border border-terracotta/30 bg-terracotta/5 p-3">
                <p className="text-sm text-navy">Pendente de decisão de catálogo</p>
                <ul className="mt-1 space-y-1">
                  {a.aClassificar.map((s) => (
                    <li key={s.id} className="text-[11px] text-navy/65">
                      <span className="text-navy">
                        {s.code} · {s.nome}
                      </span>
                      <br />
                      <span className="text-navy/45">{s.porque}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </EstadoDados>
    </section>
  );
}
