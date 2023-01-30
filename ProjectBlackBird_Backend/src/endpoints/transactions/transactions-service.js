const transactionService = {
  getTransactions(db, currDate, prevDate) {
    return db
      .from('transaction')
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
   * Transactions from a user selected company between today and a time in day a user selects
   * @param {*} db takes in db
   * @param {*} company company oid
   * @param {*} now todays rolling date - end of day
   * @param {*} date Integer, days to go back. example: 6
   * @returns [{},{}]
   */
  getCompanyTransactions(db, company, currDate, prevDate) {
    return db
      .from('transaction')
      .whereIn('transaction.company', [company])
      .whereBetween('transaction.transactionDate', [prevDate, currDate])
      .join('company', 'transaction.company', '=', 'company.oid')
      .join('job', 'transaction.job', '=', 'job.oid')
      .join('employee', 'transaction.employee', '=', 'employee.oid')
      .select(
        'transaction.oid',
        'transaction.company',
        'company.companyName',
        'transaction.job',
        'job.defaultDescription',
        'transaction.employee',
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
    return db
      .from('transaction')
      .whereIn('transaction.company', [companyId])
      .whereIn('transaction.job', [jobId])
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

  getCompanyTransactionTypeAfterGivenDate(db, companyId, dateInPast, type) {
    return db
      .select()
      .from('transaction')
      .whereIn('company', [companyId])
      .whereIn('transactionType', [type])
      .where('transactionDate', '>', dateInPast)
      .where('billable', '=', true);
  },

  insertNewTransaction(db, newTransaction) {
    return db.insert(newTransaction).into('transaction').returning('*');
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
  },

  deleteTransaction(db, transactionID) {
    return db.from('transaction').where('oid', transactionID).del().returning('*');
  }
};

module.exports = transactionService;
