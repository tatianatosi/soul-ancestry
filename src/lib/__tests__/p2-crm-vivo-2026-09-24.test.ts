import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import type { LeadDesk } from "@/lib/crm-desk";
import {
  avaliarNovoContato,
  contatoCoincideComPessoa,
  eventosDeCall,
  exigeMotivoDeCall,
  filaCrmVivo,
  rotuloTrilhaLead,
  statusPedeMotivo,
} from "@/lib/crm-vivo";

/**
 * P2 — Reativar CRM Vivo e Painel de Calls (24/09/2026). Sem CRM, kanban,
 * ficha de contato ou aba paralela: /calls (Mesa de Discovery) e /leads
 * leem e gravam a mesma linha de `leads`.
 */

const crm = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
const leadsRota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const handoff = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");
const pessoaFn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
const pessoaRota = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
const contatosUi = readFileSync("src/components/pessoa/contatos-pessoa.tsx", "utf8");
const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");

const HOJE = "2026-09-24T12:00:00.000Z";
const lead = (p: Partial<LeadDesk>): LeadDesk =>
  ({ id: p.id ?? "l1", nome: "Lead Sintético", archived_at: null, case_id: null, ...p }) as LeadDesk;
const fila = (leads: LeadDesk[], chave: string) =>
  filaCrmVivo(leads, HOJE).find((f) => f.chave === chave)!.leads.map((l) => l.id);

describe("mesmo lead em /calls e /leads", () => {
  it("as duas telas usam o mesmo leitor e o mesmo escritor", () => {
    for (const fonte of [painel, leadsRota]) {
      expect(fonte).toMatch(/listarLeadsDesk/);
      expect(fonte).toMatch(/salvarLeadDesk/);
    }
    expect(painel).toContain('queryKey: ["leads-desk"]');
    expect(leadsRota).toContain('queryKey: ["leads-desk"]');
  });
  it("nenhuma tabela, aba ou kanban paralelo novo", () => {
    const novos = ["calls_registros", "crm_vivo", "lead_contacts", "discovery_calls"];
    for (const t of novos) {
      expect(crm).not.toContain(`.from("${t}")`);
      expect(painel).not.toContain(`.from("${t}")`);
    }
    expect(navegacao).not.toMatch(/to:\s*"\/crm-vivo"/);
  });
});

describe("a call reaparece após reload", () => {
  it("salvarLeadDesk grava com releitura e a lista não usa cache", () => {
    const salvar = crm.slice(crm.indexOf("export const salvarLeadDesk"), crm.indexOf("export const trilhaDoLead"));
    expect(salvar).toContain("gravarComVerificacao({");
    const listar = crm.slice(crm.indexOf("export const listarLeadsDesk"), crm.indexOf("export const salvarLeadDesk"));
    expect(listar).toContain("semCache();");
  });
  it("depois de gravar, a Mesa invalida as leituras de lead, Hoje e trilha", () => {
    const i = painel.indexOf('setAviso("Registro gravado no lead canônico com auditoria.")');
    const trecho = painel.slice(i, i + 600);
    for (const k of ['["leads-desk"]', '["painel-desk-hoje"]', '["trilha-lead"]']) expect(trecho).toContain(k);
  });
});

