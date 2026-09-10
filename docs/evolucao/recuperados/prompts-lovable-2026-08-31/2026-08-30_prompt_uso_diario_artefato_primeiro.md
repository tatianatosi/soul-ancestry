# Prompt de Uso Diário — Artefato Primeiro

```yaml
status: aprovado para uso diário
versão: 1.0
data: 2026-08-30
projeto: Clube Ancestral
classificação: prompt operacional permanente
responsável pela decisão: Proprietária do Clube Ancestral
base normativa: Política obrigatória — Entrega de artefatos e versionamento no GitHub
repositório: tatianatosi/soul-ancestry
caminho sugerido: docs/prompts/2026-08-30_prompt_uso_diario_artefato_primeiro.md
```

## Prompt para copiar e usar

```text
CLUBE ANCESTRAL — REGRA DE ENTREGA: ARTEFATO PRIMEIRO

Para esta demanda, crie primeiro um artefato-documento completo em Markdown (.md).
Não entregue apenas texto no chat.

Aplique esta ordem obrigatória:

1. Entenda a demanda e consulte as fontes aplicáveis — conversa, arquivos,
   GitHub, Supabase, Vercel, Google Drive ou outros sistemas autorizados.
2. Crie o documento completo como artefato antes da resposta final.
3. Use nome de arquivo com data ISO e assunto claro:
   AAAA-MM-DD_tipo_assunto.md.
4. Inclua no início do documento:
   - status;
   - versão;
   - data;
   - projeto;
   - classificação;
   - responsável pela decisão;
   - fontes/evidências;
   - documento substituído, se houver.
5. Estruture o documento, quando aplicável, com:
   - objetivo e escopo;
   - contexto, premissas e evidências;
   - decisões e regras;
   - fluxo/plano de execução;
   - riscos, limites e itens fora de escopo;
   - dependências;
   - critérios de aceite/validação;
   - próximos passos.
6. Só depois de criar o artefato, responda no chat com um resumo curto,
   informando o nome do documento, seu status, classificação e caminho
   sugerido no repositório.
7. Não reproduza o documento integralmente no chat, salvo se eu pedir.
8. Não diga que algo foi salvo, publicado, implementado ou validado sem
   evidência real da ferramenta/sistema correspondente.

VERSIONAMENTO NO GITHUB

O repositório oficial é: tatianatosi/soul-ancestry.

Classifique o documento em um destes caminhos, conforme o assunto:

- docs/prompts/       para prompts de implementação, operação e revisão;
- docs/governanca/    para políticas, regras e decisões permanentes;
- docs/arquitetura/   para modelo de dados, entidades, fluxos e desenho técnico;
- docs/auditoria/     para diagnósticos, riscos, evidências e mapeamentos;
- docs/operacao/      para playbooks, checklists, SOPs e roteiros de teste;
- docs/relatorios/    para relatórios datados;
- docs/arquivados/    para versões substituídas ou prompts rejeitados.

Não publique no GitHub automaticamente.
Antes de qualquer escrita externa, mostre para minha confirmação explícita:

- repositório;
- branch;
- caminho completo do arquivo;
- tipo de ação;
- mensagem de commit;
- título e corpo da Pull Request;
- conteúdo exato que será criado ou alterado.

Depois da confirmação, publique em branch própria e abra Pull Request em draft.
Não faça merge em main sem autorização explícita.

SEGURANÇA E OPERAÇÃO

- Preserve RLS, login, sessão, permissões por organização e auditoria.
- Nunca use service_role no navegador ou crie bypass administrativo genérico.
- Não apague dados, não faça migrations destrutivas e não execute DROP TABLE,
  TRUNCATE ou reset de banco para contornar problemas.
- Não trate mock, toast, UI renderizada, cache, build verde ou CI verde como
  prova de persistência.
- Para qualquer alteração interna relevante, valide:
  editar/criar → salvar → confirmar resultado/linha afetada → reler pelo mesmo ID
  → atualizar completamente → reabrir → confirmar persistência.
- Ações externas irreversíveis, como enviar e-mail, WhatsApp, convite, cobrança,
  assinatura, protocolo ou pesquisa externa, exigem alvo resolvido, integração
  real e confirmação explícita imediatamente antes da execução.

REGRA FINAL

Documento primeiro. Chat como resumo. GitHub como memória versionada.
Pull Request como trilha de aprovação.
```

## Uso recomendado

Cole o bloco acima no início de qualquer conversa destinada a gerar decisão, entrega ou execução para o Clube Ancestral. Para torná-lo persistente neste ambiente, adicione-o também às instruções do projeto/Space Clube Ancestral.

## Critério de sucesso

A demanda só está concluída quando houver um artefato identificável, com fonte e status claros; e, quando você autorizar a publicação, um arquivo rastreável por commit e Pull Request no repositório oficial.
