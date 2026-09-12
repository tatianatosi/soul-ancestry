# Guia Cirúrgico para Cursor — Go-live do App Cliente e Backend do Desk

**Status:** aprovado  
**Versão:** v1.0  
**Data:** 2026-09-11  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte(s) de evidência:** mockup visual aprovado de 17 páginas (`clubeancestralmockup.pdf`); taxonomia canônica aprovada (`Taxonomia_Canonica_Mockup_Aprovado_App_Cliente_e_Desk.md`); mockup visual revisado desta conversa; `de-para-backend-desk-clube-ancestral.md`; `CA-CONN-01_base_existente_desk.md`; repositório `tatianatosi/recriacao-do-clube-ancestral`.  
**Escopo:** orientar a atuação imediata do Cursor para colocar o App Cliente on-line preservando sua interface aprovada e simplificar/conectar o backend do Desk.  
**Premissas:** o App Cliente é prioridade; não haverá redesign do App Cliente; o Desk precisa servir a uma startup de pesquisa, com bloqueios proporcionais e não uma arquitetura de “caixa-forte”; uma mesma fonte de dados canônica é usada por App e Desk.  
**Limites:** não redesenhar interface aprovada; não criar outro CRM, outro banco ou outro app; não executar pagamentos, disparar mensagens ou publicar dados privados; não alterar taxonomia visual aprovada.  
**Próximos passos:** executar o bloco 1; reportar somente a evidência de funcionamento e os bloqueios reais; aguardar validação antes do bloco seguinte.  
**Critério de aceite:** App Cliente navegável e on-line, com dados demonstrativos claramente identificados ou dados reais autorizados; Desk consumindo a mesma fonte por `caseId`; nenhum bloqueio pesado aplicado a rascunho, pesquisa ou navegação.

---

## 1. Comando para o Cursor

Copie e cole o texto abaixo no Cursor dentro do projeto que hospeda o App Cliente e o Desk:

```text
Você entra em um produto existente do Clube Ancestral. Trabalhe de forma incremental, cirúrgica e reversível.

OBJETIVO ÚNICO DESTA ETAPA
Colocar o App Cliente já aprovado on-line o quanto antes, preservando sua interface, suas sete telas e sua experiência. Em paralelo, preparar somente a camada mínima de backend compartilhada para que o Desk interno leia os mesmos casos sem criar base, CRM ou app paralelo.

PRIORIDADE
1. App Cliente navegável e publicável.
2. Dados de caso canônicos compartilhados.
3. Desk simplificado por trás do App.
4. Evoluções comerciais, financeiras, jurídicas e de pesquisa em incrementos posteriores.

NÃO FAZER
- Não redesenhar o App Cliente.
- Não renomear, remover, fundir ou reorganizar as telas aprovadas.
- Não criar uma nova aplicação, novo banco, nova planilha, novo CRM ou mockup paralelo.
- Não remover componentes, rotas, estilos, cards ou dados existentes.
- Não parar para uma auditoria, inventário, relatório enciclopédico ou refatoração ampla.
- Não implementar arquitetura de segurança excessiva, gates globais ou bloqueios que impeçam rascunhos, pesquisa, tarefas, navegação e preparação de proposta/contrato.
- Não afirmar upload, pagamento, assinatura, integração ou dado real se isso não existir.
- Não publicar produção sem antes apresentar o preview/deploy e pedir confirmação explícita da proprietária.

TAXONOMIA VISUAL APROVADA — NÃO ALTERAR
App Cliente:
Home → Jornada → Radar → Árvore → Documentos → Legado → Conta.

Desk Intelligence:
Visão Geral → Casos 360 → Checklist → Validação Jurídica → Radar Interno → Alertas → Biblioteca Mestre.

REGRA DE DADOS
- Preserve `caseId` como identificador estável.
- App Cliente e Desk devem consumir o mesmo objeto/adapter de caso.
- Se ainda houver dados demonstrativos, rotule explicitamente `Dados demonstrativos`.
- Caso não exista informação real suficiente, use estado vazio honesto: `Sem dados suficientes` ou `Em conciliação`.
- Não duplique pessoas, famílias, contratos, documentos ou casos em fontes locais por tela.

SEGURANÇA ADEQUADA À STARTUP
- Implementar o mínimo correto: autenticação quando disponível, vínculo usuário–caso, validação básica de entrada e separação clara entre conteúdo interno e conteúdo liberado ao cliente.
- Aplicar bloqueios somente no ato sensível: publicar atualização ao cliente, enviar comunicação, assinar/enviar contrato, emitir/cobrar pagamento, protocolar ação formal ou expor dado privado de terceiro.
- Rascunho de caso, pesquisa, tarefa, documento em análise, proposta rascunho e contrato rascunho devem continuar possíveis.
- Não criar NO_GO global, bloqueio de tela, bloqueio de pesquisa ou wall de permissões que torne o Desk inutilizável.

EXECUTE AGORA EM 4 PASSOS CURTOS

PASSO 1 — LEITURA OBJETIVA DO PROJETO
Localize, sem alterar nada:
- a rota/entrada do App Cliente;
- as sete telas aprovadas;
- a fonte atual de `cases`/dados demonstrativos ou adapter equivalente;
- configuração de build e deploy;
- o ponto atual do Desk.

Responda em até 10 linhas com os caminhos encontrados e o que já está navegável. Não faça relatório longo.

PASSO 2 — PRESERVAR E CONECTAR
- Não mude o layout, textos de navegação, paleta ou componentes aprovados do App Cliente.
- Caso App e Desk estejam em fontes distintas, crie apenas um adapter/repository compartilhado que exponha o caso por `caseId`, preservando todos os campos existentes.
- O App deve mostrar: resumo do caso, jornada, radar, árvore, documentos, legado e conta usando a fonte compartilhada ou o dado demonstrativo já existente.
- O Desk deve conseguir ler o mesmo caso por `caseId`, mas não precisa ganhar novas telas nesta etapa.

PASSO 3 — PRONTIDÃO DE GO-LIVE
- Corrija apenas erros que impeçam build, navegação, renderização, rota ou deploy.
- Garanta estados vazios seguros e rótulos honestos.
- Verifique responsividade básica desktop/mobile.
- Gere um preview local ou de plataforma, sem publicar produção ainda.

PASSO 4 — DEVOLUTIVA CURTA E BLOQUEIO DE CONFIRMAÇÃO
Ao terminar, entregue somente:
1. O que foi preservado.
2. Arquivos efetivamente alterados.
3. Como o `caseId` é compartilhado entre App e Desk.
4. Resultado do build/preview.
5. Um único bloqueio real, se existir.
6. Pergunta explícita: “Posso publicar este preview como produção?”

PARE AÍ. Não avance para CRM, Marketing, Financeiro, Jurídico, Radar Interno, integrações ou redesign sem uma nova instrução.
```

