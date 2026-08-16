insert into public.user_roles (user_id, role, organization_id)
values ('96bd97a7-b948-4c05-9d24-23dbbf8cb05a','admin','11f32aae-ea08-47e0-8114-f5d8a900c9a1')
on conflict do nothing;