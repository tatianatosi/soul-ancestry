import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { supabase } from "@/integrations/supabase/client";
import { EVENTOS_SNAPSHOT_INSTITUCIONAL } from "@/lib/perfil-institucional-persistido";
import {
  lerPerfilInstitucionalPersistido,
  registrarPerfilInstitucional,
  registrarSnapshotInstitucional,
} from "@/lib/perfil-institucional-persistido.functions";

/**
 * Ações do perfil institucional na Governança (religação 31/10/2026): registrar
 * a versão vigente da organização e gravar o snapshot em uma versão
 * contratual. A organização vem da sessão no servidor; só admin/operações
 * gravam; snapshot nunca sobrescreve um anterior.
 */
export function PerfilInstitucionalAcoes() {
  const qc = useQueryClient();
  const ler = useServerFn(lerPerfilInstitucionalPersistido);
  const registrar = useServerFn(registrarPerfilInstitucional);
  const snapshot = useServerFn(registrarSnapshotInstitucional);
  const [whatsapp, setWhatsapp] = useState(false);
  const [versaoId, setVersaoId] = useState("");
  const [evento, setEvento] = useState<string>(EVENTOS_SNAPSHOT_INSTITUCIONAL[0]);

  const perfil = useQuery({ queryKey: ["perfil-institucional-persistido"], queryFn: () => ler() });
  const versoes = useQuery({
    queryKey: ["perfil-institucional-versoes-contratuais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_versions")
        .select("id,status,created_at,institutional_profile_snapshot")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const aoFalhar = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Não foi possível concluir.");

  const registrarVersao = useMutation({
    mutationFn: () => registrar({ data: { whatsappConfigurado: whatsapp } }),
    onSuccess: (r) => {
      toast.success(
        r.criado ? "Versão institucional registrada." : "A versão vigente já estava registrada.",
      );
      void qc.invalidateQueries({ queryKey: ["perfil-institucional-persistido"] });
    },
    onError: aoFalhar,
  });
  const gravarSnapshot = useMutation({
    mutationFn: () => snapshot({ data: { contractVersionId: versaoId, evento } }),
    onSuccess: (r) => {
      if (r.gravado) toast.success("Snapshot institucional gravado na versão contratual.");
      else toast.message(r.motivo);
      void qc.invalidateQueries({ queryKey: ["perfil-institucional-versoes-contratuais"] });
    },
    onError: aoFalhar,
  });

  return (
    <div
      data-perfil-institucional-acoes
      className="space-y-3 rounded-lg border border-navy/10 bg-white p-3 text-xs text-navy"
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
        Registro do perfil institucional
      </p>
      <p>
        {perfil.data?.persistido
          ? `Versão persistida: ${perfil.data.payload.versao} · ${perfil.data.payload.status}.`
          : "Nenhuma versão institucional persistida para esta organização."}
      </p>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
        WhatsApp institucional configurado
      </label>
      <AcaoOperacional
        rotulo="Registrar versão institucional"
        efeito="Registra (ou reaproveita) a versão vigente do perfil institucional desta organização, em revisão jurídica."
        onConfirmar={() => registrarVersao.mutate()}
      />
      <div className="flex flex-wrap gap-2 border-t border-navy/10 pt-2">
        <select
          aria-label="Versão contratual"
          value={versaoId}
          onChange={(e) => setVersaoId(e.target.value)}
          className="rounded border border-navy/20 px-2 py-1"
        >
          <option value="">Versão contratual para o snapshot</option>
          {(versoes.data ?? []).map((v) => (
            <option key={v.id} value={v.id} disabled={!!v.institutional_profile_snapshot}>
              {String(v.created_at).slice(0, 10)} · {v.status}
              {v.institutional_profile_snapshot ? " · snapshot já gravado" : ""}
            </option>
          ))}
        </select>
        <select
          aria-label="Evento de governança"
          value={evento}
          onChange={(e) => setEvento(e.target.value)}
          className="rounded border border-navy/20 px-2 py-1"
        >
          {EVENTOS_SNAPSHOT_INSTITUCIONAL.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!versaoId || gravarSnapshot.isPending}
          onClick={() => gravarSnapshot.mutate()}
          className="rounded border border-navy/20 px-2 py-1 hover:bg-cream/60 disabled:opacity-40"
        >
          Gravar snapshot
        </button>
      </div>
    </div>
  );
}