---

## 2. O que já existe

A verificação do repositório acessível `tatianatosi/recriacao-do-clube-ancestral` não encontrou commits nem pull requests datados de 11/09/2026. Portanto, **não há evidência de alteração feita hoje nesse repositório específico** para aproveitar ou desfazer.

O que existe e deve ser aproveitado, sem substituir:

| Item já identificado | Uso agora |
|---|---|
| Estrutura Next/TypeScript | Manter o projeto e corrigir apenas o necessário para build/preview |
| `app/globals.css` | Preservar como ponto de aplicação dos tokens de marca já existentes; não fazer redesign nesta etapa |
| Componentes `desk-shell.tsx`, `sidebar.tsx`, `topbar.tsx` | Manter a casca do Desk; não ampliar a navegação agora |
| `visao-360.tsx` | Aproveitar como base do caso centralizador, sem recriar Caso 360 do zero |
| `risco-consular.tsx` | Manter como referência do Radar Interno futuro; não bloquear o App Cliente por ele |
| `dossie-documental.tsx` | Reaproveitar progressivamente no domínio de documentos/pesquisa |
| `memoria-italiana.tsx` | Manter como ativo do conteúdo de Legado, sem separar em app paralelo |
| `authority-audit.tsx` | Não colocar na jornada cotidiana do Desk agora; autoridade e logs ficam como apoio administrativo |
| `objecoes-conversao.tsx` | Reservar para evolução de CRM/marketing posterior |
| Fonte de dados com `caseId` prevista em `CA-CONN-01` | Usar como regra de integração: um mesmo caso para App e Desk |

Não é permitido concluir que o Cursor não trabalhou hoje em outro repositório, branch local, ambiente Vercel, Supabase ou máquina local. A evidência disponível apenas diz que **neste repositório GitHub consultado não houve commit ou PR hoje**.

---

## 3. Produto aprovado

### App Cliente — congelar visualmente

A navegação e o sentido do App Cliente aprovados são:

```text
Home → Jornada → Radar → Árvore → Documentos → Legado → Conta
```

Nesta fase, o Cursor pode corrigir dados, rotas, estados vazios, autenticação disponível, responsividade e build. Ele não pode mudar a taxonomia, o layout aprovado ou transferir telas do Desk para o cliente.

O App Cliente é a primeira entrega pública. A sua função é apresentar a jornada já tratada e liberada; não é exibir o funcionamento interno da pesquisa, decisões jurídicas, precificação provisória, CRM, radar interno ou backlog da operação.

### Desk — simplificar sem empobrecer

A navegação visual aprovada do Desk permanece:

```text
Visão Geral → Casos 360 → Checklist → Validação Jurídica →
Radar Interno → Alertas → Biblioteca Mestre
```

