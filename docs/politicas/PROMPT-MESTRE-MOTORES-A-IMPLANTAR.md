# Prompt Mestre — Motores a Implantar no Clube Ancestral

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio + Vercel + GitHub  
**Objetivo:** consolidar os motores de negócio, operação, dados, jornada, pesquisa, contratos, comunicação, App Cliente e crescimento do Clube Ancestral em uma sequência de implementação segura, sem duplicar entidades, sem criar fluxos desconectados e sem substituir trabalho real por telas, listas, gates ou mocks.

---

## 0. Regra-mãe do sistema

```text
Lead/cliente
→ Discovery
→ Caso canônico
→ Núcleo familiar, quando houver
→ Participantes e relações
→ Proposta/condição comercial
→ Contrato/Ordem de Serviço
→ Onboarding
→ Tarefas e próxima ação
→ Pesquisa, documentos e evidências
→ Micro-entregas e atualizações
→ App Cliente
→ Protocolo/pós-reconhecimento/legado
```

Nenhum atendimento pode possuir duas identidades, dois `case_id`, duas jornadas, duas fontes de verdade ou uma cópia do caso apenas para App, contrato, proposta, OS, financeiro, pesquisa, portal ou comunicação.

```text
Um caso.
Um case_id canônico.
Um case_code humano.
Uma jornada.
Uma fonte de verdade.
Uma próxima ação.
Nenhum trabalho perdido.
```

---

## 1. Limites obrigatórios

Manter sempre:

- RLS.
- Login, autenticação e sessão.
- Permissões por organização e usuário.
- Isolamento de dados por organização.
- Auditoria/logs em segundo plano.
- Confirmação explícita para ações externas reais e irreversíveis.

Não fazer:

- Não remover ou afrouxar RLS.
- Não usar `service_role` no navegador.
- Não criar bypass genérico para admin.
- Não remover sessão, login ou autenticação.
- Não apagar dados para contornar inconsistência.
- Não executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migration destrutiva.
- Não criar novo caso, núcleo, participante, cliente, proposta ou contrato para escapar de falha em registro existente.
- Não tratar lista fixa, mock, toast, cache, tela renderizada, CI verde ou função existente como prova de operação.

Ações externas continuam separadas:

```text
e-mail
WhatsApp
convite externo
cobrança
assinatura
pesquisa externa
protocolo/submissão
```

Elas exigem integração real, alvo resolvido e confirmação explícita no momento da execução.

---

## 2. Ordem de implementação

Não implementar todos os motores de uma vez. A ordem obrigatória é:

```text
P0 — Autoridade operacional e persistência
P1 — Caso canônico, núcleo e participantes
P2 — Contrato, proposta e Ordem de Serviço
P3 — Motor de tarefa, próxima ação e cadência
P4 — Motor de onboarding real
P5 — Motor de pesquisa, documentos e evidências
P6 — Motor de micro-entregas, App Cliente e portal
P7 — Motor comercial, financeiro e catálogo
P8 — Motor de marketing, conteúdos e conversão
P9 — Cockpit de indicadores e alertas
P10 — Integrações externas e escala
P11 — Revisão visual e marca
```

Cada fase precisa ser validada com dados reais antes da próxima.

---

# P0 — Motor de Autoridade Operacional e Persistência

## Objetivo

Garantir que a proprietária/admin consiga operar dados internos da própria organização.

```text
abrir
→ editar
→ salvar
→ confirmar linha afetada
→ reler o banco pelo mesmo ID
→ comparar dados
→ refresh completo
→ reabrir
→ encontrar o mesmo valor
```

## Capacidades mínimas

- Abrir clientes, pessoas, núcleos e casos da própria organização.
- Editar caso e próxima ação.
- Criar/editar tarefas.
- Editar pessoas/participantes.
- Criar/editar dados de pesquisa.
- Registrar documentos e fontes.
- Salvar proposta, contrato e OS em rascunho permitido.

## Padrão de escrita obrigatório

```text
UI
→ handler
→ server function
→ validação de payload/schema
→ UPDATE/INSERT com organization_id
→ confirmação de linha afetada
→ releitura independente
→ comparação campo a campo
→ invalidar/refetch de cache
→ mensagem de sucesso somente após confirmação
```

### Regras

- Zero linhas afetadas é erro, não sucesso.
- Exibir o erro real do Supabase/Postgres de modo legível.
- Não fechar formulário em caso de falha.
- Não exibir “salvo” antes da releitura confirmar.
- UI e banco devem compartilhar os mesmos enums/check constraints.
- Leituras e escritas devem usar o mesmo `organization_id`, `case_id` e ID da entidade.

