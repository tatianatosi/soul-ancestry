/**
 * Kit visual do App Cliente (VISUAL-ONLY).
 *
 * Sete abas aprovadas do mockup: Home · Jornada · Radar · Árvore ·
 * Documentos · Legado · Conta. Sem backend, sem dado real, sem rota nova
 * de produto. Serve para aprovação visual e adaptação no Soul Ancestry.
 */
import type { ReactNode } from "react";
import { Home, Route as RouteIcon, Radar, Network, FileText, BookOpen, UserRound } from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { KitBadge, KitCard, KitEmptyState, KitTable, type KitTone } from "./base";
import { ContentShelf, type ContentKind } from "./conteudo";
import { MiniFamilyTree, PersonNode, ResearchArtifactCard, type GenealogyPerson } from "./genealogia";
import { JourneyProgress, MicrodeliveryCard, NextActionCard, type JourneyStep } from "./jornada";
import { RadarChart, type RadarAxis } from "./visualizacao";
import { TimelineVertical } from "./kit-exportavel";

export const ABAS_KIT_APP_CLIENTE = [
  { id: "home", label: "Home", icon: Home },
  { id: "jornada", label: "Jornada", icon: RouteIcon },
  { id: "radar", label: "Radar", icon: Radar },
  { id: "arvore", label: "Árvore", icon: Network },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "legado", label: "Legado", icon: BookOpen },
  { id: "conta", label: "Conta", icon: UserRound },
] as const;

export type AbaKitAppCliente = (typeof ABAS_KIT_APP_CLIENTE)[number]["id"];

export const DIMENSOES_RADAR_CLIENTE = [
  "Documentação",
  "Origem",
  "Conexões Familiares",
  "Elegibilidade",
  "Memória",
  "Legado",
] as const;

export type ValoresRadarCliente = Record<
  "documentacao" | "origem" | "conexoes" | "elegibilidade" | "memoria" | "legado",
  number
>;

export function ClienteTopbar({ titulo, saudacao }: { titulo: string; saudacao?: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-navy/10 bg-card px-4 py-3">
      <BrandLogo size={30} showText={false} />
      <div className="min-w-0">
        <p className="truncate font-serif text-lg text-navy">{titulo}</p>
        {saudacao ? <p className="truncate text-xs text-navy/55">{saudacao}</p> : null}
      </div>
    </header>
  );
}

export function ClienteTabBar({
  active,
  onSelect,
}: {
  active: AbaKitAppCliente;
  onSelect?: (id: AbaKitAppCliente) => void;
}) {
  return (
    <nav aria-label="Navegação do App Cliente" className="sticky bottom-0 z-30 grid grid-flow-col border-t border-navy/10 bg-card px-1 py-1">
      {ABAS_KIT_APP_CLIENTE.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="sm"
          aria-current={id === active ? "page" : undefined}
          onClick={() => onSelect?.(id)}
          className={cn(
            "h-12 min-w-0 flex-col gap-0.5 px-1 text-[10px]",
            id === active ? "bg-gold/20 text-navy" : "text-navy/55",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          <span className="max-w-full truncate">{label}</span>
        </Button>
      ))}
    </nav>
  );
}

