import { describe, expect, it } from 'vitest';
import { DEMO_VIA_CEP_RESPONSE, getDemoViaCepResponse } from './cep';

describe('cepHandlers', () => {
  it('provides a real ViaCEP-shaped example for the demo CEP', () => {
    expect(getDemoViaCepResponse('01001-000')).toEqual({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      complemento: 'lado ímpar',
      unidade: '',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
      estado: 'São Paulo',
      regiao: 'Sudeste',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107',
    });
    expect(DEMO_VIA_CEP_RESPONSE.localidade).toBe('São Paulo');
  });

  it('returns the ViaCEP not-found shape for other demo CEPs', () => {
    expect(getDemoViaCepResponse('99999-999')).toEqual({ erro: true });
  });
});