## Critério de aceite

Cada domínio passa no teste:

```text
editar → salvar → reler → refresh → reabrir → confirmar persistência
```

---

# P1 — Motor de Caso Canônico, Núcleo e Participantes

## Objetivo

Garantir uma única fonte de verdade para caso individual/familiar, núcleo e participantes.

## Definições

```text
case_id = chave técnica imutável
case_code = identificador humano visível
alias = código histórico pesquisável, sem criar outro caso
```

## Caso individual

```text
Cliente contratante
→ caso canônico
→ pessoa requerente
→ pesquisa/documentos/jornada
→ proposta/contrato/financeiro
→ App Cliente individual
```

## Caso familiar

```text
Contato principal
→ caso familiar canônico
→ núcleo familiar
→ participantes individuais
→ trilhas individuais e compartilhadas
→ contrato/financeiro conforme escopo
→ App Cliente com visibilidade por pessoa
```

## Entidades

Usar as já existentes e criar apenas o que realmente faltar:

```text
clientes
crm_casos / citizenship_cases
nucleos_familiares
case_members
case_dependents
nucleo_membros
persons / perfis de pessoa
person_relationships
case_participants
case_lineages
case_aliases
```

## Regras

- Não criar novo caso para resolver alias ou duplicidade.
- Não criar novo núcleo para corrigir vínculo.
- Não criar cópia de caso para o App Cliente.
- Não escrever em `nucleo_membros` e ler em `case_members` sem ponte/sincronização explícita.
- Para cada tela, declarar qual entidade é canônica, onde grava e onde relê.
- Possível duplicidade é alerta; não é merge automático.

## Motor de unificação controlada

```text
Detecção
→ comparação
→ matriz de reconciliação
→ decisão humana da proprietária
→ reapontamento controlado
→ aliases/histórico preservados
→ arquivamento lógico da origem
→ validação após refresh
```

Não executar merge/reapontamento antes de matriz aprovada pela proprietária.

---

# P2 — Motor Comercial, Proposta, Contrato e Ordem de Serviço

## Objetivo

Permitir transformar uma oportunidade em caso operável e preparar instrumentos internos sem travas artificiais.

## Fluxo

```text
Lead
→ Discovery
→ Oportunidade
→ Proposta
→ Aceite
→ Caso canônico
→ Condição comercial
→ Contrato rascunho
→ Ordem de Serviço
→ Execução
```

## Motor de proposta

- Proposta sempre vinculada ao mesmo `case_id`.
- Deve conter escopo, produtos/SKUs, valor, condição, validade e contato financeiro quando aplicável.
- Rascunho de proposta não depende de assinatura, cobrança, portal completo ou checklist futuro.
- Aceite formal pode materializar caso de forma idempotente, sem criar duplicidade.

## Motor contratual

### Conteúdo jurídico/contratual

```text
Partes
Escopo
Cláusulas
Anexos
Versões
Revisão jurídica
Observações
Matriz jurídica aplicável
Modelo vigente
Parâmetros contratuais
Conflitos/exigências jurídicas
```

Esses conteúdos são jurídicos/contratuais e não devem ser classificados como “Dados técnicos”.

### Dados técnicos de sistema

```text
IDs
logs
auditoria de fundo
integridade
erros de integração
rastreabilidade técnica
```

### Regras de rascunho

- Contrato pode existir como rascunho.
- Cláusula salva com título e texto quando essa for a regra vigente.
- Anexo salva com título; código interno opcional/gerado quando aplicável.
- Não exigir todos os documentos futuros para salvar preparação interna.
- Perfil institucional da contratada deve ser reutilizado automaticamente; não duplicar dados societários em cada caso.

## Motor de Ordem de Serviço

- OS vinculada ao mesmo caso, proposta e contrato quando aplicável.
- Criar em rascunho.
- Editar escopo, observação, entregáveis e status permitido.
- Abrir a partir do Caso 360 já filtrada pelo `case_id`.
- Salvar/reler após refresh.

## Ações externas

- Assinatura, envio externo, cobrança e convite externo não são ações de rascunho.
- Exigem destinatário/objeto resolvido, integração real e confirmação explícita.
- Não apresentar botão morto “Enviar ao cliente (desabilitado)” como ação principal.

---

# P3 — Motor de Tarefas, Próxima Ação e Cadência

## Objetivo

Garantir que nenhuma alteração relevante fique sem continuidade operacional.

## Regra

