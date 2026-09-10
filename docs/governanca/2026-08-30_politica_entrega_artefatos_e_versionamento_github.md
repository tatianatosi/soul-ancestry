# Política obrigatória — Entrega de artefatos e versionamento no GitHub

```yaml
status: em revisão
versão: 1.0
data: 2026-08-30
projeto: Clube Ancestral
repositório: tatianatosi/soul-ancestry
classificação: política operacional e instrução permanente
responsável pela decisão: Proprietária do Clube Ancestral
fontes:
  - Conversa de projeto em 2026-08-30
  - Relatório do Dia 4 — 2026-08-31
substitui: nenhum
```

## 1. Finalidade

Esta política define como assistentes de IA devem entregar materiais estratégicos, técnicos e operacionais ao Clube Ancestral.

A finalidade é impedir que prompts, planos, políticas, auditorias, diagnósticos, matrizes, relatórios, decisões de arquitetura, checklists, roteiros e especificações importantes existam somente como texto transitório no chat.

Toda entrega relevante deve gerar um **artefato-documento persistente**, passível de leitura, revisão, download, versionamento e registro no repositório oficial.

---

## 2. Regra inegociável de entrega

```text
NUNCA ENTREGAR APENAS TEXTO NO CHAT QUANDO A RESPOSTA PRODUZIR
UM MATERIAL OPERACIONAL, ESTRATÉGICO, TÉCNICO OU DECISÓRIO.

PRIMEIRO CRIAR O ARTEFATO-DOCUMENTO.
DEPOIS RESPONDER NO CHAT COM RESUMO E IDENTIFICAÇÃO DO ARTEFATO.
```

A resposta narrativa no chat é complementar. O documento é a entrega principal.

O assistente só pode informar que gerou um documento se a ferramenta de criação de arquivo tiver retornado confirmação do artefato criado.

---

## 3. Gatilhos para criação obrigatória

Criar um documento Markdown (`.md`) antes da resposta final sempre que a solicitação ou a resposta gerar qualquer um dos itens abaixo:

- Prompt mestre ou prompt de implementação.
- Plano de execução, sprint, roadmap ou backlog.
- Política, regra, decisão de governança ou diretriz.
- Diagnóstico, auditoria, análise de risco ou inventário.
- Relatório diário, semanal, de sessão ou de evolução.
- Matriz de reconciliação, arquitetura, entidade, fluxo ou autoridade.
- Especificação de motor, requisito, integração ou interface.
- Roteiro de teste, critério de aceite ou plano de validação.
- Briefing, conteúdo institucional, oferta, proposta ou material comercial.
- De/para, taxonomia, glossário, catálogo, checklist ou template.
- Decisão de banco, segurança, RLS, organização, contratos ou dados de clientes.
- Registro de hipóteses, evidências, fontes e próximos passos de pesquisa.

Para uma pergunta simples, tradução, ajuste editorial breve ou conversa casual, o chat pode ser suficiente. Na dúvida, criar o documento.

---

## 4. Sequência obrigatória do assistente

```text
1. Entender a solicitação.
2. Consultar as fontes aplicáveis: conversa, arquivos, GitHub, Supabase,
   Vercel, Drive ou demais sistemas autorizados.
3. Criar o artefato completo em .md.
4. Nomear e classificar o artefato corretamente.
5. Informar no chat que o documento foi criado, sem repetir seu conteúdo integral.
6. Se a proprietária solicitar envio ao repositório, preparar a inclusão via GitHub.
7. Para qualquer alteração externa, apresentar destino, caminho, conteúdo e ação
   exatos para confirmação explícita antes de executar.
8. Após confirmação, criar uma branch, registrar o documento e abrir Pull Request.
9. Informar link/identificador da PR e o estado final da operação.
```

---

## 5. Padrão mínimo de cada documento

Todo artefato deve começar com metadados claros:

```md
# Título claro do documento

```yaml
status: rascunho | em revisão | aprovado | arquivado | rejeitado
versão: v1.0
data: YYYY-MM-DD
projeto: Clube Ancestral
classificação: política | prompt | relatório | auditoria | arquitetura | plano | checklist | outro
responsável pela decisão: Proprietária do Clube Ancestral
fontes:
  - Fonte ou evidência utilizada
substitui: documento anterior, se aplicável
```
```

Todo documento deve conter, quando aplicável:

1. Objetivo e escopo.
2. Premissas e evidências.
3. Decisões e regras.
4. Fluxo ou plano de execução.
5. Limites, riscos e itens expressamente fora de escopo.
6. Dependências.
7. Critérios de aceite/validação.
8. Próximos passos.
9. Histórico de mudanças, quando houver nova versão.

---

## 6. Nomes e caminhos no repositório

O repositório oficial é:

```text
https://github.com/tatianatosi/soul-ancestry
```

Usar nomes descritivos, com data em formato ISO:

```text
AAAA-MM-DD_tipo_assunto.md
```

Exemplos:

```text
2026-08-30_prompt_motores_a_implantar.md
2026-08-30_politica_unificada_casos_familiares.md
2026-08-30_mapa_autoridade_admin.md
2026-08-31_relatorio_do_dia.md
```

Classificar o arquivo em uma única pasta principal:

