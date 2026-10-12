# Auditoria Técnica e Inventário de Pendências de Código do App Cliente

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 18:45 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: auditoria de código, inventário de bugs funcionais e pendências de frontend
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-inventario-pendencias-codigo-app-cliente.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main no commit b1cf9cb)
  - Artefato do Dia 2026-09-18.pdf (Auditoria de Código Claude Code)
  - relatorio-divergencias.md (Auditoria de 10/10/2026)
  - pente-fino-jornada-120-prompts-01-ate-hoje-07-09.md
escopo: >
  Mapeamento exaustivo de todas as pendências funcionais e de código no frontend
  do App Cliente (rotas em src/routes/portal/ e src/lib/), separando o que já
  está resolvido do que ainda exige correção técnica.
premissas:
  - O backend está 100% blindado com 5.384 testes verdes.
  - As pendências mapeadas são estritamente de frontend (UI, dados mockados, fallbacks e listeners).
criterio_de_aceite: >
  Inventário claro das 5 pendências críticas de código;
  indicação exata do arquivo e linha de impacto;
  roteiro de correção para o Lovable sem risco de quebra de testes.
```

---

## 1. Quadro Geral de Situação do Código

| Componente / Área | Status Técnico | Evidência de Código | Risco Operacional |
| :--- | :--- | :--- | :--- |
| **Backend & Permissões (RLS)** | **100% Estável (5.384 verdes)** | PRs #143, #144, #145, #146 integradas | Zero |
| **Design System Tokens** | **100% Homologado** | `tokens-clube-ancestral.css` (#13294B) | Zero |
| **Navegação (7 Abas)** | **100% Funcional** | `src/routes/portal/*` e navegação mobile | Baixo |
| **Aba Conta (`conta.tsx`)** | **PENDÊNCIA CRÍTICA (Bug Real)** | Fallback estático `CLIENTEDEMO` em modo master | Médio |
| **Aba Documentos (`documentos.tsx`)** | **PENDÊNCIA FUNCIONAL** | Ausência de input real de upload para cliente | Baixo |
| **Aba Radar (`radar.tsx`)** | **PENDÊNCIA DE INTEGRAÇÃO** | Teia SVG pequena e cálculo divergente de semântica | Baixo |
| **Validação de Pessoa (`validacao-pessoa.ts`)** | **PENDÊNCIA DE HIGIENE** | Validadores de CPF/CEP criados mas não chamados | Baixo |

---

## 2. Detalhamento das 5 Pendências Reais de Código

### Pendência 1: Bug do Fallback Demo na Aba Minha Conta (`src/routes/portal/conta.tsx`)
- **O que ocorre**: Enquanto as abas Home, Jornada, Árvore e Radar já leem `previa.identidade` via `identidadeDeCrmCaso`, o arquivo `conta.tsx` utiliza o hook `usePortal` com a query desabilitada em modo master/admin (`enabled: !previa`).
- **Consequência**: Ao abrir o perfil no app, os campos de nome e código do caso caem sempre em valores genéricos de demonstração (`CLIENTEDEMO`, `CASODEMOCODIGO`), em vez de exibir **"Ana Luiza Gomes Silveira"** e **"CA-CID-AT-FAM-2026-001"**.
- **Solução necessária**: Fazer `conta.tsx` consumir `previa.identidade` como fallback prioritário antes do demo.

---

### Pendência 2: Mecanismo de Upload na Aba Documentos (`src/routes/portal/documentos.tsx`)
- **O que ocorre**: A função `baixarEntrega()` funciona perfeitamente (retornando a URL de download seguro do Supabase Storage). No entanto, o botão e a zona de drag-and-drop de upload do cliente estão desabilitados ou são apenas ilustrativos.
- **Consequência**: O cliente consegue baixar certidões liberadas, mas não consegue enviar certidões e comprovantes diretamente pela tela do app (o storage real de upload cliente permanece pendente de amarração com a rota Supabase).
- **Solução necessária**: Conectar o componente de upload ao bucket `client-documents` do Supabase via mutation autenticada.

---

### Pendência 3: Disparidade Semântica no Radar Ancestral (`src/lib/radar-seis-eixos.ts`)
- **O que ocorre**: O radar possui dois módulos paralelos: `radar-eixos.ts` (4 eixos canônicos originais) e `radar-seis-eixos.ts` (6 eixos atuais: Documentação, Origem, Conexões, Elegibilidade, Memória, Legado).
- **Consequência**: O eixo de Legado declara "nenhum marco publicado" mesmo quando há entregas visíveis no app, gerando uma pontuação que aparenta estar incompleta ou descalibrada.
- **Solução necessária**: Unificar o cálculo da dimensão Legado para considerar as entregas publicadas ativas no banco.

---

### Pendência 4: Validadores de Formulário Ociosos (`src/lib/validacao-pessoa.ts`)
- **O que ocorre**: As funções formatadoras `formatarCpf`, `formatarCep` e `formatarTelefone` são chamadas nas telas, mas os validadores booleanos estritos (`cpfValido`, `cepValido`, `telefoneValido`) nunca são invocados antes da submissão do formulário.
- **Consequência**: O Desk ou o Onboarding podem salvar registros cadastrais com strings incompletas ou inválidas sem disparar erro impeditivo.
- **Solução necessária**: Adicionar a checagem booleana no `onSubmit` antes do dispatch da mutation do Supabase.

---

### Pendência 5: Ausência de Validação e Normalização de E-mail
- **O que ocorre**: Não existe nenhuma função de validação/sanitização de e-mail em `validacao-pessoa.ts` nem nas rotas (depende exclusivamente do atributo nativo do HTML `<input type="email">`).
- **Consequência**: Permite submissão de e-mails com espaços invisíveis ou caracteres maiúsculos não normalizados no cadastro de membros da família.
- **Solução necessária**: Introduzir `normalizarEmail()` com trim e lowercase antes da persistência.

---

## 3. Recomendação Estratégica

Dessas 5 pendências, apenas a **Pendência 1 (Bug da Conta)** e a **Pendência 2 (Upload de Documentos)** afetam diretamente a cliente no uso diário do aplicativo. As demais são itens de higiene cadastral e refinamento de cálculo que podem ser tratados sequencialmente sem bloquear a homologação visual.
