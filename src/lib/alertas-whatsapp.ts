/**
 * Sistema de alertas via WhatsApp para eventos críticos.
 *
 * Usado para notificar cliente e equipe quando há:
 * - Nova descoberta (achado) relacionada ao ancestral pesquisado
 * - Validação jurídica completada
 * - Próximo passo no processo
 *
 * Por enquanto gera templates; a integração de envio será via API externa.
 */

export type CampoAchado = "país" | "geração" | "linha" | "documentos" | "outro";

export interface AchadoParaAlerta {
  id: string;
  case_id: string;
  ancestor_name: string;
  discovery_type: CampoAchado;
  description: string;
  evidence: string;
  recorded_at: string;
}

export interface ClienteContato {
  nome: string;
  whatsapp: string;
  email?: string;
}

/**
 * Gera template de WhatsApp para notificar cliente sobre achado.
 * Simples, direto, sem spoilers (evita revelar descobertas complexas).
 */
export function gerarAlertaAchado(achado: AchadoParaAlerta, cliente: ClienteContato): {
  template: string;
  destinatario: string;
  tipo: "cliente" | "equipe";
} {
  const rotulo = {
    país: "novo país",
    geração: "nova geração",
    linha: "nova linha de descendência",
    documentos: "novo documento",
    outro: "nova informação",
  }[achado.discovery_type];

  return {
    template: `Olá ${cliente.nome}! 🎉

Encontramos um ${rotulo} sobre ${achado.ancestor_name}.

Detalhes:
${achado.description}

Prova:
${achado.evidence}

A equipe está revisando. Você acompanha tudo em seu painel.`,
    destinatario: cliente.whatsapp,
    tipo: "cliente",
  };
}

/**
 * Gera template para notificar equipe sobre achado (mais detalhadão).
 */
export function gerarAlertaEquipe(
  achado: AchadoParaAlerta,
  cliente: ClienteContato,
  responsavel?: string,
): {
  template: string;
  destinatario?: string;
  tipo: "equipe";
} {
  return {
    template: `Nova descoberta registrada

📋 Caso: ${achado.case_id}
👤 Ancestral: ${achado.ancestor_name}
🔍 Tipo: ${achado.discovery_type}
📝 Descrição: ${achado.description}
🔗 Evidência: ${achado.evidence}
⏰ Quando: ${new Date(achado.recorded_at).toLocaleString("pt-BR")}

Cliente: ${cliente.nome} (${cliente.email || "sem email"})
Responsável: ${responsavel || "não atribuído"}

⚠️ Requer validação jurídica antes de enviar ao cliente.`,
    tipo: "equipe",
  };
}

/**
 * Retorna um checklist do que precisa estar preenchido
 * antes de enviar alerta ao cliente.
 */
export const VALIDACAO_PRE_ENVIO = [
  "✓ Achado descrito com precisão (não genérico)",
  "✓ Evidência documentada (fonte, data, referência)",
  "✓ Revisão jurídica aprovada (se necessário)",
  "✓ Número de WhatsApp do cliente confirmado",
  "✓ Cliente não marcado como 'não contactar'",
] as const;
