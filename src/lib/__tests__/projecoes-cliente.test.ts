import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  AVISO_PUBLICACAO_CLIENTE,
  contarPublicacoesPorCaso,
  publicacoesParaCliente,
  prateleiraDe,
  rotuloTipoProjecao,
} from "../projecoes-cliente";

const fonteFunctions = readFileSync("src/lib/portal-cliente.functions.ts", "utf8");
const fonteDetalhe = readFileSync("src/components/portal/caso-detalhe.tsx", "utf8");

/**
 * A view `portal_projecoes` já filtra destino/publicação/vigência/arquivamento
 * e o RLS `app_proj_select_portal` restringe ao caso do próprio cliente.
 * Aqui reproduzimos esse contrato para provar que a camada de apresentação
 * só recebe o que a fronteira sanitizada entrega.
 */
function viewPortalProjecoes(brutas: any[], caseId: string) {
  const agora = Date.now();
  return brutas
    .filter(
      (p) =>
        p.destination === "app" &&
        p.approval_status === "published" &&
        p.archived_at == null &&
        p.effective_from != null &&
        Date.parse(p.effective_from) <= agora &&
        (p.effective_to == null || Date.parse(p.effective_to) > agora) &&
        p.case_id === caseId,
    )
    .map((p) => ({
      id: p.id,
      case_id: p.case_id,
      projection_type: p.projection_type,
      content_sanitized: p.content_sanitized,
      effective_from: p.effective_from,
      updated_at: p.updated_at,
    }));
}

const CASO = "caso-ana";
const OUTRO = "caso-outro";
const ontem = new Date(Date.now() - 86_400_000).toISOString();
const anteontem = new Date(Date.now() - 172_800_000).toISOString();
const amanha = new Date(Date.now() + 86_400_000).toISOString();

const base = {
  destination: "app",
  approval_status: "published",
  archived_at: null,
  effective_from: ontem,
  effective_to: null,
  updated_at: ontem,
  autor_id: "staff-1",
  motivo_interno: "gate 4 liberado",
};

const linhas = [
  {
    ...base,
    id: "p1",
    case_id: CASO,
    projection_type: "linha_tempo",
    content_sanitized: "Registro civil localizado.",
  },
  {
    ...base,
    id: "p2",
    case_id: CASO,
    projection_type: "arvore",
    content_sanitized: "Nova geração mapeada.",
    effective_from: anteontem,
  },
  {
    ...base,
    id: "d1",
    case_id: CASO,
    approval_status: "draft",
    content_sanitized: "Rascunho interno.",
  },
  {
    ...base,
    id: "e1",
    case_id: CASO,
    destination: "equipe_interna",
    content_sanitized: "Nota interna.",
  },
  {
    ...base,
    id: "x1",
    case_id: CASO,
    effective_to: anteontem,
    content_sanitized: "Publicação expirada.",
  },
  {
    ...base,
    id: "a1",
    case_id: CASO,
    archived_at: ontem,
    content_sanitized: "Publicação arquivada.",
  },
  {
    ...base,
    id: "f1",
    case_id: CASO,
    effective_from: amanha,
    content_sanitized: "Ainda não vigente.",
  },
  { ...base, id: "o1", case_id: OUTRO, content_sanitized: "Conteúdo de outro cliente." },
];

describe("publicações do Desk no App Cliente", () => {
  it("mantém dossiê familiar em Dossiês mesmo quando menciona registros", () => {
    expect(prateleiraDe({ conteudo: "Dossiê do projeto familiar · registros da família", tipoRotulo: "Entrega de legado" })).toBe("relatorios");
  });
  it("devolve lista vazia quando não há projeções elegíveis", () => {
    expect(publicacoesParaCliente([])).toEqual([]);
    expect(publicacoesParaCliente(viewPortalProjecoes(linhas, "caso-sem-publicacao"))).toEqual([]);
  });

  it("expõe apenas publicações elegíveis do próprio caso, ordenadas", () => {
    const out = publicacoesParaCliente(viewPortalProjecoes(linhas, CASO));
    expect(out.map((p) => p.id)).toEqual(["p1", "p2"]);
  });

  it.each([
    ["draft", "d1"],
    ["destino diferente de app", "e1"],
    ["expirada", "x1"],
    ["arquivada", "a1"],
    ["não vigente", "f1"],
    ["de outro caso", "o1"],
  ])("não expõe projeção %s", (_rotulo, id) => {
    const out = publicacoesParaCliente(viewPortalProjecoes(linhas, CASO));
    expect(out.some((p) => p.id === id)).toBe(false);
  });

  it("não carrega campos internos para a tela", () => {
    const out = publicacoesParaCliente(viewPortalProjecoes(linhas, CASO));
    for (const p of out) {
      expect(Object.keys(p).sort()).toEqual([
        "conteudo",
        "ehPessoa",
        "id",
        "publicadoEm",
        "tipo",
        "tipoRotulo",
      ]);
      expect(JSON.stringify(p)).not.toMatch(
        /motivo_interno|autor|approval_status|destination|archived/i,
      );
    }
  });

  it("sanitiza juízo de mérito no conteúdo publicado", () => {
    const [p] = publicacoesParaCliente([
      {
        id: "s1",
        projection_type: "resumo",
        content_sanitized: "Hipótese forte de reconhecimento.",
      },
    ]);
    expect(p.conteudo).not.toMatch(/hipótese forte/i);
  });

  it("descarta conteúdo vazio e usa rótulos cliente-facing", () => {
    expect(publicacoesParaCliente([{ id: "v1", content_sanitized: "   " }])).toEqual([]);
    expect(rotuloTipoProjecao("linha_tempo")).toBe("Linha do tempo");
    expect(rotuloTipoProjecao("microentrega")).toBe("Da nossa jornada");
    expect(rotuloTipoProjecao(null)).toBe("Atualização da equipe");
  });

  it("mantém o contador disponível para entrega futura", () => {
    const mapa = contarPublicacoesPorCaso(viewPortalProjecoes(linhas, CASO));
    expect(mapa.get(CASO)).toBe(2);
  });
});

describe("contrato de leitura do portal", () => {
  it("meuCaso lê a view sanitizada filtrando pelo case_id do caso autorizado", () => {
    expect(fonteFunctions).toMatch(/from\("portal_projecoes"\)/);
    const trecho = fonteFunctions.slice(fonteFunctions.indexOf('from("portal_projecoes")'));
    expect(trecho.slice(0, 400)).toMatch(/\.eq\("case_id", data\.casoId\)/);
    expect(fonteFunctions).toMatch(/publicacoes: publicacoesParaCliente\(/);
    expect(fonteFunctions).not.toMatch(/from\("app_projections"\)/);
  });

  it("o detalhe do caso exibe o aviso e nenhuma ação de escrita sobre publicações", () => {
    expect(fonteDetalhe).toMatch(/AVISO_PUBLICACAO_CLIENTE/);
    expect(AVISO_PUBLICACAO_CLIENTE).toMatch(/hipóteses em verificação/);
    expect(fonteDetalhe).not.toMatch(/publicarProjecao|arquivarProjecao|aprovarProjecao/);
  });
});
