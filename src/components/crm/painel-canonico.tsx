import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Secao } from "@/components/caso/campos";
import { FormConversa } from "@/components/crm/form-conversa";
import { RegistrarEventoFunil } from "@/components/crm/registrar-evento-funil";
import { ROTULO_CONVERSA, ROTULO_EVENTO, type EventoFunil, type TipoConversa } from "@/lib/desk-canonico";
import {
  listarContatosCanonicos,
  listarConversasCanonicas,
  listarEventosFunil,
  listarOportunidadesCanonicas,
} from "@/lib/desk-canonico.functions";

type Contato = { id: string; nome: string; email?: string | null; telefone?: string | null; origem?: string | null; status?: string | null; responsavel_user_id?: string | null };
type Oportunidade = {
  id: string;
  contact_id?: string | null;
  case_id?: string | null;
  objetivo_declarado?: string | null;
  etapa_comercial?: string | null;
  responsavel_user_id?: string | null;
  responsavel_nome?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
};

const dataCurta = (v?: string | null) => (v ? String(v).slice(0, 10) : "—");

/**
 * Corte vertical canônico: contatos, oportunidades, conversas e eventos de funil
 * dentro do CRM Vivo existente. Nenhuma aba principal nova.
 */
export function PainelCanonicoCrm({ podeEscrever }: { podeEscrever: boolean }) {
  const carregarContatos = useServerFn(listarContatosCanonicos);
  const carregarOportunidades = useServerFn(listarOportunidadesCanonicas);
  const carregarConversas = useServerFn(listarConversasCanonicas);
  const carregarEventos = useServerFn(listarEventosFunil);

  const [contactId, setContactId] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);

  const qContatos = useQuery({ queryKey: ["contatos-canonicos"], queryFn: () => carregarContatos(), retry: false });
  const qOportunidades = useQuery({ queryKey: ["oportunidades-canonicas"], queryFn: () => carregarOportunidades(), retry: false });
  const qConversas = useQuery({
    queryKey: ["conversas-canonicas", contactId, opportunityId],
    queryFn: () => carregarConversas({ data: { contactId, opportunityId } }),
    retry: false,
  });
  const qEventos = useQuery({
    queryKey: ["eventos-funil", contactId, opportunityId],
    queryFn: () => carregarEventos({ data: { contactId, opportunityId } }),
    retry: false,
  });

  const contatos = (qContatos.data ?? []) as Contato[];
  const oportunidades = (qOportunidades.data ?? []) as Oportunidade[];

  const semGovernanca = useMemo(
    () =>
      oportunidades.filter(
        (o) =>
          (!o.responsavel_user_id && !String(o.responsavel_nome ?? "").trim()) ||
          !String(o.proxima_acao ?? "").trim() ||
          !o.prazo_proxima_acao,
      ),
    [oportunidades],
  );

  const vinculo = { contactId, opportunityId, caseId: null };

  return (
    <div className="grid gap-4">
      <Secao
        titulo="Fonte canônica"
        descricao="Contatos, conversas, oportunidades e eventos vivem no Desk Intelligence. Planilhas são legado somente leitura; Placego entra apenas por importação de contatos em CSV."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Contatos</p>
            <p className="font-serif text-2xl text-navy">{contatos.length}</p>
          </div>
          <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Oportunidades ativas</p>
            <p className="font-serif text-2xl text-navy">{oportunidades.length}</p>
          </div>
          <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Sem responsável, ação ou prazo</p>
            <p className={`font-serif text-2xl ${semGovernanca.length ? "text-terracotta" : "text-navy"}`}>{semGovernanca.length}</p>
          </div>
        </div>
      </Secao>

      <div className="grid gap-4 lg:grid-cols-2">
        <Secao titulo={`Contatos (${contatos.length})`} descricao="Contato não significa cliente ativo.">
          <ul className="max-h-[320px] space-y-2 overflow-auto">
            {contatos.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setContactId(c.id === contactId ? null : c.id);
                    setOpportunityId(null);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    contactId === c.id ? "border-gold bg-cream/60" : "border-navy/10 bg-white"
                  }`}
                >
                  <span className="block font-medium text-navy">{c.nome}</span>
                  <span className="block text-[11px] text-navy/55">
                    {c.origem ?? "origem não informada"} · {c.status ?? "sem status"}
                  </span>
                </button>
              </li>
            ))}
            {!contatos.length ? <li className="text-sm text-navy/50">Nenhum contato registrado.</li> : null}
          </ul>
        </Secao>

        <Secao titulo={`Oportunidades (${oportunidades.length})`} descricao="Toda oportunidade ativa exige responsável, próxima ação e prazo.">
          <ul className="max-h-[320px] space-y-2 overflow-auto">
            {oportunidades.map((o) => {
              const falta =
                (!o.responsavel_user_id && !String(o.responsavel_nome ?? "").trim()) ||
                !String(o.proxima_acao ?? "").trim() ||
                !o.prazo_proxima_acao;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpportunityId(o.id === opportunityId ? null : o.id);
                      setContactId(o.contact_id ?? null);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      opportunityId === o.id ? "border-gold bg-cream/60" : "border-navy/10 bg-white"
                    }`}
                  >
                    <span className="block font-medium text-navy">{o.objetivo_declarado ?? "Objetivo não declarado"}</span>
                    <span className="block text-[11px] text-navy/55">
                      {o.etapa_comercial ?? "—"} · {o.responsavel_nome ?? "sem responsável"} · prazo {dataCurta(o.prazo_proxima_acao)}
                    </span>
                    {falta ? <span className="mt-1 block text-[11px] text-terracotta">Falta responsável, próxima ação ou prazo.</span> : null}
                  </button>
                </li>
              );
            })}
            {!oportunidades.length ? <li className="text-sm text-navy/50">Nenhuma oportunidade ativa.</li> : null}
          </ul>
        </Secao>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormConversa vinculo={vinculo} podeEscrever={podeEscrever} />
        <RegistrarEventoFunil vinculo={vinculo} podeEscrever={podeEscrever} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Secao titulo="Conversas registradas" descricao="Registro imutável. Correção cria novo registro que referencia o anterior.">
          <ul className="max-h-[280px] space-y-2 overflow-auto text-sm">
            {((qConversas.data ?? []) as any[]).map((c) => (
              <li key={c.id} className="rounded-lg border border-navy/10 bg-white px-3 py-2">
                <span className="block text-[11px] uppercase tracking-wide text-navy/50">
                  {ROTULO_CONVERSA[(c.canal ?? "nota_interna") as TipoConversa] ?? c.tipo} · {dataCurta(c.ocorrido_em)}
                </span>
                <span className="block text-navy">{c.resumo_interno}</span>
                <span className="block text-[11px] text-navy/55">
                  Próxima ação: {c.proxima_acao ?? "—"} · prazo {dataCurta(c.prazo_proxima_acao)}
                </span>
              </li>
            ))}
            {!((qConversas.data ?? []) as any[]).length ? <li className="text-navy/50">Nenhuma conversa no vínculo selecionado.</li> : null}
          </ul>
        </Secao>

        <Secao titulo="Eventos de funil" descricao="Marcos controlados, imutáveis e sempre com evidência interna.">
          <ul className="max-h-[280px] space-y-2 overflow-auto text-sm">
            {((qEventos.data ?? []) as any[]).map((e) => (
              <li key={e.id} className="rounded-lg border border-navy/10 bg-white px-3 py-2">
                <span className="block font-medium text-navy">{ROTULO_EVENTO[e.event_type as EventoFunil] ?? e.event_type}</span>
                <span className="block text-[11px] text-navy/55">
                  {dataCurta(e.occurred_at)} · evidência: {e.evidencia_referencia ?? "—"}
                </span>
              </li>
            ))}
            {!((qEventos.data ?? []) as any[]).length ? <li className="text-navy/50">Nenhum evento no vínculo selecionado.</li> : null}
          </ul>
        </Secao>
      </div>
    </div>
  );
}
