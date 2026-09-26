import { describe, expect, it } from "vitest";

import { contemCpf } from "@/lib/validacao-pessoa";
import { conteudoProjetavel } from "@/lib/biblioteca-evidencias";
import { termoProibido } from "@/lib/achados-genealogicos";
import { entregasParaAppCliente, type MicroentregaBruta } from "@/lib/jornada-cliente";
import { contemConteudoInterno } from "@/lib/onboarding-jornada";
import { textoParaCliente } from "@/lib/portal-linguagem-viva";

/**
 * P5b (26/09/2026) — pedido direto da Proprietária: "Verifique quais outros
 * filtros automáticos podem ser reutilizáveis entre as abas e o app".
 *
 * Achado: existiam ~10 filtros independentes de "termo proibido em texto
 * cliente-facing" (biblioteca-evidencias.ts, achados-genealogicos.ts,
 * jornada-cliente.ts, onboarding-jornada.ts, portal-linguagem-viva.ts,
 * fila-comunicacao.ts, templates-whatsapp.ts, portal-copy.ts,
 * ca04-crm-mestre.ts) e só 2 tinham qualquer proteção contra CPF (a que o
 * corte anterior criou em biblioteca-evidencias.ts, e uma busca pela palavra
 * literal "cpf" em templates-whatsapp.ts). `contemCpf` virou fonte única em
 * `validacao-pessoa.ts`, reaproveitada nos 5 gates que já protegem conteúdo
 * cliente-facing real (não recriada em cada um).
 */

describe("P5b — contemCpf é a fonte única (validacao-pessoa.ts)", () => {
  it("detecta formato pontuado e dígitos crus com verificador válido", () => {
    expect(contemCpf("CPF 111.444.777-35")).toBe(true);
    expect(contemCpf("CPF 11144477735")).toBe(true);
  });

  it("não marca falso positivo em 11 dígitos que não formam CPF real", () => {
    expect(contemCpf("Registro nº 12345678901")).toBe(false);
    expect(contemCpf("Sem nenhum número aqui.")).toBe(false);
    expect(contemCpf("")).toBe(false);
  });
});

describe("P5b — cada gate cliente-facing reaproveita contemCpf, não duplica regex", () => {
  it("biblioteca-evidencias.ts: conteudoProjetavel (já existia desde o corte anterior)", () => {
    expect(conteudoProjetavel("Documento localizado, CPF 111.444.777-35.").ok).toBe(false);
  });

  it("achados-genealogicos.ts: termoProibido cobre title_client/resumo_aprovado_cliente/etc.", () => {
    expect(termoProibido("CPF do requerente: 111.444.777-35")).toBe("CPF");
    expect(termoProibido("Registro paroquial de 1887 em Graz")).toBeNull();
  });

  it("jornada-cliente.ts: entregasParaAppCliente recusa micro-entrega com CPF no texto", () => {
    const base: MicroentregaBruta = {
      id: "m1",
      approval_status: "publicado",
      deliverable_type: "achado",
      journey_phase: "pesquisa_inicial",
      title_client: "Documento localizado",
      summary_approved: "CPF 111.444.777-35 confirmado no registro.",
      deep_link: null,
      available_at: null,
      viewed_at: null,
    };
    expect(entregasParaAppCliente([base])).toHaveLength(0);
    expect(
      entregasParaAppCliente([{ ...base, summary_approved: "Registro civil localizado no arquivo paroquial." }]),
    ).toHaveLength(1);
  });

  it("onboarding-jornada.ts: contemConteudoInterno também recusa CPF, não só jargão", () => {
    expect(contemConteudoInterno("CPF 111.444.777-35 já cadastrado")).toBe(true);
    expect(contemConteudoInterno("Etapa concluída com sucesso")).toBe(false);
  });

  it("portal-linguagem-viva.ts: textoParaCliente (o filtro de maior alcance — cadência, pesquisa, documentos, entregas, fases e legado) também recusa CPF", () => {
    expect(textoParaCliente("Confirmado para o CPF 111.444.777-35")).toBe("");
    expect(textoParaCliente("Documento recebido pela equipe")).not.toBe("");
  });
});

describe("P5b — declarado, não tocado nesta rodada (fora do escopo confirmado)", () => {
  it("fila-comunicacao.ts e templates-whatsapp.ts continuam com seus próprios filtros (rascunho revisado por humano antes de enviar; templates-whatsapp.ts já bloqueia a palavra literal 'cpf')", () => {
    // Marcador de decisão — não um teste de comportamento: registra que a
    // consolidação parou aqui por decisão de escopo, não por esquecimento.
    expect(true).toBe(true);
  });
});
