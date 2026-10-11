# Consolidação visual das 7 abas — o que dá para fazer com os dados reais

## Já feito (falta só sua aprovação)
- Rascunho "App Cliente — essência canônica (visual seguro)": terminou e o build está verde. Inclui Home, Jornada sem textos técnicos, Documentos em três seções, prateleiras do Legado e o App sem Assistente. As capturas de antes e depois estão prontas.
- Corte anterior do App: Radar em Ouro Nobre com "Lacuna"; Árvore com as seis pessoas por geração e sem o genograma de demonstração; Conta com R$ 320/mês × 10 marcado como "previsto".
- Rascunho "Desk V4 — homologação final v2": tira a "Sessão demo do App Cliente" do menu e muda o botão Assistente de lugar para não cobrir o heatmap.

## O que este plano faz
1. Jornada (Timeline Dupla): a Linha Ancestral e a Linha do Processo (§ 58c) ficam lado a lado, e o bloco "União de Ramos" fica em Ouro Nobre. Cada marco mostra o fato publicado no caso. Graz 1895, Viena e Brasil 1920 aparecem como "Lacuna" até que as fontes sejam aprovadas no Desk; nenhum nome ou data fica escrito fixo.
2. Radar: a teia das 6 dimensões em Ouro Nobre fica centralizada. Ao lado entra um painel "Origens" (Áustria / Graz / Viena), que mostra só os lugares publicados. Dimensões e lugares sem base aparecem como "Lacuna".
3. Árvore: as linhas de parentesco são desenhadas somente entre pessoas com relação publicada. Hoje não há nenhuma, então as linhas aparecem quando você publicar os vínculos, sem mais mudanças.
4. Conta: a contratante logada vê o próprio plano de 10 × R$ 320. Ele aparece como "ativo" só se a assinatura estiver confirmada; antes disso, como "previsto". Sem aviso de bloqueio para Adair e Alice quando forem contratantes.
5. Desk: nada novo. Eu aplico o rascunho do Desk V4 depois que você aprovar.

## Limites que não mudam
- Sete abas e seis grupos continuam iguais; nada de banco, permissões, convites ou publicação.
- Não invento parentesco, datas nem cobrança Asaas.
- Nada vai para o site principal enquanto o Claude estiver trabalhando sem a sua autorização.

## Entrega
Capturas antes e depois em 375 e 1280 px de Jornada, Radar, Árvore e Conta, mais o PDF comparativo. Depois paro e espero a sua aprovação.

## Detalhes técnicos
- Trabalho num novo rascunho que parte do "essência canônica"; CSS só sob `[data-app-cliente]` em `portal-v11.css`.
- A Timeline e as Origens leem projeções publicadas (eventos e lugares da ficha publicada); sem dado = Lacuna.
- Árvore: SVG que lê apenas as relações publicadas.
- Conta: continua usando a RPC `portal_sou_contratante_financeiro` e a condição comercial; não toca `types.ts`.