Após salvar uma alteração relevante, oferecer uma destas saídas:

```text
1. Criar tarefa vinculada ao mesmo case_id.
2. Atualizar a próxima ação do caso.
3. Marcar “Sem nova ação necessária”.
```

A decisão não pode bloquear o salvamento do dado principal.

## Tarefa

```text
case_id obrigatório
participante/pessoa quando aplicável
título
status
responsável
prioridade
origem
prazo opcional para rascunho interno
```

## Fontes de tarefa

- Participante sem informação/documento necessário.
- Documento solicitado, recebido, recusado ou pendente.
- Fonte genealógica a revisar.
- Hipótese/achado que exige validação.
- Proposta que exige retorno.
- Contrato em revisão.
- OS que exige execução.
- Micro-entrega concluída.
- Mudança de fase/prazo.
- Onboarding iniciado/pausado.

## Idempotência

Não duplicar tarefa em cada salvamento. Reutilizar/atualizar tarefa existente usando uma chave lógica:

```text
case_id + origem + referência da entidade + status aberto
```

## Próxima ação

Todo caso deve exibir próxima ação ativa, responsável e prazo quando houver.

```text
Casos sem próxima ação
→ alerta no Painel Hoje
→ ação disponível para definir/reprogramar
```

---

# P4 — Motor de Onboarding Real

## Objetivo

Transformar “Iniciar onboarding” em uma jornada operacional persistente, não apenas em tela/checklist.

## Fluxo

```text
Iniciar onboarding
→ localizar onboarding existente pelo mesmo case_id
→ reutilizar se ativo/rascunho
→ criar somente se inexistente
→ definir responsável
→ definir primeira micro-entrega
→ criar próxima ação
→ criar tarefas compartilhadas e individuais
→ mostrar no Caso 360
→ mostrar no Painel Hoje
→ preparar atualização do App Cliente quando aplicável
→ persistir após refresh
```

## Regras

- Um onboarding por `case_id`.
- Não criar onboarding por aba, pessoa, país ou cenário como entidades paralelas.
- Templates podem variar por serviço, SKU, país, rota, escopo e composição familiar.
- Caso familiar tem tarefas compartilhadas e individuais por participante.
- Onboarding interno pode iniciar como rascunho/ativo antes de assinatura e pagamento.
- Assinatura, cobrança, convite externo e ativação formal continuam com validação no momento próprio.

## Cadência base

| Marco | Ação interna | Resultado operacional |
|---|---|---|
| D0 | Definir contato, responsável e primeira ação | Onboarding criado/retomado |
| D1–D3 | Organizar dados e documentos iniciais | Tarefas individuais/familiares |
| D4–D7 | Registrar primeira leitura/achado | Micro-entrega inicial |
| D8–D10 | Follow-up de pendências sem resposta | Tarefa de acompanhamento |
| D11–D14 | Repriorizar/escalonar/reprogramar | Próxima ação revisada |
| Marco concluído | Criar sequência seguinte | Jornada contínua |

---

# P5 — Motor de Pesquisa, Fontes, Documentos e Evidências

## Objetivo

Organizar pesquisa genealógica como fluxo de evidência e consequência operacional.

## Fluxo

```text
Base/repositório
→ fonte
→ consulta/busca
→ evidência
→ achado
→ hipótese ou confirmação
→ pessoa/linhagem
→ documento
→ relatório/micro-entrega
→ próxima ação ou tarefa
```

## Bibliotecas e fontes

A área de Pesquisa deve abrigar:

```text
Bibliotecas genealógicas
Fontes genealógicas
Bases e repositórios
Pessoas da pesquisa
Linhagens
Evidências
Achados
Hipóteses
Solicitações documentais
Documentos de pesquisa
Relatórios de pesquisa
```

Cada item relevante deve informar:

```text
status
responsável
próxima ação
tarefa vinculada
caso/pessoa/linhagem relacionada
última revisão
origem/evidência
```

## Regras

- Hipótese não é confirmação.
- Fonte não é apenas lista; precisa ter status/risco/responsável/próxima ação quando aplicável.
- Documento recebido deve poder gerar revisão, tarefa e atualização de jornada.
- Solicitação documental deve poder ter responsável, prazo, status e consequência.
- Pesquisa externa só acontece com integração/autorização quando necessária.
- APIs, tokens e matching interno permanecem no backend/Centro de Inteligência.

## Upload real

Não declarar upload como concluído se houver somente registro de metadados. Upload real exige Storage, vínculo, permissões, leitura e recuperação do arquivo.

