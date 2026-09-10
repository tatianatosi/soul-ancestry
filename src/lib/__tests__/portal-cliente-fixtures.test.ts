import { describe, expect, it } from "vitest";
import { filtrarParaCliente } from "@/lib/classificacao-dados";
import { semFixtures } from "@/lib/fixtures";

/**
 * Regressão: portal_casos/documents/invoices nunca tiveram as colunas
 * classificacao_dado/data_origin/origem_confirmada (só crm_casos, leads,
 * clientes, tarefas, case_alerts e communication_queue têm essa coluna).
 * `filtrarParaCliente`, usado antes em portal-cliente.functions.ts e
 * portal-jornada.functions.ts contra essas três tabelas, classificava toda
 * linha real delas como "nao_classificado" e escondia tudo, sempre, para
 * todo cliente real — caso, documento e fatura. `semFixtures` é o filtro
 * correto: usa o sinal que essas tabelas realmente carregam.
 */
describe("filtro de fixture/demo nas tabelas do App Cliente (regressão)", () => {
  const casoReal = { id: "c1", codigo: "CA-CID-BR-001", titulo: "João da Silva" };
  const documentoReal = { id: "d1", titulo: "Certidão de nascimento", liberado_cliente: true, is_demo: false };
  const faturaReal = { id: "f1", numero: "INV-001", dados_teste: false };
  const documentoDemo = { id: "d2", titulo: "Documento de teste", is_demo: true };

  it("filtrarParaCliente (bug antigo) escondia caso/documento/fatura reais dessas tabelas", () => {
    expect(filtrarParaCliente([casoReal])).toEqual([]);
    expect(filtrarParaCliente([documentoReal])).toEqual([]);
    expect(filtrarParaCliente([faturaReal])).toEqual([]);
  });

  it("semFixtures (correção) mantém caso/documento/fatura reais", () => {
    expect(semFixtures([casoReal])).toEqual([casoReal]);
    expect(semFixtures([documentoReal])).toEqual([documentoReal]);
    expect(semFixtures([faturaReal])).toEqual([faturaReal]);
  });

  it("semFixtures continua excluindo demo/fixture", () => {
    expect(semFixtures([documentoDemo])).toEqual([]);
  });
});
