const digitsOnly = /\D/g;

export function normalizeCpf(value: string) {
  return value.replace(digitsOnly, '');
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);

  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcDigit = (base: string, len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i += 1) {
      sum += Number(base[i]) * (len + 1 - i);
    }
    const rem = (sum * 10) % 11;
    return rem === 10 ? 0 : rem;
  };

  return calcDigit(cpf, 9) === Number(cpf[9]) && calcDigit(cpf, 10) === Number(cpf[10]);
}
