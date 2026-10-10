# Formulário de membros do núcleo

- Ajustar somente adicionar/editar membro na tela existente: nome, vínculo/parentesco e pessoa vinculada; manter Processo na edição.
- Apresentar Contratante/signatário e Titular com seus valores existentes, sem fundi-los. Oferecer **Requerente**, sinalizando que sua gravação aguarda Claude: a inclusão atual só aceita contratante/signatário ou dependente; a edição também não aceita requerente na lista canônica.
- Não gravar requerente como dependente, titular ou signatário. Ao selecionar Requerente, impedir o envio inválido e informar a pendência.
- Não acrescentar status cadastral: os dois escritores atuais não recebem esse campo.
- Registrar **PEDIDO AO CLAUDE** em `docs/lovable/canos-faltando.md`, incluindo a decisão de mesmo caso e a separação financeira fora deste corte.

## Validação e entrega

Abrir os dois formulários na sessão autorizada, sem salvar dados; capturar a tela em 375 e 1280 px e conferir a compilação automática. Entregar imagens e relação dos arquivos alterados, sem aceitar, integrar ou publicar o rascunho.

## Detalhes técnicos

Preservar `adicionarMembroNucleo` / `salvarMembroNucleo`, todos os campos persistidos e atributos existentes. Nenhuma edição em `src/lib`, testes, permissões, banco ou controle de acesso. Ajustar apenas apresentação e prevenção local de envio de valor não suportado.
