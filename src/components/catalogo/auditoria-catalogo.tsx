/**
 * Corte ÓRFÃOS onda 5 (03/10/2026) — auditoria do catálogo ganha tela.
 *
 * `lerAuditoriaCatalogo` lê `catalog_audit_events` (quem mudou SKU, qual
 * campo, de que valor para qual, com motivo e papel) e não tinha chamador
 * nenhum. A trilha existia e ninguém podia abrir.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { lerAuditoriaCatalogo } from "@/lib/catalogo-canonico.functions";

export function AuditoriaCatalogo() {
  const carregar = useServerFn(lerAuditoriaCatalogo);
  const q = useQuery({ queryKey: ["auditoria-catalogo"], queryFn: () => carregar(), retry: false });

  return (
    <section className="mt-6 rounded-xl border border-navy/10 bg-cream/40 p-5" data-auditoria-catalogo>
      <h3 className="font-serif text-lg text-navy">Trilha de auditoria do catálogo</h3>
      <p className="mt-1 text-[11px] text-navy/50">
        Últimos 50 eventos reais: SKU, campo, valor anterior e novo, motivo, papel de quem alterou e origem. Somente
        leitura — evento de auditoria não se edita.
      </p>
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="a trilha de auditoria do catálogo"
      >
        {([r]) =>
          r.eventos.length === 0 ? (
            <p className="mt-2 text-xs text-navy/55">
              Nenhum evento de auditoria registrado. A leitura foi concluída — o catálogo não foi alterado por esta via.
            </p>
          ) : (
            <ul className="mt-3 space-y-1">
              {r.eventos.map((e: any) => (
                <li key={e.id} className="rounded border border-navy/10 bg-white/60 p-2 text-[11px] text-navy/70">
                  <span className="text-navy">{e.sku_codigo ?? "—"}</span> · {e.evento}
                  {e.campo ? ` · ${e.campo}` : ""}
                  {e.dados_teste ? " · (teste)" : ""}
                  <br />
                  <span className="text-navy/45">
                    {String(e.valor_anterior ?? "—")} → {String(e.valor_novo ?? "—")}
                    {e.motivo ? ` · ${e.motivo}` : ""}
                    {e.ator_papel ? ` · ${e.ator_papel}` : ""}
                    {e.created_at ? ` · ${new Date(e.created_at).toLocaleString("pt-BR")}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )
        }
      </EstadoDados>
    </section>
  );
}
