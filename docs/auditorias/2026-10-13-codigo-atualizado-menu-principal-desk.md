# Relatório de Auditoria de Código: O Código Real e Atualizado do Menu Principal do Desk

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 12:00 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: auditoria de codigo real, inspecao de navegacao e exibicao de componentes
caminho_no_repositorio: docs/auditorias/2026-10-13-codigo-atualizado-menu-principal-desk.md
fontes:
  - Arquivo Real GitHub: src/components/saas/shell.tsx (SHA d4a02320)
  - Arquivo Real GitHub: src/lib/navegacao-desk.ts (SHA 299dcd97)
  - Prancha V4 Desk Intelligence
escopo: >
  Apresentação integral e fiel do código-fonte TypeScript/React que rege
  o menu lateral (Sidebar) e a navegação por abas do Desk no repositório.
premissas:
  - O código apresentado é a versão oficial comitada e ativa em produção;
  - A navegação é gerida pelo componente SaasShell consumindo a matriz SETORES_DESK_V5 / GRUPOS_DESK;
  - O menu já implementa o design token navy com contraste em ouro e ícones Lucide.
criterio_de_aceite: >
  Exibição do JSX do componente de navegação lateral (Sidebar) e das abas de topo.
```

---

## 1. O Componente que Renderiza o Menu Lateral (`src/components/saas/shell.tsx`)

O código exato que renderiza a barra lateral (Sidebar) no desktop e no mobile é o trecho entre as linhas 170 e 240 de `src/components/saas/shell.tsx` [file:287]:

```tsx
<aside
  className={cn(
    "fixed inset-y-0 left-0 z-40 w-full max-w-full shrink-0 flex-col overflow-y-auto border-r border-navy/20 bg-navy px-3 py-5 text-cream md:static md:flex md:w-64",
    aberto ? "flex" : "hidden",
  )}
