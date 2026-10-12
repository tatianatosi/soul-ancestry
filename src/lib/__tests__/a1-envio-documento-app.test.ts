import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  ERRO_FORMATO,
  ERRO_TAMANHO,
  erroDoArquivoCliente,
  TAMANHO_MAXIMO_BYTES,
} from "../portal-envio-arquivo";

/**
 * A1 — aba Documentos do App ganha a caixa de envio do mockup 5/7.
 *
 * `prepararEnvioDocumento`/`confirmarEnvioDocumento` já existiam e
 * funcionavam, mas só eram chamados pela rota profunda `/portal/casos/$id`.
 * A aba Documentos — a tela que o mockup desenha COM caixa de envio — não
 * os chamava: o cliente não conseguia enviar documento por ela.
 *
 * A regra de arquivo saiu de dentro de `portal-cliente.server.ts` para um
 * módulo puro, para que servidor e tela recusem pelo mesmo critério e com a
 * mesma mensagem.
 */

const componente = readFileSync("src/components/portal/enviar-documento.tsx", "utf8");
const aba = readFileSync("src/routes/portal/documentos.tsx", "utf8");
const servidor = readFileSync("src/lib/portal-cliente.server.ts", "utf8");

describe("regra de arquivo tem uma fonte só", () => {
  it("o servidor usa a mesma função da tela", () => {
    expect(servidor).toContain("erroDoArquivoCliente");
    expect(servidor).toContain('from "@/lib/portal-envio-arquivo"');
  });

  it("as constantes duplicadas saíram do servidor", () => {
    expect(servidor).not.toContain('const EXTENSOES_PERMITIDAS = [');
    expect(servidor).not.toContain("const TAMANHO_MAXIMO = 25");
  });

  it("aceita os formatos aprovados", () => {
    for (const nome of ["a.pdf", "b.JPG", "c.jpeg", "d.png", "e.heic", "f.webp", "g.doc", "h.docx"]) {
      expect(erroDoArquivoCliente(nome, 1024)).toBeNull();
    }
  });

  it("recusa formato fora da lista com a mensagem do servidor", () => {
    expect(erroDoArquivoCliente("planilha.xlsx", 1024)).toBe(ERRO_FORMATO);
    expect(erroDoArquivoCliente("semextensao", 1024)).toBe(ERRO_FORMATO);
  });

  it("recusa arquivo acima do limite real de 25 MB", () => {
    expect(erroDoArquivoCliente("a.pdf", TAMANHO_MAXIMO_BYTES + 1)).toBe(ERRO_TAMANHO);
    expect(erroDoArquivoCliente("a.pdf", TAMANHO_MAXIMO_BYTES)).toBeNull();
  });

  it("recusa arquivo vazio ou tamanho inválido", () => {
    expect(erroDoArquivoCliente("a.pdf", 0)).toBe(ERRO_TAMANHO);
    expect(erroDoArquivoCliente("a.pdf", Number.NaN)).toBe(ERRO_TAMANHO);
  });

  it("o limite anunciado é o real, não os 10 MB do texto do mockup", () => {
    // §29: composição vem do mockup, dado vem da regra aprovada. Anunciar
    // 10 MB faria a tela recusar o que o servidor aceita.
    expect(TAMANHO_MAXIMO_BYTES).toBe(25 * 1024 * 1024);
    expect(componente).toContain("TAMANHO_MAXIMO_ROTULO");
    expect(componente).not.toContain("10 MB");
  });
});

describe("a aba Documentos envia de verdade", () => {
  it("renderiza a caixa de envio", () => {
    expect(aba).toContain("<EnviarDocumento");
    expect(aba).toContain('from "@/components/portal/enviar-documento"');
  });

  it("a copy que negava o envio saiu", () => {
    expect(aba).not.toContain("não inventamos upload");
  });

  it("deixa claro que enviar não é validar nem liberar", () => {
    /*
      22/09/2026: a frase corrida que este teste travava foi substituída por
      algo melhor — as quatro seções que o De-Para §7 pede de verdade
      (Solicitados, Recebidos, Liberados, Entregas). A separação semântica é o
      requisito; a frase era só uma forma de expressá-la. O teste passa a
      travar a separação, que é o que não pode voltar a sumir.
    */
    for (const secao of ["Solicitados", "Recebidos", "Liberados", "Entregas"]) {
      expect(aba, secao).toContain(secao);
    }
    expect(aba).toContain("data-documentos-recebidos");
  });

  it("envia para o caso ativo, não para o primeiro da lista", () => {
    // Travar o literal reprovava um `const casoAtivo = …` de mesmo valor. O
    // que importa é a ORIGEM: o caso ativo decidido pelo servidor, nunca [0].
    expect(aba).toMatch(/casoAtivo\s*=\s*vivo\.data\?\.casoAtivoId \?\? null|casoId=\{vivo\.data\?\.casoAtivoId \?\? null\}/);
    expect(aba).toContain("<EnviarDocumento casoId={");
    expect(aba).not.toContain("casos[0]");
  });
});

describe("o envio reusa os escritores existentes", () => {
  it("não cria escritor novo", () => {
    expect(componente).toContain("prepararEnvioDocumento");
    expect(componente).toContain("confirmarEnvioDocumento");
    expect(componente).not.toContain("createServerFn");
  });

  it("faz os dois passos que o servidor exige", () => {
    expect(componente).toContain('method: "PUT"');
    expect(componente).toContain("confirmar({");
    expect(componente).toContain("comTimeoutPortal(confirmar(");
  });

  it("valida no cliente antes de subir", () => {
    expect(componente).toContain("erroDoArquivoCliente(arquivo.name, arquivo.size)");
  });

  it("sem caso selecionado, o envio fica desabilitado em vez de falhar no servidor", () => {
    expect(componente).toContain("disabled={ocupado || !casoId}");
  });

  it("recarrega a lista depois do envio", () => {
    // Sem invalidar, o arquivo só apareceria no próximo F5.
    expect(componente).toContain('queryKey: ["portal-entregas"]');
  });
});
