/**
 * PRÉVIA VISUAL DO DESK — conversão das telas do mockup aprovado em
 * superfícies reais do Desk, com o guia de marca oficial (navy #2F4B6E,
 * dourado #FCB73A, creme #ECDFCD, terracota #9A3A2F), logo oficial
 * (<BrandLogo />) e tipografia Cormorant (títulos) + Montserrat (corpo).
 *
 * Regras respeitadas:
 * - Só apresentação. Nenhuma leitura, escrita, gate, RLS ou ação externa.
 * - Todo dado exibido é demonstrativo e está rotulado como tal.
 * - Navegação canônica do Desk (6 grupos) preservada; nenhuma aba nova.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  LayoutDashboard,
  Target,
  FolderOpen,
  Library,
  Paperclip,
  Scale,
  ShieldCheck,
  Search,
  UserRound,
  ChevronDown,
  MapPin,
  Star,
  Users,
  LockKeyhole,
} from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { cn } from "@/lib/utils";
import { CASO_DEMO_CODIGO, CASO_DEMO_TITULO, CLIENTE_DEMO_NOME } from "@/lib/portal-demo-sophia";

type Tom = "neutro" | "critico" | "atencao" | "sucesso";

const TOM: Record<Tom, string> = {
  neutro: "border-navy/15 bg-cream/70 text-navy/75",
  critico: "border-critico/30 bg-critico-suave text-critico",
  atencao: "border-atencao/30 bg-atencao-suave text-atencao",
  sucesso: "border-sucesso/30 bg-sucesso-suave text-sucesso",
};

function Etiqueta({ texto, tom = "neutro" }: { texto: string; tom?: Tom }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        TOM[tom],
      )}
    >
      {texto}
    </span>
  );
}

function Cartao({
  titulo,
  children,
  className,
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-navy/10 bg-card p-4 shadow-[0_1px_2px_rgba(16,16,16,0.05)]",
        className,
      )}
    >
      <h3 className="mb-3 font-serif text-base leading-none text-navy">{titulo}</h3>
      {children}
    </section>
  );
}

function Linha({
  rotulo,
  valor,
  tom,
}: {
  rotulo: string;
  valor?: string;
  tom?: Tom;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy/5 py-1.5 last:border-0">
      <span className="min-w-0 truncate text-xs text-navy/80">{rotulo}</span>
      {valor ? <Etiqueta texto={valor} tom={tom} /> : null}
    </div>
  );
}

function Indicador({ rotulo, valor, apoio }: { rotulo: string; valor: string; apoio?: string }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/55">{rotulo}</p>
      <p className="mt-1 font-serif text-2xl leading-none tabular-nums text-navy">{valor}</p>
      {apoio ? <p className="mt-1 text-[11px] text-navy/55">{apoio}</p> : null}
    </div>
  );
}

type EixoGrafico = { rotulo: string; valor: number };

function RadarGrafico({
  eixos,
  tituloAcessivel,
}: {
  eixos: EixoGrafico[];
  tituloAcessivel: string;
}) {
  const centro = 120;
  const raio = 78;
  const ponto = (indice: number, valor: number) => {
    const angulo = (-90 + indice * (360 / eixos.length)) * (Math.PI / 180);
    const distancia = raio * (valor / 100);
    return {
      x: centro + distancia * Math.cos(angulo),
      y: centro + distancia * Math.sin(angulo),
    };
  };
  const poligono = (valor: number) =>
    eixos.map((_, indice) => {
      const p = ponto(indice, valor);
      return `${p.x},${p.y}`;
    }).join(" ");
  const dados = eixos.map((eixo, indice) => {
    const p = ponto(indice, eixo.valor);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <figure>
      <svg
        viewBox="-42 -28 324 306"
        className="mx-auto block w-full max-w-[350px]"
        role="img"
        aria-label={tituloAcessivel}
      >
        {[25, 50, 75, 100].map((nivel) => (
          <polygon
            key={nivel}
            points={poligono(nivel)}
            fill="none"
            stroke="currentColor"
            className="text-navy/15"
            strokeWidth={nivel === 100 ? 1.4 : 1}
          />
        ))}
        {eixos.map((_, indice) => {
          const p = ponto(indice, 100);
          return (
            <line
              key={indice}
              x1={centro}
              y1={centro}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              className="text-navy/15"
            />
          );
        })}
        <polygon
          points={dados}
          className="fill-gold/30 stroke-navy"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {eixos.map((eixo, indice) => {
          const p = ponto(indice, eixo.valor);
          const rotulo = ponto(indice, 124);
          const angulo = -90 + indice * (360 / eixos.length);
          const ancora = angulo > -78 && angulo < 78 ? "start" : angulo > 102 && angulo < 258 ? "end" : "middle";
          return (
            <g key={eixo.rotulo}>
              <circle cx={p.x} cy={p.y} r={4} className="fill-card stroke-navy" strokeWidth={2} />
              <text
                x={rotulo.x}
                y={rotulo.y - 4}
                textAnchor={ancora}
                dominantBaseline="middle"
                className="fill-navy text-[10px] font-medium"
              >
                {eixo.rotulo}
              </text>
              <text
                x={rotulo.x}
                y={rotulo.y + 10}
                textAnchor={ancora}
                dominantBaseline="middle"
                className="fill-navy/60 text-[9px]"
              >
                {eixo.valor}%
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-navy/60">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-navy bg-gold/30" />Leitura atual</span>
        <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-navy/30" />Faixas de 25%</span>
      </figcaption>
    </figure>
  );
}

function MatrizGrafica() {
  const clientes = [
    { nome: "Beatriz Lima", x: 70, y: 14, tom: "fill-critico", prioridade: "1" },
    { nome: "Diego Nogueira", x: 58, y: 18, tom: "fill-critico", prioridade: "2" },
    { nome: "Helena Duarte", x: 53, y: 25, tom: "fill-critico", prioridade: "3" },
    { nome: "Otávio Pires", x: 76, y: 30, tom: "fill-atencao", prioridade: "4" },
    { nome: "Ricardo Vieira", x: 63, y: 43, tom: "fill-atencao", prioridade: "5" },
    { nome: "Sofia Mendes", x: 39, y: 49, tom: "fill-atencao", prioridade: "6" },
    { nome: "João Ferreira", x: 48, y: 60, tom: "fill-atencao", prioridade: "7" },
    { nome: "Marina Alves", x: 87, y: 54, tom: "fill-sucesso", prioridade: "8" },
    { nome: "Luana Braga", x: 90, y: 65, tom: "fill-sucesso", prioridade: "9" },
    { nome: "Camila Santos", x: 93, y: 71, tom: "fill-sucesso", prioridade: "10" },
    { nome: "Paulo Neto", x: 80, y: 85, tom: "fill-sucesso", prioridade: "11" },
  ] as const;

  return (
    <figure>
      <svg
        viewBox="0 0 620 430"
        role="img"
        aria-label="Matriz de prioridade com cada cliente identificado por nome, ordenada por urgência e elegibilidade"
        className="block w-full"
      >
        <rect x="58" y="34" width="252" height="170" className="fill-terracotta/5" />
        <rect x="310" y="34" width="252" height="170" className="fill-gold/10" />
        <rect x="58" y="204" width="252" height="170" className="fill-terracotta/[0.025]" />
        <rect x="310" y="204" width="252" height="170" className="fill-sucesso/5" />
        <line x1="58" y1="374" x2="562" y2="374" className="stroke-navy" strokeWidth="1.5" />
        <line x1="58" y1="34" x2="58" y2="374" className="stroke-navy" strokeWidth="1.5" />
        <line x1="310" y1="34" x2="310" y2="374" className="stroke-navy/10" />
        <line x1="58" y1="204" x2="562" y2="204" className="stroke-navy/10" />

        <text x="184" y="54" textAnchor="middle" className="fill-terracotta text-[11px] font-semibold uppercase">Avaliar</text>
        <text x="436" y="54" textAnchor="middle" className="fill-navy text-[11px] font-semibold uppercase">Agir agora</text>
        <text x="184" y="360" textAnchor="middle" className="fill-terracotta text-[11px] font-semibold uppercase">Monitorar</text>
        <text x="436" y="360" textAnchor="middle" className="fill-sucesso text-[11px] font-semibold uppercase">Cultivar</text>

        {clientes.map((cliente) => {
          const x = 58 + (cliente.x / 100) * 504;
          const y = 34 + (cliente.y / 100) * 340;
          const ancora = cliente.x > 86 ? "end" : "start";
          const deslocamento = cliente.x > 86 ? -10 : 10;
          return (
            <g key={cliente.nome}>
              <circle cx={x} cy={y} r="7" className={cn(cliente.tom, "stroke-card")} strokeWidth="2" />
              <text x={x} y={y + 3} textAnchor="middle" className="fill-card text-[7px] font-bold">{cliente.prioridade}</text>
              <text x={x + deslocamento} y={y + 4} textAnchor={ancora} className="fill-navy text-[10px] font-medium">{cliente.nome}</text>
            </g>
          );
        })}

        <text x="310" y="414" textAnchor="middle" className="fill-navy/60 text-[11px]">Elegibilidade →</text>
        <text x="17" y="204" textAnchor="middle" transform="rotate(-90 17 204)" className="fill-navy/60 text-[11px]">Urgência →</text>
      </svg>
      <figcaption className="mt-3 grid gap-3 border-t border-navy/10 pt-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="text-[10px] font-semibold uppercase text-navy/55">Ordem de atendimento</p>
          <p className="mt-1 text-[11px] text-navy">1. Beatriz Lima · 2. Diego Nogueira · 3. Helena Duarte</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] text-navy/60">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-critico" />Crítico</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-atencao" />Atenção</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sucesso" />Saudável</span>
        </div>
      </figcaption>
    </figure>
  );
}

function LinhaTempoGrafica() {
  const etapas = [
    ["Contrato", "21/03", true],
    ["Onboarding", "04/04", true],
    ["Pesquisa", "18/05", false],
    ["Certidões", "02/06", false],
  ] as const;
  return (
    <ol className="grid grid-cols-4 gap-0 pt-3">
      {etapas.map(([nome, data, concluida], indice) => (
        <li key={nome} className="relative text-center">
          {indice > 0 ? <span className={cn("absolute left-0 top-2 h-0.5 w-1/2", concluida ? "bg-sucesso" : "bg-navy/15")} /> : null}
          {indice < etapas.length - 1 ? <span className={cn("absolute right-0 top-2 h-0.5 w-1/2", concluida ? "bg-sucesso" : "bg-navy/15")} /> : null}
          <span className={cn("relative mx-auto block h-4 w-4 rounded-full border-2 border-card ring-1", concluida ? "bg-sucesso ring-sucesso" : "bg-gold ring-gold")} />
          <p className="mt-2 text-[10px] font-medium text-navy">{nome}</p>
          <p className="text-[9px] text-navy/50">{data}</p>
        </li>
      ))}
    </ol>
  );
}

function ArvoreFamiliaGrafica() {
  return (
    <div className="mx-auto grid max-w-lg grid-cols-4 grid-rows-[auto_28px_auto_28px_auto] items-center text-center">
      <div className="col-span-2"><Pessoa nome="Carlo Piccoli" papel="Ascendente" /></div>
      <div className="col-span-2"><Pessoa nome="Elena Rossi" papel="Cônjuge" /></div>
      <div className="col-span-4 mx-auto h-7 w-px bg-gold" />
      <div className="col-span-2 col-start-2 rounded-lg border border-gold/50 bg-gold/10 p-2"><Pessoa nome="Sophia Piccoli" papel="Requerente" /></div>
      <div className="col-span-4 mx-auto h-7 w-px bg-gold" />
      <div className="col-span-2"><Pessoa nome="Marina Piccoli" papel="Dependente" /></div>
      <div className="col-span-2"><Pessoa nome="João Piccoli" papel="Dependente" /></div>
    </div>
  );
}

function ProgressoJornadaGrafico() {
  const etapas = ["Assinatura", "Onboarding", "Documentos", "Protocolo"];
  return (
    <div className="relative grid grid-cols-4 gap-2 pt-2">
      <div className="absolute left-[12.5%] right-[12.5%] top-[17px] h-1 rounded-full bg-navy/10">
        <div className="h-full w-[67%] rounded-full bg-gold" />
      </div>
      {etapas.map((etapa, indice) => (
        <div key={etapa} className="relative text-center">
          <span className={cn("mx-auto grid h-6 w-6 place-items-center rounded-full border-2 border-card text-[9px] font-semibold ring-1", indice < 2 ? "bg-navy text-primary-foreground ring-navy" : indice === 2 ? "bg-gold text-navy ring-gold" : "bg-card text-navy/50 ring-navy/20")}>{indice + 1}</span>
          <p className="mt-2 text-[10px] font-medium text-navy">{etapa}</p>
          <p className="mt-0.5 text-[9px] text-navy/50">{indice < 2 ? "Concluído" : indice === 2 ? "Em andamento" : "A iniciar"}</p>
        </div>
      ))}
    </div>
  );
}

function Pessoa({ nome, papel }: { nome: string; papel: string }) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 bg-navy text-[11px] font-medium text-gold">
        {iniciais}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-navy">{nome}</span>
        <span className="block truncate text-[10px] text-navy/55">{papel}</span>
      </span>
    </div>
  );
}

function CabecalhoFerramenta({
  titulo,
  apoio,
  acao,
}: {
  titulo: string;
  apoio: string;
  acao: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy/10 bg-card p-3">
      <div>
        <h2 className="font-serif text-lg text-navy">{titulo}</h2>
        <p className="text-[11px] text-navy/55">{apoio}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-[10px] text-navy/65">
          <Filter className="h-3 w-3" aria-hidden /> Filtros
        </span>
        <span className="rounded-md bg-navy px-2.5 py-1 text-[10px] font-medium text-primary-foreground">{acao}</span>
      </div>
    </div>
  );
}

type CartaoKanban = {
  titulo: string;
  contexto: string;
  responsavel: string;
  prazo: string;
  etiqueta: string;
  proximoPasso?: string;
  alerta?: string;
  tom?: Tom;
  anexos?: number;
};

function KanbanVisual({
  colunas,
}: {
  colunas: { titulo: string; cartoes: CartaoKanban[] }[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {colunas.map((coluna) => (
        <section key={coluna.titulo} className="min-w-0 rounded-lg border border-navy/10 bg-cream/45 p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-navy/10 pb-2">
            <h3 className="truncate text-[11px] font-semibold uppercase text-navy/65">{coluna.titulo}</h3>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-card px-1 text-[9px] font-semibold text-navy">
              {coluna.cartoes.length}
            </span>
          </div>
          <div className="space-y-2">
            {coluna.cartoes.map((cartao) => (
              <article key={`${coluna.titulo}-${cartao.titulo}`} className="rounded-lg border border-navy/10 bg-card p-2.5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold leading-snug text-navy">{cartao.titulo}</p>
                  {cartao.anexos ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-navy/45">
                      <Paperclip className="h-3 w-3" aria-hidden /> {cartao.anexos}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[10px] leading-snug text-navy/55">{cartao.contexto}</p>
                {cartao.proximoPasso ? (
                  <p className="mt-2 border-t border-navy/5 pt-2 text-[10px] leading-snug text-navy/70">
                    <span className="font-semibold text-navy">Próximo passo:</span> {cartao.proximoPasso}
                  </p>
                ) : null}
                {cartao.alerta ? (
                  <p className="mt-2 rounded-md border border-atencao/30 bg-atencao-suave px-2 py-1 text-[9px] font-medium text-atencao">
                    {cartao.alerta}
                  </p>
                ) : null}
                <div className="mt-2"><Etiqueta texto={cartao.etiqueta} tom={cartao.tom} /></div>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-navy/5 pt-2 text-[9px] text-navy/50">
                  <span className="inline-flex min-w-0 items-center gap-1 truncate">
                    <UserRound className="h-3 w-3 shrink-0" aria-hidden /> {cartao.responsavel}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <Clock3 className="h-3 w-3" aria-hidden /> {cartao.prazo}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MedidorConfianca({ valor }: { valor: number }) {
  const raio = 32;
  const comprimento = 2 * Math.PI * raio;
  const restante = comprimento * (1 - valor / 100);
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0" role="img" aria-label={`Confiança ${valor}%`}>
        <circle cx="40" cy="40" r={raio} fill="none" className="stroke-navy/10" strokeWidth="8" />
        <circle cx="40" cy="40" r={raio} fill="none" className="stroke-gold" strokeWidth="8" strokeLinecap="round" strokeDasharray={comprimento} strokeDashoffset={restante} transform="rotate(-90 40 40)" />
        <text x="40" y="44" textAnchor="middle" className="fill-navy text-[14px] font-semibold">{valor}%</text>
      </svg>
      <div>
        <p className="text-xs font-semibold text-navy">Confiança da cadeia</p>
        <p className="mt-1 text-[10px] text-navy/55">Baseada em fontes revisadas e vínculos documentados.</p>
      </div>
    </div>
  );
}

function EstrelasConfianca({ valor }: { valor: number }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <div className="flex items-center gap-1" role="img" aria-label={`Confiança ${valor} de 5`}>
        {Array.from({ length: 5 }).map((_, indice) => (
          <Star
            key={indice}
            className={cn("h-4 w-4", indice < Math.round(valor) ? "fill-gold text-gold" : "text-navy/15")}
            aria-hidden
          />
        ))}
        <span className="ml-1 font-serif text-xl text-navy">{valor.toFixed(1)}</span>
      </div>
      <p className="mt-1 text-[10px] text-navy/55">Fontes conferidas e vínculos documentados</p>
    </div>
  );
}

function FilaPublicacao({ origem }: { origem: "Biblioteca" | "Portal interno" }) {
  const etapas = [
    { nome: "Rascunho", total: "2", tom: "neutro" as Tom },
    { nome: "Revisão", total: "1", tom: "atencao" as Tom },
    { nome: "Aprovado", total: "3", tom: "sucesso" as Tom },
    { nome: "Publicado", total: "5", tom: "sucesso" as Tom },
  ];

  return (
    <div>
      <p className="mb-3 text-[10px] text-navy/55">{origem} · conteúdo demonstrativo</p>
      <ol className="grid gap-2 sm:grid-cols-4">
        {etapas.map((etapa, indice) => (
          <li key={etapa.nome} className="relative rounded-lg border border-navy/10 bg-cream/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-navy">{etapa.nome}</span>
              <Etiqueta texto={etapa.total} tom={etapa.tom} />
            </div>
            {indice < etapas.length - 1 ? (
              <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-gold sm:block" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FunilVisual() {
  const etapas = [
    { nome: "Novos leads", valor: 58, largura: "w-full" },
    { nome: "Discovery", valor: 31, largura: "w-4/5" },
    { nome: "Diagnóstico", valor: 18, largura: "w-3/5" },
    { nome: "Cliente", valor: 7, largura: "w-2/5" },
  ];
  return (
    <figure role="img" aria-label="Funil comercial demonstrativo dos últimos trinta dias">
      <div className="space-y-2">
        {etapas.map((etapa, indice) => (
          <div key={etapa.nome} className={cn("mx-auto rounded-md border border-navy/10 px-3 py-2", etapa.largura, indice === etapas.length - 1 ? "bg-gold/35" : "bg-navy/[0.06]")}>
            <div className="flex items-center justify-between gap-2 text-[10px] text-navy">
              <span className="font-medium">{etapa.nome}</span>
              <span className="font-semibold tabular-nums">{etapa.valor}</span>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-[10px] text-navy/50">Últimos 30 dias · valores demonstrativos</figcaption>
    </figure>
  );
}

function BarrasHorizontais({
  itens,
  tituloAcessivel,
}: {
  itens: { rotulo: string; valor: number; apoio?: string; tom?: "navy" | "gold" | "terracotta" }[];
  tituloAcessivel: string;
}) {
  return (
    <figure role="img" aria-label={tituloAcessivel} className="space-y-3">
      {itens.map((item) => {
        const largura = Math.max(4, Math.min(100, item.valor));
        return (
          <div key={item.rotulo}>
            <div className="mb-1 flex items-center justify-between gap-3 text-[10px]">
              <span className="font-medium text-navy">{item.rotulo}</span>
              <span className="tabular-nums text-navy/55">{item.apoio ?? `${item.valor}%`}</span>
            </div>
            <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="h-2 w-full overflow-hidden rounded-full">
              <rect width="100" height="4" className="fill-navy/10" />
              <rect width={largura} height="4" rx="2" className={item.tom === "terracotta" ? "fill-terracotta" : item.tom === "gold" ? "fill-gold" : "fill-navy"} />
            </svg>
          </div>
        );
      })}
    </figure>
  );
}

function GraficoColunas({
  itens,
  tituloAcessivel,
}: {
  itens: { rotulo: string; valor: number; destaque?: boolean }[];
  tituloAcessivel: string;
}) {
  const maior = Math.max(...itens.map((item) => item.valor), 1);
  return (
    <figure role="img" aria-label={tituloAcessivel}>
      <div className="flex h-36 items-end gap-2 border-b border-l border-navy/15 px-2 pt-3">
        {itens.map((item) => (
          <div key={item.rotulo} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[9px] font-semibold tabular-nums text-navy/60">{item.valor}</span>
            <svg viewBox="0 0 32 96" preserveAspectRatio="none" className="h-24 w-full max-w-10 overflow-hidden rounded-t-sm">
              <rect x="0" y={96 - Math.max(10, (item.valor / maior) * 92)} width="32" height={Math.max(10, (item.valor / maior) * 92)} className={item.destaque ? "fill-gold" : "fill-navy/70"} />
            </svg>
            <span className="w-full truncate text-center text-[8px] text-navy/55">{item.rotulo}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

function SerieTendencia({
  valores,
  rotulos,
  tituloAcessivel,
}: {
  valores: number[];
  rotulos: string[];
  tituloAcessivel: string;
}) {
  const largura = 320;
  const altura = 112;
  const maximo = Math.max(...valores, 1);
  const minimo = Math.min(...valores, 0);
  const intervalo = Math.max(maximo - minimo, 1);
  const pontos = valores.map((valor, indice) => {
    const x = 18 + indice * ((largura - 36) / Math.max(valores.length - 1, 1));
    const y = altura - 22 - ((valor - minimo) / intervalo) * (altura - 42);
    return { x, y, valor };
  });
  return (
    <figure role="img" aria-label={tituloAcessivel}>
      <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full">
        {[28, 54, 80].map((y) => <line key={y} x1="12" x2={largura - 12} y1={y} y2={y} className="stroke-navy/10" />)}
        <polyline points={pontos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" className="stroke-terracotta" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {pontos.map((p, indice) => (
          <g key={`${rotulos[indice]}-${p.valor}`}>
            <circle cx={p.x} cy={p.y} r="4" className="fill-card stroke-terracotta" strokeWidth="2" />
            <text x={p.x} y={altura - 6} textAnchor="middle" className="fill-navy/55 text-[8px]">{rotulos[indice]}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

function DonutEstados({
  segmentos,
  tituloAcessivel,
}: {
  segmentos: { rotulo: string; valor: number; tom: "navy" | "gold" | "terracotta" | "sucesso" }[];
  tituloAcessivel: string;
}) {
  const total = segmentos.reduce((soma, item) => soma + item.valor, 0);
  let acumulado = 0;
  const classes = { navy: "stroke-navy", gold: "stroke-gold", terracotta: "stroke-terracotta", sucesso: "stroke-sucesso" } as const;
  return (
    <figure role="img" aria-label={tituloAcessivel} className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center">
      <svg viewBox="0 0 120 120" className="mx-auto h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r="42" fill="none" className="stroke-navy/10" strokeWidth="18" />
        {segmentos.map((segmento) => {
          const proporcao = total > 0 ? segmento.valor / total : 0;
          const inicio = acumulado;
          acumulado += proporcao;
          return (
            <circle
              key={segmento.rotulo}
              cx="60"
              cy="60"
              r="42"
              fill="none"
              className={classes[segmento.tom]}
              strokeWidth="18"
              strokeDasharray={`${proporcao * 263.89} 263.89`}
              strokeDashoffset={-inicio * 263.89}
            />
          );
        })}
      </svg>
      <figcaption className="space-y-2">
        {segmentos.map((segmento) => (
          <div key={segmento.rotulo} className="flex items-center justify-between gap-3 text-[10px]">
            <span className="flex items-center gap-2 text-navy/65"><span className={cn("h-2.5 w-2.5 rounded-sm", segmento.tom === "navy" ? "bg-navy" : segmento.tom === "gold" ? "bg-gold" : segmento.tom === "terracotta" ? "bg-terracotta" : "bg-sucesso")} />{segmento.rotulo}</span>
            <strong className="tabular-nums text-navy">{segmento.valor}</strong>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

function RedeNucleoGrafica() {
  return (
    <figure role="img" aria-label="Rede demonstrativa de pessoas, núcleos e casos" className="relative mx-auto h-56 max-w-xl overflow-hidden rounded-lg border border-navy/10 bg-cream/35">
      <svg viewBox="0 0 520 220" className="h-full w-full">
        <g className="stroke-gold/60" strokeWidth="2">
          <line x1="260" y1="110" x2="105" y2="52" /><line x1="260" y1="110" x2="410" y2="48" />
          <line x1="260" y1="110" x2="110" y2="174" /><line x1="260" y1="110" x2="408" y2="176" />
          <line x1="105" y1="52" x2="410" y2="48" className="stroke-navy/15" />
        </g>
        {[
          { x: 260, y: 110, sigla: "SP", destaque: true }, { x: 105, y: 52, sigla: "CP" },
          { x: 410, y: 48, sigla: "ER" }, { x: 110, y: 174, sigla: "MP" }, { x: 408, y: 176, sigla: "JP" },
        ].map((no) => <g key={no.sigla}><circle cx={no.x} cy={no.y} r={no.destaque ? 27 : 22} className={no.destaque ? "fill-gold stroke-navy" : "fill-card stroke-navy/40"} strokeWidth="2" /><text x={no.x} y={no.y + 4} textAnchor="middle" className="fill-navy text-[11px] font-semibold">{no.sigla}</text></g>)}
      </svg>
      <figcaption className="absolute bottom-2 left-3 text-[9px] text-navy/50">Vínculos demonstrativos · pessoa central, ascendentes e dependentes</figcaption>
    </figure>
  );
}

function JornadaD0Visual() {
  const marcos = [
    { nome: "D0", apoio: "Aceite", estado: "feito" },
    { nome: "D14", apoio: "Onboarding", estado: "feito" },
    { nome: "D60", apoio: "Pesquisa", estado: "atual" },
    { nome: "D180", apoio: "Documentos", estado: "futuro" },
    { nome: "D365", apoio: "Encerramento", estado: "futuro" },
  ];
  return (
    <div>
      <div className="relative grid grid-cols-5 gap-1 pt-2">
        <div className="absolute left-[10%] right-[10%] top-[19px] h-1 rounded-full bg-navy/10"><div className="h-full w-[43%] rounded-full bg-gold" /></div>
        {marcos.map((marco) => (
          <div key={marco.nome} className="relative text-center">
            <span className={cn("mx-auto grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[9px] font-semibold ring-1", marco.estado === "feito" ? "bg-navy text-primary-foreground ring-navy" : marco.estado === "atual" ? "bg-gold text-navy ring-gold" : "bg-card text-navy/45 ring-navy/20")}>{marco.nome}</span>
            <p className="mt-2 text-[9px] font-medium text-navy">{marco.apoio}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        <Linha rotulo="Etapa atual" valor="Pesquisa" tom="atencao" />
        <Linha rotulo="Cadência" valor="Em dia" tom="sucesso" />
        <Linha rotulo="Próxima ação" valor="Revisar fonte" />
        <Linha rotulo="Microentrega" valor="Síntese" />
        <Linha rotulo="Alertas" valor="1 prazo" tom="atencao" />
      </div>
    </div>
  );
}

function ArvoreCincoGeracoes() {
  const geracoes = [
    ["G5", "Antônio R. · 1860", "Isabel F. · 1887"],
    ["G4", "Carlo Piccoli · 1891", "Elena Rossi · 1895"],
    ["G3", "Luigi Piccoli · 1923", "Rosa Moretti · 1927"],
    ["G2", "Paulo Piccoli · 1965", "Marta Costa · 1968"],
    ["G1", "Sophia Piccoli", "Marina Piccoli"],
  ];
  return (
    <div className="space-y-1.5">
      {geracoes.map(([geracao, pessoaA, pessoaB], indice) => (
        <div key={geracao} className="relative grid grid-cols-[2.5rem_1fr_1fr] items-center gap-2">
          <span className="text-[9px] font-semibold text-gold">{geracao}</span>
          <span className={cn("rounded-md border px-2 py-1.5 text-[9px] text-navy", indice < 2 ? "border-gold/40 bg-gold/10" : "border-navy/10 bg-cream/40")}>{pessoaA}</span>
          <span className="rounded-md border border-navy/10 bg-cream/40 px-2 py-1.5 text-[9px] text-navy">{pessoaB}</span>
        </div>
      ))}
    </div>
  );
}

function AppClienteSeteTelas() {
  const ALTURA_RADAR = ["h-7", "h-8", "h-6", "h-7", "h-5", "h-4"] as const;
  const telas = [
    { nome: "Home", detalhe: "Etapa, progresso, próxima ação e achado publicado", valor: "65%" },
    { nome: "Jornada", detalhe: "Linha ancestral 1820–2024 e linha do caso", valor: "7 marcos" },
    { nome: "Radar", detalhe: "Documentação, origem, conexões, elegibilidade, memória e legado", valor: "6 eixos" },
    { nome: "Árvore", detalhe: "G1–G5, conexão-chave, território e pendência", valor: "12 pessoas" },
    { nome: "Documentos", detalhe: "Solicitados, recebidos e liberados", valor: "4/10" },
    { nome: "Legado", detalhe: "Achados publicados e continuidade da jornada", valor: "3 peças" },
    { nome: "Conta", detalhe: "Perfil, plano, alertas do cliente e histórico", valor: "Ativo" },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-navy p-4 text-primary-foreground">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">App Cliente · 7 telas aprovadas</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div><h2 className="font-serif text-2xl">Sua jornada ancestral</h2><p className="mt-1 text-xs text-primary-foreground/70">Somente informações publicadas e autorizadas.</p></div>
          <Etiqueta texto="Caso ativo" tom="sucesso" />
        </div>
        <div className="mt-4"><ProgressoJornadaGrafico /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {telas.map((tela, indice) => (
          <article key={tela.nome} className={cn("rounded-xl border p-3", indice === 0 ? "border-gold/60 bg-gold/10" : "border-navy/10 bg-card")}>
            <div className="flex items-start justify-between gap-2"><h3 className="font-serif text-base text-navy">{tela.nome}</h3><span className="text-[10px] font-semibold text-gold">{tela.valor}</span></div>
            <p className="mt-2 text-[10px] leading-relaxed text-navy/60">{tela.detalhe}</p>
            {tela.nome === "Radar" ? <div className="mt-3 flex h-8 items-end gap-1">{[78, 90, 65, 72, 55, 40].map((valor, eixo) => <span key={valor} className={cn("min-w-0 flex-1 rounded-sm bg-gold/30", ALTURA_RADAR[eixo])} />)}</div> : null}
            {tela.nome === "Árvore" ? <div className="mt-3"><ArvoreCincoGeracoes /></div> : null}
          </article>
        ))}
      </div>
      <nav aria-label="Navegação demonstrativa do App Cliente" className="grid grid-cols-7 overflow-hidden rounded-lg border border-navy/10 bg-card">
        {telas.map((tela, indice) => <span key={tela.nome} className={cn("px-1 py-2 text-center text-[9px]", indice === 0 ? "bg-gold/20 font-semibold text-navy" : "text-navy/55")}>{tela.nome}</span>)}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Telas do mockup e complementos visuais aprovados                    */
