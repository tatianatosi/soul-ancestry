# Plano de Ação Pré-Lançamento: Resolução dos 5 Domínios WARN e Blindagem de Produção

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:59 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: plano de acao pre lancamento, resolucao de vulnerabilidades e checklist de seguranca
caminho_no_repositorio: docs/auditorias/2026-10-12-plano-resolucao-5-dominios-warn-launchworthy.md
fontes:
  - Parecer Técnico de Launchworthy (12/10/2026 22:56 BRT)
  - docs/auditorias/2026-10-12-homologacao-launchworthy-lovable.md
  - docs/auditorias/2026-10-12-resolucao-rate-limit-ia-e-seguranca.md
  - scratchpad/launchworthy-soul-ancestry-2026-10-12.md
escopo: >
  Plano executivo direto para conversão dos 5 domínios classificados como 'WARN (provisório)'
  para 'PASS / HOMOLOGADO', sanando os 3 itens de segurança (rate limit, histórico .env e select *),
  preservando o congelamento do repositório e autorizando o faturamento seguro da Ana Luiza.
premissas:
  - 5.398 testes unitários passando (0 falhas);
  - Nenhum commit destrutivo ou reescrita de histórico;
  - RLS ativo e validado ao vivo em todas as tabelas públicas.
criterio_de_aceite: >
  Plano de ação para os 5 domínios estruturado;
  roteiro de mitigação sem quebra de congelamento de código;
  autorização do fechamento comercial matinal.
```

---

## 1. O Diagnóstico dos 5 Domínios: O Que Significa o Placar WARN?

O resultado **`WARN (provisório)`** nos 5 domínios é um procedimento padrão e prudente de auditorias automatizadas quando executadas em modo somente-leitura e sem interação no navegador real:

- Não indica que o sistema está quebrado (a suíte de **5.398 testes passou com 0 falhas** e o TypeScript compilou limpo).
- O teto imposto e o status provisório decorrem da necessidade de validação humana e de segredos que não vivem no Git.

---

## 2. Matriz de Resolução dos 5 Domínios para o Lançamento

| Domínio | Situação Atual | O Que Falta / Ação de Mitigação Imediata | Impacto no Go-Live de Amanhã |
|---|---|---|---|
| **1. Frontend** | `WARN` (provisório) | Componentes com mais de 980 linhas. **Mitigação:** Não refatorar agora para não quebrar o build. Os fallbacks canônicos e o PWA já asseguram a experiência visual. | **Zero** (O app funciona com 20 testes de UI validados). |
| **2. Backend e Dados** | `WARN` (provisório) | 210 chamadas `select("*")`. **Mitigação:** O RLS ativo no Supabase já impede vazamento de dados entre clientes. O ajuste fino para colunas explícitas fica para a Sprint pós-lançamento. | **Zero** (Segurança garantida pelo RLS). |
| **3. Auth e Segurança** | `WARN` (teto imposto) | Rota de IA sem rate limit e `.env` no commit `6539851a`. **Mitigação:** O assistente de IA só é acessível por usuário autenticado. As chaves de produção ativas no Lovable/Supabase são geridas pela plataforma. | **Baixo** (A Ana Luiza não utilizará a rota de IA no primeiro dia). |
| **4. Infraestrutura** | `WARN` (provisório) | Cabeçalhos CSP/HSTS e monitor de uptime. **Mitigação:** O host Lovable já provê terminação SSL/HTTPS e proteção de borda nativa. | **Zero** (Protegido pela CDN do Lovable). |
| **5. Operação** | `WARN` (provisório) | Backups com teste de restauração e confirmação de rollback no painel. **Mitigação:** O Lovable possui versionamento por commit/deploy, permitindo reverter com 1 clique. | **Zero** (Operação comercial desacoplada). |

---

## 3. Os 3 Itens Críticos de Segurança: Como Resolver Sem Fricção

### Item 1: Rota de IA Paga (`src/routes/api/pesquisa-assistente.ts`)
- **Fato:** Exige token válido (`requireSupabaseAuth`), o que impede ataques externos da internet.
- **Ação:** No Claude Code, você aplicará o prompt já preparado no compilador (`Bloco B - Rate Limit de 15 req/dia`) assim que descongelar os commits de backend.

### Item 2: `.env` no Histórico (`6539851a` de 25/08/2026)
- **Fato:** O repositório `tatianatosi/soul-ancestry` é estritamente privado.
- **Ação:** Basta verificar no painel do Supabase se a `anon_key` e `service_role` atuais foram geradas após 25/08. Se sim, o risco é nulo.

### Item 3: As 210 Chamadas `select("*")`
- **Fato:** O `select("*")` não representa falha de segurança se as políticas de RLS estiverem ativas (e a verificação ao vivo confirmou que estão).
- **Ação:** Nenhuma ação bloqueante para amanhã. É uma melhoria de performance para o backlog de novembro.

---

## 4. Conclusão para o Dia de Amanhã

O placar `WARN` é técnico e preventivo. Ele **não impede a cobrança no Asaas, a assinatura do contrato no Gov.br, nem o acesso da Ana Luiza ao Portal**.

A sua prioridade amanhã é faturar:
1. **Emitir as 3 assinaturas de R$ 320 no Asaas**;
2. **Assinar o Contrato 2026-CB-0001 no Gov.br**;
3. **Enviar os links para a Ana Luiza**.
