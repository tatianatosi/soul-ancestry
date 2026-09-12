# PRD e ordem do Cursor — Go-live do Clube Ancestral

**Status:** aprovado  
**Versão:** v1.1  
**Data:** 2026-09-11  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte(s) de evidência:** mockup visual aprovado de 17 páginas (`clubeancestralmockup.pdf`); `Taxonomia_Canonica_Mockup_Aprovado_App_Cliente_e_Desk.md`; mockup visual revisado da conversa; `de-para-backend-desk-clube-ancestral.md`; `guia-cursor-go-live-app-cliente-backend-desk-aprovado.md`; `prd-aprovado-go-live-app-cliente-desk-vivo.md`; `CA-CONN-01_base_existente_desk.md`; `CA-EVO-02_Mapa_Automacoes_Templates.md`; `CA-EVO-03_Motor_Contratual_Modular.md`; `CA-EVO-04_Dados_Vivos_e_Integracoes.md`; `CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md`; `CA-RESET-01-Estabilizacao-Operacional-Unica.md`; Catálogo Operacional 30; arquivos de memória operacional do Clube; repositório `tatianatosi/recriacao-do-clube-ancestral`.  
**Escopo:** ordem única de leitura e execução para o Cursor; consolidação dos documentos operacionais em Markdown; go-live acelerado do App Cliente; evolução progressiva do backend e Desk.  
**Premissas:** interface do App Cliente já está correta; Cursor trabalha em incrementos curtos; cada incremento exige preview/print e aprovação humana antes do merge; CRM Vivo, Journey e Painel de Calls já possuem construção parcial e devem ser reaproveitados; pesquisa genealógica usa múltiplas bases e não se resume a Memória Italiana.  
**Limites:** não fazer nova auditoria, inventário ou enciclopédia; não recriar app/banco/CRM; não redesenhar taxonomia aprovada; não remover ativos existentes; não fazer merge ou publicação sem aprovação explícita.  
**Próximos passos:** pausar a tarefa atual, aplicar a Ordem 0, enviar print, receber aprovação e avançar uma ordem por vez.  
**Critério de aceite:** App Cliente on-line, com as sete telas aprovadas; `caseId` compartilhado com Desk; CRM Vivo/Journey/Calls reaproveitados; prints aprovados antes de cada merge; Desk funcional sem bloqueios globais.

---

## 1. Ordem obrigatória de documentos

O Cursor deve ler os documentos **nesta ordem**. Não produzir análise extensa; usar a leitura somente para decidir o próximo passo de código.

| Ordem | Documento/artefato | Para que serve | Ação no Cursor |
|---:|---|---|---|
| 0 | `prd-e-ordem-cursor-go-live-clube-ancestral-aprovado.md` | Comando mestre desta fase | Ler por inteiro e obedecer |
| 1 | `Taxonomia_Canonica_Mockup_Aprovado_App_Cliente_e_Desk.md` | Congelar nomes, sentido e navegação visual aprovados | Não renomear nem reorganizar telas |
| 2 | `guia-cursor-go-live-app-cliente-backend-desk-aprovado.md` | Regras de go-live, backend leve e segurança proporcional | Executar primeiro o App Cliente |
| 3 | `de-para-backend-desk-clube-ancestral.md` | Mapa de dados por tela, KPIs, CRM, Marketing, Financeiro e Jurídico | Consultar ao conectar dados e módulos |
| 4 | `CA-CONN-01_base_existente_desk.md` | Regra da fonte única de dados e `caseId` estável | Usar para conectar App e Desk; não criar base paralela |
| 5 | `CA-EVO-04_Dados_Vivos_e_Integracoes.md` | Dados vivos, integrações, leitura e estados honestos | Reaproveitar somente o que já existe e é necessário |
| 6 | `CA-EVO-03_Motor_Contratual_Modular.md` | Proposta, contrato, escopo, participantes, assinaturas e condições | Usar depois do go-live, no Caso 360 |
| 7 | `CA-EVO-02_Mapa_Automacoes_Templates.md` | Automações, mensagens, templates e produção assistida | Usar apenas após núcleo App/Desk estar estável |
| 8 | `CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md` | Referência de prontidão de um caso real | Consultar quando for validar um caso concreto; não travar o produto por isso |
| 9 | `CA-RESET-01-Estabilizacao-Operacional-Unica.md` | Regras para evitar regressão e duplicação operacional | Consultar só em caso de conflito estrutural |
| 10 | Catálogo Operacional 30 + documentação de Top SKUs | Oferta, jornadas, microentregas, upsell e recorrência | Usar no CRM/Marketing/Financeiro; não expor SKU técnico no App Cliente |

