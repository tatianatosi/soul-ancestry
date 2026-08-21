# Biblioteca Mestre — base operacional interna

Consolidar a Biblioteca Mestre como uma das áreas principais do Desk, com 10 subáreas internas. Sem novas abas globais, sem redesenho de navegação, sem exposição ao App Cliente.

## O que já existe (reaproveitar, não recriar)

- `citizenship_tracks` — já tem país, nacionalidade, via preliminar, marco jurídico, requisitos, riscos, autorização de pesquisa, revisão humana e texto sanitizado.
- `genealogical_sources_catalog` — catálogo de acervos, cartórios, bases e coleções, com acesso, restrições, risco e revisão.
- `product_catalog` — Top 30 interno com SKU, prioridade, homologação, preço vigente/legado e escopo.
- `label_taxonomy` — etiquetas operacionais.
- Subáreas já declaradas em `src/lib/biblioteca-mestre.ts` e na árvore canônica do Desk.

## Migrations (3 tabelas novas)

1. **controlled_taxonomies** — domínio, código, nome, descrição, ativo, versão, responsável, auditoria. Domínios controlados: tipo de fonte, documento, evidência, estado de evidência, tipo de achado, relação genealógica, evento genealógico, linha de transmissão, país/localidade, etiqueta operacional, categoria de risco, estado de pesquisa, estado de relatório F1/F2.
2. **versioned_legal_rules** — tema, trilha opcional, versão, vigência início/fim, fonte, escopo, exceções, dados necessários, status (rascunho | em_revisao | aprovado | arquivado), revisor e data de revisão.
3. **master_library_items** — categoria (as 10 subáreas), título, descrição interna, versão, status, owner, referência interna, item substituído, motivo e data de arquivamento.

Para cada tabela: GRANT para `authenticated` e `service_role` (sem `anon`), RLS por `organization_id`, trigger de `updated_at`, trigger de auditoria sanitizada (criação, edição, ativação, arquivamento, revisão) e bloqueio de exclusão física — só arquivamento com motivo.

Seeds como opções controladas (sem dados reais de cliente): trilhas Itália, Portugal, Espanha, Alemanha, Áustria, Polônia, Hungria, Luxemburgo, Croácia, Romênia, Brasil (naturalização/residência), Multipaís, Em investigação; e os domínios de taxonomia acima.

## Código

- `src/lib/biblioteca-mestre.ts` — ampliar cada subárea com campos canônicos, status permitidos e regra interna; helper de sanitização que impede projeção ao App Cliente.
- `src/lib/biblioteca-mestre.functions.ts` — server functions autenticadas: listar/filtrar por subárea, detalhe com histórico, criar/editar auditado, arquivar com motivo. Nenhuma consulta externa.
- `src/routes/_authenticated/biblioteca.tsx` — passa a hospedar a Biblioteca Mestre completa: visão geral com contadores por subárea, busca (nome, código, país, tipo, versão, status), filtros (subárea, status, responsável, país/trilha, data de revisão), listas/cards, detalhe com versão e vínculos, estados vazios claros. O Manifesto de Resgate vira uma seção dentro de Governança.
- `src/components/desk-app.tsx` — a aba Biblioteca Mestre mantém as 10 subáreas já implementadas, agora com contadores reais.
- Ligação com pesquisa: `pesquisa-evidencias.$caseId` passa a ler taxonomias e trilhas da Biblioteca em vez de listas locais.

## Regras aplicadas

- Nenhum cálculo automático de elegibilidade, prazo ou conclusão jurídica.
- Nenhuma publicação direta de base, regra, referência ou trilha ao cliente.
- Top 30 permanece interno; sem criar cobrança, link ou alteração de preço.
- Arquivo Histórico preserva legado, marcado como não operacional.
- Caso Ana: associação apenas referencial à trilha Áustria / 58c em confirmação, com revisão jurídica obrigatória.

## Testes

- Subáreas: as 10 existem e a navegação de topo continua com as abas atuais.
- Sanitização: nenhum item da Biblioteca é projetável ao App Cliente.
- Regras jurídicas: item sem versão vigente e aprovada não é aplicável a caso.
- Catálogo: só item homologado e vigente é elegível para proposta.
- Arquivamento: exclusão física bloqueada; arquivamento exige motivo.
