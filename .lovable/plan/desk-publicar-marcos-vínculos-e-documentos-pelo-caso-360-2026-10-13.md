# Desk: publicar marcos, vínculos e documentos pelo Caso 360

As rotas `/admin/desk/...` não existem e não serão criadas. Tudo entra nas telas oficiais: Caso 360 (`/casos/$caseId`) e Pessoas e linhagens (`/pessoas-linhagens/$caseId`). Antes de construir qualquer coisa, reaproveito o que já existe.

## 1. Marcos da Jornada (Caso 360 → seção Jornada)
- Hoje não há formulário para marcos; os 4 da Ana foram gravados por mim direto no banco.
- Novo botão "Novo marco da Jornada", abrindo um formulário curto: título, data/ano, local, documento de prova (opcional, só arquivos já existentes no caso), e um seletor claro "Rascunho interno" / "Publicado para a cliente".
- Lista dos marcos do caso com ação "Publicar" / "Voltar para rascunho" e "Arquivar" (com motivo, nunca apagar).
- Ao publicar, o marco aparece na Jornada do App; toast "Atualização publicada no App da cliente".

## 2. Vínculos e Árvore (Pessoas e linhagens)
- Já existem: cadastro de relações (aba Relações) e o botão de publicar a Árvore no App. Não serão duplicados.
- Acrescentar só o que falta: em cada pessoa, escolha rápida de Pai, Mãe e Cônjuge entre as pessoas do caso, e "Aprovar vínculo" individual ou em lote. Toast ao publicar.
- Nada é ligado automaticamente; cada vínculo é decisão sua.

## 3. Documentos (Caso 360 → seção Documentos)
- Coluna com selo em texto "Interno" / "Aprovado para a cliente" e um botão "Liberar para a cliente" / "Recolher", usando a marcação de liberação que já existe nos documentos.
- O botão de baixar no App só aparece quando há arquivo de verdade; liberar sem arquivo fica bloqueado com aviso.

## 4. Faixa de contexto
- No topo do Caso 360: "Projeto familiar: <nome> (<código>) · Modo de edição administrativa", lido do caso aberto (não fixo na Ana).

## Fora do escopo
- Sem tabela nova, sem mudança de permissões, sem envio a cliente, sem publicar o site.

## Técnico
- Escrita via funções de servidor autenticadas (`requireSupabaseAuth`), checando papel admin/operações/pesquisador, sob as regras de acesso existentes; cada publicar/recolher grava auditoria (ator, antes/depois).
- Marcos em `app_projections` (`projection_type='linha_tempo'`, `approval_status` draft/published). Vínculos em `genealogical_relationships`. Documentos via colunas de liberação existentes de `documents`.
- Toasts com sonner. Testes unitários dos helpers; capturas 1440/375 e releitura após F5.
- Entregar em 3 cortes (marcos → documentos → vínculos), parando para sua conferência entre eles.
