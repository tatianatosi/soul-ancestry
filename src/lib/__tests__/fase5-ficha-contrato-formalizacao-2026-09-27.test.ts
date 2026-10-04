/*
 * Decisão da Proprietária em 04/10/2026, literal: "Retire todas as auditorias
 * repetidas do menu, de todas as abas e também os bloqueios humanos do
 * contrato." Saíram da tela de preparação: o cartão "Pendências humanas", o
 * "Checklist operacional — pré-contrato", o cartão "Coerência & Instrumentos"
 * (que reunia instrumentos, matriz jurídica e preparação — três conferências
 * do mesmo ato) e o cartão "Auditoria" (a trilha única vive em
 * /configuracoes). Nenhum componente nem rota foi apagado; só deixaram de ser
 * montados aqui. A decisão anterior, que exigia esses blocos, fica registrada
 * nos comentários abaixo.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

/**
 * Fase 5 (27/09/2026) — "Prompt Canônicos": Ficha Contrato/Formalização.
 * Confirma sequência já correta, Canva 1-7 mandatório e posicionamento da
 * reconciliação de contato (Fase 0) — sem criar contrato/assinatura reais.
 */

describe("Fase 5 — Canva (proposal_canva_pages) já é fonte mandatória 1-7", () => {
  const migrations = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  const conteudo = migrations.map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
  const crmDesk = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("CHECK real garante page_number entre 1 e 7", () => {
    expect(conteudo).toContain("page_number int NOT NULL CHECK (page_number BETWEEN 1 AND 7)");
  });

  it("listarPaginasCanva/salvarPaginaCanva continuam os únicos leitor/escritor", () => {
    expect(crmDesk).toContain("export const listarPaginasCanva");
    expect(crmDesk).toContain("export const salvarPaginaCanva");
    expect(crmDesk).toContain('.from("proposal_canva_pages")');
  });

  // Resgate Ana (27/09/2026): Canva é a fonte do card "1. Proposta aprovada".
  it("CompletudeCanva está montado no card 1 (Proposta aprovada)", () => {
    const inicioCard1 = pagina.indexOf('titulo="1. Proposta aprovada"');
    const inicioCard2 = pagina.indexOf('titulo="2. Partes e representação"');
    const trecho = pagina.slice(inicioCard1, inicioCard2);
    expect(trecho).toContain("<CompletudeCanva");
  });
});

/*
 * Resgate Ana (autorização da Proprietária, 27/09/2026) substituiu a
 * sequência dos 7 cards técnicos pela ordem de trabalho Proposta → Partes →
 * Escopo → Condição particular → OS/Anexos → Pendências → Salvar. Estes
 * testes travam a nova ordem; os cards técnicos continuam existindo em
 * "Detalhes internos".
 */
describe("Fase 5 — ordem de trabalho do Resgate Ana", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
  const trecho = (de: string, ate: string) => pagina.slice(pagina.indexOf(de), pagina.indexOf(ate));

  it("escopo vem da proposta (card 3) e a condição particular não usa catálogo (card 4)", () => {
    expect(trecho('titulo="3. Escopo e entregas"', 'titulo="4. Condição particular do caso"')).toContain("<EscopoProposta");
    const card4 = trecho('titulo="4. Condição particular do caso"', 'titulo="5. Ordem de Serviço (Anexo I) e anexos"');
    expect(card4).toContain("data-condicao-particular");
    expect(card4).not.toContain("<RegraComercial");
  });

  it("card 5 traz a OS (CadeiaFormalizacao governada pelo Planejador) antes dos Anexos I-V", () => {
    const card5 = trecho('titulo="5. Ordem de Serviço (Anexo I) e anexos"', 'titulo="6. Salvar rascunho"');
    const posCadeia = card5.indexOf("<CadeiaFormalizacao");
    const posAnexos = card5.indexOf("<AnexosIaV");
    expect(posCadeia).toBeGreaterThan(-1);
    expect(card5).toContain("governadoPeloPlanejador={governado}");
    expect(posCadeia).toBeLessThan(posAnexos);
  });

  it("reconciliação de contato e CPF das partes está no card 2 (Partes), antes das Pendências", () => {
    const card2 = trecho('titulo="2. Partes e representação"', 'titulo="3. Escopo e entregas"');
    expect(card2).toContain("<ReconciliarContatoPartesContrato");
    expect(card2).toContain("<ReconciliarCpfPartes");
    expect(card2).toContain("<PainelDependentes");
  });

  it("assinatura fica no último passo de Revisar prévia (id decisao-humana), depois da prévia do contrato", () => {
    const posDecisao = pagina.indexOf('id="decisao-humana"');
    expect(posDecisao).toBeGreaterThan(pagina.indexOf("1. ${instrumento} — prévia completa"));
    const trechoDecisao = pagina.slice(posDecisao, pagina.indexOf('<details id="detalhes-internos"'));
    expect(trechoDecisao).toContain("Criar solicitação de assinatura");
    expect(trechoDecisao).toContain("Registrar assinatura externa");
  });

  it("a trilha de auditoria passa a ter um único lugar: Configuração", () => {
    // 04/10/2026: o cartão "Auditoria" saiu da tela de contrato — era a
    // terceira cópia do mesmo registro. A tela aponta para a trilha única.
    expect(pagina).not.toContain('titulo="Auditoria"');
    expect(pagina).toContain("Configuração › trilha de auditoria");
  });
});

describe("Fase 5 — nenhum contrato/assinatura/cobrança real criado por esta fase", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("os writers de assinatura/envio continuam os mesmos de antes (nenhum novo introduzido)", () => {
    expect(pagina).toContain("enviarParaAssinatura");
    expect(pagina).toContain("registrarAssinatura");
    expect(pagina).not.toContain("enviarParaAssinaturaNovo");
    expect(pagina).not.toContain("registrarAssinaturaNovo");
  });
});