A simplificação ocorre **por trás da interface**, não apagando a vida do Clube:

- Pesquisa, documentos, pessoas/famílias, proposta, contrato e financeiro entram pelo **Caso 360** como contexto do caso.
- Marketing e CRM entram primeiro como dados e cards da Visão Geral; a ampliação para funil próprio acontece depois do go-live do App.
- O Radar Interno mostra matrizes e sinais apenas se houver dados/critério; caso contrário, mostra estado honesto.
- Validação Jurídica bloqueia somente ações formais sensíveis, não a operação preparatória.

---

## 4. Back mínimo agora

Apenas estes objetos são necessários para colocar o App Cliente de pé e preparar o Desk:

```ts
Case {
  id: string // caseId estável
  clientName: string
  displayName?: string
  caseStatus: string
  country?: string
  citizenshipPath?: string
  caseOwner?: string
  lastUpdate?: string
  nextAction?: string
  people?: Person[]
  documents?: Document[]
  checklist?: Task[]
  reports?: Report[]
  sources?: Source[]
  clientVisibleUpdates?: ClientUpdate[]
}
```

### Separação simples de visibilidade

| Conteúdo | App Cliente | Desk |
|---|---:|---:|
| Status e jornada liberados | Sim | Sim |
| Próximo passo compartilhável | Sim | Sim |
| Documentos solicitados/liberados | Sim | Sim |
| Achados e entregas publicados | Sim | Sim |
| Notas de pesquisa internas | Não | Sim |
| Hipóteses e fontes em validação | Não | Sim |
| Matriz de risco interna | Não | Sim |
| Parecer jurídico detalhado | Não | Sim |
| Valores provisórios e conciliação financeira | Não | Sim |
| Dados de outros participantes sem autorização | Não | Apenas conforme papel interno |

A projeção do cliente pode começar como uma função simples que seleciona campos explicitamente visíveis do mesmo caso. Não criar uma segunda cópia manual do caso para o portal.

---

## 5. Bloqueios proporcionais

O Desk não precisa ser uma caixa-forte. A orientação é: **liberdade para trabalhar; bloqueio apenas no momento de impacto externo, financeiro, jurídico ou de privacidade.**

| Ação | Pode ficar livre? | Bloqueio mínimo correto |
|---|---:|---|
| Criar/editar rascunho de caso | Sim | Validação básica de campos essenciais |
| Criar tarefa, pesquisa, hipótese ou documento em análise | Sim | `caseId` obrigatório quando a atividade for de caso |
| Navegar em Caso 360, Checklist e Biblioteca | Sim | Acesso autenticado quando existir, sem gate operacional |
| Preparar proposta ou contrato rascunho | Sim | Aviso de completude, não bloqueio global |
| Publicar atualização no App Cliente | Não totalmente | Confirmação e flag explícita de visibilidade ao cliente |
| Ver dados de outro cliente | Não | Vínculo usuário–caso/organização e filtro por acesso |
| Enviar contrato para assinatura | Não totalmente | Checagem de partes, escopo e validação jurídica aplicável |
| Emitir cobrança ou marcar pagamento | Não totalmente | Vínculo contratual e confirmação explícita |
| Protocolar ação formal | Não | Gate jurídico específico do caso |
| Alterar pesos do Radar ou taxonomia | Não totalmente | Papel proprietário/admin e log simples |

---

## 6. Depois do go-live

Somente após o App Cliente estar on-line e validado, executar em blocos pequenos:

1. **Caso 360 real:** conectar pessoas, família, pesquisa, documentos, tarefas, proposta, contrato e financeiro pelo mesmo `caseId`.
2. **Pesquisa viva:** perguntas, fontes, evidências, achados e dossiê como domínio central.
3. **CRM + Marketing:** origem → lead → discovery → proposta → contrato; funil até receita somente com regra de atribuição explícita.
4. **Financeiro:** contrato, parcelas, cobrança, pagamento e conciliação; nunca chamar pipeline de receita recebida.
5. **Jurídico + Radar:** validação por caso e matrizes rastreáveis, aplicadas como bloqueio pontual quando a ação exigir.
6. **Logo e Pantone oficiais:** substituir tokens provisórios somente após a entrega do ativo e do guia oficial homologado.

---

## 7. Nota de marca

O mockup e as referências indicam um Desk com navy elevado, fundo marfim, dourado de marca, areia para superfícies e terracota/âmbar para exceções. Nesta etapa, preservar a estética aprovada; não iniciar uma reforma visual.

O logo correto deve entrar como ativo oficial versionado. Não gerar, redesenhar ou substituir o logo por ícone parecido. O arquivo de guia de marca existe entre os materiais do projeto, porém este guia não certifica equivalências Pantone específicas sem leitura e homologação direta do manual oficial.
