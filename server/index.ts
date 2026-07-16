import 'dotenv/config';
import express from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { assertProductionConfig, env } from './config/env.ts';
import { corsMiddleware } from './middleware/cors.ts';
import { securityHeaders } from './middleware/securityHeaders.ts';
import loginRouter from './routes/login.ts';

const rootDir = process.cwd();

assertProductionConfig();

const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '256kb', strict: true }));

const mountApi = (basePath: string) => {
  app.use(`${basePath}/login`, loginRouter);
};

mountApi('/api');
mountApi('/functions/v1');

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'allsign-api', env: env.nodeEnv, port: env.port });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'allsign-api', env: env.nodeEnv, port: env.port });
});

if (env.isProduction) {
  const distDir = path.join(rootDir, 'dist');
  if (!existsSync(distDir)) {
    console.error(`[startup] ERROR: dist/ not found at ${distDir}. Run "npm run build" first.`);
    process.exit(1);
  }

  app.use(express.static(distDir, { index: false, maxAge: '1h' }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/functions/v1')) {
      next();
      return;
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.listen(env.port, env.host, () => {
  console.log(
    `[startup] Allsign listening on http://${env.host}:${env.port} (${env.nodeEnv}) cwd=${rootDir}`,
  );
  if (env.isProduction) {
    console.log('[startup] Serving frontend from /dist');
  }
}).on('error', (error) => {
  console.error('[startup] Failed to bind port:', error);
  process.exit(1);
});
