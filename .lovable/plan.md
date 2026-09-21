# Sistema único: matrizes App/Desk, alinhamento do App e jornada contínua da Ana

## Limites deste corte

- Não alterar dados reais, banco, RLS, migrations, acessos, links mágicos, contrato persistido, anexos, OS, assinatura, cobrança, publicação, integração ou deploy.
- Não criar navegação paralela: Desk mantém os seis grupos de `GRUPOS_DESK`; App mantém exatamente Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
- Usar somente fontes já existentes. Ausência continua explícita; nada demonstrativo pode aparecer quando a visão master abre um caso real.
- Cada ação externa permanece separada e exige aprovação própria: salvar rascunho, solicitar revisão, aprovar, preparar envio, enviar, registrar assinatura, publicar e cobrar nunca se confundem.

## 1. Consolidar as duas matrizes no Design System

Criar dois documentos únicos em `docs/design-system`:

1. **Matriz App Cliente** — sete abas, elemento por elemento, cruzando mockup aprovado de 17 páginas, contrato de interface, implementação atual, fonte real, estado vazio, conteúdo proibido, divergência, prioridade e ação.
2. **Matriz Desk** — sete telas-face agrupadas nos seis grupos vigentes, cruzando prancha Desk v6, contrato de interface, rota real, fonte, CTA, indicadores, duplicidade, divergência, prioridade e ação.

Cada documento terá uma seção visual com as screenshots aprovadas já existentes no repositório, identificadas por origem e data. Não serão criadas “novas referências aprovadas” nem substituídos os mockups normativos.

## 2. Alinhar o App, começando por Home, Jornada e Radar

- **Home:** preservar o caso real; usar o vazio canônico; separar acompanhamento, próxima ação, achados e microentrega publicada sem inventar progresso; retirar conteúdo técnico oculto da superfície do cliente.
- **Jornada:** manter linha contínua com publicações reais, presente e próximo capítulo; remover dependências demonstrativas no caso real e links que funcionem como abas extras; usar o vazio canônico.
- **Radar:** manter as seis dimensões aprovadas e seus estados reais; remover comparação técnica App×Desk do conteúdo cliente-facing; nunca inventar percentual ou conclusão jurídica.
- Aplicar exclusivamente os tokens e primitivos canônicos já aprovados; nenhuma mudança global de tokens.

## 3. Corrigir e revalidar as cinco abas pedidas

Reabrir Jornada, Radar, Árvore, Legado e Conta na visão master com `CA-CID-AT-FAM-2026-001`:

- corrigir somente divergências de apresentação, copy, conteúdo demonstrativo ou conteúdo interno;
- alinhar os vazios ao contrato de interface;
- em Conta, eliminar identidade Sophia/código demo e termos técnicos quando o caso é real;
- em Legado e Árvore, preservar apenas conteúdo sanitizado/publicado e vazios honestos;
- capturar desktop e 375 px, verificar console e ausência de overflow horizontal.

## 4. Fechar a jornada da Ana em uma superfície contínua

Na superfície existente do caso/contrato, sem criar segunda ficha:

- apresentar uma leitura contínua: caso e próxima ação → proposta/escopo → contrato → anexos I–V e OS → revisão → assinatura → financeiro → acesso/App → histórico;
- mostrar o contrato `2026-CB-0001` v1 como não assinado e em revisão humana, sem alterar seu estado;
- usar o inventário real da proposta Canva e dos anexos; sem URL persistida, mostrar `Link do Canva não registrado` e nenhum CTA ativo;
- separar cada efeito em estado e ação própria, com pré-condição e destino explícitos;
- recolher diagnóstico técnico, gates de catálogo/SKU e auditoria repetida, sem apagar histórico ou fontes.

## 5. Wireframe do contrato da Ana

Gerar novamente, fora da tela do produto, duas imagens com o inventário real confirmado:

- desktop;
- 375 px em uma coluna, sem overflow.

As imagens mostrarão leitura contínua, partes reais, escopo/entregas da proposta, texto institucional, anexos I–V, OS não emitida, assinatura não registrada, histórico e ações separadas. Nenhum botão simulará sucesso ou efeito externo.

## 6. Validação e parada

- Rodar tipos, testes relevantes e build completo uma única vez após o corte.
- Validar visualmente App e jornada contínua em desktop e 375 px, com screenshots, console sem erro e sem overflow.
- Atualizar as matrizes com o resultado final: aderente, corrigido, bloqueado por dado, bloqueado por decisão ou não localizado.
- Informar arquivos, diff, testes, build e screenshots; parar antes de commit, push, PR, merge, publicação ou deploy.
