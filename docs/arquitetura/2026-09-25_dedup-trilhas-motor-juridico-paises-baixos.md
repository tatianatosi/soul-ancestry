# P12 — Dedup de `citizenship_tracks`, países novos (NL/EE/LV/LT) e motor jurídico × jornada (2026-09-25)

```yaml
status: executado
responsável pela decisão: Proprietária do Clube Ancestral
fontes:
  - docs/arquitetura/contexto-motor-cidadania-v1.0.md (02/09/2026)
  - docs/arquitetura/2026-09-25_marcos-juridicos-paises-novos-e-achados-criticos.md (P11)
  - schema real do Supabase (projeto 1a628b61-ec68-454f-85e1-671d6f297370), consultado ao vivo em 25/09/2026
pedido literal da Proprietária (25/09/2026): "Pode adicionar os novos países entre eles os
  Países Baixos, pode verificar os dedup e construa e execute o raciocínio do motor jurídico
  não necessariamente precisa ter Score pois é algo interno, quando me referi a contexto leia
  novamente o material do planejador de cidadania lá traz o contexto jurídico de cada país em
  conjunto com a sua jornada"
```

## 1. Dedup de `citizenship_tracks` (achado do P11, resolvido aqui)

O P11 encontrou duplicação sistêmica: para 10 países (Alemanha, Áustria, Croácia, Espanha,
Hungria, Itália, Luxemburgo, Multipaís, Polônia, Portugal, Romênia) existiam 3 linhas
`TRK-<CODE>` idênticas (criadas em 21/08/2026), das quais só **uma** tinha
`versioned_legal_rules` de fato associada — as outras 2 eram duplicatas sem regra jurídica,
cada uma com seu próprio `legal_reference_milestones` solto e sem nenhuma referência real de
caso apontando para elas. Um segundo par de linhas antigas (`TRILHA_<PAIS>`, 19/08/2026) já
tinha sido arquivado antes, na consolidação de 08/09/2026 (11 linhas, ver
`docs/arquitetura/2026-09-09_DE-PARA-PLANEJADOR-MARCOS-JURIDICOS-CRM-VIVO-vs-PRECOS-RESGATADOS.md`).

**Achado adicional confirmado nesta rodada**: o próprio caso-piloto real (Ana Luiza,
`CA-CID-AT-FAM-2026-001`) tinha duas referências divergentes — `crm_casos.citizenship_track_id`
ainda apontava para a trilha antiga `TRILHA_AUSTRIA` (já arquivada em 08/09/2026), enquanto
`case_services.citizenship_track_id` já apontava corretamente para a trilha canônica
`TRK-AT-58C` (a única com regra jurídica real associada). Ou seja, um caso real e vivo tinha um
ponteiro para uma linha já morta.

### Critério de dedup (sem ambiguidade, verificado por leitura direta)

Mantida ativa, por país, a única linha `TRK-<CODE>` com `versioned_legal_rules` associada.
Arquivadas as demais (22 linhas) via `archived_at`/`archive_motivo` — nunca `DELETE`, histórico
preservado. Multipaís não tem nenhuma regra associada em nenhuma das 3 linhas; mantida a
primeira (`TRK-MULTI`, `86f647fa-74be-47f6-9fb6-406629270ea7`) por ausência de qualquer sinal
de uso real (nenhum caso referencia Multipaís hoje).

### Resultado verificado após a migration

Consulta `select pais, count(*) from citizenship_tracks where archived_at is null group by pais`
confirma **exatamente 1 linha ativa por país** — 15 países no total (11 do lote de 19-21/08 +
Brasil/"Em investigação", que nunca tiveram duplicata, + Tchéquia/Eslovênia do P11). A referência
de Ana Luiza foi corrigida: `crm_casos.citizenship_track_id` e `case_services.citizenship_track_id`
agora apontam para a mesma linha canônica (`adc77966-0aaf-44f0-a822-94bbba326903`, `TRK-AT-58C`).

Migration: `supabase/migrations/20260925190000_citizenship_tracks_dedup_p12.sql`.

