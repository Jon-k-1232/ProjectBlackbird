require('dotenv').config();
const { DATABASE_URL } = require('./config');

module.exports = {
   migrationDirectory: 'migrations',
   driver: 'pg',
   connectionString: DATABASE_URL
};
