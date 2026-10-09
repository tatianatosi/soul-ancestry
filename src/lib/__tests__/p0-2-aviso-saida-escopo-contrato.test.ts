import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P0-2 (fatia real, não a versão assumida no pedido): `contratos.$id.tsx`
 * não tem UM formulário grande de edição em lote como `casos.$caseId.
 * index.tsx` — o campo "Resumo" já autosalva por campo (onBlur/onChange,
 * ver `Campo`), então o dirty-state clássico não se aplica lá. O risco
 * real de perda silenciosa está nos formulários de "adicionar item" que
 * só gravam ao clicar (Escopo, Partes, Cláusulas, Anexos, Fontes). Este
 * corte cobre o primeiro deles (Escopo — não é cláusula, anexo jurídico
 * nem assinatura) como fatia P0 comprovada; os demais ficam registrados
 * como P1 na matriz, mesmo padrão, mesmo risco menor.
 *
 * ATUALIZADO EM 09/10/2026 — o P0-2 original cobria só o F5 (listener de
 * `beforeunload` escrito à mão aqui dentro). A varredura de continuidade
 * mostrou que sair pela navegação interna do Desk perdia o mesmo rascunho,
 * em 45 telas. O mecanismo passou a ser `useAvisoEdicaoNaoSalva`
 * (`src/lib/aviso-edicao-nao-salva.ts`), que cobre F5 **e** troca de rota, e
 * o listener solto daqui saiu. Os asserts abaixo deixaram de pinçar o
 * listener e passaram a exigir o guard — a proteção aumentou, não diminuiu,
 * e os outros formulários de "adicionar item" (Partes, Cláusulas, Anexos,
 * Fontes), que o texto acima deixava como P1, também passaram a ter o seu.
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

function corpoDaFuncao(nome: string): string {
  const inicio = ARQUIVO.indexOf(`function ${nome}(`);
  if (inicio === -1) throw new Error(`função ${nome} não encontrada`);
  const proximaFuncao = ARQUIVO.indexOf("\nfunction ", inicio + 1);
  return ARQUIVO.slice(inicio, proximaFuncao === -1 ? undefined : proximaFuncao);
}

describe("P0-2 — aviso de saída com rascunho não confirmado em Escopo do contrato", () => {
  it("o guard único está importado do módulo, não reescrito na tela", () => {
    expect(ARQUIVO).toMatch(
      /import \{ useAvisoEdicaoNaoSalva \} from "@\/lib\/aviso-edicao-nao-salva";/,
    );
    expect(ARQUIVO).not.toMatch(/addEventListener\("beforeunload"/);
  });

  it("Escopo trava a saída só quando há título digitado, não incondicionalmente", () => {
    const escopo = corpoDaFuncao("Escopo");
    expect(escopo).toMatch(/useAvisoEdicaoNaoSalva\(titulo\.trim\(\) !== ""\)/);
  });

  it("os outros formulários de adicionar item também ganharam o guard (eram P1)", () => {
    for (const nome of ["Clausulas", "Anexos", "Partes", "Fontes"]) {
      expect(corpoDaFuncao(nome), nome).toMatch(/useAvisoEdicaoNaoSalva\(/);
    }
  });

  it("o guard só lê rascunho — nenhuma chamada dele toca campo de assinatura", () => {
    // `Partes` legitimamente trata `signature_required` (é a tabela de partes);
    // o que este teste protege é que o guard não passou a ler/gravar isso.
    const linhas = ARQUIVO.split("\n");
    const chamadas: string[] = [];
    linhas.forEach((linha, i) => {
      if (!linha.includes("useAvisoEdicaoNaoSalva(")) return;
      // a chamada termina na primeira linha `  );` (ou já na própria linha)
      let trecho = linha;
      for (let j = i + 1; j < linhas.length && !/^\s*\);\s*$/.test(linhas[j - 1]); j++) {
        if (/;\s*$/.test(linhas[j - 1])) break;
        trecho += "\n" + linhas[j];
      }
      chamadas.push(trecho);
    });
    expect(chamadas.length).toBeGreaterThanOrEqual(6);
    for (const chamada of chamadas) {
      expect(chamada).not.toMatch(/signed_at|signature_required/);
    }
  });

  it("o item de escopo já tinha arquivamento com histórico antes deste corte (não recriado)", () => {
    const escopo = corpoDaFuncao("Escopo");
    expect(escopo).toMatch(/Arquiva o item de escopo/);
    expect(escopo).toMatch(/O registro permanece no histórico/);
  });
});
