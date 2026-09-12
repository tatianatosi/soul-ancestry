import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  ContactRound,
  FileCheck2,
  Landmark,
  LayoutDashboard,
  Network,
  Radar,
  Scale,
  SearchCheck,
  Settings2,
  Smartphone,
  UsersRound,
} from "lucide-react";

const SUPERFICIES = [
  { titulo: "Hoje", apoio: "Decisões, tarefas e cadências", to: "/painel", icon: CalendarCheck },
  { titulo: "Comercial / CRM Vivo", apoio: "Discovery, propostas e contatos", to: "/calls", icon: LayoutDashboard },
  { titulo: "Caso 360", apoio: "Casos, participantes e jornada", to: "/casos", icon: ContactRound },
  { titulo: "Pessoa 360", apoio: "Identidade, vínculos e fontes", to: "/clientes", icon: UsersRound },
  { titulo: "Radar & Matrizes", apoio: "Qualidade e sinais internos", to: "/qualidade", icon: Radar },
  { titulo: "Pesquisa", apoio: "Fontes, evidências e hipóteses", to: "/pesquisa-modulo", icon: SearchCheck },
  { titulo: "Financeiro", apoio: "Condições, faturas e pagamentos", to: "/financeiro", icon: Landmark },
  { titulo: "Jurídico & Contrato", apoio: "Validação, contrato e assinatura", to: "/matriz-juridica", icon: Scale },
  { titulo: "Pessoas & Famílias", apoio: "Núcleos e dossiês familiares", to: "/nucleos", icon: Network },
  { titulo: "Pessoas e linhagens", apoio: "Árvore e relações do caso", to: "/casos", hash: "pessoas", icon: UsersRound },
  { titulo: "App Cliente", apoio: "Visão autorizada da jornada", to: "/app-cliente-como-pessoa", icon: Smartphone },
  { titulo: "Configuração & Acesso", apoio: "Equipe, papéis e preferências", to: "/configuracoes", icon: Settings2 },
] as const;

export function MapaSuperficiesDesk() {
  return (
    <section aria-labelledby="mapa-superficies-titulo" className="mb-6">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Visão do Desk
          </p>
          <h2 id="mapa-superficies-titulo" className="font-serif text-xl text-navy">
            Superfícies conectadas
          </h2>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">12 vistas</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {SUPERFICIES.map(({ titulo, apoio, to, icon: Icon, ...destino }) => (
          <Link
            key={titulo}
            to={to}
            hash={"hash" in destino ? destino.hash : undefined}
            className="group grid min-h-24 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-gold hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy text-gold">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-base leading-tight text-navy">{titulo}</span>
              <span className="mt-1 block text-xs leading-snug text-muted-foreground">{apoio}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}