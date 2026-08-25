# Clube Ancestral — Prioridades Executáveis no Lovable

**Versão:** 1.0  
**Objetivo:** concluir apenas mudanças que produzem efeito verificável no aplicativo.  
**Regra:** cada prompt deve gerar alteração rastreável no código/banco, execução de testes/build e evidência objetiva de resultado. Não aceitar resposta apenas descritiva, plano, mockup ou auditoria.

## Ordem obrigatória

1. Recuperar propriedade e acesso administrativo.
2. Tornar a produção acessível para lançamento.
3. Validar que o app publicado corresponde ao repositório.
4. Executar teste de fumaça ponta a ponta no Desk e App Cliente.
5. Corrigir somente falhas encontradas nesses testes.

## Prioridade P0 — acesso de proprietária

### Autorização necessária

Autorizar alteração no Lovable/Supabase para garantir que a conta da proprietária seja administradora ativa da organização correta, sem remover outros administradores e sem alterar dados de casos.

### Prompt executável no Lovable

```text
EXECUTE, NÃO APENAS DESCREVA.

Objetivo: restaurar e comprovar o acesso de proprietária ao Clube Ancestral.

1. Localize a conta da proprietária configurada para a organização de produção.
2. Execute o bootstrap administrativo somente se não existir administrador ativo elegível para a organização; se já existir conta da proprietária, corrija apenas vínculo de organização, membership, perfil de equipe e role admin necessários.
3. Não remova, suspenda, rebaixe nem altere permissões de outros usuários.
4. Preserve a proteção do último administrador ativo.
5. Garanta que a conta da proprietária consiga abrir: Equipe, Configurações, Acessos/Portal, Modo Proprietária e Auditoria.
6. Registre evento auditável da correção, sem expor credenciais.
7. Rode testes relevantes de verificação de acesso proprietário e o build.

Critério de aceite obrigatório:
- Login da proprietária entra na organização correta.
- Papel efetivo = admin.
- As cinco telas administrativas abrem sem redirecionamento de “sem permissão”.
- Testes e build verdes.

Entregue somente:
- lista de arquivos/migrations alterados;
- resultado de testes e build;
- conta/organização/role em formato mascarado;
- URL das telas verificadas;
- qualquer erro ainda existente.
```

## Prioridade P0 — produção e URL

### Autorização necessária

Autorizar ajuste de acesso/publicação no Vercel e, se necessário, no Lovable, para permitir abertura da produção pelo modo definido pela proprietária. Não comprar domínio, não alterar DNS e não reduzir segurança sem autorização específica adicional.

### Prompt executável no Lovable

```text
EXECUTE, NÃO APENAS DESCREVA.

Objetivo: confirmar que a versão publicada do Clube Ancestral é a versão atual do repositório e entregar acesso navegável para lançamento.

1. Identifique o commit/branch efetivamente associado ao deploy de produção.
2. Compare as rotas críticas do repositório com o deploy: acesso, Desk, calls, casos, propostas, contratos, pesquisa, onboarding, painel e Canvas/portal.
3. Corrija somente configuração de publicação ou ligação de deploy necessária para que a produção corresponda ao branch main.
4. Não comprar domínio, não alterar DNS, não expor chaves e não desabilitar controles de segurança permanentemente.
5. Se existir proteção que bloqueie a proprietária, preparar e aplicar apenas a solução de acesso aprovada para a proprietária.
6. Execute build de produção e smoke test das rotas públicas/autenticadas que forem acessíveis.

Critério de aceite obrigatório:
- produção aponta para commit identificável do branch main;
- URL de produção responde;
- rotas críticas carregam sem erro de aplicação;
- proprietário consegue chegar ao login e à área administrativa;
- não há credenciais expostas.

Entregue somente evidências objetivas: URL, commit, estado do deploy, rotas testadas, erros encontrados e correções aplicadas.
```

## Prioridade P1 — teste de fumaça operacional

### Autorização necessária

Autorizar criação e posterior exclusão/arquivamento de dados de QA identificados como `QA-NAO-OPERACIONAL`, sem tocar em registros de clientes reais nem enviar comunicações.

