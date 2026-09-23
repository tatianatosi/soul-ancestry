/**
 * Checklist operacional real de pré-contrato (item 5, autorização explícita
 * da Proprietária, 2026-09-23). Reúne o estado REAL de 7 frentes que
 * precisam estar resolvidas antes de gerar/assinar/cobrar um contrato —
 * cada item com fonte, estado, responsável humano e próxima ação. Nenhum
 * item é marcado concluído sem evidência real: sem dado, o item fica
 * "pendente" e diz o que falta, nunca "concluído" por omissão.
 *
 * Não emite contrato, cobrança ou assinatura — só lê e classifica o que já
 * está gravado (case_plans, case_members, contract_case_parameters,
 * contracts, invoices).
 */

import { PRODUTOS_PAI_CANONICOS } from "@/lib/planejador-produtos-pai";

export type EstadoChecklistItem = "concluido" | "pendente" | "bloqueado";

export type ItemChecklistPreContrato = {
  chave: string;
  rotulo: string;
  fonte: string;
  estado: EstadoChecklistItem;
  estadoTexto: string;
  responsavel: string;
  proximaAcao: string | null;
};

type MembroChecklist = {
  nome: string;
  representacao_necessaria?: boolean | null;
  representacao_documentada?: boolean | null;
};

type FaturaChecklist = {
  status: string | null;
  valor_pago: number | null;
  paga_em: string | null;
};

export type EntradaChecklistPreContrato = {
  produtoPaiId: string | null;
  membros: readonly MembroChecklist[];
  bloqueios: readonly { chave: string; motivo: string }[];
  registroStatus: string | null;
  contrato: { status: string | null; signed_at: string | null } | null;
  faturas: readonly FaturaChecklist[];
  nomeDependenteRepresentacao?: string;
};

function rotuloProdutoPai(id: string | null): string {
  if (!id) return "—";
  return PRODUTOS_PAI_CANONICOS.find((p) => p.id === id)?.nome ?? id;
}

