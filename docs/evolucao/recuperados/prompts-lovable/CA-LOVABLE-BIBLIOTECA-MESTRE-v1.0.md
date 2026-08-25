# CA-LOVABLE-BIBLIOTECA-MESTRE-v1.0

**Versão:** 1.0  
**Data:** 21/08/2026  
**Destino:** Lovable — Soul Ancestry  
**Tipo:** Prompt executável de restauração funcional  
**Escopo:** Biblioteca Mestre → base operacional interna para pesquisa, taxonomias, trilhas, regras versionadas, F1/F2, catálogo Top 30 e governança.

---

## Prompt para colar no Lovable

```text
RESTAURAR E CONSOLIDAR A BIBLIOTECA MESTRE COMO BASE OPERACIONAL INTERNA DO SOUL ANCESTRY.

IMPORTANTE:
- Não criar novas abas principais.
- Não redesenhar a navegação de primeiro nível.
- Manter Biblioteca Mestre como uma das 7 áreas principais do Desk Intelligence.
- Usar subáreas/seções internas contextuais.
- Não transformar a Biblioteca Mestre em diretório público nem em App Cliente.
- Não criar pesquisa externa, OCR, IA, integração externa, contrato, cobrança, mensagem, link Asaas ou publicação externa nesta entrega.
- Não importar dados reais de clientes como fixtures.

OBJETIVO
Restaurar a função original da Biblioteca Mestre: concentrar as referências estruturadas que alimentam pesquisa genealógica, dicionários, trilhas, governança, relatórios F1/F2, catálogo comercial e operação interna. Ela não é apenas um acervo de arquivos.

SUBÁREAS OBRIGATÓRIAS

1. Acervo
- modelos internos;
- guias;
- referências operacionais;
- materiais aprovados;
- classificação, versão, responsável e status.

2. Bases Genealógicas
- catálogo de repositórios, arquivos, cartórios, acervos públicos, registros religiosos, imigração, naturalização, arquivos militares, bibliotecas, bases genealógicas e coleções;
- país, região/localidade, idioma, tipo de fonte, acesso, URL/referência interna, restrições, observações e última revisão;
- não executar consulta externa nesta entrega.

3. Dicionários e Taxonomias
- tipos de fonte;
- tipos de documento;
- tipos de evidência;
- estados de evidência;
- tipos de achado;
- tipos de relação genealógica;
- tipos de evento genealógico;
- linhas de transmissão;
- países/localidades;
- etiquetas operacionais;
- categorias de risco;
- estados de pesquisa;
- estados de relatório F1/F2;
- versão, ativo/inativo, responsável e auditoria.

4. Trilhas de Pesquisa e Cidadania
- país;
- nacionalidade;
- via preliminar;
- marco jurídico de referência;
- status da via;
- requisitos de entrada;
- documentos prioritários;
- riscos internos;
- idioma/entrevista, quando aplicável;
- necessidade de autorização de pesquisa;
- revisão humana/jurídica;
- data e responsável pela última revisão;
- texto sanitizado interno para comunicação futura.

Cadastrar como opções controladas, sem gerar parecer automático:
- Itália
- Portugal
- Espanha
- Alemanha
- Áustria
- Polônia
- Hungria
- Luxemburgo
- Croácia
- Romênia
- Brasil — naturalização/residência
- Multipaís
- Em investigação

5. Regras Jurídicas Versionadas
- regra/tema;
- país ou trilha;
- versão;
- vigência;
- fonte/referência;
- responsável;
- data de revisão;
- status: rascunho | em_revisao | aprovado | arquivado;
- escopo, exceções e dados necessários;
- relação com temas da matriz jurídica quando aplicável.

Regra: Biblioteca Mestre não calcula automaticamente elegibilidade, prazo, direito, via definitiva ou conclusão jurídica. Toda aplicação em caso exige revisão humana e versão vigente.

6. Governança
- fontes de verdade;
- decisões canônicas;
- políticas de acesso/RLS;
- política de dados e retenção;
- convenções de nomenclatura;
- changelog;
- documentos de governança versionados;
- status de implantação: piloto_em_ajuste | estavel | bloqueado_por_gatilho | pendente_de_validacao | arquivado_historico.

7. Modelos F1/F2
- modelos de relatório F1 e F2;
- versão;
- status de aprovação;
- critérios de uso;
- responsável;
- campos/estrutura;
- ligação com Pesquisa Genealógica e Evidências;
- histórico de versões;
- sem gerar relatório automaticamente nesta entrega.

8. Catálogo Comercial Top 30
- product_catalog interno;
- SKU;
- nome comercial;
- família comercial;
- tipo: produto_pai | complemento | upgrade | recorrente | sazonal;
- prioridade: top10 | top30 | historico;
- status de homologação;
- elegível para proposta;
- requer fechamento humano;
- preço comercial vigente;
- preço histórico legado;
- condição comercial padrão;
- escopo aprovado;
- entregas principais;
- versão/data de vigência;
- responsável pela homologação.

Regras:
- somente item homologado e vigente pode ser selecionado em proposta;
- país/trilha não é SKU;
- não exibir catálogo, preço, ranking ou link técnico no App Cliente;
- não criar cobranças, links ou alterações de preço nesta entrega;
- itens históricos/arquivados ficam fora de ofertas novas.

9. Mapas Operacionais
- fluxos de caso;
- gates de formalização;
- onboarding;
- pesquisa;
- validação;
- relatórios;
- entregas;
- checklists;
- matriz de dependências;
- playbooks internos;
- responsáveis e versão.

10. Arquivo Histórico
- bases legadas;
- produtos arquivados;
- regras antigas;
- modelos substituídos;
- referências preservadas;
- motivo de arquivamento;
- substituto atual, quando houver.

REGRA DE CONEXÃO COM PESQUISA

Biblioteca Mestre
→ bases genealógicas, taxonomias, trilhas e regras versionadas
→ Pesquisa Genealógica e Evidências
→ fontes, documentos, evidências, validação, pendências e achados
→ Ficha Genealógica, árvore e timeline internas
→ Relatórios F1/F2 e entregas sanitizadas
→ App Cliente somente se aprovado/publicado

Nunca permitir que uma base, regra, referência ou trilha seja publicada diretamente ao cliente.

MODELO DE DADOS MÍNIMO

A. genealogical_source_catalog
- id
- nome
- tipo_fonte
- pais
- regiao_localidade
- idioma
- descricao_interna
- acesso
- url_ou_referencia_interna
- restricoes
- ativo
- ultima_revisao_em
- responsavel_revisao
- created_at
- updated_at

B. controlled_taxonomies
- id
- dominio
- codigo
- nome
- descricao
- ativo
- versao
- responsavel
- created_at
- updated_at

C. citizenship_tracks
- id
- pais
- nacionalidade
- via_preliminar
- marco_juridico_referencia
- status_via
- requisitos_entrada
- documentos_prioritarios
- riscos_internos
- idioma_entrevista
- autorizacao_pesquisa_necessaria
- revisao_humana_juridica
- status_atualizacao
- ultima_revisao_em
- responsavel_revisao
- texto_sanitizado_interno
- ativo

D. versioned_legal_rules
- id
- track_id opcional
- tema
- versao
- vigencia_inicio
- vigencia_fim opcional
- fonte_referencia
- escopo
- excecoes
- dados_necessarios
- status
- reviewed_by
- reviewed_at
- created_at
- updated_at

E. master_library_items
- id
- categoria
- titulo
- descricao_interna
- versao
- status
- owner
- referencia_interna
- arquivo_ou_url_interna opcional
- substitui_item_id opcional
- archived_at opcional
- archive_reason opcional
- created_at
- updated_at

INTERFACE

Biblioteca Mestre deve ter:
- visão geral com contadores por subárea;
- busca por nome, código, país, tipo, versão e status;
- filtros por subárea, status, responsável, país/trilha e data de revisão;
- cards/listas internos;
- tela de detalhe com histórico, versão e vínculos;
- edição auditada para usuários autorizados;
- arquivamento lógico com motivo;
- sem exclusão física de itens críticos;
- estados vazios claros quando não houver dados.

SEGURANÇA
- A Biblioteca Mestre é interna ao Desk.
- Aplicar RLS e papel de equipe autorizada.
- Nenhum conteúdo da Biblioteca Mestre aparece no App Cliente diretamente.
- Registrar auditoria sanitizada de criação, edição, ativação, arquivamento e revisão.
- Não registrar segredos, tokens, credenciais ou PII em campos de referência.

CASO ANA
- Permitir associação de caso a trilha e regras versionadas somente como referência interna.
- Para Ana: trilha Áustria / 58c em confirmação, com revisão jurídica obrigatória.
- Não transformar referência de trilha/regra em decisão jurídica, contrato, pesquisa externa ou conteúdo do App Cliente.

CRITÉRIOS DE ACEITE
- Biblioteca Mestre mantém-se como uma única área principal.
- As 10 subáreas existem como contexto interno, sem novas abas globais.
- Bases Genealógicas e Trilhas de Pesquisa estão presentes e pesquisáveis.
- Taxonomias são controladas, auditadas e reutilizáveis por Pesquisa Genealógica e Evidências.
- Regras jurídicas são versionadas e não produzem conclusão automática.
- Modelos F1/F2 são versionados e ligados à pesquisa, sem publicação automática.
- Top 30 é interno e não aparece no App Cliente.
- Arquivo Histórico preserva legado sem virar fonte operacional.
- Build, typecheck e testes aplicáveis ficam limpos.

ANTES DE IMPLEMENTAR
Apresente plano de migrations, tabelas, RLS, componentes, rotas internas e testes.

AO FINAL
Informe estrutura criada, fontes/taxonomias/trilhas cadastradas como opções controladas, testes, commit identificável e roteiro visual de validação.
```
