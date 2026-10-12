# Correção da família da Ana Luiza na Árvore

## O que você informou
- Os pais da Ana Luiza são Adair e Cristiane Gomes da Silva Moreira.
- Ana Maria Reimer é mãe do Adair, então a linha austríaca segue pelo lado do pai.
- Cleusa Lúcia Fragola Silveira continua como mãe do Adair.

## Conflito que precisa da sua resposta
Com essas respostas, Adair passa a ter duas mães registradas: Ana Maria Reimer e Cleusa. Para não publicar uma árvore errada, não publico a ligação de nenhuma delas com o Adair até você dizer como fica. Escolha uma das três opções:
- **Ana Maria é a mãe e Cleusa é madrasta ou mãe de criação.** Cleusa sai da linha direta e fica registrada com um vínculo descrito.
- **Cleusa é a mãe e Ana Maria é avó** (mãe do pai ou da mãe do Adair). Nesse caso, também preciso saber quem liga Ana Maria ao Adair.
- **Outra relação**, que você me descreve.

O restante pode ser feito já, porque não depende do conflito.

## O que será feito agora
1. Cadastrar Cristiane Gomes da Silva Moreira no caso da Ana, como 2ª geração. Fonte registrada: "informado pela Proprietária em 12/10/2026".
2. Registrar e publicar dois vínculos:
   - Cristiane é mãe de Ana Luiza.
   - Adair e Cristiane são cônjuges.
3. Arquivar, com motivo e histórico e sem apagar, os dois vínculos que estavam errados:
   - Ana Maria Reimer como mãe de Ana Luiza.
   - Ana Maria Reimer como esposa de Adair.
4. Quando o conflito acima for resolvido, registrar a ligação certa entre Adair e a mãe dele e ajustar as gerações da linha austríaca. Se for Ana Maria, as gerações ficam assim:
   - G3: Ana Maria Reimer
   - G4: Lotte e Otto
   - G5: Rudolf
   - G6: Heinrich

   A Árvore do App aceita até 10 gerações, então cabe.
5. Conferir a Árvore e a Home no preview, como administradora, em 375 e 1280 px.

## Enquanto o conflito não é resolvido
- A Árvore mostra Ana Luiza ligada a Adair e Cristiane.
- A linha austríaca (Ana Maria, Lotte, Otto, Rudolf e Heinrich) continua visível, mas sem a linha dourada até o Adair.
- O destaque dourado de Lotte e Otto só volta quando a ligação com o Adair estiver registrada, porque ele vem dos vínculos.

## Sem efeitos externos
Nada de publicação do site, convites ou mudança de permissões. Os dados mudam só nos itens acima, que você autorizou.

## Detalhes técnicos
- Cristiane entra em `research_people`, no mesmo `research_case_id` das outras pessoas, com `geracao=2` e `visible_to_client_summary` liberado. Ela também ganha uma projeção da Árvore em `app_projections` (aprovada e publicada, `geracao_cliente=2`), com auditoria.
- Vínculos novos ficam em `genealogical_relationships` com `client_visibility='aprovada'` e a fonte em `internal_notes`.
- Os vínculos `3b9d3a7a…` e `27cae37b…` são arquivados preenchendo `archived_at` e `archive_reason`.
- Se a geração de Ana Maria, Lotte, Otto, Rudolf e Heinrich mudar, o ajuste vale tanto em `research_people.geracao` quanto em `app_projections.geracao_cliente`.
- O código não muda: a leitura dos vínculos e o destaque já calculam tudo pelos dados.
