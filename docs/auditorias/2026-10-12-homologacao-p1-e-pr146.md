# Homologação e Parecer: Conclusão da Etapa P1 (Case Members) e Merge da PR #146

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 17:15 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: homologação de dados, governança de papéis no caso e aprovação de PR
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-homologacao-p1-e-pr146.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main no commit da106e9)
  - PR #146 (test(portal): atualizar expectativas de menu da Conta) mesclada com sucesso
  - Relatório P1 de case_members no caso CA-CID-AT-FAM-2026-001 (a11a...0002)
  - docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
escopo: >
  Homologação dos resultados da etapa P1 (verificação dos vínculos em case_members),
  decisão normativa sobre o papel dos titulares no caso vs núcleo,
  confirmação do merge da PR #146 no main e manutenção do status cadastral.
premissas:
  - O merge da PR #146 foi concluído (commit da106e9) mantendo o CI 100% verde.
  - A modelagem canônica estabelece papel = 'titular' com flag contratante ativa em case_members.
  - O status_cadastral permanece 'pendente' até a assinatura formal e compensação do Asaas.
criterio_de_aceite: >
  Aprovação do estado de case_members sem necessidade de alteração em banco;
  confirmação de que Felipe está protegido como dependente;
  registro formal do commit da106e9 no repositório.
```

## 1. Confirmação do Merge da PR #146 no Main

O Pull Request **#146** (`test(portal): atualizar expectativas de menu da Conta`) foi retirado de modo draft e **mesclado com sucesso no `main`** através do commit **`da106e9`**:
- **Escopo**: Atualizou as asserções de teste que quebravam no `main` em decorrência da decisão de 11/10 (menu de configurações no perfil da conta).
- **Validação**: Suíte completa de testes e `typecheck` 100% verdes no `main`.

---

## 2. Parecer da Proprietária sobre a Etapa P1 (`case_members`)

A Proprietária do Clube Ancestral aprova integralmente o diagnóstico da etapa P1:

| Membro no Caso | ID do Membro | Papel no Caso | Flag Contratante | Status Cadastral | Parecer |
|---|---|---|---|---|---|
| **Ana Luiza** | `38b603a9` | `titular` | `sim` | `pendente` | **APROVADO (Modelo Canônico)** |
| **Adair** | `ab44187f` | `titular` | `sim` | `pendente` | **APROVADO (Modelo Canônico)** |
| **Alice** | `bee5de3d` | `titular` | `sim` | `pendente` | **APROVADO (Modelo Canônico)** |
| **Felipe** | `f9095735` | `dependente` | `não` | `pendente` | **APROVADO (Blindado / Sem app)** |

---

## 3. Respostas Vinculantes às Perguntas do Claude Code

1. **Sobre o Papel no Caso (`titular` vs `contratante`)**:
   - **Decisão**: **MANTER COMO ESTÁ (`titular` com flag de contratante ligada)**.
   - **Justificativa**: Esta é a modelagem canônica perfeita do Clube Ancestral: no núcleo familiar eles são contratantes da proposta, e no caso formal são os **titulares requerentes adultos** da cidadania. Não alterar nada em banco.
2. **Sobre o `status_cadastral = 'pendente'`**:
   - **Decisão**: **MANTER 'pendente'**.
   - **Justificativa**: O status cadastral só deve transitar para ativo/confirmado após a assinatura digital do contrato e a compensação da primeira parcela no Asaas.

---

## 4. Instrução Normativa Pronta para Envio

```markdown
RESPOSTA NORMATIVA: PARECER P1, HOMOLOGAÇÃO DE PAPÉIS E MERGE PR #146
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Repositório: tatianatosi/soul-ancestry | Head main: da106e9

Parecer da Proprietária:

1. [PR #146 MESCLADA NO MAIN]:
   - A PR #146 foi mesclada com sucesso no main via commit `da106e9`.
   - Dê `git pull origin main` no seu ambiente local.

2. [PARECER DA ETAPA P1 - RESPOSTAS ÀS SUAS DÚVIDAS]:
   - Papel no caso: MANTER COMO ESTÁ (`titular` com a flag de contratante ligada). Essa modelagem é o desenho canônico aprovado. Não alterar.
   - Status cadastral: MANTER `pendente`. O cadastro só se torna ativo após a assinatura formal e o primeiro pagamento.
   - P1 concluído com sucesso e sem necessidade de escrita física no banco.

3. [PRÓXIMO PASSO]:
   - O backend está 100% estabilizado e o caso piloto está pronto para receber os IDs de assinatura do Asaas.
   - Aguarde em STANDBY a finalização da esteira financeira e visual.
```
