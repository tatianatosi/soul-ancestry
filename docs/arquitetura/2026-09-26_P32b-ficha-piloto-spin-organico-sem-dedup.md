# P32b — Ficha Piloto prevalece a mais completa, SPIN orgânico sem forms duplicados, e reconciliação civil sem "dedup" (2026-09-26)

```yaml
pedidos literais (mensagens sucessivas, mesmo corte):
  - "Ela não funciona todos os dados são duplicados veja os cadastros mas eu não
    pedi para duplicar só pedi para entre ficha piloto e ficha genealógica
    prevalece a mais completa verifique novamente"
  - "Só deixar o cadastro mais completo sem dedup e somente adicionando dado de
    acordo com o avanço do lead e também está errado em dizer que usa spin no
    painel de calls até hoje é um infinito de forms que não se conversam quando
    na verdade cada pergunta do spin deve ser respondida e deve ser orgânico
    dentro do Crm vivo e Crm mestre é um dicionário que pode servir de algo...
    revise em conjunto com os demais"
  - "01 cadastro 01 pessoa 01 lead 01 pesquisa 01 núcleo 01 caso"
```

Três correções diretas da Proprietária a um corte anterior (P32) desta mesma
sessão, tratadas aqui como um único corte coerente ("revise em conjunto com
os demais"), não três patches isolados.

## Correção 1 — Ficha Piloto × Ficha Genealógica: prevalece a mais completa

Achado real (releitura do schema, não do código já escrito): a Ficha Piloto
(`research_people`, identidade mínima) e a Ficha Genealógica
(`genealogical_person_profiles`, nascimento/óbito/sexo) já são ligadas por
uma FK **obrigatória** (`genealogical_person_profiles.research_person_id`) —
mas a Ficha Piloto nunca lia esse perfil, então sempre mostrava a versão mais
pobre da mesma pessoa. A conclusão anterior ("Ficha Piloto não duplica nada")
estava certa sobre não haver duplicação de ESCRITA, mas errada em tratar isso
como suficiente — havia um gap real de LEITURA (dado mais completo nunca
chegava à tela).

Corrigido, só leitura, sem escrever de volta em `research_people`:

- `src/lib/ficha-piloto-genealogica.ts` — `PerfilMaisCompleto` (tipo) e
  `pessoaComPerfilMaisCompleto()`: função pura que funde nascimento/óbito/sexo
  do perfil vinculado (quando existe) sobre a pessoa, nunca sobrescreve
  `canonical_name`/`identity_status`/demais campos originais.
- `src/lib/ficha-piloto-genealogica.functions.ts` — `carregarFichaPiloto`
  passa a buscar `genealogical_person_profiles` por `research_person_id IN
  (idsPessoas)` (a FK real, não por nome/cliente) e aplica a função acima a
  cada pessoa antes de devolver.
- `src/components/caso/ficha-piloto-genealogica.tsx` — a lista "Pessoas do
  núcleo e da pesquisa" passa a mostrar nascimento/óbito quando presentes.

**Sem dedup, por decisão explícita da Proprietária.** Não há "resolver
conflito", não há botão de confirmação, não há motivo — é leitura pura: o
perfil vinculado (quando existe) simplesmente aparece. Se o perfil não
existir ainda, os campos ficam nulos (nunca inventados); se existir e for
preenchido, prevalece. Isso é adição progressiva "de acordo com o avanço do
lead/caso" — quando a pesquisa avança e o perfil é preenchido, a Ficha Piloto
passa a mostrá-lo automaticamente, sem nenhuma ação humana extra.

## Correção 2 — Painel de Calls: SPIN de fato orgânico, sem form duplicado

Achado real, por leitura direta de `painel-calls.tsx` (não só de
`discovery-roteiro.ts`, que é só a camada de dados pura): a alegação anterior
de que "o roteiro SPIN não cria formulário novo" era verdadeira sobre o
schema (cada pergunta é mesmo uma lupa sobre uma coluna de `leads`), mas
**falsa na tela real** — existiam **duas superfícies de edição** para os
mesmos 13 campos:

1. O card SPIN rico (`renderCampoRoteiro`, dentro de `<MesaDiscovery>`) — uma
   pergunta por vez, com por-que-importa, achado da varredura de WhatsApp
   (confirmar/virar hipótese/ignorar), estado (confirmado/hipótese/pendente),
   destino e consequência.
2. Uma seção plana "Triagem preliminar (Discovery)" (movida de `/leads` em
   23/09/2026, comentário no próprio código citando o R3) — grade de
   `<Selecao>`/`<Texto>` simples, **sem** nenhum desse contexto, para os
   MESMOS 13 campos (`elegibilidade_preliminar`, `confianca_triagem`,
   `geracao_ascendente`, `linha_transmissao`, `risco_ruptura`,
   `complexidade_documental`, `estado_documental_inicial`,
   `pendencia_documental_prioritaria`, `exige_idioma_entrevista`,
   `requerentes_potenciais`, `estrutura_familiar`, `objecao_predominante`,
   `nivel_intencao`).

Nenhuma duplicação de dado (as duas escrevem na mesma linha de `leads`) — mas
duplicação real de UX: exatamente o "infinito de forms que não se conversam"
que a Proprietária apontou. A migração de 23/09 moveu a seção de `/leads`
para `/calls` sem nunca mesclá-la com o card SPIN que já existia na mesma
tela.

**Corrigido**: a seção plana "Triagem preliminar (Discovery)" foi removida.
Os 13 campos passam a ter **uma única superfície editável**: o card SPIN,
dentro do fluxo pergunta-a-pergunta de `<MesaDiscovery>`. Import de 12
constantes de catálogo (`ELEGIBILIDADE_PRELIMINAR`, `CONFIANCA_TRIAGEM`
etc.) removido de `painel-calls.tsx` — só continuam usadas dentro de
`CATALOGOS`/`crm-desk.ts`, consumidas pelo próprio `renderCampoRoteiro` via
`CATALOGOS[campoId]`.

CRM Mestre confirmado, sem mudança: continua sendo o dicionário somente
leitura (`/crm-mestre`), correto como está — a Proprietária não pediu
mudança nele, só confirmou seu papel.

## Correção 3 — reconciliação civil (P32) simplificada: sem "dedup"

O painel `PainelDadosCivisMembrosCaso`/`conferirDivergenciaCampoCivilMembrosCaso`
(introduzido no P32 desta mesma sessão, generalizando o padrão já aprovado de
CPF/telefone/CEP) tinha uma ação de "resolver conflito" — um botão que exigia
motivo e sobrescrevia o valor do caso pelo valor canônico quando os dois já
estavam preenchidos e divergentes. A Proprietária rejeitou esse padrão
diretamente: "só deixar o cadastro mais completo sem dedup".

Removido:

- `conferirDivergenciaCampoCivilMembrosCaso` não aceita mais
  `resolverMembroId`/`motivo` — a única ação de escrita continua sendo
  preencher (aditivamente) o campo vazio a partir do cadastro canônico,
  quando `confirmar: true`.
- `BlocoCampoCivil` (UI) perdeu a mutation `mResolver` e o botão "Usar o
  {campo} do cadastro canônico" — conflito agora é mostrado só como texto
  informativo ("No caso: X · No cadastro canônico: Y — só sinal, nada é
  sobrescrito automaticamente").

**Nota de escopo**: os mecanismos de CPF/telefone/CEP
(`estadoCpfMembroCaso`/`estadoTelefoneMembroCaso`/`estadoCepMembroCaso` e
seus 3 painéis) **não foram tocados** — são padrão já aprovado e em produção
desde o corte R2, anterior a esta correção, e a Proprietária não pediu
mudança neles especificamente. Só o mecanismo genérico dos 6 campos civis
(introduzido nesta mesma sessão, no P32) foi ajustado.

## "01 cadastro 01 pessoa 01 lead 01 pesquisa 01 núcleo 01 caso"

As três correções acima convergem no mesmo princípio, sem tabela nova nem
vocabulário novo:

- **01 pessoa**: Ficha Piloto e Ficha Genealógica mostram a mesma pessoa, com
  o dado mais completo disponível — nunca duas versões concorrentes.
- **01 lead**: o roteiro SPIN edita `leads` uma vez por campo, num único
  lugar — não mais duas grades sobre o mesmo dado.
- Os demais (cadastro, pesquisa, núcleo, caso) já estavam cobertos pelos
  mecanismos existentes (`case_members`/`clientes` reconciliados por CPF/
  telefone/CEP/6 campos civis; núcleo via `nucleos_familiares`/
  `nucleo_membros`; caso via `crm_casos`) — nenhuma mudança de schema aqui,
  só remoção de ceremônia de conflito onde a Proprietária pediu.

## Verificação

`tsc --noEmit` limpo. Testes atualizados/novos:
- `p32b-ficha-piloto-prevalece-mais-completa-2026-09-26.test.ts` (7 testes —
  função pura, busca pela FK real, nunca escreve, UI mostra os campos).
- `r3-calls-unica-superficie-discovery.test.ts` — reescrito para confirmar
  que a seção plana duplicada foi removida e que os 13 campos são cobertos
  pelo mecanismo genérico do card SPIN (`onChange={set(campoId)}`), não por
  um literal por campo.
- `p32-cadastro-unico-progressivo-2026-09-26.test.ts` — teste do escritor
  civil atualizado: confirma ausência de `resolverMembroId`/`mResolver`, mantém
  a garantia de que só preenche vazio, nunca sobrescreve.

Suíte completa: 409/416 arquivos, 3878/3897 testes — 7 arquivos/11 testes em
falha, idêntico à baseline estável pré-existente (visual/portal, não
relacionados a este corte). `vite build` limpo. Sem drift contra `origin/main`.

## Prova Lovable pós-push

1. Em Caso 360 (aba Técnico e riscos), ficha piloto de um caso cuja pesquisa
   já tem perfil genealógico preenchido em `/pessoas-linhagens/$caseId`:
   conferir que a lista "Pessoas do núcleo e da pesquisa" já mostra
   nascimento/óbito, sem precisar abrir a Ficha Genealógica.
2. Em `/calls`, abrir um lead e conferir que "Triagem preliminar (Discovery)"
   não existe mais como seção separada — os mesmos campos (elegibilidade,
   confiança, geração do ascendente etc.) aparecem só dentro do card "Mesa de
   Discovery", uma pergunta por vez, com o contexto de por-que-importa/achado
   de WhatsApp/destino.
3. Em Caso 360, painel "Conferir dados civis dos membros com o cadastro
   canônico": um campo em conflito (ex.: e-mail divergente) mostra os dois
   valores como texto, sem nenhum botão de "usar o valor canônico" — só
   "Preencher pendentes" continua ativo para campos vazios.
