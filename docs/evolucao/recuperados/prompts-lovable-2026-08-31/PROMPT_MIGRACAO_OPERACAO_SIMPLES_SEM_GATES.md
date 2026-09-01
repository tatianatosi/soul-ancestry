# Prompt — Migração para Operação Simples no Vercel + Supabase Próprio

**Projeto:** `tatianatosi/soul-ancestry`  
**Branch de trabalho obrigatória:** `refactor/operacao-simples`  
**Meta:** remover do fluxo diário toda camada de governança, auditoria visível, reconfirmação, aprovação e gate que impeça a proprietária de trabalhar. Manter somente **uma proteção de acesso**: autenticação normal do Supabase + vínculo ativo com a organização.

---

## Contexto e decisão definitiva

O aplicativo do Clube Ancestral precisa voltar a ser uma ferramenta de trabalho simples. A proprietária deve conseguir entrar, criar, editar, salvar, pesquisar, registrar documentos, criar propostas e operar casos sem passar por telas de governança, reconfirmação de propriedade, auditorias, justificativas, aprovação em lote, modal de override, checklist impeditivo ou fluxo institucional paralelo.

O projeto sai definitivamente do fluxo de desenvolvimento do Lovable. A fonte única de código será o repositório GitHub `tatianatosi/soul-ancestry`; a hospedagem e os previews serão feitos na Vercel; autenticação, banco e arquivos devem usar o Supabase próprio do Clube Ancestral.

**Esta tarefa é uma simplificação de operação. Não criar novas funcionalidades, novos modelos de dados, novos painéis, novas regras de governança, nem reescrever módulos estáveis sem necessidade.**

---

## Regra única que fica

Manter somente esta condição para acessar áreas internas:

```text
usuário autenticado no Supabase
  E
usuário com vínculo ativo à organização Clube Ancestral
  → pode entrar nas rotas internas.
```

Para o perfil da proprietária, identificado pelo e-mail operacional já existente e pelo papel `owner` ou `admin`, o acesso deve ser total a todas as áreas internas.

```ts
const podeOperar = Boolean(session?.user) && Boolean(membership?.organizationId);
const eProprietaria = membership?.role === "owner" || membership?.role === "admin";
```

- Usuário sem sessão: redirecionar somente para login.
- Usuário com sessão e vínculo: liberar área interna.
- Proprietária/admin: liberar todas as operações internas.
- Usuário sem vínculo: exibir mensagem curta e objetiva: **“Sua conta não está vinculada a uma organização. Contate a administração.”**
- Não direcionar ninguém para “Modo Proprietária”, reconfirmação, auditoria, checklist de lançamento ou varredura de administração.

**Não usar outras condições de acesso no front-end.**

---

## Remover do fluxo e da navegação

Remover por completo do menu, do painel, dos atalhos, dos guards, dos redirecionamentos e das dependências de componentes:

```text
/modo-proprietaria
/reconfirmar-propriedade
/governanca/varredura-administracao
/auditoria
```

Também remover qualquer referência ativa, import, query, mutation, guard, card, CTA, link, modal ou condição que dependa de:

```text
src/lib/modo-proprietaria.ts
src/lib/modo-proprietaria.functions.ts
src/lib/modo-proprietaria-cobertura.ts
src/lib/gates-override.ts
src/lib/varredura-autorizacoes.ts
src/lib/varredura-administracao.ts
src/components/governanca/modo-proprietaria.tsx
src/components/governanca/varredura-administracao.tsx
src/components/governanca/lote-aprovacoes-s01-s05.tsx
src/components/governanca/decisao-proprietaria.tsx
src/components/governanca/cobertura-modulos.tsx
```

Se for mais seguro manter arquivos antigos no repositório por histórico, eles podem ser movidos para:

```text
docs/arquivados/governanca-removida-2026-08-28/
```

Mas eles **não podem** ser importados, executados, aparecer no menu, bloquear navegação, bloquear salvamento ou ser exigidos por qualquer teste de produção.

