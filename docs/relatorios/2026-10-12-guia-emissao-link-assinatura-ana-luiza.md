# Guia Operacional: Emissão do Link de Assinatura Digital do Contrato 2026-CB-0001

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:20 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: guia operacional de assinatura eletronica, disparo de minuta e formalizacao
caminho_no_repositorio: docs/relatorios/2026-10-12-guia-emissao-link-assinatura-ana-luiza.md
fontes:
  - docs/relatorios/contrato-completo-2026-CB-0001-com-anexos.md
  - docs/relatorios/2026-10-12-detalhamento-proximo-passo-go-live.md
escopo: >
  Instruções para geração do link oficial de assinatura eletrônica do Contrato 2026-CB-0001
  via plataforma de assinatura digital (Clicksign, ZapSign ou Gov.br) ou disponibilização
  direta no Portal do Cliente com aceite eletrônico formal.
premissas:
  - As plataformas de assinatura eletrônica externas dependem da chave de API da conta da proprietária ou de upload direto no painel web.
  - A minuta canônica 2026-CB-0001 está 100% pronta e comitada em main.
criterio_de_aceite: >
  Roteiro de 3 minutos para subir o PDF e disparar o link de assinatura;
  opção alternativa de aceite digital com hash no Portal do Cliente.
```

---

## 1. Como Gerar o Link de Assinatura em 3 Minutos

Como as plataformas de assinatura eletrônica (Clicksign, ZapSign, DocuSign ou D4Sign) exigem acesso autenticado à sua conta da plataforma para geração de tokens de signatários, o caminho mais rápido para você disparar o link agora é:

### Método A: Via Plataforma de Assinatura (Clicksign / ZapSign / D4Sign)
1. **Baixar a Minuta:** Baixe ou copie o texto do contrato oficial gravado em `docs/relatorios/contrato-completo-2026-CB-0001-com-anexos.md` e salve como PDF.
2. **Fazer Upload no Painel:** Acesse o painel da sua plataforma de assinatura e faça o upload do PDF `Contrato_Familiar_2026_CB_0001.pdf`.
3. **Adicionar Signatários:**
   - **Tatiana Melani Tosi** (Contratada — Você)
   - **Ana Luiza Gomes Silveira Rodrigues** (Contratante Principal e representando o menor Felipe)
   - **Adair Pinto Silveira Júnior** (Contratante)
   - **Alice Gomes Silveira** (Contratante)
4. **Gerar Link:** A plataforma gerará um **Link de Assinatura Exclusivo** para envio via WhatsApp ou e-mail.

---

### Método B: Aceite Eletrônico Integrado no App Cliente (Portal)
Se você preferir que a Ana Luiza assine dentro do próprio aplicativo sem pagar plataforma externa:
- O Portal do Cliente já possui a rota `/portal/conta` exibindo a ficha do **Contrato 2026-CB-0001**.
- Pode ser ativado o botão **"Li e Aceito os Termos do Contrato Familiar"**, que registra o carimbo de data, hora, IP e dados do titular, em total conformidade com a MP nº 2.200-2/2001 e Lei 14.063/2020.

---

## 2. Mensagem Pronta de Envio para o WhatsApp

Assim que o link for gerado na sua plataforma ou no Portal:

> *"Ana Luiza, segue o link para assinatura eletrônica do nosso Contrato Familiar (2026-CB-0001) cobrindo a assessoria de você, do seu pai Adair e da sua irmã Alice perante a MA 35 da Áustria:*
>
> 🔗 **Link de Assinatura Digital:** `[COLAR_LINK_AQUI]`
>
> *Após a assinatura, você já poderá acessar o Portal do Cliente e visualizar a linha do tempo e os registros genealógicos da família."*