export function checklistPreContrato(
  entrada: EntradaChecklistPreContrato,
): ItemChecklistPreContrato[] {
  const dependenteAlvo = entrada.nomeDependenteRepresentacao ?? "Felipe";
  const membroRepresentacao = entrada.membros.find((m) =>
    m.nome.toLowerCase().includes(dependenteAlvo.toLowerCase()),
  );

  const itens: ItemChecklistPreContrato[] = [];

  // 1. Produto-pai / vínculo comercial
  itens.push(
    entrada.produtoPaiId
      ? {
          chave: "produto_pai",
          rotulo: "Produto-pai / vínculo comercial",
          fonte: "case_plans.produto_pai_id",
          estado: "concluido",
          estadoTexto: `Definido: ${rotuloProdutoPai(entrada.produtoPaiId)}`,
          responsavel: "Comercial",
          proximaAcao: null,
        }
      : {
          chave: "produto_pai",
          rotulo: "Produto-pai / vínculo comercial",
          fonte: "case_plans.produto_pai_id",
          estado: "pendente",
          estadoTexto: "Sem produto-pai definido no Planejador.",
          responsavel: "Comercial / Proprietária",
          proximaAcao: "Definir o produto-pai do caso no Planejador (Caso 360).",
        },
  );

  // 2. Partes / dados pendentes — deriva do gate já calculado (signatario/campo_obrigatorio/revisao_campo)
  const bloqueiosPartes = entrada.bloqueios.filter((b) =>
    ["signatario", "campo_obrigatorio", "revisao_campo"].includes(b.chave),
  );
  itens.push(
    bloqueiosPartes.length === 0
      ? {
          chave: "partes_dados",
          rotulo: "Partes e dados",
          fonte: "contract_case_parameters (grupo partes) + case_members",
          estado: "concluido",
          estadoTexto: "Partes e dados obrigatórios completos e validados.",
          responsavel: "Atendimento",
          proximaAcao: null,
        }
      : {
          chave: "partes_dados",
          rotulo: "Partes e dados",
          fonte: "contract_case_parameters (grupo partes) + case_members",
          estado: "pendente",
          estadoTexto: bloqueiosPartes.map((b) => b.motivo).join(" "),
          responsavel: "Atendimento",
          proximaAcao: "Completar e validar os campos obrigatórios de partes pendentes.",
        },
  );

  // 3. Representação legal do dependente (Felipe)
  if (membroRepresentacao) {
    const necessaria = membroRepresentacao.representacao_necessaria;
    const documentada = membroRepresentacao.representacao_documentada;
    let estado: EstadoChecklistItem;
    let estadoTexto: string;
    let proximaAcao: string | null;
    if (necessaria === true && documentada === true) {
      estado = "concluido";
      estadoTexto = `Representação legal de ${membroRepresentacao.nome} documentada.`;
      proximaAcao = null;
    } else if (necessaria === true && documentada !== true) {
      estado = "bloqueado";
      estadoTexto = `Representação legal de ${membroRepresentacao.nome} exigida e ainda não documentada.`;
      proximaAcao = `Coletar e registrar documento de representação legal de ${membroRepresentacao.nome}.`;
    } else if (necessaria === null || necessaria === undefined) {
      estado = "pendente";
      estadoTexto = `Necessidade de representação legal de ${membroRepresentacao.nome} ainda não avaliada.`;
      proximaAcao = `Avaliar e registrar se ${membroRepresentacao.nome} exige representação legal formal.`;
    } else {
      estado = "concluido";
      estadoTexto = `Representação legal não exigida para ${membroRepresentacao.nome}.`;
      proximaAcao = null;
    }
    itens.push({
      chave: "representacao_dependente",
      rotulo: `Representação legal — ${membroRepresentacao.nome}`,
      fonte: "case_members.representacao_necessaria / representacao_documentada",
      estado,
      estadoTexto,
      responsavel: "Jurídico",
      proximaAcao,
    });
  } else {
    itens.push({
      chave: "representacao_dependente",
      rotulo: `Representação legal — ${dependenteAlvo}`,
      fonte: "case_members",
      estado: "pendente",
      estadoTexto: `${dependenteAlvo} não encontrado entre as partes do caso.`,
      responsavel: "Atendimento",
      proximaAcao: `Confirmar o vínculo de ${dependenteAlvo} ao caso.`,
    });
  }

  // 4. Contrato a preparar — deriva do gate completo já calculado pela tela
  const bloqueiosContrato = entrada.bloqueios.filter(
    (b) => !["signatario", "campo_obrigatorio", "revisao_campo"].includes(b.chave),
  );
  itens.push(
    bloqueiosContrato.length === 0
      ? {
          chave: "contrato_preparar",
          rotulo: "Contrato a preparar",
          fonte: "contract_case_parameters (bloqueios de geração)",
          estado: "concluido",
          estadoTexto: "Sem bloqueios restantes para gerar a versão final.",
          responsavel: "Jurídico",
          proximaAcao: null,
        }
      : {
          chave: "contrato_preparar",
          rotulo: "Contrato a preparar",
          fonte: "contract_case_parameters (bloqueios de geração)",
          estado: "bloqueado",
          estadoTexto: `${bloqueiosContrato.length} bloqueio(s): ${bloqueiosContrato.map((b) => b.motivo).join(" ")}`,
          responsavel: "Jurídico",
          proximaAcao: "Resolver os bloqueios listados antes de gerar a versão final do contrato.",
        },
  );

  // 5. Assinatura
  itens.push(
    entrada.contrato?.signed_at
      ? {
          chave: "assinatura",
          rotulo: "Assinatura",
          fonte: "contracts.signed_at",
          estado: "concluido",
          estadoTexto: `Assinado em ${entrada.contrato.signed_at}.`,
          responsavel: "Cliente / Jurídico",
          proximaAcao: null,
        }
      : {
          chave: "assinatura",
          rotulo: "Assinatura",
          fonte: "contracts.signed_at",
          estado: "pendente",
          estadoTexto: entrada.contrato ? `Contrato registrado, ainda não assinado (status: ${entrada.contrato.status ?? "—"}).` : "Nenhum contrato registrado ainda.",
          responsavel: "Cliente / Jurídico",
          proximaAcao: "Enviar para assinatura assim que a versão final for aprovada.",
        },
  );

  // 6. Cobrança
  itens.push(
    entrada.faturas.length > 0
      ? {
          chave: "cobranca",
          rotulo: "Cobrança",
          fonte: "invoices",
          estado: "concluido",
          estadoTexto: `${entrada.faturas.length} fatura(s) registrada(s).`,
          responsavel: "Financeiro",
          proximaAcao: null,
        }
      : {
          chave: "cobranca",
          rotulo: "Cobrança",
          fonte: "invoices",
          estado: "pendente",
          estadoTexto: "Nenhuma fatura registrada para este caso.",
          responsavel: "Financeiro",
          proximaAcao: "Emitir a cobrança inicial após assinatura do contrato.",
        },
  );

  // 7. Pagamento inicial
  const primeiraPaga = entrada.faturas.find((f) => f.paga_em || f.status === "paga");
  itens.push(
    primeiraPaga
      ? {
          chave: "pagamento_inicial",
          rotulo: "Pagamento inicial",
          fonte: "invoices.status / paga_em / valor_pago",
          estado: "concluido",
          estadoTexto: `Primeira parcela confirmada${primeiraPaga.paga_em ? ` em ${primeiraPaga.paga_em}` : ""}.`,
          responsavel: "Financeiro",
          proximaAcao: null,
        }
      : {
          chave: "pagamento_inicial",
          rotulo: "Pagamento inicial",
          fonte: "invoices.status / paga_em / valor_pago",
          estado: "pendente",
          estadoTexto: entrada.faturas.length > 0 ? "Fatura(s) registrada(s), nenhuma confirmada como paga." : "Sem cobrança emitida ainda.",
          responsavel: "Financeiro",
          proximaAcao: "Confirmar o pagamento da primeira parcela assim que compensado.",
        },
  );

  return itens;
}
