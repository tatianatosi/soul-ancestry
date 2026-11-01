# Homologação e Parecer: Botão Reenviar no App Cliente e Fronteiras de Comunicação no Desk

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 15:15 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: homologação de UX, fronteiras de produto e governança de comunicação
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-parecer-reenviar-mensagens-app-desk.md
fontes:
  - Devolutiva Lovable (2026-10-12)
  - Prancha Visual Desk Intelligence v4
  - Mockup Canônico de 17 Páginas do App Cliente
  - Repositório tatianatosi/soul-ancestry (main)
escopo: >
  Esclarecimento sobre a fronteira de mensagens entre Desk e App Cliente,
  homologação do posicionamento do botão [Reenviar] na área de mensagens do cliente
  e definição da autoridade de comunicação no Caso 360 do Desk.
premissas:
  - O App Cliente possui a caixa de diálogo "Nova mensagem" com o time do Clube.
  - O Desk opera comunicação externa via Fila Humana de WhatsApp (communication_queue) e notas de caso.
  - Preservação do buffer: assunto e corpo do texto nunca são perdidos em oscilação de rede.
criterio_de_aceite: >
  Aprovação do botão [Reenviar] com aviso "Não foi possível enviar agora. Sua mensagem continua aqui.";
  confirmação de que o Desk não possui chat direto interno, operando via notas ou WhatsApp.
```

## 1. Homologação do Posicionamento no App Cliente

O posicionamento adotado pelo Lovable está **correto e aprovado**:
- **Localização**: Área de mensagens do App Cliente (`Nova mensagem`).
- **Comportamento Homologado**:
  - Em caso de falha de conexão no envio, exibe: *"Não foi possível enviar agora. Sua mensagem continua aqui."* acompanhado do botão **[Reenviar]**.
  - O assunto e o corpo da mensagem permanecem preenchidos no formulário, evitando retrabalho do cliente.
- **Validação de Código**: A checagem estática passou sem alterações em banco, permissões ou abas.

---

## 2. Esclarecimento sobre o Desk (Caso 360)

Em resposta à pergunta sobre onde ficaria a caixa de mensagens no Desk:
- **Não há chat direto no Desk**: O Desk Intelligence v4 **não possui caixa de mensagens de bate-papo** no Caso 360 (`/casos/$caseId`).
- **Como o Desk opera comunicação**:
  - A equipe interna registra **Notas de Acompanhamento** ou aciona a **Fila Humana de WhatsApp** (`communication_queue`), onde as mensagens são revisadas antes do envio humano.
  - Portanto, **nenhuma nova caixa de mensagem deve ser inventada no Desk**. O foco de resiliência permanece estritamente na experiência do cliente no Portal.

---

## 3. Diretriz para Publicação (Deploy)

1. **Permissão de Publicação para a Versão Final**:
   - A Proprietária autoriza manter as alterações prontas no ambiente de staging/preview.
   - O deploy final para produção do site principal (`soul-ancestry.vercel.app`) será disparado conjuntamente assim que o Caso Piloto for formalizado.

---

## 4. Mensagem Pronta para o Lovable

```markdown
RESPOSTA NORMATIVA: BOTÃO REENVIAR NO APP CLIENTE E GOVERNANÇA DO DESK
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Ambiente: Lovable

Parecer da Proprietária:

1. [POSICIONAMENTO NO APP CLIENTE APROVADO]:
   - O botão [Reenviar] na área de "Nova mensagem" do App Cliente está no lugar exato e com o comportamento perfeito.
   - Manter o aviso: "Não foi possível enviar agora. Sua mensagem continua aqui." e a preservação do texto no formulário.

2. [NÃO CRIAR CAIXA DE CHAT NO DESK]:
   - Não adicione caixa de mensagem no Desk. O Desk opera por Notas de Caso e Fila Humana de WhatsApp, sem chat direto. Sua constatação está correta.

3. [PRONTIDÃO DO PACOTE DE RESILIÊNCIA]:
   - O pacote de resiliência está homologado no staging. Pode prosseguir com o checklist das 7 abas do App Cliente (conforme o roteiro de prompts consolidado).
```
