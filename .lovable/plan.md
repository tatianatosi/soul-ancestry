# Resiliência de rede do App Cliente

## Estado do corte
O rascunho isolado já implementa a maior parte do pedido: erro honesto na Conta e na Árvore, preservação do arquivo em Documentos, timeout de 15 segundos e nova tentativa por aba. Nada foi publicado.

Falta completar o mesmo comportamento nas mensagens da página de detalhe do suporte: o texto já permanece após falha, mas ainda não há o botão **Reenviar**.

## Implementação final
1. **Conta e faturas**
   - Manter o aviso “Instabilidade de conexão ao carregar seus dados financeiros.” e o botão **Tentar novamente**.
   - Em erro ou timeout, não renderizar ausência de assinatura, estado de dependente, faturas ou seções que possam sugerir vazio.
   - Preservar integralmente a regra de contratante financeiro e a RPC existente.

2. **Árvore**
   - Manter erro de rede separado de `Lacuna`.
   - O botão **Recarregar árvore** refaz a leitura dos nós; `Lacuna` só aparece depois de uma resposta válida e vazia.

3. **Documentos e suporte**
   - Manter arquivo, texto e demais campos locais após falha de envio.
   - Exibir “Falha de conexão — seu conteúdo foi mantido.” com **Reenviar**.
   - Completar o botão **Reenviar** também na mensagem de detalhe do ticket, reutilizando a mesma tentativa e sem duplicar mensagens.
   - Limpar o formulário somente após confirmação de sucesso.

4. **Fim de carregamentos infinitos**
   - Manter timeout padrão de 15 segundos nas leituras do App e na atualização automática.
   - Após o limite, mostrar erro localizado com nova tentativa; conservar dados anteriores quando já existirem.

## Limites
- Não alterar banco, tabelas, RLS, permissões, acessos, regras financeiras, Desk, navegação ou as sete abas.
- Não alterar `types.ts` nem a função `portal_sou_contratante_financeiro`.
- Falha de rede nunca será convertida em vazio, dependente, ausência de assinatura ou ausência de pessoas/documentos.

## Validação
- Testar timeout, distinção erro × vazio, nova tentativa e preservação de arquivo/texto.
- Confirmar que um reenvio bem-sucedido limpa uma única vez e não duplica o conteúdo.
- Capturar estados normais e de falha em 375 e 1280 px para Conta, Árvore, Documentos e suporte.
- Verificar os registros atuais da plataforma e separar falhas preexistentes ou fora deste corte.

As capturas do agente serão inspeção administrativa, não `COMPROVADO_EM_USO`; nada será publicado sem nova autorização explícita.