const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const seed = require('../utils/seed');

async function startTest() {
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
  const data = await seed();
  const app = require('../app');
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  return { mem, server, base, data, demoPassword: seed.DEMO_PASSWORD };
}

async function stopTest(ctx) {
  await mongoose.disconnect();
  await ctx.mem.stop();
  ctx.server.close();
}

async function api(ctx, method, path, { token, body } = {}) {
  const res = await fetch(`${ctx.base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, body: json };
}

async function login(ctx, email, password = 'Demo@1234') {
  const r = await api(ctx, 'POST', '/auth/login', { body: { email, password } });
  if (!r.body?.token) throw new Error(`login failed for ${email}: ${JSON.stringify(r.body)}`);
  return r.body;
}

module.exports = { startTest, stopTest, api, login };
