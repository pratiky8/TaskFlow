import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    if (req.url === '/' || req.url === '/test') {
      const html = await readFile(join(__dirname, 'direct-api-test.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (req.url === '/favicon.ico') {
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📋 Open http://localhost:${PORT}/test to test the API`);
  console.log(`🔧 Backend API should be running on http://localhost:5000`);
  console.log(`\n💡 If this works, the issue is with the React development server setup`);
  console.log(`   and you can start the main app with 'npm run dev' in the team-task-manager folder\n`);
});