### Prompt executável no Lovable

```text
EXECUTE, NÃO APENAS DESCREVA.

Objetivo: provar o fluxo interno mínimo do Desk sem criar operação externa.

Crie exclusivamente registros de QA rotulados `QA-NAO-OPERACIONAL` e execute:
1. Lead de teste.
2. Call de teste no painel Calls com consentimento de exemplo e qualificação.
3. Handoff para caso de teste.
4. Proposta de teste vinculada ao caso.
5. Ordem de Serviço de teste vinculada à proposta/condição.
6. Tarefa e próxima ação atribuídas.
7. Registro de auditoria para cada ação relevante.
8. Arquive ou elimine logicamente os registros de QA ao final, mantendo trilha de auditoria.

Não criar cliente em provedor financeiro, cobrança, assinatura, link de pagamento, e-mail, WhatsApp, documento externo, pesquisa externa ou convite.

Critério de aceite obrigatório:
- os vínculos Lead → Call → Proposta → Caso → OS → Tarefa aparecem na interface;
- não há registros duplicados;
- a trilha de auditoria existe;
- os dados QA não contaminam painel operacional padrão;
- testes/build verdes.

Entregue IDs de QA, rotas verificadas, resultado de cada etapa, testes/build e falhas reais remanescentes.
```

## Prioridade P1 — isolamento do App Cliente

### Autorização necessária

Autorizar criação de um caso e um acesso de QA para testar visualização do cliente, sem cliente real, sem contato externo e sem dados pessoais reais.

### Prompt executável no Lovable

```text
EXECUTE, NÃO APENAS DESCREVA.

Objetivo: provar que o App Cliente/Canvas mostra somente conteúdo autorizado e não expõe dados internos.

1. Crie um caso QA e um acesso QA rotulados `QA-NAO-OPERACIONAL`.
2. Inclua uma entrega autorizada para cliente.
3. Inclua campos internos deliberadamente não publicáveis: hipótese, evidência bruta, fonte interna, preço bruto/SKU, documentos pessoais e observações internas.
4. Abra o App Cliente/Canvas com o acesso QA.
5. Confirme que apenas a entrega autorizada aparece e que os campos internos não aparecem em rotas, API, interface ou exportações.
6. Teste URL direta sem autorização e confirme resposta segura, sem revelar motivo ou dado do caso.
7. Arquive os registros QA conforme as regras de auditoria.

Critério de aceite obrigatório:
- projeção autorizada visível;
- campos internos ausentes;
- acesso direto indevido não vaza dados;
- testes de RLS/projeção e build verdes.

Entregue prints/URLs mascaradas, IDs QA, resultados, testes/build e falhas remanescentes.
```

## Prioridade P2 — correção dirigida por falhas

Este prompt só deve ser usado após os testes P0 e P1. Não fazer refatoração ampla.

```text
EXECUTE, NÃO APENAS DESCREVA.

Com base exclusivamente nas falhas reproduzidas no checklist de acesso, produção, Desk e App Cliente, implemente correções mínimas e rastreáveis.

Restrições:
- não redesenhar telas aprovadas;
- não reescrever módulos que passaram no smoke test;
- não criar novos fluxos externos;
- não alterar dados reais;
- para cada correção, adicionar ou atualizar teste de regressão.

Critério de aceite obrigatório:
- cada falha possui causa, arquivo/migration alterado, teste de regressão e evidência de correção;
- build verde;
- não introduzir falha em rotas já aprovadas.

Entregue uma tabela: falha → correção → teste → resultado.
```

## Não priorizar agora

- Novo design, nova marca ou novas telas.
- Migração total de histórico.
- Automações financeiras.
- Pesquisa externa, certidões, despesas ou contatos externos.
- DNS, compra de domínio, mudança de plano ou redução permanente de proteção.
- Nova rodada de documentação/auditoria que não corrija ou prove funcionamento.

## Regra de parada

Após cada prompt, parar. Aceitar somente evidência executada. O próximo prompt só começa após a proprietária aprovar o resultado ou apontar a falha específica a corrigir.
