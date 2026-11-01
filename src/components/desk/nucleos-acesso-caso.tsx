/**
 * Núcleos com / sem acesso ao App, por caso (prancha V4, 21/10/2026).
 * Só leitura sobre listarAcessosPortal — o mesmo leitor de /acessos-portal.
 * Nenhum convite, link mágico ou alteração de acesso é feito daqui.
 */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listarAcessosPortal } from "@/lib/portal.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ROTULO_ACESSO: Record<string, string> = {
  pending: "Pendente",
  invited: "Convidado",
  active: "Acesso ativo",
  suspended: "Suspenso",
  revoked: "Revogado",
  expired: "Expirado",
};

export function separarAcessosDoCaso(d: { acessos: any[]; casosAcesso: any[]; clientes: any[]; casos: any[]; autorizacoes: any[] }, caseId: string) {
  const nome = (id: string) => d.clientes.find((c) => c.id === id)?.nome ?? "Pessoa sem nome registrado";
  const acessosDoCaso = d.casosAcesso.filter((ca) => ca.case_id === caseId);
  const com = acessosDoCaso
    .map((ca) => {
      const a = d.acessos.find((x) => x.id === ca.client_portal_access_id);
      return a && !a.is_demo ? { id: String(a.id), clientId: String(a.client_id), nome: nome(a.client_id), estado: ROTULO_ACESSO[a.access_status] ?? "Não registrado", ativo: a.access_status === "active" && ca.access_status === "active" } : null;
    })
    .filter(Boolean) as { id: string; clientId: string; nome: string; estado: string; ativo: boolean }[];
  const comAtivo = new Set(com.filter((c) => c.ativo).map((c) => c.clientId));
  const caso = d.casos.find((c) => c.id === caseId);
  const candidatos = new Set<string>([caso?.cliente_id, ...d.autorizacoes.filter((x) => x.case_id === caseId && !x.is_demo).map((x) => x.client_id)].filter(Boolean));
  const sem = [...candidatos].filter((id) => !comAtivo.has(id)).map((id) => ({ id, nome: nome(id) }));
  return { com: com.filter((c) => c.ativo), sem, outros: com.filter((c) => !c.ativo) };
}

export function NucleosAcessoCaso({ caseId }: { caseId: string }) {
  const listar = useServerFn(listarAcessosPortal);
  const q = useQuery({ queryKey: ["acessos-portal"], queryFn: () => listar() });

  return (
    <section className="rounded-xl border border-navy/10 bg-card p-4" aria-label="Núcleos com e sem acesso" data-nucleos-acesso-caso>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Núcleos com / sem acesso</h2>
        <Link to="/acessos-portal" className="text-xs font-medium text-navy underline decoration-gold underline-offset-4">Abrir acessos ao App</Link>
      </div>
      {q.isLoading ? (
        <p className="text-sm text-navy/60" role="status">Carregando acessos…</p>
      ) : q.isError || !q.data ? (
        <p className="text-sm text-terracotta" role="alert">Não foi possível ler os acessos. Isto é falha de leitura, não ausência.</p>
      ) : (
        (() => {
          const r = separarAcessosDoCaso(q.data as any, caseId);
          return (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">Com acesso</p>
                {r.com.length === 0 ? (
                  <p className="mt-1 text-sm text-navy/60">Não registrado</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {r.com.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-navy">
                        {c.nome}
                        <span className="rounded-full border border-sucesso/40 bg-sucesso-suave px-2 py-0.5 text-[10px] text-sucesso">{c.estado}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">Sem acesso</p>
                {r.sem.length === 0 ? (
                  <p className="mt-1 text-sm text-navy/60">Não registrado</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {r.sem.map((c) => {
                      const outro = r.outros.find((o) => o.clientId === c.id);
                      return (
                        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-navy">
                          {c.nome}
                          <span className="rounded-full border border-navy/15 bg-cream px-2 py-0.5 text-[10px] text-navy/70">{outro?.estado ?? "Sem acesso"}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })()
      )}
      <p className="mt-3 text-[11px] text-navy/50">Somente leitura. Convites e mudanças de acesso continuam em Acessos ao App, com confirmação.</p>
    </section>
  );
}
