# De-Para Executivo de Saneamento: O Que Fica, O Que Sai e Onde Cada Item É Rebaixado

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 11:50 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: plano de saneamento executivo, de-para de retirada e rebaixamento de alimentos
caminho_no_repositorio: docs/arquitetura/2026-10-13-de-para-executivo-o-que-sai-e-o-que-fica.md
fontes:
  - Plano de Consolidação Canônico (docs/arquitetura/plano-consolidacao-app-golive-desk.md)
  - docs/auditorias/mapeamento-duplicatas-todas-abas-07-09.md
  - docs/auditorias/fase-b-telas-e-checklists-08-09.md
escopo: >
  Mapeamento cirúrgico de limpeza e retirada de lixo legado do Desk:
  (1) Lista fechada das telas e rotas que DEVEM SAIR do menu principal;
  (2) Lista fechada das superfícies canônicas que DEVEM FICAR;
  (3) Rebaixamento das tabelas brutas para alimentos contextuais invisíveis.
premissas:
  - Eliminação de duplicatas de trabalho e menus inchados;
  - Rebaixamento de catálogos e cadastros brutos para seletores dentro dos ecossistemas;
  - Garantia de que a operação do dia se concentre exclusivamente no Hoje e no Caso 360.
criterio_de_aceite: >
  Tabela de-para completa de retirada do lixo legado e blindagem das superfícies canônicas.
```

---

## 1. O Que SAI do Menu Principal (Lixo Legado e Telas Concorrentes)

Para limpar a interface e eliminar a poluição que gerava a sensação de "gambiarra", **estas rotas e telas deixam imediatamente de existir como destinos de trabalho no menu** [file:502]:

| Rota / Tela que DEVE SAIR | Por Que Sai? | Para Onde Vai? (Tratamento) |
|---|---|---|
| `/crm-mestre` | Tela legada de 2024 que confunde o funil | **Rebaixada a Alimento:** vira dicionário de validação dentro de Governança [file:502]. |
| `/conversao` | Dashboard analítico solto sem ação | **Incorporado:** vira métrica derivada dentro de Comercial/Marketing [file:502]. |
| `/ops` e `/ops-excecoes` | Módulo legado com dados não validados | **Congelado em Leitura:** vira histórico consultivo, proibida nova escrita [file:502]. |
| `/tarefas` | Rota concorrente ao motor de trabalho | **Fundida no Kanban:** nenhuma tarefa é criada fora do Kanban único [file:502]. |
| `/proximas-acoes` | Lista paralela que gerava duplicatas | **Virou Filtro:** agora é apenas um filtro inteligente dentro do Kanban [file:502]. |
| `/microentregas` | Tela isolada que se perdeu do fluxo | **Incorporada:** agora vive dentro da aba do Caso 360 [file:502]. |
| `/metricas` | Dashboards estáticos com dados Bianchi | **Distribuída:** cada métrica real agora vive dentro do seu ecossistema dono [file:502]. |
| Telas brutas de SKUs / Catálogo | Catálogo de 91 SKUs que travava a Ana | **Rebaixado a Alimento:** vira apenas seletor de preço dentro do financeiro [file:502]. |
| Listas avulsas de Países e Dicionários | Menus técnicos desnecessários | **Rebaixado a Alimento:** seletores embutidos na Discovery e Pesquisa [file:502]. |

---

## 2. O Que FICA (As Únicas Superfícies Canônicas Homologadas)

O seu Desk fica reduzido estritamente a **7 ecossistemas operacionais limpos**, sem telas paralelas concorrendo [file:502]:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      O DESK V4 LIMPO E CANÔNICO                        │
├────────────────────────────────────────────────────────────────────────┤
│  0. HOJE                  ──► Comando diário: decisões e prioridades   │
│  1. COMERCIAL             ──► Lead único: Discovery/Calls e proposta   │
│  2. CASOS                 ──► Ficha 360 (4 Lotes A-D) + Planejador     │
│  3. PESSOAS & FAMÍLIAS    ──► Pessoa 360 e núcleo (sem cadastro duplo) │
│  4. PESQUISA              ──► Centro de evidências, fontes e achados   │
│  5. MARKETING             ──► Aquisição e campanhas (sem PII)          │
│  6. FORMALIZAÇÃO/FINANC.  ──► Contratos, OS e conciliação Asaas        │
│  7. GOVERNANÇA            ──► O cofre onde moram os alimentos internos │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. A Limpeza Interna de Dados: O Que Fica e o Que Sai no Caso da Ana Luiza

Para que o Caso 360 opere limpo, sem lixo histórico:

1. **O que SAI da Ficha da Ana:**
   - A fatura de R$ 1.500 (já arquivada no histórico) [file:287].
   - Personagens fictícios (*Elsa Friedmann Reimer* e *Adair Pinto Silveira avô*) [file:287].
   - Intermediários não contratados (*Dr. Klaus Becker*) [file:287].
   - Falsos botões de download de certidões que ainda não foram subidas [file:287].
2. **O que FICA da Ficha da Ana:**
   - Participantes reais: Ana Luiza, Adair, Alice e menor dependente Felipe [file:287].
   - Linhagem canônica dos 8 elos históricos com o marco de Graz 1895 de Otto Reimer [file:287].
   - Contrato `2026-CB-0001` aguardando assinatura Gov.br [file:287].
   - Previsão financeira real: 3 assinaturas de R$ 320/mês × 10 meses (R$ 9.600,00) em modo rascunho [file:287].
   - Os 3 cartões informativos de *\"Acervo sob curadoria técnica\"* [file:287].

---

## 4. O Prompt de Execução para Limpeza do Código

Para aplicar esse corte no código imediatamente, copie e envie este comando:

```markdown
COMANDO DE LIMPEZA DO DESK — APLICAÇÃO DO DE-PARA DE RETIRADA (13/10/2026)

Abra o arquivo de navegação do Desk (`src/components/layout/sidebar.tsx` ou equivalente) e execute a LIMPEZA E RETIRADA DE ROTAS CONCORRENTES:

1. REMOVA DO MENU PRINCIPAL:
- Remova os links diretos para: `/crm-mestre`, `/conversao`, `/ops`, `/ops-excecoes`, `/tarefas`, `/proximas-acoes`, `/microentregas` e `/metricas`.
- Mova essas rotas para uma seção recolhida chamada \"Governança / Legado\" ou acerte os redirecionamentos.

2. PRESERVE APENAS OS 7 ECOSSISTEMAS CANÔNICOS:
- Hoje
- Comercial (CRM Vivo + Calls)
- Casos (Caso 360)
- Pessoas & Famílias
- Pesquisa (Centro de Inteligência)
- Marketing
- Formalização & Financeiro

Rode `npm run build` e confirme a limpeza visual do menu.
```
