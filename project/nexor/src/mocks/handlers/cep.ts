import type { Server } from 'miragejs';

export const DEMO_VIA_CEP_RESPONSE = {
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
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export function getDemoViaCepResponse(cep: string) {
  return onlyDigits(cep) === '01001000' ? DEMO_VIA_CEP_RESPONSE : { erro: true };
}

export function cepHandlers(server: Server) {
  server.get('https://viacep.com.br/ws/:cep/json/', (_schema, request) =>
    getDemoViaCepResponse(String(request.params.cep))
  );
}

