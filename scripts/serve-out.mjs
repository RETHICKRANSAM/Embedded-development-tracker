import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../out');
const basePath = '/Embedded-development-tracker';
const PORT = process.env.PORT || 4173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  if (reqUrl === '/' || reqUrl === basePath) {
    res.writeHead(302, { Location: `${basePath}/` });
    res.end();
    return;
  }

  if (!reqUrl.startsWith(basePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found outside basePath');
    return;
  }

  let relativePath = reqUrl.slice(basePath.length);
  if (relativePath === '' || relativePath === '/') {
    relativePath = '/index.html';
  } else if (!path.extname(relativePath)) {
    if (fs.existsSync(path.join(outDir, relativePath, 'index.html'))) {
      relativePath = path.join(relativePath, 'index.html');
    } else if (fs.existsSync(path.join(outDir, relativePath + '.html'))) {
      relativePath = relativePath + '.html';
    }
  }

  const filePath = path.join(outDir, relativePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const notFoundPath = path.join(outDir, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Local static server ready at http://localhost:${PORT}${basePath}/`);
});
