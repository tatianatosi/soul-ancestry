# Verificação focal — Árvore e genograma

Status: candidata em revisão, sem publicação. Data: 27/10/2026.

## Correções
- Rota remove apenas o filtro visual `geracao <= 10`. O leitor de pessoas aceita inteiros publicados >= 1. O validador de escrita e CHECK histórico continuam 1–10: não houve migration e não se afirma publicação ilimitada no banco.
- Destaque usa par autorizado de identidade do caso Ana e UUID da pessoa Otto já publicada. Não usa nome, idade ou maior geração. Não representa a âncora G1: esta permanece Ana.
- Abrir e restaurar usam a mesma função com margem e centralização horizontal; foco individual e zoom manual continuam existentes.
- Nomes preservados em múltiplas linhas, com espaço vertical proporcional. União com nó interposto e filiação na mesma geração passam acima dos nós; saltos de geração usam corredor externo. Nenhum vínculo foi alterado.

## Evidências
- Original: `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf`, página **6/17**, “APP CLIENTE · 4/7”.
- Candidata: prévia administrativa oficial autenticada da Proprietária, caso Ana, 375 e 1280 px. Oito pessoas e **oito relações** persistidas/publicadas. A contagem antiga de treze incluía cinco caminhos SVG de ícones, não relações familiares.
- Restaurar após zoom/foco retorna à escala, rolagem e seleção iniciais nas duas larguras. Larguras dos nomes reais medidas no SVG <= 150 unidades; sem overflow horizontal da página.
- 18 testes passaram em três arquivos: genograma-focal-2026-10-27, portal-arvore-geracoes, corte-2a-arvore-nomes-familia-2026-09-28. Build automático OK.
- Nomes extremos e G11 testados isoladamente, sem inserir familiares nem modificar banco. Não se afirma prova visual para toda topologia possível.

## Comparação visual e limites
PDF entregue: `arvore-genograma-comparativo-2026-10-27.pdf` (duas páginas: 375/1280, original/antes/candidata).
Original tem nós retangulares e dados ilustrativos G1–G5; candidata preserva os círculos e relações explícitas da versão atual, conforme instrução focal posterior. Navy, ouro, creme, terracota e sete abas preservados, sem reaplicar cores.
Não é fidelidade integral homologada: diferenças de nós/escala/conteúdo são explícitas, sem inferir autorização do mockup. A janela da árvore tem rolagem interna; captura inicial não mostra simultaneamente todas as gerações.

## Arquivos do produto
- `src/routes/portal/arvore.tsx`
- `src/components/portal/genograma-familiar.tsx`
- `src/components/portal/genograma-layout.ts` (funções puras reutilizadas pelo componente)
- `src/lib/__tests__/genograma-focal-2026-10-27.test.ts`
- `AGENTS.md` e `roadmap.md` (regras e estado do corte)

Não houve publicação, alteração de permissões, parentesco, leitor servidor ou outras abas. Após aprovação/publicação, comportamento no Lovable publicado e acesso cliente independente permanecem verificações delimitadas pendentes.