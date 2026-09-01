# Diagnóstico operacional — Contrato, tarefas, perfis e sistemas de pesquisa

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: diagnóstico operacional e recomendação de uso
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Relato de verificação operacional recebido em 2026-08-31
  - Prompt Mestre — Motores a Implantar
  - Mapa de Autoridade Admin, conforme relato
  - PR #35, conforme relato
escopo:
  - comportamento dos botões de contrato
  - cobertura atual de criação de tarefas
  - separação entre Piloto Real, go-live e onboarding
  - superfícies com e sem persistência comprovada
  - delimitação provisória dos três sistemas de Pesquisa
premissas:
  - achados relatados foram verificados em rota/função/tabela/persistência pelo time responsável
  - o presente artefato consolida a orientação e não substitui testes de preview pela proprietária
limites:
  - não autoriza alteração de interface, remoção de botão, unificação de sistemas ou mudança de dados
  - não prova comportamento atual sem nova checagem direta caso código/deploy seja alterado
próximos passos:
  - aprovar ou rejeitar limpeza dos botões redundantes do contrato
  - definir expansão do motor de tarefas
  - concluir mapa de autoridade e especificar onboarding único
critério de aceite:
  - toda ação exibida como primária executa comportamento distinto, persistente e verificável
  - todo salvamento relevante suporta releitura pelo mesmo ID e confirmação após refresh
