const digitsOnly = /\D/g;

export function normalizeCnpj(value: string) {
  return value.replace(digitsOnly, '');
}

export function isValidCnpj(value: string) {
  const cnpj = normalizeCnpj(value);

  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calculateCheckDigit = (base: string, factors: number[]) => {
    const total = factors.reduce((sum, factor, index) => sum + Number(base[index]) * factor, 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateCheckDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateCheckDigit(cnpj.slice(0, 12) + String(firstDigit), [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
  ]);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}
