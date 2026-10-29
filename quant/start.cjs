const { spawn, spawnSync } = require('node:child_process');
const { createHmac } = require('node:crypto');

const env = { ...process.env, HOSTNAME: '0.0.0.0' };
if (!env.DATABASE_URL && env.DB_HOST) {
  for (const name of ['DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE']) {
    if (!env[name]) throw new Error(`Missing managed PostgreSQL setting: ${name}`);
  }
  const url = new URL(`postgresql://${env.DB_HOST}:${env.DB_PORT || '5432'}`);
  url.username = env.DB_USERNAME;
  url.password = env.DB_PASSWORD;
  url.pathname = '/' + encodeURIComponent(env.DB_DATABASE);
  // Quant Cloud managed PostgreSQL requires encrypted connections.
  url.searchParams.set('sslmode', env.DB_SSLMODE || 'require');
  env.DATABASE_URL = url.toString();
}
if (!env.DATABASE_URL) throw new Error('Set DATABASE_URL or the managed DB_* settings');

// Stable across replicas/restarts, without committing a production session secret.
// An explicitly supplied APP_SECRET takes precedence; rotating DB_PASSWORD rotates
// this fallback secret and invalidates existing sessions.
if (!env.APP_SECRET && env.DB_PASSWORD) {
  env.APP_SECRET = createHmac('sha256', env.DB_PASSWORD)
    .update(`quant-umami-session:${env.DB_HOST}:${env.DB_DATABASE}`).digest('hex');
}
if (!env.APP_SECRET) throw new Error('Set APP_SECRET when using an explicit DATABASE_URL');
console.log(`Starting Umami with Node ${process.versions.node}`);
for (const script of ['scripts/check-db.js', 'scripts/update-tracker.js']) {
  const result = spawnSync(process.execPath, [script], { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const server = spawn(process.execPath, ['server.js'], { env, stdio: 'inherit' });
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.kill(signal));
}
server.on('error', (error) => { console.error(error); process.exit(1); });
server.on('exit', (code, signal) => process.exit(code ?? (signal === 'SIGTERM' ? 0 : 1)));
