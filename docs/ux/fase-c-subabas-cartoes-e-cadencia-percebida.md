# Fase C — Por que o Desk ainda parece igual: subabas, cartões e cadência percebida (read-only)

Versão 1.0 — 24/08/2026. Auditoria de código e documentação existente. Nenhuma
alteração de código, dado, RLS, integração, navegação ou paleta foi executada
neste documento.

## 0. Pergunta que originou este estudo

"Ainda temos muitas subabas e indicadores que poderiam ser só cards, e eu
achava que a cadência de onboarding já tinha sido aplicada, mas acho que
está tudo igual." As duas percepções estão corretas — e este documento
mostra por quê, com evidência de arquivo, não de impressão.

## 1. O que a Fase A/B (23/08) realmente mudou

| Item | Estado antes | Estado depois (confirmado no código hoje) |
|---|---|---|
| `metricas.tsx` | ~19 cartões numéricos misturados | **132 linhas**, 5 cartões de decisão + `<details>` "Histórico" fechado por padrão |
| `painel-hoje.tsx` / `painel-desk-hoje.tsx` | Dois painéis concorrendo com "Painel Hoje" | Movidos para `/historico/*`, fora de menu, sem redirect — arquivo continua existindo |
| Navegação (`navegacao-desk.ts`) | 7 grupos, rótulos técnicos | 8 grupos, rótulos humanos — **mesmas rotas, nenhuma removida** |

