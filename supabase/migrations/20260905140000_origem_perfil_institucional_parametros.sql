-- Adiciona "perfil_institucional" às origens válidas de contract_parameter_values.
-- Necessário para a qualificação completa da contratada (razão empresarial,
-- CNPJ, endereço, representante legal) ser rastreada com a fonte real —
-- o perfil institucional vigente do Clube Ancestral — em vez de aparecer
-- como "preenchimento_humano" (texto digitado à mão, incompleto).
alter table public.contract_parameter_values
  drop constraint if exists contract_parameter_values_origem_check;

alter table public.contract_parameter_values
  add constraint contract_parameter_values_origem_check
  check (origem = any (array[
    'perfil_institucional', 'planejador', 'crm', 'proposta', 'formulario',
    'whatsapp', 'transcricao', 'documento', 'preenchimento_humano', 'calculo_aprovado'
  ]::text[]));
