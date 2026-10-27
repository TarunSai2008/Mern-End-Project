const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

async function connectMemoryDB() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create({
    instance: { args: ['--wiredTigerCacheSizeGB', '0.25'] },
  });
  await mongoose.connect(memoryServer.getUri());
  return { memory: true };
}

// Connects to MONGODB_URI, or spins an ephemeral in-memory MongoDB when
// USE_MEMORY_DB=1 (zero-config demo mode with auto-seeded demo data).
async function connectDB() {
  if (env.USE_MEMORY_DB) {
    return connectMemoryDB();
  }
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Configure it in backend/.env or set USE_MEMORY_DB=1 for demo mode.');
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    return { memory: false };
  } catch (error) {
    if (
      env.NODE_ENV !== 'production' ||
      !/bad auth|authentication failed/i.test(error.message)
    ) {
      throw error;
    }

    console.warn(
      'MongoDB authentication failed; using the temporary demo database. ' +
      'Data will reset when this service restarts.',
    );
    await mongoose.disconnect().catch(() => {});
    return connectMemoryDB();
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
