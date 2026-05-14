import { describe, expect, it } from 'vitest';
import {
  formatDocumentValue,
  formatPhoneValue,
  getDocumentMaxLength,
  sanitizePhoneValue,
  sanitizeDocumentValue,
  sanitizePersonName,
} from './formats';

describe('form format helpers', () => {
  it('removes digits from person names', () => {
    expect(sanitizePersonName('Ana 123 Silva-Dias')).toBe('Ana  Silva-Dias');
  });

  it('formats CPF with punctuation and keeps raw digits separately', () => {
    expect(sanitizeDocumentValue('cpf', '123.456.789-09')).toBe('12345678909');
    expect(formatDocumentValue('cpf', '12345678909')).toBe('123.456.789-09');
    expect(getDocumentMaxLength('cpf')).toBe(14);
  });

  it('formats RG with a flexible Brazilian mask', () => {
    expect(sanitizeDocumentValue('rg', '12.345.678-x')).toBe('12345678X');
    expect(formatDocumentValue('rg', '12345678X')).toBe('12.345.678-X');
    expect(getDocumentMaxLength('rg')).toBe(12);
  });

  it('formats Brazilian mobile phone numbers', () => {
    expect(sanitizePhoneValue('(11) 99999-9999')).toBe('11999999999');
    expect(formatPhoneValue('11999999999')).toBe('(11) 99999-9999');
    expect(formatPhoneValue('119999999999')).toBe('(11) 99999-9999');
  });
});
