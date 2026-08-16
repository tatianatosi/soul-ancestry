/**
 * Centro de Integrações — helpers server-only.
 *
 * Princípio: nenhuma integração fala com o mundo externo por padrão. Enquanto
 * o status não for "ativa" (com confirmação de admin no banco), toda execução
 * roda em modo simulado e nada é enviado, cobrado ou alterado fora do sistema.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Sb = any;

export const STATUS_INTEGRACAO: Record<string, string> = {
  desligada: "Desligada",
  teste: "Teste (simulado)",
  ativa: "Ativa",
  com_erro: "Com erro",
  pausada: "Pausada",
};

export const CATEGORIAS_INTEGRACAO: Record<string, string> = {
  crm: "CRM",
  pre_onboarding: "Formulário de pré-onboarding",
  calls: "Painel de calls",
  mensageria: "WhatsApp / Meta",
  financeiro: "Gateway financeiro",
  armazenamento: "Armazenamento de documentos",
  demo: "Demonstração",
};

/** Campos que a integração espera receber, para montar o mapeamento na tela. */
export const CAMPOS_DESTINO: Record<string, { chave: string; rotulo: string; obrigatorio: boolean }[]> = {
  crm_externo: [
    { chave: "nome", rotulo: "Nome do contato", obrigatorio: true },
    { chave: "email", rotulo: "E-mail", obrigatorio: true },
    { chave: "origem", rotulo: "Origem", obrigatorio: true },
    { chave: "estagio", rotulo: "Estágio", obrigatorio: true },
    { chave: "telefone", rotulo: "Telefone", obrigatorio: false },
  ],
  form_pre_onboarding: [
    { chave: "nome", rotulo: "Nome", obrigatorio: true },
    { chave: "email", rotulo: "E-mail", obrigatorio: true },
    { chave: "pais_interesse", rotulo: "País de interesse", obrigatorio: true },
    { chave: "telefone", rotulo: "Telefone", obrigatorio: false },
  ],
  painel_calls: [
    { chave: "cliente", rotulo: "Cliente", obrigatorio: true },
    { chave: "horario", rotulo: "Horário da call", obrigatorio: true },
    { chave: "responsavel", rotulo: "Responsável interno", obrigatorio: true },
  ],
  whatsapp_meta: [
    { chave: "telefone", rotulo: "Telefone destino", obrigatorio: true },
    { chave: "template", rotulo: "Template aprovado", obrigatorio: true },
    { chave: "idioma", rotulo: "Idioma", obrigatorio: true },
  ],
  gateway_financeiro: [
    { chave: "fatura", rotulo: "Identificador da fatura", obrigatorio: true },
    { chave: "valor", rotulo: "Valor", obrigatorio: true },
    { chave: "vencimento", rotulo: "Vencimento", obrigatorio: true },
    { chave: "documento", rotulo: "Documento do pagador", obrigatorio: true },
  ],
  armazenamento_documentos: [
    { chave: "caminho", rotulo: "Caminho do arquivo", obrigatorio: true },
    { chave: "categoria", rotulo: "Categoria", obrigatorio: true },
  ],
  demo_form_lead: [
    { chave: "nome", rotulo: "Nome", obrigatorio: true },
    { chave: "email", rotulo: "E-mail", obrigatorio: true },
    { chave: "pais_interesse", rotulo: "País de interesse", obrigatorio: true },
    { chave: "telefone", rotulo: "Telefone", obrigatorio: false },
  ],
};

