# PEDIDO AO CLAUDE — experiência familiar

Proprietária: Tati Tosi. Pedido de 11/10/2026 01:38 UTC. Caso CA-CID-AT-FAM-2026-001, UUID a11a0000-0000-4000-8000-000000000002.

Decisão posterior explícita: **Não, manter com Claude**. Lovable não recebeu transferência de navegação, acesso familiar ou leitores financeiros. Este registro não é implementação nem autorização de convite, cobrança, integração ou publicação.

## Solicitação

1. Exatamente sete abas: Painel, Jornada, Árvore, Descobertas, Documentos, Biblioteca e Conta. Não criar oitava aba Financeiro/Assinatura. Reutilizar rotas existentes; esclarecer a correspondência de Descobertas com o Radar atual, sem remover funcionalidade por dedução.
2. Conta/Assinatura: somente a fatura da pessoa autenticada; mensalidade solicitada de R$320 via Asaas. Não inventar fatura, vencimento, parcela, link ou confirmação de pagamento; preservar condição aprovada da Ana de R$9.600 até reconciliação da fonte.
3. Ana (analuizabox@gmail.com), Adair (adair@apsrepresentacoes.com.br) e Alice (alicegomessilveira@gmail.com): mesmo núcleo e caso; conferir identidades e vínculos existentes antes de qualquer escrita, sem duplicar cadastro nem emitir convite.
4. Felipe: dependente representado na visualização de Ana; conferir registro canônico, responsável legal e autorização de visibilidade. Nenhuma credencial ou cobrança para o menor.

## Fontes identificadas e limites

- Navegação atual: src/components/portal/abas-app-cliente.tsx e portal-shell.tsx. Rótulos atuais são Home, Jornada, Radar, Árvore, Documentos, Legado e Conta; novos rótulos ainda não aplicados.
- Leitores financeiros existentes: src/lib/portal-cliente.functions.ts. Na leitura direta de meusCasos e meuCaso, consultas de invoices dependem de RLS; meuCaso filtra case_id, mas não contém filtro explícito por pessoa. A presença dessas consultas **não comprova** isolamento financeiro individual. Conferir também minhasFaturas e demais leitores/projeções de Conta, bem como políticas reais.
- Acesso existente: src/lib/portal-cliente.server.ts. Investigar cadeia client_portal_access → cliente, nucleo_membros → nucleos_familiares → caso, sem presumir que composição familiar por si só concede acesso.
- Representação: investigador localizou pendencias-humanas-caso.functions.ts e teste corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts. Isso não comprova registro atual de Felipe, representação nem publicação no App.
- Não houve consulta dos vínculos reais no banco, escrita, mudança de acesso, navegação, código do App, política, publicação ou cobrança neste pedido.

## Aceite necessário, em cortes separados

Navegação: sete destinos reais em 375/1280, sem oitava aba. Acesso: mesma identidade/caso com leitura após recarga. Financeiro: contas autorizadas distintas, própria fatura visível e faturas alheias inacessíveis pelo servidor/banco, não apenas ocultas. Felipe: responsável registrado e conteúdo autorizado para Ana, sem acesso de login associado. Prova de uso pela Proprietária continua separada de testes de código.

Resultado: **BLOQUEADO_POR_RESPONSABILIDADE** para execução pelo Lovable; pedido registrado para Claude, não enviado a serviço externo nem comprovado em uso.