## 2. Países novos — Países Baixos (NL), Estônia (EE), Letônia (LV), Lituânia (LT)

Fonte: `contexto-motor-cidadania-v1.0.md`, seções "Países Baixos" e "Bálticos", e o YAML de
pré-carga (seção "Pré-carga"):

```yaml
legal_research_pilot: [NL, EE, LV, LT]
detection_only: [BE, SK, UA, BG, RS, MD]
```

**Decisão de escopo, não fabricada**: o próprio documento-fonte separa NL/EE/LV/LT
("Piloto jurídico interno", tabela "Expansão controlada") de **Bélgica** ("Detecção de
vínculo; backlog jurídico", mesmo nível do "Backlog oriental" — SK/UA/BG/RS/MD,
`PESQUISA_JURIDICA_PENDENTE`, "sem resultado ou preço"). Construir uma trilha com conteúdo
jurídico para a Bélgica agora contrariaria a própria cautela do documento — por isso **não**
foi criada. Se algum dia isso mudar, é decisão de escopo da Proprietária, não inferência deste
corte.

Conteúdo transcrito literalmente das seções do documento (rotas, pergunta central, marco
histórico, prova prioritária, alerta) — nenhum dado jurídico inventado por analogia. Mesmo
padrão conservador do P11 (Tchéquia/Eslovênia): `lifecycle_status='em_revisao'`,
`legal_reference_label`/`official_source_name` = "a homologar",
`legal_reference_summary` = "Não ofertar como rota concluída sem revisão jurídica."

| Código | País | Via preliminar | Fonte (seção do documento) |
|---|---|---|---|
| `TRK-NL-FILIACAO` | Países Baixos | nascimento/filiação; reconhecimento; adoção; opção; naturalização; recuperação | "Países Baixos" |
| `TRK-EE-DESC` | Estônia | nascimento; restauração de perda na menoridade; naturalização | "Bálticos" |
| `TRK-LV-DESC` | Letônia | descendente; exilado; letões/lívios; naturalização | "Bálticos" |
| `TRK-LT-RESTAURACAO` | Lituânia | restauração; origem; simplificada/geral | "Bálticos" |

Migration: `supabase/migrations/20260925180000_citizenship_tracks_paises_baixos_balticos.sql`
(4 trilhas + 4 `versioned_legal_rules` + 4 `legal_reference_milestones`, todas idempotentes).

## 3. Motor jurídico — raciocínio explicável por fase da jornada

A Proprietária esclareceu explicitamente o que faltava: **não** um score/percentual (é
raciocínio interno), e "contexto" significa reler o material do planejador de cidadania onde
o contexto jurídico de cada país aparece **em conjunto com a sua jornada** — ou seja, conectar
o conteúdo legal já registrado por trilha (`versioned_legal_rules`/`legal_reference_milestones`)
à fase real da jornada do caso (`case_plans.fase_jornada`), não apenas listar fatos jurídicos
isolados por país.

### Por que estender, não recriar

`avaliarValidacaoJuridicaCaso` (`src/lib/validacao-juridica-caso.ts`, CA08-JURIDICO-PROPORCIONAL,
09/09/2026) já é o motor real: lê trilha/marcos/regras/temas contratuais/representação de menor
e devolve pendências com "ato formal afetado" (`assinatura`, `envio_formal`, `protocolo`,
`publicacao_juridica`, `acesso_sensivel_menor`) — nunca um veredito de elegibilidade. Faltava
só a dimensão de **fase da jornada**: o mesmo conjunto de pendências, mas organizado pelo que
a fase atual do caso realmente pede, com o foco jurídico típico dessa fase citado à fonte.

### Novo módulo: `src/lib/raciocinio-juridico-jornada.ts`

Função pura `raciocinarJuridicoPorFase({ faseJornada, validacao, alertaInternoPais })`:

- **Nunca recalcula pendências** — recebe o resultado já produzido por
  `avaliarValidacaoJuridicaCaso` e apenas reorganiza.
- **Nunca calcula placar/percentual/veredito** — o próprio documento-fonte proíbe "percentual
  de chance jurídica" (seção "Estados").