/** Payload DEMO por integração: nunca usa dado real de cliente. */
export const PAYLOAD_DEMO: Record<string, Record<string, unknown>> = {
  crm_externo: {
    full_name: "Demo Souza",
    email_address: "demo.souza@exemplo.com",
    phone: "+55 11 98888-1234",
    source: "site",
    stage: "novo",
    api_token: "tok_demo_1234567890",
  },
  form_pre_onboarding: {
    nome_completo: "Demo Souza",
    email: "demo.souza@exemplo.com",
    whatsapp: "+55 11 98888-1234",
    pais: "Itália",
    cpf: "123.456.789-00",
  },
  painel_calls: {
    lead: "Demo Souza",
    scheduled_at: "2026-09-01T14:00:00Z",
    owner: "consultor@exemplo.com",
    meeting_url: "https://meet.exemplo.com/demo",
  },
  whatsapp_meta: {
    to: "+55 11 98888-1234",
    template_name: "atualizacao_caso",
    language: "pt_BR",
    access_token: "EAAG_demo_token_abcdef",
  },
  gateway_financeiro: {
    invoice_ref: "FAT-DEMO-001",
    amount: 1850.0,
    due_date: "2026-09-10",
    payer_document: "123.456.789-00",
    secret_key: "sk_demo_9876543210",
  },
  armazenamento_documentos: {
    path: "demo/caso-001/certidao.pdf",
    category: "certidao",
    bearer: "Bearer demo.jwt.token",
  },
  demo_form_lead: {
    nome_completo: "Demo Souza",
    email: "demo.souza@exemplo.com",
    whatsapp: "+55 11 98888-1234",
    pais: "Itália",
  },
};

const CHAVES_SENSIVEIS = /(token|secret|senha|password|key|authorization|bearer|cpf|documento|document)/i;

function mascararTexto(valor: string): string {
  let t = valor;
  // e-mail
  t = t.replace(/([\w.+-])[\w.+-]*@([\w-]+)\.([\w.]+)/g, (_m, a, d, tld) => `${a}***@${d[0]}***.${tld}`);
  // telefone (7+ dígitos, com separadores)
  t = t.replace(/(\+?\d[\d\s().-]{6,}\d)/g, (m) => {
    const dig = m.replace(/\D/g, "");
    return `***${dig.slice(-4)}`;
  });
  // CPF / CNPJ
  t = t.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "***.***.***-**");
  t = t.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, "**.***.***/****-**");
  return t;
}

/** Máscara aplicada a TODO payload antes de virar log. Nunca guardamos cru. */
export function mascararPayload(valor: unknown, chave = ""): any {
  if (valor === null || valor === undefined) return valor;
  if (Array.isArray(valor)) return valor.map((v) => mascararPayload(v));
  if (typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      saida[k] = mascararPayload(v, k);
    }
    return saida;
  }
  if (typeof valor !== "string") {
    return CHAVES_SENSIVEIS.test(chave) ? "••••" : valor;
  }
  if (CHAVES_SENSIVEIS.test(chave)) {
    return valor.length <= 4 ? "••••" : `••••${valor.slice(-4)}`;
  }
  return mascararTexto(valor);
}

/** Campos obrigatórios sem origem mapeada bloqueiam qualquer sincronização. */
export function camposFaltantes(
  campos: string[],
  fieldMap: Record<string, unknown>,
  payload: Record<string, unknown>,
) {
  const semMapa: string[] = [];
  const semValor: string[] = [];
  for (const campo of campos) {
    const origem = typeof fieldMap[campo] === "string" ? (fieldMap[campo] as string).trim() : "";
    if (!origem) {
      semMapa.push(campo);
      continue;
    }
    const valor = payload[origem];
    if (valor === undefined || valor === null || String(valor).trim() === "") semValor.push(campo);
  }
  return { semMapa, semValor };
}

/** Traduz o payload de origem para o formato interno usando o mapeamento. */
export function aplicarMapa(fieldMap: Record<string, unknown>, payload: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const [destino, origem] of Object.entries(fieldMap)) {
    if (typeof origem !== "string" || !origem.trim()) continue;
    saida[destino] = payload[origem.trim()];
  }
  return saida;
}

export const PAPEIS_CONFIG = ["admin", "operacoes"];

/** Simulador: não há chamada externa, apenas resposta plausível para conferência. */
export function simularResposta(chave: string, corpo: Record<string, unknown>) {
  const eco = { recebido: corpo, simulado: true as const };
  switch (chave) {
    case "whatsapp_meta":
      return { ...eco, status: "nao_enviado", motivo: "Modo simulado: nenhuma mensagem saiu do sistema." };
    case "gateway_financeiro":
      return { ...eco, status: "nao_cobrado", motivo: "Modo simulado: nenhuma cobrança foi criada." };
    case "crm_externo":
    case "painel_calls":
    case "armazenamento_documentos":
      return { ...eco, status: "nao_sincronizado", motivo: "Modo simulado: nenhum registro externo foi alterado." };
    default:
      return { ...eco, status: "ok_simulado", motivo: "Execução local, sem chamada externa." };
  }
}
