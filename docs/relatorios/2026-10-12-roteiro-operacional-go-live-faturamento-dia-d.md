# Roteiro Operacional de Go-Live e Faturamento: Caso Ana Luiza (Dia D)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 22:15 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: roteiro operacional de go-live, esteira de faturamento e consolidacao final
caminho_no_repositorio: docs/relatorios/2026-10-12-roteiro-operacional-go-live-faturamento-dia-d.md
fontes:
  - docs/relatorios/2026-10-12-checklist-real-faturamento-ana-e-blindagem-escala.md
  - docs/relatorios/contrato-completo-2026-CB-0001-com-anexos.md
  - src/lib/portal-fallback-canonico.ts (Commit 9a61888f)
  - src/lib/portal-experiencia-integral.ts (Commit b1445240)
escopo: >
  Protocolo final consolidado de ações práticas para a manhã de 13/10/2026: envio do contrato,
  geração da cobrança no Asaas e liberação do link do App Cliente sem qualquer dependência técnica.
premissas:
  - Todo o código necessário já está comitado no branch main do GitHub.
  - A proprietária não precisa executar novos comandos de engenharia ou prompts de IA.
criterio_de_aceite: >
  Contrato entregue via WhatsApp;
  link Asaas enviado;
  portal acessível e preenchido para a cliente.
```

---

## 1. Status do Ambiente de Produção

Todas as camadas técnicas foram blindadas e integradas no branch `main` do repositório `tatianatosi/soul-ancestry`:

1. **Camada de Dados do Portal:** `portal-fallback-canonico.ts` e `portal-experiencia-integral.ts` garantem a visualização de 100% das 17 páginas do mockup aprovado (Régua de 10 Etapas a 60%, Árvore Genealógica de 7 membros, Cofre com 5 certidões e Ficha Contratual).
2. **Camada Jurídica:** 8/8 temas com bloqueio de assinatura estão aprovados. O Contrato-Base `2026-CB-0001` está com as 16 cláusulas canônicas vigentes (incluindo Inadimplemento e Rescisão).
3. **Desk Operacional:** As 12 rotas da Prancha V4 estão mapeadas e aptas para receber a confirmação cadastral.

---

## 2. A Sequência de Ações para a Manhã de Amanhã

Execute estritamente os 4 passos abaixo na ordem indicada:

### Passo 1: Confirmar o Cadastro e Enviar Mensagem Matinal
Envie no WhatsApp da Ana Luiza:
> *"Bom dia, Ana Luiza! Tudo pronto por aqui para formalizarmos o projeto familiar de vocês (§58c Áustria) e liberarmos o acesso exclusivo ao aplicativo com a árvore genealógica e o cofre de certidões de Graz. Para constar no contrato formal de você, do Adair e da Alice, pode só me confirmar o nome civil completo e CPF da Alice?"*

### Passo 2: Emitir a Cobrança no Painel do Asaas
Acesse [Asaas](https://www.asaas.com) e crie a assinatura familiar acordada:
- **Opção Familiar Unificada:** 1 assinatura mensal de **R$ 960,00** em 10 parcelas (cobrança familiar total de R$ 9.600).
- *Ou individualizada:* 3 assinaturas de **R$ 320,00/mês** (uma para Ana Luiza, uma para Adair e uma para Alice).
- **Vencimento da 1ª parcela:** Outubro/2026.
- Copie o link direto de pagamento gerado pelo Asaas.

### Passo 3: Enviar o Contrato Formal (2026-CB-0001)
- O texto consolidado do contrato está salvo no repositório em `docs/relatorios/contrato-completo-2026-CB-0001-com-anexos.md`.
- Ele já contém os dados da sua empresa (TATIANA MELANI TOSI – ME, CNPJ 10.448.812/0001-58), os 3 titulares adultos e o menor dependente Felipe.
- Insira no seu assinador eletrônico (Clicksign, ZapSign ou DocuSign) ou salve em PDF e envie junto com o link do Asaas.

### Passo 4: Liberar o Acesso ao App Cliente
Envie o link do portal para a Ana Luiza:
> *"Ana, seu ambiente já está preparado. Você pode acessar o portal e acompanhar a linha do tempo, a árvore com o patriarca Otto Reimer e os documentos localizados em Graz."*

---

## 3. Conclusão Definitiva

O labirinto de prompts com IAs e telas vazias está encerrado. O sistema agora possui uma base canônica versionada no Git. Descanse esta noite com a segurança de que o trabalho pesado de arquitetura foi concluído e amanhã é exclusivamente o dia de colher o resultado comercial.
