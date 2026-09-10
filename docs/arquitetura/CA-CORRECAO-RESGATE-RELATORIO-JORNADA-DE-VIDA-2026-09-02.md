# Correção do resgate — relatório de jornada de vida

- **Status:** rascunho
- **Versão:** v1.0
- **Data:** 2026-09-02
- **Responsável pela decisão:** Proprietária do Clube Ancestral
- **Fonte(s) de evidência:** memória documental do projeto; Google Drive; repositório GitHub `tatianatosi/soul-ancestry`
- **Escopo:** corrigir a identificação dos modelos de relatório de entrega distintos de Fase 1/Fase 2, com ênfase no relatório baseado em estatísticas, plano de ação e marcos históricos pessoais.
- **Premissas:** a descrição da proprietária é a referência semântica principal; o nome literal pode estar em material antigo, não indexado ou fora do repositório atual.
- **Limites:** o nome exato do modelo não foi recuperado por busca textual; os resultados do Google Drive relevantes não tiveram conteúdo integral disponível devido à indexação/rate limit do conector.
- **Próximos passos:** abrir o arquivo histórico retornado pelo Drive e buscar nos conteúdos não indexados o título visual/comercial do segundo relatório; homologar uma nomenclatura única antes de expô-la no app.
- **Critério de aceite:** confirmação da proprietária sobre os dois nomes canônicos, seus escopos e a visibilidade desejada no app.

## Correção da hipótese anterior

A hipótese anterior, que reduzia "Encontro de Linhagens" a um possível nome editorial, ficou incompleta. A nova descrição identifica uma entrega mais ampla, derivada da ficha genealógica e dos módulos históricos: não é somente um relatório de linhagem nem somente uma devolutiva de cidadania.

O segundo artefato lembrado é melhor caracterizado como um **relatório de jornada de vida / dossiê histórico 360° com estatísticas e plano de ação**. Ele articula três camadas:

1. leitura quantitativa ou estatística da base/família/caso;
2. cronologia de marcos de vida e histórico familiar;
3. plano de ação de pesquisa, lacunas, documentos e próximos passos.

## Evidências recuperadas

### 1. Estrutura histórica prevista no modelo genealógico

A ficha piloto e a estrutura de dados registram eventos de vida como nascimento, batismo, casamento, morte, sepultamento, residência, migração, serviço militar e patrimônio. A arquitetura também prevê 13 módulos históricos, incluindo residências/migrações, ocupações/patrimônio, vida militar, registros notariais, cadastros, educação, cultura, registros religiosos, correspondência, vida social/política, acervo audiovisual, objetos preservados e contexto histórico.

A ficha recuperada registra explicitamente a subdivisão por "ocupação e patrimônio", "vida militar" e "vida religiosa/comunitária". Logo, a lembrança de marcos civis, religiosos, militares e comunitários corresponde a um desenho documental efetivamente existente no projeto.

### 2. Plano de ação como parte do mesmo motor

O repositório distingue a projeção ao cliente da gestão interna, mas conecta achados, árvore, timeline e planejamento. O módulo G-07 é o "Plano de ação de pesquisa, instituições e terceiros", descrito como ações, prazos, rechecagens e previsões internas. A pesquisa deve produzir linha do tempo por pessoa, matriz de evidências e estratégia priorizada de busca.

Portanto, no relatório de jornada de vida, o plano de ação não é um apêndice comercial genérico: ele converte lacunas, hipóteses e fontes em prioridades, responsáveis e próximas providências.

### 3. Encontros de Linhagem

"Achados e Encontros de Linhagem" é um módulo explicitamente registrado no plano de implementação. A função descrita é converter evidência validada em achado, árvore/timeline e entrega aprovada. Isso confirma que "Encontro de Linhagens" pertence ao motor de entrega genealógica, mas não define sozinho todo o relatório de jornada de vida.

## Modelos agora distinguíveis

| Modelo | Finalidade | Conteúdo central | Papel de "Encontro de Linhagens" |
|---|---|---|---|
| Relatório de Pesquisa Genealógica | Devolutiva dos achados de uma pesquisa | objetivo, fontes, documentos, geração comprovada, conexões e narrativa de pesquisa | pode registrar encontros/ramificações confirmados |
| Relatório de Jornada de Vida / Dossiê Histórico 360° | Transformar dados de pessoas, eventos e acervos em leitura histórica acionável | estatísticas, cronologia pessoal/familiar, marcos civis, religiosos, militares e comunitários, evidências, lacunas e plano de ação | seção de convergências entre pessoas, ramos, eventos e fontes |

## Nome canônico ainda pendente

A denominação literal "Relatório de Jornada de Vida" é uma identificação funcional de resgate, não uma confirmação de nome oficial anterior. O material recuperado demonstra a estrutura, mas não devolve o título histórico do template.

Até localizar a capa/nome original, evitar registrar "Encontro de Linhagens" como sinônimo do relatório inteiro. O uso mais coerente é:

- **Encontros de Linhagem:** achado ou seção de convergência comprovada;
- **Jornada de Vida / Dossiê Histórico 360°:** relatório amplo que reúne estatísticas, marcos e plano de ação;
- **Relatório de Pesquisa Genealógica:** devolutiva técnico-narrativa da investigação.

## Fontes consultadas

- Google Drive: resultado `retome @Clube Ancestral veja que dentro dos arquiv.docx`.
- Google Drive: `Plano-Vendas-2026-Atualizado` e documentos de plano retornados na busca contextual.
- GitHub: `docs/G02_PESSOAS_E_LINHAGENS_v1.0.md`.
- GitHub: `docs/evolucao/recuperados/prompts-lovable/ficha_piloto_genealogica_e_arvores_decisao_canonica_v1_0.md`.
- GitHub: `src/lib/genealogia-modulos.ts`.
- GitHub: `src/lib/pesquisa-ia.server.ts`.
- GitHub: `src/data/relatorio-fase02.ts`.
- GitHub: `docs/implementacao/CA-IMPL-CRM-01_registro_entrega_19_agosto_2026_v1.0.md`.
- GitHub: `docs/evolucao/recuperados/prompts-lovable/PROMPTS_POS_CRM_IDENTIFICADORES_E_MOTOR_GENEALOGICO_v1.0.md`.
