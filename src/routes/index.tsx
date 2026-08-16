import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Users, FileSearch, ScrollText } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clube Ancestral — Gestão de pesquisa genealógica e cidadania" },
      {
        name: "description",
        content:
          "Plataforma para gestão de pesquisa genealógica e jornada de dupla cidadania, com isolamento por organização, papéis e trilha de auditoria.",
      },
      { property: "og:title", content: "Clube Ancestral — Gestão de pesquisa genealógica e cidadania" },
      {
        property: "og:description",
        content: "Leads, clientes, casos, evidências e financeiro em um só lugar, com acesso por papel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILARES = [
  { icone: Users, titulo: "Leads e clientes", texto: "Do primeiro contato ao acompanhamento contínuo da família." },
  { icone: FileSearch, titulo: "Casos e evidências", texto: "Hipóteses, pendências e documentos — nunca conclusões automáticas." },
  { icone: ScrollText, titulo: "Auditoria completa", texto: "Nada é excluído: tudo é arquivado com motivo e responsável." },
  { icone: ShieldCheck, titulo: "Isolamento por organização", texto: "Cada equipe enxerga apenas os próprios dados, garantido no banco." },
];

function Landing() {
  const navigate = useNavigate();
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setAutenticado(Boolean(data.session)));
  }, []);

  return (
    <main className="min-h-screen bg-cream">
      <section className="bg-navy px-6 py-20 text-cream">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Clube Ancestral</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Gestão de pesquisa genealógica e jornada de dupla cidadania
          </h1>
          <p className="mt-5 max-w-2xl text-cream/80">
            Uma plataforma para equipes que lidam com histórias de família e documentos sensíveis: acesso individual,
            papéis definidos e registro de tudo o que acontece.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ to: autenticado ? "/painel" : "/equipe/entrar" })}
              className="rounded-lg bg-gold px-5 py-3 text-sm font-medium text-navy"
            >
              {autenticado ? "Ir para o painel" : "Acesso da equipe"}
            </button>
            <Link
              to="/acesso"
              className="rounded-lg border border-cream/30 px-5 py-3 text-sm font-medium text-cream"
            >
              Acesso do cliente
            </Link>
            <Link
              to="/prototipo"
              className="rounded-lg border border-cream/30 px-5 py-3 text-sm font-medium text-cream"
            >
              Ver protótipo visual
            </Link>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {PILARES.map(({ icone: Icone, titulo, texto }) => (
            <div key={titulo} className="rounded-xl border border-navy/10 bg-white p-6">
              <Icone className="h-5 w-5 text-gold" />
              <h2 className="mt-3 font-serif text-xl text-navy">{titulo}</h2>
              <p className="mt-2 text-sm text-navy/70">{texto}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 rounded-xl bg-navy/5 p-5 text-sm text-navy/70">
          Informações jurídicas, migratórias, financeiras e genealógicas são registradas como hipótese, evidência ou
          pendência — nunca como conclusão automática. Conteúdo de demonstração é fictício e identificado como DEMO.
        </p>
      </section>
    </main>
  );
}
