# Prompt Canônico: Desk Operacional e Painel Administrativo de Publicação

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 18:25 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: prompt de engenharia de backend/frontend, governança operacional e painel administrativo
caminho_sugerido_no_repositorio: docs/prompts/2026-10-12-prompt-lovable-desk-administrativo-publicacao.md
fontes:
  - CA-CONN-01_base_existente_desk.md
  - mapa-autoridade-admin-desk-app.md
  - prancha-comparativa-desk-v4-12-rotas-1440-2026-09-24-4.jpg
  - Dossiê Consolidado Ana Luiza (CA-CID-AT-FAM-2026-001)
escopo: >
  Instruções para o Lovable estruturar o fluxo de autoridade do Desk Administrativo,
  garantindo botões de ação e modais para a Proprietária publicar marcos na Jornada,
  aprovar conexões da Árvore e liberar certidões com visibilidade 'aprovado_para_cliente'.
premissas:
  - O App Cliente consome estritamente o que foi publicado no Desk.
  - A Proprietária é a autoridade máxima de curadoria genealógica.
  - O painel deve ser funcional, direto e integrado ao Supabase RLS existente.
criterio_de_aceite: >
  Disponibilização do botão 'Publicar Marco' na visão Caso 360 / Jornada;
  ação de 'Aprovar Vínculos de Parentesco' na gestão de Pessoas da Árvore;
  seletor de visibilidade de documentos ('Apenas Interno' vs. 'Aprovado para Cliente');
  atualização reativa do App Cliente após ação de publicação.
```

---

## Texto do Prompt para o Desk Administrativo (Lovable)

```markdown
PAINEL ADMINISTRATIVO (DESK OPERACIONAL): GESTÃO DE PUBLICAÇÃO DE MARCOS, VÍNCULOS E DOCUMENTOS

Atenção Lovable: O Desk Administrativo (/admin/desk) é a central de comando da Proprietária para curadoria dos casos familiares. O App Cliente só exibe o que a Proprietária aprova e publica aqui. Implemente os controles e ações operacionais abaixo com layout profissional, sóbrio e altamente funcional:

---

### 1. Visão Caso 360 / Curadoria da Jornada (/admin/desk/caso360)
- [BOTÃO E MODAL: NOVO MARCO HISTÓRICO]:
  - Adicione a ação destacada "Publicar Marco na Jornada".
  - Campos do formulário:
    - Título do Evento (ex: "Nascimento de Franz Friedmann", "Emigração e Desembarque no Rio").
    - Data / Ano (ex: "24/09/1895", "1938-1939").
    - Localidade / Origem (ex: "Graz, Estíria, Áustria").
    - Documento Comprobatório (vínculo opcional a um arquivo do acervo).
    - Status de Publicação: Seletor "Rascunho Interno" vs. "Publicado para o Cliente" (com switch visual claro).
  - Ao salvar como "Publicado", o marco passa a renderizar imediatamente na timeline da aba Jornada do App Cliente.

---

### 2. Gestão da Árvore e Vínculos Familiares (/admin/desk/pessoas)
- [CONEXÃO E APROVAÇÃO DE LINHAGEM]:
  - Na lista de pessoas cadastradas do caso (Franz Friedmann, Ruth Reimer, etc.), adicione ação em lote ou individual de "Aprovar Vínculo Familiar".
  - Modais de Filiação: Permitir selecionar de forma rápida Pai, Mãe e Cônjuge para cada nó da árvore.
  - Botão de Ação Mestra: "Homologar Linhagem e Publicar Árvore".
  - Ao clicar, o sistema marca as conexões como ativas no banco, fazendo as linhas conectoras aparecerem no App Cliente.

---

### 3. Cofre e Gestão de Documentos (/admin/desk/documentos)
- [CONTROLE DE VISIBILIDADE E DOWNLOAD]:
  - Na tabela de documentos do caso, adicione uma coluna de controle com badge de status:
    - `Interno (Pesquisa / Rascunho)`: Visível apenas no Desk.
    - `Aprovado para Cliente`: Libera o cartão e o botão de download no App Cliente.
  - Ação rápida na linha da tabela: Botão de alternância (Toggle) "Liberar para Cliente".
  - Ao marcar como aprovado, o documento é refletido instantaneamente na aba Documentos da titular (Ana Luiza).

---

### 4. Barra Superior de Governança e Feedback
- Adicione na barra superior do Desk o indicador de status do caso:
  - "Projeto Familiar: Ana Luiza (CA-CID-AT-FAM-2026-001) | Modo de Edição Administrativa".
- Notificações de Sucesso: Ao publicar qualquer marco, vínculo ou documento, exiba toast discreto: "Atualização publicada com sucesso no App do Cliente".

Implemente esses 3 controles de forma integrada, mantendo o design sóbrio do Desk e a sincronização reativa com o banco.
```
