module.exports = {
   PORT: process.env.PORT,
   NODE_ENV: process.env.NODE_ENV,
   DATABASE_HOST: process.env.NODE_ENV === 'development' ? process.env.DB_DEV_HOST : process.env.DB_PROD_HOST,
   HOST_IP: process.env.NODE_ENV === 'development' ? process.env.HOST_IP_DEV : process.env.HOST_IP_PROD,
   DATABASE_USER: process.env.DATABASE_USER,
   DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
   DATABASE_URL: process.env.NODE_ENV === 'development' ? process.env.DB_DEV_NAME : process.env.DB_PROD_NAME,
   API_TOKEN: process.env.API_TOKEN,
   ACCESS_TOKEN: process.env.ACCESS_TOKEN,
   JWT_EXPIRATION: process.env.JWT_EXPIRATION,
   defaultDaysInPast: 730,
   // interest Calculation
   defaultInterestRate: 15 / 100,
   defaultInterestMonthsInYear: 12,
   // PDF Creation,
   defaultPdfSaveLocation: `${__dirname}/invoices`
};