Remover ou reescrever testes que imponham a existência desses fluxos. O objetivo é que a suíte de testes valide acesso simples e operações normais, não cobertura de auditoria/gates.

---

## Remover todas as barreiras operacionais

Para as rotas abaixo, a proprietária autenticada deve sempre poder criar, editar, salvar, arquivar e corrigir dados internos:

```text
/painel
/clientes
/casos
/pesquisa
/documentos
/propostas
/conversao
/financeiro
/produtos
/configuracoes
/equipe
```

### Proibido bloquear ações internas por

- Status de fase da jornada.
- Checklist incompleto.
- Documento ainda não validado.
- Pesquisa ainda não concluída.
- Produto/SKU sem link Asaas.
- Link de pagamento em status pendente.
- Contrato ainda não emitido.
- Falta de reconfirmação de propriedade.
- Falta de aprovação de governança.
- Falta de justificativa de override.
- Ausência de auditoria/evento de auditoria.
- Estado de “perfil institucional” não confirmado.
- Qualquer dado financeiro ainda não reconciliado.
- Qualquer regra criada apenas para o “Modo Proprietária”.

### Comportamento obrigatório

- Campos não essenciais devem aceitar rascunho.
- Pendências devem ser avisos informativos, nunca impedimentos de salvamento.
- O caso pode avançar ou recuar de fase manualmente pela proprietária.
- Upload pode ser salvo como `recebido` sem análise completa.
- Proposta pode ser salva como rascunho sem SKU, contrato, checkout ou link Asaas.
- Pagamento pode ser registrado manualmente como `confirmado`, `sinal`, `pendente` ou `combinado`.
- Produto pode ficar ativo mesmo enquanto a associação com um link de pagamento é resolvida depois.
- Toda falha técnica deve aparecer claramente na tela com mensagem objetiva, sem falha silenciosa.

---

## Exceções mínimas permitidas

Não remover estes limites básicos:

1. Usuário sem autenticação não acessa a área interna.
2. Usuário autenticado sem vínculo de organização não acessa dados internos.
3. Um cliente nunca acessa dados de outro cliente.
4. Não executar ações externas reais sem o comando explícito da proprietária: cobrar, enviar e-mail/WhatsApp, assinar, protocolar, publicar, excluir definitivamente ou disparar integração financeira.
5. Exclusão deve ser lógica/arquivamento; exclusão definitiva não deve ser exposta na rotina diária.

Essas exceções devem ficar no backend/Supabase, não em telas de governança.

---

## Simplificar a navegação

O menu principal deve conter somente áreas de trabalho. Não incluir “Governança”, “Auditoria”, “Modo Proprietária”, “Reconfirmar propriedade”, “Varredura”, “Lote de aprovações” ou similar.

```text
Hoje
Clientes
Casos
Pesquisa
Documentos
Propostas
Financeiro
Produtos
Equipe
Configurações
```

No topo do Desk, exibir apenas:

```text
Clube Ancestral
[Nome da usuária] · Proprietária
[Sair]
```

Sem selo de aprovação, sem estado de governança, sem botão de reconfirmação e sem alerta administrativo persistente.

---

## Tela essencial: Operação Rápida

Criar ou preservar uma página simples em `/painel` com estes atalhos que devem funcionar sem pré-condição adicional:

1. **Novo cliente**
   - Campos mínimos: nome, telefone/e-mail opcional, observação.
2. **Novo caso**
   - Campos mínimos: cliente, país/objetivo opcional, título, responsável opcional.
3. **Registrar atualização**
   - Caso, texto, data padrão “agora”, visibilidade interna/cliente.
4. **Adicionar documento**
   - Caso, pessoa opcional, arquivo ou referência, status inicial `recebido`.
5. **Criar pendência**
   - Caso, descrição, responsável opcional, prazo opcional.
6. **Criar proposta**
   - Cliente/caso, valor opcional, descrição, status `rascunho`.
7. **Registrar pagamento**
   - Caso/proposta, valor, estado, observação.
8. **Mover fase**
   - Caso, fase de destino, observação opcional; permitir avançar e recuar.