function Tela({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 p-4">
      <div>
        <h2 className="font-serif text-2xl text-navy">{titulo}</h2>
        {descricao ? <p className="mt-1 text-sm text-navy/60">{descricao}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** 1 · Home — etapa, próxima ação e microentrega publicada. Nunca alerta interno. */
export function ClienteHomeTemplate({
  etapa,
  progresso,
  acao,
  microentrega,
}: {
  etapa: string;
  progresso: number;
  acao: { action: string; owner?: string; due?: string };
  microentrega?: { title: string; state: string; publishedAt?: string };
}) {
  return (
    <Tela titulo="Sua jornada ancestral" descricao={`Etapa atual: ${etapa}`}>
      <KitCard title="Onde você está">
        <JourneyProgress label="Progresso do estudo" value={progresso} />
      </KitCard>
      <NextActionCard {...acao} />
      {microentrega ? (
        <MicrodeliveryCard {...microentrega} />
      ) : (
        <KitEmptyState title="Nenhuma entrega publicada ainda" description="Assim que uma entrega for publicada, ela aparece aqui." />
      )}
    </Tela>
  );
}

/** 2 · Jornada — linha do tempo das etapas. */
export function ClienteJornadaTemplate({ etapas, acao }: { etapas: JourneyStep[]; acao?: { action: string; owner?: string; due?: string } }) {
  return (
    <Tela titulo="Jornada" descricao="As etapas do seu estudo, do início ao reconhecimento.">
      <KitCard title="Linha do tempo">
        <TimelineVertical steps={etapas} />
      </KitCard>
      {acao ? <NextActionCard {...acao} /> : null}
    </Tela>
  );
}

/** 3 · Radar — seis dimensões do cliente, sem juízo de mérito. */
export function ClienteRadarTemplate({ eixos, leitura }: { eixos: RadarAxis[]; leitura?: string }) {
  return (
    <Tela titulo="Radar" descricao="Uma leitura visual do que já foi reunido no seu estudo.">
      <KitCard title="Dimensões do seu estudo">
        <RadarChart axes={eixos} label="Radar do cliente" />
      </KitCard>
      <KitCard title="Como ler">
        <p className="text-sm text-navy/70">{leitura ?? "Cada eixo mostra o quanto já foi reunido naquela frente. O radar não indica chance de resultado."}</p>
      </KitCard>
    </Tela>
  );
}

/** Variante canônica: fixa nomes e ordem das seis dimensões públicas. */
export function ClienteRadarSeisDimensoes({ valores, leitura }: { valores: ValoresRadarCliente; leitura?: string }) {
  const eixos: RadarAxis[] = [
    { label: DIMENSOES_RADAR_CLIENTE[0], value: valores.documentacao },
    { label: DIMENSOES_RADAR_CLIENTE[1], value: valores.origem },
    { label: DIMENSOES_RADAR_CLIENTE[2], value: valores.conexoes },
    { label: DIMENSOES_RADAR_CLIENTE[3], value: valores.elegibilidade },
    { label: DIMENSOES_RADAR_CLIENTE[4], value: valores.memoria },
    { label: DIMENSOES_RADAR_CLIENTE[5], value: valores.legado },
  ];
  return <ClienteRadarTemplate eixos={eixos} leitura={leitura} />;
}

/** 4 · Árvore — pessoas e vínculos aprovados para o cliente. */
export function ClienteArvoreTemplate({ pessoas, destaque }: { pessoas: GenealogyPerson[]; destaque?: GenealogyPerson }) {
  return (
    <Tela titulo="Árvore" descricao="Pessoas e vínculos confirmados no seu estudo.">
      {destaque ? (
        <KitCard title="Em foco">
          <PersonNode person={destaque} selected />
        </KitCard>
      ) : null}
      <KitCard title="Vínculos">
        {pessoas.length ? <MiniFamilyTree people={pessoas} /> : <KitEmptyState title="Árvore em construção" description="As pessoas aparecem aqui conforme são confirmadas." />}
      </KitCard>
    </Tela>
  );
}

/** 5 · Documentos — só documentos publicados para o cliente. */
export function ClienteDocumentosTemplate({ documentos }: { documentos: Array<{ title: string; detail?: string; status?: string }> }) {
  return (
    <Tela titulo="Documentos" descricao="Os documentos publicados para você.">
      {documentos.length ? (
        <div className="space-y-2">
          {documentos.map((doc) => (
            <ResearchArtifactCard key={doc.title} kind="Documento" {...doc} />
          ))}
        </div>
      ) : (
        <KitEmptyState title="Nenhum documento publicado" description="Quando um documento for publicado para você, ele aparece nesta aba." />
      )}
    </Tela>
  );
}

/** 6 · Legado — conteúdo narrativo publicado. */
export function ClienteLegadoTemplate({ itens }: { itens: { id: string; kind: ContentKind; title: string; subtitle?: string; state?: string }[] }) {
  return (
    <Tela titulo="Legado" descricao="Memórias, narrativas e cadernos do seu estudo.">
      <ContentShelf title="Publicados para você" items={itens} />
    </Tela>
  );
}

/** 7 · Conta — dados do titular, acesso e documentos contratuais. */
export function ClienteContaTemplate({
  titular,
  campos,
  linhas,
  estado,
}: {
  titular: string;
  campos: Array<{ rotulo: string; valor: string }>;
  linhas: ReactNode[][];
  estado?: { texto: string; tom?: KitTone };
}) {
  return (
    <Tela titulo="Conta" descricao={`Titular: ${titular}`}>
      <KitCard title="Seus dados" action={estado ? <KitBadge tone={estado.tom ?? "success"}>{estado.texto}</KitBadge> : undefined}>
        <dl className="space-y-2 text-sm">
          {campos.map((campo) => (
            <div key={campo.rotulo} className="flex justify-between gap-3 border-b border-navy/5 pb-2 last:border-0">
              <dt className="text-navy/60">{campo.rotulo}</dt>
              <dd className="text-right font-medium text-navy">{campo.valor}</dd>
            </div>
          ))}
        </dl>
      </KitCard>
      <KitCard title="Documentos da contratação">
        {linhas.length ? (
          <KitTable columns={["Documento", "Data", "Estado"]} rows={linhas} />
        ) : (
          <KitEmptyState title="Sem documentos" description="Nenhum documento de contratação disponível." />
        )}
      </KitCard>
    </Tela>
  );
}

export const KIT_APP_CLIENTE_COMPONENTS = [
  "ClienteTopbar",
  "ClienteTabBar",
  "ClienteHomeTemplate",
  "ClienteJornadaTemplate",
  "ClienteRadarTemplate",
  "ClienteRadarSeisDimensoes",
  "ClienteArvoreTemplate",
  "ClienteDocumentosTemplate",
  "ClienteLegadoTemplate",
  "ClienteContaTemplate",
] as const;
