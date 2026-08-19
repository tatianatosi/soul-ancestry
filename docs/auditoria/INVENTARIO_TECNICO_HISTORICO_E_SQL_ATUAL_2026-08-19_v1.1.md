# Inventário Técnico, Histórico e SQL Atual — 2026-08-19 v1.1

**Status:** baseline de auditoria técnica; complementa o histórico documental e deve ser atualizado por inspeção de código e banco.

## Escopo

Este inventário estabelece a separação entre: histórico narrativo/documental; estado de implementação no repositório; e estado de dados/SQL. Ele não presume que um artefato histórico esteja vigente nem que uma tela represente a regra completa de banco.

## Repositório identificado

- Repositório: `tatianatosi/soul-ancestry`
- Estrutura raiz observada: `src/`, `supabase/`, `scripts/`, `public/`, `output/`, arquivos de configuração e documentação raiz.
- Diretório `docs/` não existia na raiz no momento da preparação deste inventário; este commit o cria para concentrar auditoria e documentação técnica.
- Há arquivo `.env` versionado na raiz do repositório; deve ser inspecionado em fluxo protegido e removido do controle de versão caso contenha segredo, credencial, token ou valor operacional real.

## Estado técnico a inspecionar

| Domínio | Evidência recente | O que auditar no código/SQL | Resultado esperado |
|---|---|---|---|
| Acesso e UUID | `c9b31ce6`, `81fd9335` | Autenticação, validações, mensagens e políticas de acesso | Regra de acesso documentada e testada |
| País/canônico e Áustria | `22dfd69d`, `3de2e018`, `321d15f7` | Tipos, catálogos, pré-carga, componentes e dados de referência | Dicionário e normalização canônicos |
| Contrato | `ff590b46` | Templates, geração, dados obrigatórios, logs e funções | Correção P0 explicada e regressão coberta |
| Família | `7d8c96de`, `457c5ace`, `e2e82b33` | Tabelas, relações, RLS, telas, mutações e auditoria | Modelo pessoa-família-caso seguro |
| Proposta | `65071568`, `c56dd8ec`, `f11cd74b` | Status, versionamento, pré-carga e integração Canva | Precedência e arquivo sem ambiguidade |
| Despesas | `a24aba9b`, `dc2bff1e` | Tabelas, cálculo, exibição, contrato e permissões | Regra reproduzível e auditável |
| UI e testes | `02ba9fa9` | Componentes, testes e critérios de aceite | Cobertura e cenário de negócio documentados |

## Inventário SQL mínimo a produzir

Para cada tabela, view, função, trigger, policy e migration, registrar: nome; finalidade; domínio; PII/LGPD; chaves e vínculos; operações permitidas; RLS; consumidor no app; origem de pré-carga; dependências; owner; status de teste; e referência de commit.

## Regras de segurança e versionamento

1. Não versionar chaves, credenciais, tokens ou dumps com dados pessoais reais.
2. Manter arquivo `.env.example` apenas com nomes de variáveis e valores fictícios.
3. Tratar schema e migrations como fontes de verdade técnica; exports de ambiente são evidência auxiliar.
4. Toda alteração em RLS, dados familiares, preço, contrato ou integração financeira exige documentação de impacto e teste de regressão.
5. Qualquer SQL que trate dados de clientes deve ser revisado sob princípios de minimização, finalidade e controle de acesso.

## Lacunas abertas

- Diffs dos commits ainda não foram inspecionados arquivo a arquivo neste documento.
- Estrutura atual do banco, migrations e políticas RLS ainda precisam de extração técnica.
- A presença e o conteúdo de `.env` exigem verificação de segurança antes de qualquer repositório público ou compartilhamento amplo.
- O relacionamento entre dados de proposta, grupo familiar, SKU, preço, despesas e contrato requer mapa de dados consolidado.

## Próximo passo técnico

Executar inventário do diretório `supabase/`, das migrations e dos componentes/serviços em `src/`, cruzando cada item com as threads do inventário de implementação.
