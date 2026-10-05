import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ORFAS_CLASSIFICADAS, orfasPor } from "@/lib/orfaos-classificados";
import { PAPEIS_VINCULO_EVIDENCIA, TIPOS_ENTIDADE_EVIDENCIA } from "@/components/pesquisa/vincular-evidencia";

/**
 * Corte F — religar os órfãos RELIGAR (05/10/2026).
 *
 * Proprietária: "Pode seguir com o corte F". O registro
 * (`orfaos-classificados.ts`) nomeava 11 funções a religar, com destino
 * declarado. Medindo o repositório antes de escrever código, **três estavam
 * classificadas erradas por mim** — a lógica já chegava à tela por outro
 * caminho, e religá-las criaria um segundo caminho vivo com guarda mais fraca.
 * Foram reclassificadas, não religadas. As outras 8 eram lacuna real e foram
 * ligadas ao destino.
 *
 * | função | o que não existia na tela |
 * |---|---|
 * | restaurarRegistro | desarquivar: arquivar por engano só se desfazia por SQL |
 * | verificarCondicoesCaso | o único escritor de `condicoes_verificadas_em`, que um gate já lia |
 * | sincronizarContratoBase | a atualização do contrato-base não chegava aos casos abertos |
 * | verificarAtoEmNomeDoCliente | o gate de procuração (Anexos III e IV) não era exercido |
 * | painelContratual | o estado contratual da organização existia e ninguém via |
 * | listarConsentimentos | o registro de consentimentos da organização |
 * | salvarTemplate | criar ou corrigir modelo de mensagem |
 * | vincularEvidencia | dizer o que a evidência prova |
 */

/** Prosa da tela quebra em várias linhas; a frase é a mesma. */
function prosa(caminho: string): string {
  return readFileSync(caminho, "utf8").replace(/\s+/g, " ");
}

const CRUD = readFileSync("src/components/saas/entidade-crud.tsx", "utf8");
const GOVERNANCA = readFileSync("src/components/contrato/governanca-formalizacao.tsx", "utf8");
const PREPARAR = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
const PAINEL_CONTRATUAL = readFileSync("src/components/contratos/painel-estado-contratual.tsx", "utf8");
const CONTRATOS = readFileSync("src/routes/_authenticated/contratos.index.tsx", "utf8");
const CONSENT = readFileSync("src/components/privacidade/registro-consentimentos.tsx", "utf8");
const PRIVACIDADE = readFileSync("src/routes/_authenticated/privacidade.index.tsx", "utf8");
const EDITOR = readFileSync("src/components/mensagens/editor-template.tsx", "utf8");
const MENSAGENS = readFileSync("src/routes/_authenticated/biblioteca-mensagens.tsx", "utf8");
const VINCULO = readFileSync("src/components/pesquisa/vincular-evidencia.tsx", "utf8");
const MODULO = readFileSync("src/components/pesquisa/modulo.tsx", "utf8");

describe("desarquivar é o par de arquivar, no mesmo componente genérico", () => {
  it("restaurarRegistro é chamado, e por onde toda tela de entidade já arquiva", () => {
    expect(CRUD).toContain("restaurarRegistro");
    expect(CRUD).toContain("useServerFn(restaurarRegistro)");
    // Nenhum caminho paralelo por tela: o religamento é no componente único.
    expect(CRUD).toContain("mRestaurar");
  });

  it("exige motivo e aparece nas duas apresentações (tabela e cartões)", () => {
    expect(CRUD).toContain("Motivo da restauração");
    expect(CRUD).toContain("data-restaurar-registro");
    expect((CRUD.match(/setRestaurando\(\{ id: String\(linha\["id"\]\), motivo: "" \}\)/g) ?? []).length).toBe(2);
    expect(CRUD).toMatch(/motivo: restaurando\.motivo\.trim\(\) \|\| "Motivo não informado\."/);
  });

  it("o botão só existe em registro arquivado", () => {
    expect(CRUD).toContain("Restaurar");
    expect(CRUD).toContain('Arquivado — {String(linha["archive_motivo"] ?? "sem motivo")}');
  });
});

