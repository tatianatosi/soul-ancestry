# Contrato da Ana — resgate em leitura e wireframe contínuo

Trabalho somente de leitura e desenho. Nada de contrato, anexo, ordem de serviço, assinatura, cobrança, publicação, acesso, dados ou permissões é criado ou alterado.

## O que será entregue

1. **Inventário de versões e anexos I–V** — onde cada versão do contrato da Ana está hoje, o que existe de fato do Contrato de Estudo Genealógico v2, e para cada anexo: aplicável ou não, versão, fonte, estado, se há conteúdo salvo e o motivo quando não houver.
2. **De-para campo a campo** — Canva → contrato → anexos/OS: cada campo exibido com sua fonte real, versão, estado, tela que lê, e classificação em "já está no contrato correto", "perdido" ou "em texto de exemplo".
3. **Diagnóstico do "Avaliando a cadeia…"** — qual leitura não termina e qual estado conclusivo deve aparecer no lugar (pronto, pendente de dado, não aplicável, aguardando decisão, bloqueado por ato real, erro de fonte).
4. **Wireframes** da superfície única de contrato, em desktop e 375 px, em leitura contínua com edição por blocos curtos.
5. **Matriz de estados e ações**, com um único botão principal por estado, mantendo salvar rascunho, pedir revisão, aprovar, preparar envio, enviar e registrar assinatura como atos distintos.
6. **Lista de arquivos, tabelas e escritores** que seriam tocados numa implementação futura.
7. **Riscos, dados realmente ausentes e decisões humanas necessárias.**

## Decisões que o desenho já respeita

- Instrumento é o Contrato de Estudo Genealógico v2; o contrato-base genérico não é apresentado como contrato da Ana.
- Cláusulas institucionais aparecem como texto vigente homologado, sem nova auditoria jurídica e sem bloco de "cláusulas específicas".
- Sem exclusões inventadas: quando a proposta não registra exclusão, o texto é explícito quanto a isso.
- "Abrir proposta no Canva" só aparece se a URL já estiver guardada; nenhum link novo é pedido nem criado.
- Anexo ausente não é falha geral: cada anexo mostra aplicabilidade e motivo.

## Estrutura da tela proposta

Cabeçalho compacto (caso, titular, instrumento, versão, estado, data, um botão principal) → âncoras internas: Resumo · Partes · Escopo e entregas · Texto do contrato · Anexos I–V e OS · Assinatura · Histórico. Desktop com coluna de leitura larga e coluna contextual estreita; 375 px em uma coluna, sem tabela obrigatória e sem corte lateral. Campos pendentes ficam recolhidos com motivo, nunca como lista vazia infinita.

## Redundâncias que serão recomendadas para sair

Auditoria da auditoria, revisão jurídica repetida de cláusula já homologada, cláusulas específicas sem fonte, exclusões vazias como pendência, travas de catálogo/SKU, formulário longo para texto contratual, repetição de formalização e onboarding dentro do contrato, e links que não abrem contrato ou anexo real.

## Detalhes técnicos da leitura

Leitura de `crm_casos`, contrato `2026-CB-0001`, `contract_annexes`, partes, proposta Canva e páginas extraídas, perfil institucional e planejador do caso `CA-CID-AT-FAM-2026-001`, mais os módulos já existentes de contrato, anexos I–V, escopo de proposta e cadeia de formalização, incluindo histórico de commits onde o escopo vinha do Canva. Wireframes gerados como página estática isolada e conferidos por imagem em 1280 px e 375 px, fora do produto.

## Limites

Ao final, parada para aprovação. Nenhuma criação, edição, aprovação, envio ou assinatura.
