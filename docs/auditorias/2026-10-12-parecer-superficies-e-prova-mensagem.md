# Homologação e Diretriz: Separação de Superfícies (Caso 360 vs. App Cliente) e Prova de Mensagem

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 16:45 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: homologação de segurança, separação de superfícies e protocolo de teste de mensagem
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-parecer-superficies-e-prova-mensagem.md
fontes:
  - Devolutiva Lovable / Teste de Prova (2026-10-12)
  - Prancha Visual Desk Intelligence v4 (Caso 360: Hero e Ficha Civil)
  - Mockup Canônico de 17 Páginas (App Cliente: 7 abas sanitizadas)
  - Repositório tatianatosi/soul-ancestry (main)
escopo: >
  Homologação do resultado NAO_LOCALIZADO para dados civis na visão do App Cliente,
  confirmação da separação estrita de superfícies (Hero no Desk vs. 7 abas no Portal)
  e escolha da Proprietária sobre o teste de mensagem de suporte.
premissas:
  - O App Cliente JAMAIS exibe CPF, RG ou endereços desnecessários na tela.
  - A ficha civil completa com máscaras pertence exclusivamente ao Caso 360 e Pessoa 360 do Desk.
  - A prova de envio de mensagem de suporte não deve sujar o histórico com mensagens fictícias em produção.
criterio_de_aceite: >
  Aprovação do registro NAO_LOCALIZADO como comportamento seguro e correto;
  diretriz para teste de mensagem na opção "Só simule";
  orientação de conferência dos dados civis no Caso 360 do Desk.
```

## 1. Parecer sobre o Registro `NAO_LOCALIZADO` na Ficha Civil

A conduta do testador/Lovable foi **absolutamente correta e aprovada**:
1. **Comportamento Seguro e Canônico**:
   - O fato de o resumo de saúde do caso (Hero do Desk) não aparecer na tela *"Ver App Cliente como pessoa"* é o comportamento projetado pelo Design System.
   - O App Cliente é a interface da família e **por regra constitucional do Clube Ancestral nunca exibe CPF, RG ou endereço** desnecessariamente.
   - O registro `NAO_LOCALIZADO` reflete a integridade da sanitização: não houve inventação de dados e a privacidade foi preservada.
2. **Onde conferir a Ficha Civil com Máscaras**:
   - A conferência dos dados civis mascarados deve ser feita na superfície correta: **Caso 360 (`/casos/$caseId`)** e **Pessoa 360 (`/pessoas/$pessoaId`)** no Desk Intelligence v4.

---

## 2. Escolha Vinculante sobre o Teste da Mensagem de Suporte

Em resposta à consulta sobre a prova de envio da mensagem de suporte ("Pode enviar", "Só simule" ou "Eu mesma faço"):

- **Escolha da Proprietária**: **"SÓ SIMULE"**.
- **Diretriz de Execução**:
  - Simular o disparo da mensagem no ambiente de staging com interceptação da requisição (mockando a falha de rede temporária).
  - O objetivo do teste é unicamente comprovar que o aviso *"Não foi possível enviar agora. Sua mensagem continua aqui."* e o botão **[Reenviar]** aparecem, mantendo o assunto e o corpo digitados no formulário sem gravar lixo no banco de produção.
  - A mensagem real para o time será enviada pela própria Proprietária durante o primeiro acesso oficial de Ana Luiza.

---

## 3. Mensagem Pronta para o Lovable

```markdown
RESPOSTA NORMATIVA: PARECER DE SUPERFÍCIES E TESTE DE MENSAGEM
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Ambiente: Lovable

Parecer da Proprietária:

1. [REGISTRO NAO_LOCALIZADO APROVADO]:
   - Seu registro `NAO_LOCALIZADO` está 100% correto. O App Cliente não deve expor CPF, RG ou endereço.
   - A ficha civil com máscaras pertence ao Caso 360 no Desk (/casos/$caseId), onde será homologada pela Proprietária. Não inventar dados foi a conduta perfeita.

2. [TESTE DA MENSAGEM DE SUPORTE: OPÇÃO "SÓ SIMULE"]:
   - Escolha: "Só simule".
   - Simule a falha de envio para validar que o aviso "Não foi possível enviar agora. Sua mensagem continua aqui." e o botão [Reenviar] aparecem, e que o texto não é perdido.
   - Não envie mensagem real no banco agora. A mensagem real será enviada pela Proprietária no primeiro acesso oficial.
```
