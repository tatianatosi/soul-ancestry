# Reconciliação executável — famílias CA-, jornadas e seletor

Status: em revisão
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: product_catalog e price_catalog_rescued no Supabase, organização 11f32aae-ea08-47e0-8114-f5d8a900c9a1, consulta de 08/10/2026; src/lib/orcamento-produtos-pai.ts; teste calculadora-produtos-pai-v3-2026-10-04.test.ts; src/lib/navegacao-desk.ts.
Escopo: famílias, jornadas, ciclo, reaproveitamento dos 90 registros como seletor e tabela de preço usada pelo motor. Fora deste escopo: o bloco de evidências do feed que a proprietária mandou não revisar.
Premissas: governa o propósito CA-, não PP, não Mestre, não CRM Mestre e não OPS. Código numérico igual em períodos diferentes não é o mesmo produto.
Limites: nenhum preço foi homologado por esta rodada. Nenhuma linha de catálogo foi alterada. O Desk não foi reescrito. 0 de 90 preços estão com estado homologado.
Substitui: não substitui a fórmula do motor. Substitui o uso dos 90 registros como seletor automático.
Próximos passos: seletor de proposta e contrato lê só a lista da seção 4; preço de país sai da tabela da seção 5, com divergência explícita.
Critério de aceite: seção 7.

## 1. Famílias e jornadas que o motor usa agora

O motor de orçamento organiza por propósito, não por PP:

| Jornada | Família no motor | Exemplos lidos no código |
|---|---|---|
| Descoberta e diagnóstico | CA-DIAG | CA-DIAG-001 a CA-DIAG-004, incluindo AncestralScan sem cobrança |
| Documentação | CA-DOC | CA-DOC-004 a CA-DOC-006 |
| Protocolo e acompanhamento | CA-PROT | CA-PROT-001 a CA-PROT-004 |
| Pós-reconhecimento | CA-POS | CA-POS-002 a CA-POS-004 |
| Memória e legado | CA-MEM | CA-MEM-001 a CA-MEM-004 |

O ciclo de vida operacional é essa sequência. Memória não depende de cidadania. Continuidade comercial antiga aparece no catálogo como CA-ASS, não como fase obrigatória.

CA-PROT-001 é o código que a tela usa hoje como processo completo. Ele não substitui a família histórica CA-CID. É alias de propósito de protocolo, não uma nova taxonomia.

## 2. A taxonomia mudou por período

| Período | O que nomeava o produto | O que fazer |
|---|---|---|
| Catálogo de 90 | CA-CID, CA-HIST, CA-ASS, CA-MEM, CA-IND, CA-FAM, CA-WPP | Reaproveitar só por propósito, nunca pelo número isolado |
| Sobreposição PP | PP-01–PP-09 e variantes | Não governa e não entra no seletor |
| Motor atual | CA-DIAG, CA-DOC, CA-PROT, CA-POS, CA-MEM | É a jornada do Planejador |

CA-MEM-002 no catálogo antigo e CA-MEM-002 no motor não são o mesmo item. Não fundir por código.

## 3. Os 90 registros

Consulta atual: 90 linhas, 3 organizações, 55 arquivadas, 6 marcadas elegíveis para proposta, 0 com preço homologado.

Na organização real, só dois códigos estão elegíveis e não arquivados: CA-ASS-005 e CA-CID-025. Os dois estão com preço não homologado. CA-ASS-002 está elegível e arquivado na mesma organização. A flag de elegibilidade não pode abrir o seletor.

A maioria não é alimento. Duplicata entre organizações, arquivado e variante A–D saem.

## 4. O que pode alimentar proposta e contrato

Entram como seletor somente se o propósito for claro, a linha da organização real não estiver arquivada e o preço aparecer como referência não homologada. Não entram legado, arquivado, analogia sem citação e código de outra organização.

