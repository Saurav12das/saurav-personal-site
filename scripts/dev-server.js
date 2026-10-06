// Local static preview with the same newsletter handler used by Vercel.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const subscribe = require('../api/subscribe');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2' };
function createServer(newsletterHandler = subscribe) {
return http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/subscribe') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 4096) { res.writeHead(413); res.end(); return; }
      }
      req.body = body || undefined;
      res.status = code => { res.statusCode = code; return res; };
      res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
      await newsletterHandler(req, res);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method) || pathname.split('/').some(part => part.startsWith('.') || ['node_modules', 'scripts', 'api'].includes(part))) { res.writeHead(404); res.end(); return; }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(404); res.end(); return; }
    if ((await fs.stat(file).catch(() => null))?.isDirectory()) file = path.join(file, 'index.html');
    else if (!path.extname(file)) file += '.html';
    const type = types[path.extname(file)];
    if (!type) { res.writeHead(404); res.end(); return; }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (_) { res.writeHead(404); res.end('Not found'); }
});
}
if (require.main === module) createServer().listen(8081, '127.0.0.1', () => console.log('Newsletter preview: http://localhost:8081/follow.html'));
module.exports = createServer;
