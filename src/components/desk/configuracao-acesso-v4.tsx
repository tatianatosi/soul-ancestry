import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Lock, Plug, ScrollText, Users, UsersRound, type LucideIcon } from "lucide-react";

import { Cartao, Etiqueta, Linha } from "@/components/prancha-v4/kit";
import { EstadoVazio, PAPEL_LABEL } from "@/components/saas/shell";
import { listarAcessosPortal } from "@/lib/portal.functions";
import type { Papel } from "@/lib/saas.functions";
import { cn } from "@/lib/utils";
import { rotuloHumano } from "@/lib/rotulos-humanos";

/*
 * 19/10/2026 — Configuração & Acesso com a composição da Prancha V4:
 * coluna "Permissões" (6 itens que escolhem o painel à direita), painel
 * selecionado (abre em "Política operacional") e "Registro de auditoria"
 * (Data · Ação · Pessoa · Resultado). Casca permanente: sem dado, cada
 * bloco aparece no formato da prancha em estado vazio honesto.
 *
 * Somente leitura. Fontes já lidas pela rota (`listarUsuarios`,
 * `listarAuditoria` → audit_logs, `obterModoProprietaria`) e, no painel
 * "Acessos ao portal", o mesmo `listarAcessosPortal` de /acessos-portal
 * (mesma queryKey). Conceder/remover papel continua só na gestão detalhada
 * existente, com AcaoOperacional e autorização no servidor.
 */

export type PainelPermissao = "politica" | "perfis" | "internos" | "portal" | "integracoes" | "auditoria";

export const PERMISSOES_V4: { id: PainelPermissao; rotulo: string; icone: LucideIcon }[] = [
  { id: "politica", rotulo: "Política operacional", icone: Lock },
  { id: "perfis", rotulo: "Perfis e papéis", icone: UsersRound },
  { id: "internos", rotulo: "Acessos internos", icone: Users },
  { id: "portal", rotulo: "Acessos ao portal", icone: KeyRound },
  { id: "integracoes", rotulo: "Integrações", icone: Plug },
  { id: "auditoria", rotulo: "Auditoria", icone: ScrollText },
];

type Usuario = { userId: string; nome?: string | null; email?: string | null; papeis: Papel[]; arquivado?: boolean };
type Evento = Record<string, unknown>;

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
      <p className="text-[10px] text-navy/55">{rotulo}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-navy">{valor}</p>
    </div>
  );
}

