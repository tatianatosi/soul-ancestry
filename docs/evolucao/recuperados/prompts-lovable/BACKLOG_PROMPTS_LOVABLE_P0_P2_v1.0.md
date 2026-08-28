# Backlog de Prompts Lovable — P0 a P2

**Versão:** v1.0  
**Data:** 21 de agosto de 2026  
**Projeto:** Clube Ancestral — CRM/Desk Intelligence  
**Uso:** Executar um prompt por vez, revisar a interface e os testes antes do próximo.  

---

# P0 — CA-LOVABLE-VALIDACAO-UI-E-NAVEGACAO-v1.0

## Contexto

O Desk possui uma arquitetura canônica de sete áreas principais. Houve regressões anteriores em que menus antigos, abas extras, duplicidades e rotas sem vínculo apareciam no preview. Este prompt é exclusivamente de validação e correção de interface/navegação. Não é uma entrega de novos módulos.

## Objetivo

Validar a interface de preview/produção contra a navegação canônica, remover duplicidades visuais e garantir que módulos contextuais apareçam somente no local correto.

## Navegação canônica obrigatória

O menu global do Desk deve ter exatamente estas sete áreas principais:

1. Visão geral
2. Comercial
3. Casos e núcleos
4. Pesquisa genealógica
5. Operação
6. Contratos e financeiro
7. Governança e biblioteca

## Regras obrigatórias

- Não criar nenhuma oitava aba principal.
- Não manter menu legado de 14 abas ou outra lista paralela de abas globais.
- Subitens devem aparecer somente dentro da área principal aberta.
- `/nucleos` deve aparecer exclusivamente como subitem de **Casos e núcleos**.
- Pesquisa Genealógica e Evidências deve ser subnavegação contextual da ficha de caso e nunca uma aba global adicional.
- Formalização, Fechamento, Jornada, Relatórios F1/F2, Alertas e Histórico devem permanecer em contexto de caso ou rota já aprovada, sem virar abas globais.
- Biblioteca Mestre, Bases Genealógicas, Matrizes conceituais, Indicadores e Log de decisões devem ser subitens distintos de **Governança e biblioteca**.
- Módulos administrativos devem permanecer como subitens de Governança e biblioteca.
- A tela do App Cliente não deve expor subitens internos do Desk.

## Escopo de validação

1. Localizar a única fonte de verdade que monta o menu/shell/navegação global.
2. Remover ou desativar mapas, constantes, componentes e fallbacks que ainda renderizem abas legadas ou duplicadas.
3. Confirmar que cada rota possui um link contextual correto ou acesso controlado por URL.
4. Validar que o menu em desktop e mobile usa a mesma fonte normativa.
5. Validar estados de carregamento, rota inexistente, permissão negada e menu recolhido.
6. Validar que a rota `/nucleos` funciona sem criar nova entrada global.
7. Validar a presença separada de Biblioteca Mestre e Bases Genealógicas em Governança e biblioteca; não substituí-las por Log de decisões.
8. Não alterar regras de conversão, catálogo, pesquisa, onboarding, fontes externas ou dados dos pilotos.

## Restrições rígidas

- Não criar tabelas, migrations ou entidades novas.
- Não editar dados de casos, leads, produtos, dossiês, fontes ou registros de migração.
- Não disparar integração, consulta, OCR, IA externa, e-mail, mensagem, contrato, cobrança, assinatura, pasta, arquivo, documento ou publicação no App Cliente.
- Não criar abas globais novas.
- Não reescrever módulos funcionais fora da navegação.

## Critérios de aceite

1. O menu global exibe exatamente sete áreas principais.
2. Não há menu paralelo, aba duplicada ou fallback com 14 abas.
3. `/nucleos` aparece apenas como subitem de Casos e núcleos.
4. Pesquisa Genealógica e Evidências não é aba principal duplicada.
5. Biblioteca Mestre e Bases Genealógicas aparecem separadamente sob Governança e biblioteca.
6. Desktop e mobile exibem a mesma estrutura normativa.
7. Rotas diretas não autorizadas retornam estado seguro, sem expor dados internos.
8. Typecheck, build e testes existentes passam.

## Resposta esperada do Lovable

Ao concluir, responda somente com:

1. Arquivo(s) que eram fonte de navegação e foram alterados.
2. As sete entradas globais validadas.
3. Subitens validados em Casos e núcleos e Governança e biblioteca.
4. Rotas testadas.
5. Resultado de typecheck, build e testes.
6. Itens que não foram alterados por estarem fora de escopo.

Não iniciar nenhum prompt adicional automaticamente.

---

# P1 — CA-LOVABLE-CRM-DISCOVERY-HANDOFF-COCKPIT-v1.0

## Contexto

A arquitetura de CRM, fontes canônicas, regras de conversão e bloqueios de aceite já existem. O objetivo não é reconstruir CRM, conversão, catálogo, onboarding ou casos. O objetivo é concluir a operação diária do Comercial: entrada manual de leads, Discovery, handoff e cockpit priorizado.

## Objetivo

