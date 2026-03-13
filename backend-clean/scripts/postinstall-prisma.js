const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const rootDir = process.cwd();
const prismaBin = path.join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

const envCandidates = ['.env', '.env.local', '.env.development', '.env.production'];

for (const envFile of envCandidates) {
  const envPath = path.join(rootDir, envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

if (!process.env.DATABASE_URL) {
  console.warn('Skipping Prisma generate: DATABASE_URL is not configured.');
  process.exit(0);
}

const result = process.platform === 'win32'
  ? spawnSync(`"${prismaBin}" generate`, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    })
  : spawnSync(prismaBin, ['generate'], {
      stdio: 'inherit',
      env: process.env,
    });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (typeof result.status === 'number' && result.status !== 0) {
  process.exit(result.status);
}