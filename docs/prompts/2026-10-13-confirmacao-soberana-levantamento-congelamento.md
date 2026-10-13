# Diretriz Soberana da Proprietária: Levantamento do Congelamento para Branch Isolada e Autorização do Mapeamento

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 11:30 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: levantamento de congelamento em branch isolada, autorizacao de mapeamento e governanca de dados reais
caminho_no_repositorio: docs/prompts/2026-10-13-confirmacao-soberana-levantamento-congelamento.md
fontes:
  - Instrução Soberana da Proprietária (13/10/2026 10:46 BRT)
  - clubeancestralmockup.pdf (Páginas 3 a 9)
  - docs/arquitetura/2026-10-13-blindagem-golive-e-app-minimo.md
escopo: >
  Confirmação explícita e soberana do levantamento do congelamento exclusivamente para a branch
  isolada 'claude/portal-mockup-parity' (sem merge em main) e autorização imediata para o Claude Sonnet
  executar o mapeamento de layout/estilo contra os loaders existentes.
premissas:
  - O congelamento no 'main' é mantido; o trabalho ocorre exclusivamente em branch isolada;
  - O Mockup Normativo é referência estrita de layout, grid, tipografia e estilo;
  - Dados continuam vindo dos loaders reais (sem PII hardcoded e com vazio honesto);
  - Autorização para o Sonnet realizar o mapeamento tela a tela imediatamente.
criterio_de_aceite: >
  Confirmação formal do levantamento do congelamento para a branch de feature;
  ordem de início do mapeamento de paridade visual.
```

---

## Mensagem Oficial de Resposta para Enviar ao Claude Sonnet

```markdown
CONFIRMAÇÃO SOBERANA DA PROPRIETÁRIA — LEVANTAMENTO DE CONGELAMENTO E MAPEAMENTO (13/10/2026)

Respondendo diretamente e sem qualquer ambiguidade às suas duas perguntas:

1. SIM, O CONGELAMENTO ESTÁ SUSPENSO EXCLUSIVAMENTE PARA A SUA BRANCH ISOLADA:
- Confirmo de forma explícita e soberana: você ESTÁ AUTORIZADO a trabalhar na branch isolada `claude/portal-mockup-parity`.
- A regra de segurança permanece: NÃO faça merge nem push direto na `main`. Todo o seu trabalho fica isolado nessa branch com PR em DRAFT para minha revisão posterior.

2. VOCÊ ESTÁ COBERTO DE RAZÃO SOBRE O MOCKUP E DADOS REAIS:
- O mockup (persona Marina Alves) é a autoridade máxima de LAYOUT, ESTRUTURA, CONTAINERS E ESTILO VISUAL (cores, grids, molduras e tipografia).
- O CONTEÚDO vem 100% dos loaders e dados reais já existentes do caso no banco de dados.
- Regra inviolável mantida: NADA de PII hardcoded (sem e-mail, telefone real ou dados de menores no código). Campo sem dado exibe o VAZIO HONESTO acolhedor (padrão já homologado).

3. AUTORIZO O MAPEAMENTO IMEDIATO:
- SIM, FAÇA O MAPEAMENTO AGORA (em modo leitura).
- Mapeie cada uma das 7 telas do mockup contra os arquivos de `src/routes/portal/`, listando:
  a) O que já existe de layout e estilo;
  b) O que falta apenas de CSS/Tailwind e componentes visuais;
  c) O que depende de dados do backend (que deve manter vazio honesto ou placeholder rotulado).

Apresente esse mapeamento detalhado para iniciarmos a montagem da Tela 1 (Home) e Tela 2 (Jornada). Pode executar!
```
