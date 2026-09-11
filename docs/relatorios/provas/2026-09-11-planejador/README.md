# Kit de prints — Motor do Planejador (prova autenticada)

**Motor:** Planejador operacional (elo 1) · Caso 360 / Jornada  
**Quem tira os prints:** somente a **proprietária autenticada** na própria conta  
**Ambiente sugerido:** preview do PR #118  
**URL preview:** https://soul-ancestry-git-cursor-motor-plane-6d4ce7-tati-6134s-projects.vercel.app  
**PR:** https://github.com/tatianatosi/soul-ancestry/pull/118  
**Pasta deste kit:** `docs/relatorios/provas/2026-09-11-planejador/`  
**Status atual:** `NAO_LOCALIZADO` — pastas prontas; arquivos de imagem ainda vazios  

> Print de agente, mock, Vitest ou preview sem o seu login **não** conta como `PASSOU`.

---

## Antes de começar (2 minutos)

1. Abra o preview (ou produção, se preferir — anote qual).
2. Entre com **sua** conta (admin/proprietária).
3. Escolha um **caso de teste sintético** (não dado real de cliente, se possível).
4. Anote:
   - Ambiente: `preview PR #118` / `produção` / outro: ________
   - Caso (código ou ID mascarado): ________
   - Data/hora: ________

---

## Roteiro dos 5 prints obrigatórios

Coloque cada arquivo PNG/JPG na pasta indicada, com o nome sugerido.

### 01 — Inicial autenticado

| | |
|---|---|
| **Pasta** | `01-inicial/` |
| **Nome do arquivo** | `01-inicial-autenticada.png` |
| **Onde ir** | `/casos/<id>` → âncora **Jornada** (ou `/casos/<id>/contrato/preparar`) |
| **O que deve aparecer** | Você logada · URL/rota legível · caso identificável (sem dado sensível demais) · bloco **Planejador do caso** |
| **Feito?** | [ ] |

### 02 — Ação

| | |
|---|---|
| **Pasta** | `02-acao/` |
| **Nome do arquivo** | `02-acao-preenchendo.png` |
| **O que fazer** | Clicar **Revisar/Preencher planejador** · preencher objetivo, composição, fase, próxima ação, prazo · (SKU se houver) |
| **O que deve aparecer** | Formulário aberto · campos preenchidos · botão **Salvar planejador** visível |
| **Feito?** | [ ] |

### 03 — Confirmação

| | |
|---|---|
| **Pasta** | `03-confirmacao/` |
| **Nome do arquivo** | `03-confirmacao-salvo.png` |
| **O que fazer** | Clicar **Salvar planejador** |
| **O que deve aparecer** | Toast de sucesso (ex.: “Planejador salvo (vN · ativo/rascunho)”) **ou** mensagem clara de bloqueio/erro — sem fingir sucesso |
| **Feito?** | [ ] |

### 04 — Releitura (F5)

| | |
|---|---|
| **Pasta** | `04-releitura/` |
| **Nome do arquivo** | `04-releitura-apos-f5.png` |
| **O que fazer** | F5 completo (ou fechar e reabrir o planejador) |
| **O que deve aparecer** | Mesmos valores · resumo “Último plano: ativo/rascunho · vN · próxima ação…” |
| **Feito?** | [ ] |

### 05 — Integração (Ficha / Hoje)

| | |
|---|---|
| **Pasta** | `05-integracao/` |
| **Nome do arquivo** | `05-integracao-proxima-acao.png` |
| **O que fazer** | Ir ao cabeçalho do Caso 360 **e/ou** Painel Hoje / lista |
| **O que deve aparecer** | A **mesma** próxima ação (e prazo, se houver) fora do formulário do planejador — sem segundo registro inventado |
| **Feito?** | [ ] |

---

## Resultado (você preenche)

| Campo | Valor |
|---|---|
| Resultado | `PASSOU` / `FALHOU` / `BLOQUEADO_POR_DADO` / `BLOQUEADO_POR_DECISAO` / `ERRO_DE_FONTE` / `NAO_LOCALIZADO` |
| Limitação | |
| Motor sobe a `COMPROVADO_EM_USO`? | Só se `PASSOU` + 5 prints + sua declaração explícita |

Depois dos prints: avise no chat **ou** atualize  
`docs/relatorios/2026-09-10_registro-prova-autenticada-por-motor.md`  
na linha do motor (KPIs/Hoje ou Planejador / Caso).

---

## O que NÃO enviar

- Print sem login (tela de sign-in)
- Print só do toast sem releitura
- Print de mockup / demo / Vitest
- Print de outro cliente / dado real sensível sem mascarar

---

## Texto curto para colar no chat depois

```text
Prova Planejador — ambiente: …
Caso: …
Resultado: PASSOU | FALHOU | …
Prints em: docs/relatorios/provas/2026-09-11-planejador/
01 inicial ✓  02 ação ✓  03 confirmação ✓  04 releitura ✓  05 integração ✓
Observação: …
```

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL
Prints deste kit só fecham o motor após autenticação da proprietária,
releitura e integração. Código/PR/teste automatizado não bastam.
```
