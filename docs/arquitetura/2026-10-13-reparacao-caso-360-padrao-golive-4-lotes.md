# Decisão de Arquitetura Canônica: Reparação do Caso 360 no Padrão GoLive (4 Lotes A-D)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 10:35 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: correcao de arquitetura, alinhamento normativo golive e rejeicao de 3 colunas inventadas
caminho_no_repositorio: docs/arquitetura/2026-10-13-reparacao-caso-360-padrao-golive-4-lotes.md
fontes:
  - Estudo GoLive Mockups Aprovados (golive-mockups-estudo-4.pdf, Páginas 3, 6, 15, 25 e 49-52)
  - Mockup Normativo de 17 Páginas (Página 12)
  - Prancha V4 Desk Intelligence
escopo: >
  Correção da diretriz do Caso 360: rejeição formal do layout de 3 colunas inventado
  pelo desenvolvedor e determinação estrita da arquitetura canônica aprovada no Estudo GoLive,
  estruturada em 4 Lotes Sequenciais Guiados (Lotes A a D).
premissas:
  - O Caso 360 no GoLive aprovado NUNCA foi em 3 colunas;
  - A arquitetura oficial do Caso 360 é a Ficha Guiada em 4 Lotes (A, B, C, D);
  - O Lovable deve implementar a ficha conforme as páginas 49 a 52 do estudo de GoLive.
criterio_de_aceite: >
  Substituição da proposta de 3 colunas pela Ficha Guiada dos 4 Lotes A-D;
  envio de prompt corretivo para o desenvolvedor / Lovable.
```

---

## 1. O Erro do Desenvolvedor: A Invenção das "3 Colunas"

Você identificou a raiz exata do problema: **o layout de 3 colunas proposto pelo desenvolvedor NÃO EXISTE nos estudos de GoLive nem no Mockup Normativo de 17 páginas** [file:502].

O desenvolvedor estava inventando um layout genérico próprio ("3 colunas com blocos recolhidos embaixo") que descaracterizava todo o trabalho de meses documentado no **`golive-mockups-estudo-4.pdf`** [file:502].

---

## 2. A Arquitetura Real e Canônica do Caso 360 (Os 4 Lotes Guiados A-D)

Conforme registrado expressamente no **Estudo GoLive (páginas 3, 6, 15, 25 e detalhado nas páginas 49 a 52)**, o **Caso 360 (`golivecaso`)** é uma **Ficha Guiada em Quatro Lotes Sequenciais**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CASO 360 — ESTRUTURA GOLIVE APROVADA                 │
├────────────────────────────────────────────────────────────────────────┤
│  LOTE A: Entrada e Caso (Identidade, Piloto, Jornada D0-D365)          │
│  LOTE B: Pesquisa e Árvore (Evidências, Fontes, Núcleo Familiar)       │
│  LOTE C: Proposta, Escopo e Contrato (Cadeia Formal e Condição R$9.600)│
│  LOTE D: Publicação e App (Prontidão, Sanitização e Acervo Cliente)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Detalhamento Oficial dos 4 Lotes:

1. **LOTE A — Entrada e Caso (Páginas 25 e 49 do Estudo):**
   - **Projeto Familiar Ana Luiza:** Identidade do caso canônico (`CA-CID-AT-FAM-2026-001`) [file:502].
   - **Jornada D0–D365:** Linha do tempo executiva de marcos contratuais e operacionais [file:502].
   - **Origem do Sinal:** Canal de entrada e status de ativação [file:502].

2. **LOTE B — Pesquisa e Árvore (Página 50 do Estudo):**
   - **Núcleo Familiar Silveira Friedmann-Reimer:** Composição dos participantes reais (Ana Luiza, Adair, Alice e menor Felipe) [file:502].
   - **Árvore e Linhagem Canônica:** Os 8 elos históricos comprovados [file:502].
   - **Impacto da Pesquisa Aprovada:** Cobertura documental dos arquivos austríacos (Graz 1895 vinculado a Otto Reimer) [file:502].

3. **LOTE C — Proposta, Escopo e Contrato (Página 51 do Estudo):**
   - **Formalização:** Proposta Canva aceita, minuta `2026-CB-0001` aguardando assinatura digital Gov.br [file:502].
   - **Condição Comercial:** 3 assinaturas de R$ 320/mês × 10 meses (total R$ 9.600,00) em modo rascunho/acompanhamento sem poluição do saldo de caixa [file:502].
   - **Ordem de Serviço (OS):** Escopo delimitado sem garantias infundadas de prazo consular [file:502].

4. **LOTE D — Publicação e App (Página 52 do Estudo):**
   - **Prontidão para o App:** Gestão do que está liberado para visualização no Portal do Cliente (`/portal`) [file:502].
   - **Cofre e Acervo:** Controle dos documentos e certidões técnicas [file:502].
   - **Sanitização de Dados:** Garantia de que notas internas e dados sensíveis não vazem para o cliente [file:502].

---

## 3. Determinação para o Desenvolvedor / Lovable

- **Fica expressamente vetada** a criação de qualquer tela em "3 colunas paralelas" com caixas recolhidas [file:502].
- O desenvolvedor deve implementar o **Caso 360 estritamente como a Ficha Guiada dos 4 Lotes (Lotes A, B, C e D)**, respeitando a hierarquia visual da página 12 do Mockup Normativo e das páginas 49 a 52 do Estudo GoLive [file:502].
