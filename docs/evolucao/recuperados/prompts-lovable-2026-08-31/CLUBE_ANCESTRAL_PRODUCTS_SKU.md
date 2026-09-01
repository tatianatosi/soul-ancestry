# CLUBE_ANCESTRAL_PRODUCTS_SKU.md

**Artefato Técnico — Catalog de Produtos e SKUs do Clube Ancestral**  
**Verso:** 1.0  
**Data:** 2026-08-18  
**Owner:** Enterprise Product Owner / Engenheiro de Negócios  
**Destino:** Integraçºº com Desk Intelligence + Supabase (S#263o Paulo)  
**Objetivo:** Dicion#225;rio de dados para Claude Code criar tabelas de produtos e painel financeiro durante o desenvolvimento deste m#234;s.

---

## Vis#227;o Geral

Este documento estrutura a matriz de produtos do Clube Ancestral em 4 fases da jornada do cliente, conectando:
- **Ciclo de Vida do Cliente** (Lead / Onboarding / #193;rvore em constru#231;#227;o / Pasta pronta)
- **Produto Comercial** (Servi#231;o oferecido)
- **SKU** (C#243;digo identificador #250;nico)
- **Regra do Planejador de Cidadania** (Como o sistema calcula elegibilidade, SLA, alertas e cronograma)
- **Status no Piloto** (Cr#237;tico ou Backlog)

**Pa#237;ses mapeados:** It#225;lia, Portugal, Espanha, Alemanha, Pol#244;nia, Hungria, #193;ustria, Luxemburgo. [web:10][web:13][web:11]

---

## Matriz de Produtos e SKUs

| Ciclo de Vida | Produto | SKU Sugerido | Gatilho do Planejador de Cidadania | Status no Piloto |
|---------------|---------|--------------|-------------------------------------|------------------|
| **FASE 1 #8212; Descoberta e Diagn#243;stico** | | | | |
| Lead / Primeiro contato | Diagn#243;stico Gratuito (AncestralScan#8482;) | SKU-DIAG-FREE-001 | Usu#225;rio preenche wizard de elegibilidade (pa#237;s + dados b#225;sicos); sistema calcula radar de elegibilidade com base nas leis vigentes (ex: Lei 91/1992 para It#225;lia, Lei 20/2022 para Espanha) e exibe limite geracional, via administrativa/judicial e prazo m#233;dio. [web:13][web:11] | Cr#237;tico |
| Lead qualificado | Consultoria / Diagn#243;stico Pago (Relat#243;rio de Elegibilidade) | SKU-DIAG-002 | Ap#243;s diagn#243;stico gratuito, usu#225;rio solicita relat#243;rio detalhado; sistema gera PDF com an#225;lise de linhagem, bandeiras de aten#231;#227;o (ex: naturaliza#231;#227;o anterior, regra de 1948) e recomenda#231;#227;o de pa#237;s/via. [web:13] | Cr#237;tico |
| Onboarding inicial | Plano de Cidadania (Assinatura Inicial) | SKU-PLAN-CID-003 | Usu#225;rio contrata plano base (R$ 1.950); sistema libera acesso #224; #225;rea de membros, upload de documentos e inicia checklist de onboarding. [web:9][web:14] | Cr#237;tico |
| **FASE 2 #8212; Pesquisa e Montagem** | | | | |
| #193;rvore em constru#231;#227;o | Pesquisa Geneal#243;gica por Sobrenome | SKU-RES-SOB-004 | Usu#225;rio solicita pesquisa adicional por sobrenome (R$ 950); sistema registra nova linhagem e calcula SLA de busca (7#8211;30 dias) com base no pa#237;s e complexidade. [web:9] | Cr#237;tico |
| Documentos faltantes | Pedido de Certid#227;o (Unit#225;rio) | SKU-DOC-UNI-005 | Usu#225;rio solicita certid#227;o espec#237;fica; sistema rastreia cart#243;rio/base e notifica status (localizado, pedido iniciado, emitido). [web:9] | Cr#237;tico |
| Documentos faltantes | Combo de Certid#245;es | SKU-DOC-CMB-006 | Usu#225;rio solicita m#250;ltiplas certid#245;es; sistema agrupa em lote, calcula desconto e prioriza emiss#227;o para reduzir SLA total. [web:9] | Cr#237;tico |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; It#225;lia | SKU-RES-ITA-007 | Usu#225;rio foca em It#225;lia; sistema aplica regras Lei 91/1992 + Decreto Tajani (limite 2 gera#231#245;es), calcula prazo 18#8211;48 meses e alerta para naturaliza#231;#227;o anterior. [web:13] | Cr#237;tico |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; Portugal | SKU-RES-POR-008 | Usu#225;rio foca em Portugal; sistema aplica Lei 37/1981 + Lei Org#226;nica 2/2020, calcula prazo 12#8211;36 meses e exige v#237;nculo efetivo para bisnetos. [web:11] | Cr#237;tico |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; Espanha | SKU-RES-ESP-009 | Usu#225;rio foca em Espanha; sistema aplica Lei 20/2022 (Mem#243;ria Democr#225;tica), verifica prazo limite (out/2025) e calcula prazo 12#8211;24 meses. [web:11] | Cr#237;tico |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; Alemanha | SKU-RES-GER-010 | Usu#225;rio foca em Alemanha; sistema aplica via #167;15 (n#227;o exige idioma), calcula prazo 12#8211;30 meses. [web:13] | Backlog |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; Pol#244;nia | SKU-RES-POL-011 | Usu#225;rio foca em Pol#244;nia; sistema calcula prazo 12#8211;24 meses e verifica documenta#231;#227;o de ex#237;lio se aplic#225;vel. [web:13] | Backlog |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; Hungria | SKU-RES-HUN-012 | Usu#225;rio foca em Hungria; sistema calcula prazo 6#8211;18 meses e exige prova oral b#225;sica em entrevista consular. [web:13] | Backlog |
| Pesquisa em 7 pa#237;ses | Pesquisa por Pa#237;s #8212; #193;ustria/Luxemburgo | SKU-RES-AULUX-013 | Usu#225;rio foca em #193;ustria ou Luxemburgo; sistema aplica vias #167;58c (#193;ustria) ou regras locais, calcula prazo 12#8211;24 meses. [web:13] | Backlog |
| Achados hist#243;ricos | Pacote de M#237;dia Extra (V#237;deo/Mem#243;rias) | SKU-MEM-VID-014 | Sistema detecta achado hist#243;rico (ex: foto, entrevista); usu#225;rio contrata pacote extra (R$ 500) para preservar mem#243;ria. [web:9] | Backlog |
| **FASE 3 #8212; Valida#231;#227;o Jur#237;dica e Retifica#231;#227;o** | | | | |
| Documenta#231;#227;o reunida | Pacote M#237;nimo de Tradu#231;#227;o | SKU-LAW-TRAD-015 | Usu#225;rio solicita tradu#231;#227;o de certid#245;es; sistema valida formato (R$ 200 m#237;nimo) e integra ao checklist de pasta jur#237;dica. [web:9] | Cr#237;tico |
| An#225;lise consular | Pacote M#237;nimo de Apostilamento | SKU-LAW-APOS-016 | Usu#225;rio solicita apostilamento; sistema valida Haag Convention e integra ao checklist de pasta jur#237;dica (R$ 70 m#237;nimo). [web:9] | Cr#237;tico |
| Pasta jur#237;dica | Montagem de Pasta (Checklist Documental) | SKU-LAW-PASTA-017 | Sistema exige valida#231;#227;o admin de checklist completo (certid#245;es, tradu#231#245;es, apostilas) antes de avan#231;ar para fase 4. [file:1] | Cr#237;tico |
| Retifica#231;#227;o de nomes/datas | Revis#227;o de Certid#227;o (Retifica#231;#227;o) | SKU-LAW-RET-018 | Sistema detecta inconsist#234;ncia (nome, data); usu#225;rio solicita retifica#231;#227;o; sistema calcula SLA de cart#243;rio e notifica status. [file:1] | Backlog |
| **FASE 4 #8212; Protocolo e Conclus#227;o** | | | | |
| Pasta pronta para envio | Assessoria Completa (Consulado/Judicial) | SKU-PROT-ASS-019 | Usu#225;rio contrata assessoria completa; sistema gera cronograma macro (ex: 18#8211;48 meses It#225;lia) e exibe no app do cliente. [file:1][web:13] | Cr#237;tico |
| Emiss#227;o de contrato | Contrato Param#233;trico de Servi#231;os | SKU-PROT-CONT-020 | Sistema gera contrato padr#227;o (Lei 91/1992, Lei 20/2022, etc.) com base no pa#237;s/via selecionada; usu#225;rio assina digitalmente. [web:12] | Cr#237;tico |
| P#243;s-reconhecimento | AIRE + Passaporte | SKU-POS-AIRE-021 | Ap#243;s reconhecimento, sistema desbloqueia etapa AIRE/passaporte; usu#225;rio contrata servi#231;o (link Asaas) e sistema calcula prazo de emiss#227;o. [file:1] | Backlog |
| Amplia#231;#227;o de legado | Registro de Filho/Casamento | SKU-POS-REG-022 | Usu#225;rio solicita registro de filhos/c#244;njuge; sistema agrupa por l#243;gica familiar e calcula upsell contextual. [file:1] | Backlog |
| P#243;s-cidadania | Combo Fam#237;lia / Anual | SKU-POS-FAM-023 | Sistema detecta fam#237;lia eleg#237;vel; usu#225;rio contrata combo anual; sistema calcula desconto e exibe benef#237;cios. [file:1] | Backlog |

---

## Regras do Planejador de Cidadania #8212; Resumo T#233;cnico

| Fase | Regra-Chave | Exemplo de C#225;lculo |
|------|-------------|-------------------|
| **Diagn#243;stico** | Elegibilidade por pa#237;s (Lei 91/1992, Lei 20/2022, etc.) + limite geracional + bandeiras de aten#231;#227;o. [web:13][web:11] | It#225;lia: 2 gera#231#245;es nascidas no exterior (Decreto Tajani); naturaliza#231;#227;o anterior interrompe linha. |
| **Pesquisa** | SLA de busca por pa#237;s + complexidade (ex: 7#8211;30 dias certid#227;o; 18#8211;48 meses It#225;lia). [web:13] | It#225;lia administrativa: 18#8211;48 meses; judicial: 24#8211;60 meses. |
| **Valida#231;#227;o** | Checklist de pasta jur#237;dica (certid#245;es, tradu#231#245;es, apostilas) + valida#231;#227;o admin obrigat#243;ria. [file:1] | Admin valida 100% do checklist antes de avan#231;ar para protocolo. |
| **Protocolo** | Cronograma macro por pa#237;s/via + prazo de emiss#227;o (ex: 18#8211;48 meses It#225;lia). [web:13] | It#225;lia: 18#8211;48 meses (administrativa); 24#8211;60 meses (judicial). |

---

## Esquema Sugerido para Supabase (S#227;o Paulo)

```sql
-- Tabela: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL, -- 'FASE_1', 'FASE_2', 'FASE_3', 'FASE_4'
  category VARCHAR(100), -- 'DIAGNOSTICO', 'PESQUISA', 'DOCUMENTO', 'JURIDICO', 'PROTOCOL', 'POS'
  price_brl DECIMAL(10,2),
  sla_min_days INTEGER,
  sla_max_days INTEGER,
  status_pilot VARCHAR(20) DEFAULT 'BACKLOG', -- 'CRITICO', 'BACKLOG'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: pricing_rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  country VARCHAR(50), -- 'ITALIA', 'PORTUGAL', 'ESPANHA', etc.
  rule_type VARCHAR(50), -- 'ELEGIBILIDADE', 'SLA', 'CHECKLIST', 'CRONOGRAMA'
  rule_json JSONB NOT NULL, -- Ex: {"lei": "91/1992", "limite_geracoes": 2, "bandeiras": ["naturalizacao_anterior", "1948"]}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: pilot_status
CREATE TABLE pilot_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) REFERENCES products(sku),
  status VARCHAR(20) NOT NULL, -- 'CRITICO', 'BACKLOG'
  owner VARCHAR(100),
  observation TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Pr#243;ximos Passos #8212; Integra#231;#227;o com Desk Intelligence

1. **Claude Code** deve usar esta matriz para criar:
   - Tabelas `products`, `pricing_rules`, `pilot_status` no Supabase (S#227;o Paulo).
   - Painel financeiro do Desk Intelligence com colunas: `sku`, `product_name`, `phase`, `sla_min`, `sla_max`, `price`, `status_pilot`.
2. **Prioridade**: Implementar primeiro os SKUs **Cr#237;ticos** (11 itens) para o piloto do app cliente. [file:1]
3. **Backlog**: Expandir para os SKUs **Backlog** (12 itens) ap#243;s valida#231;#227;o do piloto.

---

## Fontes e Refer#234;ncias

- Matriz Operacional Clube Ancestral (Google Drive) [file:1]
- Site Clube Ancestral #8212; Passo a Passo [web:14]
- AncestralScan#8482; #8212; Diagn#243;stico It#225;lia [web:13]
- AncestralScan#8482; #8212; Diagn#243;stico Espanha [web:11]
- Loja Clube Ancestral #8212; Pre#231;os e Produtos [web:9]
- Contrato de Servi#231;os #8212; Clube Ancestral [web:12]

---

**Gerado em:** 2026-08-18 15:59 #8212;03  
**Owner:** Enterprise Product Owner / Engenheiro de Negócios  
**Status:** Pronto para integra#231;#227;o com Supabase + Desk Intelligence