| Propósito | Código histórico reaproveitável | Preço na coluna do catálogo | Uso no seletor |
|---|---|---|---|
| Diagnóstico | CA-CID-001 | R$ 260, não homologado | Referência, não preço fechado |
| Pasta | CA-CID-002D | R$ 390, não homologado | Variantes A–C estão arquivadas e não entram |
| Execução | CA-CID-023 | R$ 4.500, não homologado | Processo italiano, não preço de todos os países |
| Acompanhamento | CA-CID-025 | R$ 1.190, não homologado | Único elegível não arquivado desta família |
| Pós-reconhecimento | CA-CID-006, 009, 016, 018 | R$ 280, R$ 490, R$ 2.490, R$ 2.490 | Itália, por ato |
| Pesquisa | CA-HIST-002, 004, 005 | R$ 7.700, R$ 2.490, sem preço | Não somar ao processo do país |
| Memória | CA-MEM-004, CA-MEM-008, CA-IND-001, 002, 005 | R$ 390 a R$ 5.900 | Família própria, sem cidadania obrigatória |
| Continuidade | CA-ASS-001, 003, 004, 005 | Só CA-ASS-005 tem R$ 1.825 | Não homologado; CA-ASS-002 arquivado na organização real |

CA-CID-019 e CA-CID-020 têm o mesmo preço de R$ 4.500 e o mesmo escopo aparente. Não oferecer os dois no seletor até decisão de qual permanece.

CA-FAM-002, CA-COMBO-001, CA-WPP-002 e CA-HIST-006 não entram: analogia, sazonalidade ou arquivamento, sem homologação.

## 5. Tabela de preço usada pelo motor

O teste do motor chama de vigente a tabela v3 gravada em price_catalog_rescued e usa estes componentes para o processo completo:

| País | Honorários | Despesas de terceiros | Taxas | Valor final se todos existirem |
|---|---:|---:|---:|---:|
| Alemanha | R$ 4.200 | R$ 1.500 | R$ 500 | R$ 6.200 |
| Itália, linha escolhida pelo teste | R$ 4.700 | R$ 1.600 | R$ 500 | R$ 6.800 |
| Áustria | R$ 4.800 | R$ 1.800 | R$ 600 | R$ 7.200 |
| Croácia | R$ 4.000 | R$ 1.800 | R$ 600 | R$ 6.400 |
| Espanha | R$ 3.200 | R$ 1.200 | R$ 400 | R$ 4.800 |
| Polônia | R$ 3.900 | R$ 1.500 | R$ 450 | R$ 5.850 |
| Romênia | R$ 3.600 | R$ 1.400 | R$ 450 | R$ 5.450 |
| Portugal | R$ 3.800, R$ 4.400 e R$ 4.800 | R$ 1.400 | R$ 450 | Não somar até escolher uma linha |
| Hungria, Luxemburgo, Irlanda | Nulo | Não retornadas | Não retornadas | Sem orçamento |
| Itália, linhas divergentes | R$ 4.500 e R$ 4.800 também existem | R$ 1.600 | R$ 500 | Não escolher automaticamente |

A condição de R$ 9.600 da Ana é de caso, não desta tabela. Nenhum desses valores está homologado em product_catalog. A coluna preco_comercial_vigente não substitui esta tabela.

## 6. Desk

O código de navegação declara que Planilha Mestre, conciliação e SKU legado saíram da operação diária e ficaram em Governança, rotulados, sem apagar. CRM Mestre e OPS não são premissa. Nesta rodada não reescrevi a navegação nem apaguei rota. O seletor real de proposta e contrato deve usar a seção 4 e a seção 5, não a tela de catálogo legado.

## 7. Aceite

- Seletor não lista arquivado, PP, Mestre, CRM Mestre ou OPS.
- Seletor não trata elegível como homologado.
- CA-MEM de períodos diferentes não é fundido pelo número.
- País sem componente não gera valor final.
- Portugal e as linhas divergentes da Itália permanecem bloqueadas para soma automática.
- Nenhuma das 90 linhas foi alterada nesta publicação.
