import { useRef, useState } from "react";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { classificarErroPersistencia } from "@/lib/persistencia-erros";

type DecisaoBloqueio = {
  status: "resolvido" | "nao_aplicavel";
  justificativa: string;
};

/** Justificativa é um dado da resolução, não um motivo de override de autoridade. */
export function ResolucaoBloqueioPiloto({
  bloqueioId, podeResolver, pendente = false, onResolver,
}: {
  bloqueioId: string;
  podeResolver: boolean;
  pendente?: boolean;
  onResolver: (decisao: DecisaoBloqueio) => Promise<{ ok: boolean; erro?: string | null }>;
}) {
  const [justificativa, setJustificativa] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const emVoo = useRef(false);
  const campoId = `justificativa-bloqueio-${bloqueioId}`;
  const validacao = !podeResolver
    ? "Somente admin ou operações podem resolver este bloqueio."
    : pendente || salvando
      ? "Aguarde a resolução em andamento."
      : justificativa.trim().length < 10
        ? "Registre a justificativa da resolução (mínimo 10 caracteres)."
        : null;

  async function resolver(status: DecisaoBloqueio["status"]) {
    if (validacao || emVoo.current) return;
    emVoo.current = true;
    setSalvando(true);
    setErro(null);
    try {
      const resultado = await onResolver({ status, justificativa: justificativa.trim() });
      if (!resultado.ok) {
        setErro(resultado.erro || "A resolução não foi confirmada. Sua justificativa foi preservada.");
        return;
      }
      setJustificativa("");
    } catch (error) {
      setErro(classificarErroPersistencia(error).detalhe);
    } finally {
      emVoo.current = false;
      setSalvando(false);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <Label htmlFor={campoId}>Justificativa da resolução</Label>
      <Textarea id={campoId} value={justificativa}
        onChange={(event) => setJustificativa(event.target.value)}
        disabled={pendente || salvando || !podeResolver} minLength={10}
        aria-describedby={`${campoId}-ajuda`} rows={2} />
      <p id={`${campoId}-ajuda`} className="text-xs text-navy/70">
        Registre a evidência ou a razão de não aplicabilidade, com pelo menos 10 caracteres.
      </p>
      {erro && <p role="alert" className="text-sm text-terracotta">{erro}</p>}
      <div className="flex flex-wrap gap-2">
        <AcaoOperacional rotulo="Resolver" variant="outline"
          efeito="Resolve somente este bloqueio, com justificativa auditada."
          validacaoFormulario={validacao} onConfirmar={() => resolver("resolvido")} />
        <AcaoOperacional rotulo="Marcar não aplicável" variant="outline"
          efeito="Registra por que este requisito não se aplica ao caso."
          validacaoFormulario={validacao} onConfirmar={() => resolver("nao_aplicavel")} />
      </div>
    </div>
  );
}
