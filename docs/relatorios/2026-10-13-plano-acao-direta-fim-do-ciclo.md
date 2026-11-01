# Plano de Ação Direta: Quebrando o Ciclo e Entregando o App Real

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 10:55 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: plano de acao direta, quebra de ciclo de remendos e entrega imediata
caminho_no_repositorio: docs/relatorios/2026-10-13-plano-acao-direta-fim-do-ciclo.md
fontes:
  - Repositório Git (tatianatosi/soul-ancestry/src/routes/portal/)
  - Mockup Normativo de 17 Páginas (clubeancestralmockup.pdf, Páginas 3 a 9)
  - docs/relatorios/2026-10-12-minuta-oficial-contrato-2026-CB-0001.md
escopo: >
  Reconhecimento da exaustão causada por meses de remendos conceituais e estabelecimento
  de uma rota concreta e imediata de entrega: o que está pronto agora para usar
  e o passo único para o frontend no Lovable.
premissas:
  - Chega de planos teóricos de 985 linhas e diagnósticos intermináveis;
  - A rota /portal já existe no repositório com as 7 abas criadas em TypeScript;
  - O contrato e a cobrança estão prontos para envio hoje.
criterio_de_aceite: >
  Fim da sensação de 'estaca zero' com entrega de 3 artefatos prontos na mão da Proprietária.
```

---

## 1. O Que Você TEM NA MÃO Agora (Chega de Estaca Zero)

Você **não está na estaca zero**. O cansaço é legítimo porque você foi afogada em discussões conceituais, mas no mundo real você tem exatamente estes 3 ativos prontos para operar hoje [file:287]:

1. **O Contrato da Ana Luiza Está Pronto:**
   - Arquivo canônico: `docs/relatorios/2026-10-12-minuta-oficial-contrato-2026-CB-0001.md` [file:287].
   - Com todos os dados da família Silveira Rodrigues, a cláusula do Gov.br e as 10 parcelas de R$ 960 (3 assinaturas de R$ 320) [file:287].
   - **Ação imediata:** Copiar, converter em PDF e subir no `assinador.iti.br` [file:287].

2. **A Cobrança no Asaas Está Configurada:**
   - 3 assinaturas de **R$ 320,00/mês × 10 meses** (Ana Luiza, Adair e Alice) [file:287].
   - **Ação imediata:** Gerar os links no painel do Asaas e enviar no WhatsApp da cliente [file:287].

3. **O Código Real do Portal Existe no Repositório:**
   - O GitHub confirma que as rotas estão criadas em arquivos reais:
     - `src/routes/portal/index.tsx` (Home) [file:287]
     - `src/routes/portal/jornada.tsx` (Jornada) [file:287]
     - `src/routes/portal/radar.tsx` (Radar) [file:287]
     - `src/routes/portal/arvore.tsx` (Árvore) [file:287]
     - `src/routes/portal/documentos.tsx` (Documentos) [file:287]
     - `src/routes/portal/legado.tsx` (Legado) [file:287]
     - `src/routes/portal/conta.tsx` (Conta) [file:287]
   - O site está respondendo publicamente em `https://soul-ancestry.lovable.app/portal` [file:287].

---

## 2. Por Que Parece que Você Não Tem Nada?

Porque o desenvolvedor dentro do Lovable fica **discutindo regras de backoffice em vez de ajustar a camada visual** [file:491]. Ele não toca no código do React há dias porque fica esperando novas ordens sobre Desk, 101 telas e checklists [file:491].

---

## 3. O Passo Único para Acabar com o Inferno Hoje

Não deixe o Lovable encostar em nenhuma tela de Desk, Kanban ou CRM. Mande apenas esta mensagem para ele:

```markdown
ORDEM FINAL E EXCLUSIVA — PARAR O DESK E ENTREGAR A HOME DO CLIENTE (13/10/2026)

Esqueça o Desk, esqueça as 101 telas e não toque em nenhuma tabela do Supabase.

Abra o arquivo `src/routes/portal/index.tsx` e coloque na tela os 4 componentes visuais da Página 3 do clubeancestralmockup.pdf:
1. Painel com o título: "Projeto Familiar — Família Silveira Rodrigues"
2. Os 3 cartões de Próximas Ações
3. A prateleira de achados genealógicos
4. O card de suporte com o WhatsApp oficial (11 98838-4907)

Faça apenas isso, compile o build e me mande o print da tela pronta.
```
