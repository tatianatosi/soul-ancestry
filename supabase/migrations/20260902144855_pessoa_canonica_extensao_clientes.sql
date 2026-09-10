-- Pessoa Canônica — extensão de `clientes` (decisão da proprietária, 02/09/2026:
-- extender clientes em vez de criar tabela pessoas_canonicas nova).
-- Modelo de campos: docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md.
-- Todas as colunas são nullable e aditivas: nenhum dado existente é alterado
-- ou perdido, nenhuma coluna existente (documento, pais_interesse etc.) é
-- removida ou renomeada.

alter table public.clientes
  -- 3.1 Identificação
  add column if not exists sexo text check (sexo in ('feminino','masculino','nao_informado')),
  add column if not exists nacionalidade text default 'brasileira',
  add column if not exists profissao text,
  add column if not exists cpf text,
  add column if not exists rg_numero text,
  add column if not exists rg_orgao_uf text,

  -- 3.3 Endereço completo estruturado
  add column if not exists endereco_logradouro text,
  add column if not exists endereco_numero text,
  add column if not exists endereco_complemento text,
  add column if not exists endereco_bairro text,
  add column if not exists endereco_cidade text,
  add column if not exists endereco_uf text check (
    endereco_uf is null or endereco_uf in (
      'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
      'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
    )
  ),
  add column if not exists endereco_cep text,
  add column if not exists endereco_pais text default 'Brasil',

  -- 3.4 Estado civil, cônjuge e procuração
  add column if not exists estado_civil text check (
    estado_civil in ('solteiro','casado','divorciado','viuvo','uniao_estavel')
  ),
  add column if not exists nome_conjuge text,
  add column if not exists procurador_cliente_id uuid references public.clientes(id),
  add column if not exists procurador_escopo text,

  -- 3.5 Dados do RG / nascimento
  add column if not exists data_nascimento date,
  add column if not exists nome_pai text,
  add column if not exists nome_mae text,
  add column if not exists cidade_nascimento text;

comment on column public.clientes.sexo is 'Pessoa Canônica — necessário para concordância em documentos legais gerados.';
comment on column public.clientes.procurador_cliente_id is 'Pessoa Canônica — referencia outra linha de clientes que representa esta pessoa por procuração.';
comment on column public.clientes.cpf is 'Pessoa Canônica — campo próprio, distinto do texto livre em `documento` (mantido por compatibilidade com dados já existentes).';