describe("os três atos de governança da formalização ganharam tela", () => {
  for (const fn of ["verificarCondicoesCaso", "sincronizarContratoBase", "verificarAtoEmNomeDoCliente"]) {
    it(`${fn} é chamado pela UI`, () => {
      expect(GOVERNANCA).toContain(`useServerFn(${fn})`);
    });
  }

  it("o painel está montado na preparação do contrato, com a data da última conferência", () => {
    expect(PREPARAR).toContain("<GovernancaFormalizacao");
    expect(PREPARAR).toContain("condicoes_verificadas_em");
    expect(GOVERNANCA).toContain("data-conferencia-condicoes");
  });

  it("a conferência é o que satisfaz o gate que ninguém alimentava", () => {
    /*
      `condicoes_verificadas_em` é lido por `gatesAtivacaoFicha` (passo 2,
      "Reconciliar oferta") e o único escritor não tinha chamador: o passo
      ficava eternamente pendente sem ninguém poder resolvê-lo pela tela.
    */
    const gates = readFileSync("src/lib/gates-ativacao-ficha.ts", "utf8");
    expect(gates).toContain('preenchido(caso["condicoes_verificadas_em"])');
    expect(GOVERNANCA).toContain("Reconciliar oferta");
  });

  it("verificar ato NÃO executa o ato, e a tela diz isso", () => {
    expect(GOVERNANCA).toContain("Esta verificação não executa o ato");
    expect(GOVERNANCA).toContain("data-gate-ato-cliente");
    const atos = readFileSync("src/lib/atos-representacao.functions.ts", "utf8");
    expect(atos).toContain("exigirAnexosDeAcaoExterna");
  });

  it("as duas ações que gravam passam por confirmação com capacidade declarada", () => {
    expect((GOVERNANCA.match(/<AcaoOperacional/g) ?? []).length).toBe(2);
    expect(GOVERNANCA).toContain('capacidade="corrigir_os_anexos_previa"');
  });

  it("nada aqui envia, assina, cobra ou publica", () => {
    expect(prosa("src/components/contrato/governanca-formalizacao.tsx")).toContain(
      "Nenhum envio, assinatura ou cobrança",
    );
    for (const proibido of ["enviarParaAssinatura", "emitirCobranca", "publicarNoApp"]) {
      expect(GOVERNANCA, proibido).not.toContain(proibido);
    }
  });
});

describe("o estado contratual da organização passou a ser visível", () => {
  it("painelContratual é chamado e montado em /contratos", () => {
    expect(PAINEL_CONTRATUAL).toContain("useServerFn(painelContratual)");
    expect(CONTRATOS).toContain("<PainelEstadoContratual />");
  });

  it("mostra as seis contagens que o leitor já agregava", () => {
    for (const chave of [
      "p.contratos.length",
      "p.bloqueios.length",
      "p.pendencias.length",
      "p.revisaoPendente.length",
      "p.anexosAusentes.length",
      "p.ordensImpedidas.length",
      "p.excecoesExpiradas.length",
    ]) {
      expect(PAINEL_CONTRATUAL, chave).toContain(chave);
    }
  });

  it("é somente leitura e diz que é", () => {
    expect(prosa("src/components/contratos/painel-estado-contratual.tsx")).toContain(
      "Nenhuma ação externa é executada a partir deste painel.",
    );
    expect(PAINEL_CONTRATUAL).not.toContain("useMutation");
  });

  it("usa EstadoDados — distingue carregando, vazio legítimo e erro", () => {
    expect(PAINEL_CONTRATUAL).toContain("<EstadoDados");
    expect(PAINEL_CONTRATUAL).toContain("aoTentarNovamente");
  });
});

describe("o registro de consentimentos da organização", () => {
  it("listarConsentimentos é chamado, e no índice — não na tela do caso", () => {
    expect(CONSENT).toContain("useServerFn(listarConsentimentos)");
    expect(PRIVACIDADE).toContain("<RegistroConsentimentos");
    /*
      O bloco por caso JÁ existia dentro de `painelPrivacidade`. Montar este no
      caso seria segunda leitura do mesmo dado; o que faltava era a visão da
      organização, que é o que `listarConsentimentos` sem filtro devolve.
    */
    const painelCaso = readFileSync("src/components/privacidade/painel.tsx", "utf8");
    expect(painelCaso).not.toContain("listarConsentimentos");
  });

  it("usa o vocabulário real, sem inventar rótulo", () => {
    expect(CONSENT).toContain("TIPOS_CONSENTIMENTO");
    expect(CONSENT).toContain("METODOS_COLETA");
  });

  it("é leitura: coletar e revogar continuam na tela do caso", () => {
    expect(CONSENT).toContain("Coletar e revogar continuam na tela do caso");
    expect(CONSENT).not.toContain("registrarConsentimento");
    expect(CONSENT).not.toContain("revogarConsentimento");
  });

  it("nomeia cliente e caso sem nenhuma consulta nova", () => {
    expect(PRIVACIDADE).toContain("nomePorCliente");
    expect(PRIVACIDADE).toContain("codigoPorCaso");
    expect(CONSENT).not.toContain("useServerFn(listarClientesECasos)");
  });
});

