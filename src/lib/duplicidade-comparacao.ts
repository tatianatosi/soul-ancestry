/** Comparison signals only: never merges identities or decides candidate eligibility. */
export const soDigitos = (v: string) => v.replace(/\D+/g, '');
export const normalizarNome = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
type Entrada = { nome: string; email?: string | null; telefone?: string | null };
export function sinaisDuplicidade(entrada: Entrada, candidato: Entrada): string[] {
  const email = (entrada.email ?? '').trim().toLowerCase();
  const tel = soDigitos(entrada.telefone ?? '');
  const chave = tel.length >= 8 ? tel.slice(-8) : '';
  const nome = normalizarNome(entrada.nome ?? '');
  const motivos: string[] = [];
  if (email && (candidato.email ?? '').trim().toLowerCase() === email) motivos.push('mesmo e-mail');
  const outroTel = soDigitos(candidato.telefone ?? '');
  if (chave && outroTel.length >= 8 && outroTel.slice(-8) === chave) motivos.push('mesmo telefone');
  if (nome && normalizarNome(candidato.nome ?? '') === nome) motivos.push('mesmo nome');
  return motivos;
}