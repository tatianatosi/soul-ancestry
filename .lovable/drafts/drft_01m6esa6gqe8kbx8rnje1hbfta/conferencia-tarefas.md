# Conferência de permissões e acesso
- [x] Ampliar leituras existentes da equipe e acessos, com erro explícito e escopo da organização; gates de gestão existentes preservados. Writers intocados.
- [x] Conferência por membro e cliente nas telas existentes, sem executar ações; papéis persistidos versus efetivos e matriz operacional canônica, não autorização RLS.
- [x] Testes de regras e regressões selecionadas: 9 arquivos, 77 testes passaram em 18:55 UTC; 12 testes de regras novos. D11 atualizado para não exigir fallback que ocultava erro.
- [x] Conferência autenticada Proprietária após F5 em /equipe e /acessos-portal, 1280×1800 e 375×812; sem overflow horizontal ou erros do navegador.
- [x] Evidências registradas; não aceitar/publicar. Notificação à thread principal indisponível: plataforma não expõe envio de mensagem entre threads; resumo disponível neste rascunho.

## Evidências
- Base: 608ad30bbf64546d0ba6d06b3d5355776b5e352c. Código conferido: dc8ffdf54a742766b7e4a0cf67012540b566eeff. Commit automático não é aceite.
- Validação automática: build OK em 18:54:28 UTC. Nenhuma build/typecheck manual.
- Prints: /tmp/browser/conferencia/equipe-1280.png, equipe-375.png, acessos-portal-1280.png, acessos-portal-375.png. Script e releitura: check_access.py e verified.log no mesmo diretório.
- Ana encontrada pelo client_id/auth_user_id e authorized_email_id, não exceção por nome: convite atual invited, identidade vinculada, e-mail aprovado, caso vinculado e liberado, primeiro/último acesso desse convite não registrados. Existe outro acesso histórico para a mesma pessoa, com entradas anteriores e sem vínculo de caso nesta leitura; não consolidado nem alterado.
- 15 itens aprovados/publicados/vigentes do caso para o titular; são registros de publicação, não prova de login ou leitura autorizada como Ana. Nenhum conteúdo bruto exposto.
- Admin ativo: papel cadastrado Admin, user_roles Admin da mesma organização, contexto operacional Admin. Registros suspensos/inativos não recebem papéis efetivos.
- Diff: duas rotas existentes, dois leitores existentes, dois componentes filhos de conferência, um helper puro, teste de regras e ajuste de teste D11; sem rota nova, schema, RLS, writer, acesso, convite ou publicação.

Arquivos reservados pela PR #225, incluindo AGENTS.md e roadmap.md, permanecem intocados.
Decisão estrutural proposta para registrar após integração: as conferências de equipe e portal são leitores locais nas rotas existentes, usando o avaliador canônico e vínculos persistidos; não constituem autorização de servidor nem segundo painel.