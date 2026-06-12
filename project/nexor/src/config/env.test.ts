import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

describe('parseEnv', () => {
  it('validates required envs', () => {
    expect(() => parseEnv({})).toThrow();
  });

  it('returns envs when valid', () => {
    const env = parseEnv({
      VITE_BITEPLANER_URL: 'http://localhost:5174',
      VITE_API_URL: 'http://127.0.0.1:3333',
      VITE_APP_URL: 'http://localhost:5173'
    });
    expect(env.biteplanerUrl).toBe('http://localhost:5174');
    expect(env.apiUrl).toBe('http://127.0.0.1:3333');
    expect(env.appUrl).toBe('http://localhost:5173');
  });

  it('uses local Biteplaner URL in development', () => {
    const env = parseEnv({ MODE: 'development' });
    expect(env.biteplanerUrl).toBe('http://localhost:5174');
    expect(env.apiUrl).toBe('http://127.0.0.1:3333');
  });

  it('accepts optional contact envs', () => {
    const env = parseEnv({
      VITE_BITEPLANER_URL: 'http://localhost:5174',
      VITE_API_URL: 'http://127.0.0.1:3333',
      VITE_CONTACT_EMAIL: 'x@y.com'
    });
    expect(env.contactEmail).toBe('x@y.com');
  });

  it('defaults the public contact email to the Nexor Advance inbox', () => {
    const env = parseEnv({
      VITE_BITEPLANER_URL: 'http://localhost:5174',
      VITE_API_URL: 'http://127.0.0.1:3333'
    });

    expect(env.contactEmail).toBe('contato@nexoradvance.com.br');
  });

  it('parses the Biteplaner disable flag', () => {
    expect(
      parseEnv({
        VITE_BITEPLANER_URL: 'http://localhost:5174',
        VITE_API_URL: 'http://127.0.0.1:3333',
        DISABLE_BITEPLANER: 'true'
      }).disableBiteplaner
    ).toBe(true);

    expect(
      parseEnv({
        VITE_BITEPLANER_URL: 'http://localhost:5174',
        VITE_API_URL: 'http://127.0.0.1:3333',
        DISABLE_BITEPLANER: 'false'
      }).disableBiteplaner
    ).toBe(false);
  });
});
