import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * CRM Vivo & Discovery Calls V4 (Proprietária, 14/10/2026): depois do
 * merge do Comercial & Funil (/leads, PR #157), autorização explícita para
 * aplicar o mesmo padrão de prancha em /calls — 4 KPIs de atendimento,
 * Agenda de Discovery do Dia em grid aberto (sem <details>), roteiro SPIN
 * & Diagnóstico exposto em 4 blocos reais (S/P/I/N), Consentimento &
 * Gravação, mais o handoff real que já existe dentro de PainelCalls.
 * Segunda rodada (14/10/2026, "ESPECIFICAÇÃO DE UI CANÔNICA"): grade virou
 * grid de cards com "via preliminar" (via_juridica_preliminar, real,
 * rótulo já marca "hipótese... pendente de validação humana" — nunca
 * tratada como rota confirmada), e o roteiro SPIN passou de barras de
 * progresso soltas para 4 blocos com os campos reais do lead
 * (ROTULO_CAMPO_ROTEIRO), nunca texto fixo por bloco.
 * Terceira rodada (14/10/2026, "ESPECIFICAÇÃO DE UI DEFINITIVA"): a barra
 * "Funil comercial" (ComercialConectado/ComercialTemplate) saiu de /calls —
 * duplicava o funil canônico de /leads (PR #157); o Kanban real por etapa
 * comercial continua, via CrmKanban + colunasPorEtapaComercial (exportada
 * de superficies-kit-conectadas.tsx, mesma classificação real de antes).
 * Mesa em 2 colunas (Agenda & Consentimento | Roteiro SPIN & Handoff).
 * "Confirmar consentimento" e "Concluir Discovery e Gerar Proposta" são
 * ações reais: a primeira chama a mesma mutação (salvarLeadDesk) que
 * PainelCalls já usa; a segunda usa o mesmo gate (podeExecutarHandoffDiscovery)
 * para habilitar/desabilitar — a execução do handoff em si, com a
 * conferência de pessoa/caso, continua exclusiva de PainelCalls.
 * Também na terceira rodada, sob autorização executiva explícita: os campos
 * do roteiro SPIN de tipo select/texto/numero/data (a maioria dos 28 campos
 * reais) passam a ser editáveis ao vivo nesta própria tela — não mais só
 * leitura — gravando pela MESMA mutação real (salvarLeadDesk) que
 * PainelCalls já usa, com invalidação do mesmo cache ("leads-desk"), então
 * os dois lados continuam em sincronia. Só os campos relacionais que
 * dependem de listas externas (países/trilhas/marcos: multi, trilha, marco)
 * continuam só leitura aqui, com link para o roteiro vivo completo.
 * Quarta rodada (14/10/2026, "DECISÃO EXECUTIVA — RESOLUÇÃO DE SCHEMA"):
 * confirma zero migrations — os 29 campos de discovery-roteiro.ts continuam
 * a fonte estruturada oficial. Todo detalhe narrativo que exceda os campos
 * estruturados vai para o campo de texto livre REAL já existente
 * (`resumo_call` — o mesmo que PainelCalls exige quando a call é marcada
 * Realizada); não foi criado um campo novo `resumo_discovery` (isso exigiria
 * migration, que a própria decisão proíbe).
 * Quinta rodada (14/10/2026, "DE-PARA OFICIAL: 52 PERGUNTAS VS. 29 CAMPOS"):
 * a tabela de-para enviada citava ~24 nomes de campo que não existem no
 * schema real (`ascendente_identificado`, `via_preliminar`,
 * `trilha_referencia`, `servico_recomendado`, `faixa_orcamento`,
 * `responsavel_nominal`, `prazo_proxima_acao`, `objetivo_declarado`,
 * `resumo_discovery` etc. — nenhum usado aqui) — só `consentimento_gravacao`
 * (boolean, distinto de `consentimento_status`) era real e ainda não estava
 * na tela; foi adicionado como checkbox real.
 * Sexta rodada (14/10/2026, "REVISÃO EXECUTIVA — MESA DE DISCOVERY & ROTEIRO
 * SPIN"): o Kanban "Pipeline comercial" (CrmKanban + colunasPorEtapaComercial),
 * mantido na terceira rodada, saiu de /calls por decisão explícita — ele
 * também pertence exclusivamente a /leads (PR #157), junto com o funil que
 * já havia saído antes. /calls volta a ser só a mesa de atendimento ao vivo:
 * 4 KPIs, agenda do dia, roteiro SPIN e handoff. `produtos_recomendados`
 * (campo real, já existente em crm-desk.ts e editado na Mesa de Propostas de
 * /leads) passou a aparecer também no bloco Necessidade do roteiro SPIN,
 * só leitura aqui como os demais campos multi — não é campo novo.
 * Sétima rodada (14/10/2026, "HOMOLOGAÇÃO FINAL DA ROTA /calls"): a estrutura
 * em 2 colunas e a limpeza do topo (sem Kanban) foram aprovadas. Fechamento:
 * botão "+ Agendar Call" no cabeçalho do card "Agenda de Discovery do Dia"
 * (via `acao` de CaCard, alinhado à direita) — agenda um lead já existente
 * do pipeline (select de leadsReais) para uma data/hora (call_agendada_em),
 * gravando pela mesma mutação real (salvarLeadDesk) e o mesmo status_call
 * "agendada" (valor real de STATUS_CALL em crm-desk.ts). Não cria lead novo
 * (isso já existe em NovoLeadDialog, /leads) nem campo/tabela nova.
 * Todos os blocos leem leads reais (listarLeadsDesk, mesma queryKey
 * "leads-desk" do PainelCalls) — nenhuma call, lead ou taxa de exemplo.
 */
const rota = readFileSync("src/routes/_authenticated/calls.tsx", "utf8");
const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");

describe("Calls V4 — 4 KPIs de atendimento, sobre dado real", () => {
  it("Calls Agendadas, Realizadas, No-Show e Taxa de Qualificação vêm de campos reais do lead", () => {
    expect(rota).toContain("Calls Agendadas");
    expect(rota).toContain("Realizadas");
    expect(rota).toContain("No-Show");
    expect(rota).toContain("Taxa de Qualificação");
    expect(rota).toContain("l.call_agendada_em");
    expect(rota).toContain("l.call_realizada_em");
    expect(rota).toContain('l.discovery_resultado === "no_show"');
    expect(rota).toContain('"aderente", "aderente_com_ressalva"');
  });

  it("nenhum KPI usa número fixo ou meta inventada", () => {
    expect(rota).not.toMatch(/metaComercial|meta_comercial|meta_mensal|metaMensal/i);
  });
});

describe("Calls V4 — Agenda de Discovery do Dia (grid aberto, sem <details>)", () => {
  it("o grid lista horário, lead, canal, via preliminar e status reais, sem wrapper <details>/<summary>", () => {
    expect(rota).toContain("Agenda de Discovery do Dia");
    expect(rota).toContain("horarioCall(l.call_agendada_em)");
    expect(rota).toContain("<Pessoa nome={l.nome}");
    expect(rota).toMatch(/rotulo\("origem", l\.origem\)/);
    expect(rota).toContain("estadoCall(l)");
    expect(rota).toContain('rotulo("via_juridica_preliminar", l.via_juridica_preliminar)');
    expect(rota).not.toContain("<details");
    expect(rota).not.toContain("<summary");
  });

  it("filtra pelo dia real (mesmoDia/hojeStr), não lista fixa — e clicar num card seleciona o lead via ?lead=", () => {
    expect(rota).toContain("function mesmoDia(");
    expect(rota).toContain("agendaDoDia");
    expect(rota).toContain('search={{ lead: l.id }}');
    expect(rota).toContain("validateSearch");
  });
});

describe("Calls V4 — Roteiro SPIN & Diagnóstico: qualificação ao vivo, campo a campo, sobre a mesma mutação real", () => {
  it("cada etapa lista os campos reais do roteiro (camposDaEtapa/perguntasDaEtapa), rotulados por ROTULO_CAMPO_ROTEIRO", () => {
    expect(rota).toContain('from "@/lib/discovery-roteiro"');
    expect(rota).toContain("function camposDaEtapa(");
    expect(rota).toContain("perguntasDaEtapa(etapa)");
    expect(rota).toContain("ROTULO_CAMPO_ROTEIRO[campo]");
    expect(rota).toContain("progressoSpin(selecionado)");
    expect(rota).toContain("ETAPAS_SPIN.map((e) =>");
  });

  it("terceira rodada (14/10/2026, 'ESPECIFICAÇÃO DE UI DEFINITIVA'): campos select/texto/numero/data ficam editáveis ao vivo na própria tela, gravando pela mesma mutação real (salvarLeadDesk) que PainelCalls usa — nunca uma implementação paralela", () => {
    expect(rota).toContain("function ControleCampoSpin(");
    expect(rota).toContain("META_CAMPO_ROTEIRO[campo]");
    expect(rota).toContain('meta.tipo === "select"');
    expect(rota).toContain('meta.tipo === "numero"');
    expect(rota).toContain('meta.tipo === "data"');
    expect(rota).toContain("async function gravarCampoSpin(leadId: string, campo: string, valor: string | boolean | null)");
    expect(rota).toContain("salvarLead({ data: { id: leadId, valores: { [campo]: valor } } })");
    // mesma invalidação de cache que PainelCalls usa após salvar — os dois
    // lados continuam em sincronia porque leem a mesma queryKey.
    expect(rota).toContain('void qc.invalidateQueries({ queryKey: ["leads-desk"] });');
  });

  it("campos relacionais (multi/trilha/marco — dependem de listas externas de países/trilhas/marcos) continuam só leitura aqui, com link real para o roteiro vivo completo dentro de PainelCalls", () => {
    expect(rota).toContain('meta.tipo === "multi" || meta.tipo === "trilha" || meta.tipo === "marco"');
    expect(rota).toContain('href="#calls-roteiro-vivo"');
    expect(painel).toContain('id="calls-roteiro-vivo"');
    const trecho = painel.slice(painel.indexOf('id="calls-roteiro-vivo"'), painel.indexOf('id="calls-roteiro-vivo"') + 200);
    expect(trecho).toContain("<MesaDiscovery");
  });

  it("não existe texto fixo tipo 'Falta de certidões, divergência de nomes ou barreiras consulares' no lugar do dado real do lead", () => {
    expect(rota).not.toMatch(/divergência de nomes|barreiras consulares|risco de perda de prazo/i);
  });
});

describe("Calls V4 — Consentimento & Gravação com tom semântico real", () => {
  it("lê consentimento_status/consentimento_canal/consentimento_em/gravacao_link_interno do lead selecionado", () => {
    expect(rota).toContain("Consentimento & Gravação");
    expect(rota).toContain('rotulo("consentimento_status"');
    expect(rota).toContain('rotulo("consentimento_canal"');
    expect(rota).toContain("selecionado.consentimento_em");
    expect(rota).toContain("selecionado.gravacao_link_interno");
  });
});

describe("Calls V4 — Handoff rápido aponta para o handoff real já existente", () => {
  it('botão "Handoff" é âncora real para a seção de handoff dentro de PainelCalls, nenhum botão decorativo novo', () => {
    expect(rota).toContain('href="#calls-handoff"');
    expect(painel).toContain('id="calls-handoff"');
  });

  it("PainelCalls continua a única superfície que executa o handoff (executarHandoffDiscovery)", () => {
    expect(painel).toContain("executarHandoffDiscovery");
    expect(rota).not.toContain("executarHandoffDiscovery");
  });
});

describe("Calls V4 — 21/10/2026: topo comercial da prancha V4 volta a /calls, acima da Mesa (revoga a regra de 14/10)", () => {
  it("o topo vem de um único componente de leitura com os mesmos leads da Mesa; a barra antiga ComercialConectado não volta", () => {
    expect(rota).not.toContain("<ComercialConectado");
    expect(rota).toContain("<ComercialV4Topo leads={leadsReais} />");
    expect(rota.indexOf("<ComercialV4Topo")).toBeLessThan(rota.indexOf("Mesa de Discovery</h2>"));
  });

  it("/calls fica só com a mesa de atendimento ao vivo: KPIs, agenda, roteiro SPIN e handoff", () => {
    expect(rota).toContain("Agenda de Discovery do Dia");
    expect(rota).toContain("Roteiro SPIN & Diagnóstico");
    expect(rota).toContain('href="#calls-handoff"');
  });
});

describe("Calls V4 — produtos_recomendados (campo real) aparece no bloco Necessidade, só leitura", () => {
  it("produtos_recomendados está em PERGUNTAS_MESA/META_CAMPO_ROTEIRO como campo multi real, não inventado", () => {
    const roteiro = readFileSync("src/lib/discovery-roteiro.ts", "utf8");
    expect(roteiro).toContain('campos: ["produtos_recomendados"]');
    expect(roteiro).toContain("produtos_recomendados: {");
    expect(roteiro).toContain('tipo: "multi"');
  });
});

describe("Calls V4 — terceira rodada: mesa em 2 colunas (Agenda & Consentimento | Roteiro SPIN & Handoff)", () => {
  it("grid de 2 colunas no desktop (lg:grid-cols-2) agrupando os blocos nessa ordem", () => {
    const trecho = rota.slice(rota.indexOf('className="mb-6 grid gap-6 lg:grid-cols-2"'));
    expect(trecho.indexOf("Agenda de Discovery do Dia")).toBeGreaterThan(-1);
    expect(trecho.indexOf("Consentimento & Gravação")).toBeGreaterThan(trecho.indexOf("Agenda de Discovery do Dia"));
    expect(trecho.indexOf("Roteiro SPIN")).toBeGreaterThan(trecho.indexOf("Consentimento & Gravação"));
    expect(trecho.indexOf("Concluir Discovery e Gerar Proposta")).toBeGreaterThan(trecho.indexOf("Roteiro SPIN"));
  });
});

describe("Calls V4 — terceira rodada: confirmação de consentimento e handoff de destaque são ações reais, não decorativas", () => {
  it('botão "Confirmar consentimento" chama a mesma mutação real (salvarLeadDesk) já usada por PainelCalls, com canal real (verbal_em_call)', () => {
    expect(rota).toContain('import { listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions"');
    expect(rota).toContain("mutarConsentimento.mutate(selecionado.id!)");
    expect(rota).toContain('consentimento_canal: "verbal_em_call"');
    expect(rota).toContain('queryKey: ["leads-desk"]');
  });

  it('botão "Concluir Discovery e Gerar Proposta" usa o gate real do handoff (podeExecutarHandoffDiscovery) para habilitar/desabilitar e mostrar o motivo — a execução em si continua só em PainelCalls', () => {
    expect(rota).toContain('import { podeExecutarHandoffDiscovery } from "@/lib/handoff-discovery"');
    expect(rota).toContain("const gateHandoff = selecionado ? podeExecutarHandoffDiscovery(selecionado)");
    expect(rota).toContain("Concluir Discovery e Gerar Proposta");
    expect(rota).toContain("{gateHandoff.motivo}");
  });
});

describe("Calls V4 — recusa consistente de dado fictício", () => {
  it("nenhuma call, lead ou taxa de exemplo no arquivo da rota", () => {
    expect(rota).not.toMatch(/"Alta"|"Boa"|"Média"/);
    expect(rota).not.toMatch(/\b58\b|\b31\b|\b18\b/);
  });

  it("todos os blocos novos leem a mesma queryKey \"leads-desk\" que PainelCalls (cache compartilhado, não busca dupla)", () => {
    expect(rota).toContain('queryKey: ["leads-desk"]');
    expect(painel).toContain('queryKey: ["leads-desk"]');
  });
});

describe("Calls V4 — sétima rodada (14/10/2026): botão + Agendar Call no cabeçalho da Agenda do Dia, ação real", () => {
  it('"+ Agendar Call" fica no cabeçalho do card via acao de CaCard, alinhado à direita pelo próprio CaCard', () => {
    expect(rota).toContain("+ Agendar Call");
    expect(rota).toContain('acao={');
    expect(rota).toContain('titulo="Agenda de Discovery do Dia"');
  });

  it("agendar uma call grava pela mesma mutação real (salvarLeadDesk) sobre um lead já existente — nunca cria lead novo nem campo/tabela nova", () => {
    expect(rota).toContain("const mutarAgendamento = useMutation(");
    expect(rota).toContain('valores: { call_agendada_em: agendarQuando, status_call: "agendada" }');
    expect(rota).toContain("mutarAgendamento.mutate()");
    expect(rota).not.toContain("criarLeadManual");
  });

  it('"agendada" é valor real de STATUS_CALL (crm-desk.ts), não vocabulário CHECK novo', () => {
    const crmDesk = readFileSync("src/lib/crm-desk.ts", "utf8");
    expect(crmDesk).toContain('{ valor: "agendada", rotulo: "Agendada" }');
  });

  it("o select de lead usa os mesmos leadsReais já carregados (listarLeadsDesk), sem lista fictícia paralela", () => {
    expect(rota).toContain("leadsReais.map((l) => (");
  });
});
