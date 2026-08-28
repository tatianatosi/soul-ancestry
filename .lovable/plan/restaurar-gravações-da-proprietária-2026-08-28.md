# Restaurar gravações da Proprietária

## Objetivo
Restaurar a edição e persistência dos cadastros internos para a conta administradora, preservando isolamento por organização, auditoria, arquivamento lógico e confirmação de ações externas.

## Implementação
1. Ajustar a validação do CRM para distinguir:
   - bloqueios reais do campo que está sendo alterado;
   - valores legados já persistidos, que não devem impedir a gravação de outros campos;
   - pendências de completude, que continuam visíveis sem transformar todo o cadastro em somente leitura.
2. Manter validação estrita para novos valores: qualquer campo classificatório alterado deverá usar a lista canônica atual.
3. Fazer o servidor validar o conjunto alterado e as transições sensíveis, em vez de recusar uma atualização por uma incompatibilidade legada não tocada.
4. Exibir no botão e no aviso o motivo objetivo quando uma gravação realmente não puder prosseguir.
5. Adicionar testes de regressão para edição parcial de registro legado, rejeição de novo valor inválido e preservação dos gates externos.

## Validação
- Reproduzir a edição com a sessão real da Proprietária.
- Confirmar persistência por releitura da tela e do registro.
- Verificar que RLS, organização, papel admin, auditoria e ações externas continuam protegidos.
