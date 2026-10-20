# Caso 360: envio de documentos com checklist e Árvore com pai e mãe

Tudo acontece no Desk, dentro do Caso 360. O App Cliente continua congelado e nada é publicado.

## 1. Documentos: área de envio e checklist
- Na seção Documentos do caso, entra uma área tracejada onde a equipe arrasta ou escolhe um arquivo. O arquivo vai para o acervo privado que já existe, e o registro usa o mesmo envio que o sistema já tem. Não crio um espaço novo nem regras de acesso novas.
- Ao enviar, a equipe escolhe a qual item do checklist o arquivo pertence.
- Logo abaixo, o checklist do caso. Hoje a Ana tem 18 itens ativos: 14 pendentes e 4 cumpridos. Cada item aparece com um selo escrito:
  - **OK**: item cumprido.
  - **Parcial**: item pendente que já tem arquivo enviado, mas ainda não foi conferido.
  - **Pendente**: item sem arquivo.
- "Parcial" é calculado na tela. O banco continua aceitando só as três situações de hoje.
- Você autorizou mostrar os 14 itens à família. Aqui eles aparecem só para a equipe; levar ao App fica para quando você liberar o congelamento.
- Se o envio falhar, aparece uma mensagem clara e o checklist não muda.

## 2. Árvore do Caso 360: pai e mãe
- Cada pessoa só se liga ao pai e à mãe quando esse vínculo já está liberado para a família (aprovado ou publicado).
- Onde falta o vínculo liberado, o lugar do pai ou da mãe mostra "Em preparação". O sistema nunca deduz quem é o pai ou a mãe.
- Cristiane continua fora, e Felipe aparece só como dependente menor.

## O que fica de fora
- Nada muda no App, nada é publicado, nenhum convite é enviado e o banco não muda de estrutura.
- Os arquivos novos não ficam visíveis à família por conta própria: liberar continua sendo um ato separado.

## Conferência
- Envio um arquivo de teste no caso da Ana e recarrego a página para confirmar que ele continua lá e que o item muda de Pendente para Parcial.
- Fotos no computador e no celular (375 px), sem rolagem para o lado. Verificação de erros, testes e build.

## Detalhes técnicos
- Envio: `prepararUploadDocumento` e `salvarDocumento` (`src/lib/documentos.functions.ts`), no bucket privado `documentos`. O vínculo com o item é feito pelo `evidencia_url`/observação existente em `case_checklist_items`, ou pelo próprio registro do documento ligado ao caso, sem coluna nova.
- Status: `case_checklist_items.status` (CHECK pendente/cumprido/nao_aplicavel). "Parcial" = pendente + documento vinculado com status diferente de conferido.
- Árvore: vínculos de `genealogical_relationships`/`research_relationships` filtrados por estado aprovado/publicado, na composição da árvore já usada em `casos.$caseId.index.tsx`.
- Arquivos: `src/routes/_authenticated/casos.$caseId.index.tsx` e um componente de seção de documentos. Sem rota nova.
