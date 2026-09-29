import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let port = Number(process.env.PORT) || 3000;
let host = process.env.HOST || '0.0.0.0';

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--port' && process.argv[i + 1]) {
    port = Number(process.argv[++i]);
  } else if (arg === '--host' && process.argv[i + 1]) {
    host = process.argv[++i];
  } else if (/^\d+$/.test(arg)) {
    port = Number(arg);
  } else if (arg === '0.0.0.0' || arg === 'localhost' || arg === '127.0.0.1') {
    host = arg;
  }
}

const previewServer = await preview({
  configFile: path.resolve(__dirname, 'vite.config.ts'),
  root: __dirname,
  preview: {
    port,
    host,
  },
});

previewServer.printUrls();
previewServer.bindCLIShortcuts({ print: true });
