# Resolução de Governança de Marca: Confirmação da Paleta Canônica do App Cliente

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 18:35 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: governança de design system, resolução de tokens canônicos e desambiguação
caminho_sugerido_no_repositorio: docs/politicas/2026-10-12-resolucao-paleta-canonica-app-cliente.md
fontes:
  - Repositório tatianatosi/soul-ancestry (src/styles/tokens-clube-ancestral.css - Corte 1)
  - Captura de tela IMG_3095.jpeg (Modal de Escolha de Paleta do Lovable)
  - relatorio-divergencias.md (Auditoria de 10/10/2026)
  - Artefato do Dia 2026-09-18.pdf
escopo: >
  Decisão definitiva sobre a divergência entre a paleta raster do PDF antigo (#1B2B4B)
  e os tokens canônicos aprovados em 16/09 no código do repositório (#13294B).
premissas:
  - A fonte única de verdade técnica aprovada pela Proprietária é o arquivo tokens-clube-ancestral.css.
  - O Lovable está correto em alertar sobre a existência da versão oficial de 16/09.
criterio_de_aceite: >
  Seleção da opção 'Manter a aprovada (#13294B, #C2A84D, #F0EEE9)' no Lovable;
  manutenção da integridade com os 5.384 testes existentes;
  eliminação da disparidade de cores entre o Desk e o App Cliente.
```

---

## 1. Conclusão Canônica

A paleta correta e oficial a ser mantida é a **primeira opção recomendada pelo Lovable**:

- **Navy Estrutural (`--ca-navy`)**: `#13294B`
- **Dourado Nobre (`--ca-gold`)**: `#C2A84D`
- **Fundo Creme (`--ca-cream`)**: `#F0EEE9`
- **Texto e Ícones (`--ca-ink`)**: `#28334A`
- **Navy Topo / Hero (`--ca-navy-hero`)**: `#1B365D`

---

## 2. Por que essa é a Opção Certa?

1. **Fonte Única de Verdade no GitHub**:
   - O arquivo `src/styles/tokens-clube-ancestral.css` gravado em `main` estabelece expressamente em sua linha 22:
     - `--ca-navy: #13294b;`
     - `--ca-gold: #c2a84d;`
     - `--ca-cream: #f0eee9;`
2. **Harmonia com o Design System**:
   - Os valores anteriores (`#1B2B4B`, `#C9A84C`, `#F5F0E8`) eram aproximações visuais raster do PDF de mockup original, que foram refinadas e aprovadas pela Proprietária em 16/09 para garantir contraste acessível (WCAG) e consistência com o Desk.
3. **Evita Regressão de Código**:
   - Se escolher a opção de voltar à anterior, o Lovable fará uma substituição geral em dezenas de componentes, arriscando quebrar o alinhamento existente com o backend.

---

## 3. Ação Imediata no Celular

Na tela do seu print (**IMG_3095.jpeg**):
1. **Mantenha selecionada a 1ª opção**:
   - **`● Manter a aprovada (Recomendado)`**
   - *Navy #13294B, ouro #C2A84D, creme #F0EEE9*
2. **Clique no botão azul inferior**: **"Próxima"** (ou concluir).
