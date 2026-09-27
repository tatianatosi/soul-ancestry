import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listarNucleos } from "@/lib/nucleos-desk.functions";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";

type MembroNucleo = {
  id: string;
  nome: string;
  papel: string;
  /** Coluna real e canônica (CHECK de 5 valores) — mesma fonte de /nucleos e Pessoa 360. */
  papel_no_caso: string;
  vinculo: string | null;
  processo: string | null;
  cliente_id: string | null;
};
type NucleoLinha = {
  id: string;
  case_id: string | null;
  nome: string;
  dossie_mae: string | null;
  membros?: MembroNucleo[];
};

/**
 * P32c/Fase 2 (27/09/2026) — este componente tinha seu PRÓPRIO rótulo de
 * papel (`contratante_signatario/dependente/participante`, o último nem
 * sequer um valor real), diferente do que `/nucleos` e Pessoa 360 mostram
 * para a mesma pessoa. Unificado: `papel_no_caso` (PAPEIS_PESSOA) prevalece;
 * o `papel` cru só é mostrado como último recurso, para uma linha ainda não
 * migrada — nunca mais um rótulo próprio por tela.
 */
const rotuloPapel = (m: MembroNucleo) => PAPEIS_PESSOA.find((o) => o.valor === m.papel_no_caso)?.rotulo ?? (m.papel_no_caso || m.papel);

/**
 * Projeção somente leitura da composição familiar na ficha do Caso.
 * A fonte de verdade é Núcleos e dossiês: aqui nada é criado, editado ou copiado.
 */
export function PessoasDoNucleo({ caseId }: { caseId: string }) {
  const carregar = useServerFn(listarNucleos);
  const q = useQuery({ queryKey: ["nucleos-desk"], queryFn: () => carregar(), retry: false });

  const listaNucleos = (q.data ?? null) as NucleoLinha[] | null;
  if (q.isLoading) return <p className="py-6 text-sm text-navy/60" role="status">Carregando a composição familiar…</p>;
  if (q.isError || listaNucleos === null) {
    return (
      <div role="alert" className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive">Não foi possível carregar a composição familiar do núcleo.</p>
        <p className="text-navy/80">
          {q.error instanceof Error
            ? q.error.message
            : "A consulta de núcleos não retornou resultado nem erro."}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  const nucleo = listaNucleos.find((n) => n.case_id === caseId) ?? null;
  if (!nucleo) return null;

  const membros = nucleo.membros ?? [];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-navy/15 bg-cream px-4 py-4">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-navy">Composição familiar (somente leitura)</h3>
          <Link to="/nucleos" className="text-xs text-navy underline underline-offset-2">
            Editar em Núcleos e dossiês
          </Link>
        </div>
        <p className="mb-3 text-xs text-navy/60">
          {nucleo.nome}
          {nucleo.dossie_mae ? ` · ${nucleo.dossie_mae}` : ""} — requerentes, membros e dependentes são mantidos apenas
          em Núcleos e dossiês. A ficha do Caso apenas referencia esse núcleo único.
        </p>

        {membros.length === 0 ? (
          <p className="rounded-lg border border-dashed border-navy/20 px-3 py-4 text-sm text-navy/55">
            Nenhum membro registrado no núcleo vinculado.
          </p>
        ) : (
          <ul className="divide-y divide-navy/10">
            {membros.map((m) => (
              <li key={m.id} className="py-2 text-sm text-navy/80">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium text-navy">{m.nome}</span>
                  <span className="rounded-full border border-navy/15 bg-cream/60 px-2 py-0.5 text-[11px] uppercase tracking-wide text-navy/65">
                    {rotuloPapel(m)}
                  </span>
                  {m.cliente_id ? (
                    <Link
                      to="/pessoas/$clienteId"
                      params={{ clienteId: m.cliente_id }}
                      className="text-xs text-navy underline underline-offset-2"
                    >
                      Ver perfil
                    </Link>
                  ) : null}
                </div>
                {m.vinculo ? <p className="text-xs text-navy/55">{m.vinculo}</p> : null}
                {m.processo ? <p className="text-[11px] text-navy/45">{m.processo}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