### Documentos que o Cursor não deve usar agora como tarefa

- Auditorias extensas, inventários e relatórios históricos: somente consulta pontual se surgir um bloqueio concreto.
- Arquivos `.txt`: são registros legados de devolutiva; não são fonte de comando para execução.
- Materiais duplicados ou versões antigas: não abrir por padrão.

---

## 2. Ordem de execução do produto

### Ordem 0 — Pausar e preservar

**Objetivo:** interromper o que estiver em curso sem perder trabalho local e sem criar commit indevido.

**Resultado exigido:** print do estado atual + resumo de até oito linhas + espera por decisão da proprietária.

### Ordem 1 — App Cliente em preview

**Objetivo:** colocar no ar a superfície aprovada do cliente, sem redesign.

- Preservar: `Home`, `Jornada`, `Radar`, `Árvore`, `Documentos`, `Legado`, `Conta`.
- Corrigir apenas build, rota, navegação, renderização, asset/logo e responsividade.
- Manter dados demonstrativos rotulados ou estados vazios honestos.
- Mostrar preview + print de `Home` e uma tela interna.
- **Aguardar aprovação antes de commit/merge/publicação.**

### Ordem 2 — Fonte única de caso

**Objetivo:** App Cliente e Desk leem o mesmo caso por `caseId`.

- Não criar um novo banco ou modelo paralelo.
- Preservar todos os campos existentes; adicionar somente campos opcionais realmente necessários.
- Criar projeção mínima para o App com conteúdo liberado.
- Mostrar print do App e do Desk exibindo o mesmo caso.

### Ordem 3 — Caso 360, Pessoas e Pesquisa

**Objetivo:** reconstruir a vida operacional do Clube no Desk, a partir do caso.

- Caso 360 recebe participantes, pessoa/família, pesquisa, documentos, checklist, entregas e próximos passos.
- Pessoa 360 e relações familiares alimentam Árvore e contexto do caso.
- Pesquisa é um domínio completo: pergunta, hipótese, base/fonte, evidência, achado, documento, citação e próxima ação.
- Memória Italiana é **apenas um dos ativos/módulos existentes**, não a definição da pesquisa.
- Mostrar print do Caso 360 com bloco de pesquisa e evidências.

### Ordem 4 — CRM Vivo, Journey e Painel de Calls

**Objetivo:** reaproveitar as partes já construídas para tornar o comercial operável, sem criar CRM novo.

**Fluxo único obrigatório:**

```text
Origem/campanha → Lead → Discovery → Call → Diagnóstico →
Oportunidade → Proposta → Contrato → Caso → Cobrança → Pagamento
```

#### CRM Vivo

- Reaproveitar qualquer pipeline, objeção, conversão, lead, origem e status já existente.
- Cada lead tem responsável, etapa, origem, próxima ação e histórico mínimo.
- Ao ganhar, a oportunidade cria/vincula um caso pelo mesmo `caseId`; não duplica cliente.

#### Journey comercial

- A Journey mostra a sequência de relacionamento: entrada, qualificação, discovery, call, diagnóstico, proposta, decisão, onboarding e acompanhamento.
- Não é timeline decorativa: cada marco tem data, responsável, contexto e próxima ação.
- A Journey pode aparecer no lead/oportunidade e continuar no Caso 360 quando convertido.

#### Painel de Calls

