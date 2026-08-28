# Adendo — Glossário oficial nas validações humanas

**Data:** 11/08/2026 · **Documento relacionado:** Pacote de Validações Humanas · **Fonte terminológica:** Glossário público do Clube Ancestral

## Proveniência

Colado no chat pela Proprietária, 24/08/2026. Mesma série do Bloco 5A/
Adendo de Correções/Piloto 5A.1 (também 11/08) — complementa a linguagem
de legado segura já registrada, com foco em vocabulário jurídico/técnico.

## Conteúdo (resumo)

- **Vocabulário oficial de 15 termos** (Jus Sanguinis, Jus Soli, Dante
  Causa, CNN, Inteiro Teor, Apostilamento de Haia, Tradução Juramentada,
  Via Administrativa/Judicial, Comune, AIRE, Decreto Tajani, Regra de
  1948, Vínculo Efetivo, Atribuição vs. Aquisição, Foreign Births
  Register, Voivoda) — cada um com uso autorizado e restrição de uso no
  caso individual (nunca antecipar conclusão sem validação documental).
- **10 substituições obrigatórias** de linguagem — ex.: "ancestral
  identificado" → "possível ascendente"; "elegível" → "em análise
  documental"; "tem direito à cidadania" → "não há conclusão sobre
  cidadania nesta etapa".
- **Regras por destino**: one-page/WhatsApp/App Cliente só podem usar
  termos como pendência/etapa aprovada, nunca como conclusão; Desk interno
  pode registrar todos os termos, mas sempre com país, estado de
  validação, evidência, responsável e data.
- Atualizações às decisões D-06 (termo técnico não eleva estado da
  evidência sozinho), D-07 (checklist de PDF) e D-11 (glossário público +
  taxonomia do Bloco 5A não substituem revisão humana/jurídica).
- Checklist de validação terminológica de 7 itens antes de liberar
  conteúdo externo.

## Cotejo com o código atual — CONFIRMADO, implementação fiel

`src/lib/glossario-oficial.ts` (230 linhas) implementa este adendo
**verbatim**: os 15 termos, as 10 substituições (inclusive a lista exata
"ancestral identificado" → "possível ascendente / referência familiar em
confirmação / ascendente validado por documento"), e a regra D-06 —
citada palavra por palavra no código, incluindo a lista de termos que não
elevam estado de evidência sozinhos.

Junta-se a CA-06, ao Dicionário de Validações Calls→CRM e à Arquitetura
do CRM Mestre como mais um módulo desta série de agosto (Bloco 5A e
adendos) que foi de fato construído fielmente, não apenas planejado.
