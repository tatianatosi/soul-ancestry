-- Expande a árvore do App Cliente de 5 para 10 gerações (05/10/2026).
--
-- Autorização explícita da Proprietária: "expandir a arvore até a 10a
-- geração" — decisão de produto, depois de medir que o caso-piloto tem
-- ascendentes documentados em geração 6 e 7 (Rudolf Friedmann, Heinrich
-- Friedmann) que o modelo de 5 gerações não comportava.
--
-- Aditivo: só amplia o intervalo aceito, nenhuma linha existente fica
-- inválida (1-5 é subconjunto de 1-10).

alter table public.app_projections drop constraint app_proj_geracao_cliente_ck;
alter table public.app_projections
  add constraint app_proj_geracao_cliente_ck
  check (geracao_cliente is null or (geracao_cliente >= 1 and geracao_cliente <= 10));
