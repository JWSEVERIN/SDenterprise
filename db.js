const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const seed = { employees: [], customers: [], services: [], users: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDb();
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch (e) { return { employees: [], customers: [], services: [], users: [] }; }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function nextId(items) {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

// Employees
function getAllEmployees() {
  const db = readDb();
  return (db.employees || []).slice();
}

function getEmployee(id) {
  const db = readDb();
  return (db.employees || []).find(e => e.id == id) || null;
}

function createEmployee(obj) {
  const db = readDb();
  const id = nextId(db.employees);
  const rec = Object.assign({ id }, obj);
  db.employees = db.employees || [];
  db.employees.push(rec);
  writeDb(db);
  return rec;
}

function updateEmployee(id, obj) {
  const db = readDb();
  const i = (db.employees || []).findIndex(e => e.id == id);
  if (i === -1) return null;
  db.employees[i] = Object.assign({}, db.employees[i], obj);
  writeDb(db);
  return db.employees[i];
}

function deleteEmployee(id) {
  const db = readDb();
  const i = (db.employees || []).findIndex(e => e.id == id);
  if (i === -1) return false;
  db.employees.splice(i, 1);
  writeDb(db);
  return true;
}

// Customers
function getAllCustomers() {
  const db = readDb();
  return (db.customers || []).slice();
}

function getCustomer(id) {
  const db = readDb();
  return (db.customers || []).find(c => c.id == id) || null;
}

function createCustomer(obj) {
  const db = readDb();
  const id = nextId(db.customers);
  const rec = Object.assign({ id }, obj);
  db.customers = db.customers || [];
  db.customers.push(rec);
  writeDb(db);
  return rec;
}

function updateCustomer(id, obj) {
  const db = readDb();
  const i = (db.customers || []).findIndex(c => c.id == id);
  if (i === -1) return null;
  db.customers[i] = Object.assign({}, db.customers[i], obj);
  writeDb(db);
  return db.customers[i];
}

function deleteCustomer(id) {
  const db = readDb();
  const i = (db.customers || []).findIndex(c => c.id == id);
  if (i === -1) return false;
  db.customers.splice(i, 1);
  writeDb(db);
  return true;
}

// Services
function getAllServices() {
  const db = readDb();
  return (db.services || []).slice();
}

function getService(id) {
  const db = readDb();
  return (db.services || []).find(s => s.id == id) || null;
}

function createService(obj) {
  const db = readDb();
  const id = nextId(db.services);
  const rec = Object.assign({ id }, obj);
  db.services = db.services || [];
  db.services.push(rec);
  writeDb(db);
  return rec;
}

function updateService(id, obj) {
  const db = readDb();
  const i = (db.services || []).findIndex(s => s.id == id);
  if (i === -1) return null;
  db.services[i] = Object.assign({}, db.services[i], obj);
  writeDb(db);
  return db.services[i];
}

function deleteService(id) {
  const db = readDb();
  const i = (db.services || []).findIndex(s => s.id == id);
  if (i === -1) return false;
  db.services.splice(i, 1);
  writeDb(db);
  return true;
}

// Users
function getUserByUsername(username) {
  const db = readDb();
  return (db.users || []).find(u => u.username === username) || null;
}

function getUserByEmail(email) {
  const db = readDb();
  return (db.users || []).find(u => u.email === email) || null;
}

function createUser({ username, passwordHash, email }) {
  const db = readDb();
  const id = nextId(db.users);
  const rec = { id, username, passwordHash, email, created_at: new Date().toISOString() };
  db.users = db.users || [];
  db.users.push(rec);
  writeDb(db);
  return rec;
}

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
  getUserByUsername,
  getUserByEmail,
  createUser
};
