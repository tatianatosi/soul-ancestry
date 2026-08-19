# Inventário Protegido de Configuração — 2026-08-19 v1.0

**Classificação:** documento sem segredos.

## Objetivo

Registrar o estado de configuração observado no repositório sem expor conteúdo de arquivo de ambiente, tokens, credenciais, URLs privadas ou dados de clientes. O objetivo é preparar a migração do Lovable com segurança e impedir que configuração operacional seja confundida com código versionável.

## Achados verificáveis

| Item | Estado observado | Risco | Ação obrigatória |
|---|---|---|---|
| `.env` na raiz | Arquivo presente e versionado no repositório. | Pode conter segredo, URL privada, chave ou configuração de ambiente. | Inspecionar conteúdo em fluxo restrito; remover do tracking se houver segredo; rotacionar valores comprometidos quando aplicável. |
| `.gitignore` | Arquivo presente no repositório. | Regras podem ser insuficientes para impedir novo versionamento de configuração. | Revisar exclusões de `.env*`, dumps, chaves, exports e arquivos locais. |
| Integração Supabase | Cliente server/client e middleware presentes em `src/integrations/supabase/`. | Configuração depende de variáveis de ambiente e políticas de acesso corretas. | Documentar nomes de variáveis em `.env.example`, sem valores reais. |
| Migrations | Diretório `supabase/migrations/` presente. | Mudança de schema/RLS pode afetar dados e permissões. | Manter migrations versionadas e revisar impacto antes de deploy. |

## Política de configuração

1. Segredos nunca devem constar em documentação, commit, issue, PR, log ou arquivo de exemplo.
2. `.env.example` deve conter apenas nomes de variáveis, comentários e valores fictícios.
3. O conteúdo real de `.env` deve permanecer apenas no gerenciador de segredos ou no ambiente autorizado.
4. Arquivo que já tenha sido commitado com segredo exige avaliação de histórico e rotação; removê-lo do estado atual não elimina cópias anteriores.
5. Dados pessoais, exports de CRM, dumps SQL e links de pagamento privados não devem entrar no repositório compartilhado.

## Checklist de saneamento separado

- [ ] Executar varredura de segredo sobre conteúdo de configuração em ambiente restrito.
- [ ] Confirmar se `.env` contém valor sensível.
- [ ] Criar `.env.example` sem valor real, somente após identificar nomes seguros de variáveis.
- [ ] Atualizar `.gitignore` se necessário.
- [ ] Remover `.env` do tracking caso contenha segredo.
- [ ] Rotacionar segredos potencialmente expostos.
- [ ] Verificar histórico de commits e ambientes de deploy afetados.
- [ ] Registrar conclusão sem reproduzir segredo.

## Limite deste commit

Este artefato não remove arquivos, não altera `.gitignore`, não cria `.env.example` e não rotaciona credenciais. Tais ações dependem do resultado da inspeção de conteúdo e de confirmação específica, pois podem afetar o build e os ambientes em uso.
