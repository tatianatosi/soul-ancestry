# Mockup — os 9 elementos que faltam, sem inventar dados

Tudo é feito numa versão separada nova, "App — 9 elementos do mockup". Nada vai para o App no ar, nada é publicado e nada é juntado ao projeto principal.

Daqui não consigo mandar instruções para uma versão que já existe. Por isso a versão nova começa do App no ar e já leva junto os três blocos da Home e os cartões "Em preparação", para que tudo fique numa versão só.

## Os 9 elementos
1. **Home: régua "Hoje você está aqui".** Cinco etapas: Diagnóstico → Pesquisa → Formalização → Documentação → App Cliente. A etapa atual vem só das etapas já registradas no caso.
2. **Home: selo "Caso ativo".** Aparece só se o caso estiver ativo no registro.
3. **Home: próximos passos numerados (1, 2, 3).** Só passos liberados para a família. Se não houver nenhum: "Em preparação".
4. **Home e Legado: achados com borda dourada e "Ver detalhes".** Só achados aprovados. Se não houver nenhum: "Em preparação".
5. **Jornada:** pílula "União de Ramos" e quadro "Momentos de união", só nos marcos publicados que já registram essa união. A etapa atual fica destacada.
6. **Radar:** área dourada preenchida e grade de 6 cartões. Só mostra percentual quando há dado real; as outras dimensões aparecem como "Em pesquisa". O eixo "Progresso Geral" é mantido (sem "Elegibilidade").
7. **Árvore:** várias pessoas lado a lado em cada geração, selo "Conectado" e rodapé "X pessoas conectadas", contando só pessoas publicadas. Sem "de Y possíveis", porque esse total não existe no registro. Família aprovada, sem Cristiane.
8. **Conta:** cartão de perfil (iniciais, nome, e-mail, WhatsApp, "Membro desde"), "Meu Plano" com o selo do estado real e "Histórico de atividades" com datas, só com o que já foi liberado. Sem CPF, RG ou endereço. Continuam "Projeto Familiar (3 assinaturas ativas)" e o WhatsApp 11 98838-4907.
9. **Topo de todas as abas:** "Bem-vinda, [primeiro nome]" e botão de perfil redondo, que leva à Conta.

## Ficam de fora (dependem da sua decisão)
- O bloco roxo do plano premium.
- Os preços de WhatsApp e do plano familiar que aparecem no mockup.
- Área de envio e checklist de Documentos: só quando houver checklist registrado. Até lá, ficam os três cartões editoriais e nenhum botão de documento sem arquivo.

## Regras mantidas
Sete abas exatas, ouro textual #A88434, toques de 44/52 px, cantos de 12 px, nada de "Nenhum…" ou "Lacuna", sem tabela, permissão ou migration nova.

## Entrega
Comparativo de 3 vias no celular (375) e no computador (1280), aba por aba: mockup original, App no ar e versão nova. O PDF fica nos Arquivos. Depois disso, paro e aguardo sua aprovação.

## Detalhes técnicos
- A régua reaproveita `src/lib/etapas-caso.ts`. Perfil, histórico, achados e passos usam só as leituras publicadas que o Portal já faz.
- A versão "App — Home 3 blocos" vira redundante. Ela não será unida ao projeto.
