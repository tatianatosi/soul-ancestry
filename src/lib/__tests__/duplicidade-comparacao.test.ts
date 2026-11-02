import { describe, it, expect } from 'vitest';
import { sinaisDuplicidade } from '../duplicidade-comparacao';
describe('caracterização da comparação já existente', () => {
  it('preserva acentos, espaços e ordem dos sinais', () => expect(sinaisDuplicidade({nome:' José   Silva ',email:' A@B.COM ',telefone:'(11) 99999-1234'}, {nome:'jose silva',email:'a@b.com',telefone:'(21) 99999-1234'})).toEqual(['mesmo e-mail','mesmo telefone','mesmo nome']));
  it('não compara campos ausentes nem telefone curto', () => expect(sinaisDuplicidade({nome:'',telefone:'123'}, {nome:'',telefone:'123'})).toEqual([]));
  it('mantém nome apenas como sinal, não funde nem retorna identidade', () => expect(sinaisDuplicidade({nome:'Ana'}, {nome:'ANA'})).toEqual(['mesmo nome']));
  it('não altera candidatos por CPF ou DEMO: são políticas externas', () => expect(sinaisDuplicidade({nome:'Maria'}, {nome:'Outra'})).toEqual([]));
});