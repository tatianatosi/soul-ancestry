# Kit visual exportável — Clube Ancestral

## Objetivo
Consolidar as prévias aprovadas em componentes reutilizáveis para App Cliente e Desk, mantendo os 15 acessos atuais, a taxonomia canônica e o escopo exclusivamente visual.

## Implementação
- Criar tokens visuais isolados para o kit com a paleta Pantone aprovada, sem alterar as telas operacionais existentes.
- Extrair das prévias componentes de marca e estrutura: logo oficial local, barra lateral desktop, topo, navegação inferior mobile, botões, badges, cards, campos, tabelas, estado vazio e modal.
- Extrair componentes de genealogia, jornada, visualizações, operação e conteúdo, todos alimentados por propriedades e sem dependência de dados reais.
- Reorganizar as 15 prévias existentes para consumir o kit, evitando duplicação visual e preservando seus nomes e navegação.
- Completar a prévia do App Cliente com as sete telas canônicas: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta; mobile mostra navegação inferior e desktop mostra navegação lateral, nunca ambas.
- Manter dados demonstrativos apenas em fixtures identificadas da prévia e usar estados vazios específicos quando não houver conteúdo.

## Exportação
- Disponibilizar componentes, tokens, fixtures de prévia, assets locais e um arquivo central de exports.
- Gerar um pacote ZIP com os arquivos reutilizáveis e uma lista curta de dependências/imports para adaptação no Soul Ancestry.

## Limites
- Nenhuma alteração em banco, autenticação, RLS, migrations, APIs, integrações, pagamentos, automações ou publicação.
- Nenhuma nova taxonomia, aba principal, CRM, documentação extensa ou dado fictício apresentado como real.

## Validação
- Conferir as 15 prévias e as sete telas do App em desktop e celular.
- Validar que sidebar e navegação inferior não aparecem juntas.
- Confirmar logo local, paleta aprovada, ausência de erros visuais/console e compilação válida.
