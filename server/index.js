// server/index.js  (ESM)
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'users.json');

const app = express();
app.use(cors());
app.use(express.json());

async function loadUsers() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// Seed: Admin darf nicht fehlen
async function ensureAdmin() {
  const users = await loadUsers();
  const hasAdmin = users.some(u => (u.username ?? '').toLowerCase() === 'admin');
  if (!hasAdmin) {
    users.push({
      username: 'admin',
      password: 'Teyla',
      firstname: 'System',
      lastname: 'Admin',
      birthyear: 2000,
      email: 'admin@example.com',
      role: 'admin'
    });
    await saveUsers(users);
    console.log('Seed: Admin angelegt.');
  }
}
await ensureAdmin();

// ---- API ----------------------------------------------------------
app.post('/api/users/register', async (req, res) => {
  const { username, password, firstname, lastname, birthyear, email } = req.body ?? {};
  if (!username || !password || !firstname || !lastname || !birthyear || !email) {
    return res.status(400).json({ ok: false, msg: 'Felder unvollständig.' });
  }
  if (String(username).toLowerCase() === 'admin') {
    return res.status(400).json({ ok: false, msg: '„Admin“ ist reserviert.' });
  }

  const users = await loadUsers();
  const exists = users.some(u => (u.username ?? '').toLowerCase() === String(username).toLowerCase());
  if (exists) return res.status(409).json({ ok: false, msg: 'Benutzer existiert bereits.' });

  users.push({
    username: String(username),
    password: String(password),
    firstname: String(firstname),
    lastname: String(lastname),
    birthyear: Number(birthyear),
    email: String(email),
    role: 'user'
  });
  await saveUsers(users);
  res.json({ ok: true, msg: 'Registrierung erfolgreich.' });
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  const users = await loadUsers();
  const user = users.find(
    u => (u.username ?? '').toLowerCase() === String(username ?? '').toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ ok: false, msg: 'Ungültige Zugangsdaten.' });

  res.json({
    ok: true,
    user: { username: user.username, role: user.role ?? 'user', email: user.email }
  });
});

app.post('/api/users/recover', async (req, res) => {
  const { firstname, lastname, birthyear, email } = req.body ?? {};
  const users = await loadUsers();
  const found = users.find(
    u =>
      (u.firstname ?? '').toLowerCase() === String(firstname ?? '').toLowerCase() &&
      (u.lastname ?? '').toLowerCase() === String(lastname ?? '').toLowerCase() &&
      Number(u.birthyear) === Number(birthyear) &&
      (u.email ?? '').toLowerCase() === String(email ?? '').toLowerCase()
  );
  if (!found) return res.json({ ok: false, msg: 'Keine passenden Daten gefunden.' });
  // Demo: Zugangsdaten direkt zurückgeben
  res.json({ ok: true, username: found.username, password: found.password });
});

// >>> HIER: Konto löschen (Admin geschützt)
app.delete('/api/users/:username', async (req, res) => {
  const param = String(req.params.username ?? '');
  if (!param) return res.status(400).json({ ok: false, msg: 'Kein Benutzername angegeben.' });

  if (param.toLowerCase() === 'admin') {
    return res.status(403).json({ ok: false, msg: 'Admin-Konto kann nicht gelöscht werden.' });
  }

  const users = await loadUsers();
  const idx = users.findIndex(u => (u.username ?? '').toLowerCase() === param.toLowerCase());
  if (idx === -1) return res.status(404).json({ ok: false, msg: 'Benutzer nicht gefunden.' });

  users.splice(idx, 1);
  await saveUsers(users);
  res.json({ ok: true, msg: 'Konto unwiderruflich gelöscht.' });
});

// -------------------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User JSON backend läuft auf http://localhost:${PORT}`));
