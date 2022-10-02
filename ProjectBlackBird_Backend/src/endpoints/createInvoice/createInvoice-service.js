const createInvoiceService = {
  /**
   * Gets all paid to data
   * @param {*} db
   * @returns [{},{}] array of objects. Each object is a 'pay to' record
   */
  getInvoiceNumber(db) {
    return db.select('invoiceNumber').from('invoice').where('invoiceNumber', '>', '');
  },

  /**
   * Gets all companies that have a balance greater than 0
   * @param {*} db
   * @returns  [{},{}] array of objects. Each object is a 'company' record
   */
  getReadyToBill(db) {
    return db
      .select()
      .from('balance')
      .whereNotIn('balance.currentAccountBalance', [0])
      .innerJoin('company', 'balance.company', '=', 'company.oid')
      .whereIn('company.inactive', [false])
      .whereIn('company.notBillable', [false]);
  },

  /**
   * Gets Jobs and transactions for a company between a given date and current
   * @param {*} db
   * @param {*} lastInvoiceDate
   * @param {*} now
   * @param {*} companyId
   * @returns
   */
  getCompanyTransactionsAfterLastInvoice(db, lastInvoiceDataEndDate, companyId) {
    // Joining with job table in order to get job description and default description
    // May need to add a condition for billable true/false/null. Removed condition as it was not inclusive of all intended transactions.
    return db
      .select()
      .from('transaction')
      .innerJoin('job', 'transaction.job', '=', 'job.oid')
      .whereIn('transaction.company', [companyId])
      .where('transaction.transactionDate', '>=', lastInvoiceDataEndDate)
      .where('transaction.transactionType', '!=', 'Payment');
  },
  /**
   *
   * @param {*} db
   * @param {*} invoice
   * @returns
   */
  insertInvoiceDetails(db, invoice) {
    return db.insert(invoice).returning('*').into('invoiceDetail');
  },

  /**
   * Gets max number in invoiceNumber column of invoice
   * @param {*} db
   * @returns
   */
  getLastInvoiceNumberInDB(db) {
    return db.from('invoice').max('invoiceNumber');
  },

  getBillTo(db) {
    return db.select().from('setupdata');
  }
};

module.exports = createInvoiceService;
