# Desk V4: paridade com a prancha aprovada (12 telas)

## Princípio
Não serão criadas páginas `/admin/desk/*`. Cada uma das 12 telas da prancha já tem sua tela no Desk, conforme o mapa de componentes que você enviou. A reconstrução é visual e de ligação de dados nessas telas, sem segunda versão de nada.

## As 12 telas da prancha e onde ficam

| Prancha | Tela que já existe |
|---|---|
| 01 Hoje | Painel Hoje |
| 02 Comercial | Calls, Leads e CRM Mestre |
| 03 Kanban | Tarefas |
| 04 Caso 360 | Caso 360 da Ana, com as 8 seções atuais |
| 05 Pessoa 360 | Pessoa 360 |
| 06 Radar | Qualidade (Radar Interno) |
| 07 Pesquisa | Pesquisa e Biblioteca |
| 08 Financeiro | Financeiro |
| 09 Jurídico | Matriz jurídica e Contratos |
| 10 Pessoas e linhagens | Pessoas e linhagens do caso |
| 11 Portal | "Ver App Cliente como pessoa" |
| 12 Configuração | Equipe e menu da conta |

## Como será feito: um corte por vez
Cada corte entrega uma tela da prancha alinhada (1440 px e celular), com capturas antes e depois. Depois de cada corte eu paro e espero o seu aceite. A ordem segue o que mais impacta a Ana:

1. **Caso 360.** No visual da prancha, cada parte entra na seção atual que já faz esse papel:
   - "Linha do Tempo" fica em Jornada, com o seletor visível "Rascunho interno / Publicar no App" e os 4 marcos já publicados.
   - "Documentos" ganha o botão "Liberar download no App" em cada arquivo.
   - "Prontidão" mostra os 5 gates em Visão.
2. **Pessoas e linhagens.** Matriz de vínculos com o botão "Homologar linhagem e publicar conexões no App". O botão usa a publicação que já existe e não cria um segundo caminho.
3. **Hoje.** Indicadores do dia (no máximo 4), alertas e o cartão "Caso em destaque" da Ana.
4. **Portal**, para ver o App como a cliente vê, e **Radar**.
5. **Comercial e Tarefas.**
6. **Pesquisa, Financeiro e Jurídico.**
7. **Pessoa 360 e Configuração.**

## Regras que continuam valendo
- **Publicar** salva de verdade no banco e o App atualiza sozinho em até 30 segundos. Salvar rascunho nunca publica.
- **Nenhum dado é inventado.** Isso inclui:
  - Documentos de Graz e o Dossiê: só aparecem se os arquivos forem enviados.
  - Assinaturas 3x R$ 320: aparecem como "previstas" até haver confirmação.
  - Os 13 eventos de conversão e o contrato 2026-CB-0001: só se existirem no cadastro.
- **Cores e letras:** azul-marinho, dourado e creme, com Cormorant e Montserrat (tokens de 16/09).
- **Sem mudança de banco, permissões, cobrança ou publicação do site** sem a sua autorização.

## Decisão sua antes do corte 1
A lateral do Desk tem uma divergência aberta. Num registro estão 6 grupos com Marketing; hoje a tela mostra outros 6 setores. Não vou mexer na lateral até você decidir qual vale. Os cortes acima não dependem disso.

## Detalhes técnicos
- Rotas: `painel`, `calls`/`leads`/`crm-mestre`, `tarefas`, `casos.$caseId.index` (`SECOES` inalterado), `pessoas.$clienteId`, `qualidade`, `pesquisa.index`/`biblioteca`, `financeiro`, `matriz-juridica`/`contratos.index`, `pessoas-linhagens.$caseId`, `app-cliente-como-pessoa`, `equipe`.
- O kit da prancha é usado como referência visual, reaproveitando os componentes do Desk que já existem. Nada de fixtures da prancha em produção.
- Escritas reaproveitam os writers atuais (projeções do App, `documents.liberado_cliente`, `genealogical_relationships.client_visibility`), com auditoria.
- Cada corte passa por checagem de tipos, testes relevantes e capturas em 1440 e 375 px.
