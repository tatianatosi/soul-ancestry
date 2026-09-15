/**
 * Ficha guiada por lotes do caso-piloto (A Entrada/Caso, B Pesquisa/Árvore,
 * C Proposta/Escopo/Contrato, D Publicação/App).
 *
 * Só leitura e apresentação: cada campo declara de onde veio, em que estado
 * está, quem responde, quando foi atualizado, quem pode ver e a qual
 * identificador canônico se liga. Nada é inferido — informação desconhecida
 * aparece como "ausente", "solicitado", "em revisão", "hipótese" ou
 * "não aplicável". Nenhuma tabela, dado ou publicação é criada aqui.
 */
import { contratoParaFamilia, financeiroParaFamilia } from "@/lib/golive-app";
import type { DadosGoLive } from "@/lib/golive.functions";

export type Caso = Extract<DadosGoLive, { encontrado: true }>;

export type EstadoCampo =
  | "registrado"
  | "ausente"
  | "solicitado"
  | "em revisão"
  | "hipótese"
  | "não aplicável";

export type Visibilidade = "interna" | "cliente" | "sanitizada";

export type CampoFicha = {
  chave: string;
  rotulo: string;
  valor: string | null;
  fonte: string;
  estado: EstadoCampo;
  responsavel: string | null;
  data: string | null;
  visibilidade: Visibilidade;
  vinculo: string | null;
  telaDona: string;
  destinoApp: string | null;
};

export type LoteFicha = {
  chave: "A" | "B" | "C" | "D";
  titulo: string;
  descricao: string;
  campos: CampoFicha[];
};

const vazio = (v: unknown) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

/** Monta um campo aplicando o estado padrão quando não há valor. */
function campo(
  base: Omit<CampoFicha, "estado"> & { estado?: EstadoCampo; ausente?: EstadoCampo },
): CampoFicha {
  const { ausente, estado, ...resto } = base;
  return {
    ...resto,
    estado: vazio(resto.valor) ? (ausente ?? "ausente") : (estado ?? "registrado"),
  };
}

export function resumoLote(lote: LoteFicha) {
  const total = lote.campos.length;
  const registrados = lote.campos.filter((c) => c.estado === "registrado").length;
  const pendentes = total - registrados;
  return { total, registrados, pendentes };
}