>
  {/* LOGO E CABEÇALHO DA SIDEBAR */}
  <div className="px-2 pb-4" data-marca-guia="oki">
    <BrandLogo size={34} variant="client-dark" showText={false} className="items-center" />
    <p className="mt-2 font-serif text-base leading-tight text-gold">Clube Ancestral</p>
    <p className="mt-0.5 pl-0.5 text-[11px] uppercase tracking-widest text-cream/60">
      Desk Intelligence
    </p>
    <div className="mt-3 h-0.5 w-full bg-gold/80" aria-hidden="true" />
  </div>

  {/* NAVEGAÇÃO PRINCIPAL (SETORES/ECOSSISTEMAS) */}
  <nav aria-label="Navegação do Desk" className="flex flex-1 flex-col gap-1">
    {SETORES_DESK_V5.map((setor) => {
      const Icon = ICONES[setor.icone];
      const ativo = setorAtivo?.id === setor.id;
      return (
        <Link
          key={setor.id}
          to={setor.to}
          onClick={() => setAberto(false)}
          aria-current={ativo ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            ativo ? "bg-gold font-semibold text-navy" : "text-cream/80 hover:bg-cream/10",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 leading-tight">{setor.label}</span>
          {badgeDe(setor.id) > 0 ? (
            <span
              title={`${badgeDe(setor.id)} item(ns) com prazo vencido`}
              className="ml-auto rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-semibold text-cream"
            >
              {badgeDe(setor.id)}
            </span>
          ) : null}
        </Link>
      );
    })}
  </nav>

  {/* RODAPÉ DO MENU: PERFIL DO USUÁRIO E LOGOUT */}
  <div className="mt-4 border-t border-cream/15 pt-3 text-xs text-cream/70">
    <p className="truncate font-medium text-cream">{contexto?.perfil?.email ?? "—"}</p>
    <p className="truncate">{contexto?.organizacao?.nome ?? "—"}</p>
    <p className="mt-1 truncate text-cream/60">
      {papeis.length ? papeis.map((p) => PAPEL_LABEL[p] ?? p).join(" · ") : "Sem papel atribuído"}
    </p>

    <button
      onClick={sair}
      className="mt-3 flex w-full items-center gap-2 rounded-lg border border-cream/20 px-3 py-2 text-sm text-cream hover:bg-cream/10"
    >
      <LogOut className="h-4 w-4" /> Sair
    </button>
  </div>
</aside>
```

---

## 2. A Barra de Abas do Topo (Subnavegação do Setor Ativo)

Quando você clica em um dos setores da lateral, o topo do Desk abre a linha de abas contextuais daquele ecossistema (linhas 270 a 295 de `src/components/saas/shell.tsx`) [file:287]:

```tsx
{abasSetor.length ? (
  <nav
    aria-label={`Abas de ${setorAtivo?.label ?? "setor"}`}
    className="flex min-w-0 gap-1 overflow-x-auto border-b border-navy/10 bg-card px-4 md:px-8"
    data-desk-abas-setor={setorAtivo?.id}
  >
    {abasSetor.map((aba) => {
      const ativa = abaAtiva(rota, aba, abasSetor);
      return (
        <Link
          key={aba.to}
          to={aba.to}
          aria-current={ativa ? "page" : undefined}
          className={cn(
            "flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm transition-colors",
            ativa
              ? "border-gold font-semibold text-navy"
              : "border-transparent text-navy/60 hover:text-navy",
          )}
        >
          {aba.label}
        </Link>
      );
    })}
  </nav>
) : null}
```

---

## 3. A Matriz de Dados dos Setores (`src/lib/navegacao-desk.ts`)

A lista de setores que alimenta o `.map()` da barra lateral está estruturada na constante `SETORES_DESK_V5` [file:287]:

```ts
export const SETORES_DESK_V5: readonly SetorDesk[] = [
  {
    id: "hoje",
    label: "Hoje",
    to: "/painel",
    icone: "hoje",
    abas: [
      { label: "Visão do dia", to: "/painel" },
      { label: "Kanban", to: "/ops" },
      { label: "Microentregas", to: "/microentregas" },
      { label: "Alertas", to: "/alertas" },
      { label: "SLA e exceções", to: "/ops-excecoes" },
    ],
  },
  {
    id: "comercial",
    label: "Marketing & Comercial",
    to: "/leads",
    icone: "comercial",
    abas: [
      { label: "Aquisição", to: "/marketing" },
      { label: "CRM Vivo", to: "/leads" },
      { label: "Discovery", to: "/calls" },
      { label: "Propostas", to: "/propostas" },
      { label: "Conversão", to: "/conversao" },
    ],
  },
  {
    id: "casos",
    label: "Pessoas & Casos",
    to: "/casos",
    icone: "casos",
    abas: [
      { label: "Casos", to: "/casos" },
      { label: "Pessoas", to: "/clientes" },
      { label: "Famílias", to: "/nucleos" },
    ],
  },
  {
    id: "pesquisa",
    label: "Inteligência & Pesquisa",
    to: "/pesquisa-modulo",
    icone: "pesquisa",
    abas: [
      { label: "Pesquisas", to: "/pesquisa-modulo" },
      { label: "Radar", to: "/qualidade" },
      { label: "Fontes", to: "/fontes-genealogicas" },
      { label: "Evidências", to: "/evidencias" },
      { label: "Devolutivas", to: "/studio-devolutivas" },
    ],
  },
  {
    id: "contratos",
    label: "Formalização & Financeiro",
    to: "/contratos",
    icone: "contratos",
    abas: [
      { label: "Contratos", to: "/contratos" },
      { label: "Validação jurídica", to: "/matriz-juridica" },
      { label: "Ordens de serviço", to: "/ordens-servico" },
      { label: "Financeiro", to: "/financeiro" },
    ],
  },
  {
    id: "governanca",
    label: "Governança & Administração",
    to: "/configuracoes",
    icone: "governanca",
    abas: [
      { label: "Configuração", to: "/configuracoes" },
      { label: "Portal", to: "/acessos-portal" },
      { label: "Equipe e acesso", to: "/equipe", adminOnly: true },
      { label: "Catálogos e dicionários", to: "/catalogo" },
      { label: "Integrações", to: "/integracoes" },
    ],
  },
];
```
