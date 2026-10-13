# Home 3 blocos — régua de 5 etapas, selo "Caso ativo" e perfil da Conta

Tudo é feito na versão separada "App — Home 3 blocos + cartões editoriais". Nada vai para o App no ar, nada é publicado e nada é juntado ao projeto principal.

## O que entra

1. Home: régua "Hoje você está aqui"
   - 5 círculos: Diagnóstico → Pesquisa → Formalização → Documentação → App Cliente.
   - A etapa atual vem só das 5 etapas já registradas do caso (a mesma regra do Caso 360). Nenhuma etapa é marcada sem registro.
   - Etapa atual em ouro escuro, concluídas preenchidas, futuras em contorno. No celular, a régua cabe na largura da tela, sem rolar para o lado.

2. Home: selo "Caso ativo"
   - Selo dourado com texto, no cartão do caso, aparece só quando o caso está ativo no registro. Nos outros casos, mostra o estado real ou "Não registrado".

3. Conta: cartão de perfil
   - Iniciais em círculo, nome do titular, e-mail e WhatsApp já cadastrados e "Membro desde" (data de início do caso).
   - Sem CPF, RG ou endereço. Se faltar algum dado, aparece "Não registrado".
   - Continuam como estão: "Projeto Familiar (3 assinaturas ativas)" e o botão WhatsApp 11 98838-4907.

4. Conta: "Histórico de atividades"
   - Lista com datas, só com marcos e entregas já liberados para a família. Sem notas internas e sem pagamentos não confirmados.
   - Se não houver nada liberado: cartão editorial "Em preparação", nunca "Nenhum…".

## Regras mantidas
Sete abas exatas, ouro textual #A88434, toques de 44/52 px, cantos de 12 px, nada inventado, sem tabela ou permissão nova.

## Entrega
Capturas no celular (375) e no computador (1280) da Home e da Conta, lado a lado com o App no ar, num PDF nos Arquivos. Depois disso, paro e aguardo sua aprovação.

## Detalhes técnicos
- A régua reaproveita `src/lib/etapas-caso.ts`. O perfil e o histórico reaproveitam as leituras que a Conta e a Jornada já fazem (projeções publicadas). Sem migration.
- Só a versão separada recebe instruções no próprio chat. Este pedido vai colado no chat dela; se você preferir, cole você mesma este texto lá.
