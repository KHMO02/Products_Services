const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = (async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    return app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
})();

module.exports = {server, app};