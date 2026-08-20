# ANA-FIX-P0 — Execução e estado dos gates
Caso: CA-CID-AT-FAM-2026-001 · Data: 20/08/2026 (UTC-3)

## 1. Cadeia Caso → Família → Pessoa → Formalização (testada em leitura)
| Elo | Estado | Evidência |
|---|---|---|
| Caso | existe, 1 registro canônico | `crm_casos.codigo = CA-CID-AT-FAM-2026-001` |
| Família | 1 núcleo, 4 membros vinculados | `nucleos_familiares` + `nucleo_membros` (4) |
| Pessoa | 4 `case_members` ativos; 1 dependente (Felipe) | `case_dependents.status_representacao = pendente` |
| Formalização | contrato em `draft`, sem fatura | `contracts.status = draft`, `invoices = 0` |

Conclusão: a cadeia está íntegra e navegável; a formalização **não** pode avançar.

## 2. D/E — checklist e prévia interna
- Checklist cadastral: 38 registros, **38 pendentes** (nenhum em `ok`).
- Case Service: 1 registro em rascunho, com critérios ainda não homologados.
- Matriz jurídica: temas bloqueantes sem decisão aprovada.
- Prévia contratual permanece **interna**, sem liberação de assinatura.

## 3. Navegação mobile — corrigido
- App Cliente: barra inferior deixou de comprimir 10 abas em `grid-cols-10` (~37px por item); agora rola horizontalmente com itens legíveis (68px), snap, rótulo íntegro, item ativo centralizado automaticamente e `safe-area-inset-bottom`.
- Desk Intelligence: mesma correção na barra de 14 módulos, com indicador de aba ativa e área segura.
- Nenhum módulo removido, renomeado ou reordenado (regra CA-UX preservada).

## 4. Revalidação — proposta Canva e cadastro
- Proposta: origem `canva`, status `aprovada`, páginas 1–7 registradas, **validade 19/08/2026 → expirada**. Extração ainda parcial (campos ausentes nas páginas 3–7).
- Cadastro: 38 itens pendentes; divergência de nome de Adair não reconciliada.

## 5. Bloqueios que impedem os passos seguintes
| Passo pedido | Estado | Bloqueio |
|---|---|---|
| Contrato pronto para assinatura | **bloqueado** | proposta expirada; parâmetros incompletos; matriz jurídica pendente |
| Assinatura + pagamento | **bloqueado** | contrato em `draft`; gates de formalização abertos |
| Onboarding real | **bloqueado** | 12 itens de template existem, mas ativação exige contrato assinado + pagamento |
| Ficha Piloto Genealógica e Evidências | **em preparação** | pesquisa em `preparation`; liberação depende da ativação |
| Congelar Lovable e migrar | **não recomendado** | congelar com gates abertos fixaria estado inválido do piloto |

## 6. Ação humana necessária (fora do sistema)
1. Renovar/reemitir a proposta Canva com nova validade e completar as páginas 3–7.
2. Concluir os 38 itens do cadastro e reconciliar o nome de Adair.
3. Decidir os temas bloqueantes da matriz jurídica.
4. Regularizar a representação legal de Felipe.
Somente após 1–4 o contrato pode ser liberado para assinatura.
