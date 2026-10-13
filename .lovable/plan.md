# Polimento fino das sete abas do App Cliente

## Objetivo e limites
Refinar contraste, cartões, navegação e microinterações em 375 px e 1280 px, sem redesenhar as abas ou alterar pessoas, vínculos, documentos, percentuais, permissões e ações existentes. Nenhuma publicação está incluída.

## Acabamento visual
1. **Ouro e contraste:** manter #C2A84D nas linhas conectoras e preenchimentos. Aplicar #A88434 às bordas finas e detalhes ornamentais. A medição sobre #F0EEE9 resulta em **3,01:1**, insuficiente para texto pequeno em WCAG AA. Para rótulos G1–G6, selos e percentuais pequenos, usar o token escuro existente `--ca-estado-aguardando`, medido em **5,11:1** sobre creme. Não declarar conformidade apenas pela troca de dourado.
2. **Cartões:** padronizar somente cartões reais, preservando seções abertas e a moldura da Árvore: branco, raio de 12 px, borda navy a 8% e sombra 0 4px 16px com navy a 4%. Usar tokens semânticos; nenhum literal de cor em componentes. Derivar a borda do navy canônico #13294B, sem reintroduzir o navy legado #1B2B4B.
3. **Rodapé:** preservar os sete destinos e sua ordem. Os links já declaram altura de 64 px, largura mínima de 44 px e `touch-action: manipulation`; conferir medidas efetivas. Reforçar “Jornada” em 11 px e linha única até 375 px. Garantir área segura e espaço no conteúdo para que a barra não cubra o final da página.
4. **Árvore:** compactar o intervalo efetivo entre gerações para 24–32 px, preservando legibilidade, destaque da titular e ascendentes e vínculos publicados. Acrescentar movimento de −2 px por 200 ms em hover apropriado e no toque, sem deslocar outros elementos. Conferir se os conectores acompanham os nós durante interação e expansão.
5. **Documentos:** posicionar selo discreto “Acervo Digital” nos cartões existentes de arquivos. Usar “Certidão Oficial MA 35” somente quando a origem oficial estiver confirmada nos dados já disponíveis; não atribuir autoridade por aparência ou título presumido. Botões existentes: navy, texto branco e estado pressionado acetinado; preservar erros reais, nova tentativa e autorização de download. Não criar documento nem botão sem arquivo liberado.
6. **Radar:** separar a área da teia dos rótulos externos para o polígono ocupar aproximadamente 70% da largura útil, sem cortar texto. Apresentar legendas em pílulas creme com tinta, conservando as seis dimensões e seus valores reais ou estados de pesquisa. Não fabricar um polígono completo quando faltarem percentuais.
7. **Transições:** aplicar fade de 200 ms à troca efetiva de aba e abertura dos perfis. Evitar mudanças de tamanho causadas pela animação; a expansão voluntária do conteúdo permanece funcional. Desativar movimento para quem prefere animações reduzidas.

## Detalhes técnicos
- Priorizar alterações pontuais em `src/components/portal/portal-v11.css`, `radar-seis-eixos.tsx` e `src/routes/portal/documentos.tsx`; mexer em `explorador-arvore.tsx` apenas se necessário para manter alinhamento das linhas.
- Preservar leitores e telemetria. Se a troca de aba precisar de um marcador, limitar a alteração em `portal-shell.tsx` ao invólucro visual, mediante coordenação do arquivo compartilhado.
- Manter os tokens globais e o Desk intactos. Registrar os novos papéis de acabamento no sistema de tokens com escopo exclusivo do App, sem substituir as cores de marca.
- Confirmar isolamento do rascunho antes de editar, conforme a coordenação Claude × Lovable.

## Verificação e entrega
- Capturas antes/depois das sete abas em 375 px e 1280 px; Árvore em topo/meio/fim, incluindo Ana Luiza e conectores, e Jornada com rodapé visível.
- Medir contraste, alvos de toque, overflow horizontal, texto “Jornada”, área segura, foco por teclado e comportamento com movimento reduzido.
- Exercitar navegação e abertura de perfis com a sessão autorizada da Proprietária na prévia administrativa do caso; não gravar dados nem enviar mensagens. Inspeção automatizada não equivale a aceite pessoal ou `COMPROVADO_EM_USO`.
- Conferir testes relevantes e resultado da validação automática, sem alterar testes para forçar aprovação.
- **Bloqueio atual confirmado:** o log de validação aponta importação ausente de `./saneamento-desk-app-v4` em dois arquivos de `src/lib`. Encaminhar como **PEDIDO AO CLAUDE**, fora deste corte visual; se persistir, informar que validação final e capturas novas estão bloqueadas, sem afirmar conclusão.
- Entregar arquivos alterados, resumo do diff, resultados e capturas; parar para aceite, sem publicar.