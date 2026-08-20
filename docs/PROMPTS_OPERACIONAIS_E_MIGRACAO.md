# Prompts operacionais e de migração

**Versão:** v2.0  
**Data:** 20 de agosto de 2026

## 1. Último check do piloto

```text
Atue como QA funcional do piloto da Ana no Soul Ancestry. Valide exclusivamente o fluxo crítico já definido, sem sugerir funcionalidades novas e sem iniciar refatoração ampla.

Registre em tabela: ação realizada, resultado esperado, resultado observado, evidência, classificação (BLOQUEADOR, RELEVANTE ou POSTERIOR) e próxima ação.

Bloqueador é: impedimento do fluxo principal; perda/duplicidade/corrupção de dados; acesso indevido; erro sem continuidade para Ana.

Ao final responda: Status (APROVADO / APROVADO COM RESSALVAS / REPROVADO), bloqueadores, ressalvas pós-piloto e recomendação objetiva de liberar contrato ou corrigir primeiro.
```

## 2. Triagem de pendências

```text
Organize as pendências do piloto da Ana sem aumentar o escopo. Para cada item, produza ID, descrição, evidência, impacto, prioridade P0/P1/P2, classificação, critério de aceite, ambiente prioritário, responsável e próxima ação.

Vercel e Supabase já estão funcionais. Não criar tarefas genéricas de reimplantação ou revalidação sem falha nova e reproduzível.
```

## 3. Contrato para assinatura

```text
Atue como revisor operacional de contrato para o piloto da Ana. Monte checklist final de: partes, escopo e exclusões, prazo e aceite, valores e vencimentos, confidencialidade/LGPD, propriedade intelectual, suporte, mudanças de escopo, anexos e assinaturas.

Não invente dados jurídicos ausentes: marque-os como [PREENCHER]. Entregue também uma mensagem curta de encaminhamento para assinatura.
```

## 4. Inventário técnico

```text
Você está no repositório Soul Ancestry. Faça inventário técnico sem alterar código: framework, linguagem, comandos, estrutura, rotas, fluxo da Ana, integrações, variáveis por nome, Supabase, Vercel, padrões do Lovable e lacunas documentais.

Gere docs/MIGRACAO_CLAUDE_CODE.md. Não exponha segredos ou valores de variáveis.
```

## 5. Documentação de segurança

```text
Audite variáveis de ambiente. Identifique variáveis acessadas, classifique-as como públicas, privadas ou desconhecidas, verifique arquivos rastreados e valores hardcoded, atualize .env.example apenas com chaves vazias e crie docs/SEGURANCA_E_VARIAVEIS.md.

Nunca mostre, replique ou versione tokens, senhas, chaves privadas ou service-role.
```

## 6. Documentação Supabase

```text
Documente a integração Supabase em docs/SUPABASE_OPERACAO.md com migrations, objetos referenciados, autenticação, RLS identificada, nomes de variáveis, checklist de alteração de schema e backup/rollback.

Supabase já está funcional: não proponha recriação ou reimplantação sem falha nova comprovada.
```

## 7. Documentação Vercel

```text
Crie docs/VERCEL_OPERACAO.md com framework, build, diretório de saída, branches, ambientes Preview/Production, nomes de variáveis, smoke test, rollback e logs.

Vercel já está funcionando: deploy só é ação após mudança versionada ou para resolver falha nova comprovada.
```

## 8. Revisão e commit

```text
Revise o diff documental: nenhum segredo, token, senha, .env ou dado pessoal sensível; documentação coerente com o código; decisões e backlog consistentes; regra anti-loop presente; Vercel e Supabase registrados como funcionais.

Se correto, faça um único commit: docs: registra fechamento do piloto Ana e handoff para Claude Code
```
