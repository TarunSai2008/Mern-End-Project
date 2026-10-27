const app = require('./app');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const seed = require('./utils/seed');
const User = require('./models/User.model');

(async () => {
  const { memory } = await connectDB();
  if ((await User.countDocuments()) === 0) {
    await seed();
    console.log(`Demo data seeded (the ${memory ? 'in-memory' : 'MongoDB'} database was empty).`);
  }
  app.listen(env.PORT, '0.0.0.0', () => console.log(`PantryPal listening on port ${env.PORT}`));
})().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
