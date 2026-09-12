/**
 * MOCKUP — APP CLIENTE (VISUAL-ONLY, mobile-first)
 * 6 abas aprovadas: Home, Jornada, Radar, Árvore, Documentos, Legado.
 */
import { useState } from "react";
import { BookOpen, FileText, Home, Route as RouteIcon, Radar, TreeDeciduous } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge, Barra, Card, Lista, Vazio } from "./ui";
import { RadarSvg } from "./radar";

type Tab = "home" | "jornada" | "radar" | "arvore" | "documentos" | "legado";

const TABS: [Tab, typeof Home, string][] = [
  ["home", Home, "Home"],
  ["jornada", RouteIcon, "Jornada"],
  ["radar", Radar, "Radar"],
  ["arvore", TreeDeciduous, "Árvore"],
  ["documentos", FileText, "Documentos"],
  ["legado", BookOpen, "Legado"],
];

export function ClienteMockup() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="mx-auto max-w-md pb-24">
      <header className="bg-navy px-5 pb-6 pt-5 text-cream">
        <p className="text-[10px] uppercase tracking-[0.2em] text-cream/50">Sua jornada</p>
        <h1 className="font-serif text-2xl">Ana Luiza</h1>
        <p className="mt-1 text-sm text-cream/70">Caso ativo · Pesquisa Ancestral</p>
      </header>

      <main className="space-y-4 p-4">
        {tab === "home" && <HomeTab />}
        {tab === "jornada" && <JornadaTab />}
        {tab === "radar" && <RadarTab />}
        {tab === "arvore" && <ArvoreTab />}
        {tab === "documentos" && <DocumentosTab />}
        {tab === "legado" && <LegadoTab />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md justify-between border-t border-navy/10 bg-cream/50 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {TABS.map(([id, Icone, nome]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] transition",
              tab === id ? "text-navy" : "text-navy/45",
            )}
          >
            <Icone className={cn("size-5", tab === id && "text-gold")} />
            {nome}
          </button>
        ))}
      </nav>
    </div>
  );
}

function HomeTab() {
  return (
    <>
      <Card titulo="Sua pesquisa está em andamento" eyebrow="Status">
        <Badge tom="ok">Caso ativo</Badge>
        <div className="mt-3">
          <Barra valor={65} rotulo="Progresso da jornada" />
        </div>
      </Card>
      <Card titulo="Próximos passos" eyebrow="Você e nós">
        <Lista
          itens={[
            { titulo: "Enviar certidão de nascimento", nota: "Sua ação", badge: "Você", tom: "atencao" },
            { titulo: "Conferência de origem", nota: "Nossa equipe", badge: "Nós", tom: "neutro" },
            { titulo: "Preparação da próxima entrega", nota: "Em curso", badge: "Nós", tom: "neutro" },
          ]}
        />
      </Card>
      <Card titulo="12 pessoas conectadas" eyebrow="Pessoas">
        <p className="text-sm text-navy/70">Cada nome recuperado é um elo a mais na sua história.</p>
      </Card>
      <Card titulo="Recebidos recentemente" eyebrow="Entregas">
        <Lista
          itens={[
            { titulo: "Achado comentado", nota: "Registro de 1887" },
            { titulo: "Nota de contexto", nota: "Origem do sobrenome" },
          ]}
        />
      </Card>
    </>
  );
}

function JornadaTab() {
  const historia = ["1820 — origem registrada", "1887 — registro civil", "1923 — travessia", "1965 — nova cidade", "2024 — sua busca começa"];
  const caso = ["Diagnóstico", "Pesquisa Fase 01", "Conferência", "Entrega em preparação"];
  return (
    <>
      <Card titulo="Sua Jornada" eyebrow="Duas linhas que se encontram">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-navy/45">História</p>
            {historia.map((h, i) => (
              <div key={h} className="border-l-2 border-gold pl-3 text-sm text-navy/80">
                {h}
                {(i === 1 || i === 3) && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] text-terracotta">
                    <span className="size-1.5 rounded-full bg-terracotta" /> União de Ramos
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-navy/45">Seu caso</p>
            {caso.map((c) => (
              <div key={c} className="border-l-2 border-navy/20 pl-3 text-sm text-navy/80">
                {c}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

function RadarTab() {
  const eixos = ["Documentação", "Origem", "Conexões", "Elegibilidade", "Memória", "Legado"];
  const valores = [72, 85, 64, 58, 45, 30];
  return (
    <>
      <Card titulo="Radar da Jornada" eyebrow="Leitura de origem">
        <RadarSvg eixos={eixos} series={[{ nome: "Você", cor: "#FCB73A", valores }]} />
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {eixos.map((e, i) => (
          <Card key={e} className="p-3">
            <p className="text-xs text-navy/60">{e}</p>
            <p className="font-serif text-xl text-navy">{valores[i]}%</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function ArvoreTab() {
  const geracoes: [string, number][] = [
    ["G1 — você", 1],
    ["G2 — pais", 2],
    ["G3 — avós", 4],
    ["G4 — bisavós", 4],
    ["G5 — ancestrais", 3],
  ];
  return (
    <Card titulo="Árvore Familiar" eyebrow="12 pessoas conectadas">
      <div className="space-y-4">
        {geracoes.map(([g, n], gi) => (
          <div key={g}>
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-navy/45">{g}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: n }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full border text-[10px] text-navy/70",
                    gi === 2 && i === 1 ? "border-2 border-gold bg-gold/10" : "border-navy/15 bg-cream",
                    gi === 4 && i === 0 ? "border-2 border-gold bg-gold/10" : "",
                  )}
                >
                  {gi === 2 && i === 1 ? "conectado" : gi === 4 && i === 0 ? "conectado" : "—"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DocumentosTab() {
  return (
    <Card titulo="Documentos" eyebrow="Seu acervo">
      <Lista
        itens={[
          { titulo: "Certidão de nascimento — Ana", nota: "12/07/2026", badge: "Entregue", tom: "ok" },
          { titulo: "Registro civil 1887", nota: "02/08/2026", badge: "Entregue", tom: "ok" },
          { titulo: "Nota de contexto", nota: "10/08/2026", badge: "Entregue", tom: "ok" },
          { titulo: "Certidão de casamento", nota: "Aguardando você", badge: "Pendente", tom: "atencao" },
          { titulo: "Documento de identidade", nota: "Aguardando você", badge: "Pendente", tom: "atencao" },
          { titulo: "Registro paroquial", nota: "Em conferência", badge: "Em revisão", tom: "neutro" },
        ]}
      />
    </Card>
  );
}

function LegadoTab() {
  return (
    <Card titulo="Seu Legado" eyebrow="Biblioteca da jornada">
      <Vazio texto="Ainda não há conteúdo de legado publicado. Assim que houver, ele aparece aqui." />
    </Card>
  );
}
