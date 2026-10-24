import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Proprietária, 24/10/2026: "O `window.open` em
 * src/routes/_authenticated/contratos.$id.tsx abre uma janela em branco
 * bloqueada pelo navegador. Renderize o HTML da Versão 2 (16 cláusulas reais)
 * embutido diretamente dentro da própria página do Desk, para que o documento
 * de 8 páginas seja lido na hora."
 *
 * Medido antes de executar, e o relato aponta para DOIS pop-ups distintos —
 * nenhum deles sendo o caminho de leitura:
 *
 *  - a leitura embutida JÁ EXISTIA e continua intacta: o botão "Ver o texto
 *    real da versão vN" monta o HTML da prévia num `iframe srcDoc` de 65vh na
 *    própria página (nada aqui foi reescrito);
 *  - a janela em branco literal era `AbrirDocumentoContrato`, que fazia
 *    `window.open("", "_blank")` e só então escrevia o HTML dentro da aba —
 *    o bloqueador matava uma aba que nascia vazia;
 *  - o `window.open` da linha citada era o botão de arquivo privado, chamado
 *    DEPOIS do `await` da URL assinada: fora do gesto do usuário, logo
 *    bloqueável.
 *
 * Os dois pop-ups saem; a composição homologada da tela fica onde está.
 */

const impressao = readFileSync("src/components/contrato/abrir-documento-contrato.tsx", "utf8");
const rota = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

/**
 * Os dois arquivos CITAM `window.open` em comentário, para registrar o defeito
 * que foi removido. Medir o pop-up é medir o código, não a explicação dele —
 * então as linhas de comentário saem antes da asserção.
 */
const semComentario = (fonte: string) =>
  fonte
    .split("\n")
    .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*") && !l.trim().startsWith("/*"))
    .join("\n");

describe("o documento do contrato imprime sem abrir aba nenhuma", () => {
  it("não existe mais `window.open` para escrever o documento dentro", () => {
    expect(semComentario(impressao)).not.toContain("window.open");
    expect(semComentario(impressao)).not.toContain("document.write");
  });

  it("imprime de um iframe oculto montado na própria página", () => {
    expect(impressao).toContain('document.createElement("iframe")');
    expect(impressao).toContain("quadro.srcdoc = doc");
    expect(impressao).toContain("quadro.contentWindow");
    expect(impressao).toContain("janela.print()");
  });

  it("o iframe é removido ao fim da impressão e tem rede de segurança por prazo", () => {
    expect(impressao).toContain('janela.addEventListener("afterprint", limpar');
    expect(impressao).toContain("window.setTimeout(limpar");
  });

  it("segue usando o MESMO HTML da prévia, sem escrever, enviar nem persistir", () => {
    expect(impressao).toContain("documentoImprimivelDoContrato");
    for (const proibido of ["useMutation", "createServerFn", "fetch(", "supabase"]) {
      expect(impressao, proibido).not.toContain(proibido);
    }
  });
});

describe("o arquivo privado da versão abre por clique real, não por pop-up", () => {
  it("a rota não tem mais `window.open` depois de um await", () => {
    expect(semComentario(rota)).not.toContain("window.open");
  });

  it("a URL assinada vira estado e é oferecida como link visível na linha", () => {
    expect(rota).toContain("setArquivo({ versao: v.version_number, url: r.url })");
    expect(rota).toContain("arquivo && arquivo.versao === v.version_number");
    expect(rota).toContain('rel="noopener noreferrer"');
  });

  it("o botão passa a dizer que PREPARA o arquivo, porque abrir é o segundo passo", () => {
    expect(rota).toContain("Preparar arquivo");
    expect(rota).toContain("Abrir arquivo da v{v.version_number}");
  });
});

describe("a leitura embutida que já existia não foi tocada", () => {
  it("o texto real da versão continua montado em iframe srcDoc na própria página", () => {
    expect(rota).toContain("srcDoc={previa.html}");
    expect(rota).toContain("h-[65vh] min-h-[480px] w-full");
    expect(rota).toContain("Ver o texto real da versão v{maisRecente.version_number}");
  });

  it("a prévia continua sem enviar, assinar ou publicar", () => {
    expect(rota).toContain("não envia, assina ou publica o documento");
  });
});
