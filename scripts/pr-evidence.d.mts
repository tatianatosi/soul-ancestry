export interface EvidenceResult { errors: string[]; pending: string[]; state: string }
export function validateEvidence(body: string | null, sha: string, changedFiles?: string[], reservations?: {number: number; files: string[]}[]): EvidenceResult;
export function parseReservation(body: string | null, number: number): {number: number; files: string[]};