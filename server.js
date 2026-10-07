const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize leaderboard file with empty array (clean/reset from any dummy data)
if (!fs.existsSync(LEADERBOARD_FILE)) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify([]), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getLeaderboardData() {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
      return JSON.parse(raw) || [];
    }
  } catch (e) {
    console.error('Error reading leaderboard file:', e);
  }
  return [];
}

function saveLeaderboardData(list) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing leaderboard file:', e);
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoint: GET /api/leaderboard ---
  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    const list = getLeaderboardData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  // --- API Endpoint: POST /api/leaderboard ---
  if (pathname === '/api/leaderboard' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const name = (data.name || 'Blocky').trim().slice(0, 15);
        const avatar = (data.avatar || '🎮').trim();
        const score = Number(data.score) || 0;
        const date = data.date || 'Baru saja';

        if (score > 0) {
          let list = getLeaderboardData();
          // Check if player with same name exists
          const existingIdx = list.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
          if (existingIdx !== -1) {
            // Keep highest score
            if (score > list[existingIdx].score) {
              list[existingIdx].score = score;
              list[existingIdx].avatar = avatar;
              list[existingIdx].date = date;
            }
          } else {
            list.push({ name, avatar, score, date });
          }

          // Sort descending by score
          list.sort((a, b) => b.score - a.score);
          // Limit to top 50
          list = list.slice(0, 50);
          // Assign rank numbers
          list.forEach((item, index) => {
            item.rank = index + 1;
          });

          saveLeaderboardData(list);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(list));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Skor harus lebih dari 0' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = decodeURI(pathname);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎮 Block Blast Server berjalan di:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