```text
docs/
├── prompts/        # prompts de implementação, operação e revisão
├── politicas/      # decisões e regras persistentes
├── arquitetura/    # entidades, fluxos e desenho técnico
├── auditorias/     # inventários, diagnósticos, riscos e evidências
├── relatorios/     # relatórios datados de acompanhamento
├── operacao/       # playbooks, checklists, SOPs e testes
└── arquivados/     # versões substituídas e prompts rejeitados
```

### Regra de arquivamento

- Documento rejeitado deve ficar em `docs/arquivados/prompts-rejeitados/`.
- Versão substituída deve ficar em `docs/arquivados/versoes-substituidas/`.
- Não apagar documento canônico para resolver divergência de versão.
- O documento novo deve informar o que substitui e por quê.

---

## 7. Política de GitHub

A inclusão de documentos deve ser rastreável e revisável.

### Fluxo padrão

```text
Documento criado como artefato
→ revisão da proprietária
→ branch própria
→ commit documental
→ Pull Request
→ revisão
→ merge autorizado
```

### Convenções

Branch:

```text
docs/<tipo>-<assunto>-<aaaa-mm-dd>
```

Exemplos:

```text
docs/politica-entrega-artefatos-2026-08-30
docs/prompt-motores-2026-08-30
docs/relatorio-dia-2026-08-31
```

Commit:

```text
docs: adiciona <tipo> <assunto>
```

Exemplos:

```text
docs: adiciona política de entrega de artefatos
docs: adiciona prompt mestre de motores
docs: publica relatório diário de 2026-08-31
```

### Regra para `main`

- Não fazer commit direto em `main` como padrão.
- Usar Pull Request inclusive para documentação que tenha efeito operacional, jurídico, técnico ou de governança.
- Commit direto em `main` só é aceitável para correção editorial mínima de documento já aprovado, se a proprietária autorizar explicitamente.
- Nenhuma mudança de código, dados, schema, RLS, sessão, permissão ou integração externa deve ser agrupada em uma PR documental.

---

## 8. Confirmação antes de publicar

Criar um arquivo local/artefato é uma entrega. Publicar no GitHub altera um sistema externo e exige confirmação explícita da proprietária.

Antes de executar uma operação de escrita no GitHub, o assistente deve mostrar:

```text
Repositório: tatianatosi/soul-ancestry
Branch: docs/<tipo>-<assunto>-<data>
Arquivo: docs/<pasta>/AAAA-MM-DD_tipo_assunto.md
Ação: criar arquivo, commit e Pull Request
Título da PR: docs: adiciona <tipo> <assunto>
Conteúdo: o documento completo já criado como artefato
```

Somente depois da confirmação explícita, executar exatamente a ação apresentada.

Não criar, sobrescrever, apagar, mover, mesclar ou publicar arquivos diferentes daqueles aprovados.

---

## 9. Fronteiras de segurança e dados

Esta política não reduz nem substitui os limites já vigentes:

- Manter RLS, login, sessão, permissões por organização e auditoria em segundo plano.
- Nunca usar `service_role` no navegador.
- Não criar bypass genérico de administração.
- Não apagar dados para contornar inconsistências.
- Não executar migrations destrutivas, `DROP TABLE`, `TRUNCATE` ou reset de banco.
- Não tratar tela, toast, mock, cache, build verde ou CI verde como prova de persistência real.
- Confirmar ações externas reais e irreversíveis no momento da execução.
- Não publicar informações pessoais, CPF/CNPJ de pessoas, contratos, segredos, chaves, tokens ou evidências sensíveis no repositório sem uma política específica e autorização explícita.

---

## 10. Padrão de validação

Para documentos que orientem implementação, incluir um critério de aceite que permita distinguir documentação de operação real.

Modelo:

```text
1. Abrir a rota/tela aplicável.
2. Executar a ação interna autorizada.
3. Confirmar gravação na fonte canônica.
4. Confirmar linha afetada/resultado da operação.
5. Reler a mesma entidade pelo mesmo ID.
6. Atualizar a página completamente.
7. Reabrir e confirmar que o dado persiste.
8. Confirmar que a próxima ação/tarefa foi criada ou dispensada quando aplicável.
9. Confirmar que nenhuma ação externa ocorreu sem autorização explícita.
```

---

## 11. Prompt curto para uso diário

Use este comando quando quiser garantir a entrega correta:

```text
Crie primeiro um artefato-documento completo em Markdown para esta demanda.
Não entregue apenas texto no chat. Use a Política de Entrega de Artefatos e
Versionamento no GitHub do Clube Ancestral. Ao terminar, informe o nome do
artefato, sua classificação, status e caminho sugerido no repositório.
Não publique no GitHub sem me mostrar previamente branch, arquivo, commit e
PR para confirmação explícita.
```

---

## 12. Critério de sucesso

A política está funcionando quando cada decisão ou produção relevante possuir:

```text
- um documento local/artefato criado;
- nome, data, status e classificação;
- fonte/evidência rastreável;
- caminho de repositório sugerido;
- histórico por commit e Pull Request quando publicado;
- nenhuma alteração externa sem confirmação;
- nenhum conhecimento operacional importante preso apenas no chat.
```

> Documento primeiro. Chat como resumo. GitHub como memória versionada. Pull Request como trilha de aprovação.