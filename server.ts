import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDev = process.env.NODE_ENV !== 'production';
const PORT = isDev ? 3000 : (process.env.PORT || 3000);

app.use(express.json());

// Persistent data directory
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'winter_store.json');

// Ensure data folder
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ServerStore {
  confessions: any[];
  characters: any[];
  characterViews?: Record<string, number>;
  profile: any;
  contacts: any[];
}

function loadData(): ServerStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading storage:', err);
  }
  return {
    confessions: [],
    characters: [],
    characterViews: {},
    profile: null,
    contacts: [],
  };
}

function saveData(data: ServerStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing storage:', err);
  }
}

// Memory rate limit tracker for anti-spam
const ipRateLimitMap = new Map<string, number>();

// --- API Routes ---

// Profile
app.get('/api/profile', (req, res) => {
  const store = loadData();
  if (store.profile) {
    return res.json(store.profile);
  }
  res.status(404).json({ message: 'Profile not customized yet' });
});

app.put('/api/profile', (req, res) => {
  const store = loadData();
  store.profile = { ...(store.profile || {}), ...req.body };
  saveData(store);
  res.json(store.profile);
});

const LEGACY_SAMPLE_IDS = new Set(['char-1', 'char-2', 'char-3', 'char-4']);

function normalizeServerChar(c: any) {
  if (!c || typeof c !== 'object') return c;
  return {
    ...c,
    name: typeof c.name === 'string' ? c.name.normalize('NFKC') : c.name,
    slogan: typeof c.slogan === 'string' ? c.slogan.normalize('NFKC') : c.slogan,
    tags: Array.isArray(c.tags)
      ? c.tags.map((t: any) => (typeof t === 'string' ? t.normalize('NFKC') : t))
      : c.tags,
    backstory: typeof c.backstory === 'string' ? c.backstory.normalize('NFKC') : c.backstory,
    firstMess: typeof c.firstMess === 'string' ? c.firstMess.normalize('NFKC') : c.firstMess,
  };
}

// Characters
app.get('/api/characters', (req, res) => {
  const store = loadData();
  const list = (store.characters || [])
    .filter((c: any) => !LEGACY_SAMPLE_IDS.has(String(c?.id)))
    .map(normalizeServerChar);
  res.json(list);
});

app.post('/api/characters', (req, res) => {
  const char = normalizeServerChar(req.body);
  if (!char || !char.name || !char.slogan) {
    return res.status(400).json({ error: 'Thông tin Character không hợp lệ.' });
  }
  const store = loadData();
  store.characters = [char, ...(store.characters || [])];
  saveData(store);
  res.status(201).json(char);
});

app.put('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  const updates = normalizeServerChar(req.body);
  const store = loadData();
  store.characters = (store.characters || []).map((c: any) =>
    c.id === id ? normalizeServerChar({ ...c, ...updates, id }) : c
  );
  saveData(store);
  res.json({ ...updates, id });
});

app.delete('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  const store = loadData();
  store.characters = (store.characters || []).filter((c: any) => c.id !== id);
  saveData(store);
  res.json({ success: true });
});

app.get('/api/character-views', (req, res) => {
  const store = loadData();
  res.json(store.characterViews || {});
});

app.post('/api/characters/:id/view', (req, res) => {
  const { id } = req.params;
  const store = loadData();
  if (!store.characterViews) {
    store.characterViews = {};
  }
  const nextCount = (Number(store.characterViews[id]) || 0) + 1;
  store.characterViews[id] = nextCount;
  saveData(store);
  res.json({ id, views: nextCount });
});

// Confessions
app.get('/api/confessions', (req, res) => {
  const store = loadData();
  res.json(store.confessions || []);
});

app.post('/api/confessions', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const lastRequestTime = ipRateLimitMap.get(ip) || 0;

  // Anti-spam rate limiting: 10 seconds cooldown
  if (now - lastRequestTime < 10000) {
    const remaining = Math.ceil((10000 - (now - lastRequestTime)) / 1000);
    return res.status(429).json({
      error: `Bạn đang gửi thư quá nhanh. Xin chờ ${remaining} giây nữa để gửi bức thư tiếp theo.`,
    });
  }

  const { content, topic, stamp, isAnonymous, sender } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Nội dung thư không được để trống.' });
  }

  const trimmed = content.trim();
  if (trimmed.length < 10) {
    return res.status(400).json({ error: 'Nội dung tối thiểu 10 ký tự.' });
  }

  if (trimmed.length > 800) {
    return res.status(400).json({ error: 'Nội dung tối đa 800 ký tự.' });
  }

  const newConfession = {
    id: `conf-${Date.now()}`,
    sender: isAnonymous ? 'Người Qua Đường Trong Bão Tuyết' : (sender?.trim() || 'Lữ khách mùa đông'),
    isAnonymous: !!isAnonymous,
    content: trimmed,
    topic: topic || 'Tâm sự',
    stamp: stamp || 'snowflake',
    createdAt: new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    heartsCount: 1,
    status: 'approved',
    replies: [],
  };

  const store = loadData();
  store.confessions = [newConfession, ...(store.confessions || [])];
  saveData(store);

  ipRateLimitMap.set(ip, now);
  res.status(201).json(newConfession);
});

app.post('/api/confessions/:id/like', (req, res) => {
  const { id } = req.params;
  const store = loadData();
  let count = 0;
  store.confessions = (store.confessions || []).map((c: any) => {
    if (c.id === id) {
      c.heartsCount = (c.heartsCount || 0) + 1;
      count = c.heartsCount;
    }
    return c;
  });
  saveData(store);
  res.json({ heartsCount: count });
});

app.post('/api/confessions/:id/comments', (req, res) => {
  const { id } = req.params;
  const reply = req.body;
  if (!reply || !reply.content) {
    return res.status(400).json({ error: 'Nội dung phản hồi không hợp lệ.' });
  }

  const store = loadData();
  let addedReply = null;
  store.confessions = (store.confessions || []).map((c: any) => {
    if (c.id === id) {
      addedReply = {
        id: `rep-${Date.now()}`,
        sender: reply.sender || 'Lữ khách ghé qua',
        content: reply.content.trim(),
        createdAt: new Date().toLocaleString('vi-VN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCreator: !!reply.isCreator,
      };
      c.replies = [...(c.replies || []), addedReply];
    }
    return c;
  });

  saveData(store);
  res.json(addedReply);
});

// Contact
app.post('/api/contact', (req, res) => {
  const { senderName, email, message } = req.body;
  if (!senderName || !message) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tên và nội dung.' });
  }
  const store = loadData();
  const contactMsg = {
    id: `msg-${Date.now()}`,
    senderName,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  store.contacts = [contactMsg, ...(store.contacts || [])];
  saveData(store);
  res.status(201).json({ success: true });
});

// Serve static assets from public/ directly
app.use(express.static(path.join(__dirname, 'public')));

// Mount Vite or static files
async function startServer() {
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
