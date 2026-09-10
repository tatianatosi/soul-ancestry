# Hotfix urgente — autonomia operacional da proprietária

## Objetivo

Restaurar a autonomia operacional interna da proprietária/admin em toda a plataforma Clube Ancestral. O objetivo não é corrigir um único caso, uma única tela ou um único alerta: é remover os bloqueios indevidos que impedem a dona da operação de trabalhar no próprio aplicativo, preservando as proteções reais de dados e de ações externas.

## Contexto confirmado

Ao longo de mais de uma semana, foram registrados bloqueios recorrentes em login, sessão, resolução de organização, permissões, Comercial, Casos, pré-onboarding, onboarding, Operações, formulários e transições de estado. A ficha de Ana Luiza é apenas um caso visível; não deve limitar o escopo da correção.

O repositório é `tatianatosi/soul-ancestry`.

Referências preservadas:

- Backup operacional: `backup/desk-2026-08-26`
- Commit de backup: `818823eb2c819a8f0b90276d411e93201114943a`
- Main atual após reversão da PR #23: `30585eb449a617619baaef3a58229ccbf5b4160c`
- Branch existente de trabalho anterior: `hotfix/restaurar-operacao-interna`

## Resultado obrigatório

Ao final do hotfix, a proprietária/admin deve conseguir:

- Entrar no aplicativo com a conta real.
- Ser reconhecida na própria organização e no papel administrativo efetivo.
- Abrir, criar, editar, salvar, corrigir e avançar registros internos legítimos.
- Operar Casos, Comercial, CRM, Clientes, Operações, pré-onboarding, onboarding, Pesquisa, Contratos e Ordens de Serviço.
- Entender qualquer pendência restante por causa explícita e rota concreta de ação.
- Não ficar bloqueada por campos auxiliares, validações cerimoniais, caches antigos, estados inconsistentes ou tela sem saída.

## Bloqueios a eliminar

### 1. Autenticação, sessão e organização

- Login não pode depender de segredo administrativo para confirmar uma sessão já autenticada.
- O navegador, servidor e Supabase devem apontar ao mesmo projeto declarado.
- URL e chave pública devem permanecer coerentes com o projeto declarado.
- A resolução de organização deve sempre ser filtrada pelo usuário autenticado.
- O papel efetivo da proprietária/admin deve ser lido da fonte real, não de estado estático, cache ou dado demo.
- GETs autenticados não podem reutilizar cache que apresente organização, papel ou permissões antigos.
- Falhas administrativas secundárias, como atualização de auditoria ou último login, não podem negar um login já autorizado.
- Mensagens de falha precisam distinguir autenticação, configuração, sessão, organização e autorização sem expor dados sensíveis.

### 2. Autonomia da proprietária/admin

- Não criar ou restaurar um “modo proprietária” cerimonial, tela de capacidade, checklist de autoridade ou gate administrativo paralelo.
- Ação interna legítima não pode depender de aprovação interna adicional quando o papel real já autoriza a proprietária/admin.
- Botões e formulários não podem desaparecer ou ficar inertes sem apresentar o motivo e uma ação possível.
- Cada tela deve usar a mesma resolução canônica de papel e organização.
- Nenhuma camada de UI pode contradizer RLS e a autorização efetiva do servidor.

### 3. Formulários e bloqueios de interface

Remover como pré-requisito de salvar, corrigir, avançar, arquivar, confirmar ou registrar ações internas:

- mínimo arbitrário de caracteres em motivo, justificativa, comentário, observação ou nota;
- fonte obrigatória sem necessidade estrutural;
- código interno que possa ser gerado automaticamente;
- campos técnicos, precedência, referência ou metadados que possam ficar em detalhes avançados;
- confirmação interna redundante para ação reversível;
- exigência de texto explicativo antes de alterar estado interno.

Quando esses dados forem úteis para auditoria, preencher padrão rastreável no servidor ou registrar ausência — nunca bloquear a ação interna por redação livre.

### 4. Fluxos de caso e Comercial

- Confirmação formal de oportunidade deve materializar o caso operacional real de forma idempotente, não apenas registrar eventos.
- O vínculo entre lead/oportunidade, pessoa/cliente, caso, contrato, plano, pré-onboarding e onboarding deve ser lido com as chaves reais e a mesma organização.
- A passagem de status deve percorrer estados intermediários exigidos pelo banco; nunca tentar salto inválido.
- Um estado exibido como bloqueado deve corresponder a requisito real gravado, não a regra hardcoded, cache ou coluna divergente.
- O caso não pode permanecer preso em Comercial ou pré-onboarding sem indicar o requisito, o dado de origem, o responsável e a ação de resolução.
- A proprietária/admin deve conseguir executar as ações internas legítimas de correção, avanço e salvamento do caso.
- Nenhum caso real pode ser apagado, duplicado, convertido em fixture ou substituído por dado demo.

### 5. Pré-onboarding e onboarding

- “Pendências de pré-onboarding” deve ser diagnóstico derivado e acionável, não um bloqueio silencioso.
- Listar cada requisito pendente, seu valor atual, fonte, regra de derivação e rota para corrigir.
- Se o requisito já estiver satisfeito no banco, atualizar leitura/cache/consulta em vez de manter badge antigo.
- Requisitos jurídicos, contratuais, comerciais ou documentais precisam ser separados; um não pode mascarar outro sob um rótulo genérico.
- A falta de início do onboarding, prazo ou responsável deve ter ação clara e não ser convertida em bloqueio permanente.
- Não confundir item aguardando fato externo com erro interno, atraso ou falha de autorização.

### 6. Operações, SLA e alertas vermelhos

