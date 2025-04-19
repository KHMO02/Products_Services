const app = require('./app');
const { sequelize } = require('./models');

const PORT = 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();