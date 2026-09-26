# Máscaras, validadores e matriz de campos

Camada do Design System. Documento de leitura. Não cria campo, tabela, migration
ou writer, e não altera nenhum formulário existente.

## 1. Regra central: máscara se reutiliza, não se recria

Os módulos abaixo **já existem e são a fonte única**. Nenhum formulário novo
pode reimplementar formatação ou validação de CPF, CEP, UF ou telefone.

| Módulo | Exporta | Uso |
|---|---|---|
| `src/lib/validacao-pessoa.ts` | `formatarCpf`, `cpfValido`, `formatarCep`, `cepValido`, `UFS_BRASIL`, `ufValida`, `formatarTelefone`, `telefoneValido`, tipo `PaisTelefone` | Toda entrada de pessoa física |
| `src/lib/persistencia-mascara.ts` | `CAMPOS_SENSIVEIS`, `ehCampoSensivel`, `mascararValor`, `mascararParaLog` | Auditoria: registra o que mudou, não o conteúdo sensível |

Características verificadas: CPF com dígito verificador da Receita e rejeição de
sequências repetidas; CEP em `00000-000`; UF conferida contra as 27 siglas reais;
telefone com DDI e DDD quando a pessoa mora no Brasil e formato livre com DDI
explícito quando mora fora. São módulos puros — formatam e validam, nunca
decidem o que gravar.

Anti-padrões proibidos: `replace(/\D/g,'')` solto dentro de um componente;
`maxLength` como substituto de validação; máscara aplicada só no envio;
validação apenas no cliente para campo que o servidor grava; validador de CPF
copiado para um segundo arquivo.

## 2. Como ler a matriz

- **Dona**: única entidade que pode gravar o campo.
- **Espelhos**: cópias legítimas de leitura; espelho nunca vira fonte.
- **Atualização**: quem pode alterar e sob qual condição.
- **Visibilidade**: `interna` = só equipe; `sanitizada` = pode ir ao App após
  revisão; `protegida` = nunca sai do Desk, nem em log.
- **Ação futura**: o que exigiria decisão numa fase posterior. Nada aqui é
  executado.

## 3. Matriz por campo

### 3.1 Nome

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| Nome civil | Texto obrigatório, sem máscara; nunca usado para fusão | `case_members.nome` | `leads.nome`, `contacts.nome`, `clientes.nome`, `nucleo_membros.nome`, `contract_parties.person_name` | Declarado pela família | Equipe, com registro | sanitizada | Ficha do caso, Contrato, App Conta | 6 grafias | Eleger `case_members` como dona e tornar os demais leitura |
| Nome social | Texto | `clientes.nome_social` | `contract_parties.preferred_name` | Declarado | Equipe | sanitizada | Cliente, Contrato | 2 | Refletir também na ficha do caso |
| Nome de nascimento | Texto | `genealogical_person_profiles.nome_nascimento` | — | Pesquisa com evidência | Pesquisa, com revisão | interna até aprovação | Pesquisa, Árvore | — | Projeção sanitizada para a Árvore |
| Nome canônico de pesquisa | Texto | `research_people.canonical_name` | `preferred_display_name` | Pesquisa | Pesquisa | interna | Pesquisa | — | Não confundir com nome civil |
| Variantes de grafia | Lista de texto | Não registrado hoje | — | — | — | — | — | Lacuna | Campo futuro na Pesquisa, nunca no cadastro civil |

### 3.2 Contato

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| E-mail de contato | Trim, minúscula, formato de e-mail, até 255 | `contacts.email` | `leads.email`, `clientes.email`, `case_members.email`, `contract_parties.email` | Declarado | Equipe | sanitizada | Pessoa, Cliente, Contrato | 5 | Consolidar em Pessoa |
| E-mail de acesso | Igual acima, normalizado | `authorized_portal_emails.email` | `client_portal_access.email` | Autorização da equipe | Somente fluxo de autorização | protegida | Portal, Acesso | 2 | Nunca editar junto do contato |
| Telefone | `formatarTelefone` + `telefoneValido` com `PaisTelefone` | `contacts.telefone` | `leads.telefone`, `clientes.telefone`, `case_members.telefone`, `contract_parties.phone` | Declarado | Equipe | sanitizada | Pessoa, Contrato | 5 | **P28 (26/09/2026): Corte 2 executado** — `estadoTelefoneMembroCaso`/`sinalTelefoneDaPessoaPorCaso` (`pessoa-vinculo.ts`) e `conferirDivergenciaTelefoneMembrosCaso` (`caso-canonico.functions.ts`) detectam divergência `case_members.telefone` × `clientes.telefone` e oferecem reconciliação humana em Caso 360/sinal em Pessoa 360 — mesmo padrão do CPF (R2). Consolidação plena (dona única) continua Corte 3+ do plano de `de-para-pessoa-unificada.md`, não autorizada |
| DDD | Derivado do telefone, não campo próprio | — | — | — | — | — | — | — | Manter derivado; não criar coluna |
| WhatsApp | Sem campo dedicado hoje | Não registrado | — | — | — | — | Atendimento | Lacuna | Se criado, sinalizador sobre o telefone, nunca segundo número |

