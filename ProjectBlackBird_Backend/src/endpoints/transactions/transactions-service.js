const transactionService = {
  /**
   *  All transactions that are between user selected days and now.
   * @param {*} db takes in db
   * @param {*} date Integer, days to go back. example: 6
   * @param {*} now todays rolling date - end of day
   * @returns [{},{}]
   */
  // getTransactions(db, currDate, prevDate) {
  //   return db
  //     .select()
  //     .from('transaction')
  //     .innerJoin('company', 'transaction.company', '=', 'company.oid')
  //     .innerJoin('job', 'transaction.job', '=', 'job.oid')
  //     .whereBetween('transaction.transactionDate', [prevDate, currDate]);
  // },

  getTransactions(db, currDate, prevDate) {
    return db
      .from('transaction')
      .join('company', 'transaction.company', '=', 'company.oid')
      .join('job', 'transaction.job', '=', 'job.oid')
      .join('employee', 'transaction.employee', '=', 'employee.oid')
      .select(
        'transaction.oid',
        'company.companyName',
        'job.defaultDescription',
        'employee.displayname',
        'transaction.transactionType',
        'transaction.transactionDate',
        'transaction.quantity',
        'transaction.unitOfMeasure',
        'transaction.unitTransaction',
        'transaction.totalTransaction',
        'transaction.invoice',
        'transaction.billable'
      )
      .whereBetween('transaction.transactionDate', [prevDate, currDate]);
  },

  /**
   * Transactions from a user selected company between today and a time in day a user selects
   * @param {*} db takes in db
   * @param {*} company company oid
   * @param {*} now todays rolling date - end of day
   * @param {*} date Integer, days to go back. example: 6
   * @returns [{},{}]
   */
  getCompanyTransactions(db, company, currDate, prevDate) {
    return db
      .select()
      .from('transaction')
      .whereIn('transaction.company', [company])
      .whereBetween('transaction.transactionDate', [prevDate, currDate])
      .innerJoin('company', 'transaction.company', '=', 'company.oid')
      .innerJoin('job', 'transaction.job', '=', 'job.oid');
  },

  // Gets all transactions between two dates.
  getCompanyTransactionsBetweenDates(db, company, currDate, prevDate) {
    return db
      .from('transaction')
      .whereIn('transaction.company', [company])
      .whereBetween('transaction.transactionDate', [prevDate, currDate])
      .join('company', 'transaction.company', '=', 'company.oid')
      .join('job', 'transaction.job', '=', 'job.oid')
      .join('employee', 'transaction.employee', '=', 'employee.oid')
      .select(
        'transaction.oid',
        'company.companyName',
        'job.defaultDescription',
        'employee.displayname',
        'transaction.transactionType',
        'transaction.transactionDate',
        'transaction.quantity',
        'transaction.unitOfMeasure',
        'transaction.unitTransaction',
        'transaction.totalTransaction',
        'transaction.invoice',
        'transaction.billable'
      );
  },

  /**
   * Get transactions for a given job
   * @param {*} db
   * @param {*} jobId
   */
  getJobTransactions(db, companyId, jobId) {
    return db.select().from('transaction').whereIn('company', [companyId]).whereIn('job', [jobId]);
  },

  /**
   * inserts new transaction for a company
   * @param {*} db
   * @param {*} newTransaction {}
   * @returns [{},{}]
   */
  insertNewTransaction(db, newTransaction) {
    return db.insert(newTransaction).into('transaction').returning('*');
  },

  getCompanyTransactionTypeAfterGivenDate(db, companyId, dateInPast, type) {
    return db
      .select()
      .from('transaction')
      .whereIn('company', [companyId])
      .whereIn('transactionType', [type])
      .where('transactionDate', '>', dateInPast)
      .where('billable', '=', true);
  },

  getTransactionTypeToday(db, type, oid) {
    return db.select().from('transaction').where('company', oid).where('transactionType', type);
  },

  getFirstTransaction(db, oid) {
    return db.select().from('transaction').where('company', oid);
  },

  getInvoiceTransactions(db, invoiceLineOid) {
    return db.select().from('transaction').where('invoice', invoiceLineOid).innerJoin('job', 'transaction.job', '=', 'job.oid');
  },

  updateTransactionWithInvoice(db, transaction, invoiceNumber) {
    const { company, employee, transactionType, transactionDate, totalTransaction, invoice } = transaction;
    return db
      .update('invoice', invoiceNumber)
      .from('transaction')
      .where('company', company)
      .where('employee', employee)
      .where('transactionType', transactionType)
      .where('transactionDate', transactionDate)
      .where('totalTransaction', totalTransaction)
      .where('invoice', invoice);
  }
};

module.exports = transactionService;
