# Diretriz Operacional: Resolução Canônica do Marco 1895 e Alinhamento da Prancha V4

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 09:15 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: resolucao genealogica canonica e priorizacao de telas desk v4
caminho_no_repositorio: docs/arquitetura/2026-10-13-resolucao-marco-1895-e-alinhamento-desk-v4.md
fontes:
  - Auditoria-Mãe Seção 10.4 (Caso Ana Luiza Gomes Silveira Rodrigues)
  - Dossiê Consolidado CA-CID-AT-FAM-2026-001 (Áustria §58c StbG)
  - Prancha V4 Desk Intelligence
escopo: >
  Definição canônica sobre o titular do marco de nascimento de Graz 1895 e
  ordem de prioridade para alinhamento das telas do Caso 360 à Prancha V4.
premissas:
  - O marco genealógico de 1895 em Graz pertence documentalmente a Otto Reimer;
  - Os testes de UI (A1 e A5) estão 100% aprovados sem alteração de telas;
  - O Caso 360 é o painel único e prioritário de trabalho.
criterio_de_aceite: >
  Confirmação inequívoca de Otto Reimer (Graz, 1895);
  eleição da Visão Geral (Cabeçalho/Resumo 360) como primeira tela para alinhamento à Prancha V4.
```

---

## 1. Resposta Canônica: A Quem Pertence o Marco de 1895?

O marco de **1895 (Graz)** pertence inequivocamente a **Otto Reimer** [file:287].

### Evidência Primária Documentada (Auditoria-Mãe Seção 10.4):
- **Heinrich Friedmann:** Nascido em Boskowitz/Mähren em **15/05/1837** [file:287].
- **Rudolf Friedmann:** Nascido em Iglau/Morávia em **21/09/1873** [file:287].
- **Lotte Friedmann:** Nascida em Stefansrueh/Galícia em **16/05/1902** [file:287].
- **Otto Reimer:** Nascido em **Graz em 1895** (imigração em 1920, casado com Lotte Friedmann) [file:287].

> **Diretriz de Registro:** Franz Friedmann não substitui Otto Reimer na certidão de nascimento de 1895. O registro oficial de Graz 1895 deve ser atribuído e vinculado a **Otto Reimer** [file:287].

---

## 2. Aprovação dos Testes A1 e A5

Fica homologada a atualização da suíte de testes automatizados (11 de 11 checagens aprovadas) [file:287]:
- **Teste Documentos (A5):** Validada a conformidade das strings *\"Ainda não há documentos liberados para você neste momento…\"* e do título *\"Acervo sob curadoria técnica\"* [file:287].
- **Teste Home (A1):** Validada a checagem da borda dourada institucional [file:287].
- **Integridade Visual:** Confirmado que a adequação ocorreu exclusivamente no código dos testes, sem oscilações na interface em produção [file:287].

---

## 3. Priorização de Telas para Alinhamento à Prancha V4

Para a evolução do **Caso 360** rumo à **Prancha V4**, a sequência de implementação aprovada é:

1. **1ª Tela (Prioridade Imediata):** **Visão Geral do Caso 360 (Cabeçalho e Barra de Progresso/Etapas)**
   - Alinhar a régua das 5 etapas factuais, os metadados do caso (`CA-CID-AT-FAM-2026-001`), o selo do Projeto Familiar e a exibição em rascunho dos R$ 9.600 [file:287].
2. **2ª Tela (Subsequente):** **Aba Documentos e Evidências do Caso 360**
   - Estruturar a área de upload para receber o *Dossiê Consolidado §58c* e o *Checklist Consolidado / Registro de Graz 1895*, liberando gradualmente os botões reais do acervo [file:287].
3. **3ª Tela:** **Aba Genealogia / Árvore Familiar**
   - Fixar os 8 elos canônicos com a tipografia e estilização dourada da Prancha V4 [file:287].