### 3.3 Documentos civis

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| CPF | `formatarCpf` + `cpfValido` | `case_members.cpf` | `clientes.documento`, `contract_parties.document_number` | Documento apresentado | Equipe, com fonte | protegida (mascarada em log) | Ficha, Contrato | 3 | `clientes.documento` é genérico e não valida tipo |
| RG | Texto livre; sem dígito nacional | `case_members.rg` | `contract_parties.document_number` | Documento | Equipe | protegida | Ficha | 2 | Órgão e UF não existem hoje |
| Órgão emissor | Não registrado | — | — | — | — | — | — | Lacuna | Campo futuro junto ao RG |
| UF emissora | `ufValida` / `UFS_BRASIL` | Não registrado | — | — | — | — | — | Lacuna | Reutilizar o validador existente |
| Tipo de documento | Lista fechada | `contract_parties.document_type` | — | Contrato | Equipe | interna | Contrato | — | Aplicar a mesma lista à ficha |

### 3.4 Endereço

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| CEP | `formatarCep` + `cepValido` | `case_members.cep` | — | Declarado | Equipe | protegida | Ficha | — | — |
| Endereço | Texto único | `case_members.endereco` | `contract_parties.address` | Declarado | Equipe | protegida | Ficha, Contrato | 2 | Endereço é texto corrido, sem partes separadas |

### 3.5 Nascimento, óbito e precisão

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| Data de nascimento | Data | `case_members.data_nascimento` | `research_people.birth_date`, `genealogical_person_profiles.nascimento_data` | Declarada / pesquisa | Civil pela equipe; pesquisa nunca sobrescreve | protegida | Ficha, Pesquisa | 3 | Divergência é exibida, não resolvida sozinha |
| Local de nascimento | Texto | `case_members.local_nascimento` | `research_people.birth_place`, `genealogical_person_profiles.nascimento_localidade` | Declarado / pesquisa | Idem | sanitizada | Ficha, Árvore | 3 | — |
| Precisão da data | Lista | `genealogical_person_profiles.nascimento_precisao` | `research_people.birth_date_precision` | Pesquisa | Pesquisa | interna | Pesquisa | 2 | Cadastro civil não tem precisão — correto |
| Data aproximada | Sinalizador | `genealogical_person_profiles.nascimento_data_aproximada` | — | Pesquisa | Pesquisa | interna | Pesquisa | — | Nunca exibir como data exata no App |
| Óbito e local | Data / texto | `case_members.data_obito`, `local_obito` | `research_people.death_*`, `genealogical_person_profiles.morte_*` | Declarado / pesquisa | Idem nascimento | sanitizada | Ficha, Árvore | 3 | Causa e sepultamento só na pesquisa |

### 3.6 Atributos civis

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| Nacionalidade | Lista | `case_members.nacionalidade` | `leads.nacionalidade`, `research_people.nationality_context` | Declarada | Equipe | sanitizada | Ficha | 3 | Pesquisa trata contexto, não fato civil |
| Profissão | Texto | `case_members.profissao` | — | Declarada | Equipe | sanitizada | Ficha, Contrato | — | — |
| Estado civil | Lista | `case_members.estado_civil` | — | Declarado | Equipe | sanitizada | Ficha, Contrato | — | — |
| Sexo / descritor | Lista | `genealogical_person_profiles.sexo` | `research_people.gender_or_descriptor` | Pesquisa | Pesquisa | interna | Pesquisa | 2 | Não é campo civil do cadastro |
| Menor de idade | Sinalizador | `research_people.is_minor` | `case_members.representante_legal` | Declarado / pesquisa | Equipe | protegida | Ficha, Pesquisa | 2 | Representação de menor é proteção, não some |

