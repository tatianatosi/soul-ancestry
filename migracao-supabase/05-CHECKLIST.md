# 05 — Checklist de migração (marque na ordem)

- [ ] 1. Projeto criado no Supabase da sua conta; anotados URL, chave `anon/publishable` e ref.
- [ ] 2. `SET session_replication_role = replica;` no SQL Editor.
- [ ] 3. `01-schema-public.sql` executado sem erro.
- [ ] 4. `02-dados-public.sql` executado sem erro.
- [ ] 5. `SET session_replication_role = DEFAULT;`
- [ ] 6. Conferência: `select count(*) from information_schema.tables where table_schema='public';` → ~183.
- [ ] 7. Conferência: `select count(*) from pg_policies where schemaname='public';` → ~523.
- [ ] 8. Usuários recriados e vinculados conforme `03-usuarios-e-acessos.md`.
- [ ] 9. Buckets criados conforme `04-buckets-storage.md`.
- [ ] 10. Auth configurado: e-mail/senha ligado, cadastro anônimo desligado, URLs de redirect do seu domínio.
- [ ] 11. Templates de e-mail e remetente reconfigurados (link mágico expira em 20 minutos; convite em 24h).
- [ ] 12. App reconfigurado (veja `06-reconfigurar-app.md`).
- [ ] 13. Login de `tati@pluggedresearch.com` testado no novo ambiente.
- [ ] 14. Um caso abre com dados visíveis (prova de que RLS e organização estão corretos).

## Verificações rápidas pós-carga

```sql
select count(*) from public.clientes;
select count(*) from public.crm_casos;
select count(*) from public.contracts;
select count(*) from public.product_catalog;
```

Compare com os números do projeto de origem antes de considerar a migração
concluída.
