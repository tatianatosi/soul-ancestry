import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  AVISO_ANEXOS_NO_CORPO,
  CAT_MODO_ANEXOS,
  MODO_ANEXOS_INCORPORADO,
  MODO_ANEXOS_SEPARADO,
  MOTIVO_SEM_ANEXO_APLICAVEL,
  ausenciaDeAnexoEhPendencia,
  modoAnexosDeclarado,
  modoAnexosEfetivo,
} from "@/lib/modo-anexos";
import { definicaoCampo } from "@/lib/parametros-dicionario";

describe("o modo dos anexos é escolha registrada, não derivação", () => {
  it("escolha humana prevalece sobre a completude dos blocos", () => {
    expect(modoAnexosEfetivo("separado", true).modo).toBe(MODO_ANEXOS_SEPARADO);
    expect(modoAnexosEfetivo("incorporado", false).modo).toBe(MODO_ANEXOS_INCORPORADO);
    expect(modoAnexosEfetivo("separado", true).derivado).toBe(false);
  });

  it("sem escolha, o modo é derivado — e a tela diz que é derivado", () => {
    const d = modoAnexosEfetivo(null, true);
    expect(d.modo).toBe(MODO_ANEXOS_INCORPORADO);
    expect(d.derivado).toBe(true);
    expect(d.explicacao).toContain("ainda não escolhido");
  });

  it("incorporado com bloco pendente avisa, em vez de mudar de forma sozinho", () => {
    expect(modoAnexosEfetivo("incorporado", false).explicacao).toContain("pendência");
  });

  it("valor fora da lista controlada não vira modo", () => {
    expect(modoAnexosDeclarado("misto")).toBeNull();
    expect(modoAnexosDeclarado("")).toBeNull();
    expect(modoAnexosEfetivo("misto", true).derivado).toBe(true);
  });

  it("a lista controlada tem exatamente os dois modos", () => {
    expect(CAT_MODO_ANEXOS.map((o) => o.valor)).toEqual([MODO_ANEXOS_INCORPORADO, MODO_ANEXOS_SEPARADO]);
  });
});

describe("no modo incorporado, não haver anexo deixa de ser pendência", () => {
  it("separado continua exigindo anexo aplicável", () => {
    expect(ausenciaDeAnexoEhPendencia(MODO_ANEXOS_SEPARADO)).toBe(true);
  });

  it("incorporado não trata ausência de anexo como bloqueio", () => {
    expect(ausenciaDeAnexoEhPendencia(MODO_ANEXOS_INCORPORADO)).toBe(false);
  });

  it("o leitor usa a mesma string do bloqueio histórico e só a remove no modo incorporado", () => {
    const fn = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(fn).toContain("MOTIVO_SEM_ANEXO_APLICAVEL");
    expect(fn).toContain("ausenciaDeAnexoEhPendencia(modoAnexos.modo)");
    expect(MOTIVO_SEM_ANEXO_APLICAVEL).toBe("Nenhum anexo aplicável pelas regras existentes.");
  });

  it("o gate de proposta aprovada NÃO é afetado — continua no leitor", () => {
    const fn = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(fn).toContain('motivo: "Nenhuma proposta vinculada ao caso."');
    expect(AVISO_ANEXOS_NO_CORPO).toContain("proposta aprovada continua sendo exigida");
  });
});

describe("o campo existe como parâmetro auditado e não como bloqueio novo", () => {
  it("é dropdown de lista controlada com justificativa obrigatória", () => {
    const def = definicaoCampo("modo_anexos");
    expect(def.tipo).toBe("dropdown");
    expect(def.justificativa).toBe("obrigatoria");
    expect(def.opcoes).toBe(CAT_MODO_ANEXOS);
  });

  it("a migration semeia a linha em contrato já existente e não é obrigatória", () => {
    const sql = readFileSync("supabase/migrations/20261008190000_contract_parameter_modo_anexos.sql", "utf8");
    expect(sql).toContain("'servicos','modo_anexos'");
    expect(sql).toContain(",false,45)");
    expect(sql).toContain("INSERT INTO public.contract_parameter_values");
    expect(sql).not.toMatch(/DROP |DELETE FROM/);
  });
});
