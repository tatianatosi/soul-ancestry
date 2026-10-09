# Execução — taxonomia CA-, Planejador e jornada

Status: aprovado para execução
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: instrução de 08/10/2026, 22:26; revisão de prompts; busca em main no commit fb44f415d0e775c8bb9ba0d9a6618fa1e5879844.
Escopo: executar a correção de governança. Este arquivo não é auditoria. SKU, Planilha Mestre, CRM Mestre e OPS não validam, não alimentam e não bloqueiam.
Premissas: a taxonomia que governa é CA-. PP-01–PP-09, PP-01–PP-08, PP-01–PP-14, P01–P09, Top 10/Top 30 e produto-mãe não governam.
Limites: não apagar histórico. Não inventar equivalência entre famílias CA- concorrentes. Não gravar código PP novo.
Substitui: a postura documental da revisão de prompts de 08/10/2026.
Critério de aceite: seção 4.

## 1. Regra executável

Produto, jornada e preço usam a família CA- somente como identificação rastreável do Clube Ancestral. O código não decide elegibilidade, avanço, homologação ou preço.

Rejeitar como governança:

- PP-01–PP-09, PP-01–PP-08 e PP-01–PP-14;
- P01–P09 e qualquer produto-pai inventado por analogia;
- SKU, Planilha Mestre, CRM Mestre e Painel Mestre OPS, inclusive como fallback.

Famílias CA- concorrentes continuam sem fusão automática. CA-PROT/CA-POS não são sinônimo de CA-CID/CA-HIST/CA-FAM/CA-WPP. CA-MEM-002 não pode ser reinterpretado.

## 2. O que está em execução e o que não foi alterado agora

Publicar este prompt em main é a primeira ação. Não substitui o motor.

Não alterar nesta publicação, porque o texto integral não foi recuperado e uma substituição parcial quebraria main:

- src/lib/planejador-produtos-pai.ts
- src/lib/planejador-produtos-pai.functions.ts
- src/lib/sku-produto-pai.ts
- src/lib/sku-produto-pai.functions.ts
- src/components/catalogo/de-para-sku-produto-pai.tsx
- case_plans.produto_pai_id e o CHECK PP-01–PP-09

Esses pontos hoje ainda executam PP. A próxima alteração de código precisa ler o arquivo inteiro, manter os testes e trocar a governança sem migração cega dos casos existentes.

## 3. Ordem de execução seguinte

1. Ler os arquivos listados na seção 2 por completo.
2. Impedir nova gravação de PP como taxonomia vigente.
3. Manter leitura dos valores PP já persistidos apenas como histórico, sem usá-los para validar jornada ou preço.
4. Remover bloqueio cujo único motivo seja ausência de SKU, produto-pai PP ou linha da Planilha Mestre.
5. Não consultar Mestre, CRM Mestre ou OPS em runtime.
6. Não preencher preço ausente com zero nem copiar preço de outro país ou caso.
7. Rodar os testes do Planejador, catálogo e jornada antes de considerar a execução concluída.

## 4. Aceite

- Main contém este prompt de execução.
- Nenhum caso existente perde rota, preço ou jornada por esta publicação.
- A próxima mudança funcional deixa de tratar PP como taxonomia vigente.
- CA- permanece identificador, não validador.
