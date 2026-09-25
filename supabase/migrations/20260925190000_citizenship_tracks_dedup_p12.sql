-- Dedup de citizenship_tracks (P12, 25/09/2026) — achado crítico do P11:
-- para cada um de 10 países (Alemanha, Áustria, Croácia, Espanha, Hungria,
-- Itália, Luxemburgo, Multipaís, Polônia, Portugal, Romênia) existiam 3
-- linhas `TRK-<CODE>` idênticas (criadas em 21/08/2026), das quais só UMA
-- tinha `versioned_legal_rules` de fato associada — as outras 2 eram
-- duplicatas sem regra jurídica, cada uma com seu próprio
-- `legal_reference_milestones` solto. Um par de tabelas separadas
-- (`TRILHA_<PAIS>`, 19/08/2026) já tinha sido arquivado antes, na
-- consolidação de 08/09/2026 registrada em
-- docs/arquitetura/2026-09-09_DE-PARA-PLANEJADOR-MARCOS-JURIDICOS-CRM-VIVO-vs-PRECOS-RESGATADOS.md.
--
-- Critério de dedup: mantém ativa a única linha `TRK-<CODE>` com
-- `versioned_legal_rules` associada (Multipaís não tem nenhuma regra —
-- mantida por ausência de qualquer referência real, nenhum caso aponta
-- para Multipaís hoje). Arquiva as demais via `archived_at`/`archive_motivo`
-- (nunca DELETE — histórico preservado). `where archived_at is null` torna
-- a migration idempotente mesmo já tendo sido aplicada manualmente em
-- 25/09/2026 antes deste arquivo existir.
--
-- Documentação completa: docs/arquitetura/2026-09-25_dedup-trilhas-motor-juridico-paises-baixos.md
update public.citizenship_tracks
set archived_at = now(),
    archive_motivo = 'Dedup P12 (25/09/2026): duplicata de trilha para o mesmo país — mantida a única linha com regra/marco jurídico real associado. Ver docs/arquitetura/2026-09-25_dedup-trilhas-motor-juridico-paises-baixos.md'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and archived_at is null
  and id in (
    '2352b45e-e4a9-45c7-afc4-62444bf3d0b4', 'bc22d1ea-bc37-4e2a-9989-d4d4dc845114', -- Alemanha (TRK-DE-REPARACAO, duplicatas)
    'e4b50f93-beee-4a87-b1cc-bc4a03316d17', 'ce2e3ded-7813-4a07-8fe0-71f307b8c9a1', -- Áustria (TRK-AT-58C, duplicatas)
    '821d9efa-c309-47f9-999a-b3e3f6c62605', '27cff6f4-8adc-4081-b241-4dcb204a1e52', -- Croácia (TRK-HR-DESC, duplicatas)
    '542d891f-28e1-43b6-882d-726f2ca4f9b5', '8ef891a1-15cf-4ca1-9f47-3f5ed95e93a4', -- Espanha (TRK-ES-MEMORIA, duplicatas)
    'c47883d5-10ac-442b-85c9-74e10c121ba2', 'bdd8cf5b-e055-4ab1-8ae2-4230a73601db', -- Hungria (TRK-HU-SIMPL, duplicatas)
    '78520c70-b0dc-4396-a1a1-2cef8b848c36', 'fce96bf9-5052-4cee-b00a-3bdce47e1d7c', -- Itália (TRK-IT-DESC, duplicatas)
    '36c5f503-5d06-46fe-99d3-16d1a3aeec80', 'd4f33f01-155f-49ea-8e7f-81948635c66a', -- Luxemburgo (TRK-LU-REC, duplicatas)
    '5123e6b9-9fb4-42c1-8dfe-01243dac490b', '01e0fd85-afe7-4131-8fb0-4008595f5046', -- Multipaís (TRK-MULTI, duplicatas)
    'b3fa6cb4-4b0a-41f9-830d-827dfa501132', 'b7bd23f7-e987-43c3-af94-7d9d45920280', -- Polônia (TRK-PL-CONF, duplicatas)
    'beab4675-cd4c-44c8-ba60-f2877277904f', '52cd1f3a-712d-4913-98ab-48bbb908ab50', -- Portugal (TRK-PT-DESC, duplicatas)
    'cec1a5ba-fab4-4264-9884-7f424d11febf', 'b335dbc6-576b-47c9-9ab7-09f48570e06d'  -- Romênia (TRK-RO-DESC, duplicatas)
  );

-- Ana Luiza (CA-CID-AT-FAM-2026-001) tinha duas referências divergentes:
-- `crm_casos.citizenship_track_id` ainda apontava para a trilha antiga
-- TRILHA_AUSTRIA (arquivada em 08/09/2026), enquanto
-- `case_services.citizenship_track_id` já apontava para a trilha canônica
-- TRK-AT-58C (a mesma mantida ativa acima). Realinha para a canônica.
update public.crm_casos
set citizenship_track_id = 'adc77966-0aaf-44f0-a822-94bbba326903'
where id = 'a11a0000-0000-4000-8000-000000000002'
  and citizenship_track_id = 'bffdfb48-d22a-4c33-8011-f3c8e96a6e6a';
