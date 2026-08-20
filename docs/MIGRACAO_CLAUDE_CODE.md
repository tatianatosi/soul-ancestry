# Handoff para Claude Code

**Versão:** v2.0  
**Data:** 20 de agosto de 2026

## Objetivo

Transferir a evolução técnica do Soul Ancestry para Claude Code, usando GitHub como fonte de verdade e reduzindo o uso do Lovable por consumo elevado de créditos.

## Estado confirmado

- GitHub: repositório ativo e fonte de verdade.
- Vercel: funcional e publicado.
- Supabase: funcional e integrado.
- Lovable: contingência controlada; não é ambiente principal de desenvolvimento.
- Claude Code: ambiente prioritário para alterações futuras.

## Ordem de trabalho

1. Atualizar localmente a branch principal.
2. Instalar dependências preservando o lockfile existente.
3. Configurar variáveis pelo `.env.example`, sem inserir segredos no Git.
4. Rodar o projeto e validar o fluxo crítico da Ana.
5. Implementar mudanças pequenas e verificáveis.
6. Executar checks disponíveis no projeto.
7. Revisar diff para segredos e dados sensíveis.
8. Commitar com mensagem descritiva.
9. Executar smoke test de produção somente quando houver mudança publicada.

## Documentos obrigatórios

- `docs/DECISOES.md`: decisões vigentes.
- `docs/BACKLOG.md`: pendências e prioridades.
- `docs/SEGURANCA_E_VARIAVEIS.md`: variáveis, acesso e segredos.
- `docs/SUPABASE_OPERACAO.md`: operação de dados e schema.
- `docs/VERCEL_OPERACAO.md`: deploy e smoke test.

## Regra anti-loop

Vercel e Supabase não devem retornar a uma etapa genérica de implantação. Qualquer reabertura requer falha nova, reproduzível e registrada com ambiente, data/hora, ação, resultado, impacto e critério de aceite.