export function montarFicha(caso: Caso): LoteFicha[] {
  const id = caso.caso.id;
  const plano = caso.plano;
  const lead = caso.lead;
  const pesquisa = caso.pesquisa;
  const titularId = caso.identidade.pessoaPrincipalId;
  // Instrumento do titular: assinado primeiro, depois vigente; senão o primeiro registrado.
  const contrato = contratoParaFamilia(caso.contratos, titularId) ?? caso.contratos[0] ?? null;
  const financeiro = financeiroParaFamilia(caso.faturas, titularId);
  const proposta = caso.propostas[0] ?? null;
  const ordem = caso.ordensServico[0] ?? null;
  const titular = caso.identidade.pessoaPrincipal;
  const resp = caso.caso.responsavel ?? caso.identidade.responsavel;

  const A: CampoFicha[] = [
    campo({
      chave: "codigo",
      rotulo: "Código canônico do caso",
      valor: caso.caso.codigo,
      fonte: "Caso do CRM",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: null,
    }),
    campo({
      chave: "titular",
      rotulo: "Pessoa principal",
      valor: titular,
      fonte: "Cadastro de cliente",
      responsavel: resp,
      data: null,
      visibilidade: "cliente",
      vinculo: caso.identidade.pessoaPrincipalId,
      telaDona: "/golive/pessoa",
      destinoApp: "Conta",
      estado: caso.identidade.revisarIdentidade ? "em revisão" : undefined,
    }),
    campo({
      chave: "nucleo",
      rotulo: "Núcleo familiar",
      valor: caso.identidade.nucleo,
      fonte: "Núcleo familiar",
      responsavel: resp,
      data: null,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/pessoas",
      destinoApp: "Árvore",
    }),
    campo({
      chave: "participantes",
      rotulo: "Participantes do núcleo",
      valor: caso.identidade.nucleoMembros.length
        ? `${caso.identidade.nucleoMembros.length} pessoa(s) registrada(s)`
        : null,
      fonte: "Membros do núcleo",
      responsavel: resp,
      data: null,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/pessoas",
      destinoApp: "Árvore",
    }),
    campo({
      chave: "dependentes",
      rotulo: "Dependentes declarados",
      valor: caso.dependentes.length ? `${caso.dependentes.length} declarado(s)` : null,
      fonte: "Dependentes do caso",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/pessoas",
      destinoApp: null,
      ausente: "não aplicável",
    }),
    campo({
      chave: "responsavel",
      rotulo: "Responsável interno",
      valor: resp,
      fonte: "Caso do CRM",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: null,
    }),
    campo({
      chave: "fase",
      rotulo: "Etapa da jornada",
      valor: plano?.fase ?? caso.caso.fase,
      fonte: "Planejador do caso",
      responsavel: resp,
      data: null,
      visibilidade: "sanitizada",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: "Home e Jornada",
    }),
    campo({
      chave: "proxima_acao",
      rotulo: "Próxima ação",
      valor: plano?.proximaAcao ?? caso.caso.proximaAcao,
      fonte: "Planejador do caso",
      responsavel: resp,
      data: plano?.prazo ?? caso.caso.prazo,
      visibilidade: "sanitizada",
      vinculo: id,
      telaDona: "/golive/kanban",
      destinoApp: "Home",
    }),
    campo({
      chave: "lead_origem",
      rotulo: "Origem do lead",
      valor: lead?.origem ?? null,
      fonte: "Lead comercial",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: lead?.id ?? null,
      telaDona: "/golive/comercial",
      destinoApp: null,
    }),
    campo({
      chave: "discovery",
      rotulo: "Resultado da Mesa de Discovery",
      valor: lead?.discoveryResultado ?? null,
      fonte: "Lead comercial",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: lead?.id ?? null,
      telaDona: "/golive/comercial",
      destinoApp: null,
      ausente: "solicitado",
    }),
    campo({
      chave: "call",
      rotulo: "Call realizada",
      valor: lead?.callRealizada ?? null,
      fonte: "Lead comercial",
      responsavel: resp,
      data: lead?.callRealizada ?? lead?.callAgendada ?? null,
      visibilidade: "interna",
      vinculo: lead?.id ?? null,
      telaDona: "/golive/comercial",
      destinoApp: null,
      ausente: "solicitado",
    }),
    campo({
      chave: "consentimento",
      rotulo: "Consentimento registrado",
      valor: caso.consentimentos[0]?.status ?? null,
      fonte: "Consentimentos do caso",
      responsavel: resp,
      data: caso.consentimentos[0]?.coletadoEm ?? null,
      visibilidade: "interna",
      vinculo: caso.consentimentos[0]?.id ?? null,
      telaDona: "/golive/configuracoes",
      destinoApp: null,
      ausente: "solicitado",
    }),
  ];

  const evidenciasValidadas = caso.evidencias.filter((e) => Boolean(e.validadaEm));
  const achadosValidados = caso.achados.filter((a) => a.validacao === "validado" || a.publicavel);

  const B: CampoFicha[] = [
    campo({
      chave: "pergunta",
      rotulo: "Pergunta de pesquisa",
      valor: caso.hipoteses[0]?.titulo ?? pesquisa?.objetivo ?? null,
      fonte: "Caso de pesquisa",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: pesquisa?.id ?? null,
      telaDona: "/golive/pesquisa",
      destinoApp: null,
      estado: caso.hipoteses[0] ? "hipótese" : undefined,
    }),
    campo({
      chave: "fontes",
      rotulo: "Fontes consultadas",
      valor: caso.fontes.length ? `${caso.fontes.length} fonte(s)` : null,
      fonte: "Fontes da pesquisa",
      responsavel: resp,
      data: caso.fontes[0]?.registradaEm ?? null,
      visibilidade: "interna",
      vinculo: pesquisa?.id ?? null,
      telaDona: "/golive/pesquisa",
      destinoApp: "Árvore",
    }),
    campo({
      chave: "evidencias",
      rotulo: "Evidências registradas",
      valor: caso.evidencias.length ? `${caso.evidencias.length} evidência(s)` : null,
      fonte: "Evidências da pesquisa",
      responsavel: resp,
      data: caso.evidencias[0]?.registradaEm ?? null,
      visibilidade: "interna",
      vinculo: pesquisa?.id ?? null,
      telaDona: "/golive/pesquisa",
      destinoApp: "Documentos",
      estado: caso.evidencias.length && !evidenciasValidadas.length ? "em revisão" : undefined,
    }),
    campo({
      chave: "evidencias_validadas",
      rotulo: "Evidências validadas",
      valor: evidenciasValidadas.length ? `${evidenciasValidadas.length} validada(s)` : null,
      fonte: "Evidências da pesquisa",
      responsavel: resp,
      data: evidenciasValidadas[0]?.validadaEm ?? null,
      visibilidade: "sanitizada",
      vinculo: pesquisa?.id ?? null,
      telaDona: "/golive/pesquisa",
      destinoApp: "Documentos",
      ausente: "em revisão",
    }),
    campo({
      chave: "achados",
      rotulo: "Achados registrados",
      valor: caso.achados.length ? `${caso.achados.length} achado(s)` : null,
      fonte: "Achados genealógicos",
      responsavel: resp,
      data: caso.achados[0]?.registradoEm ?? null,
      visibilidade: "interna",
      vinculo: pesquisa?.id ?? null,
      telaDona: "/golive/pesquisa",
      destinoApp: "Legado",
      estado: caso.achados.length && !achadosValidados.length ? "hipótese" : undefined,
    }),
    campo({
      chave: "achados_validados",
      rotulo: "Achados validados para a família",
      valor: achadosValidados.length ? `${achadosValidados.length} liberado(s)` : null,
      fonte: "Achados genealógicos",
      responsavel: resp,
      data: achadosValidados[0]?.validadoEm ?? null,
      visibilidade: "sanitizada",
      vinculo: pesquisa?.id ?? null,
      telaDona: "/golive/pesquisa",
      destinoApp: "Legado",
      ausente: "em revisão",
    }),
    campo({
      chave: "arvore",
      rotulo: "Relações declaradas da árvore",
      valor: caso.identidade.nucleoMembros.length
        ? `${caso.identidade.nucleoMembros.length} vínculo(s) declarado(s)`
        : null,
      fonte: "Membros do núcleo",
      responsavel: resp,
      data: null,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/pessoas",
      destinoApp: "Árvore",
    }),
    campo({
      chave: "documentos",
      rotulo: "Documentos do caso",
      valor: caso.documentos.length ? `${caso.documentos.length} documento(s)` : null,
      fonte: "Documentos do caso",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: "Documentos",
    }),
    campo({
      chave: "documentos_liberados",
      rotulo: "Documentos liberados para a cliente",
      valor: caso.documentos.filter((d) => d.liberadoCliente).length
        ? `${caso.documentos.filter((d) => d.liberadoCliente).length} liberado(s)`
        : null,
      fonte: "Documentos do caso",
      responsavel: resp,
      data: null,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: "Documentos",
      ausente: "em revisão",
    }),
  ];

  const C: CampoFicha[] = [
    campo({
      chave: "proposta",
      rotulo: "Proposta registrada",
      valor: proposta ? `Versão ${proposta.versao ?? 1} — ${proposta.status ?? "sem estado"}` : null,
      fonte: "Propostas do caso",
      responsavel: resp,
      data: proposta?.enviadaEm ?? null,
      visibilidade: "interna",
      vinculo: proposta?.id ?? null,
      telaDona: "/golive/formalizacao",
      destinoApp: null,
    }),
    campo({
      chave: "proposta_aprovada",
      rotulo: "Aprovação da proposta",
      valor: proposta?.aprovadaEm ?? null,
      fonte: "Propostas do caso",
      responsavel: resp,
      data: proposta?.aprovadaEm ?? null,
      visibilidade: "interna",
      vinculo: proposta?.id ?? null,
      telaDona: "/golive/formalizacao",
      destinoApp: null,
      ausente: "em revisão",
    }),
    campo({
      chave: "escopo",
      rotulo: "Itens de escopo",
      valor: caso.escopo.length ? `${caso.escopo.length} item(ns)` : null,
      fonte: "Escopo do instrumento",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: contrato?.id ?? proposta?.id ?? null,
      telaDona: "/golive/juridico",
      destinoApp: null,
    }),
    campo({
      chave: "contrato",
      rotulo: "Contrato",
      valor: contrato ? `${contrato.numero ?? contrato.titulo} — ${contrato.status ?? "sem estado"}` : null,
      fonte: "Contratos do caso",
      responsavel: resp,
      data: contrato?.assinadoEm ?? null,
      visibilidade: "cliente",
      vinculo: contrato?.id ?? null,
      telaDona: "/golive/juridico",
      destinoApp: "Conta",
    }),
    campo({
      chave: "assinatura",
      rotulo: "Assinatura do contrato",
      valor: contrato?.assinadoEm ?? null,
      fonte: "Contratos do caso",
      responsavel: resp,
      data: contrato?.assinadoEm ?? null,
      visibilidade: "cliente",
      vinculo: contrato?.id ?? null,
      telaDona: "/golive/juridico",
      destinoApp: "Conta",
      ausente: "em revisão",
    }),
    campo({
      chave: "anexos",
      rotulo: "Anexos do contrato",
      valor: caso.anexos.length ? `${caso.anexos.length} anexo(s)` : null,
      fonte: "Anexos do contrato",
      responsavel: resp,
      data: caso.anexos[0]?.revisadoEm ?? null,
      visibilidade: "interna",
      vinculo: contrato?.id ?? null,
      telaDona: "/golive/juridico",
      destinoApp: null,
    }),
    campo({
      chave: "os",
      rotulo: "Ordem de serviço",
      valor: ordem ? `${ordem.numero ?? "OS"} — ${ordem.status ?? "sem estado"}` : null,
      fonte: "Ordens de serviço",
      responsavel: resp,
      data: ordem?.inicio ?? null,
      visibilidade: "interna",
      vinculo: ordem?.id ?? null,
      telaDona: "/golive/juridico",
      destinoApp: null,
    }),
    campo({
      chave: "faturas",
      rotulo: "Faturas registradas",
      valor: caso.faturas.length ? `${caso.faturas.length} fatura(s)` : null,
      fonte: "Faturas do caso",
      responsavel: resp,
      data: caso.faturas[0]?.vencimento ?? null,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/financeiro",
      destinoApp: "Conta",
    }),
    campo({
      chave: "parcelas",
      rotulo: "Parcelas em aberto",
      valor: financeiro.parcelas.length
        ? `${financeiro.pagas} paga(s) e ${financeiro.emAberto} em aberto`
        : null,
      fonte: "Faturas do caso e do titular",
      responsavel: resp,
      data: financeiro.proximoVencimento,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/financeiro",
      destinoApp: "Conta",
      ausente: "ausente",
    }),
    campo({
      chave: "proximo_vencimento",
      rotulo: "Próximo vencimento",
      valor: financeiro.proximoVencimento,
      fonte: "Faturas do caso e do titular",
      responsavel: resp,
      data: financeiro.proximoVencimento,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/financeiro",
      destinoApp: "Conta",
    }),
    campo({
      chave: "pagamentos",
      rotulo: "Pagamentos confirmados",
      valor: caso.pagamentos.length ? `${caso.pagamentos.length} confirmado(s)` : null,
      fonte: "Pagamentos manuais",
      responsavel: resp,
      data: caso.pagamentos[0]?.pagoEm ?? null,
      visibilidade: "cliente",
      vinculo: id,
      telaDona: "/golive/financeiro",
      destinoApp: "Conta",
    }),
  ];

  const publicados = caso.publicados;
  const rascunhos = caso.projecoesEstados.filter((p) => p.estado === "draft" || p.estado === "rascunho");
  const acesso = caso.portal.acessos[0] ?? null;

  const D: CampoFicha[] = [
    campo({
      chave: "microentregas",
      rotulo: "Microentregas do caso",
      valor: caso.microentregas.length ? `${caso.microentregas.length} registrada(s)` : null,
      fonte: "Microentregas",
      responsavel: caso.microentregas[0]?.responsavel ?? resp,
      data: caso.microentregas[0]?.prazo ?? null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: "Jornada",
    }),
    campo({
      chave: "revisao",
      rotulo: "Revisão humana concluída",
      valor: caso.microentregas.filter((m) => m.status === "concluida" || m.status === "aprovada").length
        ? `${caso.microentregas.filter((m) => m.status === "concluida" || m.status === "aprovada").length} aprovada(s)`
        : null,
      fonte: "Microentregas",
      responsavel: resp,
      data: caso.microentregas[0]?.concluidaEm ?? null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: null,
      ausente: "em revisão",
    }),
    campo({
      chave: "projecao_rascunho",
      rotulo: "Projeções em preparação",
      valor: rascunhos.length ? `${rascunhos.length} em preparação` : null,
      fonte: "Projeções do App",
      responsavel: resp,
      data: null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/portal",
      destinoApp: null,
      ausente: "não aplicável",
    }),
    campo({
      chave: "publicado",
      rotulo: "Conteúdo publicado para a cliente",
      valor: publicados.length ? `${publicados.length} publicado(s)` : null,
      fonte: "Projeções do App",
      responsavel: resp,
      data: publicados[0]?.em ?? null,
      visibilidade: "sanitizada",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: "Home, Jornada e Legado",
    }),
    campo({
      chave: "despublicado",
      rotulo: "Conteúdo retirado do App",
      valor: caso.projecoesDespublicadas.length
        ? `${caso.projecoesDespublicadas.length} retirado(s), histórico preservado`
        : null,
      fonte: "Projeções do App",
      responsavel: resp,
      data: caso.projecoesDespublicadas[0]?.despublicadaEm ?? null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/caso",
      destinoApp: null,
      ausente: "não aplicável",
    }),
    campo({
      chave: "email_autorizado",
      rotulo: "E-mail autorizado da titular",
      valor: caso.portal.emailsAutorizados[0]?.email ?? null,
      fonte: "E-mails autorizados",
      responsavel: resp,
      data: caso.portal.emailsAutorizados[0]?.validadoEm ?? null,
      visibilidade: "interna",
      vinculo: id,
      telaDona: "/golive/portal",
      destinoApp: null,
      ausente: "solicitado",
    }),
    campo({
      chave: "acesso_app",
      rotulo: "Acesso da cliente ao App",
      valor: acesso ? `${acesso.email ?? "sem e-mail"} — ${acesso.situacao || "sem situação"}` : null,
      fonte: "Acessos do portal",
      responsavel: resp,
      data: acesso?.primeiroAcesso ?? acesso?.convidadoEm ?? null,
      visibilidade: "interna",
      vinculo: caso.identidade.pessoaPrincipalId,
      telaDona: "/golive/portal",
      destinoApp: "Conta",
      ausente: "solicitado",
    }),
  ];

  return [
    {
      chave: "A",
      titulo: "A · Entrada e Caso",
      descricao: "Identidade, núcleo, origem comercial e planejamento do caso.",
      campos: A,
    },
    {
      chave: "B",
      titulo: "B · Pesquisa e Árvore",
      descricao: "Pergunta, fonte, evidência, achado e vínculos declarados.",
      campos: B,
    },
    {
      chave: "C",
      titulo: "C · Proposta, Escopo e Contrato",
      descricao: "Proposta, escopo, contrato, anexos, OS e financeiro manual.",
      campos: C,
    },
    {
      chave: "D",
      titulo: "D · Publicação e App",
      descricao: "Revisão humana, projeção sanitizada, publicação e acesso.",
      campos: D,
    },
  ];
}
