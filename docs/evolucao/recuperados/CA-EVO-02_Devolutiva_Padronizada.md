# CA-EVO-02 — Devolutiva Padronizada (Automações, Gatilhos e Sobreposições)

## Proveniência (protocolo do `MANIFESTO_AUSENCIAS_E_RECUPERACAO_v1.0.md`)

- **Origem:** arquivo enviado pela Proprietária Administradora no chat,
  24/08/2026 — nome original `CAEVO02_Mapa_Automacoes_Templates.docx`.
- **Data do documento original:** 15/08/2026 (declarada no próprio conteúdo)
  — ou seja, 8 dias anterior à sincronização mestra de 19/08 e às Fases
  A–D deste levantamento.
- **Binário preservado em:** `docs/evolucao/recuperados/CA-EVO-02_Mapa_Automacoes_Templates.docx`
  (cópia idêntica do arquivo enviado, sha256
  `0e438d94737072dfc30ac96f40ade871cc2d3662d06f1423a5590f128f7b9bf7`).
- **Tipo:** devolutiva (documento de saída já concluído), estado declarado
  `CONCLUÍDO_COM_REFINAMENTO_PENDENTE`.
- **Classificação:** histórico — retrata o estado em 15/08. Precisa ser
  cotejado com o código atual antes de virar verdade de projeto (regra 4 do
  Manifesto), o que este arquivo ainda não faz.
- **Fecha:** confirma e detalha a linha `CA-EVO-02` de
  `INVENTARIO_SERIE_CA_E_EVO_v1.0.md`, que já constava como `LOCALIZADO`
  mas sem o conteúdo.

## Conteúdo (transcrição do texto extraído do .docx)

**Estado:** CONCLUÍDO_COM_REFINAMENTO_PENDENTE

### O que foi entregue
1. Mapa de automações e templates — 40+ itens em 14 seções funcionais, 10
   colunas por item (item, sistema/local, finalidade, entrada, saída,
   gatilho, estado, evidência verificável, risco de duplicidade, ação
   correta).
2. Sobreposições identificadas — 12 sobreposições concretas com ações de
   eliminação.
3. Gatilhos e bloqueios mapeados por item, com separação entre status
   global do sistema e status por caso.
4. Evidências e estados — cada item com evidência verificável (fontes:
   Auditoria Mãe, CA-10A1, memória, busca no Drive, skills).
5. Ordem dos próximos prompts: CA-EVO-03 a CA-EVO-08.

### Ajustes factuais aplicados nesta devolutiva
1. **Gates da Ana Luiza:** aceite comercial já confirmado (em 15/08).
   Bloqueio então vigente: contrato específico inexistente, dados
   cadastrais pendentes, Asaas/pesquisa/despesas não ativados.
2. **Anexos I, II, IV e V:** corrigidos de `NAO_LOCALIZADO` para
   `IMPLEMENTADO_E_ATIVO` — localizados no Drive, pasta
   `01_Modelos-e-Jurídico`.
3. **Pasta `01_Modelos-e-Jurídico`:** corrigida de `NAO_LOCALIZADO` para
   `IMPLEMENTADO_E_ATIVO` — referenciada como localização dos anexos
   genéricos.
4. **Pasta/dossiê Ana Luiza:** marcada como referência conflitante — pasta
   ativa criada em pré-onboarding antes do contrato assinado, pendente de
   validação no Drive.
5. **Client Varredura:** reformulada como artefato/instruções da skill
   autônoma não localizados nesta sessão de 15/08.
6. Contagens de resumo removidas, substituídas por itens representativos.
7. Ordem dos prompts substituída pela sequência definida pela Proprietária:
   CA-EVO-03 a CA-EVO-08.
8. Typos corrigidos (Sheets_Export_Logo → Sheets_Export_Logs, Dilência →
   Diligência, histórico → referência histórica).

### Refinamento pendente (registrado, não aplicado em 15/08)
Dualidade de estados que ainda precisava ser resolvida:
- `ESTADO_GLOBAL_DO_MODELO/SISTEMA`: `IMPLEMENTADO_E_ATIVO`.
- `ESTADO_NO_CASO_ESPECIFICO`: `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO`.

Exemplo dado no documento: Anexo III — o modelo (global) existe e é
reutilizável; no caso Ana Luiza especificamente, não estava aplicado e só
poderia ser preenchido e assinado quando houvesse finalidade e autorização
de pesquisa aplicáveis.

### Sistemas externos preservados (declarado sem alteração em 15/08)
Google Drive, CRM/Pipeline, Planejador Universal, Asaas, App Cliente/
Ancestral Canvas, Desk Intelligence, Google Forms, Google Tasks, Google
Calendar. Dropbox não indexado (fora do escopo da sessão).

### Próxima aba declarada
CA-EVO-03 — Motor Contratual Modular.

## Cotejo com o estado atual do repositório (24/08/2026)

Este documento é de 15/08 — nove dias antes deste levantamento. Comparando
com o que já foi verificado nas Fases anteriores:

| Item de 15/08 | Estado verificado em código hoje (24/08) |
|---|---|
| Anexos I/II/IV/V "implementado e ativo" no Drive (modelo/global) | Consistente: `src/lib/anexos-i-v.ts` implementa o motor e as regras dos anexos, mas o próprio código confirma a mesma dualidade já descrita aqui — "texto jurídico aprovado; instância técnica pendente de materialização/preenchimento" por caso. As duas fontes concordam: o modelo existe, o preenchimento por caso é a lacuna. |
| Ana Luiza — aceite comercial confirmado, contrato específico ainda inexistente (15/08) | `CA-GOV-01` (23/08) mantém o caso em **NO-GO para ativação** — consistente com a lacuna já identificada aqui uma semana antes; não houve avanço registrado nesse intervalo até 23/08. |
| Ordem CA-EVO-02 a CA-EVO-08 | `CA-EVO-03` (motor contratual) e `CA-EVO-04` (dados vivos e integrações) constam como `LOCALIZADO` em `INVENTARIO_SERIE_CA_E_EVO_v1.0.md`; CA-EVO-06, 07 e 08 seguem sem registro nesta rodada. |

**Nenhum dado, migration, RLS, gate ou integração foi alterado ao preservar
este documento.** Esta seção é leitura comparativa, não execução.