---

# P6 — Motor de Micro-entregas, App Cliente e Portal

## Objetivo

Fazer o App Cliente refletir o caso canônico e receber apenas informações liberadas, úteis e compreensíveis.

## Regra

```text
Desk opera
→ dado/ação persistida
→ micro-entrega ou atualização preparada
→ revisão interna
→ liberação autorizada
→ App Cliente mostra contexto e próximo passo
```

## Visibilidade

Toda entrega deve ter:

```text
case_id
participante opcional
visibilidade: interna | família | participante
origem: documento | pesquisa | diagnóstico | contrato | milestone | outro
estado de aprovação/liberação
```

## App Cliente: taxonomia visual aprovada

```text
Home
Jornada
Radar
Árvore
Documentos
Legado
Conta
```

Não renomear, remover, fundir ou substituir essas telas sem aprovação explícita da proprietária.

### Home

```text
Painel do caso, progresso e achados recentes
```

### Jornada

```text
Linha do tempo ancestral e marcos de jornada
```

### Radar

```text
Radar de elegibilidade em seis eixos
```

### Árvore

```text
Árvore genealógica G1–G5
```

### Documentos

```text
Upload real quando existir, checklist e entregas do caso
```

### Legado

```text
Biblioteca de conteúdo e nível premium
```

### Conta

```text
Perfil, plano, alertas e histórico
```

## Portal/App Client

- App Cliente é visualização do mesmo `case_id`; não criar caso duplicado.
- Participante vê somente conteúdo autorizado para seu perfil/núcleo.
- Contato principal pode ver a visão familiar compartilhada quando permitido.
- Owner/admin pode abrir a visão de família da própria organização sem logout e sem se tornar cliente.
- Convite de revisão de proposta/contrato pode usar nível específico de portal quando houver fluxo real.
- Workspace completo pode ter regra de estado própria, sem impedir rascunhos internos.

---

# P7 — Motor de Catálogo, Financeiro e Comercial

## Objetivo

Manter produto, preço, condição comercial e cobrança ligados ao mesmo caso e à mesma fonte de verdade.

## Fonte única

```text
Planilha Mestre de Produtos / product_catalog
→ SKU
→ preço
→ condição
→ status
→ link de cobrança quando existir
→ proposta
→ caso
→ acompanhamento de conversão
```

## Regras

- Marketing e App Cliente podem consultar catálogo; não podem manter uma segunda fonte de preço/SKU.
- Condição comercial deve permanecer vinculada ao `case_id` canônico.
- Financeiro pode ser familiar ou individual, mas não cria outro caso.
- Pagamento confirmado deve gerar/atualizar próxima ação de execução/onboarding quando aplicável.
- Cobrança externa exige integração real e confirmação explícita.
- Não usar ausência de cobrança para bloquear rascunho interno.

---

# P8 — Motor de Marketing, Conteúdo e Conversão

## Objetivo

Conectar aquisição, relacionamento e conversão ao caso canônico sem automação externa indevida.

## Fluxo

```text
Conteúdo/campanha
→ landing/formulário
→ lead
→ segmentação
→ cadência
→ discovery
→ oportunidade
→ proposta
→ caso canônico
```

## Componentes

```text
Dashboard de marketing
Produtos e ofertas
Campanhas
Conteúdos
Landing pages
Formulários e captação
Segmentos e públicos
Automação e cadências
Origem de leads
Conversão e funil
Biblioteca de mensagens
Métricas de campanha
```

## Regras

- Biblioteca de mensagens deve permitir criar/editar texto, não apenas mudar status.
- Cadência pode criar rascunho e tarefa; não enviar automaticamente mensagem externa.
- CAC/CPL/ROI somente quando houver dados reais suficientes.
- Oferta contextual deve ter SKU, preço, elegibilidade e link reais antes de ser exibida ao cliente.

---

# P9 — Motor de Cockpit, Indicadores e Alertas

## Objetivo

Transformar listas, bibliotecas, cards e métricas isoladas em decisão operacional acionável.

## Desk Intelligence: taxonomia visual aprovada

```text
Visão Geral
Casos 360
Checklist
Validação Jurídica
Radar Interno
Alertas
Biblioteca Mestre
```

Não renomear, fundir ou substituir essas sete telas sem aprovação explícita da proprietária.

## Regra visual

```text
Indicador
→ pessoa/caso afetado
→ motivo
→ impacto restrito
→ próxima ação
→ tarefa/responsável/prazo
→ atualização preparada para App Cliente quando aplicável
```

