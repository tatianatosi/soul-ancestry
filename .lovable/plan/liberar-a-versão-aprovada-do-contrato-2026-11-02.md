# Liberar a versão aprovada do contrato

## Resultado
Na tela existente do contrato, disponibilizar **Liberar versão aprovada**, com arquivo para download e link privado para Ana acessar pelo portal. Não depende da revisão da PR #222 e não aprova versões novas, envia e-mail, assina ou publica o site.

## Implementação
- Exigir admin autenticado e a versão atual já aprovada; conferir novamente a autorização no momento da liberação.
- Reutilizar a exportação e entrega documental existentes, sem duplicar contrato, versão ou formulário.
- Disponibilizar somente o arquivo daquela versão, com acesso restrito à titular autorizada. Nunca tornar o documento público ou entregar notas internas, CPF/RG/endereço na interface do App.
- Manter as sete abas; acesso ao contrato será contextual, não uma oitava aba.
- Registrar versão, autora e data da liberação no histórico existente; repetir o clique não duplica a entrega.
- Preservar a aprovação, os valores e o histórico da v6; nada será gerado, assinado ou enviado automaticamente.

## Detalhes técnicos
O fluxo atual não publica contratos: **Enviar ao cliente** apenas prepara uma comunicação. A nova ação deve usar os padrões existentes de autorização por organização, gravação verificada e auditoria. A entrega privada deve validar titular, caso e acesso no servidor, com URL temporária de download. Não liberar o HTML interno como se fosse arquivo cliente-facing sanitizado. Não ampliar o leitor genérico de projeções para aceitar todos os contratos.

## Validação
- Testar recusa a não-admin, versão não aprovada, versão diferente da atual e outro caso.
- Testar liberação repetida sem duplicação e preservação de status/versão.
- Conferir arquivo baixado, link privado, recarga e histórico na sessão autorizada; testar telas em computador e 375 px.
- Publicação do código é etapa separada, somente após conferência e autorização.