describe("fila CRM Vivo — aparece e some conforme o estado", () => {
  it("tem exatamente as sete filas pedidas", () => {
    expect(filaCrmVivo([], HOJE).map((f) => f.rotulo)).toEqual([
      "Call sem registro",
      "Discovery sem desfecho",
      "Lead sem responsável",
      "Lead sem próxima ação",
      "Qualificação pendente",
      "Aceite verbal sem confirmação formal",
      "Pronto para handoff",
    ]);
  });
  it("call realizada sem registro entra; com registro completo sai de 'Call sem registro'", () => {
    const cru = lead({ status_call: "realizada" } as Partial<LeadDesk>);
    expect(fila([cru], "call_sem_registro")).toContain("l1");
    expect(fila([cru], "discovery_sem_desfecho")).toContain("l1");
    const agendada = lead({ status_call: "agendada", call_agendada_em: "2026-09-30T10:00" } as Partial<LeadDesk>);
    expect(fila([agendada], "call_sem_registro")).not.toContain("l1");
    expect(fila([agendada], "discovery_sem_desfecho")).not.toContain("l1");
  });
  it("responsável e próxima ação datada tiram o lead das filas correspondentes", () => {
    const sem = lead({});
    expect(fila([sem], "lead_sem_responsavel")).toContain("l1");
    expect(fila([sem], "lead_sem_proxima_acao")).toContain("l1");
    const com = lead({
      responsavel_nome: "Equipe",
      proxima_acao: "Retornar com proposta",
      proxima_acao_em: "2026-09-26",
    } as Partial<LeadDesk>);
    expect(fila([com], "lead_sem_responsavel")).not.toContain("l1");
    expect(fila([com], "lead_sem_proxima_acao")).not.toContain("l1");
    const semData = lead({ proxima_acao: "Retornar" } as Partial<LeadDesk>);
    expect(fila([semData], "lead_sem_proxima_acao")).toContain("l1");
  });
  it("aceite verbal entra; ao formalizar sai", () => {
    expect(fila([lead({ eixo_comercial: "aceite_verbal" } as Partial<LeadDesk>)], "aceite_sem_confirmacao")).toContain("l1");
    expect(fila([lead({ eixo_comercial: "contrato_enviado" } as Partial<LeadDesk>)], "aceite_sem_confirmacao")).not.toContain("l1");
  });
  it("lead arquivado, perdido ou já convertido (com caso) sai de todas as filas", () => {
    const base = { eixo_comercial: "aceite_verbal", status_call: "realizada" } as Partial<LeadDesk>;
    const variantes = [
      lead({ ...base, archived_at: "2026-09-20" } as Partial<LeadDesk>),
      lead({ ...base, eixo_comercial: "perdido" } as Partial<LeadDesk>),
      lead({ ...base, case_id: "caso-1" } as Partial<LeadDesk>),
    ];
    for (const v of variantes) {
      expect(filaCrmVivo([v], HOJE).every((f) => f.leads.length === 0)).toBe(true);
    }
  });
  it("a Mesa mostra a fila CRM Vivo derivada do mesmo lead, sem aba nova", () => {
    expect(painel).toContain("filaCrmVivo(visiveis, hoje)");
    expect(painel).toContain("data-fila-crm-vivo");
  });
});

describe("eventos da call e motivo de no-show/cancelamento", () => {
  it("só a mudança vira evento — regravar o mesmo estado não duplica trilha", () => {
    const a = lead({ status_call: "agendada", call_agendada_em: "2026-09-25T10:00" } as Partial<LeadDesk>);
    expect(eventosDeCall(a, a)).toEqual([]);
    expect(eventosDeCall(null, a)).toEqual(["call_agendada"]);
    expect(eventosDeCall(a, { ...a, status_call: "realizada" })).toEqual(["call_realizada"]);
    expect(eventosDeCall(a, { ...a, status_call: "no_show" })).toEqual(["call_no_show"]);
    expect(eventosDeCall(a, { ...a, status_call: "cancelada_lead" })).toEqual(["call_cancelada"]);
    const r = { ...a, status_call: "realizada" };
    expect(eventosDeCall(r, { ...r, discovery_resultado: "seguir" })).toEqual(["discovery_concluida"]);
  });
  it("no-show e cancelamento exigem motivo; o servidor recusa sem ele", () => {
    expect(exigeMotivoDeCall(["call_no_show"])).toBe(true);
    expect(exigeMotivoDeCall(["call_cancelada"])).toBe(true);
    expect(exigeMotivoDeCall(["call_realizada"])).toBe(false);
    expect(statusPedeMotivo("no_show")).toBe(true);
    expect(statusPedeMotivo("cancelada_clube")).toBe(true);
    expect(statusPedeMotivo("realizada")).toBe(false);
    expect(crm).toContain('motivo: "No-show ou cancelamento de call exige o motivo."');
  });
  it("cada evento é gravado na trilha do lead, com o motivo nos metadados", () => {
    expect(crm).toContain("registrarEventosCall(supabase, organizationId, userId, data.id, eventosCall, motivoCall)");
    const f = crm.slice(crm.indexOf("async function registrarEventosCall"));
    expect(f).toContain('entidade: "lead"');
    expect(f).toContain("{ motivo }");
    expect(f).toContain("{ motivo_pendente: true }");
  });
  it("Proprietária: pendência informa, não impede — servidor e tela", () => {
    expect(crm).toContain("exigeMotivoDeCall(eventosCall) && !motivoCall && !livre");
    expect(painel).toContain("!autoridade.proprietaria");
  });
  it("a Mesa mostra o campo de motivo e bloqueia gravar sem ele, sem duplo envio", () => {
    expect(painel).toContain("statusPedeMotivo(campo(\"status_call\"))");
    expect(painel).toContain("motivoCall: motivoCall.trim() || null");
    expect(painel).toContain("disabled={mutar.isPending || !Object.keys(rascunho).length || faltaMotivo}");
    expect(painel).toContain('{mutar.isPending ? "Gravando…" : "Gravar registro da call"}');
  });
});