/* ------------------------------------------------------------------ */

export type TelaPrevia = {
  id: string;
  titulo: string;
  grupo: string;
  /** Rota real correspondente no Desk. */
  rota: string;
  render: () => React.ReactNode;
};

const grade3 = "grid gap-4 md:grid-cols-3";
const grade2 = "grid gap-4 md:grid-cols-2";

export const TELAS_PREVIA_DESK: readonly TelaPrevia[] = [
  {
    id: "hoje",
    titulo: "Hoje",
    grupo: "hoje",
    rota: "/painel",
    render: () => (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <Indicador rotulo="Decisões do dia" valor="6" apoio="aguardando você" />
          <Indicador rotulo="Cadências vencidas" valor="3" apoio="pedem retomada" />
          <Indicador rotulo="Casos sem próxima ação" valor="1" apoio="precisa de decisão" />
          <Indicador rotulo="Microentregas para revisão" valor="2" apoio="prontas para conferir" />
        </div>
        <div className={grade2}>
          <Cartao titulo="Decisões prioritárias">
            <Linha rotulo="Aprovar escopo — Família Piccoli" valor="Decidir" tom="critico" />
            <Linha rotulo="Liberar pesquisa — Ana Luiza" valor="Decidir" tom="critico" />
            <Linha rotulo="Rever proposta — Núcleo Rossi" valor="Atenção" tom="atencao" />
            <Linha rotulo="Confirmar documento mínimo" valor="Atenção" tom="atencao" />
          </Cartao>
          <Cartao titulo="Tarefas e microentregas">
            <Linha rotulo="Enviar achado à família" valor="Hoje" tom="atencao" />
            <Linha rotulo="Atualizar linha do tempo" valor="Hoje" tom="atencao" />
            <Linha rotulo="Publicar entrega no App" valor="Feito" tom="sucesso" />
            <Linha rotulo="Registrar fonte paroquial" valor="Feito" tom="sucesso" />
          </Cartao>
          <Cartao titulo="Cadência dos casos">
            <Linha rotulo="Cadência em dia" valor="7" tom="sucesso" />
            <Linha rotulo="Cadência atrasada" valor="3" tom="critico" />
            <Linha rotulo="Aguardando cliente" valor="4" />
          </Cartao>
          <Cartao titulo="Casos sem próxima ação">
            <Linha rotulo="Caso sem responsável" valor="1" tom="critico" />
            <Linha rotulo="Caso pausado" valor="2" />
            <Linha rotulo="Caso encerrado no mês" valor="5" tom="sucesso" />
          </Cartao>
          <Cartao titulo="Microentregas prontas para revisão">
            <Linha rotulo="Síntese do registro paroquial" valor="Revisar" tom="atencao" />
            <Linha rotulo="Linha familiar documentada" valor="Revisar" tom="atencao" />
          </Cartao>
          <Cartao titulo="Funil de leads · Visão Geral">
            <FunilVisual />
          </Cartao>
          <Cartao titulo="Alertas centralizados · com origem">
            <Linha rotulo="Cadência vencida · Jornada" valor="3" tom="critico" />
            <Linha rotulo="Sem próxima ação · Caso 360" valor="1" tom="critico" />
            <Linha rotulo="Lead parado · CRM Vivo" valor="2" tom="atencao" />
          </Cartao>
          <Cartao titulo="Ritmo operacional · 6 semanas">
            <SerieTendencia valores={[9, 13, 11, 16, 14, 19]} rotulos={["S1", "S2", "S3", "S4", "S5", "S6"]} tituloAcessivel="Evolução demonstrativa das ações concluídas em seis semanas" />
          </Cartao>
          <Cartao titulo="Distribuição das prioridades">
            <DonutEstados tituloAcessivel="Distribuição demonstrativa das prioridades do dia" segmentos={[{ rotulo: "Críticas", valor: 3, tom: "terracotta" }, { rotulo: "Atenção", valor: 5, tom: "gold" }, { rotulo: "Em dia", valor: 8, tom: "sucesso" }]} />
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "comercial",
    titulo: "Comercial / CRM Vivo",
    grupo: "comercial",
    rota: "/calls",
    render: () => (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          <Indicador rotulo="Leads ativos" valor="7" apoio="em cinco etapas" />
          <Indicador rotulo="Discovery" valor="2" apoio="conversas abertas" />
          <Indicador rotulo="Conversão" valor="12%" apoio="lead → cliente" />
          <Indicador rotulo="Parados" valor="2" apoio="com alerta visível" />
        </div>
        <CabecalhoFerramenta titulo="Funil comercial vivo" apoio="Origem → Discovery → diagnóstico → proposta → contrato" acao="Novo lead" />
        <div className="grid gap-3 lg:grid-cols-3">
          <Cartao titulo="Aquisição por canal">
            <GraficoColunas tituloAcessivel="Leads demonstrativos por canal de aquisição" itens={[{ rotulo: "Indicação", valor: 22, destaque: true }, { rotulo: "Orgânico", valor: 17 }, { rotulo: "Eventos", valor: 11 }, { rotulo: "Ads", valor: 8 }]} />
          </Cartao>
          <Cartao titulo="Conversão por etapa">
            <FunilVisual />
          </Cartao>
          <Cartao titulo="Origem e qualidade">
            <BarrasHorizontais tituloAcessivel="Qualidade demonstrativa dos leads por origem" itens={[{ rotulo: "Indicação", valor: 88, apoio: "Alta", tom: "gold" }, { rotulo: "Busca orgânica", valor: 71, apoio: "Boa" }, { rotulo: "Campanhas", valor: 54, apoio: "Média", tom: "terracotta" }, { rotulo: "Eventos", valor: 63, apoio: "Boa" }]} />
          </Cartao>
        </div>
        <KanbanVisual colunas={[
          { titulo: "Leads", cartoes: [
            { titulo: "João Martins", contexto: "Portugal · indicação", responsavel: "Tatiana", prazo: "Hoje", etiqueta: "Responder", proximoPasso: "Confirmar horário da conversa", alerta: "Lead parado há 4 dias", tom: "atencao" },
            { titulo: "Família Moretti", contexto: "Itália · campanha", responsavel: "Carla", prazo: "13 set", etiqueta: "Qualificar", proximoPasso: "Revisar origem e interesse", anexos: 2 },
          ] },
          { titulo: "Discovery", cartoes: [
            { titulo: "Ana Luiza", contexto: "Mesa realizada · Áustria", responsavel: "Tatiana", prazo: "Hoje", etiqueta: "Handoff", proximoPasso: "Registrar decisão da Discovery", tom: "atencao", anexos: 4 },
            { titulo: "Núcleo Rossi", contexto: "Call agendada · Itália", responsavel: "Camila", prazo: "14 set", etiqueta: "Agendado", proximoPasso: "Realizar Discovery" },
          ] },
          { titulo: "Diagnóstico", cartoes: [
            { titulo: "Amigo do Danilo", contexto: "Aguarda certidão-base", responsavel: "Pesquisa", prazo: "16 set", etiqueta: "Documento", proximoPasso: "Solicitar documento mínimo", alerta: "Lead parado há 7 dias", tom: "critico", anexos: 1 },
          ] },
          { titulo: "Proposta", cartoes: [
            { titulo: "Família Piccoli", contexto: "Escopo enviado · v3", responsavel: "Tatiana", prazo: "15 set", etiqueta: "Em análise", proximoPasso: "Confirmar retorno da proposta", anexos: 3 },
          ] },
          { titulo: "Contrato", cartoes: [
            { titulo: "Núcleo Costa", contexto: "Aceite registrado", responsavel: "Operações", prazo: "17 set", etiqueta: "Onboarding", proximoPasso: "Preparar abertura do caso", tom: "sucesso", anexos: 5 },
          ] },
        ]} />
      </div>
    ),
  },
  {
    id: "kanban",
    titulo: "Checklist / Kanban operacional",
    grupo: "casos",
    rota: "/ops · /tarefas",
    render: () => (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          <Indicador rotulo="Confirmar" valor="3" apoio="itens concluídos" />
          <Indicador rotulo="Em revisão" valor="4" apoio="esta semana" />
          <Indicador rotulo="Pendente crítico" valor="3" apoio="exige decisão" />
          <Indicador rotulo="SLA em risco" valor="1" apoio="prazo próximo" />
        </div>
        <CabecalhoFerramenta titulo="Trabalho dos casos" apoio="Próxima ação, responsável, prazo e bloqueio em uma única leitura" acao="Nova tarefa" />
        <KanbanVisual colunas={[
          { titulo: "Não iniciada", cartoes: [
            { titulo: "Conferir certidão-base", contexto: CASO_DEMO_CODIGO, responsavel: "Marina", prazo: "13 set", etiqueta: "Alta", proximoPasso: "Comparar nomes e datas", tom: "atencao", anexos: 2 },
            { titulo: "Preparar linha familiar", contexto: "Família Piccoli", responsavel: "Pesquisa", prazo: "15 set", etiqueta: "Média", proximoPasso: "Vincular ascendentes confirmados" },
          ] },
          { titulo: "Em andamento", cartoes: [
            { titulo: "Validar grafia do ascendente", contexto: "Núcleo Rossi", responsavel: "Carla", prazo: "Hoje", etiqueta: "SLA em risco", proximoPasso: "Conferir registro civil", alerta: "Atividade parada há 3 dias", tom: "atencao", anexos: 3 },
          ] },
          { titulo: "Bloqueada", cartoes: [
            { titulo: "Emitir relatório F1", contexto: "Falta transcrição da fonte", responsavel: "Joana", prazo: "12 set", etiqueta: "Bloqueio", proximoPasso: "Finalizar transcrição vinculada", alerta: "Atividade parada por bloqueio", tom: "critico", anexos: 1 },
          ] },
          { titulo: "Concluída", cartoes: [
            { titulo: "Registrar fonte paroquial", contexto: "Família Piccoli", responsavel: "Marina", prazo: "11 set", etiqueta: "Concluída", proximoPasso: "Encaminhar para revisão", tom: "sucesso", anexos: 4 },
          ] },
          { titulo: "Cancelada", cartoes: [
            { titulo: "Consulta duplicada", contexto: "Substituída por fonte vigente", responsavel: "Pesquisa", prazo: "10 set", etiqueta: "Histórico" },
          ] },
        ]} />
      </div>
    ),
  },
  {
    id: "caso360",
    titulo: "Caso 360",
    grupo: "casos",
    rota: "/casos",
    render: () => (
      <div className="space-y-4">
        <div className="rounded-xl border border-navy/10 bg-card p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate font-serif text-2xl text-navy">Família Piccoli</h2>
              <p className="mt-1 text-xs text-navy/60">{CASO_DEMO_TITULO} · {CASO_DEMO_CODIGO}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Etiqueta texto="Dados demonstrativos" tom="atencao" />
              {/* Mesmo caso demo do App Cliente (portal-demo-sophia.ts) — a
                  travessia mostra a mesma pessoa/caso do lado do Desk para
                  o lado do cliente, sem inventar um segundo caso fictício. */}
              <Link
                to="/previa-app-cliente"
                className="text-[11px] font-medium text-terracotta underline-offset-2 hover:underline"
              >
                Ver como {CLIENTE_DEMO_NOME} vê este caso →
              </Link>
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2 border-t border-navy/10 pt-3 text-xs">
            {["Visão geral", "Jornada", "Pesquisa", "Documentos", "Financeiro", "Jurídico", "Cliente"].map(
              (aba, i) => (
                <span
                  key={aba}
                  className={cn(
                    "rounded-full px-3 py-1",
                    i === 0 ? "bg-navy text-white" : "border border-navy/15 text-navy/70",
                  )}
                >
                  {aba}
                </span>
              ),
            )}
          </nav>
        </div>
        <div className={grade2}>
          <Cartao titulo="Linha do tempo">
            <LinhaTempoGrafica />
          </Cartao>
          <Cartao titulo="Participantes">
            <div className="space-y-3">
              <Pessoa nome="Sophia Piccoli" papel="Requerente principal" />
              <Pessoa nome="Carlo Piccoli" papel="Ascendente direto" />
              <Pessoa nome="Marina Piccoli" papel="Dependente" />
              <Pessoa nome="Tatiana Tosi" papel="Responsável interna" />
            </div>
          </Cartao>
        </div>
        <div className={grade2}>
          <Cartao titulo="Progresso do caso por frente">
            <BarrasHorizontais tituloAcessivel="Progresso demonstrativo do caso por frente" itens={[{ rotulo: "Formalização", valor: 100, apoio: "Concluída" }, { rotulo: "Pesquisa", valor: 64, apoio: "Em andamento", tom: "gold" }, { rotulo: "Documentos", valor: 48, apoio: "Em coleta", tom: "terracotta" }, { rotulo: "Publicação", valor: 25, apoio: "Inicial" }]} />
          </Cartao>
          <Cartao titulo="Estados do dossiê">
            <DonutEstados tituloAcessivel="Distribuição demonstrativa dos estados do dossiê" segmentos={[{ rotulo: "Confirmados", valor: 12, tom: "sucesso" }, { rotulo: "Em revisão", valor: 5, tom: "gold" }, { rotulo: "Pendentes", valor: 3, tom: "terracotta" }]} />
          </Cartao>
        </div>
        <Cartao titulo="Jornada D0–D365">
          <JornadaD0Visual />
        </Cartao>
      </div>
    ),
  },
  {
    id: "pessoa360",
    titulo: "Pessoa 360",
    grupo: "casos",
    rota: "/clientes",
    render: () => (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-navy/10 bg-card p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/50 bg-navy font-serif text-lg text-gold">
            SP
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-2xl text-navy">Sophia Piccoli</h2>
            <p className="text-xs text-navy/60">Pessoa canônica · sem duplicidade</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr_0.9fr]">
          <Cartao titulo="Identidade">
            <Linha rotulo="Nome civil" valor="Sophia Piccoli" />
            <Linha rotulo="Nascimento" valor="1990" />
            <Linha rotulo="Naturalidade" valor="Brasil" />
            <Linha rotulo="Confiança do dado" valor="Alta" tom="sucesso" />
          </Cartao>
          <Cartao titulo="Gráfico de parentesco">
            <ArvoreFamiliaGrafica />
          </Cartao>
          <Cartao titulo="Casos vinculados">
            <Linha rotulo="Reconhecimento italiano" valor="Ativo" tom="sucesso" />
            <Linha rotulo="Retificação de certidão" valor="Aguardando" tom="atencao" />
            <Linha rotulo="Dossiê do legado" valor="Em pesquisa" />
          </Cartao>
          <Cartao titulo="Fontes">
            <Linha rotulo="Certidão de nascimento" valor="Confirmada" tom="sucesso" />
            <Linha rotulo="Registro paroquial" valor="Confirmada" tom="sucesso" />
            <Linha rotulo="Lista de imigração" valor="Em revisão" tom="atencao" />
          </Cartao>
          <Cartao titulo="Localização">
            <div className="flex items-center gap-3 rounded-lg border border-navy/10 bg-cream/40 p-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-gold"><MapPin className="h-4 w-4" aria-hidden /></span>
              <div><p className="text-xs font-semibold text-navy">Santos, Brasil</p><p className="text-[10px] text-navy/55">Último registro confirmado</p></div>
            </div>
          </Cartao>
          <Cartao titulo="Confiança da pessoa">
            <EstrelasConfianca valor={4.8} />
          </Cartao>
        </div>
        <div className={grade2}>
          <Cartao titulo="Completude por dimensão">
            <BarrasHorizontais tituloAcessivel="Completude demonstrativa da ficha da pessoa" itens={[{ rotulo: "Identidade", valor: 94, apoio: "94%" }, { rotulo: "Parentesco", valor: 82, apoio: "82%", tom: "gold" }, { rotulo: "Fontes", valor: 68, apoio: "68%", tom: "terracotta" }, { rotulo: "Casos vinculados", valor: 76, apoio: "76%" }]} />
          </Cartao>
          <Cartao titulo="Rede de vínculos">
            <RedeNucleoGrafica />
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "radar",
    titulo: "Radar & Matrizes",
    grupo: "casos",
    rota: "/qualidade",
    render: () => (
      <div className="space-y-4">
        <CabecalhoFerramenta
          titulo="Radar interno"
          apoio="Uma única tela com duas leituras: matriz geral de prioridade e radar individual do caso selecionado"
          acao="Caso: Ana Luiza (demonstrativo)"
        />
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-navy px-3 py-1 text-[11px] font-medium text-cream">Matriz de prioridade</span>
          <span className="rounded-full border border-navy/15 bg-cream/60 px-3 py-1 text-[11px] text-navy/65">Radar individual</span>
        </div>
        <div className={grade2}>
          <Cartao titulo="Matriz elegibilidade × prioridade">
            <MatrizGrafica />
            <p className="mt-3 border-t border-navy/10 pt-3 text-[11px] text-navy/55">
              Clicar em um caso da matriz seleciona o mesmo caso no radar individual ao lado.
            </p>
          </Cartao>
          <Cartao titulo="Radar individual — caso selecionado">
            <RadarGrafico
              tituloAcessivel="Radar interno com quatro eixos da jornada do caso selecionado"
              eixos={[
                { rotulo: "História familiar", valor: 72 },
                { rotulo: "Documentos", valor: 58 },
                { rotulo: "Estratégia", valor: 81 },
                { rotulo: "Próximos passos", valor: 64 },
              ]}
            />
            <div className="mt-3 border-t border-navy/10 pt-2">
              <Linha rotulo="Situação" valor="Em pesquisa" tom="atencao" />
              <Linha rotulo="Prioridade" valor="Alta" tom="critico" />
              <Linha rotulo="Urgência" valor="Prazo em 5 dias" tom="atencao" />
              <Linha rotulo="Elegibilidade" valor="Provável" />
              <Linha rotulo="Responsável" valor="Equipe de pesquisa" />
            </div>
            <div className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-2.5">
              <p className="text-[10px] font-semibold uppercase text-navy/60">Próxima ação</p>
              <p className="mt-1 text-[11px] text-navy">Confirmar certidão de nascimento do ascendente · prazo 18/09</p>
              <p className="mt-1 text-[11px] text-navy/60">Bloqueio: aguardando retorno do arquivo paroquial</p>
            </div>
            <p className="mt-3 border-t border-navy/10 pt-3 text-[11px] text-navy/55">
              Leitura interna em quatro eixos. O App Cliente usa seis dimensões publicáveis; as duas taxonomias não são equivalentes.
            </p>
          </Cartao>
        </div>
      </div>
    ),
  },

  {
    id: "pesquisa",
    titulo: "Pesquisa",
    grupo: "pesquisa",
    rota: "/pesquisa-modulo · /fontes-genealogicas · /evidencias",
    render: () => (
      <div className="space-y-4">
        <CabecalhoFerramenta titulo="Dossiê de pesquisa" apoio="Fontes, transcrições, interpretações, hipóteses e conclusões permanecem separadas" acao="Nova consulta" />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <Cartao titulo="Fontes e referências">
            <Linha rotulo="Arquivo paroquial — Lucca" valor="Revisada" tom="sucesso" />
            <Linha rotulo="Registro civil — Santos" valor="Revisada" tom="sucesso" />
            <Linha rotulo="Lista de imigração" valor="Em leitura" tom="atencao" />
            <Linha rotulo="Arquivo militar" valor="A consultar" />
            <div className="mt-3 rounded-lg border border-navy/10 bg-cream/40 p-2.5">
              <p className="text-[10px] font-semibold uppercase text-navy/55">Referência auxiliar</p>
              <p className="mt-1 text-[11px] text-navy">Dicionário de variações onomásticas · versão 2.1</p>
            </div>
          </Cartao>
          <Cartao titulo="Hipóteses e confiança">
            <MedidorConfianca valor={82} />
            <div className="mt-3 border-t border-navy/10 pt-2">
              <Linha rotulo="Grafia alternativa" valor="Provável" tom="atencao" />
              <Linha rotulo="Segundo casamento" valor="A confirmar" />
              <Linha rotulo="Naturalização anterior" valor="Refutada" tom="critico" />
            </div>
          </Cartao>
          <Cartao titulo="Miniatura familiar">
            <ArvoreFamiliaGrafica />
            <div className="mt-3 border-t border-navy/10 pt-2">
              <Linha rotulo="Gerações documentadas" valor="2 de 3" tom="atencao" />
            </div>
          </Cartao>
        </div>
        <Cartao titulo="Da pergunta à microentrega">
          <ol className="grid gap-2 sm:grid-cols-6">
            {["Pergunta", "Fonte", "Evidência", "Achado", "Microentrega", "Pronta para revisão"].map((etapa, indice) => (
              <li key={etapa} className="relative rounded-lg border border-navy/10 bg-cream/40 p-2.5 text-center">
                <CheckCircle2 className={cn("mx-auto h-4 w-4", indice < 5 ? "text-sucesso" : "text-gold")} aria-hidden />
                <p className="mt-1 text-[10px] font-semibold text-navy">{etapa}</p>
                {indice < 5 ? <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-gold sm:block" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </Cartao>
        <div className={grade2}>
          <Cartao titulo="Cobertura das fontes">
            <BarrasHorizontais tituloAcessivel="Cobertura demonstrativa por tipo de fonte" itens={[{ rotulo: "Registro civil", valor: 92, apoio: "11 fontes" }, { rotulo: "Paroquial", valor: 76, apoio: "8 fontes", tom: "gold" }, { rotulo: "Imigração", valor: 58, apoio: "5 fontes", tom: "terracotta" }, { rotulo: "Militar", valor: 24, apoio: "2 fontes" }]} />
          </Cartao>
          <Cartao titulo="Produção de evidências">
            <GraficoColunas tituloAcessivel="Evidências demonstrativas produzidas por período" itens={[{ rotulo: "Abr", valor: 4 }, { rotulo: "Mai", valor: 7 }, { rotulo: "Jun", valor: 6 }, { rotulo: "Jul", valor: 10, destaque: true }, { rotulo: "Ago", valor: 13, destaque: true }]} />
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "biblioteca",
    titulo: "Biblioteca Mestre",
    grupo: "pesquisa",
    rota: "/biblioteca",
    render: () => (
      <div className="space-y-4">
        <CabecalhoFerramenta titulo="Centro de inteligência" apoio="Acervo interno, bases, taxonomias, trilhas, regras e modelos versionados" acao="Novo item" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { nome: "Acervo", total: "42", Icone: FileText },
            { nome: "Bases genealógicas", total: "18", Icone: Search },
            { nome: "Dicionários", total: "13", Icone: BookOpen },
            { nome: "Trilhas", total: "11", Icone: Target },
            { nome: "Regras jurídicas", total: "27", Icone: Scale },
          ].map(({ nome, total, Icone }) => (
            <div key={nome} className="rounded-lg border border-navy/10 bg-card p-3">
              <Icone className="h-4 w-4 text-gold" aria-hidden />
              <p className="mt-2 text-xs font-semibold text-navy">{nome}</p>
              <p className="mt-1 font-serif text-2xl text-navy">{total}</p>
              <p className="text-[9px] text-navy/50">itens vigentes</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Cartao titulo="Itens revisados recentemente">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[11px]">
                <thead className="border-b border-navy/10 text-[9px] uppercase text-navy/45">
                  <tr><th className="pb-2">Item</th><th className="pb-2">Área</th><th className="pb-2">Versão</th><th className="pb-2">Estado</th><th className="pb-2">Uso</th></tr>
                </thead>
                <tbody className="divide-y divide-navy/5 text-navy/70">
                  <tr><td className="py-2 font-medium text-navy">Registros civis da Toscana</td><td>Bases</td><td>v3.2</td><td><Etiqueta texto="Homologado" tom="sucesso" /></td><td>Pesquisa</td></tr>
                  <tr><td className="py-2 font-medium text-navy">Variações Piccoli / Picolli</td><td>Dicionário</td><td>v2.1</td><td><Etiqueta texto="Vigente" tom="sucesso" /></td><td>Pesquisa</td></tr>
                  <tr><td className="py-2 font-medium text-navy">Trilha Itália — administrativa</td><td>Trilhas</td><td>v4.0</td><td><Etiqueta texto="Em revisão" tom="atencao" /></td><td>Casos</td></tr>
                  <tr><td className="py-2 font-medium text-navy">Modelo de relatório F1</td><td>Modelos</td><td>v1.8</td><td><Etiqueta texto="Homologado" tom="sucesso" /></td><td>Relatórios</td></tr>
                </tbody>
              </table>
            </div>
          </Cartao>
          <Cartao titulo="Biblioteca → Pesquisa">
            <div className="space-y-2">
              {["Selecionar base vigente", "Registrar consulta", "Vincular evidência", "Revisar interpretação", "Publicar só após aprovação"].map((texto, indice) => (
                <div key={texto} className="flex items-center gap-2 rounded-lg border border-navy/10 bg-cream/40 p-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy text-[9px] text-primary-foreground">{indice + 1}</span>
                  <span className="text-[10px] text-navy/70">{texto}</span>
                </div>
              ))}
            </div>
          </Cartao>
        </div>
        <Cartao titulo="Fila de publicação para o App Cliente">
          <FilaPublicacao origem="Biblioteca" />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Linha rotulo="Síntese paroquial" valor="Tatiana · hoje" tom="atencao" />
            <Linha rotulo="Linha familiar" valor="Pesquisa · 15 set" />
            <Linha rotulo="Nota de contexto" valor="Operações · 16 set" />
          </div>
        </Cartao>
        <div className={grade2}>
          <Cartao titulo="Composição do acervo">
            <DonutEstados tituloAcessivel="Composição demonstrativa da Biblioteca Mestre" segmentos={[{ rotulo: "Fontes", valor: 42, tom: "navy" }, { rotulo: "Modelos", valor: 18, tom: "gold" }, { rotulo: "Regras", valor: 27, tom: "terracotta" }, { rotulo: "Trilhas", valor: 11, tom: "sucesso" }]} />
          </Cartao>
          <Cartao titulo="Uso do acervo por área">
            <GraficoColunas tituloAcessivel="Uso demonstrativo do acervo por área do Desk" itens={[{ rotulo: "Pesquisa", valor: 31, destaque: true }, { rotulo: "Casos", valor: 22 }, { rotulo: "Jurídico", valor: 17 }, { rotulo: "Portal", valor: 9 }]} />
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "financeiro",
    titulo: "Financeiro",
    grupo: "contratos",
    rota: "/financeiro",
    render: () => (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <Indicador rotulo="Valor do contrato" valor="R$ 43 mil" apoio="escopo vigente" />
          <Indicador rotulo="Já recebido" valor="R$ 9,5 mil" apoio="pagamentos confirmados" />
          <Indicador rotulo="A receber" valor="R$ 33,5 mil" apoio="parcelas futuras" />
          <Indicador rotulo="Vencido" valor="R$ 0" apoio="nenhuma pendência" />
        </div>
        <div className={grade3}>
        <Cartao titulo="Fluxo do contrato">
          <Linha rotulo="Valor do contrato" valor="R$ 43.000,00" />
          <Linha rotulo="Já recebido" valor="R$ 9.500,00" tom="sucesso" />
          <Linha rotulo="A receber" valor="R$ 33.500,00" tom="atencao" />
          <Linha rotulo="Vencido" valor="R$ 0,00" tom="sucesso" />
        </Cartao>
        <Cartao titulo="Parcelas previstas">
          <Linha rotulo="Entrada" valor="Confirmada" tom="sucesso" />
          <Linha rotulo="Parcela 2 · 15 set" valor="Programada" />
          <Linha rotulo="Parcela 3 · 15 out" valor="Programada" />
          <Linha rotulo="Parcela final" valor="A definir" tom="atencao" />
        </Cartao>
        <Cartao titulo="Reconciliação">
          <Linha rotulo="Pagamentos conciliados" valor="6" tom="sucesso" />
          <Linha rotulo="Aguardando conferência" valor="2" tom="atencao" />
          <Linha rotulo="Divergências abertas" valor="0" tom="sucesso" />
          <p className="mt-3 text-[11px] text-navy/55">
            Nenhuma cobrança é enviada a partir desta tela.
          </p>
        </Cartao>
        </div>
        <Cartao titulo="Alertas financeiros contextualizados">
          <div className="grid gap-2 sm:grid-cols-3">
            <Linha rotulo="Contrato Piccoli · Parcela 2" valor="Vence em 3 dias" tom="atencao" />
            <Linha rotulo="Contrato Rossi · Entrada" valor="Conferir vínculo" tom="atencao" />
            <Linha rotulo="Contrato Costa · Parcela 1" valor="Conciliada" tom="sucesso" />
          </div>
        </Cartao>
        <div className={grade2}>
          <Cartao titulo="Recebimentos previstos × confirmados">
            <SerieTendencia valores={[9, 14, 12, 18, 22, 27]} rotulos={["Abr", "Mai", "Jun", "Jul", "Ago", "Set"]} tituloAcessivel="Evolução financeira demonstrativa do contrato" />
          </Cartao>
          <Cartao titulo="Situação das parcelas">
            <DonutEstados tituloAcessivel="Distribuição demonstrativa das parcelas" segmentos={[{ rotulo: "Pagas", valor: 6, tom: "sucesso" }, { rotulo: "Programadas", valor: 3, tom: "navy" }, { rotulo: "A conferir", valor: 2, tom: "gold" }, { rotulo: "Vencidas", valor: 0, tom: "terracotta" }]} />
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "juridico",
    titulo: "Jurídico & Contrato",
    grupo: "contratos",
    rota: "/contratos",
    render: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Escopo e assinatura">
          <Linha rotulo="Contrato-base v2" valor="Vigente" tom="sucesso" />
          <Linha rotulo="Anexo I — escopo" valor="Assinado" tom="sucesso" />
          <Linha rotulo="Anexo IV — condições" valor="Assinado" tom="sucesso" />
          <Linha rotulo="Aditivo de dependente" valor="Pendente" tom="atencao" />
        </Cartao>
        <Cartao titulo="Assinatura">
          <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
            <p className="font-serif text-lg italic text-navy">Sophia Piccoli</p>
            <p className="mt-1 text-[10px] text-navy/55">Assinatura registrada · 21/03/2026</p>
          </div>
          <div className="mt-3"><Linha rotulo="Integridade do documento" valor="Validada" tom="sucesso" /></div>
        </Cartao>
        <Cartao titulo="Validação jurídica">
          <Linha rotulo="Cadeia documental completa" valor="Validado" tom="sucesso" />
          <Linha rotulo="Retificação necessária" valor="Em análise" tom="atencao" />
          <Linha rotulo="Tradução juramentada" valor="Pendente" tom="critico" />
          <Linha rotulo="Apostilamento" valor="Pendente" tom="critico" />
        </Cartao>
        <Cartao titulo="Conflitos e conferências">
          <Linha rotulo="Variação de sobrenome" valor="Revisar" tom="atencao" />
          <Linha rotulo="Datas entre documentos" valor="Conferido" tom="sucesso" />
          <Linha rotulo="Representação de menor" valor="Aplicável" tom="atencao" />
          <Linha rotulo="Poderes da procuração" valor="Conferido" tom="sucesso" />
        </Cartao>
        <Cartao titulo="Alertas do contrato e atos formais" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <Linha rotulo="Contrato-base v2 · Aditivo" valor="Assinatura pendente" tom="atencao" />
            <Linha rotulo="Procuração · representação de menor" valor="Conferir poderes" tom="atencao" />
            <Linha rotulo="Anexo IV · integridade" valor="Validada" tom="sucesso" />
          </div>
        </Cartao>
        <Cartao titulo="Completude formal" className="lg:col-span-2">
          <BarrasHorizontais tituloAcessivel="Completude demonstrativa dos atos formais" itens={[{ rotulo: "Contrato-base", valor: 100, apoio: "Assinado" }, { rotulo: "Anexos", valor: 86, apoio: "6 de 7", tom: "gold" }, { rotulo: "Procurações", valor: 72, apoio: "Em conferência", tom: "terracotta" }, { rotulo: "Validação documental", valor: 64, apoio: "Em análise" }]} />
        </Cartao>
      </div>
    ),
  },
  {
    id: "pessoas",
    titulo: "Pessoas & Famílias",
    grupo: "casos",
    rota: "/nucleos",
    render: () => (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <Cartao titulo="Gerações G1–G5">
            <ArvoreCincoGeracoes />
          </Cartao>
          <Cartao titulo="Leitura da linhagem">
            <Linha rotulo="Conexão-chave" valor="Carlo Piccoli" tom="sucesso" />
            <Linha rotulo="Território" valor="Lucca · Toscana" />
            <Linha rotulo="Pessoas conectadas" valor="12 de 31" tom="atencao" />
            <Linha rotulo="O que ainda falta" valor="Certidão G4" tom="critico" />
          </Cartao>
        </div>
        <Cartao titulo="Árvore visual do núcleo">
          <ArvoreFamiliaGrafica />
          <div className="mt-4 border-t border-navy/10 pt-3">
            <Linha rotulo="Núcleo Piccoli — dossiê-mãe" valor="Ativo" tom="sucesso" />
            <Linha rotulo="Núcleo Rossi — possível duplicidade" valor="Revisar" tom="atencao" />
          </div>
        </Cartao>
        <div className={grade2}>
          <Cartao titulo="Rede de núcleos e dependentes">
            <RedeNucleoGrafica />
          </Cartao>
          <Cartao titulo="Cobertura por geração">
            <GraficoColunas tituloAcessivel="Cobertura demonstrativa das cinco gerações" itens={[{ rotulo: "G1", valor: 100, destaque: true }, { rotulo: "G2", valor: 92 }, { rotulo: "G3", valor: 78 }, { rotulo: "G4", valor: 56 }, { rotulo: "G5", valor: 34 }]} />
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "portal",
    titulo: "Portal do cliente (visão interna)",
    grupo: "casos",
    rota: "/acessos-portal",
    render: () => (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Cartao titulo="Família no portal">
            <ArvoreFamiliaGrafica />
          </Cartao>
          <div className="space-y-4">
            <Cartao titulo="Núcleos com acesso">
              <div className="space-y-3"><Pessoa nome="Sophia Piccoli" papel="Acesso ativo" /><Pessoa nome="Paulo Tavares" papel="Convite enviado" /></div>
            </Cartao>
            <Cartao titulo="Núcleos sem acesso">
              <Linha rotulo="Marina Piccoli" valor="Sem acesso" />
              <Linha rotulo="João Piccoli" valor="Sem acesso" />
            </Cartao>
          </div>
        </div>
        <Cartao titulo="Conteúdo publicado no App">
          <div className="grid gap-2 sm:grid-cols-3">
            <Linha rotulo="Resumo da jornada" valor="Publicado" tom="sucesso" />
            <Linha rotulo="Documentos solicitados" valor="Publicado" tom="sucesso" />
            <Linha rotulo="Achado genealógico" valor="Aprovar" tom="atencao" />
          </div>
        </Cartao>
        <Cartao titulo="Fila de publicação para o App Cliente">
          <FilaPublicacao origem="Portal interno" />
        </Cartao>
      </div>
    ),
  },
  {
    id: "appcliente",
    titulo: "App Cliente",
    grupo: "casos",
    rota: "/previa-app-cliente",
    render: () => (
      <AppClienteSeteTelas />
    ),
  },
  {
    id: "configuracao",
    titulo: "Configuração & Acesso",
    grupo: "governanca",
    rota: "/configuracoes",
    render: () => (
      <div className="grid gap-4 lg:grid-cols-[0.65fr_1.35fr]">
        <Cartao titulo="Permissões">
          <div className="space-y-2">
            {["Política operacional", "Perfis e papéis", "Acessos internos", "Acessos ao portal", "Integrações", "Auditoria"].map((item, indice) => (
              <div key={item} className={cn("flex items-center gap-2 rounded-lg border p-2 text-[11px]", indice === 0 ? "border-gold/50 bg-gold/10 text-navy" : "border-navy/10 text-navy/60")}>
                {indice === 0 ? <LockKeyhole className="h-3.5 w-3.5 text-gold" aria-hidden /> : <Users className="h-3.5 w-3.5" aria-hidden />}{item}
              </div>
            ))}
          </div>
        </Cartao>
        <div className="min-w-0 space-y-4">
          <Cartao titulo="Política operacional">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-navy/10 bg-cream/40 p-3"><p className="text-[10px] text-navy/55">Perfil selecionado</p><p className="mt-1 text-xs font-semibold text-navy">Administração</p></div>
              <div className="rounded-lg border border-navy/10 bg-cream/40 p-3"><p className="text-[10px] text-navy/55">Confirmação externa</p><p className="mt-1 text-xs font-semibold text-navy">Sempre obrigatória</p></div>
            </div>
          </Cartao>
          <Cartao titulo="Registro de auditoria" className="overflow-hidden">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[10px]">
                <thead className="border-b border-navy/10 uppercase text-navy/45"><tr><th className="pb-2">Data</th><th className="pb-2">Ação</th><th className="pb-2">Pessoa</th><th className="pb-2">Resultado</th></tr></thead>
                <tbody className="divide-y divide-navy/5 text-navy/70">
                  <tr><td className="py-2">12/09</td><td>Alteração de escopo</td><td>Tatiana</td><td><Etiqueta texto="Registrado" tom="sucesso" /></td></tr>
                  <tr><td className="py-2">11/09</td><td>Publicação no App</td><td>Operações</td><td><Etiqueta texto="Registrado" tom="sucesso" /></td></tr>
                  <tr><td className="py-2">10/09</td><td>Acesso concedido</td><td>Administração</td><td><Etiqueta texto="Registrado" tom="sucesso" /></td></tr>
                </tbody>
              </table>
            </div>
          </Cartao>
        </div>
      </div>
    ),
  },
  {
    id: "depara",
    titulo: "Mapa de aplicação real",
    grupo: "governanca",
    rota: "mapa visual · sem mudança de rotas",
    render: () => (
      <div className="space-y-4">
        <CabecalhoFerramenta titulo="Da prévia para a operação" apoio="Cada elemento visual será conectado à superfície que já é dona do dado" acao="Somente leitura" />
        <div className="grid gap-3 lg:grid-cols-2">
          {[
            { titulo: "Hoje / Visão Geral", grupo: "Hoje", destino: "/painel · /alertas", fonte: "Prioridades, cadências, casos sem próxima ação, leads parados e microentregas", estado: "Tela real existente" },
            { titulo: "Comercial / CRM Vivo", grupo: "Marketing & Comercial", destino: "/calls · /leads · /crm-mestre · /propostas", fonte: "Leads, calls, propostas, responsáveis e próximas ações", estado: "Tela real existente" },
            { titulo: "Kanban operacional", grupo: "Pessoas & Casos", destino: "/ops · /tarefas", fonte: "Tarefas, microentregas, SLA, responsáveis, prazos e bloqueios", estado: "Tela real existente" },
            { titulo: "Caso 360", grupo: "Pessoas & Casos", destino: "/casos · /casos/$caseId", fonte: "Caso, participantes, jornada, próxima ação, documentos e alertas", estado: "Tela real existente" },
            { titulo: "Pessoa 360 e Famílias", grupo: "Pessoas & Casos", destino: "/clientes · /pessoas-linhagens/$caseId", fonte: "Pessoas canônicas, núcleos, fontes, vínculos e gerações", estado: "Tela real existente" },
            { titulo: "Radar & Matrizes", grupo: "Pessoas & Casos", destino: "/qualidade", fonte: "Prioridade, urgência, elegibilidade e qualidade interna", estado: "Tela real existente" },
            { titulo: "Pesquisa", grupo: "Inteligência & Pesquisa", destino: "/pesquisa-modulo · /fontes-genealogicas · /evidencias", fonte: "Pessoas pesquisadas, fontes, evidências, eventos, hipóteses e relatórios", estado: "Tela real existente" },
            { titulo: "Biblioteca Mestre", grupo: "Inteligência & Pesquisa", destino: "/biblioteca", fonte: "Acervo, bases, taxonomias, trilhas, regras e modelos versionados", estado: "Tela real existente" },
            { titulo: "Financeiro", grupo: "Formalização & Financeiro", destino: "/financeiro", fonte: "Contrato, parcelas, pagamentos e reconciliação", estado: "Tela real existente" },
            { titulo: "Jurídico & Contrato", grupo: "Formalização & Financeiro", destino: "/contratos · /matriz-juridica", fonte: "Contrato, atos formais, elegibilidade e conferências", estado: "Tela real existente" },
            { titulo: "Portal interno", grupo: "Pessoas & Casos", destino: "/acessos-portal · /microentregas", fonte: "Acessos e projeções publicáveis por caso", estado: "Tela real existente" },
            { titulo: "App Cliente", grupo: "Projeção autorizada", destino: "/portal + 6 rotas canônicas", fonte: "Etapa, jornada, radar, árvore, documentos, legado e conta sanitizados", estado: "Sete telas existentes" },
            { titulo: "Configuração & Acesso", grupo: "Governança & Administração", destino: "/configuracoes · /equipe · /auditoria", fonte: "Papéis, acessos, políticas e auditoria", estado: "Tela real existente" },
          ].map((item) => (
            <article key={item.titulo} className="rounded-lg border border-navy/10 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-navy">{item.titulo}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase text-gold">{item.grupo}</p>
                </div>
                <Etiqueta texto={item.estado} tom="sucesso" />
              </div>
              <dl className="mt-3 space-y-2 border-t border-navy/10 pt-3 text-[11px]">
                <div><dt className="font-semibold text-navy">Onde estará</dt><dd className="mt-0.5 text-navy/60">{item.destino}</dd></div>
                <div><dt className="font-semibold text-navy">O que alimentará</dt><dd className="mt-0.5 text-navy/60">{item.fonte}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-[11px] text-navy/70">
          A nova prévia não criou uma área paralela: ela mostra o desenho que será aplicado às páginas reais após aprovação visual e validação autenticada.
        </div>
      </div>
    ),
  },
] as const;

/** Prancha aprovada: somente as 13 superfícies do Desk solicitadas. */
const TELAS_PRANCHA_DESK = TELAS_PREVIA_DESK.filter(
  (tela) => tela.id !== "appcliente" && tela.id !== "depara",
);

/* ------------------------------------------------------------------ */
/* Moldura do Desk (marca oficial)                                     */
/* ------------------------------------------------------------------ */

const GRUPOS = [
  { id: "hoje", label: "Hoje", icon: LayoutDashboard },
  { id: "comercial", label: "Marketing & Comercial", icon: Target },
  { id: "casos", label: "Pessoas & Casos", icon: FolderOpen },
  { id: "pesquisa", label: "Inteligência & Pesquisa", icon: Library },
  { id: "contratos", label: "Formalização & Financeiro", icon: Scale },
  { id: "governanca", label: "Governança & Administração", icon: ShieldCheck },
] as const;

export function PreviaDeskTelas() {
  const [ativa, setAtiva] = useState(TELAS_PRANCHA_DESK[0]!.id);
  const tela = TELAS_PRANCHA_DESK.find((item) => item.id === ativa) ?? TELAS_PRANCHA_DESK[0]!;

  return (
    <div className="min-h-screen bg-background font-sans text-navy">
      <div className="bg-terracotta px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-cream">
        Prancha visual do Desk · kit para aprovação · conteúdo demonstrativo
      </div>

      <div className="lg:flex">
        {/* Barra lateral navy com o logo oficial */}
        <aside className="hidden bg-navy px-3 py-4 lg:block lg:min-h-[calc(100vh-2rem)] lg:w-64 lg:shrink-0">
          <div className="px-2 pb-4">
            <BrandLogo size={34} showText variant="client-dark" />
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {GRUPOS.map((g) => {
              const Icone = g.icon;
              const ativo = tela.grupo === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    const primeira = TELAS_PRANCHA_DESK.find((t) => t.grupo === g.id);
                    if (primeira) setAtiva(primeira.id);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left font-serif text-sm transition-colors",
                    ativo
                      ? "bg-gold text-navy"
                      : "text-cream/80 hover:bg-white/10 hover:text-cream",
                  )}
                >
                  <Icone className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{g.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Topo com busca e conta, como no mockup */}
          <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-cream/40 px-3 py-1.5">
              <Search className="h-4 w-4 shrink-0 text-navy/50" aria-hidden />
              <span className="truncate text-xs text-navy/50">Buscar caso, pessoa ou documento</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[10px] font-medium text-gold">
                TT
              </span>
              <span className="hidden text-xs text-navy/70 sm:inline">Tatiana Tosi</span>
              <ChevronDown className="h-4 w-4 text-navy/50" aria-hidden />
            </div>
          </header>

           <main className="p-4 pb-24 lg:p-6">
            <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-3xl leading-tight text-navy">
                  {tela.titulo}
                </h1>
                 <p className="mt-1 text-xs text-navy/60">Composição visual aprovada para adaptação no Desk</p>
              </div>
              <Etiqueta texto="Sem dados reais" tom="atencao" />
            </div>

            {/* Índice das telas convertidas */}
            <div className="mb-5 flex flex-wrap gap-2">
               {TELAS_PRANCHA_DESK.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAtiva(t.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] transition-colors",
                    t.id === tela.id
                      ? "border-navy bg-navy text-white"
                      : "border-navy/15 text-navy/70 hover:bg-cream",
                  )}
                >
                  {t.titulo}
                </button>
              ))}
            </div>

            {tela.render()}
          </main>
        </div>
      </div>

       <nav aria-label="Navegação móvel da prancha" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-navy/10 bg-card px-1 py-1.5 shadow-sm lg:hidden">
         {GRUPOS.map((grupo) => {
           const Icone = grupo.icon;
           const ativo = tela.grupo === grupo.id;
           return (
             <button
               key={grupo.id}
               type="button"
               aria-current={ativo ? "page" : undefined}
               aria-label={grupo.label}
               onClick={() => {
                 const primeira = TELAS_PRANCHA_DESK.find((item) => item.grupo === grupo.id);
                 if (primeira) setAtiva(primeira.id);
               }}
               className={cn(
                 "flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[8px] font-medium",
                 ativo ? "bg-gold/20 text-navy" : "text-navy/50",
               )}
             >
               <Icone className="h-4 w-4" aria-hidden />
               <span className="max-w-full truncate">{grupo.label.split(" ")[0]}</span>
             </button>
           );
         })}
       </nav>
    </div>
  );
}