Ou seja: a Fase A/B resolveu **1 página** (`metricas.tsx`) de verdade e
**renomeou/reagrupou** o menu. Ela não reduziu a quantidade de telas nem de
indicadores nas outras ~80 páginas — isso nunca foi o escopo dela (ver
`fase-a-auditoria-metricas-desk.md`, seção 3.3: "nenhuma rota removida;
nenhuma função histórica perdida").

## 2. Por que ainda parece "muitas subabas"

Contagem direta em `src/routes/_authenticated/`: **81 arquivos de rota**.
`navegacao-desk.ts` organiza isso em **8 grupos principais**, mas cada grupo
agrupador (Marketing, Comercial, Casos, Pesquisa, Contratos e financeiro,
Governança) expõe entre 9 e 20 itens de submenu. Governança sozinha lista
21 itens em 5 subgrupos. Isso não é uma falha de execução — é uma decisão
explícita e documentada (`CA-UX-03`, regra 5: "nenhuma rota operacional é
removida") — mas é exatamente a causa técnica da sensação de excesso.

Páginas com maior densidade de indicadores/cartões ainda não tratadas
(contagem de menções a `Card`/indicador/KPI no próprio arquivo):

| Página | Linhas | Sinal de densidade |
|---|---|---|
| `financeiro.tsx` | 716 | 17 ocorrências de card/indicador |
| `governanca.indicadores.tsx` | 223 | 22 ocorrências — a mais densa por linha |
| `contratos.$id.tsx` | 982 | tela de caso único, muitos blocos |
| `leads.tsx` | 911 | tela de lista principal do Comercial |
| `casos.index.tsx` | 420 | Casos 360, 6 ocorrências |
| `painel-dia.tsx` | 856 | entrada operacional diária, já reorganizada em 5 blocos na Fase B, mas ainda a maior tela do Desk |
| `biblioteca-mensagens.tsx` | 528 | catálogo de templates |
| `biblioteca.tsx` | 562 | Biblioteca Mestre |

Estas oito páginas concentram o mesmo padrão que `metricas.tsx` tinha antes
da Fase A: números soltos, sem hierarquia de decisão, sem "ver detalhes"
recolhido.

## 3. A cadência de onboarding existe — mas não é sentida, por desenho

Isso é o ponto mais importante do estudo. **CA-OPS-01 e CA-OPS-02 (23/08)
foram implementados de verdade**, com teste automatizado:

- `src/lib/orquestracao-jornada.ts` — 1.081 linhas, módulo puro (sem I/O),
  13 eventos internos, cadeia de 11 elos (evento → regra → tarefa → template
  → rascunho → revisão humana → publicação → touchpoint → cadência →
  alerta → Painel Hoje).
- `src/lib/fiacao-cadencia-catalogo.ts` — 323 linhas, mapa alerta → modelo
  de mensagem vigente.
- Cobertura de teste dedicada em `src/lib/__tests__/ca-ops-01-*` e
  `ca-ops-02-*`.

Mas o que isso produziu **na tela**, de fato consumido por componentes de
interface, é muito pouco:

| Onde aparece | O que é |
|---|---|
| `painel-onboarding-jornada.tsx` | Um atalho "Abrir modelo sugerido" por alerta elegível |
| `painel-dia.tsx` (bloco "Sinais de atenção") | Um link "Ver cadência e onboarding em risco" → `/ops` |
| `biblioteca-mensagens.tsx` | Um bloco de contexto (caso, tipo de alerta, gate) ao abrir um modelo |

Não existe: envio automático de WhatsApp/e-mail, criação automática de
tarefa visível fora dessas telas, ou qualquer novo indicador numérico no
Painel Hoje. Isso **não é um bug** — é uma restrição de escopo que os
próprios documentos declaram explicitamente:

> "Ações não autorizadas: enviar WhatsApp/e-mail/SMS, publicar externamente,
> assinar, cobrar/pagar..." (`CA-OPS-01`, seção B)
> "`envioExecutado: false`, `persistido: false` e `usoRegistrado: false`"
> (`CA-OPS-02`, seção "Pré-condições comprovadas")

Ou seja: o que foi construído é um **motor de cálculo e um cofre de
templates**, não uma cadência automatizada que dispara mensagens. Do ponto
de vista de quem opera o dia a dia sem abrir o Painel Hoje ou a Biblioteca
de Mensagens todos os dias, a percepção de "está tudo igual" é
tecnicamente correta: nenhum comportamento novo aconteceu sem ação humana
manual, porque essa era exatamente a regra de segurança adotada.

Vale registrar também: parte do trabalho recente (CA-OPS-01, CA-OPS-02,
CA-UX-03/04, este estudo) foi feito por sessão de Claude Code direto no
GitHub, não pelo editor do Lovable — então mudanças reais estão acontecendo
no repositório, só que fora da superfície onde normalmente se acompanha o
produto (o editor/preview do Lovable). Vale conferir se o ambiente que é
revisado no dia a dia está de fato publicado a partir do `main` mais
recente, e não de uma prévia desatualizada.

## 4. Proposta concreta (sem implementar ainda)

### 4.1 Estender o padrão `metricas.tsx` às 8 páginas do item 2
Mesma regra já aprovada na Fase A: teto de 5 indicadores visíveis por área,
resto em `<details>` "Histórico e análise" fechado por padrão. Ordem
sugerida por impacto de uso diário: `financeiro.tsx` →
`governanca.indicadores.tsx` → `leads.tsx` → `casos.index.tsx` →
`contratos.$id.tsx` → `biblioteca.tsx` → `biblioteca-mensagens.tsx`.

### 4.2 Reduzir subabas de fato, não só reagrupar
A Fase A/B provou (com "nenhuma rota removida") que reagrupar sozinho não
resolve a sensação de excesso. Duas rotas legítimas para revisão real, não
cosmética:
- `historico.painel-hoje.tsx` e `historico.painel-desk-hoje.tsx` — hoje
  "aposentados visualmente" mas ainda existem como arquivo e rota. Decisão
  pendente: arquivar de vez (mover para `archive/`) ou manter como
  histórico técnico permanente.
- Dentro de Governança (21 itens): separar o que é **consultado no dia a
  dia** (Decisões, Indicadores) do que é **auditoria pontual/arquivo**
  (Inventário patrimonial, Varredura de completude, Identificadores) —
  candidatos a um submenu "Auditoria e arquivo" recolhido por padrão.

### 4.3 Decisão sobre a cadência
Duas opções, e a escolha é sua, não técnica:
- **Manter como está** (motor interno + templates, envio sempre manual) —
  mais seguro, mas continuará "invisível" no dia a dia salvo abrir
  `/ops` ou `/biblioteca-mensagens`.
- **Evoluir para envio assistido** (ex.: botão "copiar mensagem pronta"
  já existe; próximo passo seria integração de canal real — WhatsApp
  Business API ou similar) — aumenta custo/complexidade e exige decisão
  de compliance (LGPD, consentimento, canal oficial) antes de qualquer
  código.

## 5. Aceite necessário

Aprovar, para abrir uma Fase D de execução: (a) ordem de páginas do item
4.1; (b) decisão sobre `/historico/*` (arquivar ou manter); (c) escolha
entre as duas opções do item 4.3; (d) se o teto de 5 indicadores por área
deve valer também para as páginas de caso único (`contratos.$id.tsx`) ou
apenas para páginas de lista/visão geral.
