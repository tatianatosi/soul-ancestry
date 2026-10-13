# Decisão de Arquitetura Canônica: Desk Simples V4 — Os 7 Ecossistemas e o Corte C do Caso 360

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 10:45 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: arquitetura canonica desk v4, definicao de ecossistemas e especificacao de corte c
caminho_no_repositorio: docs/arquitetura/2026-10-13-desk-simples-v4-ecossistemas-e-corte-c.md
fontes:
  - Documento Normativo da Proprietária (Desk Simples V4 de 29/09/2026)
  - Prancha V4 Desk Intelligence (prancha-comparativa-desk-v4-12-rotas-1440-2026-09-24-4.jpg)
  - Estudo GoLive Mockups Aprovados (golive-mockups-estudo-4.pdf)
escopo: >
  Homologação integral da arquitetura Desk Simples V4 baseada nos 7 Ecossistemas Permanentes
  e no painel Hoje de comando diário. Definição estrita do papel do Caso 360 dentro do Ecossistema Casos
  (Corte C do Prompt Mestre) e regras de aplicação no Lovable.
premissas:
  - Alimento interno (catálogos, listas, SKUs, dicionários) NÃO É TELA DO DESK;
  - Os 7 Ecossistemas são a única autoridade de navegação lateral;
  - O Caso 360 é governado pelo Planejador/Produto-Pai e centraliza a jornada sem duplicar fichas.
criterio_de_aceite: >
  Registro formal do Desk Simples V4 no repositório;
  alinhamento do Caso 360 como centro do Ecossistema Casos (Corte C);
  geração do prompt curto padronizado para o Lovable.
```

---

## 1. Homologação da Decisão V4: Os 7 Ecossistemas Permanentes

Fica formalmente incorporada a decisão arquitetural soberana de **29/09/2026**. O Desk não é uma colcha de retalhos de 19 rotas isoladas nem um emaranhado de tabelas soltas. O Desk é estruturado em **um painel de comando diário (`Hoje`)** e **sete ecossistemas funcionais** [file:502]:

| # | Grupo Lateral V4 | Função Executiva | O que Contém | O que Está Proibido Como Tela |
|---|---|---|---|---|
| 0 | **Hoje** | Decidir e agir no dia | Decisões, cadências, alertas e casos sem ação | Formulários longos, cadastros e cadastros brutos |
| 1 | **Comercial / CRM Vivo** | Converter oportunidade em caso | Lead único, Discovery/Calls, proposta e conversão | Segundo CRM, catálogo completo, telas paralelas |
| 2 | **Casos / Planejador** | Operar o caso familiar | **Caso 360**, Produto-Pai, jornada, entregas e marcos | Catálogo bruto, SKU como percurso obrigatório |
| 3 | **Pessoas & Famílias** | Ficha única e vínculos | Pessoa Canônica, participantes, G1–G5 e núcleo | Ficha genealógica paralela, segundo cadastro |
| 4 | **Pesquisa & Inteligência** | Evidências e linhagem | Pessoas genealógicas, fontes, relações e achados | Biblioteca estática como destino, telas de CRM |
| 5 | **Marketing** | Aquisição e comunicação | Campanhas, canais, páginas e oportunidades | Dados nominais de cliente, pesquisa genealógica |
| 6 | **Formalização & Financeiro** | Formalização e recebíveis | Proposta, contrato v2, OS, cobrança e ativação | Parâmetros técnicos, catálogo bruto |
| 7 | **Governança & Configuração**| Administração de alimentos | Perfis, acessos, integrações e dicionários | Operação diária do cliente |

> **Regra Áurea dos Alimentos Internos:** Catálogos, SKUs, listas de países, dicionários de campos, tipologias e bases genealógicas **não são telas de menu**. Eles atuam unicamente como alimentos contextuais (seletores, filtros e validações) dentro dos fluxos dos 7 ecossistemas [file:502].

---

## 2. A Especificação Canônica do Caso 360 (Corte C do Prompt Mestre)

O **Caso 360** não é um mosaico de 3 colunas improvisadas. Dentro do ecossistema **Casos**, ele é o **centro de gravidade da operação**, governado pelo Planejador e pelo Produto-Pai [file:502]:

1. **Governança por Produto-Pai:** O Produto-Pai (ex.: *Pacote Familiar Cidadania Austríaca §58c*) e a rota da jornada governam a esteira da família. O SKU fica recolhido como detalhe contábil e **nunca bloqueia a Ana Luiza** [file:502].
2. **Estrutura Executiva do Caso 360:**
   - **Cabeçalho:** Identidade unificada (`CA-CID-AT-FAM-2026-001`), fase atual e próxima ação [file:502].
   - **Participantes e Núcleo:** Titular Ana Luiza, Adair, Alice e menor Felipe (lidos da Pessoa Canônica sem redigitação) [file:502].
   - **Jornada e Marcos:** Linha do tempo executiva D0–D365 [file:502].
   - **Formalização & Entregas:** Contrato `2026-CB-0001` (aguardando Gov.br) e previsão financeira de R$ 9.600 em rascunho [file:502].
   - **Pontes Vivas:** Links diretos para Pesquisa (achados/árvore) e Documentos (cofre técnico) [file:502].

---

## 3. O Uso Controlado do Lovable

Conforme estipulado no documento de 29/09, o desenvolvedor / Lovable deve ser acionado **exclusivamente com o pedido curto padronizado**, sem espaço para invenções de arquitetura [file:502]:

```text
Aplique a prancha V4 aprovada para o ecossistema [NOME] usando os readers/writers já existentes. Não criar dados demo, tabela, rota global ou lógica nova. Preserve a sidebar V4, topo, cartões, gráficos apenas com dados reais e estado “Sem dados suficientes”. Transforme formulários longos em passos/abas com salvar por bloco. Entregue captura desktop e mobile antes de publicar.
```
