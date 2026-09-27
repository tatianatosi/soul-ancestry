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

  it("CompletudeCanva está montado no card 1 (Planejador & Comercial)", () => {
    const inicioCard1 = pagina.indexOf('titulo="1. Planejador & Comercial"');
    const inicioCard2 = pagina.indexOf('titulo="2. Formalização & Anexos"');
    const trecho = pagina.slice(inicioCard1, inicioCard2);
    expect(trecho).toContain("<CompletudeCanva");
  });
});

describe("Fase 5 — sequência real dos 7 cards não foi alterada sem necessidade genuína", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("card 1 traz escopo aprovado e condição comercial", () => {
    const inicio = pagina.indexOf('titulo="1. Planejador & Comercial"');
    const fim = pagina.indexOf('titulo="2. Formalização & Anexos"');
    const trecho = pagina.slice(inicio, fim);
    expect(trecho).toContain("<EscopoProposta");
    expect(trecho).toContain("<RegraComercial");
  });

  it("card 2 traz OS (BloqueioEmissaoOS via CadeiaFormalizacao) antes dos Anexos I-V", () => {
    const inicio = pagina.indexOf('titulo="2. Formalização & Anexos"');
    const fim = pagina.indexOf('titulo="3. Cláusulas & Perfil Institucional"');
    const trecho = pagina.slice(inicio, fim);
    const posCadeia = trecho.indexOf("<CadeiaFormalizacao");
    const posAnexos = trecho.indexOf("<AnexosIaV");
    expect(posCadeia).toBeGreaterThan(-1);
    expect(posAnexos).toBeGreaterThan(-1);
    expect(posCadeia).toBeLessThan(posAnexos);
  });

  it("reconciliação de contato das partes (Fase 0) está no card 2, antes do card 6 (Prévia & Versões)", () => {
    const posReconciliar = pagina.indexOf("<ReconciliarContatoPartesContrato");
    const posPrevias = pagina.indexOf('titulo="6. Prévia & Versões"');
    expect(posReconciliar).toBeGreaterThan(-1);
    expect(posPrevias).toBeGreaterThan(-1);
    expect(posReconciliar).toBeLessThan(posPrevias);
  });

  it("assinatura e bloqueios continuam elevados em 'Decisão humana', fora dos cards (decisão de 19/09/2026, não revertida)", () => {
    const posDecisaoHumana = pagina.indexOf('id="decisao-humana"');
    const posCard1 = pagina.indexOf('titulo="1. Planejador & Comercial"');
    expect(posDecisaoHumana).toBeGreaterThan(-1);
    expect(posDecisaoHumana).toBeLessThan(posCard1);
    const trechoDecisao = pagina.slice(posDecisaoHumana, posCard1);
    expect(trechoDecisao).toContain("Criar solicitação de assinatura");
    expect(trechoDecisao).toContain("Registrar assinatura externa");
  });

  it("card 7 (Auditoria) continua sendo o histórico, por último no modo Revisar", () => {
    expect(pagina).toContain('titulo="7. Auditoria"');
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