substitui: nenhum
```

## Resumo executivo

Dois achados principais foram confirmados:

1. Três botões no contrato são redundantes e não iniciam ações próprias: apenas trocam para uma aba que já pode ser aberta pela navegação de abas.
2. Pesquisa não é um único módulo: há três sistemas paralelos sob o mesmo menu, sem comunicação entre eles; somente dois possuem persistência comprovada conforme o relato.

A orientação provisória para evitar retrabalho no caso de Ana Luiza é operar somente nas superfícies liberadas e não iniciar onboarding, Comercial/Financeiro, Pesquisa Sistema C ou o Painel Hoje como fonte de trabalho.

## 1. Contrato: botões redundantes

| Controle atual | Comportamento apurado | Classificação |
|---|---|---|
| Editar contrato | Troca para a aba de resumo/edição correspondente | Redundante com navegação por abas |
| Adicionar cláusula | Troca para a aba Cláusulas | Redundante com navegação por abas |
| Adicionar anexo | Troca para a aba Anexos | Redundante com navegação por abas |
| Salvar rascunho | Persiste rascunho | Ação operacional real |
| Criar tarefa | Cria tarefa vinculada | Ação operacional real |
| Solicitar revisão humana | Dispara o fluxo interno previsto | Ação operacional real |

### Decisão pendente

Não remover ou alterar botões sem aprovação da proprietária. A recomendação é, em uma passada exclusiva de UX/semântica:

- Manter como ações principais apenas controles que executam uma ação distinta e verificável.
- Converter “Editar contrato”, “Adicionar cláusula” e “Adicionar anexo” em navegação contextual, se forem mantidos.
- Evitar apresentar navegação de aba como botão de ação transacional.

Critério de aceite da limpeza: cada botão de ação principal precisa modificar, persistir, solicitar revisão, abrir um formulário/modal de criação, ou iniciar outra operação que não seja simples repetição da navegação existente.

## 2. Cobertura atual de Criar tarefa

### Disponível conforme relato

| Superfície | Situação |
|---|---|
| Painel Ops | Disponível |
| Pessoa / Perfil 360 | Disponível após salvar |
| Caso 360 | Disponível |
| Contrato | Disponível |
| Pesquisa Sistema A — `/pesquisa/$id`, aba Tarefas | Disponível |
| Pesquisa Sistema B — `/pesquisa-modulo`, via pendência | Disponível |

### Ainda indisponível conforme relato

| Superfície | Situação |
|---|---|
| Piloto Real | Não existe |
| Núcleos | Não existe |
| Propostas / Comercial | Não existe |
| Clientes | Não existe |

### Regra operacional

A ausência de “Criar tarefa” em uma tela não deve ser compensada com listas fixas, duplicação de tarefas ou criação de uma segunda jornada. A ampliação da cobertura deve obedecer ao motor P3, usando o mesmo `case_id`, responsável, origem e chave de idempotência do caso canônico.

## 3. Três superfícies confundidas como perfil

| Superfície | Rota indicativa | O que é | O que não é | Escrita disponível |
|---|---|---|---|---|
| Piloto Real | `/piloto-ana` | Painel de leitura de pendências reais | Ficha geral de dados da pessoa | Decisão do ID canônico do caso |
| Go-live / ativação | `/onboarding/$id` | Checklist de requisitos de ativação | Ficha cadastral ou motor de dados | Marcação de checklist |
| Onboarding | Varia conforme sistema | Jornada operacional ainda fragmentada | Fonte canônica de dados neste momento | Evitar uso até definição do motor único |

### Caminho de atualização sem retrabalho

```text
Caso 360
→ dados do caso e próxima ação
→ Contrato / Partes
→ CPF/CNPJ, escopo, cláusulas e anexos do contrato
→ Pessoas e Linhagens
→ apenas dados genealógicos específicos: nascimento, linhagem e pesquisa
```

Não redigitar nome ou documento geral em Pessoas e Linhagens quando já existir no domínio de Cliente, Núcleo ou Contrato.

## 4. Persistência comprovada para uso provisório

Conforme relato, as áreas abaixo têm persistência comprovada e podem ser usadas dentro dos seus limites de domínio:

- Pessoas & Famílias, incluindo G-02 e suas sub-abas.
- Caso 360.
- Contratos: Resumo, Partes, Escopo, Cláusulas, Anexos e Ordens de Serviço.
- Piloto Real.
- Leads.
- Pesquisa Sistema A: `/pesquisa/$id`.
- Pesquisa Sistema B: `/pesquisa-modulo`.
- Achados genealógicos: `/achados`.

Mesmo nessas áreas, a prova de persistência continua sendo:

```text
editar/criar
→ salvar
→ confirmar resultado e linha afetada
→ reler pelo mesmo ID
→ refresh completo
→ reabrir
→ confirmar valor persistido
```

## 5. Superfícies a evitar provisoriamente

Conforme relato, estas áreas ainda não têm comprovação operacional suficiente ou não representam fonte canônica de trabalho:

- Propostas, Faturas e Pagamentos, dentro de Comercial/Financeiro.
- Pesquisa Sistema C: `/pesquisa-evidencias`.
- Edição geral de Clientes, pois não há tela disponível.
- Onboarding fragmentado.
- Painel Hoje, cuja única escrita é descrita como formulário oculto.

## 6. Pesquisa: três sistemas paralelos

| Sistema | Rota | Persistência reportada | Vínculo/uso recomendado |
|---|---|---|---|
| Sistema A | `/pesquisa/$id` | Comprovada | Preferencial para Ana Luiza; vínculo direto com `case_id` e fluxo mais simples |
| Sistema B | `/pesquisa-modulo` | Comprovada | Usar somente quando a finalidade justificar o módulo; não pressupor compartilhamento com A |
| Sistema C | `/pesquisa-evidencias` | Não comprovada | Evitar até mapeamento e validação |

### Regra provisória

Não registrar o mesmo achado em sistemas A e B esperando sincronização. Um registro criado em um não aparecerá automaticamente no outro, conforme o relato. Para Ana Luiza, usar apenas o **Sistema A** como trilha temporária de pesquisa, pois está ligado diretamente ao `case_id` e não depende de tabela extra.

## Riscos e limites

- Três sistemas de pesquisa paralelos mantêm risco de divergência de evidências.
- O onboarding continua fragmentado em três sistemas e não deve receber trabalho de produção.
- Botões redundantes podem induzir a falsa percepção de ação e devem ser tratados em mudança de UX isolada.
- Comercial/Financeiro ainda requer a conclusão de P0 antes de uso operacional.
- A unificação do CNPJ institucional e o motor de participantes continuam fora do escopo deste documento.

## Próximos passos recomendados

1. Proprietária decide se autoriza uma PR isolada para a limpeza semântica dos três botões redundantes do contrato.
2. Consolidar no Mapa de Autoridade Admin a cobertura de tarefa e identificar, rota por rota, a ausência legítima versus o motor pendente.
3. Definir o sistema de pesquisa canônico antes de expandir funcionalidades de evidência.
4. Concluir o mapa de Marketing, Configuração e App Cliente.
5. Preparar especificação de P4 — Onboarding Real / Motor Único — sem reaproveitar interfaces fragmentadas como fonte de verdade.
