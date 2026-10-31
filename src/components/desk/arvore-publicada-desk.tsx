import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { pessoasDaArvore, type PessoaNaArvore } from "@/lib/arvore-publicacao";
import { FonteAlimento } from "@/components/desk/fonte-alimento";

/** Leitura das pessoas publicadas; conectores de geração não inferem parentesco. */
export function ArvorePublicadaDesk({ caseId }: { caseId: string }) {
  const q = useQuery({
    queryKey: ["desk-arvore-publicada", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_projections")
        .select("id,projection_type,pessoa_id,content_sanitized,geracao_cliente,effective_from,updated_at")
        .eq("case_id", caseId)
        .eq("projection_type", "arvore")
        .eq("approval_status", "published")
        .is("archived_at", null);
      if (error) throw error;
      return pessoasDaArvore(data ?? []);
    },
  });

  const porGeracao = new Map<number, PessoaNaArvore[]>();
  for (const pessoa of q.data ?? []) {
    if (pessoa.geracao == null) continue;
    porGeracao.set(pessoa.geracao, [...(porGeracao.get(pessoa.geracao) ?? []), pessoa]);
  }
  const geracoes = [...porGeracao.keys()].sort((a, b) => b - a);

  return (
    <section className="rounded-xl border border-navy/10 bg-card p-4" data-desk-arvore-ligada aria-label="Árvore publicada">
      <h3 className="mb-2 font-serif text-lg text-navy">Árvore publicada</h3>
      <FonteAlimento fonte="Pessoas e vínculos publicados pela equipe" consumidor="Aba Árvore do App Cliente" detalheTecnico="app_projections · projection_type=arvore · approval_status=published" />
      {q.isLoading ? <p className="text-sm text-navy/60">Carregando árvore…</p> : null}
      {q.isError ? <p role="alert" className="text-sm text-terracotta">Não foi possível ler a árvore. Isto é falha de leitura, não árvore vazia.</p> : null}
      {!q.isLoading && !q.isError && geracoes.length === 0 ? <p className="text-sm text-navy/60">Dados insuficientes: nenhuma pessoa publicada na árvore deste caso.</p> : null}
      <ol className="flex flex-col items-stretch">
        {geracoes.map((geracao, indice) => (
          <li key={geracao} className="flex flex-col items-center">
            {indice > 0 ? <span aria-hidden className="h-5 w-px bg-gold" /> : null}
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-navy/50">Geração {geracao}</p>
            <div className="relative flex w-full flex-wrap justify-center gap-2 border-t border-gold/60 pt-2">
              {(porGeracao.get(geracao) ?? []).map((pessoa) => (
                <div key={pessoa.chave} className="min-w-0 max-w-full rounded-lg border border-navy/15 bg-cream/60 px-3 py-2 text-center">
                  <p className="break-words font-serif text-base text-navy">{pessoa.nome}</p>
                  {pessoa.vinculo ? <p className="break-words text-[11px] text-navy/60">{pessoa.vinculo}</p> : null}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-navy/55">As linhas ligam gerações publicadas; parentesco só aparece quando a equipe publicou o vínculo.</p>
    </section>
  );
}