create or replace function public.fn_block_delete()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'Exclusão física não permitida em %. Use arquivamento (archived_at, archived_by, archive_motivo).', TG_TABLE_NAME;
end $$;
revoke all on function public.fn_block_delete() from public, anon, authenticated;