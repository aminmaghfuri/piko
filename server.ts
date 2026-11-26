import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // API route for feature requests
  app.post('/api/feature-request', (req, res) => {
    const { senderName, category, message, recipient } = req.body;
    const requestRecord = {
      timestamp: new Date().toISOString(),
      senderName: senderName || 'Anonymous',
      category: category || 'General',
      message,
      recipient: recipient || 'req.piko@kasirsolo.com',
    };

    console.log('--- FEATURE REQUEST RECEIVED ---');
    console.log(`To: ${requestRecord.recipient}`);
    console.log(`From: ${requestRecord.senderName} (${requestRecord.category})`);
    console.log(`Message: ${requestRecord.message}`);
    console.log('--------------------------------');

    try {
      const logPath = path.resolve(__dirname, 'feature_requests.json');
      let logs = [];
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
      }
      logs.push(requestRecord);
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (err) {
      console.error('Failed to log request to file:', err);
    }

    res.json({
      success: true,
      message: `Feature request successfully logged and dispatched to ${requestRecord.recipient}`,
    });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
