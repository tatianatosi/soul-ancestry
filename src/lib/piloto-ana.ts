/**
 * Caso-piloto Ana Luiza — estado interno consolidado, sem ação externa.
 * Nada aqui cria contrato, cobrança, assinatura, pasta, documento ou comunicação.
 */

export const PILOTO_ANA = {
  nome: "Ana Luiza Gomes Silveira Rodrigues",
  pais: "Áustria",
  referencia_juridica_interna: "§ 58c StbG",
  aceite_formal_confirmado_em: "2026-08-14",
  estado_aceite: "formalizacao_em_preparacao" as const,
  estado_operacional: "NO_GO" as const,
  proposta_referencia_valor: 9600,
  proposta_referencia_participantes: 3,
  proposta_observacao:
    "R$ 9.600 e composição familiar de 3 participantes constam apenas como evidência interna de proposta de referência. Não é cobrança, não é preço homologado e não autoriza Asaas.",
  ids_historicos: ["CA-AUT-ANALUIZA-FAM-2026-001", "CA-2026-ANA-001", "CA-CID-AT-2026-002"],
  id_canonico_decidido: "CA-CID-AT-FAM-2026-001" as string | null,
  nome_operacional: "Projeto familiar — Ana Luiza",
  classificacao: "Piloto real",
  decisao_id_canonico:
    "Decisão da Proprietária Administradora em 22/08/2026: identificador canônico já definido na operação. Referência legada resolvida para CA-CID-AT-FAM-2026-001.",
  responsavel: "Tatiana Melani Tosi",
};

export type BloqueioPiloto = { codigo: string; titulo: string; dominio: string; detalhe: string };

export const BLOQUEIOS_PILOTO: BloqueioPiloto[] = [
  { codigo: "cadastro_contratante", titulo: "Cadastro da contratante pendente", dominio: "cadastro", detalhe: "Dados completos da contratante ainda não conferidos na ficha." },
  { codigo: "dados_contratada", titulo: "Dados oficiais da contratada pendentes", dominio: "contratual", detalhe: "Perfil institucional versionado precisa estar ativo e aprovado." },
  { codigo: "contrato_especifico", titulo: "Contrato específico pendente", dominio: "contratual", detalhe: "Sem contrato específico gerado a partir do modelo aprovado." },
  { codigo: "anexo_os", titulo: "Anexo I/OS pendente", dominio: "contratual", detalhe: "Escopo da proposta aprovada ainda não materializado em Anexo I/OS." },
  { codigo: "revisao_juridica", titulo: "Revisão jurídica pendente", dominio: "jurídico", detalhe: "Revisão humana obrigatória antes de qualquer envio." },
  { codigo: "metodo_assinatura", titulo: "Método de assinatura pendente", dominio: "formalização", detalhe: "Método de assinatura não definido nem homologado." },
  { codigo: "reconciliacao_comercial", titulo: "SKU, preço, escopo, parcelamento e vencimento pendentes de reconciliação", dominio: "comercial", detalhe: "Somente fonte homologada define preço e condição." },
  { codigo: "asaas_bloqueado", titulo: "Asaas bloqueado", dominio: "financeiro", detalhe: "Nenhum cliente, cobrança ou link é criado nesta entrega." },
  { codigo: "dossie_pre_onboarding", titulo: "Dossiê pré-onboarding exige validação", dominio: "pesquisa", detalhe: "Dossiê consolidado e checklist §58c existentes precisam de revisão humana." },
  { codigo: "nome_alice", titulo: "Nome completo de Alice pendente", dominio: "cadastro", detalhe: "Registro de Alice segue pendente de dados completos." },
  { codigo: "representacao_felipe", titulo: "Representação legal de Felipe pendente", dominio: "jurídico", detalhe: "Felipe é menor vinculado à Ana; representação legal ainda não registrada." },
];

export type MembroPiloto = {
  nome: string;
  papel: "contratante" | "participante" | "dependente";
  signatario: boolean;
  situacao: string;
  observacao: string;
};

export const NUCLEO_PILOTO: MembroPiloto[] = [
  { nome: "Ana Luiza Gomes Silveira Rodrigues", papel: "contratante", signatario: true, situacao: "cadastro em conferência", observacao: "Contratante e signatária." },
  { nome: "Pai (Adair)", papel: "participante", signatario: true, situacao: "cadastro em conferência", observacao: "Participante adulto signatário." },
  { nome: "Alice", papel: "participante", signatario: true, situacao: "pendente de dados completos", observacao: "Nome completo e documento pendentes." },
  { nome: "Felipe", papel: "dependente", signatario: false, situacao: "menor vinculado à Ana", observacao: "Representação legal pendente; menor não é signatário." },
];

export const FORA_DE_ESCOPO_PILOTO = [
  {
    nome: "Adriel Felipe",
    motivo: "Não integra este caso. Registrado apenas como processo separado, fora do escopo da cidadania familiar.",
  },
];