- `ATOS_PREDOMINANTES_POR_FASE`: mapeia cada uma das 8 fases canônicas
  (`case_plans.fase_jornada`, `FASES_JORNADA` de `onboarding-jornada.ts`) ao(s) ato(s) formal(is)
  predominante(s) esperado(s) nessa fase — reaproveita o vocabulário já existente de
  `AtoFormal`, nenhuma taxonomia nova.
- `FOCO_JURIDICO_POR_FASE`: uma frase fixa por fase, transcrita das seções "Regras de execução"
  (itens 1–11), "Painel do caso" e "Registro jurídico" do documento-fonte, com a fonte citada —
  descreve o que a fase pede verificar, nunca conclui elegibilidade.
- `alertaInternoPais`: o texto já registrado em `citizenship_tracks.riscos_internos` (o mesmo
  conteúdo transcrito nas migrations de P11/P12), exibido como está — nunca combinado num
  indicador único com as pendências.

### Ligação ao servidor e à tela

`src/lib/crm-desk.functions.ts#validacaoJuridicaCaso` (GET, mesma função já usada por Caso 360)
passou a também ler `case_plans.fase_jornada` (última linha não arquivada do caso) e devolve
`raciocinioFase` junto ao resultado de sempre — mesma leitura, nenhuma tabela nova, nenhuma
segunda função a manter em Mesa Discovery ou em outro lugar por ora.

`src/routes/_authenticated/casos.$caseId.index.tsx`, seção "Validação jurídica deste caso":
novo bloco "Contexto jurídico × jornada" mostra a fase atual, o foco jurídico dessa fase (com
fonte), o alerta interno do país (quando houver), quantas pendências afetam o ato formal típico
desta fase, e quantas pertencem a outras fases (não bloqueiam a fase atual, mas seguem em
aberto). Nenhuma tela nova — mesma seção que já existia, mesma decisão do P11/P7 de não criar
um painel "Cadeia Caso 360" sem especificação canônica.

## 4. Não fazer sem decisão adicional

- Não criar trilha de Bélgica (`detection_only`, mesmo nível do backlog oriental).
- Não expandir o backlog oriental (SK/UA/BG/RS/MD) — o próprio documento marca
  `PESQUISA_JURIDICA_PENDENTE, sem resultado ou preço`.
- Não introduzir score/percentual/veredito de elegibilidade em nenhuma camada — proibição
  explícita do documento-fonte e da Proprietária.
- Não construir um painel jurídico dedicado novo (Radar, Matriz de transmissão, Comparador) —
  mesma decisão do P11: sem especificação canônica que autorize, seria repetir o "dump de
  legado" que o reset está corrigindo.

## Verificação

`tsc --noEmit` (limpo, só o erro pré-existente de `portal/index.tsx`), testes novos
(`p12-raciocinio-juridico-jornada-2026-09-25.test.ts`: cobertura das 8 fases, fonte citada em
cada foco, separação de pendências por fase, fase desconhecida/drift nunca inventa foco, alerta
do país repassado sem recombinação, trilhas novas criadas, Bélgica fora do escopo), suíte
completa (baseline idêntica — 7 arquivos/11 testes pré-existentes, todos visuais/portal, sem
relação com este corte), `vite build` limpo. Migrations aplicadas ao banco real e registradas em
`schema_migrations`.

## Prova Lovable pós-push

Abrir Caso 360 de um caso com trilha jurídica vinculada (ex.: Ana Luiza, Áustria) → seção
"Validação jurídica deste caso" → conferir o novo bloco "Contexto jurídico × jornada" mostrando
a fase atual do Planejador, o foco jurídico dessa fase e a fonte citada → se o caso tiver
`case_plans.fase_jornada` vazio, conferir a mensagem explícita "Sem fase da jornada registrada".
Abrir `/casos` ou o catálogo de trilhas e confirmar que Países Baixos, Estônia, Letônia e
Lituânia aparecem como trilhas `em_revisao`, sem preço, sem afirmação de fonte homologada.