Cada ação deve apresentar um retorno explícito:

```text
Sucesso: “Salvo.”
Erro: “Não foi possível salvar: [mensagem técnica curta]. Tente novamente.”
```

Não usar a expressão “ação ignorada”, “aprovação necessária”, “reconfirme sua propriedade”, “modo proprietária” ou “auditoria pendente”.

---

## Supabase e variáveis de ambiente

Antes de alterar fluxos, validar a configuração do projeto de produção na Vercel. O erro já identificado na aplicação é uma chave inválida no backend durante a sincronização de vínculo administrativo. Como esse fluxo será removido, não manter nenhuma função operacional dependente dele.

Conferir no ambiente **Production** da Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY (ou VITE_SUPABASE_PUBLISHABLE_KEY)
SUPABASE_SERVICE_ROLE_KEY
```

Regras:

- Todas as chaves precisam pertencer ao mesmo projeto Supabase próprio do Clube Ancestral.
- `SUPABASE_SERVICE_ROLE_KEY` fica somente no ambiente servidor; nunca usar no navegador.
- Não manter variáveis duplicadas com valores antigos, nomes alternativos ou referências a outro projeto.
- O frontend usa somente URL + chave pública.
- Fluxos comuns de CRUD não dependem da service role.
- A service role, quando necessária, só pode ser usada em endpoints de servidor para tarefas administrativas reais.

---

## Critérios de aceite obrigatórios

Executar estes testes em produção ou em preview antes de mergear em `main`.

### Teste da proprietária

1. Login com a conta da proprietária.
2. Abrir `/painel`.
3. Recarregar a página.
4. Abrir uma nova aba em `/casos`.
5. Criar um cliente.
6. Criar um caso.
7. Abrir o caso e salvar uma atualização.
8. Adicionar uma pendência.
9. Adicionar um documento como `recebido`.
10. Criar uma proposta como rascunho.
11. Registrar pagamento manual.
12. Avançar e recuar uma fase do caso.
13. Abrir `/produtos`, `/financeiro`, `/equipe` e `/configuracoes`.

### Resultado aceito

- Todas as operações acima retornam sucesso ou erro explícito de infraestrutura/dado.
- Nenhuma operação apresenta modal de aprovação, reconfirmação, modo proprietária, auditoria, governança, gate institucional ou justificativa de override.
- Nenhuma tela redireciona a proprietária para rota administrativa intermediária.
- Nenhuma ação interna exige link Asaas, contrato, produto homologado ou checklist concluído.
- Não há erro silencioso.
- Não há `401`, `403`, `500` ou falha de API não tratada durante o fluxo normal.

### Não fazer nesta rodada

- Não alterar dados de clientes existentes.
- Não apagar tabelas, arquivos, pagamentos, propostas, contratos ou histórico.
- Não rodar migrações destrutivas.
- Não excluir o repositório nem o projeto Vercel.
- Não criar um novo banco Supabase se o atual já contiver os dados corretos.
- Não integrar Asaas, WhatsApp, e-mail ou assinatura digital nesta rodada.
- Não migrar catálogo, jornada, Planejador, SKUs ou regras legais nesta rodada.
- Não fazer redesign visual.

---

## Entrega esperada

1. Branch `refactor/operacao-simples` criada no repositório.
2. Pull request com descrição objetiva do que saiu do caminho de operação.
3. Preview Vercel funcional.
4. Relatório curto contendo:
   - rotas removidas do menu;
   - arquivos/integrações desativados;
   - condições de acesso que ficaram;
   - resultado dos 13 testes de aceite;
   - URL do preview;
   - nenhum texto celebrando auditorias, gates ou governança.
5. Só após teste positivo da proprietária, merge em `main` e deploy em produção.

---

## Regra final

> Se uma funcionalidade não ajuda a proprietária a criar, editar, salvar, pesquisar, atender ou vender, ela não entra no caminho de trabalho.  
> Se um status estiver incompleto, ele informa — não bloqueia.  
> Se o sistema falhar, ele explica o erro — não esconde e não redireciona para uma auditoria.