- Reaproveitar o painel/estrutura já construída para calls.
- Campos mínimos: lead/oportunidade, data/hora, responsável, tipo de call, status (agendada, realizada, cancelada, no-show), objetivo, resumo, objeções, próximos passos e vínculo com tarefa.
- Não criar integração de videoconferência agora se ela não existir. Registrar e organizar as calls já é suficiente para o primeiro incremento.
- A call realizada atualiza a Journey e pode abrir diagnóstico/proposta; não deve criar dados duplicados.

**Print obrigatório:** pipeline CRM + Journey de uma oportunidade + painel/lista de calls.

### Ordem 5 — Proposta, contrato e validação jurídica contextual

**Objetivo:** ligar o motor contratual já desenvolvido ao Caso 360, sem bloqueios globais.

- Reaproveitar proposta, páginas Canva, escopo, participantes, responsabilidades, contrato e condições comerciais.
- Validação jurídica fica vinculada a caso, pessoa, evidência/documento e ação formal.
- Rascunhos continuam livres.
- Gate ocorre somente em enviar para assinatura, assinar, cobrar ou protocolar, quando aplicável.
- Mostrar print do Caso 360 com proposta/contrato e pendências contextualizadas.

### Ordem 6 — Financeiro, Marketing e funil até receita

**Objetivo:** completar o ciclo do CRM sem inventar KPI ou receita.

- Financeiro: condição comercial, valor contratado, parcelas, previsão, cobrança, pagamento, atraso e conciliação.
- Marketing: campanha/origem → lead → discovery → proposta → contrato → receita prevista/recebida.
- Não chamar pipeline ou proposta de receita recebida.
- Todo número deve indicar `Dados demonstrativos`, `Sem dados suficientes` ou origem real.
- Mostrar print do funil e painel financeiro antes de merge.

### Ordem 7 — Radar, Biblioteca, Legado e automações

**Objetivo:** tornar as matrizes e a produção de conteúdo úteis após o núcleo estar operante.

- Radar Interno baseado em evidências, documentos, cadência e decisão; nunca em números inventados.
- Biblioteca Mestre liga conteúdo, relatório, template e entrega a caso/pessoa/tarefa.
- Legado alimenta o App somente com itens liberados.
- Automações sempre passam por revisão humana antes de comunicação ou publicação externa.

---

## 3. Motores e skills a reaproveitar

| Grupo | O que já existe/foi desenvolvido | Como reaproveitar |
|---|---|---|
| Caso e dados | Estrutura de dados por caso, regra de `caseId`, Desk e App conectáveis | Fonte única e adapter compartilhado |
| Caso 360 | Módulo `visao-360.tsx` e conceito de visão central | Evoluir o módulo; não reconstruir do zero |
| Desk | `desk-shell.tsx`, sidebar, topbar, módulos internos | Preservar shell e conectar conteúdos úteis |
| Pesquisa | Dossiê documental, fontes, hipóteses, evidências, bases/repositórios, pesquisa genealógica e patrimonial | Fazer do Caso 360 um hub de investigação; não reduzir a memória |
| Pessoas/Famílias | Árvore, relações, participantes e núcleo familiar | Ligar pessoa/família/caso/documento/achado |
| Documentos | Checklist, documentos, metadados, entregas, dossiê | Usar nos fluxos App, Pesquisa, Jurídico e Contrato |
| Radar | Risco consular, matrizes, prioridade e sinais | Exibir só dado explicável e contextual |
| Contratual | Proposta Canva, escopo, participantes, responsabilidades, assinatura, validação de completude | Ligar ao Caso 360 e Financeiro |
| Jurídico | Validação jurídica, requisitos por rota e gates | Bloqueio localizado, não global |
| CRM Vivo | Pipeline, objeções de conversão, discovery, proposta e condições | Retomar e conectar ao caso/contrato |
| Journey | Marcos comerciais e de atendimento | Unificar lead → call → onboarding → caso |
| Calls | Parte de painel/cadência já construída | Reaproveitar sem refatoração; vincular call a lead/oportunidade/tarefa |
| Marketing | Origem, campanha, conteúdo e atribuição | Funil até receita com regras claras |
| Financeiro | Condições comerciais, parcelas, cobranças, Asaas/reconciliação e pagamentos | Integrar depois do contrato e evitar valores fictícios |
| Biblioteca/Legado | Memória Italiana, Biblioteca Mestre, conteúdos, relatórios e templates | Reaproveitar como parte da riqueza de conteúdo e pesquisa |
| Automações | Mapa de automações, templates e mensagens | Usar somente depois do go-live e com aprovação humana |
| Marca | Logo vetorial original em alta e guia de marca | Inserir o ativo oficial; não criar logo similar por IA |

