# Plano primordial — último check Lovable e migração para Claude Code

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Decisão operacional aprovada para execução  
**Objetivo imediato:** concluir o piloto da Ana com segurança, gerar contrato pronto para assinatura e, após a validação do fluxo, migrar a implementação prioritariamente para Claude Code + GitHub + Supabase + Vercel.

---

## 1. Decisões registradas

1. O mockup e as telas já existentes são a referência aprovada. Não há autorização para redesenho amplo, reconstrução de navegação, criação de novas abas ou nova rodada de auditoria geral no Lovable.
2. O Lovable será usado somente no último ciclo para ajustes visuais e de fluxo estritamente necessários ao piloto da Ana.
3. O limite operacional de Lovable até o piloto validado é de **900 créditos**, com alvo de execução de **até 600 créditos**. Nenhuma nova frente é aberta sem encerrar a anterior com critério de aceite.
4. O objetivo de saída do Lovable é: **Ana operando ponta a ponta e contrato pronto para assinatura**, sem bloqueio de dados, permissões, documentos ou etapa comercial.
5. Depois da execução redonda do piloto e da disponibilização do contrato para Ana, a prioridade máxima é a migração da implementação para **Claude Code**, com código versionado no **GitHub**, dados e segurança no **Supabase** e publicação via **Vercel**.
6. Claude Code passa a ser o canal padrão para regras de negócio, banco, migrations, RLS, rotas, testes, correções, refactor, documentação e publicação. Lovable fica restrito a design e interação visual que não possam ser implementados com segurança no repositório.
7. Não se considera uma funcionalidade implementada apenas porque existe em tela. Ela deve ter rota, dados, regras de acesso, persistência e teste mínimo compatíveis com o uso da Ana.

---

## 2. Escopo do último check Lovable

### Incluído

- Correções de UX e responsividade que impeçam Ana de concluir a jornada.
- Ajustes de visibilidade e estado visual do caso-piloto da Ana.
- Correções visuais do fluxo de proposta, aceite, formalização e go-live.
- Conferência de que as telas necessárias ao piloto respeitam o mockup já aprovado.
- Ajustes mínimos para que o contrato seja apresentado como pronto para assinatura, com dados e parâmetros corretos no fluxo.
- Ajustes de interface na projeção do App Cliente que afetem diretamente a experiência da Ana.

### Explicitamente fora do Lovable neste ciclo

- Auditoria ampla de front-end, back-end, banco ou arquitetura.
- Redesenho de telas, abas ou arquitetura do Desk.
- Criação de novas funcionalidades não necessárias ao piloto da Ana.
- Pesquisa genealógica completa, integrações externas, automações de mensagens, cobrança real ou novos agentes de IA.
- Refactor técnico, migration, RLS, regras de domínio, correção de dados globais, testes automatizados e publicação: esses itens pertencem a Claude Code/GitHub/Supabase/Vercel.
- Generalização de regras da Ana para todos os casos sem uma decisão explícita de produto.

---

## 3. Lista primordial de último check — piloto Ana

Cada item deve ser executado como uma tarefa fechada, com evidência e validação antes de abrir o próximo. Se o item exigir alteração de dados, regra de negócio, RLS, migration ou código compartilhado, ele deve ser retirado do Lovable e encaminhado ao Claude Code.

