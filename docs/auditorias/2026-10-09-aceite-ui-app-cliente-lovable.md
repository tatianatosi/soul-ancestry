# Checklist de homologação — App Cliente no Lovable

Status: executado parcialmente — não aprovado
Versão: v1.0
Data/hora UTC da execução: 2026-10-11
Responsável pela execução: Lovable, em sessão administrativa autorizada da Proprietária
Escopo executado neste corte: Radar, Árvore e Conta do App Cliente. Desk preservado.
Sessão/caso: visualização administrativa autorizada do caso CA-CID-AT-FAM-2026-001, sem segredo ou token no artefato.
Banco conectado: Lovable Cloud do projeto.

## 1. Referências e contenção

- [x] R01: referências do App mantidas separadas do Desk.
- [x] R02: tokens locais canônicos preservados; Radar usa Ouro Nobre.
- [x] R03: nenhuma imagem substituta nova.
- [x] R04: nenhuma alteração em tema global ou estilo do Desk.
- [x] R05: capturas usam a mesma sessão e o mesmo caso.
- [x] R06: não houve SQL, migration, RLS, escrita ou publicação de conteúdo.

## 2. Resultado por aba neste corte

| ID | Aba | Resultado | Evidência |
|---|---|---|---|
| A01 | Home | não executado neste corte | — |
| A02 | Jornada | não executado neste corte | — |
| A03 | Radar | parcial | `radar-375.png`, `radar-1280.png` |
| A04 | Árvore | parcial | `arvore-375.png`, `arvore-1280.png` |
| A05 | Documentos | não executado neste corte | — |
| A06 | Legado | não executado neste corte | — |
| A07 | Conta | parcial | `conta-375.png`, `conta-1280.png` |

## 3. Verificações específicas

- RA01 — passou com ressalva: Ouro Nobre aplicado apenas nos eixos com base real; Documentação, Memória e Legado permanecem como `Lacuna`, nunca zero.
- AR01 — passou para os dados disponíveis: seis pessoas reais permanecem agrupadas em G3–G7; o genograma ilustrativo foi removido; nenhuma linha foi inferida porque não há relação publicada.
- C01 — parcial: a condição de R$ 320,00/mês por 10 meses aparece como `prevista` e `aguardando confirmação`. Nenhum link Asaas foi exibido porque não há cobrança individual confirmada vinculada.

## 4. Transversais executados

- T01 — parcial: seis capturas autenticadas registradas, em 375 e 1280 px.
- T02 — passou nas superfícies verificadas: lacunas continuam explícitas.
- T03 — passou visualmente nas seis capturas; nenhuma ação observada ficou exclusiva do desktop.
- T04 — parcial: 375 e 1280 verificados; 320/768/1440 continuam não executados.
- T05 — passou visualmente em 375 px: último conteúdo permanece acima da navegação fixa.
- T06 — não executado.
- T07 — não executado por medição automatizada.
- T08 — passou no Radar: `Lacuna` e percentuais acompanham a cor.
- T09 — não aplicável neste corte.
- T10 — não executado.
- T11 — 39 testes relevantes passaram; build mais recente OK.
- T12 — não executado; as capturas usam somente o caso autorizado.

## 5. Não regressão no Desk

- ND01–ND05 — preservado por contenção: nenhum arquivo do Desk ficou alterado neste corte. Não foi feita nova auditoria visual do Desk.

## 6. Bloqueios e decisão

- Não existe cobrança individual confirmada nem link Asaas comprovado para renderizar.
- Não existem relações publicadas entre as seis pessoas; linhas de parentesco não podem ser criadas por inferência.
- O checklist integral das sete abas permanece incompleto porque este corte validou somente Radar, Árvore e Conta.
- A proposta `client_tab_dwell_events` não foi aplicada; migration, RLS e retenção exigem autorização e revisão próprias.

Decisão: pendente / não aprovado.
Publicação: não autorizada e não realizada.
