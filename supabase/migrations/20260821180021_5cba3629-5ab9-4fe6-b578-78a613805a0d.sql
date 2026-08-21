-- Deny-by-default explícito nos buckets privados (contracts, pesquisa, documentos).
-- Todo acesso a arquivos deve passar pelas funções de servidor que emitem URLs assinadas.
do $$
declare b text;
begin
  foreach b in array array['contracts','pesquisa','documentos'] loop
    execute format($f$
      drop policy if exists %I on storage.objects;
      create policy %I on storage.objects
        as restrictive
        for all
        to authenticated, anon
        using (bucket_id <> %L)
        with check (bucket_id <> %L);
    $f$, 'ca_bloqueio_'||b, 'ca_bloqueio_'||b, b, b);
  end loop;
end $$;