| ID | Check obrigatório | Critério objetivo de aceite | Dono primário | Limite Lovable |
|---|---|---|---|---:|
| ANA-01 | Identidade canônica do caso | Ana aparece com nome, núcleo familiar, produto/trilha, status e responsável corretos; nenhum dado do caso é herdado indevidamente de outro piloto | Claude Code, validação visual Lovable | 30 |
| ANA-02 | Isolamento do caso-piloto | Estados, entregas, perfil consultivo, Fase 02 e parâmetros da Ana não alteram Sophi nem qualquer outro caso | Claude Code | 0 |
| ANA-03 | Jornada ponta a ponta | É possível percorrer, sem tela quebrada: CRM/lead → Caso 360 → Proposta → aceite → Formalização → Go-live → App Cliente | Lovable para fluxo visual; Claude Code para bloqueios lógicos | 100 |
| ANA-04 | Proposta correta | A proposta da Ana mostra versão, escopo, preço canônico/SKU aplicável, itens incluídos/não incluídos e status inequívoco | Claude Code, validação Lovable | 30 |
| ANA-05 | Completude Canva 1–7 | Os sete critérios de completude aparecem com estado verificável; não há afirmação de concluído sem artefato correspondente | Lovable | 60 |
| ANA-06 | Aceite e transição | O aceite muda o estado apenas do caso da Ana, registra data/responsável e libera a próxima etapa prevista | Claude Code | 0 |
| ANA-07 | Preparação contratual | A tela apresenta as partes, produto/serviço, preço, condições, parâmetros e anexos exigidos; pendências são explícitas | Lovable visual + Claude Code para dados | 80 |
| ANA-08 | Contrato pronto para assinatura | Existe um artefato contratual final revisável, associado ao caso correto, com versão, data e status “pronto para assinatura”; o link ou meio de assinatura é definido e testado manualmente | Claude Code/GitHub/Supabase; Lovable apenas se houver ajuste visual | 50 |
| ANA-09 | Gate de formalização | O caso não entra em go-live como concluído sem as condições mínimas de formalização definidas; exceções ficam registradas | Claude Code | 0 |
| ANA-10 | Go-live e onboarding | A lista de ativação mostra o que está concluído, pendente e bloqueado; os acessos ao portal/App Cliente são claros | Lovable | 80 |
| ANA-11 | App Cliente — Home e jornada | Ana visualiza somente sua jornada, etapa atual, próximas ações, entregas e documentos autorizados, em desktop e mobile | Lovable | 100 |
| ANA-12 | App Cliente — privacidade e família | Documentos, membros familiares e informações sensíveis respeitam a permissão prevista; não há vazamento entre casos ou participantes | Claude Code | 0 |
| ANA-13 | Documentos e evidências visíveis | Cada item mostrado à Ana tem nome, tipo, status, data e regra de visibilidade coerentes; links não quebram | Lovable para apresentação; Claude Code para persistência/acesso | 50 |
| ANA-14 | Linha do tempo e histórico | Eventos relevantes do caso aparecem em ordem e sem duplicação crítica: proposta, aceite, formalização, go-live e entregas | Claude Code, validação Lovable | 20 |
| ANA-15 | Estados e textos críticos | Rótulos de status, CTAs, mensagens vazias e erros não prometem automatismos inexistentes e não usam termos jurídicos indevidos | Lovable | 50 |
| ANA-16 | Responsividade de bloqueio | Home, proposta, formalização, go-live e App Cliente funcionam nos tamanhos mobile prioritários sem campos/CTAs inacessíveis | Lovable | 80 |
| ANA-17 | Smoke test final | Percurso executado por uma pessoa não autora: abrir caso, conferir proposta, preparar contrato, localizar documento, acessar App Cliente e identificar próximo passo | Lovable + Claude Code conforme achado | 90 |

**Orçamento máximo teórico Lovable:** 820 créditos.  
**Reserva condicionada para correção de bloqueio real:** 80 créditos.  
**Teto absoluto do ciclo:** 900 créditos.

---

## 4. Regras de execução no Lovable

1. Abrir uma tarefa por vez, usando o ID da tabela como prefixo do pedido.
2. Cada pedido deve citar a rota/tela existente e o resultado esperado; proibir expressamente alterações fora daquele escopo.
3. Usar a fórmula: **não redesenhar, não criar abas, não alterar outras entidades, não alterar dados de outros casos**.
4. Antes de enviar um novo pedido, registrar: crédito consumido, tela alterada, comportamento validado, regressões observadas e decisão de seguir ou parar.
5. Não pedir “auditar”, “melhorar”, “revisar tudo”, “reconciliar” ou “adaptar toda a aplicação”.
6. Ao identificar necessidade de código, migration, API, estado compartilhado, autorização, persistência ou regra de domínio, parar o prompt e abrir tarefa técnica no GitHub para Claude Code.
7. Aplicar stop-loss: se forem consumidos mais de 300 créditos sem encerrar um bloco funcional completo, pausar Lovable e revisar escopo. Se o consumo chegar a 900 créditos, encerrar o ciclo, exceto autorização expressa posterior.

### Modelo de prompt cirúrgico

```text
[ID: ANA-XX] Altere somente a rota/tela: [ROTA].

Objetivo verificável: [RESULTADO].

Critérios de aceite:
1. [CRITÉRIO]
2. [CRITÉRIO]
3. [CRITÉRIO]

Restrições obrigatórias:
- Não redesenhar a tela nem criar abas/rotas.
- Não alterar componentes, dados, regras ou estados de outros casos.
- Não modificar o fluxo fora do item acima.
- Manter o mockup e a arquitetura aprovados.
- Se a solução exigir migration, RLS, API, regra de negócio, persistência ou código compartilhado, não improvisar: informar o bloqueio técnico.
```

---

## 5. Definição de pronto do piloto

O piloto Ana é considerado pronto para encerrar o ciclo Lovable somente quando todos os itens abaixo estiverem evidenciados:

- A ficha e a jornada de Ana estão corretas e isoladas de outros casos.
- A proposta está completa, versionada e com preço/escopo canônicos.
- O fluxo registra aceite e leva à formalização sem alterar casos alheios.
- O contrato final está pronto para assinatura, associado à Ana e com versão/status verificáveis.
- Go-live e onboarding mostram pendências e próximos passos reais.
- Ana acessa o App Cliente e visualiza somente o que lhe é permitido.
- Documentos e eventos essenciais são localizáveis e não expõem dados indevidos.
- O fluxo foi percorrido em desktop e mobile por teste manual independente.
- Não existem bloqueios críticos abertos para o primeiro cliente.

Não é necessário que integrações externas, cobrança automatizada, WhatsApp automático, pesquisa completa, relatórios avançados ou novas abas estejam prontas para declarar o piloto apto.

