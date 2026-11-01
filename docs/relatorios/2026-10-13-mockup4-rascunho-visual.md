# Mockup 4 — rascunho visual isolado

## IMPLEMENTADO
- Home: achados reais expansíveis, passos registrados preservados, acesso ao WhatsApp pela fonte oficial.
- Jornada: duas linhas no desktop, uma coluna no celular, sem alterar marcos e divergências de conteúdo.
- Árvore: moldura única mais leve e relações existentes preservadas; foco, modos e ficha expansível mantidos.
- Radar: detalhes expansíveis das seis dimensões existentes, sem percentuais fabricados.
- Documentos: cofre atual preservado; nenhum PDF/botão inventado, nenhuma operação de envio executada.
- Legado: coleções existentes e leitura expansível de materiais aprovados; nenhuma narrativa/foto acrescentada.
- Conta: modalidade prevista, não assinatura ativa; contato oficial acessível, ficha em uma coluna no celular.
- Hoje: quatro indicadores existentes e operação visível, fontes GoLive inalteradas.
- Casos: lista com nome/país/código/formalização/saúde/condição/próxima ação; novo caso contextual recolhido, CRUD existente.
- Checklist: tabela no desktop, leitura por registro no celular, selo de prioridade e abrir caso vinculado.
- Jurídico: temas existentes expansíveis; nenhum registro de revisão/decisão executado.
- Radar Interno: leitor e eixos preservados; controles matriz/individual existentes.
- Alertas: origem, filtros e ações existentes preservados, sem reconhecer/reprogramar/criar tarefas.
- Biblioteca: entradas do acervo em cartões, busca/gestão existentes; sem publicação ou arquivamento.
- Caso 360: quatro lotes A–D existentes mantidos, títulos sequenciais reforçados; oito seções inalteradas.

## Arquivos e diff
- App: `src/routes/portal/{index,jornada,radar,legado,conta}.tsx`, `src/components/portal/portal-v11.css`.
- Desk: `src/routes/_authenticated/{painel,casos.index,tarefas,matriz-juridica,qualidade,alertas,biblioteca,casos.$caseId.index}.tsx`.
- CSS local: `src/components/desk/mockup4-superficies.css`, ativo somente sob `data-desk-mockup4`.
- `src/components/saas/entidade-crud.tsx`: somente rótulos de coluna para leitura móvel, sem mudança de leitor/escritor.
- `src/components/desk/mockup4-presentation.test.ts`: seis contratos de apresentação.
- `AGENTS.md`: escopo da apresentação local; `roadmap.md`: checklist e bloqueios.
- Nenhum arquivo em `src/lib`, schema, permissão, acesso, token global ou rota nova alterado.

## TESTADO
- Capturas ANTES/DEPOIS das 14 superfícies em 375 e 1440: `/tmp/browser/mockup4/{before,after}/`.
- Interações: `/tmp/browser/mockup4/controls/`; foco/expansão/modos da Árvore, WhatsApp sem abrir conversa, curadoria sem downloads falsos, coleções, nome real e condição prevista, busca de tarefas e F5, temas jurídicos, seleção do Radar, filtros de Alertas, busca da Biblioteca, quatro lotes do Caso.
- 45/45 testes seletivos; seis contratos de apresentação repetidos após o último ajuste, todos aprovados; build da plataforma OK 17:23:53 UTC.
- SHA observado após o corte visual: `79ed647e` (registro automático da plataforma, não aceite nem publicação).
- Uma rodada adicional com A2 teve 45/46: teste antigo obriga duas colunas no celular e contradiz esta ordem. Não foi reescrito.
- Controles autenticados como Proprietária: zero erros de página/console; 14 telas sem overflow horizontal nas duas larguras.
- Capturas iniciais do Hoje continham carregamento; repetidas aguardando os quatro indicadores, sem apresentar loading como validação.
- Corrigidos erro de tipagem na lista, coluna Título repetida e expansão móvel com span de duas colunas.
- Nenhuma submissão operacional, integração, aceite de rascunho, merge ou publicação realizada. Sessão restaurada somente em localhost, sem tokens em relatório/capturas.

## PENDENTE HOMOLOGAÇÃO / PEDIDO AO CLAUDE
1. O shell atual tem oito entradas de navegação; a ordem pede seis grupos. Reconciliar a fonte oficial e aplicar em corte autorizado de navegação, não trocar aqui unilateralmente.
2. Home usa pessoas publicadas como núcleo; ancestrais aparecem nessa lista. O leitor precisa distinguir núcleo/árvore sem inferência. Cleusa/Ana Maria ainda compartilham G3 registrada: revisar a origem, sem movimentar nós por dedução.
3. Resumo Caso 360 usa eventos internos (inclusive notas de fontes), não os quatro marcos genealógicos publicados. Reconciliar leitor canônico da timeline; não tratar notas como fatos genealógicos.
4. Documentos master não dispõe de metadados/URLs suficientes; disponibilizar somente arquivos reais autorizados. Três evidências internas não equivalem a PDFs liberados.
5. Contrato/Gov.br/OS e ações de contrato/coleta/busca sem fonte registrada não foram preenchidos como fatos. Narrativas/fotos/achados/FAQ sem aprovação continuam ausentes.
6. Adequar A2 à última decisão mobile sem alterar regras de dados.
7. Expansão de achados da Home e conteúdo do Legado foi implementada, mas não exercitada com achado/material disponível suficiente; nenhuma fixture foi injetada.

Não há declaração de paridade idêntica ou COMPROVADO_EM_USO: as limitações reais acima impedem isso. A aprovação visual da Proprietária e eventuais correções de fonte precedem integração/publicação. A publicação principal permanece congelada.