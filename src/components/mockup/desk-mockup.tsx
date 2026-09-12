/**
 * MOCKUP — DESK INTELLIGENCE (VISUAL-ONLY)
 *
 * 7 abas principais aprovadas. Todo módulo profundo (Propostas, Go-live,
 * Formalização, Checklist AppCliente, Financeiro, Radar, Integrações, Governança)
 * aparece como SUBABA contextual dentro de uma das 7 — nunca como aba nova.
 */
import { useState } from "react";
import { Bell, LayoutGrid, Library, ListChecks, Radio, Scale, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge, Barra, Card, Dot, Kpi, Lista, SubAbas, Tabela, Vazio } from "./ui";
import { RadarSvg } from "./radar";

type AbaId = "overview" | "crm" | "casos" | "checklist" | "juridica" | "alertas" | "biblio";

const ABAS: { id: AbaId; nome: string; icone: typeof LayoutGrid; sub: { id: string; nome: string }[] }[] = [
  {
    id: "overview",
    nome: "Visão Geral",
    icone: LayoutGrid,
    sub: [
      { id: "hoje", nome: "Painel Hoje" },
      { id: "radar", nome: "Radar Interno" },
      { id: "financeiro", nome: "Financeiro" },
      { id: "integracoes", nome: "Integrações" },
    ],
  },
  {
    id: "crm",
    nome: "CRM Vivo",
    icone: Radio,
    sub: [
      { id: "leads", nome: "Leads e triagem" },
      { id: "propostas", nome: "Propostas" },
      { id: "clientes", nome: "Clientes e núcleos" },
    ],
  },
  {
    id: "casos",
    nome: "Casos 360",
    icone: Users,
    sub: [
      { id: "lista", nome: "Casos" },
      { id: "ficha", nome: "Ficha do caso" },
      { id: "pesquisa", nome: "Pesquisa Genealógica e Evidências" },
      { id: "formalizacao", nome: "Formalização" },
      { id: "golive", nome: "Go-live" },
    ],
  },
  {
    id: "checklist",
    nome: "Checklist",
    icone: ListChecks,
    sub: [
      { id: "semanal", nome: "Semanal" },
      { id: "appcliente", nome: "Checklist AppCliente" },
      { id: "sla", nome: "SLA e exceções" },
    ],
  },
  {
    id: "juridica",
    nome: "Validação Jurídica",
    icone: Scale,
    sub: [
      { id: "matriz", nome: "Matriz jurídica" },
      { id: "dependentes", nome: "Dependentes" },
    ],
  },
  {
    id: "alertas",
    nome: "Alertas",
    icone: Bell,
    sub: [
      { id: "fila", nome: "Fila de achados" },
      { id: "comunicacao", nome: "Rascunhos" },
    ],
  },
  {
    id: "biblio",
    nome: "Biblioteca Mestre",
    icone: Library,
    sub: [
      { id: "acervo", nome: "Acervo" },
      { id: "governanca", nome: "Governança" },
      { id: "modelos", nome: "Modelos F1 / F2" },
    ],
  },
];

export function DeskMockup() {
  const [aba, setAba] = useState<AbaId>("overview");
  const [sub, setSub] = useState<string>("hoje");
  const atual = ABAS.find((a) => a.id === aba)!;

  return (
    <div className="mx-auto flex max-w-7xl gap-0 lg:gap-6 lg:px-4 lg:py-6">
      {/* Sidebar — 7 itens, nada além disso */}
      <aside className="hidden w-60 shrink-0 rounded-2xl bg-navy p-3 text-cream lg:block">
        <p className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.2em] text-cream/45">Desk Intelligence</p>
        <nav className="space-y-1">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAba(a.id);
                setSub(a.sub[0]!.id);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition",
                aba === a.id ? "bg-gold text-navy" : "text-cream/75 hover:bg-navy-soft",
              )}
            >
              <a.icone className="size-4" />
              {a.nome}
            </button>
          ))}
        </nav>
        <p className="mt-4 rounded-xl bg-navy-soft/60 px-3 py-2 text-[11px] leading-snug text-cream/60">
          7 abas principais. Módulos profundos vivem como subabas.
        </p>
      </aside>

      {/* Nav mobile */}
      <div className="w-full lg:hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-navy/10 bg-navy px-2 py-2">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAba(a.id);
                setSub(a.sub[0]!.id);
              }}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
                aba === a.id ? "bg-gold text-navy" : "text-cream/70",
              )}
            >
              {a.nome}
            </button>
          ))}
        </div>
        <Conteudo aba={aba} sub={sub} setSub={setSub} atual={atual} />
      </div>

      <main className="hidden min-w-0 flex-1 lg:block">
        <Conteudo aba={aba} sub={sub} setSub={setSub} atual={atual} />
      </main>
    </div>
  );
}