- Alertas em `/ops` devem vir de dados reais e cálculo único, sem duplicar ou inventar estados.
- Todo alerta deve mostrar: caso/registros envolvidos, causa, regra de SLA, prazo, responsável e rota de ação.
- Remover ou corrigir alertas falsos, órfãos, duplicados, derivados de cache, vinculados a registros inexistentes ou sem ação possível.
- Não ocultar alerta real apenas para deixar a tela sem vermelho.
- Tarefa ou microentrega vencida/em risco deve permitir abrir o item e atualizar dono, prazo, status ou observação conforme a permissão real.
- A interface não pode tratar ausência de prazo aplicável como atraso.

### 7. Contratos, ordens de serviço e formalização

- A proprietária/admin deve conseguir criar e editar dados internos legítimos de contrato e ordem de serviço sem bloqueios artificiais.
- Campos de código interno devem ser gerados quando possível, em vez de impedir rascunho.
- Detalhes técnicos devem permanecer acessíveis, mas não devem ocupar ou bloquear o fluxo principal.
- Campos institucionais da contratada devem usar o perfil institucional vigente, sem exigir digitação pessoal repetida.
- Ordens de serviço devem poder ser abertas no contexto do caso e ter ação de atualização de escopo/observação quando autorizada.
- O perfil institucional vigente deve ser lido do status real; não manter `false` hardcoded em fluxo produtivo.

### 8. Pesquisa, CRM, clientes e demais áreas internas

- Qualquer select que persista no banco deve usar valores aceitos pelas constraints reais.
- O CRM em uso deve apontar para dados reais e não exigir modelos/tabelas vazios para operar.
- A proprietária/admin deve acessar registros reais de clientes e casos pelo papel interno, sem depender de modo demo.
- Rotas internas devem ter as mesmas garantias de sessão, organização e cache aplicadas a Casos e Comercial.
- Páginas de referência, governança e auditoria não podem substituir a superfície operacional onde a ação efetivamente acontece.

## Proteções que permanecem obrigatórias

Este hotfix não é autorização para remover segurança real. Devem permanecer:

- RLS do Supabase.
- Isolamento por organização.
- Validação de identidade/sessão autenticada.
- Controle de papel no servidor para ações de cada área.
- Integridade referencial, constraints e transições estruturais do banco.
- Histórico e auditoria de mudanças.
- Confirmação final explícita para ações externas, irreversíveis ou com impacto fora do sistema: envio de comunicação, cobrança, assinatura, compra, exclusão definitiva, migração destrutiva e equivalentes.

A auditoria deve ser consequência automática da ação interna legítima, nunca uma barreira de texto livre que impede trabalhar.

## Limites explícitos

Não fazer:

- apagar dados reais;
- recriar banco, organização ou usuários com dados fictícios;
- usar fixtures/demo para mascarar a ausência de leitura real;
- criar telas paralelas, painéis decorativos ou fluxos alternativos sem integração;
- criar bypass permanente de autenticação, RLS ou isolamento organizacional;
- ocultar alertas sem corrigir sua causa;
- voltar o projeto inteiro a um backup sem avaliar correções posteriores de login e dados;
- pedir repetidamente screenshots para problemas já documentados.

## Método obrigatório de investigação

1. Partir da `main` atual, preservando histórico e dados.
2. Criar branch de trabalho `hotfix/autonomia-operacional-proprietaria`.
3. Usar o backup `backup/desk-2026-08-26` apenas como referência de comportamento e código, não como restauração cega de todo o projeto.
4. Reproduzir com a conta real de proprietária/admin e casos reais, incluindo Ana Luiza sem reduzir o hotfix a ela.
5. Mapear cada bloqueio por cadeia completa: UI → rota → server function → resolução de sessão/organização/papel → consulta Supabase/RLS → constraint/transição → estado renderizado.
6. Agrupar achados por causa raiz comum e corrigir a fonte compartilhada antes de corrigir sintomas em telas individuais.
7. Em cada bloqueio remanescente, registrar se é requisito real, qual origem o prova e qual ação o resolve.
8. Incluir testes de regressão para toda causa raiz corrigida.

## Critérios de aceite

### Acesso

- Login da proprietária funciona no deployment de produção e preview sem depender de configuração contraditória.
- Sessão reconhece a organização e o papel corretos.
- Não aparece “usuário sem organização ativa” quando vínculo válido existe.

### Operação

- A proprietária consegue trabalhar em Casos, Comercial, Operações, pré-onboarding, onboarding, CRM, Clientes, Pesquisa, Contratos e Ordens de Serviço.
- Ana Luiza e outros casos reais não ficam bloqueados por estado falso, gate interno ou cache.
- Ações de criar/salvar/corrigir/avançar funcionam quando os dados estruturais necessários existem.

### Alertas

- `/ops` mostra apenas alertas rastreáveis a dado/regra real.
- Cada alerta é acionável ou explica que depende de evento externo, sem confundir isso com falha interna.

### Qualidade técnica

Executar e reportar:

```bash
npx tsc --noEmit
npx vitest run
npx vite build
```

Também validar no preview ou produção:

- login;
- abertura de Casos;
- fluxo Comercial;
- pré-onboarding;
- Operações e alertas;
- gravação de ao menos uma ação interna autorizada.

## Entrega obrigatória

- Branch: `hotfix/autonomia-operacional-proprietaria`.
- Commits reais e PR para `main`.
- Lista de todas as causas raiz identificadas.
- Lista de arquivos e migrations alterados.
- Explicação de quais bloqueios foram removidos e quais requisitos reais permanecem.
- Resultado dos testes/build.
- Link do preview/deployment.
- Nenhuma conclusão baseada apenas em badges, rótulos, screenshots isolados ou suposições.
