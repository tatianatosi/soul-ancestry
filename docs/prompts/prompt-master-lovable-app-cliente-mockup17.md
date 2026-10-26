# PROMPT MASTER — EXPERIÊNCIA RICA DAS 7 ABAS DO APP CLIENTE (MOCKUP 17 PÁGINAS)
Status: aprovado para execução no Lovable
Versão: v2.0
Data: 2026-10-26
Responsável pela decisão: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
Ambiente exclusivo: Lovable Cloud (Vercel descontinuado)
Banco de dados: Supabase Oficial (`liiqqibnirnpnvjmjrpj`)
Design Contract: Primeiras páginas (Páginas 1 a 9) do Mockup Aprovado de 17 Páginas

---

## 1. DIRETRIZES FUNDAMENTAIS & ENCERRAMENTO DE TRAVAS
1. **Ambiente Único:** O projeto é desenvolvido e publicado 100% no **Lovable Cloud**. Vercel está formalmente encerrado.
2. **Autoridade da Proprietária:** A conta da Proprietária (`role: owner`) tem autoridade total para editar e salvar dados em tempo real.
3. **Escopo do App Cliente:** As telas do cliente cobrem estritamente as 7 abas das páginas iniciais do Mockup de 17 Páginas (`/portal`): Home, Jornada, Radar, Árvore, Documentos, Legado e Conta. O Desk e suas 14 tarefas operacionais permanecem confinados ao backoffice.
4. **Paleta Oficial Completa (Resgate da Marca):**
   - Navy Principal: `#13294B` / Navy Secundário: `#2F4B6E`
   - Bege/Creme de Fundo: `#ECDFCD` / Creme Suave: `#F0EEE9`
   - Dourado dos Marcos e Acentos: `#FCB73A` / Ouro Nobre: `#C2A84D`
   - Terracota do Lacre e Realces: `#9A3A2F`
   - Preto Neutro para Tipografia e Ícones: `#101010` / `#28334A`

---

## 2. PROMPT INTEGRAL PARA COPIAR E COLAR NO LOVABLE

ATENÇÃO LOVABLE: IMPLEMENTAÇÃO COMPLETA DA EXPERIÊNCIA RICA DO APP CLIENTE (7 ABAS — MOCKUP 17 PÁGINAS)

Ambiente: Lovable Cloud | Banco: Supabase Oficial (liiqqibnirnpnvjmjrpj)
Design Contract: Primeiras páginas (Páginas 1 a 9) do Mockup Aprovado de 17 Páginas do Clube Ancestral.

Execute o acabamento integral das 7 abas do App Cliente do topo ao rodapé, resgatando a paleta de cores completa da marca, as fontes de dados persistidas (Supabase/GoLive) e garantindo que nenhuma trava ou modo esqueleto desative os componentes visuais.

