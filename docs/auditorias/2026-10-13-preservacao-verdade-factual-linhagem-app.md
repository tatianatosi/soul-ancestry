# Decisão Operacional: Preservação da Verdade Factual e Linhagem no App do Cliente

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 08:45 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: homologacao de dados reais, governanca de linhagem e rejeicao de mockups
caminho_no_repositorio: docs/auditorias/2026-10-13-preservacao-verdade-factual-linhagem-app.md
fontes:
  - Dossiê Consolidado Ana Luiza (CA-CID-AT-FAM-2026-001)
  - Auditoria-Mãe Seção 10.4 (Linhagem Austríaca §58c)
  - Paleta Canônica de Marca (docs/arquitetura/revisao-layout-e-marca.md)
escopo: >
  Homologação da recusa dos dados fictícios inseridos noturnamente e consolidação
  estrita da linhagem genealógica, documentos reais e paleta canônica no App do Cliente.
premissas:
  - Nunca inventar pessoas, documentos, prazos ou intermediários (Dr. Klaus Becker);
  - A árvore deve espelhar com precisão os 8 elos canônicos confirmados;
  - Não exibir botões de download para certidões que ainda não foram enviadas/subidas.
criterio_de_aceite: >
  Manutenção do estado real do App: Conta com Projeto Familiar (3 assinaturas previstas de R$ 320/mês),
  WhatsApp de atendimento configurado, cartões com 'Acervo sob conferência técnica' e cor de fundo #F0EEE9.
```

---

## 1. Veredito: Bloqueio Total de Dados Fictícios

A decisão de **não aplicar os quatro conjuntos de dados injetados ontem à noite** está plenamente referendada. No Clube Ancestral, a experiência do cliente deve repousar sobre bases probatórias sólidas, nunca sobre simulações ou narrativas artificiais [file:287]:

1. **Rejeição de Personagens Fictícios:**
   - Exclusão imediata de nomes inexistentes na linhagem documentada (tais como "Elsa Friedmann Reimer" e "Adair Pinto Silveira avô com datas inventadas") [file:287].
   - Correção do local/ano ou ramo de Otto Reimer para respeitar estritamente o histórico validado no dossiê [file:287].
2. **Rejeição de Falsos Botões de Download:**
   - Como os arquivos físicos das certidões ainda não foram subidos no Caso 360, **é proibido** exibir botões de "Ver" ou "Baixar" que gerem erro 404 ou links vazios para a cliente [file:287].
3. **Rejeição de Progresso Inflado e Prazos Artificiais:**
   - Remoção de barras que marquem 60% e etapas 1 a 3 concluídas sem lastro de banco de dados [file:287].
   - Exclusão do intermediário fictício "Dr. Klaus Becker", tradutores não contratados e cronogramas ilusórios de radar [file:287].
4. **Condição Contratual e Financeira Real:**
   - O contrato está em elaboração e a condição financeira permanece como rascunho de acompanhamento (3 assinaturas de R$ 320 × 10 meses), sem cobrança líquida antecipada [file:287].

---

## 2. A Linhagem Genealógica Oficial e Canônica

A única linhagem verdadeira, documentada no Dossiê Consolidado e na Auditoria-Mãe (Seção 10.4), é a seguinte:

```text
Heinrich Friedmann (Boskowitz/Mähren, 15/05/1837)
       │
       ▼
Rudolf Friedmann (Iglau/Morávia, 21/09/1873)
       │
       ▼
Lotte Friedmann (Stefansrueh/Galícia, 16/05/1902)  ──(casada com)──  Otto Reimer (Graz, 1895)
                                                           │
                                                           ▼
                                                    Ana Maria Reimer
                                                           │
                                                           ▼
                                               Cleusa Lúcia Fragola Silveira
                                                           │
                                                           ▼
                                               Adair Pinto Silveira Júnior
                                                           │
                                                           ▼
                                           Ana Luiza Gomes Silveira Rodrigues
                                            (+ filho menor dependente Felipe)
```

Qualquer variação fora desta cadeia documental comprovada é espúria e não deve ser renderizada na visualização da cliente [file:287].

---

## 3. Estado Homologado no App do Cliente

O App oficial em produção permanece exibindo apenas dados factuais:

- **Aba Conta:** Identificação do processo familiar, titular Ana Luiza, indicação das 3 assinaturas previstas (sem links prematuros) e suporte via WhatsApp oficial (11 98838-4907) [file:287].
- **Aba Documentos:** Exibição prudente de **"Acervo sob conferência técnica"**, mantendo a cliente ciente do trabalho documental sem promessas vazias de download [file:287].
- **Aba Árvore:** Conexões canônicas representadas com a identidade visual dourada aprovada [file:287].
- **Paleta Visual:** Fundo creme institucional **`#F0EEE9`** mantido, rejeitando o off-white genérico `#F8F9FA` para assegurar o calor e a elegância da marca [file:287].

---

## 4. Instrução para Desbloqueio dos Botões

Para que os cartões de certidão exibam botões de visualização e download de forma legítima, basta anexar os PDFs correspondentes dentro da pasta e do fluxo documental do Caso 360 no Desk e marcá-los como liberados [file:287].