function Conteudo({
  aba,
  sub,
  setSub,
  atual,
}: {
  aba: AbaId;
  sub: string;
  setSub: (v: string) => void;
  atual: (typeof ABAS)[number];
}) {
  return (
    <div className="space-y-4 p-4 lg:p-0">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Aba principal</p>
        <h2 className="font-serif text-2xl text-navy">{atual.nome}</h2>
      </header>
      <SubAbas itens={atual.sub} atual={sub} onChange={setSub} />
      {aba === "overview" && <Overview sub={sub} />}
      {aba === "crm" && <Crm sub={sub} />}
      {aba === "casos" && <Casos sub={sub} />}
      {aba === "checklist" && <Checklist sub={sub} />}
      {aba === "juridica" && <Juridica sub={sub} />}
      {aba === "alertas" && <Alertas sub={sub} />}
      {aba === "biblio" && <Biblio sub={sub} />}
    </div>
  );
}

/* ------------------------------- VISÃO GERAL ------------------------------ */

function Overview({ sub }: { sub: string }) {
  if (sub === "radar") {
    return (
      <Card titulo="Radar Interno" eyebrow="Subaba de Visão Geral">
        <div className="grid gap-4 md:grid-cols-[300px_1fr]">
          <RadarSvg
            eixos={["Documentação", "Origem", "Conexões", "Elegibilidade", "Memória", "Legado"]}
            series={[
              { nome: "Ana", cor: "#FCB73A", valores: [72, 85, 64, 58, 45, 30] },
              { nome: "João", cor: "#8B4513", valores: [55, 60, 48, 70, 35, 22] },
              { nome: "Sophia", cor: "#2A3D63", valores: [88, 70, 76, 52, 60, 40] },
            ]}
          />
          <div className="space-y-2">
            <Lista
              itens={[
                { titulo: "Ana Luiza", nota: "Documentação em consolidação", badge: "Equilibrado", tom: "ok" },
                { titulo: "João", nota: "Origem pendente de confirmação", badge: "Atenção", tom: "atencao" },
                { titulo: "Sophia", nota: "Memória em curadoria", badge: "Equilibrado", tom: "ok" },
                { titulo: "Marina", nota: "Sem evidência vinculada", badge: "Bloqueio", tom: "critico" },
              ]}
            />
          </div>
        </div>
      </Card>
    );
  }
  if (sub === "financeiro") {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi rotulo="Receita do mês" valor="R$ 18.400" nota="Somente eventos homologados" />
          <Kpi rotulo="A receber" valor="R$ 7.200" />
          <Kpi rotulo="Despesas de terceiros" valor="R$ 1.860" nota="Estimativas, sem cobrança" />
        </div>
        <Card titulo="Eventos financeiros" eyebrow="Subaba de Visão Geral">
          <Tabela
            colunas={["Caso", "Evento", "Valor", "Estado"]}
            linhas={[
              ["CA-CID-AT-FAM-2026-001", "Fase 01", "R$ 6.900", <Badge tom="ok">Registrado</Badge>],
              ["CA-CID-IND-2026-002", "Diagnóstico", "R$ 1.200", <Badge tom="atencao">Aguardando</Badge>],
              ["CA-CID-FAM-2026-001", "Fase 02", "R$ 10.300", <Badge>Previsto</Badge>],
            ]}
          />
        </Card>
      </div>
    );
  }
  if (sub === "integracoes") {
    return (
      <Card titulo="Centro de integrações" eyebrow="Subaba de Visão Geral">
        <Lista
          itens={[
            { titulo: "Drive", nota: "Provisionamento de dossiê", badge: "Simulado", tom: "atencao" },
            { titulo: "Asaas", nota: "Eventos financeiros referenciados", badge: "Simulado", tom: "atencao" },
            { titulo: "WhatsApp", nota: "Somente rascunho, sem envio", badge: "Bloqueado", tom: "critico" },
            { titulo: "Importações", nota: "Migração de legado", badge: "Manual", tom: "neutro" },
          ]}
        />
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi rotulo="Casos ativos" valor="23" />
        <Kpi rotulo="Alertas pendentes" valor="7" nota="Nenhum envio automático" />
        <Kpi rotulo="Receita do mês" valor="R$ 18.400" />
        <Kpi rotulo="Conversão" valor="34%" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card titulo="Achados aguardando leitura humana" eyebrow="Painel Hoje">
          <Tabela
            colunas={["Cliente", "Tipo", "Dias"]}
            linhas={[
              ["Ana Luiza", "Registro civil", "3"],
              ["João Pedro", "Encontro de linhagem", "5"],
              ["Sophia", "Documento recebido", "1"],
              ["Marina", "Fonte institucional", "8"],
              ["Rafael", "Micro-entrega em revisão", "2"],
            ]}
          />
        </Card>
        <Card titulo="Prioridades de hoje" eyebrow="Painel Hoje">
          <Lista
            itens={[
              { titulo: "Revalidar proposta Canva — Ana", badge: "Crítico", tom: "critico" },
              { titulo: "Conferir representação de dependente", badge: "Crítico", tom: "critico" },
              { titulo: "Fechar checklist cadastral (38 itens)", badge: "Atenção", tom: "atencao" },
              { titulo: "Revisar micro-entrega de Sophia", badge: "Hoje", tom: "neutro" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------- CRM ---------------------------------- */

function Crm({ sub }: { sub: string }) {
  if (sub === "propostas") {
    return (
      <Card titulo="Propostas" eyebrow="Subaba de CRM Vivo">
        <Tabela
          colunas={["Caso", "Versão", "Páginas 1–7", "Validade", "Estado"]}
          linhas={[
            ["Ana Luiza", "v3", "7/7", "19/08/2026", <Badge tom="critico">Vencida</Badge>],
            ["João Pedro", "v1", "5/7", "12/09/2026", <Badge tom="atencao">Incompleta</Badge>],
            ["Sophia", "v2", "7/7", "30/09/2026", <Badge tom="ok">Vigente</Badge>],
          ]}
        />
      </Card>
    );
  }
  if (sub === "clientes") {
    return (
      <Card titulo="Clientes e núcleos familiares" eyebrow="Subaba de CRM Vivo">
        <Tabela
          colunas={["Núcleo", "Contratante", "Participantes", "Dependentes"]}
          linhas={[
            ["Silveira", "Ana Luiza", "4", <Badge tom="atencao">1 pendente</Badge>],
            ["Barbosa", "João Pedro", "2", <Badge tom="ok">—</Badge>],
            ["Ferrari", "Sophia", "3", <Badge tom="ok">representado</Badge>],
          ]}
        />
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi rotulo="Novos" valor="12" />
        <Kpi rotulo="Em triagem" valor="8" />
        <Kpi rotulo="Discovery" valor="5" />
        <Kpi rotulo="Aceite" valor="3" />
      </div>
      <Card titulo="Leads em movimento" eyebrow="Eixo comercial">
        <Tabela
          colunas={["ID", "Lead", "Origem", "Etapa", "Próxima ação"]}
          linhas={[
            ["CA-LEAD-2026-0001", "Ana Luiza", "Indicação", <Badge tom="gold">Aceite</Badge>, "Revalidar proposta"],
            ["CA-LEAD-2026-0014", "João Pedro", "Instagram", <Badge>Discovery</Badge>, "Agendar call"],
            ["CA-LEAD-2026-0021", "Marina", "Formulário", <Badge>Triagem</Badge>, "Qualificar origem"],
          ]}
        />
      </Card>
    </div>
  );
}

/* -------------------------------- CASOS 360 ------------------------------- */

function Casos({ sub }: { sub: string }) {
  if (sub === "ficha") {
    return (
      <div className="space-y-4">
        <Card titulo="CA-CID-AT-FAM-2026-001 — Ana Luiza" eyebrow="Ficha canônica">
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo r="País alvo" v="Áustria" />
            <Campo r="Trilha" v="Familiar" />
            <Campo r="Estágio" v="Preparação de instrumentos" />
            <Campo r="Produto-pai" v="Pesquisa Ancestral" />
            <Campo r="Responsável" v="Equipe Desk" />
            <Campo r="Próxima ação" v="Revalidar proposta" />
          </div>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card titulo="Pessoas do núcleo" eyebrow="Aba interna">
            <Lista
              itens={[
                { titulo: "Ana Luiza", nota: "Contratante", badge: "Completo", tom: "ok" },
                { titulo: "Adair Pinto Silveira Júnior", nota: "Ascendente", badge: "Completo", tom: "ok" },
                { titulo: "Alice", nota: "Participante", badge: "Completo", tom: "ok" },
                { titulo: "Felipe", nota: "Dependente", badge: "Representação pendente", tom: "critico" },
              ]}
            />
          </Card>
          <Card titulo="Linha do tempo" eyebrow="Aba interna">
            <Lista
              itens={[
                { titulo: "Lead registrado", nota: "12/06/2026" },
                { titulo: "Discovery concluído", nota: "28/06/2026" },
                { titulo: "Proposta apresentada", nota: "19/07/2026" },
                { titulo: "Gate de formalização", nota: "Bloqueado", badge: "Bloqueio", tom: "critico" },
              ]}
            />
          </Card>
        </div>
      </div>
    );
  }
  if (sub === "pesquisa") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card titulo="Documentos-fonte" eyebrow="Pesquisa transversal">
          <Tabela
            colunas={["Documento", "Pessoa", "Qualidade", "Vínculos"]}
            linhas={[
              ["Certidão de nascimento", "Adair", <Badge tom="ok">Alta</Badge>, "2"],
              ["Registro paroquial", "Não identificada", <Badge tom="atencao">Média</Badge>, "1"],
              ["Passaporte antigo", "Ana Luiza", <Badge tom="ok">Alta</Badge>, "0"],
            ]}
          />
        </Card>
        <Card titulo="Solicitações e plano de ação" eyebrow="Pesquisa transversal">
          <Lista
            itens={[
              { titulo: "Arquivo Municipal — Linz", nota: "Preparada, sem envio", badge: "Rascunho", tom: "atencao" },
              { titulo: "Cartório — Porto Alegre", nota: "Recebida", badge: "Concluída", tom: "ok" },
              { titulo: "Paróquia — Viena", nota: "Aguardando decisão humana", badge: "Pendente", tom: "neutro" },
            ]}
          />
        </Card>
      </div>
    );
  }
  if (sub === "formalizacao") {
    return (
      <Card titulo="Preparação contratual" eyebrow="Subaba de Casos 360">
        <Lista
          itens={[
            { titulo: "Proposta vigente", nota: "Validade expirada em 19/08", badge: "Bloqueio", tom: "critico" },
            { titulo: "Cadastro por pessoa", nota: "38 itens pendentes", badge: "Bloqueio", tom: "critico" },
            { titulo: "Condição comercial", nota: "Preço homologado", badge: "OK", tom: "ok" },
            { titulo: "Matriz jurídica", nota: "12 temas revisados", badge: "OK", tom: "ok" },
            { titulo: "Dependentes", nota: "Felipe sem representação documentada", badge: "Bloqueio", tom: "critico" },
          ]}
        />
        <p className="mt-3 text-xs text-navy/55">
          Prévia interna apenas. Nenhum contrato, OS, assinatura ou cobrança é gerado nesta tela.
        </p>
      </Card>
    );
  }
  if (sub === "golive") {
    return (
      <Card titulo="Gates de ativação" eyebrow="Subaba de Casos 360">
        <div className="space-y-3">
          <Barra valor={60} rotulo="Prontidão do caso" />
          <Lista
            itens={[
              { titulo: "Consentimento registrado", badge: "OK", tom: "ok" },
              { titulo: "Contrato assinado", badge: "Pendente", tom: "critico" },
              { titulo: "Pagamento confirmado", badge: "Pendente", tom: "critico" },
              { titulo: "Dossiê provisionado", badge: "Em fila", tom: "atencao" },
              { titulo: "Acesso ao App Cliente", badge: "Bloqueado", tom: "critico" },
            ]}
          />
        </div>
      </Card>
    );
  }
  return (
    <Card titulo="Casos" eyebrow="Lista operacional">
      <Tabela
        colunas={["Caso", "País", "Estágio", "Saúde", "Próxima ação", "Ticket"]}
        linhas={[
          [
            "CA-CID-AT-FAM-2026-001",
            "Áustria",
            "Formalização",
            <Dot tom="critico" />,
            "Revalidar proposta",
            "R$ 17.200",
          ],
          ["CA-CID-IND-2026-002", "Itália", "Pesquisa", <Dot tom="ok" />, "Conferir achado", "R$ 6.900"],
          ["CA-CID-FAM-2026-001", "Portugal", "Fase 02", <Dot tom="atencao" />, "Fechar relatório", "R$ 12.400"],
          ["CA-CID-IND-2026-007", "Itália", "Go-live", <Dot tom="ok" />, "Provisionar dossiê", "R$ 5.400"],
          ["CA-CID-IND-2026-011", "Espanha", "Discovery", <Dot tom="atencao" />, "Qualificar origem", "—"],
          ["CA-DEMO-CID-FAM-2026-001", "Áustria", "Fixture", <Dot />, "—", "—"],
        ]}
      />
    </Card>
  );
}

function Campo({ r, v }: { r: string; v: string }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-navy/45">{r}</p>
      <p className="text-sm text-navy">{v}</p>
    </div>
  );
}

/* -------------------------------- CHECKLIST ------------------------------- */

function Checklist({ sub }: { sub: string }) {
  if (sub === "appcliente") {
    return (
      <Card titulo="O que o cliente vê" eyebrow="Subaba de Checklist">
        <Tabela
          colunas={["Tela do App", "Estado", "Origem"]}
          linhas={[
            ["Home", <Badge tom="ok">Disponível</Badge>, "Projeção autorizada"],
            ["Jornada", <Badge tom="ok">Disponível</Badge>, "Projeção autorizada"],
            ["Documentos", <Badge tom="atencao">Vazio sanitizado</Badge>, "Sem entrega publicada"],
            ["Relatório Fase 01", <Badge tom="atencao">Em preparação</Badge>, "Não publicado"],
            ["Legado", <Badge>Sempre visível</Badge>, "Sem conteúdo aprovado"],
          ]}
        />
      </Card>
    );
  }
  if (sub === "sla") {
    return (
      <Card titulo="SLA e exceções" eyebrow="Subaba de Checklist">
        <Tabela
          colunas={["Caso", "Marco", "Prazo interno", "Estado"]}
          linhas={[
            ["Ana Luiza", "D10", "Vencido há 2 dias", <Badge tom="critico">Vencido</Badge>],
            ["João Pedro", "D14", "Em 3 dias", <Badge tom="atencao">Próximo</Badge>],
            ["Sophia", "D10", "Em 6 dias", <Badge tom="ok">No prazo</Badge>],
          ]}
        />
      </Card>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card titulo="Confirmar" eyebrow="Semanal">
        <Lista
          itens={[
            { titulo: "Fechar ficha do caso Sophia", badge: "Feito", tom: "ok" },
            { titulo: "Registrar achado de linhagem", badge: "Feito", tom: "ok" },
            { titulo: "Atualizar catálogo de fontes", badge: "Feito", tom: "ok" },
          ]}
        />
      </Card>
      <Card titulo="Em revisão" eyebrow="Semanal">
        <Lista
          itens={[
            { titulo: "Micro-entrega — Rafael", badge: "Revisão", tom: "atencao" },
            { titulo: "Relatório Fase 01 — João", badge: "Revisão", tom: "atencao" },
            { titulo: "Curadoria de biblioteca", badge: "Revisão", tom: "atencao" },
            { titulo: "Conferência de escopo", badge: "Revisão", tom: "atencao" },
          ]}
        />
      </Card>
      <Card titulo="Pendente crítico" eyebrow="Semanal">
        <Lista
          itens={[
            { titulo: "Proposta vencida — Ana", badge: "Crítico", tom: "critico" },
            { titulo: "Representação de Felipe", badge: "Crítico", tom: "critico" },
            { titulo: "Checklist cadastral (38)", badge: "Crítico", tom: "critico" },
          ]}
        />
      </Card>
    </div>
  );
}

/* ------------------------------- JURÍDICA -------------------------------- */

function Juridica({ sub }: { sub: string }) {
  if (sub === "dependentes") {
    return (
      <Card titulo="Dependentes e representação" eyebrow="Subaba de Validação Jurídica">
        <Tabela
          colunas={["Dependente", "Caso", "Responsável legal", "Estado"]}
          linhas={[
            ["Felipe", "Ana Luiza", "Ana Luiza", <Badge tom="critico">Documentação pendente</Badge>],
            ["Bruno", "Sophia", "Sophia", <Badge tom="ok">Documentada</Badge>],
          ]}
        />
      </Card>
    );
  }
  const temas = [
    "Objeto e escopo",
    "Não garantia de resultado",
    "Prazos e etapas",
    "Preço e reajuste",
    "Despesas de terceiros",
    "Retenção de dados",
    "Confidencialidade",
    "Representação de dependentes",
    "Rescisão",
    "Propriedade do acervo",
    "Comunicação",
    "Foro",
  ];
  return (
    <Card titulo="Matriz jurídica — 12 temas" eyebrow="Subaba de Validação Jurídica">
      <div className="grid gap-2 sm:grid-cols-2">
        {temas.map((t, i) => (
          <div key={t} className="flex items-center justify-between rounded-xl border border-navy/10 px-3 py-2">
            <span className="text-sm text-navy">{t}</span>
            <Badge tom={i === 7 ? "atencao" : "ok"}>{i === 7 ? "Revisar" : "Aprovado"}</Badge>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-navy/55">Revisão humana obrigatória. Nenhuma cláusula final é redigida aqui.</p>
    </Card>
  );
}

/* -------------------------------- ALERTAS -------------------------------- */

function Alertas({ sub }: { sub: string }) {
  if (sub === "comunicacao") {
    return (
      <Card titulo="Rascunhos de comunicação" eyebrow="Subaba de Alertas">
        <Lista
          itens={[
            { titulo: "Ana — aviso de achado", nota: "Rascunho criado", badge: "Sem envio", tom: "atencao" },
            { titulo: "Sophia — micro-entrega", nota: "Rascunho criado", badge: "Sem envio", tom: "atencao" },
          ]}
        />
        <p className="mt-3 text-xs text-navy/55">Nenhuma mensagem sai automaticamente. Envio depende de decisão humana.</p>
      </Card>
    );
  }
  return (
    <Card titulo="Fila de achados e pendências" eyebrow="Subaba de Alertas">
      <Tabela
        colunas={["Cliente", "Tipo", "Descoberta", "Dias", "Ação"]}
        linhas={[
          ["Ana Luiza", "Achado", "Registro civil 1887", "3", <Badge tom="gold">Preparar</Badge>],
          ["João Pedro", "Documento", "Certidão pendente", "5", <Badge tom="gold">Preparar</Badge>],
          ["Sophia", "Micro-entrega", "Nota de contexto", "1", <Badge tom="gold">Preparar</Badge>],
          ["Marina", "Fonte", "Arquivo institucional", "8", <Badge tom="critico">Atrasado</Badge>],
          ["Rafael", "SLA", "D10 vencido", "2", <Badge tom="critico">Atrasado</Badge>],
          ["Camila", "Gate", "Contrato não assinado", "6", <Badge tom="atencao">Bloqueio</Badge>],
          ["Diego", "Achado", "Encontro de ramos", "4", <Badge tom="gold">Preparar</Badge>],
        ]}
      />
    </Card>
  );
}

/* ------------------------------- BIBLIOTECA ------------------------------- */

function Biblio({ sub }: { sub: string }) {
  if (sub === "governanca") {
    return (
      <Card titulo="Governança" eyebrow="Subaba de Biblioteca Mestre">
        <Lista
          itens={[
            { titulo: "Decisões operacionais", nota: "24 registros", badge: "Vigente", tom: "ok" },
            { titulo: "Matriz de conformidade", nota: "Mockup → rota → dado → estado", badge: "Vigente", tom: "ok" },
            { titulo: "Inventário e recuperação", nota: "84 tabelas mapeadas", badge: "Vigente", tom: "ok" },
            { titulo: "Identificadores canônicos", nota: "Norma CA-CID / CA-LEAD", badge: "Vigente", tom: "ok" },
          ]}
        />
      </Card>
    );
  }
  if (sub === "modelos") {
    return (
      <Card titulo="Modelos F1 / F2" eyebrow="Subaba de Biblioteca Mestre">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card titulo="Relatório Fase 01" eyebrow="Modelo">
            <Vazio texto="Modelo homologado. Publicação depende de aprovação humana." />
          </Card>
          <Card titulo="Relatório Fase 02" eyebrow="Modelo">
            <Vazio texto="Modelo homologado. Publicação depende de aprovação humana." />
          </Card>
        </div>
      </Card>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {[
        ["Dossiê — Ana Luiza", "Em produção"],
        ["Registro histórico 1887", "Publicado"],
        ["Narrativa de origem", "Em revisão"],
        ["Catálogo de fontes 5B", "Publicado"],
        ["Glossário e termos proibidos", "Publicado"],
        ["Guia de linguagem ao cliente", "Publicado"],
      ].map(([t, e]) => (
        <Card key={t} titulo={t} eyebrow="Acervo">
          <Badge tom={e === "Publicado" ? "ok" : e === "Em revisão" ? "atencao" : "neutro"}>{e}</Badge>
        </Card>
      ))}
    </div>
  );
}
