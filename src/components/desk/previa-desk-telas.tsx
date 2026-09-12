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
  LayoutDashboard,
  Target,
  FolderOpen,
  Library,
  Scale,
  ShieldCheck,
  Search,
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
      <div className="grid gap-3 md:grid-cols-5">
        {[
          { etapa: "Leads", itens: ["Origem: indicação", "Origem: Ads"], tom: "neutro" as Tom },
          { etapa: "Discovery", itens: ["Mesa agendada", "Mesa realizada"], tom: "atencao" as Tom },
          { etapa: "Diagnóstico", itens: ["Linhagem provável", "Aguarda documento"], tom: "atencao" as Tom },
          { etapa: "Proposta", itens: ["Enviada", "Em análise"], tom: "neutro" as Tom },
          { etapa: "Contrato", itens: ["Assinado", "Onboarding"], tom: "sucesso" as Tom },
        ].map((coluna) => (
          <div key={coluna.etapa} className="rounded-xl border border-navy/10 bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-serif text-sm text-navy">{coluna.etapa}</h3>
              <Etiqueta texto={String(coluna.itens.length)} />
            </div>
            <div className="space-y-2">
              {coluna.itens.map((item) => (
                <div key={item} className="rounded-lg border border-navy/10 bg-cream/50 p-2">
                  <p className="text-[11px] font-medium text-navy">{item}</p>
                  <p className="mt-1 text-[10px] text-navy/55">Próxima ação definida</p>
                  <div className="mt-2">
                    <Etiqueta texto="Demonstrativo" tom={coluna.tom} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
            <Linha rotulo="Contrato assinado" valor="21/03" tom="sucesso" />
            <Linha rotulo="Onboarding concluído" valor="04/04" tom="sucesso" />
            <Linha rotulo="Pesquisa em arquivo civil" valor="18/05" tom="atencao" />
            <Linha rotulo="Certidões solicitadas" valor="02/06" tom="atencao" />
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
            <div className="space-y-3">
              <Pessoa nome="Carlo Bianchi" papel="Pai" />
              <Pessoa nome="Renata Bianchi" papel="Mãe" />
              <Pessoa nome="Marina Bianchi" papel="Filha" />
            </div>
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
        <Cartao titulo="Radar interno — eixos canônicos">
          <div className="space-y-2">
            {[
              ["Risco documental", 62],
              ["Elegibilidade", 84],
              ["Prioridade", 71],
              ["Evidência", 55],
              ["Prazo", 40],
            ].map(([eixo, v]) => (
              <div key={String(eixo)}>
                <div className="flex items-center justify-between text-[11px] text-navy/70">
                  <span>{eixo}</span>
                  <span className="tabular-nums">{v}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-cream">
                  <div
                    className="h-2 rounded-full bg-navy"
                    style={{ width: `${Number(v)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Cartao>
        <Cartao titulo="Matriz elegibilidade × prioridade">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[12, 6, 3, 8, 15, 5, 2, 9, 14].map((n, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg border p-4 font-serif text-lg tabular-nums",
                  i % 4 === 0 ? TOM.sucesso : i % 3 === 0 ? TOM.critico : TOM.neutro,
                )}
              >
                {n}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-navy/55">
            Distribuição demonstrativa dos casos por faixa.
          </p>
        </Cartao>
      </div>
    ),
  },
  {
    id: "pesquisa",
    titulo: "Pesquisa",
    grupo: "pesquisa",
    rota: "/pesquisa-modulo",
    render: () => (
      <div className={grade3}>
        <Cartao titulo="Fontes consultadas">
          <Linha rotulo="Arquivo paroquial — Lucca" valor="Confirmada" tom="sucesso" />
          <Linha rotulo="Registro civil — Santos" valor="Confirmada" tom="sucesso" />
          <Linha rotulo="Lista de imigração" valor="Em leitura" tom="atencao" />
          <Linha rotulo="Arquivo militar" valor="Hipótese" />
        </Cartao>
        <Cartao titulo="Hipóteses em aberto">
          <Linha rotulo="Grafia alternativa do sobrenome" valor="Provável" tom="atencao" />
          <Linha rotulo="Segundo casamento do ascendente" valor="A confirmar" />
          <Linha rotulo="Naturalização antes do nascimento" valor="Refutada" tom="critico" />
        </Cartao>
        <Cartao titulo="Confiança da cadeia">
          <p className="font-serif text-4xl leading-none tabular-nums text-navy">4,5</p>
          <p className="mt-1 text-[11px] text-navy/55">
            Escala interna de 1 a 5 · dado demonstrativo
          </p>
          <div className="mt-3 space-y-1">
            <Linha rotulo="Geração 1" valor="Documentada" tom="sucesso" />
            <Linha rotulo="Geração 2" valor="Documentada" tom="sucesso" />
            <Linha rotulo="Geração 3" valor="Parcial" tom="atencao" />
          </div>
        </Cartao>
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
        <Cartao titulo="Núcleos relacionados">
          <Linha rotulo="Núcleo Bianchi — dossiê-mãe" valor="Ativo" tom="sucesso" />
          <Linha rotulo="Núcleo Rossi — possível duplicidade" valor="Revisar" tom="atencao" />
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
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Assinatura", "Concluído"],
              ["Onboarding", "Concluído"],
              ["Documentos", "Em andamento"],
              ["Protocolo", "A iniciar"],
            ].map(([etapa, estado], i) => (
              <div key={etapa} className="rounded-xl border border-navy/10 bg-cream/50 p-3">
                <p className="font-serif text-sm text-navy">{etapa}</p>
                <div className="mt-2">
                  <Etiqueta
                    texto={estado}
                    tom={i < 2 ? "sucesso" : i === 2 ? "atencao" : "neutro"}
                  />
                </div>
              </div>
            ))}
          </div>
        </Cartao>
        <div className={grade3}>
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
