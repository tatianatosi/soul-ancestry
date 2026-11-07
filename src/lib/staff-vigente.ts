/** A04: escolhe o acesso de equipe vigente — ativo mais recente; sem ativo, o mais recente. */
export type StaffLinha = { status: string; updated_at?: string | null; [k: string]: unknown };

export function escolherStaffVigente<T extends StaffLinha>(linhas: readonly T[]): T | null {
  if (!linhas.length) return null;
  const porData = [...linhas].sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")));
  return porData.find((l) => l.status === "active") ?? porData[0];
}
