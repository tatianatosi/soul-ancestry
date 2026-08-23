import { describe, expect, it } from "vitest";

import {
  conferirInstancias,
  instanciasVigentes,
  resumoInstancias,
  type AnexoNaTela,
  type InstanciaPersistida,
} from "@/lib/anexos-instancia";

const persistida = (o: Partial<InstanciaPersistida>): InstanciaPersistida => ({
  annex_code: "ANEXO_I_ORDEM_SERVICO",
  title: "Anexo I — Ordem de Serviço do caso",
  status: "missing",
  annex_version: 1,
  model_version: "ANEXO-I-ORDEM-DE-SERVICO-v1.0",
  file_hash: "abc123def456789",
  tem_conteudo: true,
  atualizado_em: "2026-08-01T10:00:00Z",
  is_test: false,
  ...o,
});

const tela = (o: Partial<AnexoNaTela>): AnexoNaTela => ({
  codigo: "ANEXO_I_ORDEM_SERVICO",
  titulo: "Anexo I",
  status: "missing",
  modelo: "ANEXO-I-ORDEM-DE-SERVICO-v1.0",
  ...o,
});

describe("instância documental canônica dos anexos", () => {
  it("mantém apenas a maior versão e ignora registros de teste", () => {
    const v = instanciasVigentes([
      persistida({ annex_version: 1 }),
      persistida({ annex_version: 3, file_hash: "novo" }),
      persistida({ annex_code: "ANEXO_II_DESPESAS_EXTERNAS", is_test: true }),
    ]);
    expect(v).toHaveLength(1);
    expect(v[0].annex_version).toBe(3);
  });

  it("aponta canônica quando tela e instância salva coincidem", () => {
    const [l] = conferirInstancias([tela({})], [persistida({})]);
    expect(l.estado).toBe("canonica");
    expect(l.versao).toBe(1);
    expect(resumoInstancias([l]).conforme).toBe(true);
  });

  it("marca desatualizada quando o status ou o modelo mudou na tela", () => {
    const [l] = conferirInstancias([tela({ status: "approved" })], [persistida({})]);
    expect(l.estado).toBe("desatualizada");
    expect(resumoInstancias([l]).conforme).toBe(false);
  });

  it("marca desatualizada quando a instância salva não tem conteúdo", () => {
    const [l] = conferirInstancias([tela({})], [persistida({ tem_conteudo: false })]);
    expect(l.estado).toBe("desatualizada");
  });

  it("marca não materializada quando a tela mostra anexo sem instância salva", () => {
    const [l] = conferirInstancias([tela({ codigo: "ANEXO_V_ALTERACAO_ESCOPO" })], []);
    expect(l.estado).toBe("nao_materializada");
    expect(l.versao).toBeNull();
  });

  it("expõe instância salva que as regras atuais não geram mais", () => {
    const linhas = conferirInstancias([], [persistida({})]);
    expect(linhas[0].estado).toBe("somente_persistida");
    expect(resumoInstancias(linhas).somente_persistidas).toBe(1);
  });

  it("resume caso sem anexos sem declarar conformidade", () => {
    const r = resumoInstancias([]);
    expect(r.conforme).toBe(false);
    expect(r.total).toBe(0);
  });
});