Implementar ou corrigir a experiência operacional em **Comercial → Leads** e **Painel Hoje**, para permitir registrar, qualificar, acompanhar e transferir leads sem violar os gates de conversão.

## Escopo obrigatório

### 1. Cadastro manual de lead

Na tela Comercial → Leads, disponibilize uma ação visível **“Novo lead”**.

O formulário inicial deve salvar o lead diretamente em Triagem e conter:

- Nome completo: obrigatório.
- Telefone ou e-mail: pelo menos um obrigatório.
- Origem: dropdown fechado com indicação, formulário, Instagram, WhatsApp, site, evento e outro.
- Interesse inicial: dropdown fechado, incluindo “a confirmar”.
- Responsável: obrigatório.
- Próxima ação: obrigatória.
- Prazo da próxima ação: obrigatório.
- Resumo: texto livre curto.
- Indicado por: opcional.

Ao salvar:

- Gerar ou preservar o ID `CA-LEAD-AAAA-SEQ`.
- Alertar possíveis duplicidades por e-mail, telefone e nome.
- Permitir abrir o registro existente quando houver duplicidade.
- Não copiar formulários inteiros ou dados não autorizados ao CRM.

### 2. Discovery e oportunidade disciplinada

- Preservar a ficha de Discovery já existente; não criar uma segunda ficha.
- Garantir responsável, próxima ação e prazo em todas as etapas operacionais da oportunidade.
- Preservar os dois eixos de Discovery e resultado derivado.
- Preservar travas de call, perda, proposta, contrato e pagamento.
- Manter elegibilidade como sinal interno preliminar.
- Manter interações imutáveis e rastreáveis.

### 3. Handoff operacional

Exibir a passagem Discovery → oportunidade → handoff, sem avanço automático para contrato, cobrança ou onboarding.

A visão deve mostrar:

- O que foi confirmado no Discovery.
- O que falta confirmar.
- Responsável atual.
- Próxima ação e prazo.
- Pendências que bloqueiam proposta, formalização e onboarding.
- Histórico de interações e eventos relevantes.

### 4. Cockpit diário

No `/painel`, manter uma lista única priorizada que:

- Ordene por prazo da próxima ação, nunca por data de criação.
- Destaque vencidas, ações de hoje e próximas ações futuras.
- Exiba área, responsável nominal, etapa e motivo de priorização.
- Possua filtros por área, responsável e etapa comercial.
- Reutilize `listaPrioritaria` em `src/lib/crm-desk.ts`, ou o equivalente existente, sem criar uma lógica concorrente.

A lista deve coexistir com as filas já existentes: ações vencidas, ações de hoje, leads sem responsável, leads sem próxima ação, calls de hoje, propostas sem follow-up, contratos enviados, pagamentos aguardados, onboardings pendentes e documentos aguardados.

### 5. Escada de conversão

Evidenciar visualmente a sequência:

```text
Aceite verbal
→ confirmação formal
→ contrato e cobrança
→ onboarding
```

Regras:

- Aceite verbal não cria cliente e não libera contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente.
- Confirmação formal libera apenas preparação da formalização.
- Contrato e pagamento confirmados são pré-condições para onboarding, junto aos gates existentes.
- Toda transição continua gravando evento imutável.

Verificação de regressão:

- João deve permanecer em “aceite verbal — confirmação formal pendente”, com contrato e cobrança bloqueados.
- Ana Luiza deve permanecer em “aceite confirmado — formalização pendente”, com onboarding bloqueado até os gates aplicáveis.

## Restrições rígidas

- Não criar aba global nova.
- Não alterar a navegação canônica de sete áreas.
- Não recriar módulos de conversão, catálogo, onboarding, casos, núcleos ou pesquisa genealógica.
- Não criar tabelas ou migrations, salvo defeito comprovado; se migration for necessária, parar e explicar antes de aplicá-la.
- Não criar ou alterar cobranças, produtos, links, assinaturas, clientes, contratos, pastas, arquivos, documentos, mensagens, e-mails ou comunicações externas.
- Não executar consultas externas, OCR, IA externa, pesquisa nominal externa, solicitação de certidão ou contato com instituição.
- Não publicar no App Cliente.

## Critérios de aceite

1. “Novo lead” aparece em Comercial → Leads e cria lead em Triagem com validações mínimas.
2. Duplicidade por e-mail, telefone ou nome gera alerta.
3. Oportunidade não fica operável sem responsável, próxima ação e prazo.
4. Painel Hoje ordena a lista principal pela próxima ação/prazo e destaca atrasos.
5. Filtros de área, responsável e etapa funcionam.
6. Discovery, handoff e interações são visíveis sem fichas duplicadas.
7. João e Ana preservam os estados e bloqueios indicados.
8. Não há ação externa, nova aba global ou regressão de navegação.
9. Typecheck, build e testes existentes passam; adicionar testes focados nas regras quando a infraestrutura já existir.

## Resposta esperada do Lovable

Ao concluir, responda somente com:

