import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { propostasAguardandoResposta, type CasoCarteira } from "@/lib/golive-operacao";

// P27 (26/09/2026) — pente-fino das premissas de CRM Vivo, Painel de Calls,
// Painel Hoje e Pessoa Unificada dos 3 documentos de redesenho, executando
// os gaps genuínos e aditivos encontrados (achado dos 3 agentes Explore
// desta rodada). Sobreposição Painel Hoje golive × painel-dia.tsx continua
// deliberadamente fora de escopo — decisão adiada pela Proprietária para o
// fechamento do Desk.

describe("P27 — Caso 360: botão Mover fase + rótulo unificado da Visão Administrativa", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("hero tem um select 'Mover fase' com as opções de EIXO_COMERCIAL, chamando atualizar() diretamente", () => {
    const inicio = pagina.indexOf('aria-label="Mover fase"');
    const bloco = pagina.slice(inicio, inicio + 900);
    expect(bloco).toContain("mMoverFase.mutate(valor)");
    expect(bloco).toContain("EIXO_COMERCIAL.map(");
  });

  it("o botão de Visão Administrativa do Cliente usa o rótulo unificado", () => {
    expect(pagina).toContain("Abrir Visão Administrativa do Cliente");
    // Nenhuma ocorrência do rótulo antigo, divergente do usado em Pessoa 360.
    expect(pagina).not.toContain("Abrir visão do cliente");
  });

  it("o card 'Visão do cliente' agora mostra próximo passo publicado e último acesso do cliente", () => {
    const inicio = pagina.indexOf('id="resumo-visao-cliente"');
    const fim = pagina.indexOf("No máximo: três tarefas");
    const bloco = pagina.slice(inicio, fim);
    expect(bloco).toContain("Próximo passo publicado ao cliente");
    expect(bloco).toContain("Último acesso do cliente");
  });
});

describe("P27 — Pessoa 360: rótulo unificado + card Experiência no App", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("usa o mesmo rótulo do Caso 360 para a Visão Administrativa do Cliente", () => {
    expect(pagina).toContain("Abrir Visão Administrativa do Cliente");
    expect(pagina).not.toContain(">Visão do cliente<");
  });

  it("cada caso da pessoa ganha o card ExperienciaNoApp, reaproveitando resumoVisaoClienteCaso", () => {
    expect(pagina).toContain("<ExperienciaNoApp caseId={c.id} />");
    expect(pagina).toContain("resumoVisaoClienteCaso");
    // Nenhum escritor novo: só leitura via useQuery/useServerFn, mesmo padrão do Caso 360.
    expect(pagina).toContain('queryKey: ["ficha-caso-visao-cliente", caseId]');
  });
});

describe("P27 — resumoVisaoClienteCaso ganha proximaAcao (dado já computado, nunca exposto antes)", () => {
  const fn = readFileSync("src/lib/app-cliente-como-pessoa.functions.ts", "utf8");

  it("calcula proximaAcao com projetarProximaAcaoCliente/sinaisDoCasoPortal, mesma função de dadosVivosDoPortalComoAdmin", () => {
    const trecho = fn.slice(fn.indexOf("export const resumoVisaoClienteCaso"));
    expect(trecho).toContain("const proximaAcao = projetarProximaAcaoCliente(");
    expect(trecho).toContain("sinaisDoCasoPortal({");
    expect(trecho).toContain("proximaAcao,");
  });

  it("bug de vocabulário corrigido: invoices.status usa 'aberta' (CHECK real), nunca 'pendente' (valor inexistente)", () => {
    expect(fn).not.toContain('"pendente", "vencida"');
    expect(fn).toContain('"aberta", "vencida"');
  });
});

describe("P27 — mesmo bug de vocabulário corrigido nas outras 2 fontes do sinal 'pagamento pendente' do portal", () => {
  it("portal-cliente.functions.ts e portal-dados-vivos.functions.ts não filtram mais por 'pendente'", () => {
    for (const arquivo of ["src/lib/portal-cliente.functions.ts", "src/lib/portal-dados-vivos.functions.ts"]) {
      const conteudo = readFileSync(arquivo, "utf8");
      expect(conteudo).not.toContain('"pendente", "vencida"');
      expect(conteudo).toContain('"aberta", "vencida"');
    }
  });
});

