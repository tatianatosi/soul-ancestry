# Coordenação rápida Claude × Lovable e prevenção de duplicados

## Objetivo
Preservar o trabalho dos dois agentes, usando o protocolo de sincronia já existente, sem reconstruir o App ou criar um segundo cadastro.

## Corte 1 — Uma tarefa e um responsável por vez
- Usar o roadmap existente para registrar responsável, arquivos reservados, base de trabalho e estado de cada tarefa.
- Lovable cuida da apresentação; Claude cuida das regras, leitores/escritores e testes. Arquivo compartilhado exige transferência explícita antes de editar.
- Claude trabalha em `claude/*`, sem empurrar na `main` durante trabalho no editor. A Proprietária confirma o branch sincronizado na interface do Lovable; o nome da branch local do sandbox não comprova essa configuração.
- Não fazer merge durante uma edição. Antes da integração autorizada, atualizar a base do trabalho e revisar arquivos removidos ou revertidos. Reutilizar os alarmes e verificações existentes.
- Validar o corte com testes pertinentes e, para telas, capturas em 375/1280. Publicação é uma decisão separada.

## Corte 2 — Evitar novos registros duplicados
- Reutilizar as verificações existentes de duplicidade e os identificadores persistidos da pessoa e do caso antes de criar um cadastro.
- Adicionar testes executáveis para a comparação compartilhada; depois extrair apenas a normalização comum, preservando diferenças de CPF, DEMO e candidatos de cada fluxo.
- Tratar separadamente a correção de consultas que falham silenciosamente e dos limites que deixam candidatos de fora; não misturar mudança de comportamento com extração mecânica.
- Mostrar candidatos à revisão humana; nunca fundir pessoas pelo nome nem arquivar registros automaticamente.

## Limites e confirmação
Branches isolam código, não dados: este projeto usa o mesmo backend na prévia e no publicado. Não executar a mesma criação pelos dois agentes.

Este corte não inclui limpar duplicados existentes, mudar permissões, aplicar migrations, fazer merge ou publicar. Essas ações precisam de autorização específica.

## Detalhes técnicos
Reutilizar `docs/politicas/PROTOCOLO-SINCRONIA-LOVABLE-GIT-2026-11-01.md`, `roadmap.md`, os workflows de sync e os leitores/escritores existentes. Não criar outro painel, cadastro, writer ou sistema de locks. A reserva de arquivos é coordenação operacional, não um bloqueio técnico garantido.