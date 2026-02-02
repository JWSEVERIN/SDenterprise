const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Session setup
app.use(session({
  secret: 'dev-secret-sevdev',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'unauthorized' });
}

// protect specific pages from unauthenticated access before serving static files
app.use((req, res, next) => {
  const protectedPages = ['/employees.html', '/customers.html', '/services.html'];
  if (protectedPages.includes(req.path)) {
    if (req.session && req.session.user) return next();
    return res.redirect('/login.html');
  }
  next();
});

// static
app.use('/', express.static(path.join(__dirname, 'public')));

// API
const api = express.Router();

api.get('/employees', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
  let all = db.getAllEmployees();
  const order = (req.query.order || 'desc').toLowerCase();
  if (order === 'asc') all = all.slice().sort((a,b)=>a.id-b.id);
  else all = all.slice().sort((a,b)=>b.id-a.id);
  const total = all.length;
  const total_pages = Math.max(1, Math.ceil(total / per_page));
  const start = (page - 1) * per_page;
  const data = all.slice(start, start + per_page);
  res.json({ data, page, per_page, total, total_pages });
});

api.get('/employees/:id', (req, res) => {
  const rec = db.getEmployee(req.params.id);
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json(rec);
});

api.post('/employees', requireAuth, (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: 'name required' });
  const created = db.createEmployee(body);
  res.status(201).json(created);
});

api.put('/employees/:id', requireAuth, (req, res) => {
  const updated = db.updateEmployee(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

api.delete('/employees/:id', requireAuth, (req, res) => {
  const ok = db.deleteEmployee(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

// auth routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const u = db.getUserByUsername(username);
  if (!u) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  req.session.user = { username: u.username, id: u.id };
  res.json({ ok: true });
});

app.post('/logout', (req, res) => {
  if (req.session) req.session.destroy(() => {});
  res.json({ ok: true });
});

// signup
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body || {};
  if (!username || !password || !email) return res.status(400).json({ error: 'username, email and password required' });
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'invalid email' });
  if (db.getUserByUsername && db.getUserByUsername(username)) return res.status(409).json({ error: 'username exists' });
  if (db.getUserByEmail && db.getUserByEmail(email)) return res.status(409).json({ error: 'email exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = db.createUser({ username, passwordHash: hash, email });
  req.session.user = { username: user.username, id: user.id };
  res.json({ ok: true });
});

// auth check for client-side UI
app.get('/api/auth-check', (req, res) => {
  if (req.session && req.session.user) return res.json({ ok: true, user: req.session.user });
  res.status(401).json({ ok: false });
});

// requireAuth should already exist; enforce it for read endpoints and page routes
app.use('/api/employees', requireAuth);
app.use('/api/customers', requireAuth);
app.use('/api/services', requireAuth);

app.get('/employees.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'employees.html'));
});
app.get('/customers.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customers.html'));
});
app.get('/services.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});
app.get('/user.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Redirect root requests to login if not authenticated
app.get('/', (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.redirect('/login.html');
});

app.use('/api', api);

// Customers routes
api.get('/customers', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
  const all = db.getAllCustomers();
  const total = all.length;
  const total_pages = Math.max(1, Math.ceil(total / per_page));
  const start = (page - 1) * per_page;
  const data = all.slice(start, start + per_page);
  res.json({ data, page, per_page, total, total_pages });
});
api.get('/customers/:id', (req, res) => {
  const rec = db.getCustomer(req.params.id);
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json(rec);
});
api.post('/customers', requireAuth, (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: 'name required' });
  const created = db.createCustomer(body);
  res.status(201).json(created);
});
api.put('/customers/:id', requireAuth, (req, res) => {
  const updated = db.updateCustomer(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});
api.delete('/customers/:id', requireAuth, (req, res) => {
  const ok = db.deleteCustomer(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

// Services routes
api.get('/services', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page) || 10);
  const all = db.getAllServices();
  const total = all.length;
  const total_pages = Math.max(1, Math.ceil(total / per_page));
  const start = (page - 1) * per_page;
  const data = all.slice(start, start + per_page);
  res.json({ data, page, per_page, total, total_pages });
});

api.get('/services/:id', (req, res) => {
  const rec = db.getService(req.params.id);
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json(rec);
});

api.post('/services', requireAuth, (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: 'name required' });
  const created = db.createService(body);
  res.status(201).json(created);
});

api.put('/services/:id', requireAuth, (req, res) => {
  const updated = db.updateService(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

api.delete('/services/:id', requireAuth, (req, res) => {
  const ok = db.deleteService(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

// Dashboard data for authenticated users
api.get('/dashboard', requireAuth, (req, res) => {
  try {
    const empRaw = db.getAllEmployees();
    const custRaw = db.getAllCustomers();
    const svcRaw = db.getAllServices();
    const normalize = (x) => { if (Array.isArray(x)) return x; if (x && x.data) return x.data; return []; };
    const employees = normalize(empRaw);
    const customers = normalize(custRaw);
    const services = normalize(svcRaw);

    const counts = { employees: employees.length, customers: customers.length, services: services.length };
    const recentEmployees = employees.slice(0, 5);
    const recentCustomers = customers.slice(0, 5);
    const recentServices = services.slice(0, 5);

    res.json({ counts, recentEmployees, recentCustomers, recentServices });
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`enterprise-crud running at http://0.0.0.0:${PORT}/`);
});