describe("handoff não perde histórico", () => {
  it("handoff e conversão entram na trilha do lead nos dois ramos (caso novo e caso existente)", () => {
    const chamadas = handoff.match(/await registrarHandoffNaTrilhaDoLead\(/g) ?? [];
    expect(chamadas.length).toBe(2);
    expect(handoff).toContain('acao: "handoff_concluido"');
    expect(handoff).toContain('acao: "lead_convertido"');
  });
  it("o lead não é apagado: só ganha case_id, estágio e eixo", () => {
    expect(handoff).not.toMatch(/\.from\("leads"\)\s*\.delete\(/);
    expect(handoff).toMatch(/case_id: casoId,\s*estagio: "ganho"/);
  });
  it("a trilha lê audit_logs filtrada pela organização e rotula os eventos", () => {
    const t = crm.slice(crm.indexOf("export const trilhaDoLead"));
    expect(t).toContain('.eq("organization_id", organizationId)');
    expect(t).toContain('.eq("entidade", "lead")');
    expect(rotuloTrilhaLead("handoff_concluido")).toBe("Handoff concluído");
    expect(rotuloTrilhaLead("call_no_show")).toBe("No-show");
    expect(painel).toContain("<TrilhaDoLead leadId={lead.id} />");
  });
});

describe("contatos não duplicam pessoa", () => {
  const pessoa = { id: "p1", nome: "Ana", email: "ana@exemplo.com", telefone: "(11) 91234-5678" };
  const outra = { id: "p2", nome: "Bruno", email: "bruno@exemplo.com", telefone: "21 99876-5432" };
  it("contato com e-mail/telefone de outra pessoa canônica é recusado e aponta para ela", () => {
    const r = avaliarNovoContato(
      { nome: "Bruno irmão", email: "BRUNO@exemplo.com " },
      { pessoa, outrasPessoas: [pessoa, outra], contatosExistentes: [] },
    );
    expect(r.ok).toBe(false);
    expect(!r.ok && r.pessoaId).toBe("p2");
  });
  it("contato que é a própria pessoa é recusado", () => {
    const r = avaliarNovoContato(
      { nome: "Ana", telefone: "+55 11 91234-5678" },
      { pessoa, outrasPessoas: [], contatosExistentes: [] },
    );
    expect(r.ok).toBe(false);
  });
  it("contato repetido na mesma pessoa é recusado; contato novo é aceito", () => {
    const existentes = [{ id: "c1", nome: "Carla", telefone: "11 95555-4444" }];
    expect(
      avaliarNovoContato({ nome: "Carla", telefone: "(11) 95555-4444" }, { pessoa, outrasPessoas: [], contatosExistentes: existentes }).ok,
    ).toBe(false);
    expect(
      avaliarNovoContato({ nome: "Dora", email: "dora@exemplo.com" }, { pessoa, outrasPessoas: [outra], contatosExistentes: existentes }).ok,
    ).toBe(true);
    expect(avaliarNovoContato({ nome: "Sem meio" }, { pessoa, outrasPessoas: [], contatosExistentes: [] }).ok).toBe(false);
    expect(contatoCoincideComPessoa({ email: null, telefone: null }, [pessoa])).toBeNull();
  });
  it("o contato é vínculo da pessoa canônica (client_contacts.client_id), gravado com releitura e sem exclusão física", () => {
    const add = pessoaFn.slice(pessoaFn.indexOf("export const adicionarContatoPessoa"));
    expect(add).toContain('tabela: "client_contacts"');
    expect(add).toContain("client_id: pessoa.id");
    expect(add).toContain("inserirComVerificacao({");
    expect(add).toContain("avaliarNovoContato(");
    expect(add).not.toMatch(/\.from\("clientes"\)\s*\.(insert|update)\(/);
    expect(pessoaFn).not.toMatch(/\.from\("client_contacts"\)\s*\.delete\(/);
    expect(pessoaRota).toContain("<ContatosDaPessoa");
    expect(contatosUi).toContain("Abrir a Pessoa 360");
  });
});

describe("isolamento por organização", () => {
  it("toda leitura/escrita nova filtra pela organização do usuário", () => {
    const carregar = pessoaFn.slice(pessoaFn.indexOf('.from("client_contacts")'));
    expect(carregar.slice(0, 300)).toContain('.eq("organization_id", organizationId)');
    const add = pessoaFn.slice(pessoaFn.indexOf("export const adicionarContatoPessoa"));
    expect((add.match(/\.eq\("organization_id", organizationId\)/g) ?? []).length).toBeGreaterThanOrEqual(3);
    const arq = pessoaFn.slice(pessoaFn.indexOf("export const arquivarContatoPessoa"));
    expect(arq).toContain("organizationId,");
    const handoffHelper = handoff.slice(handoff.indexOf("async function registrarHandoffNaTrilhaDoLead"));
    expect(handoffHelper).toContain("organization_id: args.organizationId");
  });
});
