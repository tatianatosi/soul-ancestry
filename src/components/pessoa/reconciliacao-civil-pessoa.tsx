import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { ReconciliarCpfMembrosCaso } from "@/components/caso/reconciliar-cpf-membros-caso";
import { ReconciliarTelefoneMembrosCaso } from "@/components/caso/reconciliar-telefone-membros-caso";
import { ReconciliarCepMembrosCaso } from "@/components/caso/reconciliar-cep-membros-caso";
import {
  conferirDivergenciaCepMembrosCaso,
  conferirDivergenciaCpfMembrosCaso,
  conferirDivergenciaTelefoneMembrosCaso,
} from "@/lib/caso-canonico.functions";

/**
 * J05 (05/11/2026): os painéis de reconciliação de CPF, telefone e CEP também aparecem na Pessoa 360.
 * Reaproveita os três painéis e as três conferências do Caso 360 (mesmos escritores, mesma regra: só preenche
 * campo vazio; divergência fica como conflito e só se resolve membro a membro, com motivo). A conferência é
 * por caso porque opera sobre os membros do caso; a pessoa escolhe qual caso conferir.
 */

type Dado = "CPF" | "telefone" | "CEP";
type Entrada = { caseId: string; confirmar?: boolean; resolverMembroId?: string; motivo?: string };

function useConferencia(dado: Dado, caseId: string, conferir: (a: { data: Entrada }) => Promise<any>, onMudou: () => void) {
  const [plano, setPlano] = useState<any[] | null>(null);
  const mConferir = useMutation({
    mutationFn: (confirmar: boolean) => conferir({ data: { caseId, confirmar } }),
    onSuccess: (r: any) => {
      setPlano(Array.isArray(r?.plano) ? r.plano : []);
      // Mesmo comportamento do Caso 360 (Fase C, 27/09/2026): campo vazio é preenchido sem segundo clique.
      if (r?.simulado) {
        if (Array.isArray(r.plano) && r.plano.some((p: any) => p.acao === "preencher")) mConferir.mutate(true);
        else toast.info(`Prévia da conferência de ${dado}: nada foi gravado ainda.`);
        return;
      }
      toast.success(
        r?.atualizados
          ? `${r.atualizados} ${dado}(s) preenchido(s) a partir do cadastro canônico.`
          : `Nada a preencher: nenhum membro estava com ${dado} vazio.`,
      );
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mResolver = useMutation({
    mutationFn: (v: { membroId: string; motivo: string }) =>
      conferir({ data: { caseId, resolverMembroId: v.membroId, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success(`${dado} alinhado ao cadastro canônico e registrado no histórico.`);
      mConferir.mutate(false);
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return {
    plano,
    ocupado: mConferir.isPending || mResolver.isPending,
    onVerificar: () => mConferir.mutate(false),
    onSincronizar: () => mConferir.mutate(true),
    onResolverConflito: (membroId: string, motivo: string) => mResolver.mutate({ membroId, motivo }),
  };
}

function PaineisDoCaso({ caseId, onMudou }: { caseId: string; onMudou: () => void }) {
  const cpf = useConferencia("CPF", caseId, useServerFn(conferirDivergenciaCpfMembrosCaso), onMudou);
  const telefone = useConferencia("telefone", caseId, useServerFn(conferirDivergenciaTelefoneMembrosCaso), onMudou);
  const cep = useConferencia("CEP", caseId, useServerFn(conferirDivergenciaCepMembrosCaso), onMudou);
  return (
    <div className="space-y-3">
      <ReconciliarCpfMembrosCaso {...cpf} />
      <ReconciliarTelefoneMembrosCaso {...telefone} />
      <ReconciliarCepMembrosCaso {...cep} />
    </div>
  );
}

export function ReconciliacaoCivilPessoa({
  casos,
  onMudou,
}: {
  casos: { id: string; rotulo: string }[];
  onMudou: () => void;
}) {
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const caseId = casos.find((c) => c.id === escolhido)?.id ?? casos[0]?.id ?? null;

  if (!caseId) {
    return (
      <p className="text-sm text-navy/65" data-reconciliacao-civil-vazio>
        Esta pessoa ainda não participa de nenhum caso. A conferência de CPF, telefone e CEP com o cadastro canônico
        acontece entre os membros de um caso.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-reconciliacao-civil-pessoa>
      {casos.length > 1 ? (
        <label className="block text-xs text-navy/70">
          Caso a conferir
          <select
            value={caseId}
            onChange={(e) => setEscolhido(e.target.value)}
            className="mt-1 block w-full min-h-11 rounded border border-navy/20 bg-background px-2 text-sm text-navy sm:max-w-sm"
          >
            {casos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-xs text-navy/60">Caso conferido: {casos[0].rotulo}</p>
      )}
      {/* key: trocar de caso zera o plano mostrado; nada de um caso aparece no outro. */}
      <PaineisDoCaso key={caseId} caseId={caseId} onMudou={onMudou} />
    </div>
  );
}