---

## 6. Gatilho e plano de migração

### Gatilho de migração

A migração torna-se prioridade máxima imediatamente após:

1. o smoke test do piloto Ana passar;
2. o contrato da Ana estar pronto para assinatura; e
3. a versão em produção do fluxo estar identificada.

A assinatura pode ocorrer em paralelo à migração, desde que o artefato contratual e o fluxo de Ana permaneçam estáveis e rastreáveis.

### Destino arquitetural

| Camada | Destino | Responsabilidade |
|---|---|---|
| Repositório e versionamento | GitHub | Código-fonte, issues, branches, pull requests, changelog e revisão |
| Implementação técnica | Claude Code | Código, testes, refactor, migrations, políticas, documentação e correções |
| Banco, autenticação e acesso | Supabase | Esquema, migrations, Auth, RLS, storage, funções e auditoria |
| Publicação | Vercel | Builds, preview deployments, produção, variáveis de ambiente e rollback |
| Design/fluxos futuros | Lovable sob exceção | Protótipos ou alterações visuais aprovadas, com teto de crédito por tarefa |

### Ordem de migração

1. **Congelar o escopo Lovable:** registrar versão, rotas críticas, decisões e pendências conhecidas; não iniciar melhorias paralelas.
2. **Inventariar o sistema real:** mapear repositório, rotas, componentes, `src/data`, integrações, variáveis, tabelas, migrations, buckets, autenticação e políticas RLS.
3. **Estabelecer baseline no GitHub:** branch principal protegida, convenções, `.env.example`, README de execução local, inventário de variáveis e log de versão.
4. **Verificar Supabase:** exportar/registrar schema, migrations efetivas, RLS por tabela, funções, storage e usuários/papéis. Corrigir discrepâncias entre interface e persistência.
5. **Consolidar implantação Vercel:** projeto apontando ao repositório, variáveis configuradas nos ambientes adequados, domínio/produção, preview por branch e rollback conhecido.
6. **Criar suíte mínima de regressão:** testes ou checklist automatizável para Ana: isolamento, proposta, contrato, go-live, acesso App Cliente, documentos e permissões.
7. **Migrar o backlog técnico:** toda nova correção funcional deve entrar em issue/branch/PR e ser implementada no Claude Code.
8. **Restringir Lovable:** só pode ser utilizado mediante tarefa aprovada com escopo visual, critério de aceite e teto de créditos.

---

## 7. Checklist de publicação

### GitHub

- [ ] Código fonte atual identificado e versionado.
- [ ] Branch principal protegida ou processo equivalente definido.
- [ ] Variáveis documentadas sem expor segredos.
- [ ] Issues abertas para pendências técnicas e regressões conhecidas.
- [ ] Changelog da versão do piloto criado.

### Supabase

- [ ] Schema e migrations conferidos contra a aplicação em produção.
- [ ] RLS validada para Ana, participantes familiares, equipe e administradores.
- [ ] Acesso a documentos/buckets validado por perfil.
- [ ] Dados de Ana isolados de Sophi e de outros casos.
- [ ] Backup/export e procedimento de rollback registrados.

### Vercel

- [ ] Repositório correto conectado.
- [ ] Build de produção verde.
- [ ] Variáveis de ambiente configuradas corretamente.
- [ ] Preview deployment testado antes de produção.
- [ ] URL de produção, domínio e autenticação verificados.
- [ ] Plano de rollback testado ou documentado.

### Aceite operacional

- [ ] Ana percorre o fluxo sem bloqueio crítico.
- [ ] Contrato está pronto para assinatura.
- [ ] Um responsável validou desktop e mobile.
- [ ] Nenhum dado de outro caso é exibido no piloto.
- [ ] O próximo desenvolvimento será aberto no GitHub e executado prioritariamente em Claude Code.

---

## 8. Registro de decisão futura

| Data | Decisão | Motivo | Consequência |
|---|---|---|---|
| 20/08/2026 | Limitar o último ciclo Lovable ao piloto Ana | Alto consumo de créditos e repetição de auditorias/redesenhos sem implementação proporcional | Teto de 900 créditos; escopo fechado por check |
| 20/08/2026 | Migrar prioridade de implementação para Claude Code | Maior controle de código, regras, testes, RLS e regressões | GitHub + Supabase + Vercel tornam-se caminho padrão |
| 20/08/2026 | Preservar mockup e arquitetura aprovados | Evitar perda de contexto e novas reinterpretações de interface | Sem novas abas/reconstruções no ciclo atual |

---

## 9. Próxima execução

1. Validar a lista ANA-01 a ANA-17 contra a versão atual, sem alterar produto.
2. Separar os itens técnicos (Claude Code) dos exclusivamente visuais (Lovable).
3. Executar no Lovable somente os itens visuais que bloqueiam a passagem da Ana até contrato pronto.
4. Registrar evidência e consumo após cada tarefa.
5. Ao concluir ANA-17 e disponibilizar o contrato, iniciar imediatamente o checklist de migração GitHub/Supabase/Vercel.
