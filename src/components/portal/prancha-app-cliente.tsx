import type { ComponentType, ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Check,
  CircleUserRound,
  FileText,
  Home,
  Route as RouteIcon,
  Radar,
  Trees,
} from "lucide-react";

import { BrandLogo } from "@/components/brand";
import "./prancha-app-cliente.css";

export const TELAS_PRANCHA_APP = [
  "home",
  "jornada",
  "radar",
  "arvore",
  "documentos",
  "legado",
  "conta",
] as const;

export type TelaPranchaApp = (typeof TELAS_PRANCHA_APP)[number];
export type FormatoPranchaApp = "desktop" | "mobile";

type NavItem = {
  id: TelaPranchaApp;
  label: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const NAV: NavItem[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "jornada", label: "Jornada", Icon: RouteIcon },
  { id: "radar", label: "Radar", Icon: Radar },
  { id: "arvore", label: "Árvore", Icon: Trees },
  { id: "documentos", label: "Documentos", Icon: FileText },
  { id: "legado", label: "Legado", Icon: BookOpen },
  { id: "conta", label: "Conta", Icon: CircleUserRound },
];

const TITULOS: Record<TelaPranchaApp, { titulo: string; descricao: string }> = {
  home: { titulo: "Sua jornada", descricao: "Acompanhe o que já foi publicado e o que vem a seguir." },
  jornada: { titulo: "Jornada", descricao: "A história da família e o acompanhamento do seu caso." },
  radar: { titulo: "Radar Ancestral", descricao: "Uma leitura simples das seis dimensões da sua jornada." },
  arvore: { titulo: "Árvore", descricao: "Gerações e conexões liberadas para a família." },
  documentos: { titulo: "Documentos", descricao: "Pedidos, recebimentos e materiais liberados em um só lugar." },
  legado: { titulo: "Legado", descricao: "Conteúdos publicados para preservar e compartilhar em família." },
  conta: { titulo: "Conta", descricao: "Seu perfil, preferências e histórico de acesso." },
};

function Badge({ children, gold = false }: { children: ReactNode; gold?: boolean }) {
  return <span className={gold ? "cap-badge cap-badge--gold" : "cap-badge"}>{children}</span>;
}

function Card({ eyebrow, title, children, className = "" }: { eyebrow?: string; title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`cap-card ${className}`.trim()}>
      {eyebrow ? <p className="cap-eyebrow">{eyebrow}</p> : null}
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="cap-empty">{children}</div>;
}

function Shell({ tela, formato, children }: { tela: TelaPranchaApp; formato: FormatoPranchaApp; children: ReactNode }) {
  const titulo = TITULOS[tela];
  return (
    <article className={`cap-screen cap-screen--${formato}`} data-capture={`${tela}-${formato}`}>
      <aside className="cap-sidebar">
        <BrandLogo size={34} variant="client-dark" showText={false} />
        <p className="cap-brand-name">Clube Ancestral</p>
        <nav aria-label="Navegação do aplicativo do cliente">
          {NAV.map(({ id, label, Icon }) => (
            <span key={id} className={id === tela ? "cap-nav-item is-active" : "cap-nav-item"}>
              <Icon className="cap-nav-icon" aria-hidden />
              {label}
            </span>
          ))}
        </nav>
      </aside>

      <div className="cap-page">
        <header className="cap-header">
          <div className="cap-mobile-brand">
            <BrandLogo size={30} variant="client-dark" showText={false} />
            <span>Clube Ancestral</span>
          </div>
          <div>
            <p className="cap-kicker">Aplicativo da família</p>
            <h1>{titulo.titulo}</h1>
            <p>{titulo.descricao}</p>
          </div>
          <span className="cap-avatar" aria-label="Conta da família"><CircleUserRound aria-hidden /></span>
        </header>
        <main className="cap-content">{children}</main>
      </div>

      <nav className="cap-bottom-nav" aria-label="Navegação do aplicativo do cliente">
        {NAV.map(({ id, label, Icon }) => (
          <span key={id} className={id === tela ? "cap-bottom-item is-active" : "cap-bottom-item"}>
            <Icon aria-hidden />
            <span>{label}</span>
          </span>
        ))}
      </nav>
    </article>
  );
}

