import type { CaseData } from "@/types/case";
import { limparCopy, limparLista } from "@/lib/client-copy";
import { preenchido, proximaEtapaCliente, rotaLabel } from "@/lib/evidence";

/**
 * Radar da Jornada — quatro eixos cliente-facing.
 *
 * Regras:
 * - nunca expor IDs internos, SKUs, valores, URLs de fonte ou árvore bruta;
 * - nunca prometer elegibilidade, cidadania, êxito jurídico, prazo ou rota certa;
 * - quando faltar dado, o detalhe é ocultado e fica só a mensagem institucional.
 */

export type EstadoEixo = "identificado" | "em_confirmacao" | "proxima_etapa";

export type ItemEixo = { rotulo: string; valor: string };

export type EixoRadar = {
  id: "historia" | "documentos" | "estrategia" | "proximos";
  titulo: string;
  resumo: string;
  estado: EstadoEixo;
  itens: ItemEixo[];
  /** Exibido quando não há itens suficientes para detalhar o eixo. */
  mensagemVazio: string;
};

export const ESTADO_EIXO_LABEL: Record<EstadoEixo, string> = {
  identificado: "Identificado",
  em_confirmacao: "Em confirmação",
  proxima_etapa: "Próxima etapa",
};

export const ESTADO_EIXO_TOM: Record<EstadoEixo, string> = {
  identificado: "border-sage/40 bg-sage/10 text-sage",
  em_confirmacao: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  proxima_etapa: "border-gold/50 bg-gold/15 text-navy",
};

function item(rotulo: string, valor: unknown): ItemEixo | null {
  const v = limparCopy(valor);
  return v.length > 0 ? { rotulo, valor: v } : null;
}

function itens(...vals: (ItemEixo | null)[]): ItemEixo[] {
  return vals.filter((i): i is ItemEixo => i !== null);
}

function contagem(n: unknown): string {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? String(n) : "";
}

/** Ordem canônica dos eixos. Nenhuma superfície pode acrescentar ou reordenar. */
export const EIXOS_RADAR_IDS = ["historia", "documentos", "estrategia", "proximos"] as const;

/**
 * Guarda de superfície: devolve exatamente os eixos canônicos, na ordem
 * canônica, descartando qualquer eixo extra ou duplicado que alguma tela
 * (Cliente ou Ops) tenha tentado injetar.
 */
export function garantirEixosCanonicos<T extends { id: EixoRadar["id"] }>(lista: readonly T[]): T[] {
  return EIXOS_RADAR_IDS.map((id) => lista.find((e) => e.id === id)).filter((e): e is T => e !== undefined);
}

export function eixosRadar(caso: CaseData): EixoRadar[] {
  const doc = caso.documentos;
  const localizados = limparLista(doc.documentos_localizados ?? []);
  const pendentes = limparLista(doc.documentos_pendentes ?? []);
  const emValidacao = limparLista(doc.documentos_em_validacao ?? []);
  const solicitacoes = limparLista(doc.proximas_solicitacoes ?? []);

  return EIXOS_RADAR_CANONICOS.map((canon): EixoRadar => {
    if (canon.id === "historia") {
      return {
        ...canon,
        estado: preenchido(limparCopy(caso.arvore.conexao_chave))
          ? "identificado"
          : "em_confirmacao",
        itens: itens(
          item("Linha investigada", caso.arvore.linha_prioritaria),
          item("Pessoas reconhecidas", contagem(caso.arvore.pessoas_conectadas)),
          item("Gerações lidas", contagem(caso.arvore.geracoes_lidas)),
          item("Contexto familiar", caso.arvore.conexao_chave),
          item("Território de origem", caso.arvore.conexao_territorial),
        ),
        mensagemVazio:
          "Estamos organizando as informações da sua família. Assim que houver leitura consolidada, ela aparece aqui.",
      };
    }

    if (canon.id === "documentos") {
      return {
        ...canon,
        estado:
          pendentes.length > 0 || emValidacao.length > 0
            ? "em_confirmacao"
            : localizados.length > 0
              ? "identificado"
              : "proxima_etapa",
        itens: itens(
          item("Disponíveis", contagem(localizados.length)),
          item("Em validação", contagem(emValidacao.length)),
          item("Pendentes", contagem(pendentes.length)),
          item("A solicitar", contagem(solicitacoes.length)),
          item("Foco documental", doc.documento_principal),
        ),
        mensagemVazio:
          "A organização documental do seu caso está em preparação. Vamos avisar assim que houver novidades.",
      };
    }

    if (canon.id === "estrategia") {
      const estrategiaItens = itens(
        item("Leitura em análise", rotaLabel(caso)),
        item("Hipótese em análise", caso.rota.hipotese_principal),
        item("Precisa confirmar", caso.arvore.lacuna_critica),
        item("Ponto de atenção", caso.alerta.ativo ? caso.alerta.texto : ""),
      );
      return {
        ...canon,
        estado: "em_confirmacao",
        itens: estrategiaItens,
        mensagemVazio:
          "As hipóteses do seu caso ainda estão em análise. Elas serão apresentadas quando houver base documental.",
      };
    }

    /* canon.id === "proximos" */
    return {
      ...canon,
      estado: "proxima_etapa",
      itens: itens(
        item("Etapa atual", caso.jornada.etapa_atual),
        item("Entrega em andamento", caso.conta.status_jornada),
        item("Pendência prioritária", doc.pendencia_principal),
        item("Próximo passo", proximaEtapaCliente(caso)),
      ),
      mensagemVazio:
        "Estamos definindo o próximo passo do seu caso. Você será avisada assim que ele estiver pronto.",
    };
  });
}

/**
 * Rótulos canônicos dos quatro eixos, para superfícies do cliente e do Desk
 * que ainda não possuem `CaseData` vivo. Nenhum eixo novo pode ser criado.
 */
export const EIXOS_RADAR_CANONICOS: readonly { id: EixoRadar["id"]; titulo: string; resumo: string }[] =
  Object.freeze([
    { id: "historia", titulo: "História familiar", resumo: "O que já conseguimos reconhecer sobre as pessoas e gerações da sua família." },
    { id: "documentos", titulo: "Documentos e evidências", resumo: "Como está a organização dos registros que sustentam a sua história." },
    { id: "estrategia", titulo: "Estratégia e possibilidades", resumo: "Caminhos em análise. Nada aqui é conclusão: cada hipótese depende de evidências documentais." },
    { id: "proximos", titulo: "Próximos passos e progresso", resumo: "Onde estamos agora e o que vem em seguida na sua jornada." },
  ] as const);
