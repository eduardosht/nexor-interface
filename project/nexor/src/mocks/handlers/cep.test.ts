import { describe, expect, it } from 'vitest';
import { getDemoViaCepResponse } from './cep';

describe('mock ViaCEP handler', () => {
  it('returns a successful address response for any valid Brazilian CEP shape', () => {
    expect(getDemoViaCepResponse('04567-000')).toEqual(
      expect.objectContaining({
        cep: '04567-000',
        logradouro: expect.any(String),
        localidade: expect.any(String),
        uf: expect.any(String),
      })
    );
  });
});
