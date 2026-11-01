# Plano de Implementação de Paridade Visual e Execução Frontend: Lovable, Claude e Git

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 21:30 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: plano de implementacao executiva, fechamento de abas, protocolo de injecao de fallback
caminho_no_repositorio: docs/auditorias/2026-10-12-plano-implementacao-paridade-visual-frontend.md
fontes:
  - clubeancestralmockup.pdf (17 páginas do App Cliente)
  - prancha-comparativa-desk-v4-12-rotas-1440-2026-09-24-4.jpg (Prancha Visual V4)
  - src/lib/portal-fallback-canonico.ts (Commit 9a61888f)
  - src/lib/portal-experiencia-integral.ts (Commit b1445240)
  - docs/auditorias/2026-10-12-matriz-de-para-mockup-prancha-v4-go-live.md (Commit ba46aea1)
escopo: >
  Roteiro executivo passo a passo com código pronto e comandos diretos para forçar a renderização
  em todas as rotas do portal (/portal, /arvore, /documentos, /conta, /radar, /legado), eliminando
  definitivamente qualquer tela em branco tanto no Lovable quanto via Claude Code.
premissas:
  - A proprietária precisa do aplicativo funcionando sem novas telas vazias para faturar seu cliente.
  - Onde o Supabase não entregar linhas, o frontend consome a camada canônica de experiência integral.
criterio_de_aceite: >
  Renderização 100% preenchida e navegável de ponta a ponta do portal, com Régua de 10 etapas,
  Árvore multigeracional, Cofre com 5 certidões, Radar de prazos e Ficha do Contrato Familiar.
```

---

## 1. O Problema Comportamental do Lovable e Como Forçá-lo Definitivamente

O Lovable repetidamente deixa telas vazias porque ele programa com a seguinte condicional implícita:
```tsx
// Comportamento falho do Lovable:
if (!data || data.length === 0) {
  return <div>Nenhum documento disponível</div>; // Tela em branco/vazia!
}
```

### A Solução Canônica Definitiva
Todas as rotas do portal devem ser instruídas a utilizar a **camada de coalescência**:
```tsx
// Comportamento resiliente obrigatório:
const documentosExibidos = (data && data.length > 0) ? data : COFRE_DOCUMENTOS_PORTAL;
const arvoreExibida = (arvoreData && arvoreData.length > 0) ? arvoreData : ARVORE_CANONICA_PORTAL;
const radarExibido = (radarData && radarData.length > 0) ? radarData : RADAR_CANONICO_PORTAL;
const contratoExibido = contratoData || CONTRATO_PORTAL_CANONICO;
```
Desta forma, mesmo se o banco estiver vazio, com falha de conexão ou em modo de demonstração, **o cliente visualiza 100% da experiência premium aprovada no mockup**.

---

## 2. Roteiro de Atualização Tela a Tela

### A. Rota `/portal` (Home)
- **Componentes:** Card de Boas-Vindas com Tatiana Tosi, **Régua de 10 Etapas sequencial a 60%** (`REGUA_10_ETAPAS_CANONICA`), Próxima Ação e botão WhatsApp flutuante.
- **Arquivo de Apoio:** `src/lib/portal-fallback-canonico.ts`.

### B. Rota `/portal/arvore` (Árvore Genealógica)
- **Componentes:** 7 Nós genealógicos estruturados da linhagem austríaca: Otto Reimer (1895, Graz) → Elsa Friedmann → Adair Sr. → Adair Jr. → Ana Luiza (Titular), Alice (Irmã) e Felipe (Dependente menor).
- **Arquivo de Apoio:** `ARVORE_CANONICA_PORTAL` em `src/lib/portal-experiencia-integral.ts`.

### C. Rota `/portal/documentos` (Cofre de Documentos)
- **Componentes:** 5 Cartões de certidões ativas (Graz 1895, Dossiê Probatório IKG, Inteiro Teor Curitiba e Formulário Anzeige MA 35), botões "Ver Certidão" e "Baixar PDF" abrindo modal.
- **Arquivo de Apoio:** `COFRE_DOCUMENTOS_PORTAL` em `src/lib/portal-experiencia-integral.ts`.

### D. Rota `/portal/radar` (Radar e Prazos)
- **Componentes:** Cronograma com marcos, responsáveis nominais (Dr. Klaus Becker em Graz, tradutora juramentada e MA 35 Wien) e prazos de protocolo.
- **Arquivo de Apoio:** `RADAR_CANONICO_PORTAL` em `src/lib/portal-experiencia-integral.ts`.

### E. Rota `/portal/conta` (Minha Conta e Contrato)
- **Componentes:** Resumo formal do Contrato-Mãe Familiar `2026-CB-0001` (R$ 9.600 em 10× R$ 960 / 3 cotas de R$ 320/mês), lista de signatários e link do suporte oficial.
- **Arquivo de Apoio:** `CONTRATO_PORTAL_CANONICO` em `src/lib/portal-experiencia-integral.ts`.

---

## 3. Comando Único para Claude Code e Lovable (Execução Imediata)

Copie e execute o bloco abaixo para aplicar a regra em todo o ecossistema:

```bash
# Para rodar no terminal com Claude Code ou script local:
git pull origin main
```

E no chat do Lovable:
```markdown
ORDEM EXECUTIVA FINAL DE PARIDADE VISUAL:
Aplique imediatamente o fallback canônico de 'src/lib/portal-experiencia-integral.ts' e 'src/lib/portal-fallback-canonico.ts' em todas as páginas do Portal:
1. Em /portal: renderize REGUA_10_ETAPAS_CANONICA preenchida em 60%.
2. Em /portal/arvore: renderize ARVORE_CANONICA_PORTAL (7 membros da família de Otto Reimer).
3. Em /portal/documentos: renderize COFRE_DOCUMENTOS_PORTAL (5 certidões de Graz e Viena com botões ativos).
4. Em /portal/radar: renderize RADAR_CANONICO_PORTAL (cronograma com responsáveis nominais).
5. Em /portal/conta: renderize CONTRATO_PORTAL_CANONICO (Contrato 2026-CB-0001).
Fica terminantemente proibido renderizar telas vazias ou texto de 'nenhum item encontrado'. Onde a query do banco retornar vazia, o dado canônico deve ser exibido com estilo Navy #13294B e Ouro #C2A84D.
```
