# App — mockup completo v2 (mais leve, com cartões separados e mais cores)

Tudo fica nesta versão separada. Nada é publicado, nada é juntado ao projeto principal, e o banco e as permissões não mudam.

## O que conferi antes
- As 17 páginas do mockup original, os comparativos de hoje (3 vias e mockup × App) e as capturas do App no ar.
- Os dados reais do caso da Ana Luiza:
  - **Caso:** o cadastro diz "pronto para ativar", não "ativo".
  - **Etapas:** Diagnóstico e Documentação estão concluídos. Formalização está em andamento, porque o contrato ainda não consta como assinado. Financeiro e App Cliente estão liberados.
  - **Checklist:** existem 14 itens, mas todos são tarefas internas da equipe (preparar contrato, criar cobrança, link interno). Não são documentos da família.
  - **Entregas e achados:** nenhuma entrega registrada e nenhum achado publicado.
  - **Árvore:** 8 pessoas publicadas.

## Visual (só no App, o Desk não muda)
- Fundo creme, com cada bloco num cartão branco separado, mais espaço entre eles e cantos de 12 px. Fica mais leve, sem blocos densos.
- Paleta completa: azul-marinho, azul do cartão principal, dourado, ouro escuro no texto pequeno, tinta, creme e terracota.
- Cores do mockup, só nos selos e nas barras:
  - verde para "OK" e "Entregue";
  - laranja para "Pendente";
  - azul para "Parcial";
  - roxo suave para detalhes de destaque.
- O bloco roxo do plano premium e os preços do mockup não entram.

## Elementos, aba por aba
1. **Topo de todas as abas:** "Bem-vinda, Ana Luiza" e botão redondo de perfil, que leva à Conta.
2. **Home**
   - Cartão do caso com a régua "Hoje você está aqui" e as 5 etapas, cada uma no estado registrado.
   - Selo do caso: "Caso ativo" só aparece quando o caso está ativo. Hoje aparece "Ativação em preparação".
   - Próximos passos em cartões numerados 1-2-3. Hoje mostram "Em preparação".
   - Cartão "Pessoas conectadas" com o número real (8).
   - Achados recentes com borda dourada. Hoje mostram "Em preparação".
   - Cartão azul-marinho da Assessoria com o WhatsApp 11 98838-4907.
3. **Jornada:** pílulas "União de Ramos" e quadro "Momentos de união", só nos marcos publicados que registram união. A etapa atual fica destacada.
4. **Radar**
   - Grade de 6 cartões com percentual e barra. As dimensões sem dado aparecem como "Em pesquisa".
   - A área dourada preenchida só aparece quando houver 3 ou mais dimensões com dado real. Hoje só há 1 (80%), então ela continua como linha.
5. **Árvore:** várias pessoas lado a lado em cada geração, em cartões pequenos, com o selo "Conectado" e o rodapé "8 pessoas conectadas". Sem "de Y possíveis" e sem Cristiane.
6. **Documentos**
   - Área de envio tracejada, usando o envio de arquivo que o App já tem.
   - Checklist com os selos Pendente / OK / Parcial. Ele mostra "Em preparação", porque os 14 itens registrados são internos e não podem aparecer para a família.
   - "Entregas do caso" mostra "Em preparação".
   - Os três cartões do acervo continuam, e nenhum documento ganha botão de download sem arquivo.
7. **Legado:** "Seus Achados" em cartões com data e "Ver detalhes", quando houver achado publicado. Até lá, cartão "Em preparação".
8. **Conta**
   - Cartão de perfil com as iniciais "AL", o nome e o e-mail do cadastro, e "Membro desde agosto de 2026".
   - "Meu Plano" com o selo do estado real.
   - "Histórico de atividades" com datas, só com o que já foi liberado.
   - Continuam "Projeto Familiar (3 assinaturas ativas)" e o WhatsApp.
9. Os avisos "Nenhum…" e "Lacuna" viram cartões "Em preparação" ou "Em pesquisa".

## Entrega
- As sete abas capturadas no celular (375) e no computador (1280).
- Um PDF com três colunas por aba: mockup original, App no ar e esta versão. Confiro cada página antes de enviar.
- Depois disso, paro e aguardo sua aprovação.

## Detalhes técnicos
- Uma leitura nova no servidor traz o nome, o e-mail, "membro desde", as 5 etapas de `etapas-caso.ts` e se o caso está ativo. Ela é usada pelo portal (depois da checagem de acesso que já existe) e pela prévia da equipe. Sem migration e sem mudança de RLS.
- Os novos componentes visuais ficam num arquivo próprio do portal. As cores do mockup ficam restritas a `[data-app-cliente]` em `portal-v11.css`, e os tokens globais não mudam.
- Rodo o typecheck e os testes do portal. Os textos que mudarem nos testes são atualizados.