export function ConfiguracaoAcessoV4({
  liberado,
  motivoBloqueio,
  papelAtual,
  usuarios,
  carregandoUsuarios,
  eventos,
  carregandoEventos,
  erroEventos,
  rotuloAcao,
  renderTrilha,
}: {
  liberado: boolean;
  motivoBloqueio: string;
  papelAtual: string | null | undefined;
  usuarios: Usuario[] | undefined;
  carregandoUsuarios: boolean;
  eventos: Evento[] | undefined;
  carregandoEventos: boolean;
  erroEventos: unknown;
  rotuloAcao: (acao: string) => string;
  renderTrilha: (eventos: Evento[]) => React.ReactNode;
}) {
  const [painel, setPainel] = useState<PainelPermissao>("politica");
  const atual = PERMISSOES_V4.find((p) => p.id === painel)!;

  const listarPortal = useServerFn(listarAcessosPortal);
  const qPortal = useQuery({
    queryKey: ["acessos-portal"],
    queryFn: () => listarPortal({}),
    enabled: liberado && painel === "portal",
  });

  const papeis = Object.keys(PAPEL_LABEL) as Papel[];
  const perfilSelecionado = papelAtual
    ? (PAPEL_LABEL[papelAtual as Papel] ?? papelAtual)
    : "Não identificado";

  const ultimos = (eventos ?? []).slice(0, 8);

  function corpoDoPainel() {
    if (painel === "politica") {
      return (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Perfil selecionado" valor={perfilSelecionado} />
            <Campo rotulo="Confirmação externa" valor="Sempre obrigatória" />
          </div>
          <p className="mt-3 text-[11px] text-navy/60">
            Papéis, decisões da Proprietária e alterações de acesso são validados no servidor e registrados na auditoria.
          </p>
        </>
      );
    }
    if (!liberado) return <EstadoVazio mensagem={motivoBloqueio} />;
    if (painel === "perfis") {
      return (
        <div>
          {papeis.map((p) => {
            const n = usuarios ? usuarios.filter((u) => u.papeis.includes(p)).length : null;
            return (
              <Linha
                key={p}
                rotulo={PAPEL_LABEL[p]}
                valor={n === null ? (carregandoUsuarios ? "…" : "—") : `${n} ${n === 1 ? "membro" : "membros"}`}
              />
            );
          })}
          <p className="mt-2 text-[11px] text-navy/55">Conceder ou remover papel: gestão detalhada abaixo, com confirmação.</p>
        </div>
      );
    }
    if (painel === "internos") {
      if (!usuarios) return <EstadoVazio mensagem={carregandoUsuarios ? "Carregando membros…" : "Membros não carregados."} />;
      if (!usuarios.length) return <EstadoVazio mensagem="Nenhum membro nesta organização ainda." />;
      return (
        <div>
          {usuarios.map((u) => (
            <Linha
              key={u.userId}
              rotulo={u.nome ?? u.email ?? "Membro"}
              valor={u.arquivado ? "Arquivado" : u.papeis.length ? u.papeis.map((p) => PAPEL_LABEL[p] ?? p).join(" · ") : "Sem papel"}
              tom={u.arquivado || !u.papeis.length ? "atencao" : "neutro"}
            />
          ))}
        </div>
      );
    }
    if (painel === "portal") {
      const acessos = ((qPortal.data?.acessos ?? []) as { access_status: string; is_demo?: boolean }[]).filter((a) => !a.is_demo);
      const contar = (estados: string[]) => (qPortal.data ? String(acessos.filter((a) => estados.includes(a.access_status)).length) : "—");
      return (
        <div>
          <Linha rotulo="Acessos ativos" valor={contar(["active"])} tom="sucesso" />
          <Linha rotulo="Convites enviados" valor={contar(["invited", "pending"])} tom="atencao" />
          <Linha rotulo="Suspensos, revogados ou expirados" valor={contar(["suspended", "revoked", "expired"])} tom="critico" />
          {qPortal.isError ? (
            <p className="mt-2 text-[11px] text-terracotta">Leitura dos acessos falhou — isto é erro de leitura, não ausência.</p>
          ) : null}
          <Link to="/acessos-portal" className="mt-3 inline-block text-[11px] font-medium text-navy underline decoration-gold underline-offset-4">
            Abrir Portal do cliente (visão interna)
          </Link>
        </div>
      );
    }
    if (painel === "integracoes") {
      return (
        <EstadoVazio
          mensagem="As integrações são configuradas e acompanhadas na tela de Integrações."
          acao={
            <Link to="/integracoes" className="text-xs font-medium text-navy underline decoration-gold underline-offset-4">
              Abrir Integrações
            </Link>
          }
        />
      );
    }
    // auditoria
    if (carregandoEventos) return <p className="text-xs text-navy/60">Carregando trilha…</p>;
    if (erroEventos) return <p className="text-xs text-terracotta">Leitura da trilha falhou — isto é erro de leitura, não ausência.</p>;
    if (!eventos?.length) return <EstadoVazio mensagem="Nenhum evento de auditoria registrado nesta organização ainda." />;
    return renderTrilha(eventos);
  }

  return (
    <section aria-label="Configuração & Acesso" className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" data-configuracao-acesso-v4>
      <Cartao titulo="Permissões" className="lg:self-start">
        <ul className="space-y-1.5" role="tablist" aria-label="Permissões">
          {PERMISSOES_V4.map((p) => {
            const Icone = p.icone;
            const ativo = p.id === painel;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={ativo}
                  onClick={() => setPainel(p.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                    ativo ? "border-gold/60 bg-gold/15 font-medium text-navy" : "border-navy/10 text-navy/70 hover:bg-cream/60",
                  )}
                >
                  <Icone className="h-3.5 w-3.5 shrink-0 text-navy/60" aria-hidden="true" />
                  {p.rotulo}
                </button>
              </li>
            );
          })}
        </ul>
      </Cartao>

      <div className="min-w-0 space-y-4">
        <Cartao titulo={atual.rotulo} role="tabpanel" data-painel-permissao={painel}>
          {corpoDoPainel()}
        </Cartao>

        <Cartao titulo="Registro de auditoria" data-registro-auditoria>
          {!liberado ? (
            <EstadoVazio mensagem={motivoBloqueio} />
          ) : carregandoEventos ? (
            <p className="text-xs text-navy/60">Carregando registro…</p>
          ) : erroEventos ? (
            <p className="text-xs text-terracotta">Leitura do registro falhou — isto é erro de leitura, não ausência.</p>
          ) : !ultimos.length ? (
            <EstadoVazio mensagem="Nenhum evento de auditoria registrado nesta organização ainda." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-navy/50">
                    <th className="pb-2 pr-3 font-medium">Data</th>
                    <th className="pb-2 pr-3 font-medium">Ação</th>
                    <th className="pb-2 pr-3 font-medium">Pessoa</th>
                    <th className="pb-2 font-medium">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimos.map((e) => (
                    <tr key={String(e["id"])} className="border-t border-navy/5">
                      <td className="py-1.5 pr-3 tabular-nums text-navy/70">
                        {new Date(String(e["created_at"])).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </td>
                      <td className="py-1.5 pr-3 text-navy/80">
                        {rotuloAcao(String(e["acao"]))}
                        {e["entidade"] ? <span className="text-navy/50"> · {rotuloHumano(String(e["entidade"]))}</span> : null}
                      </td>
                      <td className="py-1.5 pr-3 text-navy/70">
                        {String(e["autorNome"] ?? e["autorEmail"] ?? "Não identificado")}
                      </td>
                      <td className="py-1.5">
                        <Etiqueta texto="Registrado" tom="sucesso" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Cartao>
      </div>
    </section>
  );
}
