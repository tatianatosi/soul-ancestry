# Auditoria visual autenticada — caso Ana Luiza

**Resultado: NÃO CONFORME / NÃO APROVADO.** Prints registram o estado observado; não corrigem divergências.

## Contexto e rastreabilidade
- Data UTC do relatório: 2026-10-11T00:35:35.641871+00:00
- SHA de referência: `23ac156f462e55108dc1cfa1b243c4354f31e284`
- Rascunho atual: App Cliente — comparação atual com mockup 10/10 (`drft_01m4kn1q40ebyrm1knr10nzrdb`). Não é o antigo fe60568.
- Ambiente auditado: Vite local do rascunho, `http://localhost:8080`. Preview associado: https://id-preview-5--1a628b61-ec68-454f-85e1-671d6f297370.lovable.app (URL fornecida pelo projeto, não navegada nesta auditoria).
- Chromium, viewport 1280×1800 CSS px. Capturas de tela visível, exceto elementos completos de Hero e Heatmap. Não são capturas integrais de páginas longas.
- Sessão administrativa autorizada: tati@pluggedresearch.com, criada pela ferramenta de sessão gerenciada para a própria proprietária. Senha enviada no chat NÃO utilizada, repetida ou incluída em artefatos.
- Caso: CA-CID-AT-FAM-2026-001; UUID a11a0000-0000-4000-8000-000000000002.
- `/casos/CA-CID-AT-FAM-2026-001` redirecionou para `/casos/a11a0000-0000-4000-8000-000000000002`.
- Rotas diretas `/portal*` abertas com `?casoId=a11a0000-0000-4000-8000-000000000002`. Não representam login cliente.
- Complementos: rota existente `/app-cliente-como-pessoa?casoId=a11a0000-0000-4000-8000-000000000002`, navegação interna das sete abas; mesmo login, sem impersonação, convite ou magic link.

## Resultado por print

### 01-desk-painel-hoje.png — PARCIAL
Quatro KPIs visíveis: 2 decisões, 2 cadências vencidas, 0 casos sem próxima ação, 0 microentregas para revisão. A lateral mantém “Sessão demo do App Cliente (dado fictício)”. A exclusão de dados demo das fórmulas NÃO foi auditada; captura não comprova limpeza dos dados.

### 02-desk-caso360-hero.png — PARCIAL
CaseHealthHero presente; situação Bloqueado, contrato assinado pendente, responsável Tati Tosi. Nenhum CPF/RG/endereço aparece neste elemento. Isso não testa máscaras de campos civis, que não aparecem no recorte.

### 03-desk-radar-heatmap.png — PARCIAL
Radar Individual selecionado no caso canônico. Heatmap mostra Áustria, ramo §58c e “Aderência não calculada”; evidências pendentes. Disclaimer jurídico interno visível. Botão flutuante Assistente sobrepõe parte da última coluna: divergência visual registrada.

### 04-portal-home.png — FALHOU
Rota direta com sessão administrativa mostra identidade da Ana, Home e vazio de preparação, mas não boas-vindas personalizadas nem próxima ação. Complemento administrativo apresenta o caso e O que vem agora, sem próxima ação compartilhada.

### 05-portal-jornada.png — FALHOU
Linhas Ancestral/Processo existem, mas etapas de processo são exemplo explicitamente rotulado, não JourneyStepper real do caso na rota direta. Texto técnico “Radar · média dos eixos com base” continua visível. Na visão administrativa há etapa real separada dos exemplos.

### 06-portal-radar-6eixos.png — PARCIAL
Seis dimensões públicas presentes: Documentação, Origem, Conexões Familiares, Progresso Geral, Memória e Legado. Rota direta exibe Lacuna; complemento administrativo exibe Conexões Familiares 6/10=60%. Não são dados iguais: leitura direta com admin NÃO equivale à visão administrativa do caso.

### 07-portal-arvore.png — FALHOU
Rota direta não exibe nós reais: lacunas e genograma ilustrativo identificado. Complemento administrativo mostra seis pessoas publicadas em G3–G7, sem linhas de vínculos publicados. Não confundir exemplo com conexão real.

### 08-portal-documentos.png — FALHOU
Nenhuma evidência liberada aparece; checklist é exemplo identificado, não universo documental aprovado. Texto “não precisamos de nenhum documento” contradiz “lista completa ainda não foi compartilhada”. Envio indisponível; nenhuma ação de upload executada.

### 09-portal-legado-disclaimer.png — FALHOU
Coleções e exemplos identificados, mas Encontros de Linhagem e disclaimer legal solicitado não foram encontrados no texto renderizado da aba; não é possível certificá-los. Complemento administrativo mostra material de família, sem substituir o critério solicitado.

### 10-portal-conta-sem-upsell.png — FALHOU
Rota direta informa nenhuma assinatura e nenhum plano publicado; plano de exemplo é identificado. Complemento administrativo mostra R$320/mês aguardando confirmação, sem três parcelas. Nenhum cartão de upsell encontrado no conteúdo renderizado. Não comprova assinatura 3x, boleto, PIX ou cobrança confirmada.

## Complementos administrativos
Os sete arquivos `04` a `10` com `suplemento-admin` no nome são provas separadas da visão administrativa do App da família. Não substituir silenciosamente os prints das rotas diretas.

## Checklist executado e limites
- EXECUTADO: sessão administrativa; navegação Desk; seleção Radar Individual/caso; dez capturas solicitadas; sete complementos; inspeção visual de todas as imagens e leitura do conteúdo renderizado.
- EXECUTADO: nenhuma edição de código, dados, permissões, contratos ou publicações; nenhuma gravação de formulário, cobrança, envio ou assinatura. Somente arquivos de evidência foram adicionados.
- EXECUTADO PARCIAL: navegação das sete abas; leitura de vazios, exemplos identificados e diferenças entre portas de leitura.
- NÃO COMPROVADO: limpeza de demo nas fórmulas dos KPIs, funcionamento das máscaras civis, contraste medido, alvos medidos, overflow por medição sistemática, conteúdo abaixo da área capturada, paridade pixel a pixel, RLS, login cliente, isolamento A×B, persistência/F5, plano individual ou pagamento.
- Erros: esperas iniciais de 7s produziram páginas ainda em branco; capturas oficiais foram feitas após carregamento (20s). Um seletor incorreto no complemento Documentos foi corrigido no script de auditoria, sem alteração no App.
- Verificação complementar de navegador, após recaptura administrativa: nenhum erro JavaScript capturado nessa etapa; não certifica ausência em toda a execução. Telemetria anterior contém ResizeObserver loop.

## Pendências para conformidade
1. Conciliar a leitura direta de `/portal*` com a visão administrativa autorizada; responsabilidade dos leitores/acesso, não correção estética.
2. Resolver metadado técnico no App e sobreposição do Assistente no heatmap.
3. Disponibilizar próxima ação, etapas, evidências e encontros/disclaimer a partir de fontes autorizadas.
4. Reconciliar plano e número de parcelas: R$320/mês aguardando confirmação NÃO prova três parcelas.
5. Comprovar filtros demo e máscaras por testes adequados, sem dedução por imagem.

Nenhum item foi aprovado, integrado ou publicado. Este é registro de inspeção administrativa, não aceite operacional do cliente.