describe("criar e corrigir modelo na Biblioteca de Mensagens", () => {
  it("salvarTemplate é chamado e o editor está montado", () => {
    expect(EDITOR).toContain("useServerFn(salvarTemplate)");
    expect(MENSAGENS).toContain("<EditorTemplate");
    expect(MENSAGENS).toContain("data-criar-modelo");
  });

  it("aplica a mesma validação de conteúdo que o servidor aplica", () => {
    expect(EDITOR).toContain("validarConteudoTemplate(form.corpo, form.publico)");
    expect(EDITOR).toContain("data-template-problemas");
    // Cliente é conveniência; quem recusa é o servidor.
    expect(EDITOR).toContain("mas quem recusa continua sendo o servidor");
  });

  it("não deixa salvar com problema de conteúdo nem campo obrigatório vazio", () => {
    expect(EDITOR).toContain("faltando.length > 0 || problemas.length > 0");
  });

  it("o modelo nasce em rascunho e a tela diz que nada é disparado", () => {
    expect(EDITOR).toContain("nasce em rascunho");
    expect(prosa("src/components/mensagens/editor-template.tsx")).toContain(
      "Nada é enviado, agendado ou disparado aqui.",
    );
  });

  it("os canais vêm da constante real, não de uma lista nova", () => {
    expect(EDITOR).toContain("CANAIS.map");
    const lib = readFileSync("src/lib/message-library.functions.ts", "utf8");
    expect(lib).toContain('export const CANAIS = ["whatsapp", "email", "portal", "artigo", "newsletter", "social", "interno"]');
  });
});

describe("a evidência passou a dizer o que prova", () => {
  it("vincularEvidencia é chamado e está montado na aba de evidências", () => {
    expect(VINCULO).toContain("useServerFn(vincularEvidencia)");
    expect(MODULO).toContain("<VincularEvidencia");
    expect(VINCULO).toContain("data-vincular-evidencia");
  });

  it("tipo e papel usam só o vocabulário dos CHECKs reais", () => {
    expect(TIPOS_ENTIDADE_EVIDENCIA.map((t) => t.valor)).toEqual(["person", "relationship", "event", "source"]);
    expect(PAPEIS_VINCULO_EVIDENCIA.map((p) => p.valor).sort()).toEqual(
      [
        "contextualizes",
        "contradicts",
        "dates",
        "duplicate_reference",
        "identifies",
        "locates",
        "other",
        "supports",
      ].sort(),
    );
  });

  it("contradizer é um vínculo registrável, não um descarte silencioso", () => {
    expect(PAPEIS_VINCULO_EVIDENCIA.find((p) => p.valor === "contradicts")?.rotulo).toBe("Contradiz");
    expect(VINCULO).toContain("nunca descartada em silêncio");
  });

  it("vincular não valida nem eleva o estado da evidência", () => {
    expect(VINCULO).toContain("Vincular não valida");
    expect(VINCULO).not.toContain("mudarEstadoEvidencia");
    expect(VINCULO).not.toContain("validated");
  });

  it("entidade sem registro no caso diz exatamente isso, em vez de select vazio", () => {
    expect(VINCULO).toContain("Nenhum registro deste tipo no caso ainda");
    expect(VINCULO).toContain("o vínculo não a cria");
  });

  it("as listas vêm do dado que a tela já carregou — nenhum leitor novo", () => {
    expect(MODULO).toContain("opcoesVinculo");
    expect(MODULO).toContain("Nenhuma consulta nova");
  });
});

describe("as três reclassificadas não foram religadas, e o registro diz por quê", () => {
  it("a fila RELIGAR está zerada", () => {
    expect(orfasPor("RELIGAR")).toEqual([]);
  });

  const esperado: Record<string, string> = {
    registrarPerfilInstitucional: "CASCA_DUPLICADA",
    registrarSnapshotInstitucional: "CASCA_DUPLICADA",
    ativarCaso: "APOSENTADA_CLASSIFICADA",
  };
  for (const [fn, veredicto] of Object.entries(esperado)) {
    it(`${fn} ficou como ${veredicto}, nomeando quem faz o trabalho hoje`, () => {
      const o = ORFAS_CLASSIFICADAS.find((x) => x.fn === fn);
      expect(o, fn).toBeTruthy();
      expect(o!.veredicto).toBe(veredicto);
      expect(o!.motivo).toContain("Corte F");
      expect(o!.destino.length).toBeGreaterThan(30);
    });
  }

  it("o caminho vivo de ativação continua um só, o mais forte", () => {
    const onboarding = readFileSync("src/routes/_authenticated/onboarding.$id.tsx", "utf8");
    expect(onboarding).toContain("ativarCasoComChecks");
    // A versão fraca não ganhou tela nenhuma.
    for (const f of [PREPARAR, CONTRATOS, GOVERNANCA]) {
      expect(f).not.toContain("ativarCaso(");
    }
  });

  it("o perfil institucional continua chegando à tela pelo wrapper de sessão", () => {
    expect(PREPARAR).toContain("garantirPerfilInstitucionalDaSessao");
    expect(PREPARAR).not.toContain("registrarPerfilInstitucional");
  });
});