---

## 4. Regras de implementação

### Agilidade

- Uma ordem por vez; um objetivo visual por ordem.
- Sem nova auditoria, inventário, backlog enciclopédico, refatoração geral ou prompt gigante.
- Se a implementação exigir decisão, mostrar o print e fazer uma pergunta objetiva.
- Não abrir nova frente até a proprietária aprovar a anterior.

### Print antes do merge

```text
Implementar em branch de trabalho
→ rodar build/preview
→ enviar print(s)
→ proprietária aprova visualmente
→ commit/merge
→ resumo curto do que entrou
```

Nenhum merge sem o texto explícito da proprietária aprovando a entrega vista nos prints.

### Segurança correta para startup

- Livre: rascunho, pesquisa, tarefa, checklist, documento em análise, proposta rascunho, contrato rascunho, navegação e consulta dentro do papel operacional.
- Confirmação/revisão: publicação de atualização ao App, mensagem externa, contrato enviado para assinatura, cobrança, pagamento e protocolo.
- Restrição simples: cliente só vê dados liberados do próprio caso; operação vê o que o papel permitir; proprietária/admin altera regras e taxonomias.
- Proibido: bloqueio global por `NO_GO`, gate genérico em toda tela ou camada de segurança que impede o trabalho antes de uma ação sensível.

---

## 5. Prompt único de pausa

Copiar e colar no Cursor agora:

```text
PAUSE A TAREFA ATUAL AGORA.

Não faça outras alterações. Não execute commit, merge, reset, rebase, checkout forçado, limpeza ou comando destrutivo.

Preserve todo o estado local atual. Execute somente comandos de leitura:
- git status
- git branch --show-current
- git diff --stat

Se já houver preview aberto, não feche: envie um print do estado atual.

Responda em no máximo 8 linhas com:
1. tarefa em andamento;
2. branch atual;
3. arquivos alterados/não rastreados;
4. se existe alteração não salva;
5. resultado de build conhecido;
6. próximo ponto seguro de retomada.

PARE e aguarde minha decisão. Não faça commit nem merge.
```

---

## 6. Prompt de retomada

Após aprovar a pausa, copiar e colar:

```text
Retome seguindo exclusivamente o documento
`prd-e-ordem-cursor-go-live-clube-ancestral-aprovado.md`.

Execute somente a Ordem 1 — App Cliente em preview.

Preserve integralmente a interface e a taxonomia aprovadas:
Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.

Não faça auditoria, inventário, documentação extensa, redesign, refatoração ampla ou criação de outro app/banco/CRM.

Corrija apenas o necessário para build, rotas, navegação, renderização, logo oficial, assets e responsividade. Use dados existentes; quando não forem reais, sinalize “Dados demonstrativos”, “Sem dados suficientes” ou “Em conciliação”.

Ao concluir:
1. execute build/preview;
2. envie print da Home e de uma tela interna;
3. liste arquivos alterados;
4. diga o que foi reaproveitado;
5. pergunte exatamente: “Aprova esta entrega para merge?”

Não faça commit, merge nem publicação antes da minha aprovação explícita.
```

---

## 7. Nota operacional

No repositório GitHub verificado nesta sessão, as branches `main` e `v0/tati-6134-a9acac7c` estão no mesmo commit e não há commit registrado hoje nessa referência. Isso não exclui trabalho local, em outra branch, outro repositório ou outro ambiente; por isso a Ordem 0 exige pausa, `git status`, `git diff --stat` e print antes de qualquer alteração.
