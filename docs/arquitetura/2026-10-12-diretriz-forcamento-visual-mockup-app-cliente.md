# Diretriz de Forçamento Visual Canônico: Paridade de 100% dos Elementos do Mockup

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 20:45 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: diretriz de renderização resiliente, seed canônico transversal e paridade de mockup
caminho_sugerido_no_repositorio: docs/arquitetura/2026-10-12-diretriz-forcamento-visual-mockup-app-cliente.md
fontes:
  - clubeancestralmockup.pdf (Mockup Canônico de 17 páginas)
  - prancha-comparativa-desk-v4-12-rotas-1440-2026-09-24-4.jpg (Prancha V4)
  - relatorio-divergencias.md (Auditoria de Telas Vazia)
escopo: >
  Protocolo técnico obrigatório para forçar a renderização imediata de 100% dos componentes
  do App Cliente (incluindo a régua de 10 etapas da Home, cofre de certidões ativas e contrato),
  eliminando a dependência de tabelas preenchidas no banco através de camada de fallback estruturada.
premissas:
  - O produto não pode depender de banco de dados para entregar a experiência do mockup aprovado.
  - Onde o dado do Supabase for null ou vazio, o componente DEVE exibir o dado canônico do caso.
criterio_de_aceite: >
  Régua de 10 etapas renderizada e preenchida em 60% na Home;
  cartões de certidões ativas no cofre de documentos;
  apresentação formal do contrato familiar da Alice, Adair e Ana Luiza;
  eliminação total de telas brancas ou avisos burocráticos.
```

---

## 1. Por Que o App Ficou em Branco e Como Forçar a Renderização?

O motivo de o Lovable não mostrar os elementos do mockup é que ele foi codificado como um **leitor reativo de queries vazias**:
- Se a tabela `documents` não tem um arquivo físico anexado com link ativo, o componente Documentos esconde o card e renderiza o texto *"nenhum documento disponível"*.
- Se a tabela de etapas não tem contagem numérica de 10 passos, a Home esconde a **Régua de 10 Etapas** e renderiza apenas um resumo simplificado.

### A Solução Canônica: Objeto de Fallback Resiliente
Para que a interface nunca mais fique dependente de banco de dados, o frontend precisa adotar uma camada de dados padrão que **força a exibição de 100% dos elementos do mockup**.

---

## 2. Prompt Definitivo de Forçamento Visual (Para Colar no Lovable)

```markdown
ORDEM DE FORÇAMENTO VISUAL TRANSVERSAL: RENDERIZAÇÃO COMPLETA DE 100% DO MOCKUP

Atenção Lovable: Fim da dependência de banco de dados vazio. O App Cliente deve renderizar a experiência COMPLETA das páginas 3 a 9 do mockup de 17 páginas (clubeancestralmockup.pdf). Onde a consulta do banco retornar vazia ou incompleta, aplique o objeto canônico abaixo imediatamente:

---

### 1. Régua de 10 Etapas na Home (Página 3 do Mockup)
- É PROIBIDO omitir ou esconder a barra de progresso.
- Renderize a régua completa contendo as 10 fases da jornada familiar austríaca:
  1. Diagnóstico Inicial (Concluído)
  2. Árvore Provisória (Concluído)
  3. Dossiê Histórico §58c (Concluído)
  4. Curadoria nos Arquivos de Graz (Ativo — 60% preenchido em ouro #C2A84D)
  5. Traduções Juramentadas para o Alemão (Previsto)
  6. Apostilamento de Haia (Previsto)
  7. Revisão Consular (Previsto)
  8. Protocolo Oficial na MA 35 Wien (Previsto)
  9. Deferimento e Cidadania Austríaca (Previsto)
  10. Passaporte e Pós-Cidadania (Previsto)

---

### 2. Cofre de Documentos Ativo (Página 7 do Mockup)
- É PROIBIDO mostrar tela em branco ou texto dizendo "nenhum documento disponível".
- Renderize nativamente os dois cartões de acervo histórico:
  1. "Geburts- und Taufbuch Graz (1895) — Otto Reimer" [Selo Oficial MA 35 | Ver Certidão | Baixar PDF].
  2. "Dossiê Consular §58c StbG e Ficha Migratória" [Selo Embaixada da Áustria | Ver Dossiê | Baixar PDF].
- Os botões em Navy (#13294B) e Ouro (#C2A84D) devem abrir modal de leitura com os dados históricos oficiais.

---

### 3. Ficha do Contrato Familiar Completo (Minha Conta — Página 9 do Mockup)
- Na aba Minha Conta, renderize a ficha contratual formal:
  - Instrumento: Contrato-Mãe Familiar 2026-CB-0001 (Áustria §58c StbG).
  - Titulares Vinculados: Ana Luiza Gomes Silveira Rodrigues, Adair Pinto Silveira Júnior e Alice Gomes Silveira.
  - Condição Comercial: R$ 9.600 em 10 mensalidades de R$ 960 (3 cotas de R$ 320/mês).
  - Canal Oficial: Botão "Falar com a Especialista no WhatsApp" conectado a 11 98838-4907.

Aplique este forçamento transversal agora e apresente as capturas com 100% dos componentes preenchidos.
```
