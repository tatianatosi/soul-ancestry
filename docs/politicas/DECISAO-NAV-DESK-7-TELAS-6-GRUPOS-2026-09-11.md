# Decisão de navegação do Desk — 7 telas + 6 grupos internos

**Status:** em revisão (face aplicada no código; prova autenticada da dona pendente)  
**Versão:** v1.0  
**Data:** 2026-09-11  
**Responsável:** Proprietária do Clube Ancestral  

```text
FACE PRINCIPAL (sempre visível)
1. Visão Geral          /painel
2. Casos 360            /casos
3. Checklist            /tarefas
4. Validação Jurídica   /matriz-juridica
5. Radar Interno        /qualidade
6. Alertas              /alertas
7. Biblioteca Mestre    /biblioteca

CAMADA INTERNA (recolhida)
Hoje · Comercial · Casos & Pessoas · Pesquisa · Formalização · Governança
```

- **8 grupos:** não voltam como menu principal.
- **6 grupos:** só por dentro (submenu/contexto).
- Rotas existentes permanecem. Calls, pessoa, contrato, financeiro, pesquisa e configuração: até dois cliques.
- Mobile: só os sete itens abertos; submenu fecha até toque.

Código: `FACE_DESK` + `internosDaFace` em `src/lib/navegacao-desk.ts`; barra em `src/components/saas/shell.tsx`.

Não apagar módulos, dados ou rotas. Não criar tabela nova.

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL
A decisão de face não arquiva Mesa, Pessoa 360, Pesquisa, formalização nem RLS.
```
