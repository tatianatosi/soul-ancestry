# Política de autoridade operacional

Status: aprovado
Versão: v1.0
Data: 2026-09-05
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: decisão expressa da proprietária em 05/09/2026; `docs/auditorias/inventario-travas-2026-09-05.md`; commit `e2bace5`
Substitui: comportamento implícito e não escrito espalhado por 82 rotas

## Princípio

A proprietária é a autoridade final sobre a própria plataforma. Nenhuma regra de domínio, gate de formalização ou estado de registro pode impedi-la de operar. O que existe para protegê-la é confirmação, não bloqueio.

Formulação operacional: **pendência informa, não impede.**

## Os três estados

Toda ação da interface resolve para exatamente um destes estados, decidido em `src/lib/autoridade-operacional.ts`:

| Estado | Comportamento | Quando ocorre |
| --- | --- | --- |
| `permitir` | Executa direto | Operação interna, sem pendência |
| `confirmar` | Executa após aceite explícito com motivo escrito | Ação externa, irreversível, ou pendência superada por decisão da proprietária |
| `bloquear` | Recusa, sempre com motivo legível | Apenas falta de identidade ou de organização ativa |

Regra de implementação: **um controle só pode ficar desabilitado quando a decisão é `bloquear`.** Nenhuma tela pode desabilitar controle por conta própria com `somenteLeitura`, `podeEscrever` ou gate de domínio.

## O que a proprietária faz sem pedir licença

Liberado com pendência preservada e registro em auditoria:

- Aprovar proposta, gerar OS final, congelar prévia com campo pendente
- Avançar caso, fase, planejador e tarefa em estado `bloqueado_por_pendencia`
- Corrigir escopo, preço, SKU, condição comercial, parcelas e vencimentos
- Corrigir pessoas, dependentes, representação e responsabilidades
- Homologar SKU e condição comercial; resolver divergência
- Editar registro em estado travado — `legado` e `arquivado` abrem versão derivada, preservando o histórico
- Ver todos os estados da organização e consultar arquivados

## O que exige confirmação explícita

Não bloqueia. Abre janela com o efeito concreto, a pendência preservada e campo de motivo obrigatório:

- Solicitar assinatura
- Liberar financeiro, emitir ou enviar cobrança, criar ou alterar link de pagamento
- Publicar no App Cliente
- Liberar pesquisa externa e enviar pedido a instituição
- Ato em nome do cliente, procuração
- Enviar contrato, e-mail, WhatsApp ou mensagem
- Excluir registro ou versão, aplicar migration em produção, restaurar backup

Razão da lista: são os atos que saem do sistema e alcançam terceiros, ou que não têm volta. A confirmação existe para dar à proprietária o instante de decisão, não para tirar dela a decisão.

## O que continua bloqueando

Somente duas condições, ambas objetivas:

1. Conta sem papel de equipe na organização — sem isso o banco recusa a escrita de qualquer modo.
2. Organização ativa não identificada.

Em ambos os casos a mensagem diz a causa e o caminho de correção. Nunca "sem permissão" genérico.

## Falha nunca é silêncio

Regra de ouro: **ou a tela mostra dado, ou mostra erro.**

Proibido tratar resultado de consulta com `?? []` ou `|| []` de forma que uma falha de carga apareça como base vazia. Toda leitura passa por `EstadoDados`, que distingue três situações e nomeia cada uma:

- carregando;
- erro, com a mensagem real, a causa provável e o que fazer (política do banco, sessão expirada, falha de rede);
- vazio legítimo, dito explicitamente como consulta concluída com sucesso.

## Auditoria

Liberar não é apagar. Todo avanço por decisão da proprietária preserva a pendência original visível na tela e registra em `owner_override_events`: autora, data e hora, objeto afetado, gate superado, motivo escrito e fonte. O registro é append-only — a tabela não aceita `UPDATE` nem `DELETE`, por desenho.

## Limites desta política

- Ela governa a camada de aplicação. O controle real de dado continua sendo o RLS do banco, que não foi afrouxado em nenhuma tabela.
- As proteções contra duplo envio e contra salvar formulário incompleto permanecem: não são travas de autoridade, são proteções contra corrupção de dado.
- A política não cria caminho para agir sobre registro de outra organização.

## Critério de aceite

1. Nenhum controle do Desk ou do App Cliente fica desabilitado para a proprietária por pendência de domínio.
2. Toda ação da lista externa abre confirmação com efeito descrito e motivo obrigatório.
3. Toda mensagem de bloqueio nomeia causa e correção.
4. Nenhuma tela apresenta lista vazia quando a consulta falhou.
5. Todo avanço por decisão consta em `owner_override_events` com motivo.
