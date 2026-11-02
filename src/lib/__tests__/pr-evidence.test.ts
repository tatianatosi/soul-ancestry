import { describe, it, expect } from 'vitest';
import { validateEvidence } from '../../../scripts/pr-evidence.mjs';
const sha = 'a'.repeat(40);
const criterion = { id: 'C1', requirement: 'Salvar e reler', test: 'E2E', kinds: ['ui','write'], status: 'PASSOU', evidence: { test:'https://example.org/test', desktop:'https://example.org/desktop', mobile:'https://example.org/mobile', action:'https://example.org/action', readback:'https://example.org/readback' } };
function body(changes = {}) { return '```json\n' + JSON.stringify({ agent:'Claude', base_sha:'b'.repeat(40), tested_sha:sha, files:['src/example.ts'], criteria:[criterion], ...changes }) + '\n```'; }
describe('evidências por PR', () => {
  it('aceita evidências declaradas do SHA exato, sem afirmar uso comprovado', () => expect(validateEvidence(body(),sha,['src/example.ts']).state).toBe('EVIDENCIAS_DECLARADAS'));
  it('rejeita SHA antigo', () => expect(validateEvidence(body(), 'c'.repeat(40)).errors).toContain('Evidências não correspondem ao SHA da PR.'));
  it('rejeita falta de captura mobile', () => expect(validateEvidence(body({criteria:[{...criterion,evidence:{...criterion.evidence,mobile:undefined}}]}),sha).errors).toContain('Evidência HTTPS mobile ausente: C1'));
  it('rejeita ausência de releitura', () => expect(validateEvidence(body({criteria:[{...criterion,evidence:{...criterion.evidence,readback:undefined}}]}),sha).errors).toContain('Evidência HTTPS readback ausente: C1'));
  it.each(['FALHOU','BLOQUEADO_POR_DADO','BLOQUEADO_POR_DECISAO','ERRO_DE_FONTE','NAO_LOCALIZADO'])('não aprova %s', status => expect(validateEvidence(body({criteria:[{...criterion,status,reason:'Sem dados',owner:'Proprietária'}]}),sha).state).toBe('PARCIAL'));
  it('rejeita critério sem estado', () => expect(validateEvidence(body({criteria:[{...criterion,status:undefined}]}),sha).errors).toContain('Estado inválido: C1'));
  it('rejeita matriz inválida', () => expect(validateEvidence('texto',sha).state).toBe('NAO_VERIFICADA'));
  it('detecta arquivo não declarado', () => expect(validateEvidence(body(),sha,['src/outro.ts']).errors).toContain('Arquivo não declarado: src/outro.ts'));
  it('detecta reserva concorrente', () => expect(validateEvidence(body(),sha,[],[{number:12,files:['src/example.ts']}]).errors).toContain('Sobreposição com PR #12: src/example.ts'));
});