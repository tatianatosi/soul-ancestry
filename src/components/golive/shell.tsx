/**
 * Shell da superfície de go-live.
 *
 * Enxuto de propósito: topo, menu em gaveta (fechado no celular) e conteúdo.
 * Sem launcher flutuante, sem painéis históricos, sem explicação técnica.
 */
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand";

const TELAS = [
  { to: "/golive", rotulo: "Hoje" },
  { to: "/golive/comercial", rotulo: "Comercial" },
  { to: "/golive/kanban", rotulo: "Kanban" },
  { to: "/golive/pessoa", rotulo: "Pessoa 360" },
  { to: "/golive/pessoas", rotulo: "Pessoas & Famílias" },
  { to: "/golive/caso", rotulo: "Caso 360" },
  { to: "/golive/radar", rotulo: "Radar" },
  { to: "/golive/pesquisa", rotulo: "Pesquisa" },
  { to: "/golive/juridico", rotulo: "Jurídico" },
  { to: "/golive/financeiro", rotulo: "Financeiro" },
  { to: "/golive/portal", rotulo: "Portal" },
  { to: "/golive/app", rotulo: "App Cliente" },
] as const;

export function GoLiveShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-cream">
      <header className="sticky top-0 z-20 border-b border-navy/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-4 py-3">
          <button
            type="button"
            aria-expanded={menuAberto}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuAberto((v) => !v)}
            className="rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy lg:hidden"
          >
            ☰
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden shrink-0 lg:block">
              <BrandLogo size={28} showText={false} variant="client-light" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-lg text-navy sm:text-xl">{titulo}</h1>
              {descricao ? <p className="truncate text-xs text-navy/55">{descricao}</p> : null}
            </div>
          </div>
        </div>
        <nav
          aria-label="Telas do go-live"
          className={`${menuAberto ? "block" : "hidden"} border-t border-navy/10 px-4 py-2 lg:block`}
        >
          <ul className="mx-auto flex w-full max-w-5xl flex-col gap-1 lg:flex-row lg:gap-2">
            {TELAS.map((tela) => (
              <li key={tela.to} className="min-w-0">
                <Link
                  to={tela.to}
                  onClick={() => setMenuAberto(false)}
                  className="block truncate rounded-lg px-3 py-2 text-sm text-navy/70 hover:bg-navy/5"
                  activeOptions={{ exact: tela.to === "/golive" }}
                  activeProps={{ className: "block truncate rounded-lg px-3 py-2 text-sm font-semibold text-navy bg-gold/20" }}
                >
                  {tela.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-24 pt-5">{children}</main>
    </div>
  );
}

export function Vazio({ cta }: { cta: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-white/60 p-6 text-center">
      <p className="text-sm text-navy/70">Sem itens nesta etapa</p>
      <div className="mt-3 flex justify-center">{cta}</div>
    </div>
  );
}

export function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-navy/10 bg-white/70 p-4">
      <h2 className="mb-3 font-serif text-base text-navy">{titulo}</h2>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  );
}
