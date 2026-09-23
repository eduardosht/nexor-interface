import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const client = resolve(root, 'build', 'client');
const routes = ['', 'sobre', 'biteplaner', 'conheca-biteplaner', 'parceiros', 'privacidade', 'termos', 'cookies'];
const missing = routes.filter((route) => !existsSync(resolve(client, route, 'index.html')));

if (missing.length > 0) {
  console.error(`SSG incompleto. HTML ausente para: ${missing.join(', ')}`);
  process.exit(1);
}

const homeHtml = readFileSync(resolve(client, 'index.html'), 'utf8');
if (!homeHtml.includes('<body>') || !homeHtml.includes('Nexor')) {
  console.error('O HTML pré-renderizado não contém conteúdo institucional renderizado.');
  process.exit(1);
}

console.log(`SSG validado: ${routes.length} páginas HTML geradas em ${client}`);
