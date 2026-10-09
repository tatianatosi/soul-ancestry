# Reconciliação executável — famílias, 90 registros, preços e Desk

Status: em revisão
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: product_catalog no Supabase zsxpdbhdvbuulwpepemd, lido em 08/10/2026; código orcamento-produtos-pai.ts, catalogo-importacao.ts e decisoes-operacionais.ts em main; site clubeancestral.com.br; instrução atual da proprietária.
Escopo: reconciliar famílias e jornadas com os registros reais, separar o que pode alimentar proposta/contrato e registrar o que o Desk ainda não foi limpo.
Premissas: propósito estável é jornada de cidadania por país (CA-CID) e memória/legado (CA-MEM). PP, Top 10/Top 30, produto-mãe, Planilha Mestre, CRM Mestre e OPS não governam. Código não valida preço nem avanço.
Limites: não houve gravação no banco, não houve alteração de tela e não houve reprecificação. Os 90 registros não foram apagados.
Substitui: a leitura que tratava PP-01–PP-09 como famílias a preservar e a que admitiria o feed inteiro.
Próximos passos: retirar do seletor tudo que não passe no critério da seção 4 e trocar o rótulo operacional de Painel Mestre.
Critério de aceite: seção 6.

## 1. Os 90 não são 90 produtos

product_catalog tem 90 linhas porque há três organizações, não porque há 90 ofertas.

| Organização | Linhas | Não arquivadas | Elegíveis para proposta | Com preço preenchido |
|---|---:|---:|---:|---:|
| 11f32aae-ea08-47e0-8114-f5d8a900c9a1 | 32 | 27 | 3 | 26 |
| 0343f7b0-d538-4687-ad9a-68196eb1ff83 | 31 | 4 | 3 | 27 |
| b0fa3d42-43f4-4c7a-b942-11520e40cdd9 | 27 | 4 | 0 | 24 |

Somente a primeira organização alimenta o Desk atual. As outras 58 linhas são duplicação de catálogo entre organizações e não entram no seletor.

Na organização vigente, a contagem por prefixo é: CA-CID 14, CA-ASS 5, CA-IND 4, CA-HIST 4, CA-MEM 2, CA-COMBO 1, CA-FAM 1, CA-WPP 1.

## 2. Famílias e jornadas que permanecem

O propósito não muda com a taxonomia da hora. A fase muda.

| Propósito | Família estável | Fases da jornada | O que não governa |
|---|---|---|---|
| Cidadania por país e via | CA-CID | Descoberta, diagnóstico, pesquisa, pasta, estratégia, execução, pós-reconhecimento | PP-01–PP-09, CA-DIAG, CA-PROT, CA-POS e SKU por país |
| Memória e legado | CA-MEM | Pode correr em paralelo, sem cidadania | CA-IND, CA-COMBO e renumeração horária de CA-MEM-001–004 |
| Continuidade | CA-ASS | Depois de escopo e preço homologados | Planos marcados rascunho ou arquivados |
| Canal | CA-WPP e CA-FAM | Não são fase nem produto-pai | Tratar WhatsApp como jornada |

CA-HIST é pesquisa e pode alimentar a jornada CA-CID quando o escopo for o mesmo. Não vira segunda taxonomia. CA-PROT-001, usado hoje como processo completo no orçamento, é alias horário. Não substitui CA-CID.

Eventos de nascimento, casamento e óbito continuam eventos. Não são fase de jornada nem produto.

## 3. O que pode alimentar proposta e contrato

Nenhum dos 32 registros passa hoje como seletor homologado. Todos os preços lidos estão com preco_estado_homologacao = nao_homologado e estado_catalogo = rascunho.

| Código | Uso atual | Decisão |
|---|---|---|
| CA-ASS-005 | Elegível e não arquivado; R$ 1.825 | Não entra no seletor enquanto o preço não estiver homologado |
| CA-CID-025 | Elegível e não arquivado; R$ 1.190 | Mesma restrição |
| CA-ASS-002 | Marcado elegível, mas arquivado; R$ 169 | Excluído |
| CA-WPP-002 | Homologado no status, arquivado e não elegível | Excluído |
| Demais CA-CID, CA-HIST, CA-MEM, CA-IND, CA-COMBO, CA-FAM | Bloqueados ou em revisão | Referência de propósito, não seletor |

O seletor de proposta e contrato deve oferecer propósito, país/via e escopo. O código CA- só identifica. Não bloqueia e não define preço.

## 4. Tabela de preços em uso

Há duas camadas e elas não são a mesma coisa.

A tabela usada pelo motor de orçamento soma, sem fundir na regra:

valor final = honorários do Clube Ancestral + despesas de terceiros + taxas oficiais + outros

As referências por país já recuperadas e usadas nessa composição são:

| País | Honorários | Despesas | Taxas | Situação |
|---|---:|---:|---:|---|
| Alemanha | R$ 4.200 | R$ 1.500 | R$ 500 | Referência do motor |
| Áustria | R$ 4.800 | R$ 1.800 | R$ 600 | Referência do motor |
| Croácia | R$ 4.000 | R$ 1.800 | R$ 600 | Interna, não oferta pública |
| Espanha | R$ 3.200 | R$ 1.200 | R$ 400 | Referência do motor |
| Polônia | R$ 3.900 | R$ 1.500 | R$ 450 | Referência do motor |
| Romênia | R$ 3.600 | R$ 1.400 | R$ 450 | Referência do motor |
| Itália | R$ 4.500 / R$ 4.700 / R$ 4.800 | R$ 1.600 | R$ 500 | Divergente; não escolher |
| Portugal | R$ 3.800 / R$ 4.400 / R$ 4.800 | R$ 1.400 | R$ 450 | Divergente; não escolher |
| Hungria, Luxemburgo, Irlanda | Nulo | Não retornadas | Não retornadas | Sem orçamento automático |

A segunda camada, preco_comercial_vigente do catálogo, está preenchida em 26 linhas da organização real, mas nenhuma está com estado de preço homologado. Não usar essa coluna como preço vigente.

Proposta Canva continua condição do caso. O valor de R$ 9.600 da Ana não altera a Áustria.

## 5. Desk — o que ainda é passado

Não foi alterada nenhuma tela nesta publicação.

Ainda há resíduo operacional:

- src/lib/decisoes-operacionais.ts aponta KPI para “CA OPS / Painel Mestre”.
- src/lib/catalogo-importacao.ts importa src/data/catalogo-fonte-mestre.ts. Os testes de CA-09 e CA-15 exigem que as funções de preço não usem esse arquivo como fallback; a importação no módulo de importação continua existindo.
- src/lib/sku-produto-pai.ts ainda traduz CA-CID/CA-PROT para PP-06.
- O seletor de orçamento ainda abre em CA-PROT-001.

Planilha Mestre, CRM Mestre e OPS não devem aparecer como fonte, menu ou validador. Histórico pode permanecer fora do fluxo.

## 6. Aceite

- Seletor usa somente a organização 11f32aae.
- Arquivado, bloqueado, rascunho e preço não homologado não entram como oferta.
- CA-CID e CA-MEM identificam propósito; país é parâmetro.
- PP e CA-PROT não geram seleção nova.
- Valor final mostra os quatro componentes.
- Nenhuma das 58 linhas das outras organizações entra no Desk.
