const dayjs = require('dayjs');

// module.exports = {
//   PORT: 8000,
//   NODE_ENV: process.env.NODE_ENV || 'production',
//   DATABASE_HOST: 'db',
//   DATABASE_USER: process.env.DATABASE_USER,
//   DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
//   DATABASE_URL: 'jka_test',
//   TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://@localhost/jka_time_and_billing',
//   defaultDaysInPast: 730,
//   // interest Calculation
//   defaultInterestRate: 15 / 100,
//   defaultInterestMonthsInYear: 12,
//   // PDF Creation
//   defaultPdfSaveLocation: `/Users/jonkimmel/time_and_billing/invoices/${dayjs().format('YYYY-MM-DD')}`,
// };

module.exports = {
  PORT: 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // DATABASE_HOST: 'db',
  DATABASE_HOST: 'localhost',
  // DATABASE_HOST: 'host.docker.internal',
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_URL: 'jka_test',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://@localhost/jka_test',
  API_TOKEN: process.env.API_TOKEN,
  JWT_EXPIRATION: '10h',
  defaultDaysInPast: 730,
  // interest Calculation
  defaultInterestRate: 15 / 100,
  defaultInterestMonthsInYear: 12,
  // PDF Creation,
  defaultPdfSaveLocation: `/Users/jonkimmel/time_and_billing/invoices/${dayjs().format('YYYY-MM-DD')}`
};