## Indicadores essenciais

```text
Tarefas vencidas ou para hoje
Casos sem próxima ação
Cadências atrasadas
Documentos aguardando retorno
Contratos em revisão
Propostas a vencer
Casos sem responsável
Achados prontos para síntese
Atualizações prontas para App Cliente
Fontes sem revisão recente
```

Sem dados suficientes:

```text
Sem dados suficientes
```

Não usar zero falso ou KPI decorativo.

## Exemplo operacional

```text
Pedido de dados de João está atrasado há 3 dias.
Caso: Ana Luiza / núcleo familiar.
Responsável interno: Tatiana.
Pessoa responsável por revisar: Ana Luiza.
Impacto: afeta somente a organização documental de João.

[Abrir tarefa]
[Reprogramar]
[Marcar recebimento]
[Preparar atualização do app]

Atualização preparada:
“Ana, precisamos confirmar os dados de João para avançar na organização
 da etapa familiar. Assim que você revisar essas informações, atualizamos
 a linha de documentos da família.”
```

Nenhuma comunicação externa é enviada automaticamente.

---

# P10 — Motor de Integrações Externas e Escala

## Objetivo

Conectar serviços externos somente depois que o fluxo interno estiver confiável.

## Integrações futuras

```text
Storage/upload de arquivos
E-mail
WhatsApp
Asaas
Portal/convites
APIs genealógicas
FamilySearch e outras fontes aprovadas
Google Drive/documentos
Calendário
Formulários
Analytics
```

## Regra de arquitetura

```text
Integração invisível.
Evidência visível.
```

Backend/Centro de Inteligência deve cuidar de:

```text
credenciais
tokens
OAuth
rate limits
matching
normalização
cache
filas
logs
regras de negócio
```

Front/App Cliente deve mostrar:

```text
status
fonte
última atualização
nível de confiança
registro encontrado / hipótese / validado
próximo passo
entrega liberada
```

---

# P11 — Motor de Revisão Visual e Marca

## Pré-requisito

Só iniciar revisão visual ampla depois que:

```text
Ana está operável
Contrato rascunho persiste
OS persiste
Onboarding real existe
Tarefas e próxima ação funcionam
Dados sobrevivem a refresh
Fonte canônica por tela está decidida
```

## Marca

Usar identidade oficial do Clube Ancestral:

```text
Navy: #2F4B6E
Preto: #101010
Bege: #ECDFCD
Dourado: #FCB73A
Terracota: #9A3A2F
```

## Regras mobile-first

- Não usar tabelas horizontais para informação essencial no celular.
- Converter partes de contrato e listas operacionais em cards empilhados.
- Usar acordeões para dados técnicos, histórico e bibliotecas extensas.
- Garantir safe area inferior.
- Assistente flutuante não pode cobrir campos, teclado, ações ou botão Salvar.
- Códigos/aliases não devem quebrar por hífen; rolagem horizontal somente se necessária.

## Separação de superfícies

```text
Desk Intelligence = operação interna
App Cliente = jornada e entregas da família
Centro de Inteligência = fontes, bases, APIs, matching e regras internas
```

---

## 12. Testes de aceite gerais

Para cada motor implantado:

```text
1. Abrir a rota.
2. Executar ação interna.
3. Confirmar escrita no Supabase.
4. Confirmar linha afetada.
5. Reler mesma entidade pelo mesmo ID.
6. Dar refresh completo.
7. Reabrir e confirmar persistência.
8. Confirmar tarefa/próxima ação quando aplicável.
9. Confirmar visibilidade correta no Caso 360/Painel Hoje/App Cliente.
10. Confirmar que nenhuma ação externa foi enviada sem confirmação.
```

---

## 13. Entrega para cada motor

Cada motor deve ser entregue em PR isolada, com:

```text
- objetivo explícito;
- escopo limitado;
- tabelas/RPCs usadas;
- rotas e funções alteradas;
- migrations aditivas, se inevitáveis;
- regras de idempotência;
- testes de persistência após refresh;
- falhas reais restantes;
- URL de preview;
- sem merge automático em main.
```

---

## Regra final

> Não construir motor que apenas mostra status. Construir motor que preserva o dado, produz continuidade operacional e respeita a separação entre operação interna, experiência do cliente e ações externas.

```text
Caso canônico.
Dados persistidos.
Contrato operável.
Onboarding real.
Pesquisa com evidência.
Tarefa quando necessária.
Próxima ação clara.
Entrega liberada corretamente.
Integração segura.
Nenhum trabalho perdido.
```
