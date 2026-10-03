/**
 * Corte ÓRFÃOS onda 4 (03/10/2026) — a porta de entrada do AncestralScan.
 *
 * `triagem-ancestralscan.tsx` já mostrava a triagem de um lead e já aceitava
 * ou rejeitava sugestão de trilha. Mas os dois escritores de ENTRADA —
 * `importarTriagem` (registrar uma resposta do Scan público) e
 * `criarLeadDeTriagem` (virar lead) — não tinham chamador nenhum: só se
 * conseguia ver triagem de um lead que nunca podia nascer pelo Desk.
 *
 * O Scan é orientativo: nunca confirma elegibilidade, via, produto ou preço.
 * Aqui a equipe registra o que a pessoa respondeu, com versão, data e
 * consentimento — e só então vira lead.
 */
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { validarTriagem, type PayloadTriagemAncestralScan } from "@/lib/ancestralscan-triagem";
import { criarLeadDeTriagem, importarTriagem } from "@/lib/ancestralscan-triagem.functions";
import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";
import { verificarDuplicidadeLead } from "@/lib/crm-desk.functions";

const CONSENTIMENTOS = [
  { valor: "concedido", rotulo: "Concedido" },
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "recusado", rotulo: "Recusado" },
  { valor: "nao_solicitado", rotulo: "Não solicitado" },
];

export function ImportarTriagemScan() {
  const importar = useServerFn(importarTriagem);
  const criarLead = useServerFn(criarLeadDeTriagem);
  const verificar = useServerFn(verificarDuplicidadeLead);

  const [versaoScan, setVersaoScan] = useState("");
  const [respondidoEm, setRespondidoEm] = useState("");
  const [origemCampanha, setOrigemCampanha] = useState("");
  const [consentimentoStatus, setConsentimentoStatus] = useState("pendente");
  const [paises, setPaises] = useState("");
  const [geracao, setGeracao] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [triagemId, setTriagemId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [duplicidades, setDuplicidades] = useState<unknown[] | null>(null);

  const payload = (): Partial<PayloadTriagemAncestralScan> => ({
    versaoScan: versaoScan.trim(),
    respondidoEm: respondidoEm.trim(),
    origemCampanha: origemCampanha.trim() || null,
    consentimentoStatus: consentimentoStatus as PayloadTriagemAncestralScan["consentimentoStatus"],
    consentimentoVersaoAviso: consentimentoStatus === "concedido" ? AVISO_PRIVACIDADE.versao : null,
    consentimentoEm: consentimentoStatus === "concedido" ? new Date().toISOString() : null,
    paisesDeclarados: paises
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean),
    geracaoDeclarada: geracao.trim() || null,
    localidadeAscendenteDeclarada: localidade.trim() || null,
    documentosDeclarados: [],
    respostasPublicas: {},
    alertasPublicos: [],
    scoresOrientativos: {},
  });

  const erros = validarTriagem(payload());

  const mImportar = useMutation({
    mutationFn: () => importar({ data: { payload: payload() } }),
    onSuccess: (r: any) => {
      const id = r?.id ?? r?.triagem?.id ?? null;
      setTriagemId(id ? String(id) : null);
      toast.success(id ? "Triagem registrada. Agora pode virar lead." : "Triagem registrada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mVerificar = useMutation({
    mutationFn: () => verificar({ data: { nome: nome.trim() } }),
    onSuccess: (r: any) => {
      const lista = (r?.duplicidades ?? []) as unknown[];
      setDuplicidades(lista);
      toast.success(lista.length ? `${lista.length} possível duplicidade encontrada.` : "Nenhuma duplicidade encontrada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mCriar = useMutation({
    mutationFn: () => criarLead({ data: { triagemId: triagemId as string, nome: nome.trim() } }),
    onSuccess: () => toast.success("Lead criado a partir da triagem."),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-5" data-importar-triagem>
      <h2 className="font-serif text-base text-navy">Registrar triagem do AncestralScan</h2>
      <p className="mt-1 text-[11px] text-navy/50">
        O Scan é orientativo: sugere país e próxima pergunta, nunca confirma elegibilidade, via, produto, preço ou
        direito. O registro guarda versão, data e consentimento — é o que torna a entrada auditável.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Texto label="Versão do Scan" valor={versaoScan} onChange={setVersaoScan} />
        <Texto label="Respondido em" tipo="datetime-local" valor={respondidoEm} onChange={setRespondidoEm} />
        <Texto label="Origem/campanha" valor={origemCampanha} onChange={setOrigemCampanha} />
        <Selecao
          label="Consentimento"
          valor={consentimentoStatus}
          opcoes={CONSENTIMENTOS}
          onChange={setConsentimentoStatus}
        />
        <Texto label="Países declarados (separados por vírgula)" valor={paises} onChange={setPaises} />
        <Texto label="Geração declarada" valor={geracao} onChange={setGeracao} />
        <Texto label="Localidade do ascendente" valor={localidade} onChange={setLocalidade} />
      </div>
      {consentimentoStatus === "concedido" ? (
        <p className="mt-1 text-[11px] text-navy/50">
          Versão do aviso registrada: {AVISO_PRIVACIDADE.versao}.
        </p>
      ) : null}

      <div className="mt-3">
        <AcaoOperacional
          rotulo="Registrar triagem"
          capacidade="editar_rascunho"
          validacaoFormulario={erros[0]?.motivo ?? null}
          efeito="Grava a resposta do Scan como triagem auditável, com versão e consentimento. Não cria lead, não envia nada, não confirma elegibilidade."
          onConfirmar={() => mImportar.mutate()}
        />
      </div>

      <div className="mt-4 border-t border-navy/10 pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Virar lead</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Texto label="Nome da pessoa" valor={nome} onChange={setNome} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!nome.trim() || mVerificar.isPending}
            onClick={() => mVerificar.mutate()}
            className="rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy hover:bg-navy/5 disabled:opacity-40"
          >
            Conferir duplicidade antes de criar
          </button>
          <AcaoOperacional
            rotulo="Criar lead da triagem"
            capacidade="editar_rascunho"
            validacaoFormulario={!triagemId ? "Registre a triagem primeiro." : !nome.trim() ? "Informe o nome." : null}
            efeito="Cria o lead vinculado a esta triagem, com a origem registrada. Não dispara mensagem nem proposta."
            onConfirmar={() => mCriar.mutate()}
          />
        </div>
        {duplicidades ? (
          duplicidades.length > 0 ? (
            <ul className="mt-2 space-y-0.5">
              {duplicidades.map((d: any, i) => (
                <li key={i} className="text-[11px] text-terracotta">
                  Possível duplicidade: {d?.nome ?? "registro existente"}
                  {d?.motivo ? ` — ${d.motivo}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] text-navy/55">Nenhuma duplicidade encontrada para este nome.</p>
          )
        ) : null}
      </div>
    </section>
  );
}