### 1. PALETA VISUAL COMPLETA DA MARCA (APLICAR NO APP CLIENTE):
- Fundo das telas: Creme Nobre (#ECDFCD e #F0EEE9).
- Topo, Hero e Cartões Mestres: Navy Profundo (#13294B e #2F4B6E).
- Traços ancestrais, anéis e detalhes: Dourado Oficial (#FCB73A e #C2A84D).
- Selos, badges de destaque e acentos: Terracota (#9A3A2F).
- Tipografia: Serif clássico para títulos; Sans-serif para texto de apoio; cor #101010 / #28334A.

---

### 2. DETALHAMENTO DAS 7 ABAS DO TOPO AO RODAPÉ:

#### ABA 01: HOME (/portal)
- Topo: Barra compacta em Navy com BrandLogo em alta resolução, saudação personalizada ("Bem-vinda, Ana Luiza") e avatar circular com iniciais em marinho/dourado (#FCB73A).
- Bloco Hero: Cartão mestre azul-marinho com título do projeto familiar, país de interesse ("Áustria / Cidadania por Reparação") e botão discreto de WhatsApp oficial (11 98838-4907).
- Régua de Progresso (5 Etapas da Pesquisa Familiar):
  - Etapas: 1. Diagnóstico | 2. Pesquisa | 3. Reconstrução | 4. Validação | 5. Entrega.
  - Indicador de progresso com percentual coerente e filete em terracota/dourado.
- 3 Próximos Passos da Família: Cards ricos com ícones elegantes, prazo estimado e ação direta recomendada (sem dados de tarefas técnicas internas do Desk).
- Card "Hoje você está aqui": Status contextual do caso ("Processo em montagem e validação documental").
- Rodapé de Navegação: Barra fixa inferior com as 7 abas em marinho e dourado.

#### ABA 02: JORNADA (/portal/jornada)
- Estrutura de Duas Linhas do Tempo Paralelas (Desktop) / Coluna Intercalada (Mobile):
  - Linha 1 (Ancestral): Marcos históricos da família de 1820 a 1941 (ex.: Nascimento em Graz 1895, Casamento Friedmann-Reimer, Emigração para o Brasil 1938-39).
  - Linha 2 (Processual): Marcos do processo em 2026 (Análise preliminar, Localização de certidões, Montagem do dossiê).
- Nós em dourado (#FCB73A) com linhas conectoras sutis; apenas marcos aprovados para a família.

#### ABA 03: RADAR (/portal/radar)
- Gráfico Hexagonal de 6 Dimensões (SVG Nativo):
  - Eixos: 1. Genealogia | 2. Prova Documental | 3. Elegibilidade Jurídica | 4. Viabilidade Histórica | 5. Consistência Familiar | 6. Prontidão para Protocolo.
  - Área visual preenchida com transparência suave sobre marfim, contorno em Navy e pontos em dourado/terracota.
- Legenda de Evolução: Explicação humana e acolhedora de cada eixo, sem notas punitivas.

#### ABA 04: ÁRVORE (/portal/arvore)
- Genograma Interativo em Rede (G1 a G10):
  - Nós circulares elegantes: azul-marinho (#13294B) com aro em dourado (#FCB73A) e destaque visual em terracota (#9A3A2F) para o ancestral raiz (Otto Reimer).
  - Linhas de conexão dinâmicas de filiação e casamento.
  - Modo de visualização zoom/pan suave sobre fundo marfim (#F0EEE9).
  - REMOVER qualquer lista repetitiva ou tabela plana de nomes embaixo do genograma. O foco visual é 100% no genograma.

#### ABA 05: DOCUMENTOS (/portal/documentos)
- 4 Grupos Expansíveis (Acervo Familiar):
  - 1. Solicitados à família | 2. Em conferência | 3. Em validação | 4. Entregas liberadas.
- Alimentação de Dados:
  - Consumir da tabela `documents` (e projeções liberadas do Supabase);
  - Exibir as 3 certidões reais da família com status e botão de download para arquivos liberados;
  - Para grupos vazios, exibir mensagem acolhedora do CartaoEditorial ("Nenhum documento pendente no momento").
  - PROIBIÇÃO ABSOLUTA: Nenhuma das 14 tarefas internas do Desk pode aparecer como documento.

#### ABA 06: LEGADO (/portal/legado)
- Card Editorial de Abertura: Ícone em dourado, subtítulo "Acervo da família" e título em serifado "Histórias para guardar e compartilhar".
- Seção "Seus Achados": Cards visuais com fotos, datas e resumos das rotas migratórias e fatos históricos comprovados.
- As 5 Coleções da Estante:
  - 1. Cadernos (com o caderno familiar liberado preenchido);
  - 2. Dossiês;
  - 3. Relatórios Fase 1;
  - 4. Relatórios Fase 2;
  - 5. Memórias.
- Encontros de Linhagem: Card narrativo com o disclaimer oficial ("Este conteúdo é histórico, cultural e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico.").
- Botão "Compartilhar com a família" restrito aos membros autorizados do núcleo.

#### ABA 07: CONTA (/portal/conta)
- Meu Perfil: Nome ("Ana Luiza Box"), E-mail e WhatsApp da titular, com avatar de iniciais em marinho/ouro.
  - REGRA DE PRIVACIDADE: Ocultar 100% CPF, RG e endereço residencial no App Cliente.
- PLANO FAMILIAR · CONDIÇÃO PREVISTA (BLINDAGEM COMERCIAL):
  - Exibir rigorosamente: **03 assinaturas de R$ 320,00 por mês durante 10 meses** (R$ 3.200,00 por adulto; **Valor Total: R$ 9.600,00**).
  - ERRADICAÇÃO TOTAL: Proibir qualquer exibição dos valores internos de R$ 4.800,00 ou R$ 2.400,00.
- Central de Atendimento:
  - Botão de ação "Falar com a Especialista no WhatsApp" direcionando para o canal oficial (11 98838-4907);
  - 3 sanfonas: "Estamos por perto", "Termos e privacidade" e "Acesso seguro".
- Histórico de Atividades: Linha do tempo dos marcos aprovados para o cliente com data e resumo.

---

### 3. CONEXÃO COM BANCO DE DADOS E ROTAS:
- Rotas: Garantir que as rotas `/portal`, `/portal/jornada`, `/portal/radar`, `/portal/arvore`, `/portal/documentos`, `/portal/legado`, `/portal/conta` estejam compilando sem erros em `src/routes/portal/*.tsx`.
- Projeções Sanitizadas: Consumir dados de `app_projections` e `documents` vinculados ao caso ativo (`case_id = CA-CID-AT-FAM-2026-001`).
- Fim das Travas de Esqueleto: Desative no arquivo `app-visibilidade.ts` a condicional que forçava a tela a renderizar "Em preparação" caso não houvesse entregas gravadas. O design aprovado do Mockup de 17 páginas deve sempre renderizar por completo!
