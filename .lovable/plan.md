# Taxonomia canônica como camada do Design System — fase de leitura

Documentação apenas. Nenhuma tabela, migration, writer, backfill, fusão de pessoas, publicação, convite, link, contrato ou dado novo. Nenhum componente, token ou tela alterada.

## O que já existe (verificado)

- As entidades citadas existem hoje: `leads`, `contacts`, `clientes`, `case_members`, `nucleo_membros`, `research_people`, `genealogical_person_profiles`, `contract_parties`, `authorized_portal_emails`, `client_portal_access`, `client_portal_case_access`, `crm_casos`.
- Máscaras e validadores reutilizáveis já existem em `src/lib/validacao-pessoa.ts` (CPF com dígito verificador, CEP, UF contra as 27 siglas, telefone Brasil/exterior) e o mascaramento de auditoria em `src/lib/persistencia-mascara.ts`. A documentação vai apontar para esses módulos como fonte única, em vez de propor novos.
- Já há material anterior de pessoa canônica em `docs/arquitetura/` e `docs/politicas/`. Os novos documentos consolidam e referenciam esse histórico, sem duplicar nem revogar.
- `docs/design-system/` hoje tem README, tokens, componentes e regras de uso. Os quatro novos arquivos entram como camada adicional.

## Arquivos a criar (somente estes)

```text
docs/design-system/taxonomia-canonica.md
docs/design-system/mascaras-e-validadores.md
docs/design-system/visibilidade-e-sanitizacao.md
docs/design-system/de-para-pessoa-unificada.md
```

O `README.md` do Design System ganha apenas as quatro linhas de índice apontando para eles.

## Conteúdo de cada documento

### taxonomia-canonica.md
O ciclo único de identidade: Lead → Contato/Pessoa → Cliente → Caso → Núcleo → Ficha Piloto → Pesquisa Genealógica → Pessoa 360 → Documentos → Proposta/Canva → Contrato/Anexos → Assinatura → Financeiro → Portal/App. Para cada etapa: entidade real de hoje, o que cria, o que só lê, e como a identidade se preserva na passagem. Inclui as regras fixas: pessoa existe antes de elegibilidade; elegibilidade pertence à oportunidade/caso; nome nunca funde registros; e-mail e telefone apenas sugerem revisão humana; ficha piloto e pesquisa genealógica não são formulários concorrentes; pesquisa não sobrescreve cadastro civil sem decisão humana.

### mascaras-e-validadores.md
Matriz por campo: campo → máscara/validador → entidade dona → espelhos permitidos → origem → regra de atualização → visibilidade → telas → duplicidades → ação futura. Cobre nome civil/social/nascimento/variantes; e-mail, telefone, DDD e WhatsApp; CPF, RG, órgão e UF; CEP e endereço; nascimento, local e precisão; nacionalidade, profissão e estado civil; papel familiar, contratual e de acesso; consentimentos; identificadores de pessoa, lead, cliente, caso, pesquisa, contrato e portal; URL do Canva e dados técnicos de acesso como campos internos protegidos. Regra fixada: máscara se reutiliza dos módulos existentes, nunca se recria por formulário.

### visibilidade-e-sanitizacao.md
O que nunca chega ao App: dado sensível, hipótese, evidência bruta, token, nome de SKU, preço técnico e gates. Níveis de visibilidade em uso (interna, sanitizada, aprovada) e o que cada superfície pode mostrar. Árvore recebe somente relações aprovadas/publicadas. Campos internos protegidos listados um a um.

### de-para-pessoa-unificada.md
De-para entre Ficha Piloto e Ficha de Pesquisa Genealógica: o que cada uma cria e lê, campos sobrepostos, campo dono de cada sobreposição, e o fluxo de promoção — informação compartilhada → pesquisa → evidência → revisão → achado → projeção sanitizada — com o que explicitamente não flui automaticamente. Fecha com: proposta de fonte canônica por campo, regras de precedência, plano de migração futura sem perda de histórico (só desenho, nada executado) e a lista de arquivos e tabelas que exigiriam mudança numa fase futura.

## Fora de escopo nesta fase

Nenhuma tabela nova de pessoa, nenhum merge, nenhum writer, nenhum componente novo, nenhuma alteração de dado, RLS, acesso, contrato, financeiro ou publicação. A prioridade seguinte continua sendo o P0 de acesso.

## Entrega

Os quatro documentos, a matriz, a proposta de fonte canônica por campo, as regras de precedência e visibilidade, o plano de migração futura e a lista de arquivos/tabelas afetados numa fase futura — e então parada para sua aprovação, sem commit nem push por iniciativa própria.
