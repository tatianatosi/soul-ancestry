# Acabamento das 7 abas do App Cliente (somente /portal)

Escopo: só as telas e componentes do App Cliente. Desk, banco, permissões, migrations e publicação ficam de fora. Nenhum dado é inventado. Quando faltar conteúdo, a tela mostra uma mensagem acolhedora.

## Ajustes que preservam regras já aprovadas
- **Home, 5 etapas:** os nomes Diagnóstico, Pesquisa, Reconstrução, Validação e Entrega aparecem como etapas da **pesquisa familiar**, nunca "da cidadania", porque não prometemos resultado. O andamento continua vindo da regra única das etapas do caso.
- **Conta, "ficha civil":** mostra nome, e-mail e telefone de contato. CPF, RG e endereço nunca aparecem no App (regra de privacidade).
- **Árvore, ancestral de origem:** o destaque vai para a pessoa mais antiga já liberada, calculado a partir dos dados. Nada fica fixo em "Otto Reimer 1895". As gerações aparecem conforme a publicação, até G10, sem gerações vazias inventadas.
- **Documentos, 4 grupos:** os grupos só se preenchem com pedidos e arquivos reais. Hoje não há pedidos registrados, então "Solicitados" e "Em conferência" aparecem vazios, com uma mensagem gentil. "Entregas liberadas" mostra os 3 arquivos da Ana. O botão de baixar só aparece em arquivo liberado.
- **Legado:** a estante mostra capas para Cadernos, Dossiês, Relatórios Fase 1 e Fase 2, e Memórias. Só o caderno já aprovado aparece preenchido; as demais capas ficam como "em preparação".

## O que muda por aba
1. **Home:** topo com o logo e o nome da família, cartão azul-marinho com o título do caso, régua de 5 etapas, 3 próximos passos e 3 descobertas (só as publicadas) e botão discreto de WhatsApp (11 98838-4907).
2. **Jornada:** duas linhas lado a lado, a história ancestral e o processo, ligadas por traços dourados. Só entram marcos aprovados. No celular, as duas linhas viram uma coluna intercalada.
3. **Radar:** teia ampla de 6 dimensões com os nomes pedidos, sem notas nem promessas, acompanhada de uma legenda de evolução.
4. **Documentos:** 4 grupos que abrem e fecham, com selos em texto (Aguardando, Em análise, Liberado) e o contador real.
5. **Árvore:** moldura branca sobre fundo marfim, iniciais elegantes, traços em dourado e azul-marinho e destaque para o ancestral de origem.
6. **Legado:** estante de capas e espaço para narrativas e memórias.
7. **Conta:** contato, resumo do plano familiar ("condição prevista"), situação do acompanhamento, termos de uso, canais oficiais e acesso seguro.

## Visual
Uso as cores já oficiais: azul-marinho #13294B, apoio #1B365D, creme #F0EEE9, dourado #C2A84D e texto #28334A. Os cartões são brancos, com cantos bem arredondados. A troca vale só dentro do App, sem mudar as cores do restante do sistema. Termos internos, códigos de produto e preços provisórios nunca aparecem.

## Verificação
- Testes automáticos existentes.
- Capturas das 7 abas no computador (1280) e no celular (375), sem rolagem para os lados e sem erros, pela prévia "Ver App Cliente como pessoa" da Ana.
- Ao final, apresento a lista de arquivos alterados. Não publico sem a sua autorização.

## Detalhes técnicos
- Arquivos: `src/routes/portal/*.tsx` e `src/components/portal/*`. O CSS fica restrito ao container do PortalShell, sem mexer nos tokens globais.
- A leitura dos dados continua igual: mesmos leitores e projeções sanitizadas, e nenhuma nova consulta de escrita.
