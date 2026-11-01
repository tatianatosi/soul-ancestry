# Prompt Operacional: Correção Imediata do Caso 360 no Padrão GoLive (4 Lotes Guiados A-D)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 10:40 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: prompt de correcao normativa, veto as 3 colunas e alinhamento aos 4 lotes do golive
caminho_no_repositorio: docs/prompts/2026-10-13-prompt-correcao-caso360-4-lotes-golive.md
fontes:
  - docs/arquitetura/2026-10-13-reparacao-caso-360-padrao-golive-4-lotes.md
  - Estudo GoLive Mockups Aprovados (golive-mockups-estudo-4.pdf, Páginas 49 a 52)
escopo: >
  Mensagem corretiva enviada ao desenvolvedor / Lovable vetando o layout inventado de 3 colunas
  e exigindo a montagem estrita do Caso 360 na Ficha Guiada dos 4 Lotes (Lotes A a D).
premissas:
  - Veto absoluto à divisão em 3 colunas paralelas com blocos recolhidos;
  - Exigência da estrutura oficial de 4 Lotes Sequenciais do GoLive (Lotes A, B, C e D);
  - Trabalho em branch isolada com envio de capturas antes de qualquer publicação.
criterio_de_aceite: >
  Implementação da Ficha Guiada dos 4 Lotes A-D no Caso 360;
  envio de prints para homologação da Proprietária.
```

---

## Texto para Copiar e Enviar ao Desenvolvedor / Lovable

```markdown
CORREÇÃO DE ARQUITETURA — CASO 360: VETO ÀS 3 COLUNAS E RETORNO AOS 4 LOTES DO GOLIVE (13/10/2026)

ATENÇÃO: A sua proposta de layout em "3 colunas paralelas com blocos recolhidos" foi REJEITADA pela Proprietária. Ela NÃO EXISTE no Estudo GoLive nem no Mockup Normativo de 17 páginas.

A arquitetura oficial, canônica e acordada para o Caso 360 (rota `golivecaso` e página 12 do mockup normativo) é a FICHA GUIADA EM QUATRO LOTES SEQUENCIAIS (Lotes A a D, páginas 49 a 52 do estudo de GoLive).

IMPLEMENTE O CASO 360 ESTRITAMENTE NESTA ESTRUTURA:

1. LOTE A — Entrada e Caso (Páginas 25 e 49 do Estudo):
- Identidade do caso: Projeto Familiar Ana Luiza (CA-CID-AT-FAM-2026-001).
- Jornada D0–D365 (linha do tempo executiva do caso).
- Origem do sinal e status da contratação.

2. LOTE B — Pesquisa e Árvore (Página 50 do Estudo):
- Núcleo Familiar Silveira Friedmann-Reimer (Ana Luiza, Adair, Alice e menor Felipe). Sem Cristiane.
- Árvore e Linhagem Canônica: os 8 elos históricos confirmados.
- Impacto da Pesquisa: cobertura documental dos arquivos austríacos (Graz 1895 vinculado a Otto Reimer).

3. LOTE C — Proposta, Escopo e Contrato (Página 51 do Estudo):
- Cadeia da Formalização: proposta aceita, contrato 2026-CB-0001 (aguardando assinatura digital Gov.br).
- Condição Financeira: 3 assinaturas de R$ 320/mês × 10 meses (R$ 9.600,00) em modo rascunho/acompanhamento.
- Ordem de Serviço (OS) com escopo e prazos operacionais.

4. LOTE D — Publicação e App (Página 52 do Estudo):
- Prontidão para o App: gestão do que está publicado e liberado no Portal do Cliente (/portal).
- Cofre de Documentos: acervo técnico (sem botões falsos até os PDFs serem anexados).
- Regras de sanitização para proteger dados sensíveis.

DIRETRIZ DE SEGURANÇA E ENTREGA:
- Crie uma branch isolada (ex.: `feature/desk-v4-caso360-4lotes`) para não ter código sobrescrito.
- NÃO publique direto no ar.
- Envie as capturas de tela no celular e no computador para homologação prévia da Proprietária.
```