1. Arquivos alterados.
2. Telas e rotas alteradas.
3. Regras e bloqueios confirmados.
4. Testes executados e resultado.
5. Itens não alterados por estarem fora de escopo.
6. Pendência real que impeça critério de aceite.

Não iniciar nenhum prompt adicional automaticamente.

---

# P2 — CA-LOVABLE-BIBLIOTECA-MESTRE-CARGA-E-VALIDACAO-v1.0

## Pré-condição obrigatória

Este prompt só pode ser executado depois da aprovação humana da **base curada da Biblioteca Mestre**. Não inventar conteúdo, referências, normas, documentos, fontes, versões, vigências, responsáveis ou links.

Se a base curada não tiver sido fornecida, parar e responder que a implementação não pode iniciar sem o inventário aprovado.

## Contexto

A arquitetura da Biblioteca Mestre pode estar parcialmente implementada, mas a interface não deve ser considerada concluída sem itens internos reais, metadados completos, filtros, regras de homologação e validação funcional.

A Biblioteca Mestre é interna. Ela não é o Log de decisões, não substitui Bases Genealógicas e não tem projeção ao App Cliente.

## Objetivo

Carregar, apresentar e validar exclusivamente os itens aprovados da Biblioteca Mestre, reutilizando a arquitetura existente e sem criar novas abas globais.

## Escopo obrigatório

### 1. Localização e navegação

- Preservar Biblioteca Mestre como subitem de **Governança e biblioteca**.
- Preservar Bases Genealógicas como subitem separado.
- Preservar Matrizes conceituais, Indicadores e Log de decisões como subitens separados.
- Não transformar Biblioteca Mestre em uma nova aba global.

### 2. Dados permitidos

Usar apenas os itens explicitamente fornecidos e aprovados na base curada.

Cada item deve possuir, quando aplicável:

- Título.
- Tipo/categoria.
- Subárea/taxonomia.
- País ou escopo.
- Status.
- Versão.
- Vigência ou data de revisão.
- Responsável.
- Fonte/origem.
- Link interno, se aprovado.
- Observação de uso.
- Status de homologação.

Não fabricar campos ou preencher valores fictícios para aparentar completude.

### 3. Funções de interface

- Busca por título, tipo, origem ou referência permitida.
- Filtros por status, responsável, país/escopo e subárea.
- Visualização de detalhe do item.
- Indicação clara de versão, vigência, responsável e homologação.
- Arquivamento lógico com motivo, se a regra e a permissão já existirem.
- Estado vazio explícito quando uma subárea não possuir itens aprovados.

### 4. Segurança e limites

- Aplicar RLS e permissões existentes.
- Não expor Biblioteca Mestre ao App Cliente.
- Não criar documentos, arquivos, pastas ou links em Drive, Dropbox ou outro serviço externo.
- Não consultar fontes externas, OCR, IA externa ou sites externos.
- Não alterar Planilha Mestre, Asaas, Placego, CRM OPS ou fontes legadas.
- Não iniciar Bases Genealógicas, pesquisa externa ou ativações de fontes a partir desta tela.

### 5. Relações de governança

- Permitir que a interface indique, quando fornecido na base aprovada, quais módulos ou rotinas internas consomem um item.
- Não substituir Matrizes conceituais, Indicadores ou Log de decisões pela Biblioteca Mestre.
- Não duplicar o conteúdo de Bases Genealógicas na Biblioteca Mestre sem item aprovado e classificação explícita.

## Itens fora de escopo

- Curadoria intelectual de conteúdo.
- Criação de normas, documentos, modelos ou fontes.
- Importação automática de Drive, Dropbox, Google Drive, Planilha Mestre ou web.
- Pesquisa externa.
- Publicação no App Cliente.
- Mudança da arquitetura de navegação de sete áreas.
- Criação de nova aba global.

## Critérios de aceite

1. Biblioteca Mestre aparece como subitem de Governança e biblioteca.
2. Bases Genealógicas permanece separada da Biblioteca Mestre.
3. Somente itens da base curada aprovada são carregados ou exibidos.
4. Itens mostram os metadados mínimos aprovados.
5. Busca, filtros e detalhe funcionam.
6. Subáreas sem conteúdo mostram estado vazio, sem dados fictícios.
7. Arquivamento é lógico e requer motivo, quando disponível na arquitetura existente.
8. Nenhum item aparece no App Cliente.
9. Nenhuma ação externa, importação automática ou consulta externa é executada.
10. Typecheck, build e testes existentes passam; adicionar testes de visualização, filtros e isolamento quando houver infraestrutura.

## Resposta esperada do Lovable

Ao concluir, responda somente com:

1. Confirmação da base curada recebida e sua origem interna.
2. Arquivos e entidades reutilizados ou alterados.
3. Itens/subáreas carregados, sem repetir conteúdo integral sensível.
4. Filtros, busca, detalhe e estados vazios validados.
5. Regras de RLS, arquivamento e isolamento do App Cliente confirmadas.
6. Testes executados e resultado.
7. Itens que não foram alterados por estarem fora de escopo.
8. Pendências que dependem de curadoria ou decisão humana.

Não iniciar nenhum prompt adicional automaticamente.
