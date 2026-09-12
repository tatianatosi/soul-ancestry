/**
 * PRÉVIA VISUAL DO DESK — conversão das 12 telas do mockup aprovado em
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
} from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { cn } from "@/lib/utils";

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
        "rounded-xl border border-navy/10 bg-card p-4 shadow-[0_1px_2px_rgba(16,16,16,0.05)]",
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
  const pontos = [
    { x: 24, y: 72, total: 3, tom: "fill-sucesso" },
    { x: 48, y: 44, total: 6, tom: "fill-atencao" },
    { x: 72, y: 76, total: 12, tom: "fill-critico" },
    { x: 82, y: 28, total: 5, tom: "fill-gold" },
  ];
  return (
    <figure>
      <svg viewBox="0 0 360 250" className="block w-full" role="img" aria-label="Matriz de prioridade e elegibilidade com quatro grupos de casos">
        <rect x="42" y="16" width="292" height="190" rx="8" className="fill-cream/35 stroke-navy/15" />
        <rect x="188" y="16" width="146" height="95" className="fill-critico-suave/70" />
        <line x1="188" y1="16" x2="188" y2="206" className="stroke-navy/20" strokeDasharray="4 4" />
        <line x1="42" y1="111" x2="334" y2="111" className="stroke-navy/20" strokeDasharray="4 4" />
        <text x="261" y="31" textAnchor="middle" className="fill-critico text-[9px] font-medium">AÇÃO PRIORITÁRIA</text>
        {pontos.map((p) => {
          const cx = 42 + (p.x / 100) * 292;
          const cy = 206 - (p.y / 100) * 190;
          const raio = 10 + p.total * 0.65;
          return (
            <g key={`${p.x}-${p.y}`}>
              <circle cx={cx} cy={cy} r={raio} className={`${p.tom} opacity-80 stroke-card`} strokeWidth={3} />
              <text x={cx} y={cy + 3} textAnchor="middle" className="fill-card text-[9px] font-semibold">{p.total}</text>
            </g>
          );
        })}
        <text x="188" y="232" textAnchor="middle" className="fill-navy/60 text-[9px]">Elegibilidade →</text>
        <text x="13" y="111" textAnchor="middle" transform="rotate(-90 13 111)" className="fill-navy/60 text-[9px]">Urgência →</text>
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-3 text-[10px] text-navy/60">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-critico" />Crítico</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-atencao" />Atenção</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sucesso" />Acompanhamento</span>
        <span>Bolha = quantidade de casos</span>
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
      <div className="col-span-2"><Pessoa nome="Carlo Bianchi" papel="Ascendente" /></div>
      <div className="col-span-2"><Pessoa nome="Elena Rossi" papel="Cônjuge" /></div>
      <div className="col-span-4 mx-auto h-7 w-px bg-gold" />
      <div className="col-span-2 col-start-2 rounded-lg border border-gold/50 bg-gold/10 p-2"><Pessoa nome="Giulia Bianchi" papel="Requerente" /></div>
      <div className="col-span-4 mx-auto h-7 w-px bg-gold" />
      <div className="col-span-2"><Pessoa nome="Marina Bianchi" papel="Dependente" /></div>
      <div className="col-span-2"><Pessoa nome="João Bianchi" papel="Dependente" /></div>
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

/* ------------------------------------------------------------------ */
/* As 12 telas do mockup                                               */
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
          <Indicador rotulo="Vencidas" valor="2" apoio="prazo estourado" />
          <Indicador rotulo="Em cadência" valor="9" apoio="jornada ativa" />
          <Indicador rotulo="Sem próxima ação" valor="1" apoio="precisa de decisão" />
        </div>
        <div className={grade2}>
          <Cartao titulo="Decisões prioritárias">
            <Linha rotulo="Aprovar escopo — Família Bianchi" valor="Decidir" tom="critico" />
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
        <CabecalhoFerramenta titulo="Funil comercial vivo" apoio="Origem → Discovery → diagnóstico → proposta → contrato" acao="Novo lead" />
        <KanbanVisual colunas={[
          { titulo: "Leads", cartoes: [
            { titulo: "João Martins", contexto: "Portugal · indicação", responsavel: "Tatiana", prazo: "Hoje", etiqueta: "Responder", tom: "atencao" },
            { titulo: "Família Moretti", contexto: "Itália · campanha", responsavel: "Carla", prazo: "13 set", etiqueta: "Qualificar", anexos: 2 },
          ] },
          { titulo: "Discovery", cartoes: [
            { titulo: "Ana Luiza", contexto: "Mesa realizada · Áustria", responsavel: "Tatiana", prazo: "Hoje", etiqueta: "Handoff", tom: "atencao", anexos: 4 },
            { titulo: "Núcleo Rossi", contexto: "Call agendada · Itália", responsavel: "Camila", prazo: "14 set", etiqueta: "Agendado" },
          ] },
          { titulo: "Diagnóstico", cartoes: [
            { titulo: "Amigo do Danilo", contexto: "Aguarda certidão-base", responsavel: "Pesquisa", prazo: "16 set", etiqueta: "Documento", tom: "critico", anexos: 1 },
          ] },
          { titulo: "Proposta", cartoes: [
            { titulo: "Família Bianchi", contexto: "Escopo enviado · v3", responsavel: "Tatiana", prazo: "15 set", etiqueta: "Em análise", anexos: 3 },
          ] },
          { titulo: "Contrato", cartoes: [
            { titulo: "Núcleo Costa", contexto: "Aceite registrado", responsavel: "Operações", prazo: "17 set", etiqueta: "Onboarding", tom: "sucesso", anexos: 5 },
          ] },
        ]} />
      </div>
    ),
  },
  {
    id: "kanban",
    titulo: "Kanban operacional",
    grupo: "casos",
    rota: "/ops · /tarefas",
    render: () => (
      <div className="space-y-3">
        <CabecalhoFerramenta titulo="Trabalho dos casos" apoio="Próxima ação, responsável, prazo e bloqueio em uma única leitura" acao="Nova tarefa" />
        <KanbanVisual colunas={[
          { titulo: "Não iniciada", cartoes: [
            { titulo: "Conferir certidão-base", contexto: "CA-2026-ANA-001", responsavel: "Marina", prazo: "13 set", etiqueta: "Alta", tom: "atencao", anexos: 2 },
            { titulo: "Preparar linha familiar", contexto: "Família Bianchi", responsavel: "Pesquisa", prazo: "15 set", etiqueta: "Média" },
          ] },
          { titulo: "Em andamento", cartoes: [
            { titulo: "Validar grafia do ascendente", contexto: "Núcleo Rossi", responsavel: "Carla", prazo: "Hoje", etiqueta: "SLA em risco", tom: "atencao", anexos: 3 },
          ] },
          { titulo: "Bloqueada", cartoes: [
            { titulo: "Emitir relatório F1", contexto: "Falta transcrição da fonte", responsavel: "Joana", prazo: "12 set", etiqueta: "Bloqueio", tom: "critico", anexos: 1 },
          ] },
          { titulo: "Concluída", cartoes: [
            { titulo: "Registrar fonte paroquial", contexto: "Família Bianchi", responsavel: "Marina", prazo: "11 set", etiqueta: "Concluída", tom: "sucesso", anexos: 4 },
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
              <h2 className="truncate font-serif text-2xl text-navy">Família Bianchi</h2>
              <p className="mt-1 text-xs text-navy/60">
                Reconhecimento italiano · pesquisa e validação
              </p>
            </div>
            <Etiqueta texto="Dados demonstrativos" tom="atencao" />
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
              <Pessoa nome="Giulia Bianchi" papel="Requerente principal" />
              <Pessoa nome="Carlo Bianchi" papel="Ascendente direto" />
              <Pessoa nome="Marina Bianchi" papel="Dependente" />
              <Pessoa nome="Tatiana Tosi" papel="Responsável interna" />
            </div>
          </Cartao>
        </div>
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
            GB
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-2xl text-navy">Giulia Bianchi</h2>
            <p className="text-xs text-navy/60">Pessoa canônica · sem duplicidade</p>
          </div>
        </div>
        <div className={grade3}>
          <Cartao titulo="Identidade">
            <Linha rotulo="Nome civil" valor="Giulia Bianchi" />
            <Linha rotulo="Nascimento" valor="1990" />
            <Linha rotulo="Naturalidade" valor="Brasil" />
            <Linha rotulo="Confiança do dado" valor="Alta" tom="sucesso" />
          </Cartao>
          <Cartao titulo="Vínculos familiares">
            <ArvoreFamiliaGrafica />
          </Cartao>
          <Cartao titulo="Casos vinculados">
            <Linha rotulo="Reconhecimento italiano" valor="Ativo" tom="sucesso" />
            <Linha rotulo="Retificação de certidão" valor="Aguardando" tom="atencao" />
            <Linha rotulo="Dossiê do legado" valor="Em pesquisa" />
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
      <div className={grade2}>
        <Cartao titulo="Radar interno — 4 eixos da jornada">
          <RadarGrafico
            tituloAcessivel="Radar interno com quatro eixos da jornada"
            eixos={[
              { rotulo: "História familiar", valor: 72 },
              { rotulo: "Documentos", valor: 58 },
              { rotulo: "Estratégia", valor: 81 },
              { rotulo: "Próximos passos", valor: 64 },
            ]}
          />
          <p className="mt-3 border-t border-navy/10 pt-3 text-[11px] text-navy/55">
            Mesma construção visual do App Cliente, preservando os quatro eixos canônicos do Desk.
          </p>
        </Cartao>
        <Cartao titulo="Matriz elegibilidade × prioridade">
          <MatrizGrafica />
        </Cartao>
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
        <Cartao titulo="Cadeia de prova">
          <ol className="grid gap-2 sm:grid-cols-5">
            {["Fonte", "Transcrição", "Interpretação", "Hipótese", "Conclusão"].map((etapa, indice) => (
              <li key={etapa} className="relative rounded-lg border border-navy/10 bg-cream/40 p-2.5 text-center">
                <CheckCircle2 className={cn("mx-auto h-4 w-4", indice < 3 ? "text-sucesso" : "text-navy/25")} aria-hidden />
                <p className="mt-1 text-[10px] font-semibold text-navy">{etapa}</p>
                {indice < 4 ? <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-gold sm:block" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </Cartao>
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
            ["Acervo", "42", FileText], ["Bases genealógicas", "18", Search], ["Dicionários", "13", BookOpen],
            ["Trilhas", "11", Target], ["Regras jurídicas", "27", Scale],
          ].map(([nome, total, Icone]) => (
            <div key={String(nome)} className="rounded-lg border border-navy/10 bg-card p-3">
              <Icone className="h-4 w-4 text-gold" aria-hidden />
              <p className="mt-2 text-xs font-semibold text-navy">{String(nome)}</p>
              <p className="mt-1 font-serif text-2xl text-navy">{String(total)}</p>
              <p className="text-[9px] text-navy/50">itens vigentes</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Cartao titulo="Itens revisados recentemente">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[11px]">
                <thead className="border-b border-navy/10 text-[9px] uppercase text-navy/45">
                  <tr><th className="pb-2">Item</th><th className="pb-2">Área</th><th className="pb-2">Versão</th><th className="pb-2">Estado</th><th className="pb-2">Uso</th></tr>
                </thead>
                <tbody className="divide-y divide-navy/5 text-navy/70">
                  <tr><td className="py-2 font-medium text-navy">Registros civis da Toscana</td><td>Bases</td><td>v3.2</td><td><Etiqueta texto="Homologado" tom="sucesso" /></td><td>Pesquisa</td></tr>
                  <tr><td className="py-2 font-medium text-navy">Variações Bianchi / Bianco</td><td>Dicionário</td><td>v2.1</td><td><Etiqueta texto="Vigente" tom="sucesso" /></td><td>Pesquisa</td></tr>
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
      </div>
    ),
  },
  {
    id: "financeiro",
    titulo: "Financeiro",
    grupo: "contratos",
    rota: "/financeiro",
    render: () => (
      <div className={grade2}>
        <Cartao titulo="Valores do contrato">
          <Linha rotulo="Valor do contrato" valor="R$ 43.000,00" />
          <Linha rotulo="Já recebido" valor="R$ 9.500,00" tom="sucesso" />
          <Linha rotulo="A receber" valor="R$ 33.500,00" tom="atencao" />
          <Linha rotulo="Vencido" valor="R$ 0,00" tom="sucesso" />
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
    ),
  },
  {
    id: "juridico",
    titulo: "Jurídico & Contrato",
    grupo: "contratos",
    rota: "/contratos",
    render: () => (
      <div className={grade2}>
        <Cartao titulo="Escopo e assinatura">
          <Linha rotulo="Contrato-base v2" valor="Vigente" tom="sucesso" />
          <Linha rotulo="Anexo I — escopo" valor="Assinado" tom="sucesso" />
          <Linha rotulo="Anexo IV — condições" valor="Assinado" tom="sucesso" />
          <Linha rotulo="Aditivo de dependente" valor="Pendente" tom="atencao" />
        </Cartao>
        <Cartao titulo="Validação jurídica">
          <Linha rotulo="Cadeia documental completa" valor="Validado" tom="sucesso" />
          <Linha rotulo="Retificação necessária" valor="Em análise" tom="atencao" />
          <Linha rotulo="Tradução juramentada" valor="Pendente" tom="critico" />
          <Linha rotulo="Apostilamento" valor="Pendente" tom="critico" />
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
        <div className={grade3}>
          <Cartao titulo="Geração 1">
            <div className="space-y-3">
              <Pessoa nome="Carlo Bianchi" papel="Ascendente italiano" />
              <Pessoa nome="Elena Rossi" papel="Cônjuge" />
            </div>
          </Cartao>
          <Cartao titulo="Geração 2">
            <div className="space-y-3">
              <Pessoa nome="Giulia Bianchi" papel="Requerente" />
              <Pessoa nome="Paulo Tavares" papel="Cônjuge" />
            </div>
          </Cartao>
          <Cartao titulo="Geração 3">
            <div className="space-y-3">
              <Pessoa nome="Marina Bianchi" papel="Dependente" />
              <Pessoa nome="João Bianchi" papel="Dependente" />
            </div>
          </Cartao>
        </div>
        <Cartao titulo="Árvore visual do núcleo">
          <ArvoreFamiliaGrafica />
          <div className="mt-4 border-t border-navy/10 pt-3">
            <Linha rotulo="Núcleo Bianchi — dossiê-mãe" valor="Ativo" tom="sucesso" />
            <Linha rotulo="Núcleo Rossi — possível duplicidade" valor="Revisar" tom="atencao" />
          </div>
        </Cartao>
      </div>
    ),
  },
  {
    id: "portal",
    titulo: "Portal do cliente (visão interna)",
    grupo: "casos",
    rota: "/acessos-portal",
    render: () => (
      <div className={grade2}>
        <Cartao titulo="Acessos concedidos">
          <Linha rotulo="Giulia Bianchi" valor="Ativo" tom="sucesso" />
          <Linha rotulo="Paulo Tavares" valor="Convite enviado" tom="atencao" />
          <Linha rotulo="Marina Bianchi" valor="Sem acesso" />
        </Cartao>
        <Cartao titulo="Conteúdo publicado no App">
          <Linha rotulo="Resumo da jornada" valor="Publicado" tom="sucesso" />
          <Linha rotulo="Documentos solicitados" valor="Publicado" tom="sucesso" />
          <Linha rotulo="Achado genealógico" valor="Aguardando aprovação" tom="atencao" />
          <p className="mt-3 text-[11px] text-navy/55">
            O cliente vê apenas o que está publicado e sanitizado.
          </p>
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
      <div className="space-y-4">
        <Cartao titulo="Progresso da jornada">
          <ProgressoJornadaGrafico />
        </Cartao>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Cartao titulo="Radar Ancestral — 6 dimensões">
            <RadarGrafico
              tituloAcessivel="Radar Ancestral com seis dimensões da jornada do cliente"
              eixos={[
                { rotulo: "Documentação", valor: 68 },
                { rotulo: "Origem", valor: 92 },
                { rotulo: "Conexões", valor: 54 },
                { rotulo: "Elegibilidade", valor: 66 },
                { rotulo: "Memória", valor: 78 },
                { rotulo: "Legado", valor: 48 },
              ]}
            />
          </Cartao>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Cartao titulo="Jornada">
            <Linha rotulo="Etapa atual: documentos" />
            <Linha rotulo="Próximo passo definido" valor="Sim" tom="sucesso" />
          </Cartao>
          <Cartao titulo="Documentos solicitados">
            <Linha rotulo="Certidão de nascimento" valor="Recebido" tom="sucesso" />
            <Linha rotulo="Certidão de casamento" valor="Pendente" tom="atencao" />
          </Cartao>
          <Cartao titulo="Mensagens">
            <Linha rotulo="Atualização da pesquisa" valor="Nova" tom="atencao" />
            <Linha rotulo="Confirmação de recebimento" valor="Lida" />
          </Cartao>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "configuracao",
    titulo: "Configuração & Acesso",
    grupo: "governanca",
    rota: "/configuracoes",
    render: () => (
      <div className={grade2}>
        <Cartao titulo="Papéis e permissões">
          <Linha rotulo="Administração" valor="Acesso total" tom="sucesso" />
          <Linha rotulo="Operações" valor="Escrita" tom="sucesso" />
          <Linha rotulo="Pesquisa" valor="Escrita" tom="sucesso" />
          <Linha rotulo="Leitura" valor="Somente leitura" />
        </Cartao>
        <Cartao titulo="Registro de auditoria">
          <Linha rotulo="Alteração de escopo" valor="12/09" />
          <Linha rotulo="Publicação no App" valor="11/09" />
          <Linha rotulo="Acesso concedido" valor="10/09" />
          <p className="mt-3 text-[11px] text-navy/55">
            Todo registro guarda autor, data e conteúdo anterior.
          </p>
        </Cartao>
      </div>
    ),
  },
] as const;

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
  const [ativa, setAtiva] = useState(TELAS_PREVIA_DESK[0]!.id);
  const tela = TELAS_PREVIA_DESK.find((t) => t.id === ativa) ?? TELAS_PREVIA_DESK[0]!;

  return (
    <div className="min-h-screen bg-background font-sans text-navy">
      <div className="bg-terracotta px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-cream">
        Prévia visual do Desk · guia de marca oficial · dados demonstrativos
      </div>

      <div className="lg:flex">
        {/* Barra lateral navy com o logo oficial */}
        <aside className="bg-navy px-3 py-4 lg:min-h-[calc(100vh-2rem)] lg:w-64 lg:shrink-0">
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
                    const primeira = TELAS_PREVIA_DESK.find((t) => t.grupo === g.id);
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

          <main className="p-4 lg:p-6">
            <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-3xl leading-tight text-navy">
                  {tela.titulo}
                </h1>
                <p className="mt-1 text-xs text-navy/60">
                  Equivalente no Desk: <span className="font-medium">{tela.rota}</span>
                </p>
              </div>
              <Etiqueta texto="Sem dados reais" tom="atencao" />
            </div>

            {/* Índice das 12 telas convertidas */}
            <div className="mb-5 flex flex-wrap gap-2">
              {TELAS_PREVIA_DESK.map((t) => (
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
    </div>
  );
}
