import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function capture(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

run('npm', ['run', 'optimize:images']);

const diff = capture('git', [
  'diff',
  '--exit-code',
  '--',
  'src/assets/generated/public',
  'src/assets/publicOptimizedImages.ts',
]);

if (diff.status !== 0) {
  process.stderr.write('\nOptimized image assets are out of date.\n');
  process.stderr.write('Run `npm run optimize:images`, review the generated files, and commit them.\n\n');
  process.stderr.write(diff.stdout);
  process.stderr.write(diff.stderr);
  process.exit(diff.status ?? 1);
}

console.log('Optimized image assets are up to date.');