### 3.7 Papéis

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| Papel no caso | Lista | `case_members.papel_no_caso` | `nucleo_membros.papel_no_caso` | Decisão da equipe | Equipe | sanitizada | Ficha, Caso | 2 | — |
| Titular | Sinalizador | `case_members.titular` | — | Decisão | Equipe | sanitizada | Caso | — | Um por caso |
| Requerente / dependente / contratante | Sinalizadores | `case_members.requerente`, `dependente`, `contratante` | — | Decisão | Equipe | sanitizada | Ficha, Contrato | — | — |
| Parentesco | Lista + `mae_id` / `pai_id` | `case_members.parentesco` | `research_people.papel_na_linhagem` | Declarado | Equipe | sanitizada | Ficha, Árvore | 2 | Parentesco declarado ≠ vínculo provado |
| Representante legal | Sinalizador + `representa_pessoa_id` | `case_members.representante_legal` | `contract_parties.represented_by_party_id` | Documento | Equipe | interna | Ficha, Contrato | 2 | — |
| Papel contratual | Lista | `contract_parties.role` | — | Contrato | Contrato | interna | Contrato | — | — |
| Papel de acesso | Lista | `client_portal_access.access_level` | `authorized_portal_emails.nivel_pretendido` | Autorização | Fluxo de acesso | protegida | Portal | 2 | Pretendido ≠ concedido |

### 3.8 Consentimentos

| Campo | Máscara / validador | Dona | Espelhos | Origem | Atualização | Visibilidade | Telas | Duplicidade | Ação futura |
|---|---|---|---|---|---|---|---|---|---|
| Consentimentos do integrante | Estrutura | `case_members.consentimentos` | — | Declarado | Equipe, com registro | protegida | Ficha | — | — |
| Consentimento comercial | `consentimento_status`, `_em`, `_canal`, `_versao_aviso`, `_gravacao` | `leads` | — | Discovery | Comercial | interna | Comercial | — | Não migra sozinho para o caso |

### 3.9 Identificadores

| Identificador | Dona | Onde aparece | Visibilidade |
|---|---|---|---|
| Pessoa | Não existe global | — | — |
| Interessado | `leads.id`, `leads.codigo` | Comercial | interna |
| Contato | `contacts.id` | Desk | interna |
| Cliente | `clientes.id` | Desk, Portal | interna |
| Caso | `crm_casos.id` + código humano | Desk, App | sanitizada (código) |
| Integrante do caso | `case_members.id` | Desk | interna |
| Pesquisa | `research_cases.id`, `research_people.id` | Pesquisa | interna |
| Contrato | `contracts.id` + número | Desk, App | sanitizada (número) |
| Parte contratual | `contract_parties.id` | Contrato | interna |
| Acesso ao App | `client_portal_access.id` | Portal | protegida |
| Liberação de caso no App | `client_portal_case_access.id` | Portal | protegida |

Regra: identificador técnico nunca é rótulo de tela. O App mostra código do caso
e número do contrato; nunca identificadores internos.

### 3.10 Campos internos protegidos

Nunca vão ao App, nunca a print, nunca a log legível.

| Campo | Onde | Motivo |
|---|---|---|
| `crm_casos.canvas_token` | Caso | Token de acesso |
| `crm_casos.canvas_publicado` | Caso | Estado de publicação interno |
| `proposal_canva_pages.page_content_structured` | Proposta | Conteúdo bruto extraído |
| `proposal_canva_pages.observacao_interna` | Proposta | Nota interna |
| `leads.dossie_link_interno`, `gravacao_link_interno`, `contrato_link_interno`, `proposta_link_interno` | Comercial | Links internos |
| `leads.sku_referencia`, `produtos_recomendados` | Comercial | Catálogo técnico |
| `research_people.notes_internal`, `sensitivity_level` | Pesquisa | Nota e sensibilidade |
| `genealogical_person_profiles.internal_notes` | Pesquisa | Nota |
| `case_members.observacoes_protegidas` | Ficha | Nota protegida |
| `authorized_portal_emails.notes_internal`, `motivo_recusa` | Portal | Decisão interna |
| `client_portal_access.notes_internal`, `magic_link_*`, `revocation_reason`, `suspension_reason` | Portal | Acesso |
| Estados de gate (`STATUS_GATE_PESQUISA`) | Pesquisa | Regra interna |

Sobre a URL do Canva: exibir o atalho somente quando houver URL registrada. Sem
registro, a tela mostra `Link do Canva não registrado`. Nunca deduzir, montar ou
adivinhar o endereço, e nunca expor o token junto.

## 4. Anti-padrões de formulário

1. Recriar máscara existente dentro do componente.
2. Pedir o mesmo dado em duas telas sem declarar qual é a dona.
3. Gravar espelho e tratá-lo como fonte na leitura seguinte.
4. Validar só no cliente um campo que o servidor grava.
5. Formulário longo único no lugar de leitura contínua com blocos editáveis.
6. Campo protegido exibido "porque o usuário é interno" — proteção é por campo,
   não por cargo.
7. Botão desativado repetido no lugar de estado vazio específico.