describe("P27 — salvarLeadDesk: insert de lead novo usa inserirComVerificacao (gap do adendo 31/08/2026 fechado)", () => {
  const trecho = readFileSync("src/lib/crm-desk.functions.ts", "utf8").slice(
    readFileSync("src/lib/crm-desk.functions.ts", "utf8").indexOf("export const salvarLeadDesk"),
  );

  it("chama inserirComVerificacao com a tabela leads, não .insert() cru", () => {
    expect(trecho).toContain('tabela: "leads"');
    expect(trecho).toContain("await inserirComVerificacao(");
  });

  it("continua auditando o lead criado e os eventos de call, com o id relido", () => {
    expect(trecho).toContain("resultadoInsert.id");
    expect(trecho).toContain("await registrarAuditoriaLead(");
    expect(trecho).toContain("await registrarEventosCall(");
  });
});

describe("P27 — propostasAguardandoResposta: pura, reaproveita eixo_comercial já carregado na carteira", () => {
  const base: CasoCarteira = {
    id: "c1",
    status: "ativo",
    prioridade: null,
    temProximaAcao: true,
    prazoProximaAcao: null,
  };

  it("filtra só casos ativos com eixo_comercial = proposta_enviada", () => {
    const carteira: CasoCarteira[] = [
      { ...base, id: "a", eixoComercial: "proposta_enviada", titulo: "Caso A" },
      { ...base, id: "b", eixoComercial: "negociacao", titulo: "Caso B" },
      { ...base, id: "c", status: "encerrado", eixoComercial: "proposta_enviada", titulo: "Caso C" },
    ];
    const linhas = propostasAguardandoResposta(carteira);
    expect(linhas).toEqual([{ id: "a", rotulo: "Caso A" }]);
  });

  it("nunca fabrica proposta: carteira sem nenhuma em proposta_enviada devolve lista vazia", () => {
    expect(propostasAguardandoResposta([{ ...base, eixoComercial: "novo_lead" }])).toEqual([]);
  });
});

describe("P27 — Painel Hoje ganha os 3 blocos que faltavam do Pacote de Instruções", () => {
  const pagina = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

  it("Propostas aguardando resposta, Contratos aguardando assinatura e Pagamentos pendentes/vencidos existem como cards", () => {
    for (const titulo of [
      "Propostas aguardando resposta",
      "Contratos aguardando assinatura",
      "Pagamentos pendentes/vencidos",
    ]) {
      expect(pagina).toContain(titulo);
    }
  });

  it("ação direta dos 3 cards novos abre /casos/$caseId — nunca uma lista desconectada", () => {
    const inicio = pagina.indexOf('titulo="Propostas aguardando resposta"');
    const fim = pagina.indexOf('titulo="Cadência dos casos"');
    const bloco = pagina.slice(inicio, fim);
    const ocorrencias = bloco.match(/to="\/casos\/\$caseId"/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(3);
  });
});

describe("P27 — golive.functions.ts: contratos/faturas por organização, sem tabela nova", () => {
  const fn = readFileSync("src/lib/golive.functions.ts", "utf8");

  it("contratosAguardandoAssinatura lê contracts.status = 'sent' (vocabulário real do CHECK)", () => {
    expect(fn).toContain('.from("contracts")');
    expect(fn).toContain('.eq("status", "sent")');
    expect(fn).toContain("contratosAguardandoAssinatura:");
  });

  it("pagamentosPendentes lê invoices com status aberta/vencida", () => {
    expect(fn).toContain('pagamentosPendentes: faturasPendentesOrg.map(');
    expect(fn).toMatch(/faturasPendentesResp[\s\S]{0,500}\["aberta", "vencida"\]/);
  });

  it("carteira agora carrega eixo_comercial (mesma tabela crm_casos, nenhuma query nova)", () => {
    const inicio = fn.indexOf('const carteira = (');
    const fim = fn.indexOf(").data as Linha[] | null;", inicio);
    expect(fn.slice(inicio, fim)).toContain("eixo_comercial");
  });
});