function HomeTela() {
  return (
    <div className="cap-stack">
      <section className="cap-welcome">
        <div>
          <p className="cap-eyebrow">Acompanhamento da família</p>
          <h2>Uma história em construção</h2>
          <p>As atualizações liberadas pela equipe aparecem aqui, com linguagem simples e segura.</p>
        </div>
        <div className="cap-progress" aria-label="Progresso sem percentual">
          <span>Etapa atual</span><strong>Pesquisa em andamento</strong><i><b /></i>
        </div>
      </section>
      <div className="cap-grid cap-grid--3">
        <Card eyebrow="Próxima ação" title="Aguardar a próxima atualização"><p>Nenhuma ação da família é necessária neste momento.</p></Card>
        <Card eyebrow="Achados" title="Em preparação"><p>Achados aparecem somente depois de revisados e publicados.</p></Card>
        <Card eyebrow="Microentrega" title="Nenhuma publicação nova"><p>A próxima entrega aparecerá aqui quando estiver disponível.</p></Card>
      </div>
      <Card eyebrow="Legado publicado" title="Biblioteca da família">
        <Empty>Ainda não há material publicado nesta coleção.</Empty>
      </Card>
    </div>
  );
}

function JornadaTela() {
  const passos = ["Início", "Pesquisa", "Conferência", "Entrega"];
  return (
    <div className="cap-stack">
      <Card className="cap-step-card">
        <ol className="cap-stepper">
          {passos.map((passo, index) => <li key={passo} className={index < 2 ? "is-done" : index === 2 ? "is-current" : ""}><span>{index < 2 ? <Check aria-hidden /> : index + 1}</span><b>{passo}</b></li>)}
        </ol>
      </Card>
      <div className="cap-journey-grid">
        <Card eyebrow="Passado familiar" title="Linha ancestral">
          <ol className="cap-timeline cap-timeline--gold">
            <li><b>Memórias da família</b><p>Registros aparecem quando já foram validados para publicação.</p></li>
            <li><b>Conexões entre gerações</b><p>A linha cresce conforme novas relações são liberadas.</p></li>
          </ol>
        </Card>
        <div className="cap-union"><span />União de Ramos<span /></div>
        <Card eyebrow="Presente" title="Seu acompanhamento">
          <ol className="cap-timeline cap-timeline--navy">
            <li><b>Pesquisa em andamento</b><p>A equipe está organizando a próxima atualização.</p></li>
            <li><b>Próxima ação</b><p>Aguardar a publicação de um novo marco.</p></li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

const EIXOS = ["Documentação", "Origem", "Conexões Familiares", "Elegibilidade", "Memória", "Legado"];

function RadarVisual() {
  const points = "150,43 232,92 223,190 150,228 74,193 63,96";
  return (
    <svg className="cap-radar" viewBox="0 0 300 270" role="img" aria-label="Radar com seis eixos, sem percentuais">
      {[0.3, 0.55, 0.8, 1].map((scale) => (
        <polygon key={scale} points={points} transform={`translate(${150 * (1 - scale)} ${135 * (1 - scale)}) scale(${scale})`} />
      ))}
      <polygon className="cap-radar-shape" points="150,72 211,105 202,174 150,204 93,175 86,108" />
      {[[150,43],[232,92],[223,190],[150,228],[74,193],[63,96]].map(([x,y]) => <line key={`${x}-${y}`} x1="150" y1="135" x2={x} y2={y} />)}
    </svg>
  );
}

function RadarTela() {
  return (
    <div className="cap-radar-layout">
      <Card eyebrow="Visão da jornada" title="Seis dimensões"><RadarVisual /><p className="cap-note">O desenho representa apenas a composição visual. Nenhum percentual é estimado.</p></Card>
      <div className="cap-axis-list">
        {EIXOS.map((eixo, index) => <article key={eixo}><span>{index + 1}</span><div><b>{eixo}</b><p>{eixo === "Elegibilidade" ? "Leitura informativa, sem parecer ou promessa." : "Atualizada somente com informação publicada."}</p></div><Badge>{index < 3 ? "Em organização" : "A publicar"}</Badge></article>)}
      </div>
    </div>
  );
}

function ArvoreTela() {
  return (
    <div className="cap-stack">
      <div className="cap-tree-meta"><Badge gold>G1–G5</Badge><p>A árvore mostra somente nomes e vínculos já liberados.</p></div>
      <Card className="cap-tree-card">
        <div className="cap-tree">
          {[1,2,4,4,3].map((quantidade, index) => (
            <div className="cap-generation" key={index}>
              <span className="cap-generation-label">G{index + 1}</span>
              <div>{Array.from({ length: quantidade }).map((_, i) => <span className={index === 0 ? "cap-node is-root" : "cap-node"} key={i}>{index === 0 ? "Você" : index < 3 ? "Em pesquisa" : "A publicar"}</span>)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card eyebrow="Ligação com a Jornada" title="Próxima atualização"><p>Uma nova conexão aparecerá quando estiver pronta para a família.</p></Card>
    </div>
  );
}

function DocumentosTela() {
  const grupos = [
    ["Solicitados", "Nenhuma solicitação aberta", "A equipe avisará quando uma ação for necessária."],
    ["Recebidos", "Nenhum envio recente", "Itens compartilhados pela família aparecem aqui."],
    ["Liberados", "Nenhum documento liberado", "Documentos revisados aparecem quando publicados."],
    ["Entregas", "Nenhuma entrega disponível", "Materiais finais ficam disponíveis para consulta."],
  ];
  return <div className="cap-document-grid">{grupos.map(([title, empty, help]) => <Card key={title} eyebrow="Documentos" title={title}><Empty><b>{empty}</b><span>{help}</span></Empty></Card>)}</div>;
}

function LegadoTela() {
  return (
    <div className="cap-stack">
      <section className="cap-library-intro"><BookOpen aria-hidden /><div><p className="cap-eyebrow">Biblioteca da família</p><h2>Seu legado, organizado por coleção</h2><p>Somente conteúdos publicados ficam disponíveis para consulta.</p></div></section>
      <div className="cap-shelves">
        {["Cadernos", "Relatórios", "Narrativas", "Memória"].map((item) => <Card key={item} eyebrow="Coleção" title={item}><Empty>Nenhum conteúdo publicado ainda.</Empty></Card>)}
      </div>
      <Card eyebrow="Continuidade" title="A coleção cresce com a Jornada"><p>Novas publicações entram na prateleira correspondente depois da liberação.</p></Card>
    </div>
  );
}

function ContaTela() {
  return (
    <div className="cap-account-grid">
      <Card eyebrow="Perfil" title="Dados da conta"><dl className="cap-details"><div><dt>Titular</dt><dd>Informação protegida</dd></div><div><dt>Preferência</dt><dd>Não informada</dd></div></dl></Card>
      <Card eyebrow="Plano" title="Acompanhamento"><p>Os detalhes aparecem quando publicados para esta conta.</p><Badge>Acesso ativo</Badge></Card>
      <Card eyebrow="Avisos" title="Atualizações para você"><Empty>Nenhum aviso publicado no momento.</Empty></Card>
      <Card eyebrow="Histórico" title="Movimentos disponíveis"><Empty>Nenhum movimento publicado para consulta.</Empty></Card>
      <Card eyebrow="Preferências" title="Comunicação"><p>Preferências podem ser confirmadas quando essa opção estiver disponível.</p></Card>
      <Card eyebrow="Família e convidados" title="Acessos autorizados"><Empty>Nenhum convite autorizado neste momento.</Empty></Card>
    </div>
  );
}

function ConteudoTela({ tela }: { tela: TelaPranchaApp }) {
  if (tela === "home") return <HomeTela />;
  if (tela === "jornada") return <JornadaTela />;
  if (tela === "radar") return <RadarTela />;
  if (tela === "arvore") return <ArvoreTela />;
  if (tela === "documentos") return <DocumentosTela />;
  if (tela === "legado") return <LegadoTela />;
  return <ContaTela />;
}

export function TelaAppCliente({ tela, formato }: { tela: TelaPranchaApp; formato: FormatoPranchaApp }) {
  return <Shell tela={tela} formato={formato}><ConteudoTela tela={tela} /></Shell>;
}

export function PranchaAppCliente({ formato = "desktop", tela }: { formato?: FormatoPranchaApp; tela?: TelaPranchaApp }) {
  if (tela) return <div className="cap-single" data-visual-kit="pantone"><TelaAppCliente tela={tela} formato={formato} /></div>;
  return (
    <div className={`cap-board cap-board--${formato}`} data-visual-kit="pantone">
      <header className="cap-board-header"><p>Clube Ancestral</p><h1>Prancha de aceite · App Cliente</h1><span>{formato === "desktop" ? "Desktop" : "Mobile"} · 7 telas canônicas</span></header>
      <div className="cap-board-grid">
        {TELAS_PRANCHA_APP.map((item, index) => <section className="cap-board-cell" key={item}><p>{String(index + 1).padStart(2, "0")} · {TITULOS[item].titulo}</p><div className="cap-board-viewport"><TelaAppCliente tela={item} formato={formato} /></div></section>)}
      </div>
    </div>
  );
}