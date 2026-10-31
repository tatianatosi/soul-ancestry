# Anos nos cartões da Árvore (Otto e Ana Luiza)

## O que muda
- **Otto Reimer:** registrar nascimento em 1895, com precisão "ano", no perfil liberado dele. A fonte é o registro de nascimento de Graz, que você informou em 12/10. Para manter a origem, a nota cita essa fonte e a sua autorização de hoje.
- **Ana Luiza:** registrar nascimento em 2001 no perfil liberado dela, a partir do cadastro de pesquisa (29/07/2001, data exata). O cartão mostra só o ano.
- Heinrich, Lotte, Cleusa, Ana Maria e Adair continuam sem ano, porque não há data em nenhum registro.

## Como
1. Gravar os dois perfis pela ação de edição de perfil que já existe no Desk, entrando como você, para ficar a auditoria normal. O estado "verificação pendente" não muda.
2. Conferir na prévia, em 375 e 1280 px: "n. 1895" em Otto, "n. 2001" em Ana Luiza, "n. 1873" em Rudolf, e nenhum outro ano.
3. Publicar em https://soul-ancestry.lovable.app e conferir a Árvore no link público.

## Detalhes técnicos
- Campos: `genealogical_person_profiles.nascimento_data` e `nascimento_precisao` (`ano` para Otto, `exata` para Ana Luiza). Se essa ação não existir no Desk, uso uma atualização pontual desses dois perfis, com nota de origem.
- Código, parentescos e visibilidade não mudam.
