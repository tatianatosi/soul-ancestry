# L00 v2 — resultado documental e L01 v1 — proposta mínima

Data: 18/10/2026. Ambiente: checkout local Lovable.
Branch de inspeção: edit/edt-c7c2093f-1c72-4448-8233-384ffc63ffea.
SHA-base lido: 78db7099fab1961f22906ae29608e1b2f7c08af1. Nenhum SHA de publicação atestado.

## Autoridade e escopo
Documento da Proprietária preservado como proposta v1.0 em `2026-10-18-cortes-lovable-desk-v4-crm-dicionario.md`; seus estados originais não foram silenciosamente alterados. Este relatório registra a execução documental posterior. Nada de L01–L12 implementado. Nenhuma mudança em src, banco, acesso ou menu.

## L00 — diff documental
- Mapa de rotas v2: /crm-mestre identificado como Dicionário CA04; /leads como CRM Vivo; /calls como Mesa. Números históricos não são contadores; Operação/Exceções não são candidatos automáticos a arquivo; GoLive interno não implica retirar acesso.
- Mapa de canos v2: setas identificadas como proposta, não integração; referência, opções e regras distinguidas. O original não tinha o erro de nome CRM Mestre, mas continha afirmações de conexão não comprovadas.
- Cobertura rodada 2 v2: separação entre ficha operacional, Mesa e dois dicionários; 90 padrões de URL + layout.
- Três PDFs v2: errata vigente na primeira página; páginas originais preservadas integralmente como anexo histórico. Não se trata de reedição interna de cada título/rodapé original. Não declarar todos os materiais históricos corrigidos fisicamente.
- v3 original: 18 páginas confirmadas por extração. Preservadas ressalvas de recorte, lógica/visual e preparador que pode gravar.

## Conferência no código corrente (somente leitura)
- `src/routes/_authenticated/crm-mestre.tsx:6–28`: CA04 interno somente leitura, listas/regras estáticas.
- `src/routes/_authenticated/leads.tsx:73–101`: leitores e gravador da ficha operacional.
- `src/components/crm/painel-calls.tsx:270–272`: mesmos leitores/gravador do lead; Mesa em /calls.
- `src/lib/crm-desk.functions.ts:69–79,236–248,294–301`: persistência em leads identificada, não exercitada.
- Contagem independente do agente: 91 arquivos autenticados .tsx = 90 padrões de URL + layout; conferida com registro gerado. Não é total de URLs concretas de casos dinâmicos nem de telas distintas.

## L01 v1 — proposta mínima, NÃO aplicada
Rota: /biblioteca. Arquivo candidato: `src/routes/_authenticated/biblioteca.tsx:192`.

```diff
- { label: "Trilhas Jurídicas", descricao: "Regras versionadas", chave: "juridico", Icone: Scale },
+ { label: "Regras jurídicas versionadas", descricao: "Regras versionadas", chave: "juridico", Icone: Scale },
```

Motivo: a entrada atual abre `juridico` (regras jurídicas), não `trilhas` (trilhas de cidadania). Corrigir o nome é a menor intervenção; mudar o destino exigiria decisão diferente.

Referências mantém `acervo`: fonte compartilhada já declarada nas linhas 194 e 236–237; não há evidência para mudar o destino. Abertura é seleção local, não navegação para outra rota (197–201,220–225). Não afirmar preservação após recarga: estado local ainda precisa conferência e eventual subcorte aprovado.

Dez subáreas registradas: acervo, bases, dicionarios, trilhas, juridico, governanca, modelos, top30, mapas, arquivo (`src/lib/biblioteca-mestre.ts:6–16,30–104`). Nove seletores visíveis: `top30` é filtrado por `naFace:false` (`biblioteca.tsx:311`). Expor índice de dez com seus destinos e contexto é complemento de L01 ainda não implementado nem coberto pelo diff de uma linha. Não tornar Top30 operação central.

Fontes identificadas: master_library_items, genealogical_sources_catalog, controlled_taxonomies, citizenship_tracks, versioned_legal_rules (`biblioteca-mestre.functions.ts:103–137`). Consumidores localizados em cadeia-caso-360.functions.ts:69–85, cadeia-formalizacao.server.ts:94–102 e pesquisa/referencias-normativas.tsx:190–200. Localização não certifica resultado em uso.

## Checklist separado
| Item | Estado |
|---|---|
| Documento da Proprietária registrado | Documentado |
| L00 mapas/cobertura v2 | Retificação documental feita |
| PDFs | Errata vigente anexada; originais históricos preservados |
| L01 diff mínimo e dependências | Proposto; aguardando aprovação específica |
| L01 índice dez subáreas/contexto/recarga | Não executado; requer desenho/diff específico aprovado |
| L01 implementado/integrado | Não |
| Produto publicado | Não |
| Comprovado em uso | Não |
| Writers, banco ativo, sessão autenticada | Não exercitados |
| Capturas UI antes/depois 375/1280 | Não executadas; nenhuma UI alterada |
| Testes técnicos/typecheck/build | Não executados manualmente; corte documental, sem mudança de código |
| Validação documental | Conteúdo original dos PDFs comparado página a página; todas as páginas rasterizadas e inspecionadas; errata legível sem corte |
| Drive/GitHub | Não enviado/publicado |

## Próxima saída concreta
Aprovação específica de L01 antes de editar Biblioteca. Confirmar responsável se Claude trabalha no arquivo. Depois: diff mínimo do índice/contexto, testes dos destinos selecionados e recarga, capturas 375/1280 com ambiente/SHA. L02 depende de rastreio por vínculo; L03–L12 não autorizados. App permanece congelado; 14 itens reservados.
